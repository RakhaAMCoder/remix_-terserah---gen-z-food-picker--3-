
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, LayoutDashboard, Package, Users, Film, 
  AlertTriangle, ChevronLeft, CheckCircle2, XCircle, 
  Clock, Eye, Trash2, Search, ExternalLink, MessageSquare,
  AlertCircle,
  MoreVertical,
  Mail,
  Calendar,
  Shield,
  User as UserIcon,
  Video,
  Send,
  Loader2,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, FOOD_IMAGES_BUCKET } from '../../lib/supabase';
import { Profile, FoodMenu, MenuStatus } from '../../types/auth';

type AdminTab = 'overview' | 'users' | 'menu' | 'pending_menu' | 'feed' | 'reports' | 'live_agent';

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [waitingChats, setWaitingChats] = useState(0);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'menu' as const, label: 'Menu', icon: CheckCircle2 },
    { id: 'pending_menu' as const, label: 'Pending Menu', icon: Clock },
    { id: 'feed' as const, label: 'Feed', icon: Film },
    { id: 'reports' as const, label: 'Reports', icon: AlertTriangle },
    { id: 'live_agent' as const, label: 'Live Agent', icon: MessageSquare },
  ];

  useEffect(() => {
    // Poll for waiting support sessions
    const sb = supabase;
    if (!sb) return;
    const fetchWaiting = async () => {
      const { count, error } = await sb
        .from('support_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting');
      if (error) {
        console.error('Waiting support sessions count error:', error);
        return;
      }
      setWaitingChats(count || 0);
    };
    fetchWaiting();
    const interval = setInterval(fetchWaiting, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row shadow-2xl relative overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <div className="hidden md:flex w-64 bg-white/5 border-r border-white/10 flex-col p-6 gap-8">
        <div className="flex items-center gap-3 italic">
          <div className="w-10 h-10 bg-[#1A9E5C] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#1A9E5C]/20">
            <ShieldCheck size={24} />
          </div>
          <h2 className="font-black tracking-tighter text-xl uppercase">Admin<span className="text-[#1A9E5C]">.</span></h2>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative ${
                activeTab === tab.id ? 'bg-[#1A9E5C] text-white font-black' : 'text-gray-500 hover:bg-white/5'
              }`}
            >
              <tab.icon size={20} />
              <span className="text-xs uppercase tracking-widest font-bold">{tab.label}</span>
              {tab.id === 'live_agent' && waitingChats > 0 && (
                <span className="absolute right-4 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white font-black animate-pulse">
                  {waitingChats}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={onBack} className="p-4 border border-white/10 rounded-2xl text-gray-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">
          Exit Dashboard
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden px-6 py-6 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-500"><ChevronLeft size={24} /></button>
            <h2 className="font-black text-white uppercase tracking-widest text-xs italic">Admin</h2>
          </div>
          <div 
            onClick={() => setActiveTab('live_agent')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white relative transition-all ${waitingChats > 0 ? 'bg-red-500' : 'bg-white/10'}`}
          >
            <MessageSquare size={18} />
            {waitingChats > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-red-500 rounded-full text-[8px] font-black flex items-center justify-center">{waitingChats}</span>}
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-32 md:pb-6 bg-[#0A0A0A]">
          <AnimatePresence mode="wait">
        {activeTab === 'overview' && <AdminOverview onTabChange={setActiveTab} />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'menu' && <MenuManagement type="approved" />}
        {activeTab === 'pending_menu' && <MenuManagement type="pending" />}
        {activeTab === 'feed' && <FeedManagement />}
        {activeTab === 'reports' && <ReportsManagement />}
        {activeTab === 'live_agent' && <LiveAgentManagement />}
          </AnimatePresence>
        </div>

        {/* Mobile Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-3xl border-t border-white/10 flex items-center justify-around px-4 z-[100]">
          {tabs.slice(0, 5).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 transition-colors ${activeTab === tab.id ? 'text-[#1A9E5C]' : 'text-gray-600'}`}
            >
              <tab.icon size={22} />
            </button>
          ))}
          <button 
            onClick={() => setActiveTab('reports')}
            className={`p-3 transition-colors ${activeTab === 'reports' ? 'text-[#1A9E5C]' : 'text-gray-600'}`}
          >
            <AlertTriangle size={22} />
          </button>
        </nav>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

export function StatItem({ label, value, icon: Icon, color, onClick }: { label: string, value: string | number, icon: any, color: string, onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={`bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4 cursor-pointer transition-all hover:bg-white/10 ${onClick ? 'active:scale-95' : ''}`}
    >
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">{label}</p>
        <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Konfirmasi", cancelText = "Batal", isDanger = false }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-6 text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-[#1A9E5C]/10 text-[#1A9E5C]'}`}>
          {isDanger ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">{title}</h3>
          <p className="text-sm text-gray-500 font-medium">{message}</p>
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={onCancel} className="flex-1 py-4 text-gray-500 font-black uppercase text-[10px] tracking-widest">{cancelText}</button>
          <button onClick={onConfirm} className={`flex-1 py-4 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg ${isDanger ? 'bg-red-500' : 'bg-[#1A9E5C]'}`}>{confirmText}</button>
        </div>
      </motion.div>
    </div>
  );
}

function StatusModal({ isOpen, title, message, onClose, type = 'success' }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-6 text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-[#1A9E5C]/10 text-[#1A9E5C]'}`}>
          {type === 'error' ? <XCircle size={32} /> : <CheckCircle2 size={32} />}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">{title}</h3>
          <p className="text-sm text-gray-500 font-medium">{message}</p>
        </div>
        <button onClick={onClose} className={`w-full py-4 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg ${type === 'error' ? 'bg-red-500' : 'bg-[#1A9E5C]'}`}>Tutup</button>
      </motion.div>
    </div>
  );
}

function RatingApprovalModal({ 
  isOpen, 
  onConfirm, 
  onCancel,
  menuName
}: { 
  isOpen: boolean, 
  onConfirm: (rating: number) => void, 
  onCancel: () => void,
  menuName: string
}) {
  const [ratingStr, setRatingStr] = useState('4.7');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError(null);
    const ratingStrClean = ratingStr.trim().replace(',', '.');
    if (!ratingStrClean) {
      setError("Rating wajib diisi!");
      return;
    }
    const num = parseFloat(ratingStrClean);
    if (isNaN(num) || num < 0 || num > 5) {
      setError("Rating harus di antara 0.0 dan 5.0");
      return;
    }
    if (!/^\d(\.\d)?$/.test(ratingStrClean)) {
      setError("Format rating salah. Gunakan 1 angka desimal (contoh: 4.7)");
      return;
    }
    
    onConfirm(num);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-[#111] border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto">
          <Star size={32} className="fill-yellow-500" />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">⭐ Tentukan Rating</h3>
          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            Berikan nilai kualitas untuk <span className="text-white font-bold">"{menuName}"</span> sebelum menyetujuinya.
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <input 
              type="text"
              value={ratingStr} 
              onChange={(e) => {
                setRatingStr(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Contoh: 4.7"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-lg font-black text-white outline-none focus:border-yellow-500/50"
            />
          </div>
          {error && (
            <p className="text-[10px] text-red-500 text-center font-bold tracking-tight bg-red-500/10 py-1.5 px-3 rounded-lg">
              {error}
            </p>
          )}
          <p className="text-[10px] text-gray-500 text-center">
            Format: Angka desimal antara 0.0 - 5.0 (contoh: 4.5, 4.7, 5.0)
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Batal</button>
          <button 
            onClick={handleSubmit} 
            className="flex-1 py-4 bg-yellow-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg hover:bg-yellow-400 transition-colors"
          >
            Approve Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function RejectionModal({ isOpen, onConfirm, onCancel }: { isOpen: boolean, onConfirm: (reason: string) => void, onCancel: () => void }) {
  const [reason, setReason] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111] border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">Alasan Penolakan</h3>
          <p className="text-xs text-gray-500 font-medium">Berikan alasan kenapa menu ini ditolak agar merchant bisa memperbaikinya.</p>
        </div>
        <textarea 
          value={reason} 
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Foto kurang jelas, data tidak lengkap..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-red-500/50 h-24 resize-none"
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-4 text-gray-500 font-black uppercase text-[10px] tracking-widest">Batal</button>
          <button 
            onClick={() => onConfirm(reason)} 
            disabled={!reason.trim()}
            className="flex-1 py-4 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg disabled:opacity-50"
          >
            Tolak Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AdminOverview({ onTabChange }: { onTabChange: (tab: AdminTab) => void }) {
  const [stats, setStats] = useState({
    users: 0,
    menuApproved: 0,
    pendingMenus: 0,
    feedVideos: 0,
    reports: 0,
    waitingChats: 0
  });
  const [recentMenus, setRecentMenus] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!supabase) return;
      const [u, me, pMe, f, r, s, recent] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('food_menus').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('food_menus').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('feed_videos').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('support_sessions').select('*', { count: 'exact', head: true }).eq('status', 'waiting'),
        supabase.from('food_menus').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(10)
      ]);

      setStats({
        users: u.count || 0,
        menuApproved: me.count || 0,
        pendingMenus: pMe.count || 0,
        feedVideos: f.count || 0,
        reports: r.count || 0,
        waitingChats: s.count || 0
      });
      setRecentMenus(recent.data || []);
    };
    fetchStats();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <StatItem label="Total Users" value={stats.users} icon={Users} color="bg-blue-500" onClick={() => onTabChange('users')} />
        <StatItem label="Approved Menu" value={stats.menuApproved} icon={Package} color="bg-[#1A9E5C]" onClick={() => onTabChange('menu')} />
        <StatItem label="Pending Menu" value={stats.pendingMenus} icon={Clock} color="bg-yellow-500" onClick={() => onTabChange('pending_menu')} />
        <StatItem label="Feed Videos" value={stats.feedVideos} icon={Video} color="bg-purple-500" onClick={() => onTabChange('feed')} />
        <StatItem label="Open Reports" value={stats.reports} icon={AlertTriangle} color="bg-red-500" onClick={() => onTabChange('reports')} />
        <StatItem label="Live Waiting" value={stats.waitingChats} icon={MessageSquare} color={stats.waitingChats > 0 ? "bg-red-600 animate-pulse" : "bg-gray-700"} onClick={() => onTabChange('live_agent')} />
      </div>

      {/* Recent Highlights Scroll */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-white uppercase tracking-widest text-[10px] opacity-30 italic">Baru Saja Disetujui</h3>
          <button onClick={() => onTabChange('menu')} className="text-[10px] font-black text-[#1A9E5C] uppercase tracking-widest hover:opacity-70">Lihat Semua</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {recentMenus.map((menu) => (
            <motion.div
              key={menu.id}
              whileTap={{ scale: 0.98 }}
              className="flex-shrink-0 w-48 bg-white/5 border border-white/10 rounded-[32px] p-4 space-y-3 transition-all hover:bg-white/10"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                {menu.image_url ? (
                  <img src={menu.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/5"><Package size={24} /></div>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-[10px] text-white uppercase truncate tracking-tight">{menu.name}</h4>
                <p className="text-[9px] text-[#1A9E5C] font-black uppercase tracking-widest">
                  {menu.price ? `Rp ${menu.price.toLocaleString()}` : 'Harga Menyesuaikan'}
                </p>
              </div>
            </motion.div>
          ))}
          {recentMenus.length === 0 && (
            <div className="w-full py-12 bg-white/5 rounded-[40px] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2">
              <Package size={20} className="text-white/10" />
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Belum ada menu yang disetujui</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1A9E5C]/20 rounded-2xl flex items-center justify-center text-[#1A9E5C]">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg text-white tracking-tight">Admin Moderation Protocol</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Gunakan hak akses dengan bijak</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 text-gray-500 text-[11px] font-medium leading-relaxed italic">
          <p>Sistem ini dirancang untuk memantau kualitas konten di Malang Kuliner. Pastikan setiap menu yang disetujui memiliki informasi yang akurat dan foto yang berkualitas baik.</p>
          <p>Aksi penghapusan bersifat permanen. Menghapus video atau menu juga akan membersihkan file terkait di Supabase Storage untuk menghemat penyimpanan.</p>
        </div>
      </div>
    </motion.div>
  );
}

function MenuManagement({ type }: { type: 'approved' | 'pending' }) {
  const { authUser } = useAuth();
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', 'Makanan', 'Minuman', 'Cemilan', 'Viral', 'Pedas', 'Halal', 'Legendaris'];

  const filteredMenus = menus.filter(menu => {
    if (selectedCategory === 'Semua') return true;
    const catMatch = menu.category?.toLowerCase() === selectedCategory.toLowerCase();
    const tagMatch = menu.hashtags?.some((tag: string) => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    const nameMatch = menu.name.toLowerCase().includes(selectedCategory.toLowerCase());
    return catMatch || tagMatch || nameMatch;
  });

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean } | null>(null);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; menu: any } | null>(null);
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; menu: any } | null>(null);

  const fetchMenus = async () => {
    if (!supabase) return;

    setLoading(true);

    try {
      let query = supabase
        .from('food_menus')
        .select('*')
        .eq('status', type);
        
      if (type === 'approved') {
        query = query
          .order('rating', { ascending: false })
          .order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: menuData, error: menuError } = await query;

      if (menuError) {
        console.error('Gagal load menu admin:', menuError);
        setMenus([]);
        return;
      }

      const uploaderIds = Array.from(
        new Set(
          (menuData || [])
            .map((menu: any) => menu.submitted_by || menu.seller_id)
            .filter(Boolean)
        )
      );

      let profilesById: Record<string, any> = {};

      if (uploaderIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email, avatar_url')
          .in('id', uploaderIds);

        if (profilesError) {
          console.error('Gagal load profile uploader:', profilesError);
        } else {
          profilesById = (profilesData || []).reduce((acc: Record<string, any>, profile: any) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
        }
      }

      const enrichedMenus = (menuData || []).map((menu: any) => ({
        ...menu,
        profiles: profilesById[menu.submitted_by] || profilesById[menu.seller_id] || null,
      }));

      console.log(`Admin ${type} menus:`, enrichedMenus);
      console.log(`Loaded ${type} menus:`, enrichedMenus.length);
      setMenus(enrichedMenus);
    } catch (err) {
      console.error('Fetch menu admin exception:', err);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchMenus(); 

    if (!supabase) return;

    const channel = supabase.channel(`menu_management_${type}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'food_menus'
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const deletedId = payload.old?.id;
          if (deletedId) {
            setMenus(prev => prev.filter(item => item.id !== deletedId));
          } else {
            fetchMenus();
          }
          return;
        }

        fetchMenus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [type]);

  const getStoragePathFromPublicUrl = (url: string) => {
    try {
      const marker = `/storage/v1/object/public/${FOOD_IMAGES_BUCKET}/`;
      const parts = url.split(marker);
      if (parts.length < 2) return null;
      return decodeURIComponent(parts[1].split('?')[0]);
    } catch {
      return null;
    }
  };

  const executeAction = async (menu: any, action: 'approve' | 'reject' | 'delete', extra?: any) => {
    if (!supabase) return;
    
    try {
      if (action === 'delete') {
        const { data: targetMenu, error: fetchError } = await supabase
          .from('food_menus')
          .select('*')
          .eq('id', menu.id)
          .single();

        if (fetchError || !targetMenu) {
          throw new Error("Menu tidak ditemukan atau kamu tidak punya akses.");
        }

        // 1. Clear Storage completely
        const pathToDelete = targetMenu.image_path || (targetMenu.image_url ? getStoragePathFromPublicUrl(targetMenu.image_url) : null);
        if (pathToDelete) {
          const { error: storageError } = await supabase.storage
            .from(FOOD_IMAGES_BUCKET)
            .remove([pathToDelete]);

          if (storageError) {
            console.error('Gagal hapus image menu:', storageError);
            throw new Error(`Gagal menghapus foto menu: ${storageError.message}`);
          }
        }

        // 2. Clear related rows safely
        try {
          await supabase.from('user_notifications').delete().eq('menu_id', targetMenu.id);
        } catch (e) {
          console.warn('Gagal hapus user_notifications:', e);
        }

        try {
          await supabase.from('reports').delete().eq('target_id', targetMenu.id);
        } catch (e) {
          console.warn('Gagal hapus reports:', e);
        }

        // 3. Delete from DB completely
        let isDeleted = false;
        try {
          const { data: deletedRows, error: deleteError } = await supabase
            .from('food_menus')
            .delete()
            .eq('id', targetMenu.id)
            .select('id');

          if (!deleteError && deletedRows && deletedRows.length > 0) {
            isDeleted = true;
            console.log("Admin client-side delete successful:", deletedRows);
          } else {
            console.warn("Admin client-side delete returned no rows or had error. Falling back to server.", deleteError);
          }
        } catch (clientErr) {
          console.warn("Admin client-side delete threw error. Falling back to server.", clientErr);
        }

        // Fallback to server delete if client-side failed
        if (!isDeleted) {
          console.log("Running server-side delete fallback for admin...");
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error("Sesi admin tidak ditemukan.");

          const response = await fetch('/api/menu/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ menuId: targetMenu.id })
          });

          console.log("Admin server delete response status:", response.status);
          const text = await response.text();
          console.log("Admin server delete response body:", text);

          let result: any = {};
          if (text) {
            try {
              result = JSON.parse(text);
            } catch (e) {
              console.error("Invalid JSON response from admin delete API:", text, e);
              throw new Error(`Respons server tidak valid (bukan JSON): ${text ? text.substring(0, 100) : 'empty'}`);
            }
          }

          if (!response.ok) {
            throw new Error(result.error || `Gagal menghapus menu dari server (Status: ${response.status}).`);
          }
          console.log("Admin server fallback delete successful:", result);
        }

        setMenus(prev => prev.filter(item => item.id !== targetMenu.id));
        setStatusModal({ isOpen: true, title: 'Berhasil', message: 'Menu dan foto berhasil dihapus.', type: 'success' });
        
      } else if (action === 'reject') {
        const reason = extra?.reason || "Informasi belum lengkap atau tidak sesuai aturan.";
        
        // Update status and save rejection_reason
        const { error: updateError } = await supabase.from('food_menus')
          .update({
            status: 'rejected',
            rejection_reason: reason,
            reviewed_by: authUser?.id || null,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', menu.id);

        if (updateError) throw updateError;

        // Send Notification
        const targetUserId = menu.submitted_by || menu.seller_id;
        if (targetUserId) {
          const { error: notifError } = await supabase.from('user_notifications').insert({
            user_id: targetUserId,
            type: 'menu_rejection',
            title: "Menu kamu ditolak",
            message: `Menu "${menu.name}" ditolak admin. Alasan: ${reason}`
          });
          if (notifError) {
            console.error('Gagal mengirim insert notification:', notifError);
          }
        }

        setMenus(prev => prev.filter(item => item.id !== menu.id));
        setStatusModal({ isOpen: true, title: 'Berhasil', message: 'Menu berhasil ditolak.', type: 'success' });

      } else if (action === 'approve') {
        const ratingVal = extra?.rating || null;
        const { error: approveError } = await supabase.from('food_menus')
          .update({ 
            status: 'approved',
            rating: ratingVal,
            rejection_reason: null, // Clear any reject reason
            reviewed_by: authUser?.id || null,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', menu.id);

        if (approveError) throw approveError;

        const targetUserId = menu.submitted_by || menu.seller_id;
        if (targetUserId) {
          const { error: notifError } = await supabase.from('user_notifications').insert({
            user_id: targetUserId,
            type: 'menu_approval',
            title: "Menu kamu diterima!",
            message: `Hore! Menu "${menu.name}" sudah tampil di aplikasi.`
          });
          if (notifError) {
            console.error('Gagal mengirim insert notification:', notifError);
          }
        }

        setMenus(prev => prev.filter(item => item.id !== menu.id));
        setStatusModal({ isOpen: true, title: 'Berhasil', message: 'Menu berhasil disetujui.', type: 'success' });
      }
      setTimeout(() => {
        fetchMenus();
      }, 500);
    } catch (err: any) {
      console.error('Execute action admin error:', err);
      setStatusModal({ isOpen: true, title: 'Gagal', message: err.message || err, type: 'error' });
    }
  };

  const handleAction = (menu: any, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete') {
      setConfirmModal({
        isOpen: true,
        title: 'Hapus Menu',
        message: "Hapus menu ini secara permanen?",
        isDanger: true,
        onConfirm: () => {
          setConfirmModal(null);
          executeAction(menu, action);
        }
      });
    } else if (action === 'reject') {
      setRejectionModal({ isOpen: true, menu });
    } else {
      setRatingModal({ isOpen: true, menu });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white tracking-tighter capitalize">{type} Menus</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#1A9E5C]">{menus.length} Items</p>
      </div>

      {/* Category Scroll Filter - ONLY for approved menus (or both) */}
      <div className="space-y-4">
        <h3 className="font-black text-white uppercase tracking-widest text-[10px] opacity-30 italic px-2">Filter Kategori</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat 
                  ? 'bg-[#1A9E5C] border-[#1A9E5C] text-white shadow-[0_10px_20px_rgba(26,158,92,0.3)]' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex justify-center opacity-20"><Clock size={40} className="animate-spin" /></div>
      ) : filteredMenus.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map(menu => (
            <div key={menu.id} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden p-5 space-y-4 hover:border-white/20 transition-all">
              <div className="aspect-video rounded-2xl overflow-hidden bg-white/5 relative">
                {menu.image_url ? (
                  <img src={menu.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/5"><Package size={40} /></div>
                )}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black uppercase text-white/60">
                  {menu.category}
                </div>
                {menu.status === 'approved' && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-yellow-500 text-black flex items-center gap-0.5 rounded-lg text-[9px] font-black uppercase shadow-lg">
                    <Star size={9} className="fill-black" />
                    <span>{menu.rating !== undefined && menu.rating !== null ? Number(menu.rating).toFixed(1) : '—'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <h4 className="font-black text-white tracking-tight truncate">{menu.name}</h4>
                    <p className="text-[#1A9E5C] font-black text-sm">{menu.price ? `Rp ${menu.price.toLocaleString()}` : 'Harga Menyesuaikan'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Uploader</p>
                    <p className="text-[10px] text-white/60 font-bold truncate">{menu.profiles?.display_name || 'Anonymous'}</p>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl space-y-2">
                  <p className="text-[9px] text-gray-400 font-medium line-clamp-2 italic">{menu.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-1">
                    {menu.hashtags?.map((h: string, i: number) => {
                      const cleanH = String(h).replace(/^#+/, '');
                      return (
                        <span key={i} className="text-[8px] font-bold text-[#1A9E5C]">#{cleanH.toUpperCase()}</span>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-2">Lokasi ({menu.locations?.length || 0})</p>
                  <div className="max-h-20 overflow-y-auto no-scrollbar space-y-1">
                    {menu.locations?.map((loc: any, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => loc.google_maps_url && window.open(loc.google_maps_url, '_blank')}
                        className="w-full text-[9px] px-3 py-1.5 bg-black/40 rounded-lg flex justify-between items-center text-gray-400 hover:bg-white/10 transition-colors group text-left"
                      >
                        <span className="truncate flex-1">{loc.place_name || 'Link Lokasi'}</span>
                        {loc.google_maps_url && <ExternalLink size={10} className="ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {type === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleAction(menu, 'approve')}
                        className="flex-1 py-3.5 bg-[#1A9E5C] text-white font-black uppercase text-[9px] tracking-widest rounded-2xl shadow-lg shadow-[#1A9E5C]/10 hover:opacity-80 transition-all"
                      >
                        Approve
                    </button>
                      <button 
                        onClick={() => handleAction(menu, 'reject')}
                        className="flex-1 py-3.5 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[9px] tracking-widest rounded-2xl hover:bg-red-500/20 transition-all"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleAction(menu, 'delete')}
                      className="w-full py-3.5 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[9px] tracking-widest rounded-2xl hover:bg-red-500 transition-all hover:text-white"
                    >
                      Hapus Menu
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center opacity-30 space-y-4">
          <Package size={60} className="mx-auto" />
          <p className="font-black uppercase tracking-widest text-[10px]">Belum ada menu {type}</p>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal?.isOpen || false}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        isDanger={confirmModal?.isDanger}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />

      <RejectionModal 
        isOpen={rejectionModal?.isOpen || false}
        onCancel={() => setRejectionModal(null)}
        onConfirm={(reason) => {
          if (rejectionModal?.menu) {
            executeAction(rejectionModal.menu, 'reject', { reason });
            setRejectionModal(null);
          }
        }}
      />

      <RatingApprovalModal 
        isOpen={ratingModal?.isOpen || false}
        menuName={ratingModal?.menu?.name || ''}
        onCancel={() => setRatingModal(null)}
        onConfirm={(rating) => {
          if (ratingModal?.menu) {
            executeAction(ratingModal.menu, 'approve', { rating });
            setRatingModal(null);
          }
        }}
      />

      <StatusModal 
        isOpen={statusModal?.isOpen || false}
        title={statusModal?.title || ''}
        message={statusModal?.message || ''}
        type={statusModal?.type || 'success'}
        onClose={() => setStatusModal(null)}
      />
    </motion.div>
  );
}

function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // Realtime counts for selected user
  useEffect(() => {
    if (!selectedUser?.id || !supabase) return;

    const fetchCounts = async () => {
      const [menuCount, videoCount] = await Promise.all([
        supabase.from('food_menus').select('*', { count: 'exact', head: true }).eq('submitted_by', selectedUser.id),
        supabase.from('feed_videos').select('*', { count: 'exact', head: true }).eq('user_id', selectedUser.id)
      ]);
      setSelectedUser((prev: any) => prev?.id === selectedUser.id ? { ...prev, menuCount: menuCount.count || 0, videoCount: videoCount.count || 0 } : prev);
    };

    const menuSubscription = supabase.channel('user_menu_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_menus', filter: `submitted_by=eq.${selectedUser.id}` }, fetchCounts)
      .subscribe();

    const videoSubscription = supabase.channel('user_video_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_videos', filter: `user_id=eq.${selectedUser.id}` }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(menuSubscription);
      supabase.removeChannel(videoSubscription);
    };
  }, [selectedUser?.id]);

  const fetchUserDetails = async (userId: string) => {
    if (!supabase) return;
    const [menuCount, videoCount] = await Promise.all([
      supabase.from('food_menus').select('*', { count: 'exact', head: true }).eq('submitted_by', userId),
      supabase.from('feed_videos').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ]);
    const user = users.find(u => u.id === userId);
    setSelectedUser({ ...user, menuCount: menuCount.count || 0, videoCount: videoCount.count || 0 });
  };

  const executeDelete = async (userId: string) => {
    try {
      if (!supabase) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session admin tidak ditemukan");

      const userToDelete = users.find(u => u.id === userId);
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ targetUserId: userId, email: userToDelete?.email })
      });

      console.log("Admin deleteUser response status:", response.status);
      const text = await response.text();
      console.log("Admin deleteUser response body:", text);

      let result: any = {};
      if (text) {
        try {
          result = JSON.parse(text);
        } catch (e) {
          console.error("Invalid JSON response in admin deleteUser:", text, e);
          throw new Error("Respons server tidak valid (bukan JSON).");
        }
      }

      if (!response.ok) throw new Error(result.error || `Gagal menghapus pengguna (Status: ${response.status})`);
      
      setStatusModal({ isOpen: true, title: 'Berhasil', message: 'Pengguna berhasil dihapus.', type: 'success' });
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      setStatusModal({ isOpen: true, title: 'Gagal', message: err.message || "Error tidak diketahui", type: 'error' });
    }
  };

  const deleteUser = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Pengguna',
      message: "Semua data terkait (Menu, Video, Profil) akan ikut terhapus. Lanjutkan?",
      onConfirm: () => {
        setConfirmModal(null);
        executeDelete(userId);
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white tracking-tighter">Community Users</h2>
        <Search size={20} className="text-white/20" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 uppercase text-[10px] font-black text-gray-500 tracking-[0.2em]">
                <th className="px-6 py-6 font-black">User</th>
                <th className="px-6 py-6 font-black">Role</th>
                <th className="px-6 py-6 font-black">Joined</th>
                <th className="px-6 py-6 font-black">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => fetchUserDetails(u.id)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={18} className="text-white/20" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-white text-sm truncate">{u.display_name || 'Anonymous'}</p>
                        <p className="text-[10px] text-gray-500 font-medium truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                      u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 
                      u.role === 'merchant' ? 'bg-[#1A9E5C]/10 text-[#1A9E5C]' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-white/20 group-hover:text-white transition-colors"><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} 
              className="bg-[#111] border border-white/10 w-full max-w-md rounded-[40px] p-8 space-y-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 flex items-center justify-center">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={40} className="text-white/20" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white tracking-tighter">{selectedUser.display_name}</h3>
                  <p className="text-[#1A9E5C] text-[10px] font-black uppercase tracking-widest">@{selectedUser.username}</p>
                  <div className="flex gap-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${
                      selectedUser.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                      selectedUser.role === 'merchant' ? 'bg-[#1A9E5C]/10 text-[#1A9E5C]' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Menu Uploaded</p>
                  <p className="text-2xl font-black text-white">{selectedUser.menuCount}</p>
                </div>
                <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Feed Videos</p>
                  <p className="text-2xl font-black text-white">{selectedUser.videoCount}</p>
                </div>
              </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-500 font-medium text-xs">
                    <Mail size={14} /> {selectedUser.email}
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 font-medium text-xs">
                    <Calendar size={14} /> Bergabung {new Date(selectedUser.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={() => deleteUser(selectedUser.id)}
                  className="w-full py-4 bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                >
                  Hapus Pengguna Ini
                </button>
                <button onClick={() => setSelectedUser(null)} className="w-full py-4 text-gray-500 font-black uppercase text-[10px] tracking-widest">Tutup</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal?.isOpen || false}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        isDanger={true}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />

      <StatusModal 
        isOpen={statusModal?.isOpen || false}
        title={statusModal?.title || ''}
        message={statusModal?.message || ''}
        type={statusModal?.type || 'success'}
        onClose={() => setStatusModal(null)}
      />
    </motion.div>
  ); 
}

function FeedManagement() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean } | null>(null);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchFeeds = async () => {
    const sb = supabase;
    if (!sb) return;
    setLoading(true);
    try {
      // Fetch all videos
      const { data, error } = await sb
        .from('feed_videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fetch feeds error:', error);
        setVideos([]);
      } else if (data && data.length > 0) {
        // Fetch profiles for the uploaders to be safe
        const uploaderIds = Array.from(new Set(data.map(v => v.uploader_id).filter(id => !!id)));
        if (uploaderIds.length > 0) {
          const { data: profiles } = await sb.from('profiles').select('id, display_name, avatar_url, email').in('id', uploaderIds);
          const enriched = data.map(v => ({
            ...v,
            profiles: profiles?.find(p => p.id === v.uploader_id) || null
          }));
          setVideos(enriched);
        } else {
          setVideos(data);
        }
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('Fetch feeds exception:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();

    const sb = supabase;
    if (!sb) return;

    const channel = sb.channel('admin_feed_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_videos' }, (payload) => {
        console.log('Feed change detected:', payload);
        if (payload.eventType === 'DELETE') {
          const deletedId = payload.old?.id;
          if (deletedId) {
            setVideos(prev => prev.filter(v => v.id !== deletedId));
          } else {
            fetchFeeds();
          }
        } else {
          fetchFeeds();
        }
      })
      .subscribe((status) => {
        console.log('Feed realtime status:', status);
      });

    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  const deleteVideo = (video: any) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Video Feed',
      message: `Hapus video "${video.description || 'Tanpa Deskripsi'}" secara permanen? Data komentar dan likes juga akan terhapus.`,
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          if (supabase) {
            const bucket = 'FeedTiktok';
            const storagePaths = [];
            const fileName = video.file_name || video.video_path || (video.url ? video.url.split('/').pop() : null);
            if (fileName) {
              storagePaths.push(fileName);
              storagePaths.push(`thumbnails/${fileName}.jpg`);
            }
            if (video.thumbnail_path && !storagePaths.includes(video.thumbnail_path)) {
              storagePaths.push(video.thumbnail_path);
            }
            if (storagePaths.length > 0) {
              const uniquePaths = Array.from(new Set(storagePaths));
              await supabase.storage.from(bucket).remove(uniquePaths);
            }
            const { error } = await supabase.from('feed_videos').delete().eq('id', video.id);
            if (error) throw error;
            fetchFeeds();
            setStatusModal({ isOpen: true, title: 'Berhasil', message: 'Video feed berhasil dihapus.', type: 'success' });
          }
        } catch (err: any) {
          setStatusModal({ isOpen: true, title: 'Gagal', message: err.message, type: 'error' });
        }
      }
    });
  };

  const filteredVideos = videos.filter(v => 
    (v.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.uploader_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter capitalize transition-all">Feed Moderation</h2>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#1A9E5C]">{videos.length} Total Videos</p>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-[#1A9E5C] rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-[#1A9E5C] uppercase tracking-tighter">Live</span>
              </div>
            </div>
          </div>
          <button 
            onClick={fetchFeeds}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title="Refresh Manual"
          >
            <Loader2 size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Cari deskripsi atau uploader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs text-white outline-none focus:border-[#1A9E5C] transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4 opacity-20">
          <Loader2 size={40} className="animate-spin" />
          <p className="font-black uppercase tracking-widest text-[10px]">Memuat Feed...</p>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredVideos.map(vid => (
            <div key={vid.id} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden group hover:border-[#1A9E5C]/40 transition-all flex flex-col relative aspect-[9/16]">
              {/* Thumbnail */}
              <div className="absolute inset-0 bg-black">
                {vid.thumbnail_url ? (
                  <img src={vid.thumbnail_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" alt="thumbnail" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/5">
                    <Video size={40} />
                  </div>
                )}
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-4 flex flex-col justify-end pointer-events-none">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 bg-white/5">
                      {vid.profiles?.avatar_url ? <img src={vid.profiles.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><UserIcon size={10} /></div>}
                    </div>
                    <p className="text-[9px] font-black text-white truncate">{vid.profiles?.display_name || vid.uploader_name || 'Anonymous'}</p>
                  </div>
                  <p className="text-white font-black text-[10px] leading-tight line-clamp-2 tracking-tight">
                    {vid.description || 'No Description'}
                  </p>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                    {new Date(vid.created_at).toLocaleDateString()}
                  </p>
                  {vid.location_link && (
                     <div className="flex items-center gap-1 mt-1">
                       <CheckCircle2 size={8} className="text-[#1A9E5C]" />
                       <span className="text-[7px] text-[#1A9E5C] font-black uppercase">Location Linked</span>
                     </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={() => deleteVideo(vid)}
                  className="w-9 h-9 bg-red-500/90 backdrop-blur-md text-white rounded-xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                  title="Hapus Video"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => (window as any).navigateToFeed?.(vid.id)}
                  className="w-9 h-9 bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-[#1A9E5C] transition-all"
                  title="Lihat Video"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center opacity-30 space-y-4">
          <Film size={60} className="mx-auto" />
          <p className="font-black uppercase tracking-widest text-[10px]">Tidak ada video ditemukan</p>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal?.isOpen || false}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        isDanger={true}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />

      <StatusModal 
        isOpen={statusModal?.isOpen || false}
        title={statusModal?.title || ''}
        message={statusModal?.message || ''}
        type={statusModal?.type || 'success'}
        onClose={() => setStatusModal(null)}
      />
    </motion.div>
  );
}

function ReportsManagement() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'live'>('feed');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchReports = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const handleStatus = async (id: string, status: string) => {
    if (!supabase) return;
    await supabase.from('reports').update({ status }).eq('id', id);
    fetchReports();
    setStatusModal({ isOpen: true, title: 'Berhasil', message: `Laporan berhasil di-${status}.`, type: 'success' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white tracking-tighter">Reports Center</h2>
        <div className="flex p-1 bg-white/5 rounded-2xl">
          <button 
            onClick={() => setActiveSubTab('feed')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'feed' ? 'bg-[#1A9E5C] text-white' : 'text-gray-500'}`}
          >
            Report Feed
          </button>
          <button 
            onClick={() => setActiveSubTab('live')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'live' ? 'bg-[#1A9E5C] text-white' : 'text-gray-500'}`}
          >
            App Help
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {reports.filter(r => activeSubTab === 'feed' ? r.target_type === 'feed_video' : (r.target_type === 'app_help' || r.target_type === 'user')).map(report => (
          <div key={report.id} className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${report.status === 'open' ? 'bg-red-500/20 text-red-500' : 'bg-gray-700/20 text-gray-500'}`}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="font-black text-white uppercase text-xs tracking-widest">{report.reason}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Reporter: {report.reporter_email}</p>
                </div>
              </div>
              <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${report.status === 'open' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                {report.status}
              </span>
            </div>

            <div className="p-4 bg-black/40 rounded-2xl italic text-[11px] text-gray-400 font-medium leading-relaxed">
              "{report.details || 'No details provided'}"
            </div>

            <div className="flex gap-2">
              {report.status === 'open' && (
                <>
                  <button onClick={() => handleStatus(report.id, 'resolved')} className="flex-1 py-3 bg-[#1A9E5C] rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#1A9E5C]/10">Resolve</button>
                  <button onClick={() => handleStatus(report.id, 'rejected')} className="flex-1 py-3 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500">Dismiss</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal 
        isOpen={confirmModal?.isOpen || false}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />

      <StatusModal 
        isOpen={statusModal?.isOpen || false}
        title={statusModal?.title || ''}
        message={statusModal?.message || ''}
        type={statusModal?.type || 'success'}
        onClose={() => setStatusModal(null)}
      />
    </motion.div>
  );
}

const RESPONSE_TIMEOUT_MS = 5 * 60 * 1000;

function LiveAgentManagement() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [showSessionEndModal, setShowSessionEndModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean } | null>(null);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' } | null>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const autoDeclinedRef = React.useRef<Record<string, boolean>>({});
  const { authUser } = useAuth();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const handleTyping = () => {
    if (!activeSession || !authUser) return;
    const sb = supabase;
    if (!sb) return;

    sb.channel(`typing_${activeSession.id}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: authUser.id, is_typing: true }
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sb.channel(`typing_${activeSession.id}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: authUser.id, is_typing: false }
      });
    }, 2000);
  };

  const fetchSessions = async () => {
    const sb = supabase;
    if (!sb) return;
    const { data: sessionsData, error: sessionsError } = await sb
      .from('support_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('Failed to fetch support sessions:', sessionsError);
      setSessions([]);
      return;
    }

    const userIds = Array.from(new Set((sessionsData || []).map((s: any) => s.user_id).filter(Boolean)));
    let profilesById: Record<string, any> = {};

    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await sb
        .from('profiles')
        .select('id, display_name, avatar_url, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Failed to fetch support session profiles:', profilesError);
      } else {
        profilesById = (profilesData || []).reduce((acc: Record<string, any>, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }
    }

    setSessions((sessionsData || []).map((session: any) => ({
      ...session,
      profiles: profilesById[session.user_id] || null
    })));
  };

  useEffect(() => { 
    fetchSessions();
    const sb = supabase;
    if (!sb) return;
    const channel = sb.channel('support_changes_admin')
      .on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'support_sessions' }, fetchSessions)
      .on('postgres_changes' as any, { event: 'UPDATE', schema: 'public', table: 'support_sessions' }, fetchSessions)
      .on('postgres_changes' as any, { event: 'DELETE', schema: 'public', table: 'support_sessions' }, fetchSessions)
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    const sb = supabase;
    if (!sb) return;

    const fetchMessages = async () => {
      const { data } = await sb
        .from('support_messages')
        .select('*')
        .eq('session_id', activeSession.id)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    const channel = sb.channel(`messages_${activeSession.id}`)
      .on('postgres_changes' as any, { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages', 
        filter: `session_id=eq.${activeSession.id}` 
      }, (payload: any) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();

    const typingChannel = sb.channel(`typing_${activeSession.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== authUser?.id) {
          setIsOtherTyping(payload.payload.is_typing);
        }
      })
      .subscribe();

    const statusChannel = sb.channel(`session_status_${activeSession.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'support_sessions', 
        filter: `id=eq.${activeSession.id}` 
      }, (payload) => {
        if (payload.new.status === 'closed' && activeSession.status !== 'closed') {
          setShowSessionEndModal(true);
        }
      })
      .subscribe();

    return () => { 
      sb.removeChannel(channel);
      sb.removeChannel(typingChannel);
      sb.removeChannel(statusChannel);
    };
  }, [activeSession?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  const handleSession = async (sessionId: string, action: 'active' | 'declined' | 'closed') => {
    const sb = supabase;
    if (!sb || !authUser) return;
    
    const execute = async () => {
      await sb.from('support_sessions').update({ 
        status: action,
        admin_id: authUser.id,
        accepted_at: action === 'active' ? new Date().toISOString() : undefined
      }).eq('id', sessionId);
      
      if (action === 'active') {
        const s = sessions.find(x => x.id === sessionId);
        setActiveSession({ ...s, status: 'active' });
      } else if (action === 'closed' || action === 'declined') {
        setActiveSession(null);
      }
      fetchSessions();
    };

    if (action === 'closed') {
      setConfirmModal({
        isOpen: true,
        title: 'Akhiri Sesi',
        message: 'Akhiri sesi chat ini?',
        onConfirm: () => {
          setConfirmModal(null);
          execute();
        }
      });
      return;
    }

    execute();
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sb = supabase;
    if (!sb) return;

    sessions.forEach((session) => {
      if (session.status !== 'waiting' || !session.created_at) return;
      const createdAt = new Date(session.created_at).getTime();
      const age = now - createdAt;
      if (age >= RESPONSE_TIMEOUT_MS && !autoDeclinedRef.current[session.id]) {
        autoDeclinedRef.current[session.id] = true;
        sb.from('support_sessions').update({ status: 'declined' }).eq('id', session.id)
          .then(({ error }) => {
            if (error) console.error('Auto-decline support session failed:', error);
          });
      }
    });
  }, [sessions, now]);

  const getSessionCountdown = (session: any) => {
    if (!session.created_at) return '05:00';
    const createdAt = new Date(session.created_at).getTime();
    const remaining = Math.max(0, RESPONSE_TIMEOUT_MS - (now - createdAt));
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const deleteSession = async (sessionId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Sesi',
      message: 'Hapus riwayat permintaan ini dari dashboard?',
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        const sb = supabase;
        if (!sb) return;
        await sb.from('support_messages').delete().eq('session_id', sessionId);
        await sb.from('support_sessions').delete().eq('id', sessionId);
        fetchSessions();
        setStatusModal({ isOpen: true, title: 'Berhasil', message: 'Sesi berhasil dihapus.', type: 'success' });
      }
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = supabase;
    if (!newMessage.trim() || !activeSession || !authUser || !sb) return;
    
    setIsSending(true);
    const text = newMessage.trim();
    setNewMessage('');
    
    const { error } = await sb.from('support_messages').insert({
      session_id: activeSession.id,
      sender_id: authUser.id,
      message: text
    });

    if (error) {
      setStatusModal({ isOpen: true, title: 'Gagal', message: 'Gagal kirim pesan.', type: 'error' });
      setNewMessage(text);
    }
    setIsSending(false);
  };

  if (activeSession) {
    return (
      <div className="relative h-full">
        {/* Session End Notification Overlay */}
        <AnimatePresence>
          {showSessionEndModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center text-red-500 mx-auto">
                  <XCircle size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Percakapan Berakhir</h3>
                  <p className="text-sm text-gray-500 font-medium">Pengguna telah mengakhiri percakapan atau sesi telah ditutup.</p>
                </div>
                <button 
                  onClick={() => {
                    setShowSessionEndModal(false);
                    setActiveSession(null);
                  }}
                  className="px-8 py-4 bg-[#1A9E5C] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#1A9E5C]/20 active:scale-95 transition-all"
                >
                  Kembali ke Dashboard
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-[70vh] bg-white/5 border border-white/10 rounded-[40px] overflow-hidden">
        <header className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveSession(null)} className="p-2 transition-colors hover:text-[#1A9E5C]"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                {activeSession.profiles?.avatar_url ? (
                  <img src={activeSession.profiles.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={20} className="text-white/20" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-white text-sm tracking-tight">{activeSession.profiles?.display_name || 'Anonymous User'}</h4>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none">{activeSession.profiles?.email}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => handleSession(activeSession.id, 'closed')}
            className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            <XCircle size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === authUser?.id;
            return (
              <div key={msg.id} className={`flex w-full mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-xs font-medium relative break-words whitespace-pre-wrap overflow-hidden ${
                    isMe 
                      ? 'bg-[#1A9E5C] text-white rounded-tr-none shadow-lg shadow-[#1A9E5C]/10' 
                      : 'bg-white/10 text-white border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.message}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[8px] font-black uppercase text-gray-500 opacity-60">
                       {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <ShieldCheck size={8} className="text-[#1A9E5C]" />}
                  </div>
                </div>
              </div>
            );
          })}
          {isOtherTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 border border-white/5">
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1 h-1 bg-gray-500 rounded-full" />
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 bg-gray-500 rounded-full" />
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 bg-gray-500 rounded-full" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-black/60 border-t border-white/10 space-y-4 backdrop-blur-md">
          <AnimatePresence>
            {(newMessage.length === 0 && !isSending && !isOtherTyping) && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="flex flex-wrap gap-2 mb-2"
              >
                {[
                  { label: "Pembukaan 🤝", text: "Hi kak, saya Agent aplikasi Terserah siap membantu." },
                  { label: "Menunggu ⏳", text: "Ok baik kak tunggu ya kami akan cek masalah nya." },
                  { label: "Akhiri ✅", text: "Oke kak apakah ada pertanyaan lagi? Sebelum kami akhiri percakapan ini." }
                ].map((tmpl, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setNewMessage(tmpl.text);
                      handleTyping();
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-gray-300 hover:text-[#1A9E5C] hover:border-[#1A9E5C]/50 hover:bg-[#1A9E5C]/10 transition-all flex items-center gap-2 shadow-sm"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={sendMessage} className="relative flex items-center">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Jawab pertanyaan user..."
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-6 pr-16 text-xs font-bold outline-none focus:border-[#1A9E5C]/50 transition-all text-white"
            />
            <button 
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className={`absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${newMessage.trim() ? 'bg-[#1A9E5C] text-white' : 'bg-white/5 text-gray-700'}`}
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white tracking-tighter">Support Center</h2>
        <MessageSquare size={24} className="text-[#1A9E5C]" />
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto no-scrollbar">
        {sessions.length > 0 ? sessions.map(s => (
          <div key={s.id} className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/10 border border-white/10 shrink-0">
                {s.profiles?.avatar_url ? <img src={s.profiles.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><UserIcon size={24} /></div>}
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-white text-base tracking-tight truncate">{s.profiles?.display_name || 'Anonymous User'}</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">{s.profiles?.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${s.status === 'waiting' ? 'bg-red-500 text-white animate-pulse' : s.status === 'active' ? 'bg-green-500/20 text-green-500' : s.status === 'declined' ? 'bg-red-500/10 text-red-300' : 'bg-white/10 text-gray-500'}`}>
                    {s.status}
                  </span>
                  <span className="text-[8px] text-gray-600 font-bold">{new Date(s.created_at).toLocaleTimeString()}</span>
                  {s.status === 'waiting' && (
                    <span className="text-[8px] text-yellow-300 font-black uppercase tracking-widest">{getSessionCountdown(s)} left</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {s.status === 'waiting' ? (
                <>
                  <button onClick={() => handleSession(s.id, 'active')} className="px-8 py-3.5 bg-[#1A9E5C] text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-[#1A9E5C]/10">Accept</button>
                  <button onClick={() => handleSession(s.id, 'declined')} className="px-6 py-3.5 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[10px] tracking-widest rounded-2xl">Decline</button>
                </>
              ) : s.status === 'active' ? (
                <button onClick={() => setActiveSession(s)} className="px-8 py-3.5 bg-[#1A9E5C] text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-[#1A9E5C]/20 transition-all hover:scale-105">Open Chat</button>
              ) : null}
              {(s.status === 'closed' || s.status === 'declined') && (
                <button onClick={() => deleteSession(s.id)} className="px-6 py-3.5 bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500/20">Hapus Riwayat</button>
              )}
            </div>
          </div>
        )) : (
          <div className="py-40 text-center opacity-20 space-y-4">
            <MessageSquare size={60} className="mx-auto" />
            <p className="font-black uppercase tracking-widest text-[10px]">No support sessions</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={confirmModal?.isOpen || false}
        title={confirmModal?.title || ''}
        message={confirmModal?.message || ''}
        isDanger={confirmModal?.isDanger}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        onCancel={() => setConfirmModal(null)}
      />

      <StatusModal 
        isOpen={statusModal?.isOpen || false}
        title={statusModal?.title || ''}
        message={statusModal?.message || ''}
        type={statusModal?.type || 'success'}
        onClose={() => setStatusModal(null)}
      />
    </motion.div>
  );
}
