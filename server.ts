import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Gemini AI Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Supabase Admin Client
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let supabaseAdmin: any = null;

  if (supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log("Supabase Admin Client initialized.");
  } else {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not found. Direct Supabase Auth deletion will be unavailable.");
  }

  // Initialize SQLite Database inside start to prevent top-level issues
  const db = new Database("culinary.db");

  // Data structure:
  // users table: email (PK), userName (Unique), avatarUrl, createdAt
  // comments table: id, videoId, userEmail, userName, text, createdAt
  // follows table: followerEmail, followingName, createdAt
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      userName TEXT UNIQUE,
      avatarUrl TEXT,
      supabaseUid TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      videoId TEXT,
      userEmail TEXT,
      userName TEXT,
      text TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS follows (
      followerEmail TEXT,
      followingEmail TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (followerEmail, followingEmail)
    );

    CREATE TABLE IF NOT EXISTS likes (
      videoId TEXT,
      userEmail TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (videoId, userEmail)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      reporterName TEXT,
      reporterEmail TEXT,
      explanation TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: Check if follows table has the old column name and rename it if needed
  try {
    const columnsUsers = db.prepare("PRAGMA table_info(users)").all() as any[];
    const hasUidColumn = columnsUsers.some(c => c.name === "supabaseUid");
    if (!hasUidColumn) {
      console.log("Adding supabaseUid column to users table...");
      db.exec("ALTER TABLE users ADD COLUMN supabaseUid TEXT");
    }

    const columnsFollows = db.prepare("PRAGMA table_info(follows)").all() as any[];
    const hasOldColumn = columnsFollows.some(c => c.name === "followingName");
    if (hasOldColumn) {
      console.log("Migrating follows table: followingName -> followingEmail");
      // Note: SQLite rename column often requires a bit of care with constraints, 
      // but simple RENAME COLUMN works on newer SQLite versions and handles the PK if we're careful.
      db.exec("ALTER TABLE follows RENAME COLUMN followingName TO followingEmail");
    }
  } catch (err) {
    console.error("Migration error:", err);
  }

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // --- API ROUTES ---

  // Get all likes for a user
  app.get("/api/likes/:email", (req, res) => {
    const { email } = req.params;
    try {
      const stmt = db.prepare("SELECT videoId FROM likes WHERE userEmail = ?");
      const likes = stmt.all(email);
      res.json(likes.map((l: any) => l.videoId));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Toggle like
  app.post("/api/likes/toggle", (req, res) => {
    const { videoId, userEmail } = req.body;
    if (!videoId || !userEmail) return res.status(400).json({ error: "Missing fields" });
    const normalizedEmail = userEmail.toLowerCase();

    try {
      const checkStmt = db.prepare("SELECT * FROM likes WHERE videoId = ? AND userEmail = ?");
      const existing = checkStmt.get(videoId, normalizedEmail);

      if (existing) {
        const deleteStmt = db.prepare("DELETE FROM likes WHERE videoId = ? AND userEmail = ?");
        deleteStmt.run(videoId, normalizedEmail);
        res.json({ liked: false });
      } else {
        const insertStmt = db.prepare("INSERT INTO likes (videoId, userEmail) VALUES (?, ?)");
        insertStmt.run(videoId, normalizedEmail);
        res.json({ liked: true });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get user profile
  app.get("/api/user/profile/:email", (req, res) => {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase();
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const user = stmt.get(normalizedEmail);
    res.json(user || null);
  });

  // Get all users (to sync names globally)
  app.get("/api/users/all", (req, res) => {
    try {
      const stmt = db.prepare("SELECT email, userName, avatarUrl, supabaseUid FROM users");
      const users = stmt.all();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update/Create user profile with unique name check
  app.post("/api/user/profile", (req, res) => {
    const { email, userName, avatarUrl, supabaseUid } = req.body;
    if (!email || !userName) return res.status(400).json({ error: "Email dan Nama wajib diisi" });
    const normalizedEmail = email.toLowerCase();

    try {
      // Check if username is already taken by ANOTHER email
      const checkStmt = db.prepare("SELECT email FROM users WHERE userName = ? AND email != ?");
      const existing = checkStmt.get(userName, normalizedEmail);
      
      if (existing) {
        return res.status(409).json({ error: "Nama telah terpakai, gunakan nama lain" });
      }

      // Upsert user profile
      const stmt = db.prepare(`
        INSERT INTO users (email, userName, avatarUrl, supabaseUid) 
        VALUES (?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET 
          userName = excluded.userName,
          avatarUrl = excluded.avatarUrl,
          supabaseUid = COALESCE(excluded.supabaseUid, users.supabaseUid)
      `);
      stmt.run(normalizedEmail, userName, avatarUrl, supabaseUid || null);

      // Update all user's historical comments with the new name
      const updateComments = db.prepare("UPDATE comments SET userName = ? WHERE userEmail = ?");
      updateComments.run(userName, normalizedEmail);
      
      res.json({ success: true, userName, avatarUrl });
    } catch (err: any) {
      console.error("Profile update error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get user by name (to get their followers/following counts)
  app.get("/api/user/by-name/:userName", (req, res) => {
    const { userName } = req.params;
    const stmt = db.prepare("SELECT * FROM users WHERE userName = ?");
    const user = stmt.get(userName);
    res.json(user || null);
  });

  // Get comments for a video
  app.get("/api/comments/:videoId", (req, res) => {
    const { videoId } = req.params;
    const stmt = db.prepare("SELECT * FROM comments WHERE videoId = ? ORDER BY createdAt DESC");
    const comments = stmt.all(videoId);
    res.json(comments);
  });

  // Post a comment
  app.post("/api/comments", (req, res) => {
    const { videoId, userEmail, userName, text } = req.body;
    if (!videoId || !text || !userName) return res.status(400).json({ error: "Missing fields" });
    const normalizedEmail = userEmail?.toLowerCase();
    
    const stmt = db.prepare("INSERT INTO comments (videoId, userEmail, userName, text) VALUES (?, ?, ?, ?)");
    stmt.run(videoId, normalizedEmail || null, userName, text);
    res.json({ success: true });
  });

  // Get follow status & counts
  app.get("/api/follows/:userName", (req, res) => {
    const { userName } = req.params;
    const { currentUserEmail } = req.query;

    const userStmt = db.prepare("SELECT email FROM users WHERE userName = ?");
    const targetUser = userStmt.get(userName) as { email: string };
    if (!targetUser) return res.json({ followers: 0, isFollowing: false });

    const followerCountStmt = db.prepare("SELECT COUNT(*) as count FROM follows WHERE followingEmail = ?");
    const followerCount = followerCountStmt.get(targetUser.email) as { count: number };

    let isFollowing = false;
    if (currentUserEmail) {
      const isFollowingStmt = db.prepare("SELECT * FROM follows WHERE followerEmail = ? AND followingEmail = ?");
      isFollowing = !!isFollowingStmt.get(currentUserEmail, targetUser.email);
    }

    res.json({ followers: followerCount.count, isFollowing });
  });

  // Get Following count for self
  app.get("/api/following/count/:email", (req, res) => {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase();
    const stmt = db.prepare("SELECT COUNT(*) as count FROM follows WHERE followerEmail = ?");
    const result = stmt.get(normalizedEmail) as { count: number };
    res.json({ count: result.count });
  });

  app.get("/api/following/count-by-name/:userName", (req, res) => {
    const { userName } = req.params;
    const userStmt = db.prepare("SELECT email FROM users WHERE userName = ?");
    const userProfile = userStmt.get(userName) as { email: string };
    if (!userProfile) return res.json({ count: 0 });

    const stmt = db.prepare("SELECT COUNT(*) as count FROM follows WHERE followerEmail = ?");
    const result = stmt.get(userProfile.email) as { count: number };
    res.json({ count: result.count });
  });

  // Get full lists (followers/following)
  app.get("/api/follows/list/:userName", (req, res) => {
    const { userName } = req.params;
    const userStmt = db.prepare("SELECT email FROM users WHERE userName = ?");
    const targetUser = userStmt.get(userName) as { email: string };
    if (!targetUser) return res.json([]);

    // Join with users table to get the names of the followers
    const stmt = db.prepare(`
      SELECT COALESCE(users.userName, follows.followerEmail) as name 
      FROM follows 
      LEFT JOIN users ON users.email = follows.followerEmail
      WHERE followingEmail = ?
    `);
    const list = stmt.all(targetUser.email);
    res.json(list.map((u: any) => u.name));
  });

  app.get("/api/following/list/:email", (req, res) => {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase();
    const stmt = db.prepare(`
        SELECT COALESCE(users.userName, follows.followingEmail) as name 
        FROM follows 
        LEFT JOIN users ON users.email = follows.followingEmail
        WHERE followerEmail = ?
    `);
    const list = stmt.all(normalizedEmail);
    res.json(list.map((u: any) => u.name));
  });

  app.get("/api/following/list-by-name/:userName", (req, res) => {
    const { userName } = req.params;
    // We need to find the email first
    const userStmt = db.prepare("SELECT email FROM users WHERE userName = ?");
    const userProfile = userStmt.get(userName) as { email: string };
    if (!userProfile) return res.json([]);
    
    const stmt = db.prepare(`
        SELECT COALESCE(users.userName, follows.followingEmail) as name 
        FROM follows 
        LEFT JOIN users ON users.email = follows.followingEmail
        WHERE followerEmail = ?
    `);
    const list = stmt.all(userProfile.email);
    res.json(list.map((u: any) => u.name));
  });

  // Toggle follow
  app.post("/api/follows/toggle", (req, res) => {
    const { followerEmail, followingName } = req.body;
    if (!followerEmail || !followingName) return res.status(400).json({ error: "Missing fields" });
    const normalizedFollower = followerEmail.toLowerCase();

    const userStmt = db.prepare("SELECT email FROM users WHERE userName = ?");
    const targetUser = userStmt.get(followingName) as { email: string };
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    const checkStmt = db.prepare("SELECT * FROM follows WHERE followerEmail = ? AND followingEmail = ?");
    const existing = checkStmt.get(normalizedFollower, targetUser.email);

    if (existing) {
      const deleteStmt = db.prepare("DELETE FROM follows WHERE followerEmail = ? AND followingEmail = ?");
      deleteStmt.run(normalizedFollower, targetUser.email);
      res.json({ following: false });
    } else {
      const insertStmt = db.prepare("INSERT INTO follows (followerEmail, followingEmail) VALUES (?, ?)");
      insertStmt.run(normalizedFollower, targetUser.email);
      res.json({ following: true });
    }
  });

  // Handle Bug Reports
  app.post("/api/reports", (req, res) => {
    const { category, reporterName, reporterEmail, explanation } = req.body;
    if (!category || !reporterName || !reporterEmail || !explanation) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO reports (category, reporterName, reporterEmail, explanation)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(category, reporterName, reporterEmail, explanation);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Report submission error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Delete User Account and all related data (Supabase + Local)
  // Securely verifies caller token before deletion
  app.post("/api/user/delete", async (req, res) => {
    const { email, targetUserId } = req.body;
    const authHeader = req.headers.authorization;

    console.log('/api/user/delete called with body:', req.body);
    
    if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });
    const token = authHeader.replace("Bearer ", "");

    try {
      if (!supabaseAdmin) {
        console.warn('Supabase Admin Client not initialized on server; aborting auth deletion but will attempt local cleanup by supabase uid');
        return res.status(500).json({ error: "Supabase Admin Client not initialized on server" });
      }

      // 1. Verify Caller via Supabase Auth
      const { data: { user: caller }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !caller) throw new Error("Invalid token or user not found");

      let finalTargetId = targetUserId || caller.id;

      // 2. Access Control: If target != caller, must be admin
      if (finalTargetId !== caller.id) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', caller.id)
          .single();

        if (profile?.role !== 'admin') {
          return res.status(403).json({ error: "Forbidden: Only admins can delete other users" });
        }
      }

      console.log(`Menghapus user ${finalTargetId}...`);

      // 3. Resolve Email if only ID provided (for local DB cleanup). If not found, proceed without it.
      let targetEmail: string | undefined = undefined;
      if (email) targetEmail = String(email).toLowerCase();
      else {
        try {
          const { data: authUser, error: getErr } = await supabaseAdmin.auth.admin.getUserById(finalTargetId as string);
          if (!getErr && authUser && (authUser as any).user) {
            targetEmail = (authUser as any).user.email?.toLowerCase();
          } else if (getErr) {
            console.warn('Could not resolve email from auth.getUserById:', getErr);
          }
        } catch (ge) {
          console.warn('Error while resolving email for target:', ge);
        }
      }

      // 4. Delete DB Data in Supabase
      await Promise.all([
        supabaseAdmin.from('food_menus').delete().eq('submitted_by', finalTargetId),
        supabaseAdmin.from('feed_videos').delete().eq('uploader_id', finalTargetId),
        supabaseAdmin.from('likes').delete().eq('user_id', finalTargetId),
        supabaseAdmin.from('comments').delete().eq('user_id', finalTargetId),
        supabaseAdmin.from('user_notifications').delete().eq('user_id', finalTargetId),
        supabaseAdmin.from('reports').delete().eq('reporter_id', finalTargetId),
        supabaseAdmin.from('support_sessions').delete().eq('user_id', finalTargetId),
        supabaseAdmin.from('support_messages').delete().eq('sender_id', finalTargetId),
        supabaseAdmin.from('profiles').delete().eq('id', finalTargetId),
      ]);

      // 5. Cleanup Storage in Supabase
      const buckets = ['avatars', 'food-images', 'feed-videos', 'feed-thumbnails', 'culinary-bucket', 'FeedTiktok'];
      for (const b of buckets) {
        try {
          const { data: files } = await supabaseAdmin.storage.from(b).list(finalTargetId);
          if (files && files.length > 0) {
            const paths = files.map((f: any) => `${finalTargetId}/${f.name}`);
            await supabaseAdmin.storage.from(b).remove(paths);
          }
        } catch (se) {
          console.warn(`Storage cleanup warn [${b}]:`, se);
        }
      }

      // 6. Delete Auth User (best effort)
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(finalTargetId);
        if (deleteError) console.error("Auth deletion error:", deleteError);
      } catch (de) {
        console.warn('Auth admin.deleteUser threw:', de);
      }

      // 7. Local SQLite Cleanup (Legacy/Double security)
      if (targetEmail) {
        db.prepare("DELETE FROM users WHERE email = ?").run(targetEmail);
        db.prepare("DELETE FROM follows WHERE followerEmail = ?").run(targetEmail);
        db.prepare("DELETE FROM follows WHERE followingEmail = ?").run(targetEmail);
        db.prepare("DELETE FROM comments WHERE userEmail = ?").run(targetEmail);
        db.prepare("DELETE FROM likes WHERE userEmail = ?").run(targetEmail);
      } else {
        console.log('No email available; skipping email-based local cleanup');
      }
      
      db.prepare("DELETE FROM users WHERE supabaseUid = ?").run(finalTargetId);

      res.json({ success: true, message: "Akun dan data berhasil dihapus sepenuhnya." });
    } catch (err: any) {
      console.error("Account full deletion error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Secure menu deletion endpoint to bypass missing RLS delete policies
  app.post("/api/menu/delete", async (req, res) => {
    const { menuId } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }
    const token = authHeader.replace("Bearer ", "");

    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: "Supabase Admin Client not initialized on server" });
      }

      // 1. Verify Caller via Supabase Auth
      const { data: { user: caller }, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !caller) {
        return res.status(401).json({ error: "Invalid token or user not found" });
      }

      // 2. Fetch the target menu to verify ownership or admin status
      const { data: menu, error: fetchError } = await supabaseAdmin
        .from('food_menus')
        .select('*')
        .eq('id', menuId)
        .single();

      if (fetchError || !menu) {
        return res.status(404).json({ error: "Menu tidak ditemukan" });
      }

      // Check access: caller must be submitted_by, seller_id, or an admin
      let hasAccess = menu.submitted_by === caller.id || menu.seller_id === caller.id;

      if (!hasAccess) {
        // Query profile to check if user serves as an admin
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', caller.id)
          .single();

        if (profile?.role === 'admin') {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ error: "Forbidden: Kamu tidak memiliki izin untuk menghapus menu ini." });
      }

      // 3. Clear related rows first using Admin Client
      try {
        await supabaseAdmin.from('user_notifications').delete().eq('menu_id', menu.id);
      } catch (e) {
        console.warn('Gagal hapus user_notifications di server:', e);
      }

      try {
        await supabaseAdmin.from('reports').delete().eq('target_id', menu.id);
      } catch (e) {
        console.warn('Gagal hapus reports di server:', e);
      }

      // 4. Delete from food_menus using Admin Client
      const { data: deletedRows, error: deleteError } = await supabaseAdmin
        .from('food_menus')
        .delete()
        .eq('id', menu.id)
        .select('id');

      if (deleteError) {
        throw new Error(`Gagal menghapus data menu dari database: ${deleteError.message}`);
      }

      console.log(`Successfully deleted menu ID ${menu.id} through server API.`);
      return res.json({ success: true, deleted: deletedRows });
    } catch (err: any) {
      console.error("Error at /api/menu/delete:", err);
      return res.status(500).json({ error: err.message || "Gagal menghapus menu" });
    }
  });

  // --- AI Caption Generation with Key Rotation ---
  app.post("/api/generate-caption", async (req, res) => {
    try {
      const { image, name, category, price, notes } = req.body;

      if (!image) {
        return res.status(400).json({ error: "Foto makanan wajib ada untuk generate caption." });
      }

      // Ambil API keys dari array (user manual edit was here)
      const apiKeys = [
        "AIzaSyBdXOTd9jS6N3wYAELp4JvhobscIgbgaog",
        "AIzaSyCzQGzuVqhzDGIwqroyYn75HDoz_Yeit5o",
        "AIzaSyDufEM6w39HCPC3X-rEMWoMhbyBjsN3c14",
      ].filter(key => !!key);

      if (apiKeys.length === 0) {
        return res.status(500).json({ error: "API Key tidak dikonfigurasi di server." });
      }

      let lastError = null;

      for (const key of apiKeys) {
        try {
          const rotationAi = new GoogleGenAI({
            apiKey: key,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
          });

          // Check if data URL
          const matches = image.match(/^data:([^;]+);base64,(.+)$/);
          if (!matches) throw new Error("Format gambar tidak valid. Harus data URL base64.");
          
          const mimeType = matches[1];
          const base64Data = matches[2];

          const prompt = `
            Tugas: Analisis gambar makanan ini dan buatlah caption/deskripsi yang sangat singkat, padat, dan gaul untuk Gen Z (maksimal 1-2 kalimat pendek). Ini sangat penting agar respon AI sangat cepat.
            
            Informasi:
            - Nama: ${name || 'Tidak diketahui'}
            - Kategori: ${category || 'makanan'}
            - Harga: ${price ? `Rp ${price}` : '-'}
            - Catatan: ${notes || '-'}

            Output JSON sesuai skema:
            {
              "detectedFood": "string",
              "confidence": number,
              "caption": "string",
              "tags": ["string"]
            }
          `;

          const result = await rotationAi.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
              { inlineData: { mimeType, data: base64Data } },
              prompt
            ],
            config: {
              responseMimeType: "application/json"
            }
          });

          const text = result.text;
          if (!text) {
            throw new Error("AI returned empty response");
          }

          const parsedResult = JSON.parse(text.trim());
          return res.json(parsedResult); 

        } catch (err: any) {
          lastError = err;
          console.warn(`Key Rotation Attempt Failed: ${err.message}`);
        }
      }

      throw new Error(lastError?.message || "Semua API Key gagal memproses permintaan.");

    } catch (globalErr: any) {
      console.error("Route Error:", globalErr);
      res.status(500).json({ error: globalErr.message || "Internal server error" });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    // Dynamically import Vite only in development to prevent production crashes
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
