
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { translations, Language } from '../../translations';

interface AdminGateProps {
  onSuccess: () => void;
  onBack: () => void;
  darkMode?: boolean;
  language?: Language;
}

export default function AdminGate({ onSuccess, onBack, darkMode = true, language = 'id' }: AdminGateProps) {
  const { authUser, completeOnboarding } = useAuth();
  const t = translations[language];
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdminEmail = authUser?.email === 'thewaking5@gmail.com';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminEmail) {
      setError(language === 'id' ? "Akun ini tidak memiliki akses admin." : "This account does not have admin access.");
      return;
    }

    if (password === 'admin000222') {
      setLoading(true);
      try {
        await completeOnboarding({
          role: 'admin',
          display_name: 'Super Admin',
          onboarding_completed: true
        });
        onSuccess();
      } catch (err) {
        setError(language === 'id' ? "Gagal sistem. Coba lagi." : "System failure. Try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setError(language === 'id' ? "Password admin salah." : "Incorrect admin password.");
    }
  };

  if (!isAdminEmail) {
    return (
      <div className={`fixed inset-0 z-[100] p-6 flex flex-col items-center justify-center text-center transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-sm">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>{language === 'id' ? 'Akses Ditolak' : 'Access Denied'}</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              Email <b>{authUser?.email}</b> {language === 'id' ? 'tidak terdaftar sebagai administrator sistem.' : 'is not registered as a system administrator.'}
            </p>
          </div>
          <button 
            onClick={onBack}
            className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all ${
              darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/5 text-black shadow-sm'
            }`}
          >
            {language === 'id' ? 'Kembali Pilih Role' : 'Back to Role Selection'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] p-6 flex flex-col justify-center overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-auto space-y-10"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-500 rounded-[28px] flex items-center justify-center mx-auto shadow-xl shadow-red-500/20">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <div className="space-y-1">
            <h2 className={`text-2xl font-black tracking-tighter italic ${darkMode ? 'text-white' : 'text-black'}`}>ADMIN GATE<span className="text-red-500">.</span></h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{language === 'id' ? 'Verifikasi Akses Superuser' : 'Verify Superuser Access'}</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4 italic">Security Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className={`w-full border rounded-2xl px-6 py-4 font-bold outline-none transition-all ${
                    error ? 'border-red-500 bg-red-500/5' : (darkMode ? 'bg-white/5 border-white/10 text-white focus:border-red-500/50' : 'bg-white border-black/5 text-black focus:border-red-500/50 shadow-sm')
                  }`}
                  required
                />
                <Lock size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600" />
              </div>
              {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-4">{error}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-red-500 rounded-3xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-[12px] shadow-[0_0_30px_rgba(239,68,68,0.2)] active:scale-95 transition-all"
            >
              {loading ? (language === 'id' ? 'Verifikasi...' : 'Verifying...') : (language === 'id' ? 'Buka Dashboard' : 'Open Dashboard')}
              <ArrowRight size={20} />
            </button>
            <button 
              type="button"
              onClick={onBack}
              className={`w-full py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-gray-600 hover:text-white' : 'text-black/40 hover:text-black'}`}
            >
              {language === 'id' ? 'Kembali Pilih Role' : 'Back to Role Selection'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
