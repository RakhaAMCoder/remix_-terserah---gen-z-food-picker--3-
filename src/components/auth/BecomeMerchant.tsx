
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, ChevronLeft, ArrowRight, ShieldCheck, Zap, BarChart3, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface BecomeMerchantProps {
  onBack: () => void;
  onSuccess: () => void;
  darkMode?: boolean;
}

export default function BecomeMerchant({ onBack, onSuccess, darkMode = true }: BecomeMerchantProps) {
  const { authUser, profile, loginWithGoogle, isGuest, refreshProfile, safeLogout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleConflict, setRoleConflict] = useState<{ role: string } | null>(null);

  const handleBecomeMerchant = async () => {
    if (!profile || isGuest) {
      await loginWithGoogle();
      return;
    }

    // Role check if already logged in but NOT a merchant
    if (profile.role && profile.role !== 'merchant') {
      setRoleConflict({ role: profile.role });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error('Supabase not initialized');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'merchant', 
          onboarding_completed: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengubah akun menjadi merchant');
    } finally {
      setLoading(false);
    }
  };

  const handleGantiAkun = async () => {
    await safeLogout();
    setRoleConflict(null);
    // Use timeout to ensure state is cleared before triggering login
    setTimeout(() => {
      loginWithGoogle();
    }, 100);
  };

  const handleBatalkan = () => {
    setRoleConflict(null);
  };

  // Remove automatic role conflict trigger on mount
  // React.useEffect(() => { ... }) has been removed

  return (
    <div className={`fixed inset-0 z-[250] flex flex-col transition-colors duration-300 ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-[#1A1A2E]'}`}>
      <header className="p-6 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500">
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-black text-xl tracking-tighter uppercase">Merchant Account</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-12">
        <div className="max-w-md mx-auto space-y-12 pt-8">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-[#1A9E5C]/10 rounded-[40px] flex items-center justify-center mx-auto text-[#1A9E5C]">
              <Store size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tighter leading-none uppercase">
                Buka <span className="text-[#1A9E5C]">Toko Anda</span><br/>Sekarang
              </h3>
              <p className="text-sm text-gray-500 font-medium px-4">
                Bergabunglah dengan ribuan merchant lainnya untuk mempromosikan menu kuliner Anda kepada pecinta makanan di Malang.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <FeatureCard 
              icon={<ShieldCheck className="text-blue-500" />}
              title="Akses Dashboard Penjual"
              desc="Kelola semua menu dan promosi Anda dengan mudah dari satu tempat."
              darkMode={darkMode}
            />
            <FeatureCard 
              icon={<Zap className="text-yellow-500" />}
              title="Promosi Instan"
              desc="Muncul di dashboard pengguna dan pencarian secara otomatis."
              darkMode={darkMode}
            />
            <FeatureCard 
              icon={<BarChart3 className="text-[#1A9E5C]" />}
              title="Analitik Penjualan"
              desc="Lihat performa menu Anda dan ulasan dari pelanggan setia."
              darkMode={darkMode}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center italic">
              {error}
            </div>
          )}

          <div className="space-y-6 pt-6">
            {/* Role Warning directly above the button - Refined Wording */}
            <div className={`p-5 rounded-[28px] border border-dashed transition-all duration-500 ${darkMode ? 'bg-[#1A9E5C]/5 border-[#1A9E5C]/20' : 'bg-[#1A9E5C]/5 border-[#1A9E5C]/20'}`}>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A9E5C] text-center">Informasi Akun</span>
                <p className="text-[10px] text-gray-500 font-medium text-center leading-relaxed italic">
                  "Satu Email, Satu Role. Pastikan Anda menggunakan akun Google <span className="text-[#1A9E5C] font-bold text-[11px] not-italic underline">baru atau khusus</span> untuk Merchant. Jika email sudah terdaftar sebagai Pengguna biasa, akses Merchant akan ditolak demi keamanan data Toko Anda."
                </p>
              </div>
            </div>

            <button
              onClick={handleBecomeMerchant}
              disabled={loading}
              className="w-full h-20 bg-[#1A9E5C] text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_15px_40px_rgba(26,158,92,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : isGuest || !profile ? (
                <>
                  <LogIn size={20} />
                  Login Google untuk Lanjut
                </>
              ) : (
                <>
                  <Store size={20} />
                  Aktifkan Akun Merchant
                </>
              )}
            </button>
            <p className="text-[9px] text-center text-gray-500 font-medium px-6 leading-relaxed opacity-60">
              * Dengan mengaktifkan akun, Anda secara otomatis akan mendapatkan hak akses fitur Merchant Dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Role Conflict Modal */}
      <AnimatePresence>
        {roleConflict && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleBatalkan}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-sm rounded-[40px] border p-8 space-y-6 text-center ${
                darkMode ? 'bg-[#121212] border-white/10' : 'bg-white border-black/5'
              }`}
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-500">
                <Store size={40} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-xl font-black uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>Akun Sudah Terdaftar</h3>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                  Maaf, Partner! Email Google Anda saat ini sudah memiliki hak akses sebagai <span className="text-[#1A9E5C] font-black uppercase">"{roleConflict.role}"</span>.<br/><br/>
                  Karena sistem kami menggunakan <span className="text-white font-bold">Role Permanen</span> per akun, silakan gunakan akun Google lain yang masih kosong untuk membuka Dashboard Merchant Anda.
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <button 
                  onClick={handleGantiAkun}
                  className="w-full h-16 bg-[#1A9E5C] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg active:scale-95 transition-all"
                >
                  Ganti Akun Google
                </button>
                <button 
                  onClick={handleBatalkan}
                  className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all ${
                    darkMode ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'
                  }`}
                >
                  Batalkan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({ icon, title, desc, darkMode }: { icon: React.ReactNode, title: string, desc: string, darkMode: boolean }) {
  return (
    <div className={`p-6 rounded-[32px] border flex gap-5 items-start transition-all ${
      darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-sm'
    }`}>
      <div className={`p-3 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className={`text-sm font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}
