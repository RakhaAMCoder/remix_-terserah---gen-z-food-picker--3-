
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ArrowRight, User, ChevronLeft, Loader2, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { translations, Language } from '../../translations';
import Cropper from 'react-easy-crop';

interface MerchantOnboardingProps {
  onSuccess: () => void;
  onBack?: () => void;
  language?: Language;
  darkMode?: boolean;
}

export default function MerchantOnboarding({ onSuccess, onBack, language = 'id', darkMode = true }: MerchantOnboardingProps) {
  const { authUser, completeOnboarding, safeLogout } = useAuth();
  const t = translations[language];
  
  const getInitialUsername = () => {
    const name = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || '';
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  };

  const initialUsername = getInitialUsername();
  const [displayName, setDisplayName] = useState(authUser?.user_metadata?.full_name || initialUsername);
  const [username, setUsername] = useState(initialUsername);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      safeLogout();
    }
  };

  // Cropper State
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = (_area: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert(t.onboardPhotoError);
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
    if (!cropImage || !croppedAreaPixels || !authUser) return;
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      const filePath = `${authUser.id}/onboarding_merchant_profile.jpg`;
      
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

      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
      setCropImage(null);
    } catch (err: any) {
      alert(`${t.onboardPhotoFail}: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      await completeOnboarding({
        display_name: displayName,
        username: username || undefined,
        role: 'merchant', // Set Role to Merchant
        avatar_url: avatarUrl
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      let message = t.onboardFail;
      if (err.code === '23505' || err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
        message = t.onboardUsernameTaken;
      } else if (err.message) {
        message = `Gagal: ${err.message}`;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className={`fixed inset-0 z-[100] p-6 flex flex-col justify-center ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-sm mx-auto p-8 rounded-[40px] border space-y-6 text-center ${
            darkMode ? 'bg-white/5 border-red-500/20' : 'bg-white border-black/5 shadow-2xl'
          }`}
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
            <Store size={32} />
          </div>
          <div className="space-y-2">
            <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-black'}`}>Gagal Daftar Merchant</h2>
            <p className="text-sm text-gray-500 font-medium">{error}</p>
          </div>
          <div className="space-y-3 pt-4">
            <button 
              onClick={() => { setError(null); handleSubmit({ preventDefault: () => {} } as any); }}
              className="w-full h-14 bg-[#1A9E5C] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg active:scale-95 transition-all"
            >
              Coba Lagi
            </button>
            <button 
              onClick={() => safeLogout()}
              className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all ${
                darkMode ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'
              }`}
            >
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] p-6 flex flex-col justify-center overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <button 
        onClick={handleBack}
        className={`absolute top-10 left-6 z-[110] p-3 transition-colors ${darkMode ? 'text-white/60 hover:text-[#1A9E5C]' : 'text-black/40 hover:text-[#1A9E5C]'}`}
      >
        <ChevronLeft size={28} />
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm mx-auto space-y-10"
      >
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className={`w-24 h-24 rounded-[32px] border flex items-center justify-center overflow-hidden ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
            }`}>
              {avatarUrl ? (
                <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <Store size={40} className={darkMode ? 'text-[#1A9E5C]/40' : 'text-[#1A9E5C]/20'} />
              )}
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#1A9E5C] rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-transform"
            >
              <Camera size={18} />
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
            <h2 className={`text-2xl font-black tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-black'}`}>Daftar Merchant</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Halo Partner, Lengkapi Branding Tokomu</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Nama Tampilan / Toko</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Warung Budi"
                className={`w-full border rounded-2xl px-6 py-4 font-bold outline-none focus:border-[#1A9E5C]/50 transition-colors ${
                  darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/5 text-black shadow-sm'
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Username Toko</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                    setUsername(val);
                  }}
                  placeholder="warungbudi"
                  className={`w-full border rounded-2xl pl-12 pr-6 py-4 font-bold outline-none focus:border-[#1A9E5C]/50 transition-colors ${
                    darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/5 text-black shadow-sm'
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || uploading}
            className="w-full h-16 bg-[#1A9E5C] rounded-3xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-[12px] shadow-[0_0_30px_rgba(26,158,92,0.3)] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Daftar Sekarang"}
            <ArrowRight size={20} />
          </button>
          
          <p className={`text-[9px] text-center font-medium italic opacity-60 px-4 leading-relaxed ${darkMode ? 'text-white' : 'text-black'}`}>
            "Dengan mendaftar sebagai merchant, Anda setuju untuk mematuhi kebijakan komunitas dan layanan Terserah."
          </p>
        </form>
      </motion.div>

      {/* Cropper Modal */}
      <AnimatePresence>
        {cropImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[200] flex flex-col p-6 ${darkMode ? 'bg-black' : 'bg-gray-50'}`}
          >
            <div className={`relative flex-1 rounded-3xl overflow-hidden mt-10 border ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
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
                  className={`flex-1 h-14 font-black uppercase tracking-widest text-[10px] rounded-2xl ${
                    darkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'
                  }`}
                >
                  Batal
                </button>
                <button 
                  onClick={handleCropSave}
                  disabled={uploading}
                  className="flex-[2] h-14 bg-[#1A9E5C] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : "Simpan Foto"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
