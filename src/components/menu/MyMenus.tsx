
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Package, Clock, CheckCircle2, AlertCircle, ChevronLeft, Bell, AlertTriangle, XCircle, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, FOOD_IMAGES_BUCKET } from '../../lib/supabase';
import { FoodMenu, MenuStatus, UserNotification } from '../../types/auth';
import MenuForm from './MenuForm';

export default function MyMenus({ onBack }: { onBack: () => void }) {
  const { authUser } = useAuth();
  const [menus, setMenus] = useState<FoodMenu[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMenu, setEditMenu] = useState<FoodMenu | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const filteredMenus = menus.filter(menu => {
    if (selectedCategory === 'Semua') return true;
    const catMatch = menu.category?.toLowerCase() === selectedCategory.toLowerCase();
    const tagMatch = menu.hashtags?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    const nameMatch = menu.name.toLowerCase().includes(selectedCategory.toLowerCase());
    return catMatch || tagMatch || nameMatch;
  });

  const fetchMenus = async () => {
    if (!authUser || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_menus')
        .select('*')
        .or(`submitted_by.eq.${authUser.id},seller_id.eq.${authUser.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMenus(data as FoodMenu[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!authUser || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotifications(data as UserNotification[]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchNotifications();

    if (!supabase || !authUser?.id) return;

    const channel = supabase.channel(`my_menus_${authUser.id}`)
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
  }, [authUser]);

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

  const handleDelete = (id: string, imagePath?: string) => {
    if (!supabase) return;
    if (!authUser?.id) {
      setStatusModal({
        isOpen: true,
        title: "Akses Ditolak",
        message: "Login dulu sebelum menghapus menu.",
        type: "error"
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Hapus Menu?",
      message: "Yakin ingin menghapus menu ini beserta fotonya dari sistem?",
      isDanger: true,
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: () => {
        setConfirmModal(null);
        executeDelete(id, imagePath);
      }
    });
  };

  const executeDelete = async (id: string, imagePath?: string) => {
    if (!supabase || !authUser?.id) return;

    try {
      // 1. Fetch menu first to check ownership and get paths
      const { data: menu, error: fetchError } = await supabase
        .from('food_menus')
        .select('*')
        .eq('id', id)
        .or(`submitted_by.eq.${authUser.id},seller_id.eq.${authUser.id}`)
        .single();

      if (fetchError || !menu) {
        console.error("Fetch menu error:", fetchError);
        throw new Error("Menu tidak ditemukan atau kamu tidak punya akses.");
      }

      console.log("Delete target menu id:", menu.id);

      // 2. Delete Storage image
      const pathToDelete = menu.image_path || (menu.image_url ? getStoragePathFromPublicUrl(menu.image_url) : null);
      console.log("Delete storage path:", pathToDelete);
      if (pathToDelete) {
        const { data: storageData, error: storageError } = await supabase.storage
          .from(FOOD_IMAGES_BUCKET)
          .remove([pathToDelete]);

        console.log("Storage delete result:", { data: storageData, error: storageError });

        if (storageError) {
          console.error("Gagal hapus gambar menu dari Storage:", storageError);
          throw new Error(`Gagal menghapus foto menu: ${storageError.message}`);
        }
      } else {
        console.log("No storage path found to delete.");
      }

      // 3. Delete related rows
      try {
        const notifResult = await supabase.from('user_notifications').delete().eq('menu_id', menu.id);
        console.log("Database notifications delete result:", notifResult);
      } catch (e) {
        console.warn("Table user_notifications not exist or delete failed:", e);
      }

      try {
        const reportsResult = await supabase.from('reports').delete().eq('target_id', menu.id);
        console.log("Database reports delete result:", reportsResult);
      } catch (e) {
        console.warn("Table reports not exist or delete failed:", e);
      }

      // 4. Delete from food_menus
      let isDeleted = false;
      try {
        const { data: deletedRows, error: deleteError } = await supabase
          .from('food_menus')
          .delete()
          .eq('id', menu.id)
          .or(`submitted_by.eq.${authUser.id},seller_id.eq.${authUser.id}`)
          .select('id');

        console.log("Database direct client-side delete result:", { data: deletedRows, error: deleteError });

        if (!deleteError && deletedRows && deletedRows.length > 0) {
          console.log("Client-side delete successful:", deletedRows);
          isDeleted = true;
          console.log("Deleted rows:", deletedRows);
        } else {
          console.warn("Client-side delete returned no rows or had error. Falling back to server-side delete.", deleteError);
        }
      } catch (clientErr) {
        console.warn("Client-side delete throw. Falling back to server-side delete.", clientErr);
      }

      // 5. Fallback server delete if client-side delete failed
      if (!isDeleted) {
        console.log("Running server-side delete fallback...");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Sesi tidak ditemukan. Silakan login kembali.");

        const response = await fetch('/api/menu/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ menuId: menu.id })
        });

        console.log("Server fallback delete response status:", response.status);
        const text = await response.text();
        console.log("Server fallback delete response body:", text);

        let result: any = {};
        if (text) {
          try {
            result = JSON.parse(text);
          } catch (e) {
            console.error("Invalid JSON response from server fallback delete:", text, e);
            throw new Error(`Respons server tidak valid (bukan JSON): ${text ? text.substring(0, 100) : 'empty'}`);
          }
        }

        if (!response.ok) {
          throw new Error(result.error || `Gagal menghapus menu di server (Status: ${response.status}).`);
        }
        console.log("Server fallback delete successful:", result);
      }

      setMenus(prev => prev.filter(item => item.id !== menu.id));
      setStatusModal({
        isOpen: true,
        title: "Berhasil",
        message: "Menu dan foto berhasil dihapus.",
        type: "success"
      });
      
      setTimeout(() => {
        fetchMenus();
      }, 500);
    } catch (err: any) {
      console.error("Delete menu merchant error:", err);
      setStatusModal({
        isOpen: true,
        title: "Gagal Menghapus",
        message: err.message || "Gagal menghapus menu.",
        type: "error"
      });
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      if (supabase) {
        await supabase.from('user_notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: MenuStatus) => {
    switch (status) {
      case 'approved': return <span className="bg-green-500/10 text-green-500 text-[8px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 size={10} /> Aktif</span>;
      case 'pending': return <span className="bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1"><Clock size={10} /> Pending</span>;
      case 'rejected': return <span className="bg-red-500/10 text-red-500 text-[8px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1"><AlertCircle size={10} /> Ditolak</span>;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 space-y-6">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="w-10 h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white">
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center relative transition-all ${unreadCount > 0 ? 'bg-[#1A9E5C]/20 border-[#1A9E5C]/30 text-[#1A9E5C]' : 'bg-white/5 border-white/10 text-white/40'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-black flex items-center justify-center text-white border-2 border-black">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tighter">Menu Saya</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Kelola menu makanan yang kamu upload</p>
        </div>
      </div>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-4 mb-6 space-y-4 max-h-64 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-40">Notifikasi</h4>
                <button onClick={() => setShowNotifications(false)} className="text-[10px] font-black text-[#1A9E5C] uppercase tracking-widest">Tutup</button>
              </div>
              {notifications.length > 0 ? (notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all ${n.is_read ? 'bg-transparent border-white/5 opacity-40' : 'bg-white/5 border-[#1A9E5C]/20 shadow-lg shadow-[#1A9E5C]/5'}`}
                >
                  <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{n.title}</h5>
                  <p className="text-gray-400 text-[10px] font-medium leading-relaxed">{n.message}</p>
                </div>
              ))) : (
                <p className="py-4 text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">Tidak ada notifikasi</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="px-6 grid grid-cols-3 gap-3">
        <StatCard label="Total" value={menus.length} icon={Package} />
        <StatCard label="Pending" value={menus.filter(m => m.status === 'pending').length} icon={Clock} color="text-yellow-500" />
        <StatCard label="Review" value={menus.filter(m => m.status === 'approved').length} icon={CheckCircle2} color="text-[#1A9E5C]" />
      </div>

      {/* Category Scroll Filter */}
      <div className="mt-8">
        <div className="px-6 mb-4 flex items-center justify-between">
          <h3 className="font-black text-white uppercase tracking-widest text-[10px] opacity-30">Unggulan Kamu</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
          {menus.filter(m => m.status === 'approved').slice(0, 5).map(menu => (
            <motion.div
              key={menu.id}
              whileTap={{ scale: 0.98 }}
              className="group w-[160px] flex-shrink-0 rounded-[24px] overflow-hidden bg-white/5 border border-white/10 p-3 space-y-3"
            >
              <div className="relative h-24 rounded-2xl overflow-hidden bg-white/5">
                {menu.image_url ? (
                  <img src={menu.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10">
                    <Package size={32} />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-[10px] text-white uppercase truncate tracking-tight">{menu.name}</h4>
                <p className="text-[9px] text-[#1A9E5C] font-black uppercase tracking-widest leading-none">
                  {menu.price ? `Rp ${menu.price.toLocaleString()}` : 'Harga Menyesuaikan'}
                </p>
              </div>
            </motion.div>
          ))}
          {menus.filter(m => m.status === 'approved').length === 0 && (
             <div className="w-full py-10 bg-white/5 border border-dashed border-white/10 rounded-[28px] flex flex-col items-center justify-center gap-2 px-10">
               <Package size={20} className="text-white/20" />
               <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 text-center">Menu yang sudah disetujui akan muncul di sini</p>
             </div>
          )}
        </div>
      </div>

      {/* Category Scroll Filter */}
      <div className="mt-8">
        <div className="px-6 mb-4 flex items-center justify-between">
          <h3 className="font-black text-white uppercase tracking-widest text-[10px] opacity-30">Filter Kategori</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
          {['Semua', 'Makanan', 'Minuman', 'Cemilan', 'Viral', 'Pedas', 'Halal', 'Legendaris'].map(cat => (
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

      {/* List */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-white uppercase tracking-widest text-[10px] opacity-30">Daftar Menu Kamu</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#1A9E5C] text-white px-5 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_10px_20px_rgba(26,158,92,0.2)] active:scale-95 transition-all"
          >
            <Plus size={14} /> Tambah Menu
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 opacity-20">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest">Memuat Menu...</p>
            </div>
          ) : filteredMenus.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredMenus.map((menu) => (
                <div key={menu.id} className="bg-white/5 border border-white/10 rounded-[32px] p-5 flex flex-col gap-4 transition-all hover:border-white/20">
                  <div className="flex gap-5">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/5 shrink-0 border border-white/5 shadow-2xl">
                      {menu.image_url ? (
                        <img src={menu.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10">
                          <Package size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-black text-white text-base tracking-tight truncate pr-2">{menu.name}</h4>
                          {getStatusBadge(menu.status)}
                        </div>
                        <p className="text-[#1A9E5C] font-black text-xs uppercase tracking-widest">
                          {menu.price ? `Rp ${menu.price.toLocaleString()}` : 'Harga Menyesuaikan'}
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">{menu.category}</div>
                          {menu.status === 'approved' && (
                            <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-md">
                              <Star size={10} className="text-yellow-500 fill-yellow-500" />
                              <span>{menu.rating !== undefined && menu.rating !== null ? Number(menu.rating).toFixed(1) : 'Belum Dinilai'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-2">
                        {menu.status === 'rejected' ? (
                          <button 
                            type="button"
                            onClick={() => setEditMenu(menu)}
                            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-[9px] font-black uppercase px-4 py-2 rounded-xl tracking-widest transition-all flex items-center gap-1.5"
                          >
                            <Edit2 size={12} /> Edit & Kirim Ulang
                          </button>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setEditMenu(menu)}
                            className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white/60 transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => handleDelete(menu.id, menu.image_path || undefined)}
                          className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {menu.status === 'rejected' && menu.rejection_reason && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-500 items-start">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Alasan Penolakan</p>
                        <p className="text-xs font-bold leading-relaxed">{menu.rejection_reason}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Package size={40} className="text-white/10" />
              </div>
              <div className="space-y-4 px-10">
                <div className="space-y-1">
                  <p className="text-white font-black tracking-tight">Belum ada menu</p>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Tambahkan menu pertamamu agar bisa direview admin</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#1A9E5C] text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#1A9E5C]/10"
                >
                  Mulai Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(showAddModal || editMenu) && (
          <MenuForm 
            menu={editMenu || undefined}
            onClose={() => {
              setShowAddModal(false);
              setEditMenu(null);
            }}
            onSuccess={() => {
              setShowAddModal(false);
              setEditMenu(null);
              fetchMenus();
            }}
          />
        )}
      </AnimatePresence>

      {/* Custom Status Modal */}
      <AnimatePresence>
        {statusModal && statusModal.isOpen && (
          <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-6 text-center"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${statusModal.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-[#1A9E5C]/10 text-[#1A9E5C]'}`}>
                {statusModal.type === 'error' ? <XCircle size={32} /> : <CheckCircle2 size={32} />}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{statusModal.title}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{statusModal.message}</p>
              </div>
              <button 
                onClick={() => setStatusModal(null)} 
                className={`w-full py-4 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 ${statusModal.type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1A9E5C] hover:bg-[#15804c]'}`}
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 w-full max-w-sm rounded-[40px] p-8 space-y-6 text-center"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${confirmModal.isDanger ? 'bg-red-500/10 text-red-500' : 'bg-[#1A9E5C]/10 text-[#1A9E5C]'}`}>
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{confirmModal.title}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{confirmModal.message}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setConfirmModal(null)} 
                  className="flex-1 py-4 text-gray-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                >
                  {confirmModal.cancelText || "Batal"}
                </button>
                <button 
                  onClick={confirmModal.onConfirm} 
                  className={`flex-1 py-4 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 ${confirmModal.isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1A9E5C] hover:bg-[#15804c]'}`}
                >
                  {confirmModal.confirmText || "Konfirmasi"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = "text-white" }: { label: string, value: number, icon: any, color?: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 space-y-2 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={12} className="text-gray-600" />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">{label}</span>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
