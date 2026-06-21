import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Send, 
  MessageCircle, 
  Loader2, 
  X,
  User,
  Headphones,
  CheckCheck,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { translations, Language } from '../translations';

interface SupportChatProps {
  onBack: () => void;
  darkMode: boolean;
  language: Language;
}

interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface Session {
  id: string;
  user_id: string;
  admin_id: string | null;
  status: 'waiting' | 'active' | 'closed' | 'declined';
  created_at: string;
}

export const SupportChat: React.FC<SupportChatProps> = ({ onBack, darkMode, language }) => {
  const t = translations[language];
  const { authUser, profile } = useAuth();
  const sb = supabase!;
  
  const [session, setSession] = useState<Session | null>(null);
  const [showSessionEndModal, setShowSessionEndModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showUnavailablePopup, setShowUnavailablePopup] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherTyping]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Broadcasting my typing status
  const handleTyping = () => {
    if (!session || !sb || !authUser) return;
    
    sb.channel(`typing_${session.id}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: authUser.id, is_typing: true }
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sb.channel(`typing_${session.id}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: authUser.id, is_typing: false }
      });
    }, 2000);
  };

  // Listening for other party's typing status
  useEffect(() => {
    if (!session || !sb || !authUser) return;

    const typingChannel = sb.channel(`typing_${session.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== authUser.id) {
          setIsOtherTyping(payload.payload.is_typing);
        }
      })
      .subscribe();

    return () => {
      sb.removeChannel(typingChannel);
    };
  }, [session?.id]);

  // Fetch active session
  useEffect(() => {
    if (!authUser || !sb) return;

    const fetchSession = async () => {
      const { data, error } = await sb
        .from('support_sessions')
        .select('*')
        .eq('user_id', authUser.id)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error) {
        if (data) {
          setSession(data);
          fetchMessages(data.id);
        } else {
          setSession(null);
          setMessages([]);
          setShowUnavailablePopup(false);
        }
      } else {
        setSession(null);
        setMessages([]);
        setShowUnavailablePopup(false);
      }
      setIsLoading(false);
    };

    fetchSession();

    // Subscribe to session changes
    const sessionSubscription = sb
      .channel('session_changes')
      .on('postgres_changes' as any, { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_sessions',
        filter: `user_id=eq.${authUser.id}`
      }, async (payload: any) => {
        const newSession = payload.new as Session;
        if (newSession) {
          setShowUnavailablePopup(false);
          setSession(newSession);
          if (newSession.status === 'active') {
            fetchMessages(newSession.id);
          }
        }
      })
      .on('postgres_changes' as any, { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'support_sessions',
        filter: `user_id=eq.${authUser.id}`
      }, async (payload: any) => {
        const newSession = payload.new as Session;
        if (!newSession) return;

        if (newSession.status === 'declined') {
          setShowUnavailablePopup(true);
          setSession(null);
          setMessages([]);
          return;
        }

        if (newSession.status === 'active') {
          setShowUnavailablePopup(false);
          setSession(newSession);
          fetchMessages(newSession.id);
          return;
        }

        if (newSession.status === 'waiting') {
          setShowUnavailablePopup(false);
          setSession(newSession);
          return;
        }

        if (newSession.status === 'closed' && session?.status !== 'closed') {
          setShowSessionEndModal(true);
        }
        if (newSession.status === 'closed') {
          setShowUnavailablePopup(false);
          setSession(null);
          setMessages([]);
        }
      })
      .subscribe();

    return () => {
      sb.removeChannel(sessionSubscription);
    };
  }, [authUser]);

  const fetchMessages = async (sessionId: string) => {
    if (!sb) return;
    const { data, error } = await sb
      .from('support_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  // Subscribe to messages
  useEffect(() => {
    if (!session || session.status !== 'active' || !sb) return;

    const messageSubscription = sb
      .channel(`session_${session.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages',
        filter: `session_id=eq.${session.id}`
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      })
      .subscribe();

    return () => {
      sb.removeChannel(messageSubscription);
    };
  }, [session?.id, session?.status]);

  const handleStartChat = async () => {
    if (!authUser || !sb) return;
    setIsSending(true);
    try {
      if (session && session.status === 'waiting') {
        await sb.from('support_sessions').update({ status: 'closed' }).eq('id', session.id);
      }
      const { data, error } = await sb
        .from('support_sessions')
        .insert({
          user_id: authUser.id,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;
      setSession(data);
      setIsConfirming(false);
      setShowUnavailablePopup(false);
    } catch (err: any) {
      alert("Gagal menghubungi agent: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !session || !authUser || isSending || !sb) return;

    setIsSending(true);
    const text = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await sb
        .from('support_messages')
        .insert({
          session_id: session.id,
          sender_id: authUser.id,
          message: text
        });

      if (error) throw error;
    } catch (err: any) {
      alert("Gagal mengirim pesan");
      setNewMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleEndChat = async () => {
    if (!session || !sb) return;
    if (!confirm(t.supportConfirmEnd || "Akhiri chat?")) return;

    try {
      await sb
        .from('support_sessions')
        .update({ status: 'closed' })
        .eq('id', session.id);
      
      setSession(null);
      setMessages([]);
    } catch (err) {
      alert("Gagal mengakhiri chat");
    }
  };

  const handleCancelRequest = async () => {
    if (!session || !sb) return;
    try {
      await sb
        .from('support_sessions')
        .update({ status: 'closed' })
        .eq('id', session.id);
      setSession(null);
      setShowUnavailablePopup(false);
    } catch (err) {
      alert("Gagal membatalkan permintaan");
    }
  };

  const handleRetryRequest = async () => {
    setShowUnavailablePopup(false);
    await handleStartChat();
  };

  const getWaitingCountdown = () => {
    if (!session?.created_at) return '05:00';
    const waited = now - new Date(session.created_at).getTime();
    const remaining = Math.max(0, 5 * 60 * 1000 - waited);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!session || session.status !== 'waiting' || !sb) return;
    const waited = now - new Date(session.created_at).getTime();
    if (waited >= 5 * 60 * 1000) {
      (async () => {
        await sb.from('support_sessions').update({ status: 'declined' }).eq('id', session.id);
        setSession(null);
        setShowUnavailablePopup(true);
      })();
    }
  }, [now, session]);

  return (
    <div className={`fixed inset-0 z-[300] flex flex-col transition-colors duration-300 ${darkMode ? 'bg-black text-white' : 'bg-[#f0f2f5]'}`}>
      {/* Header */}
      <div className={`px-6 pt-12 pb-6 border-b flex items-center justify-between sticky top-0 z-50 ${darkMode ? 'bg-black/80 backdrop-blur-xl border-white/5' : 'bg-white/80 backdrop-blur-xl border-black/5'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`p-2.5 rounded-2xl transition-colors active:scale-95 ${darkMode ? 'bg-white/5 text-white' : 'bg-gray-100 text-[#1A1A2E]'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-[#1A9E5C]/10 text-[#1A9E5C]' : 'bg-[#1A9E5C]/5 text-[#1A9E5C]'}`}>
              <Headphones size={20} />
            </div>
            <div>
              <h1 className={`text-sm font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.supportTitle || "Live Agent"}</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${session?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {session?.status === 'active' ? "Connected" : "Customer Support"}
                </p>
              </div>
            </div>
          </div>
        </div>
        {session?.status === 'active' && (
          <button 
            onClick={handleEndChat}
            className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!session ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-4">
            <div className={`w-24 h-24 rounded-[40px] flex items-center justify-center shadow-2xl ${darkMode ? 'bg-white/5 text-white' : 'bg-white text-[#1A1A2E]'}`}>
              <MessageCircle size={48} className="text-[#1A9E5C]" />
            </div>
            <div className="space-y-3">
              <h2 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                {t.supportUserTitle || "Butuh Bantuan?"}
              </h2>
              <p className="text-sm text-gray-500 font-medium max-w-[280px]">
                {t.contactAgentSub || "Chat langsung dengan tim kami untuk bantuan instan seputar aplikasi Terserah."}
              </p>
            </div>
            <button 
              onClick={() => setIsConfirming(true)}
              className="w-full max-w-[280px] h-16 bg-[#1A9E5C] text-white rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-[#1A9E5C]/20 active:scale-95 transition-all"
            >
              {t.contactAgentButton || "HUBUNGI AGENT SEKARANG"}
            </button>
          </div>
        ) : session.status === 'waiting' ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-[40px] bg-[#1A9E5C]/10 flex items-center justify-center animate-pulse">
                <Clock size={48} className="text-[#1A9E5C]" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#1A9E5C] rounded-2xl flex items-center justify-center text-white border-4 border-black">
                <Loader2 size={20} className="animate-spin" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className={`text-xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                {t.supportWaiting || "Mencari Agent..."}
              </h2>
              <p className="text-sm text-gray-500 font-medium max-w-[280px]">
                {t.supportWaitingDesc || "Harap tunggu sebentar, tim kami akan segera melayani Kakak."}
              </p>
              <p className="text-sm font-black uppercase tracking-widest text-[#1A9E5C]">
                Sisa waktu: {getWaitingCountdown()}
              </p>
            </div>
            <button 
              onClick={handleCancelRequest}
              className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-colors ${darkMode ? 'border-white/10 text-white/40 hover:text-white' : 'border-black/5 text-gray-400 hover:text-black'}`}
            >
              {t.supportCancel || "Batalkan Permintaan"}
            </button>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            <div className="flex justify-center">
              <div className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'bg-white/5 border-white/5 text-gray-500' : 'bg-gray-100 border-black/5 text-gray-400'}`}>
                Sesi Chat Dimulai - {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {messages.map((msg, idx) => {
              const isMe = msg.sender_id === authUser?.id;
              return (
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3.5 rounded-[24px] text-sm font-medium shadow-sm transition-all hover:scale-[1.02] break-words whitespace-pre-wrap overflow-hidden ${
                      isMe 
                        ? 'bg-[#1A9E5C] text-white rounded-tr-none shadow-lg shadow-[#1A9E5C]/20' 
                        : (darkMode ? 'bg-white/10 text-white rounded-tl-none border border-white/5' : 'bg-white text-[#1A1A2E] border border-black/5 rounded-tl-none')
                    }`}>
                      {msg.message}
                    </div>
                    <div className={`flex items-center gap-1.5 px-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {isMe && <CheckCheck size={10} className="text-[#1A9E5C]" />}
                    </div>
                  </div>
                </div>
              );
            })}
            {isOtherTyping && (
              <div className="flex justify-start items-center gap-2 mb-4">
                <div className={`px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1 h-1 bg-gray-500 rounded-full" />
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 bg-gray-500 rounded-full" />
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 bg-gray-500 rounded-full" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {session?.status === 'active' && (
        <div className={`p-6 border-t ${darkMode ? 'bg-black border-white/5' : 'bg-white border-black/5'}`}>
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => {
                 setNewMessage(e.target.value);
                 handleTyping();
              }}
              placeholder={t.supportPlaceholder || "Ketik pesan..."}
              className={`flex-1 h-14 pl-6 pr-16 rounded-[24px] font-bold outline-none border transition-all ${
                darkMode 
                  ? 'bg-white/5 border-white/10 text-white focus:border-[#1A9E5C]/50' 
                  : 'bg-gray-100 border-black/5 text-[#1A1A2E] focus:border-[#1A9E5C]'
              }`}
            />
            <button 
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className={`absolute right-2 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                newMessage.trim() 
                  ? 'bg-[#1A9E5C] text-white shadow-lg shadow-[#1A9E5C]/20' 
                  : 'bg-gray-500/20 text-gray-500'
              }`}
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}

      <AnimatePresence>
        {showSessionEndModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-sm rounded-[40px] p-8 space-y-6 text-center ${darkMode ? 'bg-[#121212] border border-white/10 shadow-2xl' : 'bg-white border border-black/5 shadow-2xl'}`}
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center text-red-500 mx-auto">
                <X size={32} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                  Percakapan Diakhiri
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Sesi dukungan ini telah selesai atau diakhiri oleh sistem/admin.
                </p>
              </div>
              <button 
                onClick={() => setShowSessionEndModal(false)}
                className="w-full h-14 bg-[#1A9E5C] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-[#1A9E5C]/20"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirming && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-end justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className={`w-full max-w-sm rounded-[40px] p-8 space-y-8 ${darkMode ? 'bg-[#121212] border border-white/10 shadow-2xl' : 'bg-white border border-black/5 shadow-2xl'}`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-[#1A9E5C]/10 rounded-[28px] flex items-center justify-center text-[#1A9E5C]">
                  <Headphones size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                    {t.supportConnectNow || "Hubungkan dengan Agent?"}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {t.supportConnectConfirm || "Kakak akan dihubungkan dengan tim customer support kami. Siap untuk memulai chat?"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleStartChat}
                  disabled={isSending}
                  className="w-full h-16 bg-[#1A9E5C] text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-[#1A9E5C]/20 active:scale-95 transition-all"
                >
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
                  {t.supportConnectNow || "YA, MULAI CHAT SEKARANG"}
                </button>
                <button 
                  onClick={() => setIsConfirming(false)}
                  disabled={isSending}
                  className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all ${darkMode ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-400'}`}
                >
                  {t.resetCancel || "Nanti Saja"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnavailablePopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`w-full max-w-sm rounded-[40px] p-8 space-y-6 ${darkMode ? 'bg-[#121212] border border-white/10 shadow-2xl' : 'bg-white border border-black/5 shadow-2xl'}`}
            >
              <div className="space-y-4 text-center">
                <h3 className={`text-xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                  Sepertinya belum ada agent yang tersedia
                </h3>
                <p className="text-sm text-gray-500">
                  Kami tidak menerima jawaban dalam waktu 5 menit. Silakan coba lagi atau batalkan permintaan.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleRetryRequest}
                  className="w-full h-14 bg-[#1A9E5C] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-[#1A9E5C]/20"
                >
                  Coba Lagi
                </button>
                <button 
                  onClick={() => { setShowUnavailablePopup(false); setSession(null); }}
                  className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm ${darkMode ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-700'}`}
                >
                  Batalkan Permintaan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
