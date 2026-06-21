import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Setup Supabase Admin Client (validate envs)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // 3. Get Authorizaton Token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }
    const token = authHeader.replace('Bearer ', '')

    // 4. Verify Caller
    const { data: { user: caller }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !caller) {
      throw new Error('Invalid token or user not found')
    }

    // 5. Parse body and determine action (allow admin to delete by id, email, or all users)
    let body: any = {}
    try {
      body = await req.json()
    } catch (e) {
      // empty body is allowed (interpreted as self-delete)
      body = {}
    }

    const targetUserIdFromBody = body.targetUserId
    const targetEmail = body.targetEmail
    const deleteAll = body.deleteAll === true

    // helper: fetch caller profile to check role when needed
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    const callerRole = callerProfile?.role || 'user'

    // define helper for deleting one user and its resources
    async function deleteUserAndData(supabaseClient: any, targetId: string) {
      // 7. Delete Data Related to Target User
      const dataDeletionTasks = [
        supabaseClient.from('food_menus').delete().eq('submitted_by', targetId),
        supabaseClient.from('feed_videos').delete().eq('uploader_id', targetId),
        supabaseClient.from('feed_likes').delete().eq('user_id', targetId),
        supabaseClient.from('feed_comments').delete().eq('user_id', targetId),
        supabaseClient.from('user_notifications').delete().eq('user_id', targetId),
        supabaseClient.from('reports').delete().eq('reporter_id', targetId),
        supabaseClient.from('support_sessions').delete().eq('user_id', targetId),
        supabaseClient.from('support_messages').delete().eq('sender_id', targetId),
        // Finally delete the profile
        supabaseClient.from('profiles').delete().eq('id', targetId),
      ]

      await Promise.all(dataDeletionTasks)

      // 8. Cleanup Storage
      const storageBuckets = ['avatars', 'food-image', 'feed-videos', 'feed-thumbnails', 'culinary-bucket', 'FeedTiktok']
      for (const bucket of storageBuckets) {
        try {
          const { data: files, error: listError } = await supabaseClient.storage.from(bucket).list(targetId)
          if (listError && listError.message !== 'Not found') {
            console.warn(`Storage list error for bucket ${bucket}:`, listError)
          }
          if (files && files.length > 0) {
            const paths = files.map((f: any) => `${targetId}/${f.name}`)
            const { error: removeError } = await supabaseClient.storage.from(bucket).remove(paths)
            if (removeError) console.warn(`Storage remove error for bucket ${bucket}:`, removeError)
          }
        } catch (storageErr) {
          console.warn(`Storage cleanup warn for bucket ${bucket}:`, storageErr)
        }
      }

      // 9. Delete User from Auth
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(targetId)
      if (deleteError) throw deleteError
    }

    // admin-only: deleteAll
    if (deleteAll) {
      if (callerRole !== 'admin') {
        return new Response(JSON.stringify({ error: 'Forbidden: only admins can delete all users' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      console.log(`[DELETE-ACCOUNT] Admin requested deleteAll. Enumerating non-admin users...`)
      const { data: usersToDelete, error: listErr } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .neq('role', 'admin')

      if (listErr) throw listErr

      const ids: string[] = Array.isArray(usersToDelete) ? usersToDelete.map((u: any) => u.id) : []

      const deletionResults: Array<{ id: string; error?: any }> = []
      for (const id of ids) {
        try {
          await deleteUserAndData(supabaseAdmin, id)
          deletionResults.push({ id })
        } catch (err) {
          deletionResults.push({ id, error: err?.message || err })
        }
      }

      return new Response(JSON.stringify({ message: 'Batch deletion finished', results: deletionResults }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // resolve single target: prefer explicit id, then email, otherwise self
    let targetUserId = targetUserIdFromBody || caller.id
    if (targetEmail && !targetUserIdFromBody) {
      const { data: profileByEmail, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('id,email')
        .eq('email', targetEmail)
        .single()

      if (profileErr || !profileByEmail) {
        return new Response(JSON.stringify({ error: 'Target user not found for provided email' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      targetUserId = profileByEmail.id
    }

    // Access Control: If target != caller, must be admin
    if (targetUserId !== caller.id && callerRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Only admins can delete other users' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log(`[DELETE-ACCOUNT] Deleting user data for: ${targetUserId} (requestedBy=${caller.id})`)

    // Perform deletion for single user
    await deleteUserAndData(supabaseAdmin, targetUserId)

    return new Response(
      JSON.stringify({ message: 'User and associated data deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Delete Function Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
