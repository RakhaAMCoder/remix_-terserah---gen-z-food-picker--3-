import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  Bell, 
  Info, 
  Heart,
  ChevronRight,
  LogOut,
  Trash2,
  HelpCircle,
  Globe,
  Mail,
  Check,
  ShieldCheck,
  Store,
  UserX,
  User,
  Camera,
  Edit2,
  Loader2,
  LogIn,
  MessageCircle
} from 'lucide-react';
import { Food } from '../types';
import aboutLogo from './Logo/Terserah-LogoApp.png';
import { translations, Language } from '../translations';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Cropper from 'react-easy-crop';

export const AccountScreen: React.FC<{ onBack: () => void, darkMode: boolean, language: Language }> = ({ onBack, darkMode, language }) => {
  const t = translations[language];
  const { authUser, profile, updateProfile, loginWithGoogle, isAuthLoading, logout } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Synchronize state when profile loads
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || null);
    } else if (authUser) {
      setDisplayName(authUser.user_metadata?.full_name || '');
      setAvatarUrl(null); // Respect user request: do not auto-use Google avatar until set
    }
  }, [profile, authUser]);

  // Cropper State
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onCropComplete = (_area: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Foto terlalu besar (Max 5MB)");
      return;
    }
    
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropImage(reader.result as string);
    });
    reader.readAsDataURL(file);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleCropSave = async () => {
    if (!cropImage || !croppedAreaPixels || !authUser || !supabase) return;
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      const filePath = `${authUser.id}/profile_${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
          upsert: true,
          contentType: 'image/jpeg'
        });
      
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const finalUrl = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(finalUrl);
      setCropImage(null);
      
      // Auto save the avatar URL to profile as well
      await updateProfile({ avatar_url: finalUrl });
    } catch (err: any) {
      alert(`Gagal upload foto: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!authUser) return;
    setIsSaving(true);
    try {
      await updateProfile({
        display_name: displayName,
        username: username,
        avatar_url: avatarUrl
      });
      alert("Profil berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-black text-white' : 'bg-[#f0f2f5]'}`}>
      <div className={`px-6 pt-8 pb-6 shadow-sm border-b flex items-center gap-4 transition-colors sticky top-0 z-50 ${darkMode ? 'bg-black/50 backdrop-blur-xl border-white/5' : 'bg-white border-black/5'}`}>
        <button 
          onClick={onBack}
          className={`p-2.5 rounded-2xl transition-colors active:scale-90 ${darkMode ? 'bg-white/5 text-white' : 'bg-gray-100 text-[#1A1A2E]'}`}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className={`text-xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Profil Akun</h1>
      </div>

      <div className="p-6 space-y-8">
        {!authUser ? (
          <div className={`p-8 rounded-[48px] border text-center space-y-6 transition-colors ${darkMode ? 'bg-white/[0.03] backdrop-blur-3xl border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
            <div className="w-20 h-20 bg-[#1A9E5C]/10 rounded-[28px] flex items-center justify-center mx-auto text-[#1A9E5C]">
              <User size={40} />
            </div>
            <div className="space-y-2">
              <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Yuk, Masuk Dulu!</h3>
              <p className="text-sm text-gray-500 font-medium">Masuk untuk melihat profil dan history kulineranmu.</p>
            </div>
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn || isAuthLoading}
              className="w-full h-16 bg-[#1A9E5C] text-white rounded-3xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[12px] shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoggingIn || isAuthLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
              {isLoggingIn || isAuthLoading ? 'Memuat...' : 'Masuk dengan Google'}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className={`w-32 h-32 rounded-[40px] border flex items-center justify-center overflow-hidden shadow-2xl transition-colors ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      className="w-full h-full object-cover" 
                      alt="Avatar" 
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.avatar-fallback');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`avatar-fallback ${avatarUrl ? 'hidden' : ''}`}>
                    <User size={48} className="text-gray-500 opacity-40" />
                  </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#1A9E5C] rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-transform"
                >
                  <Camera size={20} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="space-y-1">
                <h3 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                  {displayName || 'User'}
                </h3>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest lowercase">
                  {authUser.email?.toLowerCase()}
                </p>
              </div>
            </div>

            <div className={`p-8 rounded-[48px] border space-y-6 transition-colors shadow-2xl ${darkMode ? 'bg-white/[0.03] backdrop-blur-3xl border-white/10' : 'bg-white/80 backdrop-blur-xl border-white/20 shadow-black/5'}`}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Nama Lengkap</label>
                  <input 
                    type="text" 
                    placeholder="Nama kamu"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full px-6 py-4 rounded-2xl font-bold outline-none border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white focus:border-[#1A9E5C]/50' : 'bg-white/50 border-white text-[#1A1A2E] focus:border-[#1A9E5C] shadow-sm'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Username</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                    <input 
                      type="text" 
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))}
                      className={`w-full pl-10 pr-6 py-4 rounded-2xl font-bold outline-none border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white focus:border-[#1A9E5C]/50' : 'bg-white/50 border-white text-[#1A1A2E] focus:border-[#1A9E5C] shadow-sm'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button 
                  onClick={handleSave}
                  disabled={isSaving || uploading}
                  className={`w-full h-16 rounded-[28px] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-[0_10px_30px_rgba(26,158,92,0.2)] active:scale-95 transition-all disabled:opacity-50 bg-[#1A9E5C] text-white`}
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>

                <button 
                  onClick={() => logout()}
                  className={`w-full h-16 rounded-[28px] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all border backdrop-blur-xl ${
                    darkMode 
                      ? 'bg-red-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.2)] border-red-500/20' 
                      : 'bg-red-500 text-white shadow-xl shadow-red-500/20 border-red-500/10'
                  }`}
                >
                  <LogOut size={18} />
                  Logout / Keluar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {cropImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col p-6"
          >
            <div className="relative flex-1 rounded-3xl overflow-hidden mt-10">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="py-8 space-y-4">
              <div className="px-4">
                <input 
                  type="range" 
                  min={1} 
                  max={3} 
                  step={0.1} 
                  value={zoom} 
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none accent-[#1A9E5C]"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setCropImage(null)}
                  className="flex-1 h-14 bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl"
                >
                  Batal
                </button>
                <button 
                  onClick={handleCropSave}
                  disabled={uploading}
                  className="flex-[2] h-14 bg-[#1A9E5C] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : 'Simpan Foto'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SettingsProps {
  onBack: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  favorites: string[];
  onNavigateToFavorites: () => void;
  onNavigateToReset: () => void;
}

export const AboutScreen: React.FC<{ onBack: () => void, darkMode: boolean, language: Language }> = ({ onBack, darkMode, language }) => {
  const t = translations[language];
  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-black text-white' : 'bg-[#f0f2f5]'}`}>
      <div className={`px-6 pt-8 pb-6 shadow-sm border-b flex items-center gap-4 transition-colors sticky top-0 z-50 ${darkMode ? 'bg-black/50 backdrop-blur-xl border-white/5' : 'bg-white border-black/5'}`}>
        <button 
          onClick={onBack}
          className={`p-2.5 rounded-2xl transition-colors active:scale-90 ${darkMode ? 'bg-white/5 text-white' : 'bg-gray-100 text-[#1A1A2E]'}`}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <h1 className={`text-xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.aboutApp}</h1>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-[#1A9E5C] rounded-[32px] overflow-hidden flex items-center justify-center shadow-2xl shadow-[#1A9E5C]/30 mx-auto border-4 border-white dark:border-white/10">
            <img 
              src={aboutLogo}
              alt="Terserah Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-1">
            <h2 className={`text-3xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Terserah App</h2>
            <p className="text-[10px] text-[#1A9E5C] font-black tracking-[0.3em] uppercase">Culinary Assistant</p>
          </div>
        </div>

        <div className={`p-8 rounded-[48px] border space-y-8 transition-colors ${darkMode ? 'bg-white/[0.03] backdrop-blur-3xl border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
          <div className="space-y-4">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[#1A9E5C] opacity-80">{t.aboutTitle}</h3>
            <p className={`text-sm leading-relaxed font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t.aboutDescription}
            </p>
          </div>

          <div className={`p-6 rounded-[32px] border transition-colors ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-black/5'}`}>
            <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-5 opacity-50 ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.features}</h3>
            <ul className="space-y-5">
              {[
                { title: t.feature1Title, desc: t.feature1Desc },
                { title: t.feature2Title, desc: t.feature2Desc },
                { title: t.feature3Title, desc: t.feature3Desc },
                { title: t.feature4Title, desc: t.feature4Desc },
                { title: t.shortFeed, desc: t.aboutFeedDescription, isNew: true }
              ].map((feature, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <span className="text-[#1A9E5C] font-black text-lg leading-none mt-1">•</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <p className={`text-[11px] font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{feature.title}</p>
                       {feature.isNew && <span className="bg-[#1A9E5C] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full tracking-widest">{t.newFeatureBadge}</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-8 border-t border-black/5 dark:border-white/5 text-center space-y-3">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{t.copyright}</p>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.1em] opacity-50">Crafted with ❤️ for Malang Foodies</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FAQScreen: React.FC<{ onBack: () => void, darkMode: boolean, language: Language }> = ({ onBack, darkMode, language }) => {
  const t = translations[language];
  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-black text-white' : 'bg-[#f0f2f5]'}`}>
      <div className={`px-6 pt-8 pb-6 shadow-sm border-b flex items-center gap-4 transition-colors sticky top-0 z-50 ${darkMode ? 'bg-black/50 backdrop-blur-xl border-white/5' : 'bg-white border-black/5'}`}>
        <button 
          onClick={onBack}
          className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-50 text-[#1A1A2E]'}`}
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.faq}</h1>
      </div>

      <div className="px-6 pt-8 pb-4">
         <div className="flex items-center justify-between mb-6">
            <h2 className={`text-sm font-black uppercase tracking-[0.2em] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.faqTitle}</h2>
         </div>
         
         <div className={`rounded-[32px] border overflow-hidden transition-all ${darkMode ? 'bg-white/[0.03] backdrop-blur-3xl border-white/10' : 'bg-white border-black/5'}`}>
          {(t.faqItems as any[]).map((item, idx) => (
            <div key={idx} className={`p-6 transition-all ${idx !== (t.faqItems as any[]).length - 1 ? (darkMode ? 'border-b border-white/5' : 'border-b border-black/5') : ''}`}>
              <div className="flex gap-4 items-start">
                <div className={`p-2 rounded-xl transition-colors shrink-0 ${darkMode ? 'bg-[#1A9E5C]/10 text-[#1A9E5C]' : 'bg-[#1A9E5C]/5 text-[#1A9E5C]'}`}>
                  <HelpCircle size={16} />
                </div>
                <div className="space-y-2">
                  <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{item.q}</h4>
                  <p className={`text-[11px] leading-relaxed font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pb-12">
          <div className={`p-6 rounded-[32px] border flex items-center justify-between transition-all ${darkMode ? 'bg-white/[0.03] backdrop-blur-3xl border-white/10' : 'bg-white border-black/5'}`}>
            <div className="flex gap-4 items-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-[#1A9E5C]/10 text-[#1A9E5C]' : 'bg-[#1A9E5C]/5 text-[#1A9E5C]'}`}>
                <MessageCircle size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className={`font-bold text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.contactTitle}</h4>
                <p className={`text-[11px] font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.contactSub}</p>
              </div>
            </div>
            <button 
              onClick={() => (window as any).navigateToSupport?.()}
              className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-50 text-[#1A1A2E] hover:bg-gray-100'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SettingsProps {
  onBack: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  favorites: string[];
  onNavigateToFavorites: () => void;
  onNavigateToReset: () => void;
  onNavigateToAbout: () => void;
  onNavigateToFAQ: () => void;
  onNavigateToMerchant: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToAccount: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  onBack, 
  darkMode, 
  onToggleDarkMode, 
  language,
  onLanguageChange,
  notificationsEnabled, 
  onToggleNotifications,
  favorites,
  onNavigateToFavorites,
  onNavigateToReset,
  onNavigateToAbout,
  onNavigateToFAQ,
  onNavigateToMerchant,
  onNavigateToAdmin,
  onNavigateToAccount
}) => {
  const t = translations[language];
  const { authUser, profile, logout, deleteAccount, isAuthLoading, loginWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (err) {
      alert("Gagal menghapus akun. Silahkan hubungi admin.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-black text-white' : 'bg-[#f0f2f5]'}`}>
      {/* Header */}
      <div className={`px-6 pt-10 pb-6 space-y-2 shadow-sm border-b transition-colors sticky top-0 z-50 ${darkMode ? 'bg-black/50 backdrop-blur-xl border-white/5' : 'bg-white border-black/5'}`}>
        <h1 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.settings}</h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{t.settingsSub}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Account Info Section / Login Prompt */}
        {!authUser ? (
          <div className={`p-6 rounded-[40px] border space-y-4 transition-colors ${darkMode ? 'bg-white/[0.05] border-white/10' : 'bg-white border-black/5 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-500/10 flex items-center justify-center text-gray-500">
                <User size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-sm">{t.feedLoginTitle}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.feedGuestName}</p>
              </div>
            </div>
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn || isAuthLoading}
              className="w-full h-14 bg-[#1A9E5C] text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoggingIn || isAuthLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {isLoggingIn || isAuthLoading ? 'Masuk...' : t.feedLoginButton}
            </button>
          </div>
        ) : (
          <button 
            onClick={onNavigateToAccount}
            className={`w-full p-6 rounded-[40px] border flex items-center gap-4 transition-all active:scale-95 ${darkMode ? 'bg-white/[0.05] border-white/10 hover:bg-white/[0.08]' : 'bg-white/70 backdrop-blur-xl border-white hover:border-[#1A9E5C]/30 shadow-sm hover:shadow-md'}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#1A9E5C]/10 border border-[#1A9E5C]/20 overflow-hidden flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.avatar-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`avatar-fallback ${profile?.avatar_url ? 'hidden' : ''}`}>
                <User size={24} className="text-[#1A9E5C] opacity-40" />
              </div>
            </div>
            <div className="flex-1 text-left min-w-0">
              <h3 className="font-black text-sm truncate">{profile?.display_name || authUser?.email || 'User'}</h3>
              <p className="text-[10px] text-[#1A9E5C] font-black uppercase tracking-widest">{profile?.role || 'Personal Account'}</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        )}

        <div className={`rounded-[40px] overflow-hidden border transition-colors ${darkMode ? 'bg-white/[0.03] backdrop-blur-3xl border-white/10 shadow-2xl' : 'bg-white/80 backdrop-blur-xl border-white shadow-xl'}`}>
          {/* Roles Link */}
          {profile?.role === 'merchant' && (
            <button 
              onClick={onNavigateToMerchant}
              className={`w-full p-6 flex items-center justify-between border-b transition-colors bg-[#1A9E5C]/5 hover:bg-[#1A9E5C]/10 ${darkMode ? 'border-white/5' : 'border-black/5'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl transition-colors bg-[#1A9E5C]/10 text-[#1A9E5C]`}>
                  <Store size={20} />
                </div>
                <div className="text-left">
                  <p className={`font-black uppercase tracking-tight text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Dashboard Toko</p>
                  <p className="text-[10px] text-gray-500 font-medium">Kelola menu dan lokasi jualanmu</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#1A9E5C]" />
            </button>
          )}

          {profile?.role === 'admin' && (
            <button 
              onClick={onNavigateToAdmin}
              className={`w-full p-6 flex items-center justify-between border-b transition-colors bg-red-500/5 hover:bg-red-500/10 ${darkMode ? 'border-white/5' : 'border-black/5'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl transition-colors bg-red-500/10 text-red-500`}>
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <p className={`font-black uppercase tracking-tight text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Admin Control</p>
                  <p className="text-[10px] text-gray-500 font-medium">Approval merchant, menu & laporan</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-red-500" />
            </button>
          )}
          {/* 1. Notifications */}
          <button 
            onClick={onToggleNotifications}
            className={`w-full p-6 flex items-center justify-between border-b transition-colors ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-colors ${darkMode ? 'bg-[#1A9E5C]/10 text-[#1A9E5C]' : 'bg-[#1A9E5C]/5 text-[#1A9E5C]'}`}>
                <Bell size={20} />
              </div>
              <div className="text-left">
                <p className={`font-black uppercase tracking-tight text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.notificationsApp}</p>
                <p className="text-[10px] text-gray-500 font-medium">{t.notificationsSub}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${notificationsEnabled ? 'bg-[#1A9E5C]' : (darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-200')}`}>
              <motion.div 
                animate={{ x: notificationsEnabled ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </div>
          </button>

          {/* 2. Dark Mode */}
          <button 
            onClick={onToggleDarkMode}
            className={`w-full p-6 flex items-center justify-between border-b transition-colors ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-colors ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-500'}`}>
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div className="text-left">
                <p className={`font-black uppercase tracking-tight text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{darkMode ? t.darkModeOn : t.darkModeOff}</p>
                <p className="text-[10px] text-gray-500 font-medium">{t.darkModeSub}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-[#1A9E5C]' : 'bg-gray-200'}`}>
              <motion.div 
                animate={{ x: darkMode ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </div>
          </button>

          {/* 3. Language Switch */}
          <div className={`p-6 flex items-center justify-between border-b ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-colors ${darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
                <Globe size={20} />
              </div>
              <div className="text-left">
                <p className={`font-black uppercase tracking-tight text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.language}</p>
                <p className="text-[10px] text-gray-500 font-medium">{t.languageSub}</p>
              </div>
            </div>
            <div className="flex p-1.5 bg-black/20 rounded-2xl gap-1 border border-white/5">
              <button 
                onClick={() => onLanguageChange('id')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${language === 'id' ? 'bg-[#1A9E5C] text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
              >
                ID
              </button>
              <button 
                onClick={() => onLanguageChange('en')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${language === 'en' ? 'bg-[#1A9E5C] text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
              >
                EN
              </button>
            </div>
          </div>

          {/* 4. Favorites */}
          <button 
            onClick={onNavigateToFavorites}
            className={`w-full p-6 flex items-center justify-between border-b transition-colors ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-colors ${darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
                <Heart size={20} />
              </div>
              <div className="text-left">
                <p className={`font-black uppercase tracking-tight text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.favorites}</p>
                <p className="text-[10px] text-gray-500 font-medium">{t.favoritesSub(favorites.length)}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-600" />
          </button>

          {/* 5. FAQ / Help */}
          <button 
            onClick={onNavigateToFAQ}
            className={`w-full p-6 flex items-center justify-between border-b transition-colors ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-colors ${darkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-500'}`}>
                <HelpCircle size={20} />
              </div>
              <div className="text-left">
                <p className={`font-black uppercase tracking-tight text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.faq}</p>
                <p className="text-[10px] text-gray-500 font-medium">{t.faqSub}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-600" />
          </button>

          {/* 6. Reset Data */}
          <button 
            onClick={onNavigateToReset}
            className={`w-full p-6 flex items-center justify-between border-b transition-colors ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-colors ${darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
                <Trash2 size={20} />
              </div>
              <div className="text-left">
                <p className={`font-black uppercase tracking-tight text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.resetData}</p>
                <p className="text-[10px] text-gray-500 font-medium">{t.resetDataSub}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-600" />
          </button>

          {/* 7. About Application */}
          <button 
            onClick={onNavigateToAbout}
            className={`w-full p-6 flex items-center justify-between transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl transition-colors ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                <Info size={20} />
              </div>
              <div className="text-left">
                <p className={`font-black uppercase tracking-tight text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.aboutApp}</p>
                <p className="text-[10px] text-gray-500 font-medium">{t.aboutAppSub}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-600" />
          </button>

          {/* Delete Account */}
          {authUser && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className={`w-full p-6 flex items-center justify-between transition-colors ${darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl transition-colors bg-red-500/10 text-red-500`}>
                  <UserX size={20} />
                </div>
                <div className="text-left">
                  <p className={`font-black uppercase tracking-tight text-xs text-red-500`}>Hapus Akun Permanen</p>
                  <p className="text-[10px] text-gray-500 font-medium">Hapus semua data kamu selamanya</p>
                </div>
              </div>
              <Trash2 size={20} className="text-red-500/40" />
            </button>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm shadow-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`w-full max-w-sm rounded-[40px] border p-8 space-y-6 overflow-hidden ${darkMode ? 'bg-[#121212] border-white/10' : 'bg-white border-black/5'}`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500">
                  <UserX size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className={`text-xl font-black uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                    ⚠️ PERINGATAN KERAS! ⚠️
                  </h2>
                  <div className={`text-[13px] leading-relaxed text-left space-y-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
                    <p>Menghapus akun akan melakukan hal berikut:</p>
                    <ol className="list-decimal pl-4 space-y-2">
                      <li>SEMUA video yang pernah Kakak upload akan dihapus permanen dari server.</li>
                      <li>Profil Kakak (nama, avatar) akan dihapus secara global.</li>
                      <li>Riwayat komentar dan daftar followers/following akan hilang.</li>
                      <li>Akun Kakak akan dikeluarkan secara paksa.</li>
                    </ol>
                    <p className="font-black text-red-500">Tindakan ini TIDAK BISA DIBATALKAN. Kakak yakin mau hapus akun?</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="w-full h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[12px] shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun Saya'}
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest text-[12px] active:scale-95 transition-all ${darkMode ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-[#1A1A2E]/50'}`}
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

