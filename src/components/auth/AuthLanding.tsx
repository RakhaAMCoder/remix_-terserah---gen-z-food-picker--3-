
import React from 'react';
import { motion } from 'motion/react';
import { LogIn, User, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { translations, Language } from '../../translations';
import aboutLogo from '../Logo/Terserah-LogoApp.png';

interface AuthLandingProps {
  language?: Language;
  darkMode?: boolean;
}

export default function AuthLanding({ language = 'id', darkMode = true }: AuthLandingProps) {
  const { loginWithGoogle, continueAsGuest, isAuthLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const t = translations[language];

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Background Glows */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors ${darkMode ? 'bg-[#1A9E5C]/10' : 'bg-[#1A9E5C]/20'}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full transition-colors ${darkMode ? 'bg-[#1A9E5C]/5' : 'bg-[#1A9E5C]/10'}`} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-12 text-center"
      >
        <div className="space-y-4">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className={`w-24 h-24 bg-[#1A9E5C] rounded-[32px] mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(0,255,0,0.3)] relative group overflow-hidden border-4 ${darkMode ? 'border-white dark:border-white/10' : 'border-white shadow-xl'}`}
          >
            <div className={`absolute inset-0 bg-[#1A9E5C] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
            <img 
              src={aboutLogo}
              alt="Terserah Logo" 
              className="w-full h-full object-cover relative z-10"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="space-y-1">
            <h1 className={`text-4xl font-black tracking-tighter italic ${darkMode ? 'text-white' : 'text-black'}`}>
              {t.loginTitle}<span className="text-[#1A9E5C]">.</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">{t.loginSub}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoggingIn || isAuthLoading}
            className={`w-full h-16 rounded-3xl flex items-center justify-between px-8 group active:scale-95 transition-all shadow-xl disabled:opacity-50 ${darkMode ? 'bg-white shadow-white/5' : 'bg-white border-2 border-black/5'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
                {isLoggingIn || isAuthLoading ? (
                  <Loader2 size={20} className="text-[#1A9E5C] animate-spin" />
                ) : (
                  <LogIn size={20} className="text-[#1A9E5C]" />
                )}
              </div>
              <span className="font-black uppercase tracking-widest text-[12px] text-black">
                {isLoggingIn || isAuthLoading ? t.loginLoggingIn : t.loginGoogle}
              </span>
            </div>
            <ChevronRight size={20} className="text-black group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={continueAsGuest}
            disabled={isLoggingIn || isAuthLoading}
            className={`w-full h-16 border rounded-3xl flex items-center justify-between px-8 group active:scale-95 transition-all backdrop-blur-md ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                <User size={20} className={darkMode ? 'text-white/60' : 'text-black/60'} />
              </div>
              <span className={`font-black uppercase tracking-widest text-[12px] ${darkMode ? 'text-white/80' : 'text-black/80'}`}>{t.loginGuest}</span>
            </div>
            <ChevronRight size={20} className={`${darkMode ? 'text-white/40' : 'text-black/40'} group-hover:translate-x-1 transition-transform`} />
          </button>
        </div>

        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          Build for Malang Foodies 🏝️
        </p>
      </motion.div>
    </div>
  );
}
