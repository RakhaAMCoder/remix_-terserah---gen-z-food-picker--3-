
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, MapPin, Check, Image as ImageIcon, Plus, Trash2, Search, ExternalLink, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, FOOD_IMAGES_BUCKET } from '../../lib/supabase';
import { FoodMenu, MenuLocation } from '../../types/auth';

interface MenuFormProps {
  menu?: FoodMenu;
  onClose: () => void;
  onSuccess: () => void;
}

const HASHTAG_TEMPLATES = [
  'pedas', 'viral', 'hits', 'legendaris', 'halal', 'murah', 'premium', 'khas-malang', 'bakso', 'mie', 'nasi', 'segar'
];

export default function MenuForm({ menu, onClose, onSuccess }: MenuFormProps) {
  const { authUser } = useAuth();
  const [name, setName] = useState(menu?.name || '');
  const [description, setDescription] = useState(menu?.description || '');
  const [category, setCategory] = useState<'makanan' | 'minuman' | 'cemilan'>(menu?.category || 'makanan');
  const [price, setPrice] = useState(menu?.price?.toString() || '');
  const [hashtags, setHashtags] = useState<string>(menu?.hashtags?.join(' ') || '');
  const [showHashtagTemplates, setShowHashtagTemplates] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customAlert, setCustomAlert] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Helper parser for opening hours representation e.g. "08:00 - 22:00"
  const parseOpeningHours = (openingHours?: string) => {
    if (!openingHours) return { open: '08:00', close: '22:00' };
    const normalized = openingHours.replace(/\./g, ':');
    const parts = normalized.split('-');
    if (parts.length === 2) {
      let openStr = parts[0].trim();
      let closeStr = parts[1].trim();
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (/^\d:[0-5]\d$/.test(openStr)) openStr = '0' + openStr;
      if (/^\d:[0-5]\d$/.test(closeStr)) closeStr = '0' + closeStr;
      if (timeRegex.test(openStr) && timeRegex.test(closeStr)) {
        return { open: openStr, close: closeStr };
      }
    }
    return { open: '08:00', close: '22:00' };
  };

  // Initialize with one empty location if none exist with time properties parsed
  const [locations, setLocations] = useState<(MenuLocation & { open_time?: string; close_time?: string })[]>(() => {
    const rawLocs = (menu?.locations && menu.locations.length > 0)
      ? menu.locations 
      : [{ place_name: '', address: '', google_maps_url: '', lat: -7.9666, lng: 112.6326 }];
    
    return rawLocs.map(loc => {
      const parsed = parseOpeningHours(loc.opening_hours);
      return {
        ...loc,
        open_time: parsed.open,
        close_time: parsed.close
      };
    });
  });
  
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(menu?.image_url || '');

  // Revoke object URLs on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isFormDirty = () => {
    if (menu) {
      const initialHashtags = menu.hashtags?.join(' ') || '';
      const initialLocations = menu.locations || [];
      const isLocationsChanged = JSON.stringify(locations) !== JSON.stringify(initialLocations);
      const categoryChanged = category !== menu.category;
      return (
        name !== (menu.name || '') ||
        description !== (menu.description || '') ||
        categoryChanged ||
        price !== (menu.price?.toString() || '') ||
        hashtags !== initialHashtags ||
        selectedImageFile !== null ||
        isLocationsChanged
      );
    } else {
      return (
        name.trim() !== '' ||
        description.trim() !== '' ||
        category !== 'makanan' ||
        price.trim() !== '' ||
        hashtags.trim() !== '' ||
        selectedImageFile !== null ||
        locations.some(l => l.google_maps_url.trim() !== '')
      );
    }
  };

  const handleCloseAttempt = () => {
    if (isFormDirty()) {
      setShowCancelDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCancelDialog(false);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setName('');
    setDescription('');
    setPrice('');
    setHashtags('');
    setSelectedImageFile(null);
    setPreviewUrl('');
    onClose();
  };

  // AI Caption State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    detectedFood: string;
    confidence: number;
    caption: string;
    tags: string[];
  } | null>(null);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiNotes, setAiNotes] = useState('');

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateAiCaption = async () => {
    if (!selectedImageFile) {
      setCustomAlert({ message: "Pilih foto menu dulu ya agar AI bisa menganalisis!", type: 'error' });
      return;
    }

    setAiLoading(true);
    setAiResult(null);
    try {
      const base64Image = await fileToBase64(selectedImageFile);
      const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error("Format gambar tidak valid. Harus data URL base64.");
      }
      const mimeType = matches[1];
      const imageBase64 = matches[2];

      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: {
          imageBase64,
          mimeType,
          menuName: name,
          category,
          price: price ? parseFloat(price) : null,
          notes: aiNotes
        }
      });

      if (error) {
        throw new Error(error.message || "Gagal generate auto caption. Coba lagi nanti.");
      }

      if (!data) {
        throw new Error("Gagal memperoleh deskripsi dari asisten AI. Silakan coba kembali.");
      }

      if (data.success === false) {
        throw new Error(data.message || "Gagal membuat auto caption. Coba lagi nanti.");
      }

      setAiResult({
        detectedFood: data.detected_food || data.detectedFood || name || "Makanan Terdeteksi",
        confidence: data.confidence === "high" ? 0.9 : data.confidence === "medium" ? 0.6 : 0.3,
        caption: data.caption,
        tags: data.suggested_tags || data.tags || []
      });
      setShowAiPrompt(true);
    } catch (err: any) {
      console.error(err);
      setCustomAlert({ message: err.message || "Caption belum bisa dibuat, coba lagi nanti.", type: 'error' });
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiCaption = () => {
    if (!aiResult) return;
    setDescription(aiResult.caption);
    
    // Merge tags with existing hashtags
    const currentTags = hashtags.split(' ').filter(t => t.trim().length > 0);
    const newTags = aiResult.tags.map(t => t.startsWith('#') ? t : `#${t}`);
    const uniqueTags = Array.from(new Set([...currentTags, ...newTags]));
    setHashtags(uniqueTags.join(' '));
    
    setShowAiPrompt(false);
  };

  const toggleHashtag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    const currentTags = hashtags.split(' ').filter(t => t.trim().length > 0);
    
    if (currentTags.includes(cleanTag)) {
      setHashtags(currentTags.filter(t => t !== cleanTag).join(' '));
    } else {
      setHashtags([...currentTags, cleanTag].join(' '));
    }
  };

  const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi format file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setCustomAlert({ message: "Format foto tidak didukung! Gunakan format JPG, JPEG, PNG, atau WEBP.", type: 'error' });
        return;
      }
      
      // Validasi ukuran file (Max 3MB sebelum kompresi)
      const maxSizeBytes = 3 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setCustomAlert({ message: "Ukuran foto terlalu besar! Maksimal adalah 3MB.", type: 'error' });
        return;
      }

      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const addLocation = () => {
    setLocations([...locations, { place_name: '', address: '', google_maps_url: '', open_time: '08:00', close_time: '22:00' }]);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const updateLocation = (index: number, field: keyof MenuLocation | 'open_time' | 'close_time', value: string) => {
    const newLocations = [...locations];
    newLocations[index] = { ...newLocations[index], [field]: value } as any;
    setLocations(newLocations);
  };

  const searchOnGoogleMaps = (location: MenuLocation) => {
    const query = `${location.place_name} ${location.address || ""}`.trim();
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser?.id) {
      setCustomAlert({ message: "Login dulu sebelum upload menu.", type: 'error' });
      return;
    }
    
    if (!name.trim()) {
      setCustomAlert({ message: "Nama menu wajib diisi.", type: 'error' });
      return;
    }

    if (!selectedImageFile && !menu) {
      setCustomAlert({ message: "Wajib upload foto menu.", type: 'error' });
      return;
    }
    
    if (locations.length === 0 || !locations[0].google_maps_url) {
      setCustomAlert({ message: "Tambahkan minimal satu link lokasi cabang.", type: 'error' });
      return;
    }

    if (locations.some(l => !l.place_name?.trim())) {
      setCustomAlert({ message: "Masukkan nama tempat untuk semua lokasi.", type: 'error' });
      return;
    }

    if (locations.some(l => !l.google_maps_url?.trim())) {
      setCustomAlert({ message: "Masukkan link Google Maps lokasi menu.", type: 'error' });
      return;
    }

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const open = loc.open_time || '';
      const close = loc.close_time || '';
      if (!open || !close) {
        setCustomAlert({ message: `Waktu buka dan tutup cabang ke-${i + 1} wajib dipilih.`, type: 'error' });
        return;
      }
      if (close < open) {
        setCustomAlert({ message: `Jam tutup tidak boleh lebih kecil dari jam buka di cabang ke-${i + 1}.`, type: 'error' });
        return;
      }
    }

    const normalizeTag = (tag: string) => {
      return tag
        .trim()
        .replace(/^#+/, '')
        .replace(/\s+/g, '')
        .toLowerCase();
    };

    const hashtagArray = hashtags.split(' ')
      .map(normalizeTag)
      .filter(Boolean);

    if (hashtagArray.length === 0) {
      setCustomAlert({ message: "Wajib menambahkan minimal satu hashtag (Contoh: pedas)", type: 'error' });
      return;
    }

    setLoading(true);
    let uploadedFilePath: string | null = null;
    let uploadSuccess = false;

    try {
      if (!supabase) throw new Error("Supabase context missing");
      let imageUrl = menu?.image_url || null;
      let imagePath = menu?.image_path || null;

      // If a new image was selected, upload it
      if (selectedImageFile) {
        let uploadBlob: Blob | File = selectedImageFile;
        try {
          // Kompres gambar agar ukurannya kecil sebelum diupload
          uploadBlob = await compressImage(selectedImageFile, 800, 800, 0.7);
        } catch (compErr) {
          console.warn("Gagal kompresi, fallback file asli:", compErr);
        }

        const fileExt = selectedImageFile.name.split('.').pop() || 'jpg';
        const cleanExt = fileExt.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';

        const baseName = selectedImageFile.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 50);

        const filePath = `${authUser.id}/menus/${Date.now()}_${baseName}.${cleanExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(FOOD_IMAGES_BUCKET)
          .upload(filePath, uploadBlob, { upsert: true });

        if (uploadError) throw new Error(`Gagal mengupload foto: ${uploadError.message}`);

        uploadedFilePath = filePath;
        uploadSuccess = true;

        const { data: urlData } = supabase.storage
          .from(FOOD_IMAGES_BUCKET)
          .getPublicUrl(filePath);
        
        imageUrl = urlData.publicUrl;
        imagePath = filePath;
      }

      const menuData: any = {
        name,
        description,
        category,
        price: price ? parseFloat(price) : null,
        hashtags: hashtagArray,
        locations: locations.map(loc => {
          const open = loc.open_time || '08:00';
          const close = loc.close_time || '22:00';
          return {
            place_name: loc.place_name.trim(),
            address: (loc.address || '').trim(),
            google_maps_url: (loc.google_maps_url || '').trim(),
            opening_hours: `${open} - ${close}`
          };
        }),
        place_name: locations[0]?.place_name?.trim() || null,
        address: locations[0]?.address?.trim() || null,
        google_maps_url: locations[0]?.google_maps_url?.trim() || null,
        image_url: imageUrl,
        image_path: imagePath,
        submitted_by: authUser.id,
        status: 'pending', // Re-submissions/Edits are reset to pending for review
        rejection_reason: null, // Reset reject reason
        updated_at: new Date().toISOString()
      };

      let dbError: any = null;
      if (menu) {
        const { error } = await supabase.from('food_menus').update(menuData).eq('id', menu.id);
        dbError = error;
      } else {
        const { error } = await supabase.from('food_menus').insert({
          ...menuData,
          created_at: new Date().toISOString()
        });
        dbError = error;
      }

      if (dbError) {
        throw dbError; // Throw to trigger fallback cleanup of newly uploaded image
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      
      // Prevent orphan images by rolling back uploaded file
      if (uploadSuccess && uploadedFilePath) {
        try {
          await supabase.storage.from(FOOD_IMAGES_BUCKET).remove([uploadedFilePath]);
          console.log(`[Transaction Safety] Cleaned up newly uploaded file to prevent orphan images: ${uploadedFilePath}`);
        } catch (cleanupErr) {
          console.error("Critical: Gagal menghapus file orphan saat rollback:", cleanupErr);
        }
      }

      setCustomAlert({ message: err.message || "Gagal simpan menu. Pastikan input benar.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {customAlert && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm pointer-events-auto"
          >
            <div className={`w-full max-w-xs p-8 rounded-[40px] border shadow-2xl text-center space-y-6 ${
              customAlert.type === 'error' ? 'bg-[#121212] border-red-500/20 shadow-red-500/5' : 'bg-[#121212] border-[#1A9E5C]/20 shadow-[#1A9E5C]/5'
            }`}>
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl ${
                customAlert.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-[#1A9E5C]/10 text-[#1A9E5C]'
              }`}>
                {customAlert.type === 'error' ? '⚠️' : '✅'}
              </div>
              <div className="space-y-2">
                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-500">Pemberitahuan</h3>
                <p className="text-white font-bold leading-relaxed">{customAlert.message}</p>
              </div>
              <button 
                onClick={() => setCustomAlert(null)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-colors"
              >
                OKE SIAP
              </button>
            </div>
          </motion.div>
        )}

        {showCancelDialog && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md pointer-events-auto"
          >
            <div className="w-full max-w-sm p-8 rounded-[40px] border border-white/10 bg-[#121212] shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center text-4xl text-yellow-500">
                ⚠️
              </div>
              <div className="space-y-2">
                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-500">Konfirmasi Keluar</h3>
                <p className="text-white font-bold leading-relaxed">
                  Data yang kamu isi belum dikirim. Kalau keluar sekarang, data akan hilang. Yakin ingin keluar?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button"
                  onClick={handleConfirmClose}
                  className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-colors"
                >
                  KELUAR
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCancelDialog(false)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-colors"
                >
                  LANJUT EDIT
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex flex-col pt-12 pointer-events-auto"
      >
      <header className="px-6 pb-4 flex justify-between items-center bg-black">
        <div className="space-y-1">
          <h3 className="font-black text-white text-lg tracking-tighter">{menu ? 'Edit Menu' : 'Tambah Menu'}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A9E5C]">Akan Dikirim Ke Admin Untuk Review</p>
        </div>
        <button type="button" onClick={handleCloseAttempt} className="p-2 border border-white/10 rounded-xl text-white/40"><X size={20} /></button>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar pb-32">
        {/* Image Picker */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4 italic">Foto Menu</label>
          <div 
            onClick={() => document.getElementById('menu-image')?.click()}
            className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer"
          >
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20">
                <ImageIcon size={40} />
                <span className="text-[10px] font-black uppercase tracking-widest">Pilih Gambar</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-active:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={24} className="text-[#1A9E5C]" />
            </div>
          </div>
          <input id="menu-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4 italic">Nama Menu</label>
            <input 
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ayam Goreng Lalapan"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4 italic">Kategori</label>
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none flex justify-between items-center focus:border-[#1A9E5C]/50 transition-colors capitalize"
                >
                  {category}
                  <Plus size={14} className={`transition-transform duration-300 ${showCategoryDropdown ? 'rotate-45 text-[#1A9E5C]' : 'opacity-40'}`} />
                </button>

                <AnimatePresence>
                  {showCategoryDropdown && (
                    <>
                      <div className="fixed inset-0 z-[120]" onClick={() => setShowCategoryDropdown(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-[130] left-0 right-0 top-full mt-2 bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                      >
                        {(['makanan', 'minuman', 'cemilan'] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setCategory(cat);
                              setShowCategoryDropdown(false);
                            }}
                            className={`w-full px-6 py-4 text-left font-bold transition-colors capitalize ${
                              category === cat ? 'bg-[#1A9E5C] text-white' : 'text-white/60 hover:bg-white/5'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4 italic">Harga (Opsional)</label>
              <input 
                type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 15000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[#1A9E5C] font-black outline-none focus:border-[#1A9E5C]/50 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-8 pt-4">
            <div className="flex flex-col gap-1 ml-4 border-l-4 border-purple-500 pl-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-purple-500 italic">DESKRIPSI & HASHTAGS</label>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Caption menarik & hashtags bikin menu viral
              </p>
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Hashtags (Wajib)</label>
              {hashtags && (
                <button 
                  type="button" 
                  onClick={() => setHashtags('')} 
                  className="text-[8px] font-black uppercase tracking-widest text-red-500/60"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={hashtags} 
                onChange={(e) => {
                  setHashtags(e.target.value);
                  setShowHashtagTemplates(true);
                }}
                onFocus={() => setShowHashtagTemplates(true)}
                placeholder="#pedas #enak #viral"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#1A9E5C]/50 transition-colors"
                required
              />
              <AnimatePresence>
                {showHashtagTemplates && (
                  <>
                    <div className="fixed inset-0 z-[120]" onClick={() => setShowHashtagTemplates(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute z-[130] left-0 right-0 top-full mt-2 bg-[#121212] border border-white/10 rounded-3xl p-4 shadow-2xl space-y-3"
                    >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Pilih Template</span>
                      <button 
                        type="button" 
                        onClick={() => setShowHashtagTemplates(false)}
                        className="text-[8px] font-black uppercase tracking-widest text-[#1A9E5C]"
                      >
                        Selesai
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {HASHTAG_TEMPLATES.map(tag => {
                        const cleanTag = `#${tag}`;
                        const isActive = hashtags.includes(cleanTag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleHashtag(tag)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                              isActive 
                                ? 'bg-[#1A9E5C] text-white' 
                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-end items-center px-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={generateAiCaption}
                disabled={aiLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  aiLoading 
                    ? 'bg-white/5 text-white/20' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                }`}
              >
                {aiLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Bikin Caption...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Auto Caption AI
                  </>
                )}
              </motion.button>
            </div>

            <AnimatePresence>
              {showAiPrompt && aiResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`p-5 rounded-3xl border ${
                    aiResult.confidence > 0.6 ? 'bg-[#1A9E5C]/10 border-[#1A9E5C]/20' : 'bg-orange-500/10 border-orange-500/20'
                  } space-y-4`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">AI Mendeteksi:</p>
                        <h4 className="text-sm font-black uppercase tracking-tight">{aiResult.detectedFood}</h4>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                        aiResult.confidence > 0.6 ? 'bg-[#1A9E5C] text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {Math.round(aiResult.confidence * 100)}% Match
                      </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Saran Caption:</p>
                       <p className="text-xs font-medium leading-relaxed italic text-white/80">"{aiResult.caption}"</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={applyAiCaption}
                        className="flex-1 py-3 bg-[#1A9E5C] text-white text-[9px] font-black uppercase rounded-xl tracking-widest flex items-center justify-center gap-2"
                      >
                        <Check size={14} /> Pakai Caption
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAiPrompt(false)}
                        className="px-4 py-3 bg-white/5 text-white/60 text-[9px] font-black uppercase rounded-xl tracking-widest"
                      >
                        Edit Manual
                      </button>
                      <button
                        type="button"
                        onClick={generateAiCaption}
                        className="aspect-square w-11 flex items-center justify-center bg-white/5 text-white/40 rounded-xl"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsikan menu ini..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none h-24 resize-none focus:border-[#1A9E5C]/50 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4 italic">Catatan Rasa buat AI (Opsional)</label>
              <input 
                type="text" 
                value={aiNotes} 
                onChange={(e) => setAiNotes(e.target.value)}
                placeholder="Ex: pedas gila, sambal ijo, porsi besar"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-white/60 text-[11px] font-medium outline-none focus:border-purple-500/30 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
            <div className="flex flex-col gap-1 ml-4 border-l-4 border-[#1A9E5C] pl-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#1A9E5C] italic">Lokasi & Cabang</label>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Wajib masukan link Google Maps untuk verifikasi lokasi
              </p>
            </div>
            
            <div className="space-y-8">
              {locations.map((loc, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6 relative group transition-all hover:border-[#1A9E5C]/30 shadow-2xl">
                  <div className="space-y-5">
                    {/* Nama Tempat */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A9E5C] ml-4 italic">Nama Lokasi / Tempat (WAJIB)</label>
                      <input 
                        type="text" value={loc.place_name || ''} 
                        onChange={(e) => updateLocation(index, 'place_name', e.target.value)}
                        placeholder="Contoh: Soto Ayam Cak Mangun Cabang UMM"
                        className="w-full bg-transparent border-b-2 border-[#1A9E5C]/20 py-3 text-[#1A9E5C] font-black outline-none text-sm placeholder:text-[#1A9E5C]/10 focus:border-[#1A9E5C]"
                        required
                      />
                    </div>

                    {/* Alamat atau Detail Lokasi */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A9E5C] ml-4 italic">Detail Lokasi / Alamat</label>
                      <input 
                        type="text" value={loc.address || ''} 
                        onChange={(e) => updateLocation(index, 'address', e.target.value)}
                        placeholder="Contoh: Jl. Raya Tlogomas No. 12, Malang"
                        className="w-full bg-transparent border-b-2 border-[#1A9E5C]/20 py-3 text-[#1A9E5C] font-black outline-none text-sm placeholder:text-[#1A9E5C]/10 focus:border-[#1A9E5C]"
                      />
                    </div>

                    {/* Link Google Maps */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A9E5C] ml-4 italic">Link Google Maps (WAJIB)</label>
                      <div className="flex gap-3">
                        <input 
                          type="text" value={loc.google_maps_url || ''} 
                          onChange={(e) => updateLocation(index, 'google_maps_url', e.target.value)}
                          placeholder="https://maps.app.goo.gl/..."
                          className="flex-1 bg-transparent border-b-2 border-[#1A9E5C]/20 py-3 text-[#1A9E5C] font-black outline-none text-sm placeholder:text-[#1A9E5C]/10 focus:border-[#1A9E5C]"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const inputVal = loc.google_maps_url?.trim() || '';
                            if (inputVal.startsWith('http://') || inputVal.startsWith('https://')) {
                              window.open(inputVal, '_blank');
                            } else {
                              const query = `${loc.place_name || ""} ${loc.address || ""}`.trim() || name || "Alamat Restoran";
                              window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-3 bg-[#1A9E5C]/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-[#1A9E5C] active:scale-95 transition-all"
                        >
                          <Search size={14} /> Cari Link
                        </button>
                      </div>
                    </div>

                    {/* Jam Operasional */}
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A9E5C] ml-4 italic block">
                        Jam Operasional (Buka & Tutup)
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Jam Buka */}
                        <div className="space-y-1.5 bg-[#1A9E5C]/5 border border-[#1A9E5C]/10 rounded-[24px] p-4 flex flex-col justify-center transition-all focus-within:border-[#1A9E5C]/40">
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.15em] pl-1">Jam Buka</span>
                          <input 
                            type="time" 
                            value={loc.open_time || '08:00'} 
                            onChange={(e) => updateLocation(index, 'open_time', e.target.value)}
                            className="bg-transparent text-[#1A9E5C] font-black outline-none text-base w-full border-none cursor-pointer focus:ring-0 select-none py-0.5"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>

                        {/* Jam Tutup */}
                        <div className="space-y-1.5 bg-[#1A9E5C]/5 border border-[#1A9E5C]/10 rounded-[24px] p-4 flex flex-col justify-center transition-all focus-within:border-[#1A9E5C]/40">
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.15em] pl-1">Jam Tutup</span>
                          <input 
                            type="time" 
                            value={loc.close_time || '22:00'} 
                            onChange={(e) => updateLocation(index, 'close_time', e.target.value)}
                            className="bg-transparent text-[#1A9E5C] font-black outline-none text-base w-full border-none cursor-pointer focus:ring-0 select-none py-0.5"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    {locations.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setLocations(locations.filter((_, i) => i !== index))}
                        className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-2xl tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} /> Hapus Cabang
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              
              <button 
                type="button" 
                onClick={() => setLocations([...locations, { place_name: '', address: '', google_maps_url: '', lat: -7.9666, lng: 112.6326, open_time: '08:00', close_time: '22:00' }])}
                className="w-full py-8 border-2 border-dashed border-white/5 rounded-[40px] text-white/30 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-white/5 hover:border-[#1A9E5C]/20 hover:text-[#1A9E5C] transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#1A9E5C]/10 transition-all">
                  <Plus size={20} />
                </div>
                Tambah Cabang Lain
              </button>
            </div>
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full h-16 bg-[#1A9E5C] rounded-3xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-[12px] shadow-[0_0_40px_rgba(26,158,92,0.3)] active:scale-95 transition-all"
        >
          {loading ? 'Mengirim...' : 'UPLOAD'}
          <Check size={20} />
        </button>
      </form>
    </motion.div>
    </div>
  );
}
