import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Sparkles, 
  MapPin, 
  Clock, 
  Bell, 
  ChevronRight, 
  Battery, 
  Zap, 
  Search, 
  Sun, 
  Moon, 
  LayoutGrid, 
  Dice5, 
  RotateCw, 
  Film, 
  Bot, 
  Store, 
  UtensilsCrossed,
  Star
} from 'lucide-react';
import { Food, BatteryData, Branch } from '../types';
import { foods } from '../data/foods';
import { translations, Language } from '../translations';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { customBanners } from '../data/banners';

interface DashboardProps {
  battery: BatteryData;
  onRandomClick?: () => void;
  onFoodClick: (food: Food) => void;
  onSeeAll: (type: 'recommended' | 'trending' | 'all') => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  darkMode: boolean;
  language: Language;
  isAppVisible: boolean;
}

const FoodCard = React.memo(({ food, onClick, darkMode, className }: { food: Food, onClick: () => void, darkMode: boolean, className?: string }) => {
  return (
    <div
      onClick={onClick}
      className={`group ${className || 'w-[150px] sm:w-[170px] flex-shrink-0'} rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border transform active:scale-98 will-change-transform ${
        darkMode 
          ? 'bg-neutral-900/90 border-white/5 shadow-2xl hover:bg-neutral-800' 
          : 'bg-white border-black/[0.03] shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)]'
      }`}
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="relative h-28 sm:h-32 overflow-hidden">
        <img 
          src={food.foto_url} 
          alt={food.nama} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>
      <div className="p-3 space-y-1 border-t border-transparent">
        <h4 className={`font-semibold text-[13px] sm:text-[14px] leading-tight line-clamp-1 ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{food.nama}</h4>

        <div className="flex items-center gap-1 overflow-hidden">
          <MapPin size={10} className="text-[#1A9E5C] opacity-90 flex-shrink-0" />
          <p className="text-[10px] text-gray-400 font-medium truncate">
            {food.cabang[0]?.nama || 'Pusat'}
          </p>
        </div>
      </div>
    </div>
  );
});

const LargeFoodCard = React.memo(({ food, onClick, darkMode }: { food: Food, onClick: () => void, darkMode: boolean }) => {
  return (
    <div
      onClick={onClick}
      className={`group w-[240px] sm:w-[280px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border transform active:scale-98 will-change-transform ${
        darkMode 
          ? 'bg-neutral-900/90 border-white/5 shadow-2xl hover:bg-neutral-800' 
          : 'bg-white border-black/[0.03] shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)]'
      }`}
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="relative h-36 sm:h-44 overflow-hidden">
        <img 
          src={food.foto_url} 
          alt={food.nama} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="bg-orange-500 text-white px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-xl">
            Popular
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h4 className={`font-semibold text-sm sm:text-base tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{food.nama}</h4>
          <p className="text-[11px] text-gray-400 line-clamp-1 leading-relaxed font-medium">{food.deskripsi}</p>
        </div>
        <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#1A9E5C] bg-[#1A9E5C]/10 px-2 py-1 rounded-lg">
              {food.jenis[0]}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium truncate max-w-[110px]">
            <MapPin size={11} className="text-[#1A9E5C] flex-shrink-0" />
            <span className="truncate">{food.cabang[0]?.nama || 'Pusat'}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

const FoodCardSkeleton = ({ darkMode, className }: { darkMode: boolean, className?: string, key?: any }) => {
  return (
    <div className={`animate-pulse ${className || 'w-[150px] sm:w-[170px] flex-shrink-0'} rounded-2xl overflow-hidden border ${
      darkMode ? 'bg-neutral-900 border-white/5' : 'bg-white border-black/[0.03] shadow-[0_4px_16px_rgba(0,0,0,0.02)]'
    }`}>
      <div className={`h-28 sm:h-32 ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
      <div className="p-3 space-y-2">
        <div className={`h-4 w-3/4 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
        <div className="flex items-center gap-1.5 pt-1">
          <div className={`h-2.5 w-2.5 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
          <div className={`h-3 w-1/2 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
        </div>
      </div>
    </div>
  );
};

const LargeFoodCardSkeleton = ({ darkMode }: { darkMode: boolean, key?: any }) => {
  return (
    <div className={`animate-pulse w-[240px] sm:w-[280px] flex-shrink-0 rounded-2xl overflow-hidden border ${
      darkMode ? 'bg-neutral-900 border-white/5' : 'bg-white border-black/[0.03] shadow-[0_4px_16px_rgba(0,0,0,0.02)]'
    }`}>
      <div className={`h-36 sm:h-44 ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className={`h-4 w-3/4 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
          <div className={`h-3 w-full rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className={`h-4.5 w-8 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
            <div className={`h-3.5 w-16 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard({ 
  battery, 
  onFoodClick,
  onSeeAll,
  notificationsEnabled,
  onToggleNotifications,
  darkMode,
  language,
  isAppVisible
}: DashboardProps) {
  const { profile, isGuest, logout } = useAuth();
  const [recommended, setRecommended] = useState<Food[]>([]);
  const [dbMenus, setDbMenus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bannerIndex, setBannerIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const t = translations[language];

  // Fetch Supabase Menus
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) setIsLoading(false);
    }, 350);

    const fetchMenus = async () => {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('food_menus')
          .select('id, name, image_url, description, category, hashtags, rating, locations, place_name, address, google_maps_url')
          .eq('status', 'approved')
          .order('rating', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (data && active) {
          // Map DB data to Food type
          const mappedData: Food[] = data.map(item => {
            let cabangList: Branch[] = [];
            if (Array.isArray(item.locations) && item.locations.length > 0) {
              cabangList = item.locations.map((loc: any) => ({
                nama: loc.place_name || item.place_name || 'Resto Baru',
                alamatLengkap: loc.address || item.address || '',
                namaPencarian: loc.place_name || item.place_name || item.name,
                google_maps_url: loc.google_maps_url || item.google_maps_url || '',
                jam_buka: loc.opening_hours || '09.00-21.00',
                lat: typeof loc.lat === 'number' ? loc.lat : -7.9666,
                lng: typeof loc.lng === 'number' ? loc.lng : 112.6326
              }));
            } else {
              cabangList = [{
                nama: item.place_name || 'Resto Baru',
                alamatLengkap: item.address || '',
                namaPencarian: item.place_name || item.name,
                google_maps_url: item.google_maps_url || '',
                jam_buka: '09.00-21.00',
                lat: -7.9666,
                lng: 112.6326
              }];
            }

            return {
              id: item.id,
              nama: item.name,
              foto_url: item.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
              deskripsi: item.description || '',
              jenis: [item.category || 'makanan'],
              cocok_waktu: ['siang', 'malam'],
              tags: item.hashtags || [],
              rating: item.rating !== undefined && item.rating !== null ? item.rating : null,
              trending: false,
              cabang: cabangList
            };
          });
          setDbMenus(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch menus:", err);
      } finally {
        if (active) {
          clearTimeout(timer);
          setIsLoading(false);
        }
      }
    };
    fetchMenus();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const allFoods = useMemo(() => {
    const combined = [...dbMenus, ...foods];
    const seen = new Set();
    return combined.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [dbMenus]);

  const getTimeCategory = (date: Date) => {
    const hours = date.getHours();
    if (hours >= 5 && hours < 11) return 'pagi';
    if (hours >= 11 && hours < 15) return 'siang';
    if (hours >= 15 && hours < 18) return 'sore';
    if (hours >= 18 && hours < 22) return 'malam';
    return 'tengah_malam';
  };

  const timeOfDay = getTimeCategory(currentTime);

  const bannerFoods = useMemo(() => {
    if (customBanners && customBanners.length > 0) {
      return customBanners.map(b => ({
        id: b.id,
        foto_url: b.image_url,
        nama: b.title || ''
      }));
    }
    return [];
  }, [allFoods, customBanners]);

  useEffect(() => {
    setBannerIndex(0);
  }, [bannerFoods.length]);

  const shouldSlide = bannerFoods.length > 1;

  const trending = useMemo(() => {
    const daySeed = currentTime.getDate() + currentTime.getMonth() * 31 + currentTime.getFullYear();
    const allTrending = allFoods.filter(f => f.trending);
    const shuffled = [...allTrending].sort((a, b) => {
      const hashA = (Number(a.id?.length || 0) * daySeed) % 100;
      const hashB = (Number(b.id?.length || 0) * daySeed) % 100;
      return hashA - hashB;
    });
    return shuffled.slice(0, 4);
  }, [currentTime.getDate(), allFoods]);

  useEffect(() => {
    if (!isAppVisible) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [isAppVisible]);

  useEffect(() => {
    if (!isAppVisible || !shouldSlide || isInteracting) return;
    const bannerTimer = setInterval(() => {
      setDirection(1);
      setBannerIndex(prev => (prev + 1) % bannerFoods.length);
    }, 5000);
    return () => clearInterval(bannerTimer);
  }, [bannerFoods.length, isAppVisible, shouldSlide, isInteracting]);

  useEffect(() => {
    const category = getTimeCategory(currentTime);
    const recs = allFoods.filter(f => f.cocok_waktu.includes(category))
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
    setRecommended(recs);
  }, [timeOfDay, allFoods]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const handleMerchantClick = () => {
    const appWindow = window as any;
    if (isGuest || !profile) {
      if (appWindow.navigateTo) appWindow.navigateTo('merchant_onboarding');
      return;
    }

    if (profile.role === 'merchant') {
      if (appWindow.navigateTo) appWindow.navigateTo('merchant_dashboard');
    } else {
      if (appWindow.navigateTo) appWindow.navigateTo('merchant_onboarding');
    }
  };

  const filteredFoods = useMemo(() => {
    if (!searchQuery) return allFoods.slice(0, 10);
    const q = searchQuery.toLowerCase();
    return allFoods.filter(f => 
      f.nama.toLowerCase().includes(q) || 
      f.deskripsi.toLowerCase().includes(q) ||
      f.jenis.some(j => j.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [searchQuery, allFoods]);

  const categories = [
    { title: 'Nasi', icon: '🍚', id: 'nasi', color: 'from-orange-500 to-red-500' },
    { title: 'Pedas', icon: '🌶️', id: 'pedas', color: 'from-red-600 to-rose-600' },
    { title: 'Mie', icon: '🍜', id: 'mie', color: 'from-yellow-500 to-orange-500' },
    { title: 'Minuman', icon: '🥤', id: 'minuman', color: 'from-blue-500 to-cyan-500' },
    { title: 'Cemilan', icon: '🍩', id: 'cemilan', color: 'from-pink-500 to-purple-500' },
    { title: 'Ayam', icon: '🍗', id: 'ayam', color: 'from-amber-600 to-orange-700' },
  ];

  const bannerVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      darkMode ? 'bg-[#050505] text-white' : 'bg-[#F8F9FF] text-[#1A1A2E]'
    }`}>
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] bg-[#1A9E5C]/5 rounded-full blur-[80px] pointer-events-none" />
      


      {/* Dynamic Hero Header - Full Width Banner Carousel */}
      <div className="relative group">
        <div className="w-full">
          <div className="h-[210px] w-full relative overflow-hidden shadow-2xl">
            {bannerFoods.length > 0 ? (
              <div className="h-full w-full">
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.8}
                  onDragStart={() => setIsInteracting(true)}
                  onDragEnd={(e, info) => {
                    setIsInteracting(false);
                    if (!shouldSlide) return;
                    const swipeThreshold = 50;
                    if (info.offset.x < -swipeThreshold) {
                      setDirection(1);
                      setBannerIndex((prev) => (prev + 1) % bannerFoods.length);
                    } else if (info.offset.x > swipeThreshold) {
                      setDirection(-1);
                      setBannerIndex((prev) => (prev - 1 + bannerFoods.length) % bannerFoods.length);
                    }
                  }}
                  animate={{ x: `-${bannerIndex * 100}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.8 }}
                  className="flex h-full w-full cursor-grab active:cursor-grabbing"
                >
                  {bannerFoods.map((banner, idx) => (
                    <div key={banner.id + idx} className="w-full h-full flex-shrink-0 relative">
                      <img 
                        src={banner.foto_url} 
                        alt={banner.nama} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ))}
                </motion.div>

                {shouldSlide && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {bannerFoods.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1 transition-all duration-500 rounded-full ${
                          idx === bannerIndex ? 'w-6 bg-[#1A9E5C]' : 'w-2 bg-white/40'
                        }`} 
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-700 ${
                darkMode 
                  ? 'from-[#1A1A1A] via-[#050505] to-[#050505]' 
                  : 'from-[#1A9E5C] via-[#128C4F] to-[#0D6B3C]'
              }`}>
                <div className={`absolute inset-0 opacity-10 pointer-events-none ${darkMode ? 'invert' : ''}`} style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Search Bar - Slightly overlapping */}
        <div className="px-6 -mt-5 relative z-30">
          <button 
            type="button"
            onClick={() => (window as any).navigateTo('search', { autofocus: true })}
            className={`w-full h-[54px] rounded-2xl flex items-center px-5 gap-3.5 shadow-lg border transition-all transform active:scale-98 will-change-transform ${
              darkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-black/5'
            }`}
          >
            <Search size={18} className="text-[#1A9E5C] flex-shrink-0" />
            <span className="text-gray-400 font-medium text-[13px] tracking-tight flex-1 text-left">Cari makanan favoritmu...</span>
          </button>
        </div>

      <div className="space-y-5 pb-32 pt-2">

        {/* Feature Shortcuts - Modern Category Icons */}
        <section className="relative">
          <div className="flex gap-1.5 overflow-x-auto px-4 py-2 no-scrollbar flex-nowrap scroll-smooth justify-center">
            <FeatureCard 
              icon={<UtensilsCrossed size={28} />} 
              imageSrc="/icons/icon_menu.png"
              label="Menu" 
              color="bg-orange-500" 
              darkMode={darkMode} 
              onClick={() => (window as any).navigateTo('menu_screen')} 
            />
            <FeatureCard 
              icon={<Store size={28} />} 
              imageSrc="/icons/icon_mercent.png"
              label="Merchant" 
              color="bg-purple-600" 
              darkMode={darkMode} 
              onClick={handleMerchantClick} 
            />
            <FeatureCard 
              icon={<Film size={28} />} 
              imageSrc="/icons/icon_feed.png"
              label="Feed" 
              color="bg-blue-500" 
              darkMode={darkMode} 
              onClick={() => (window as any).navigateTo('shortfeed')} 
            />
            <FeatureCard 
              icon={<RotateCw size={28} />} 
              imageSrc="/icons/icon_spin.png"
              label="Spinner" 
              color="bg-yellow-500" 
              darkMode={darkMode} 
              onClick={() => (window as any).navigateTo('spin')} 
            />
          </div>
        </section>
        {searchQuery ? (
          <section className="px-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`font-black text-xl tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Hasil Pencarian</h3>
              <p className="text-[10px] font-black uppercase text-[#1A9E5C] tracking-widest">{filteredFoods.length} Ditemukan</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <FoodCardSkeleton key={`sh-search-${idx}`} darkMode={darkMode} className="w-full" />
                ))
              ) : (
                filteredFoods.map((food, idx) => (
                  <FoodCard key={`${food.id}-${idx}`} food={food} onClick={() => onFoodClick(food)} darkMode={darkMode} />
                ))
              )}
            </div>
          </section>
        ) : (
          <>
            {/* Recommendations Section */}
            <section className="space-y-4">
              <div className="px-6 flex justify-between items-end">
                <div className="space-y-1">
                  <h3 className={`font-black text-[19px] tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                    Rekomendasi <span className="text-[#1A9E5C]">Kuliner</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium leading-normal">Pilihan kuliner paling pas untukmu.</p>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar px-6">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <FoodCardSkeleton key={`sh-rec-${idx}`} darkMode={darkMode} />
                  ))
                ) : (
                  recommended.map((food, idx) => (
                    <FoodCard key={`${food.id}-${idx}`} food={food} onClick={() => onFoodClick(food)} darkMode={darkMode} />
                  ))
                )}
              </div>
            </section>

            {/* Popular/Near Section */}
            <section className="space-y-4">
              <div className="px-6">
                <h3 className={`font-black text-[19px] tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                  Kuliner <span className="text-orange-500">Khas Malang</span>
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Warisan rasa asli Arema yang wajib dicoba</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar px-6">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <LargeFoodCardSkeleton key={`sh-khas-${idx}`} darkMode={darkMode} />
                  ))
                ) : (
                  allFoods.filter(f => f.tags.includes('khas-malang')).map((food, idx) => (
                    <LargeFoodCard key={`${food.id}-${idx}`} food={food} onClick={() => onFoodClick(food)} darkMode={darkMode} />
                  ))
                )}
              </div>
            </section>

            {/* Categories Section */}
            <section className="px-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={`font-black text-[19px] tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Kategori Pilihan</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 justify-between">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      (window as any).navigateTo('menu_screen', { category: cat.title });
                    }}
                    className="flex flex-col items-center gap-1 group min-w-[54px] transform active:scale-95 duration-200 transition-transform"
                  >
                    <div className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                      {cat.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-black'}`}>
                      {cat.title}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* All Menu Grid */}
            <section className="px-6 space-y-5">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className={`font-black text-[19px] tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>Eksplor Semua Menu</h3>
                  <p className="text-[11px] text-gray-400 font-medium leading-normal">Semua menu lezat dalam satu genggaman.</p>
                </div>
                <button 
                  onClick={() => (window as any).navigateTo('menu_screen')}
                  className="w-9 h-9 rounded-xl bg-[#1A9E5C]/10 flex items-center justify-center transition-all active:scale-95 duration-200 hover:bg-[#1A9E5C]/20"
                >
                  <LayoutGrid size={18} className="text-[#1A9E5C]" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <FoodCardSkeleton key={`sh-all-${idx}`} darkMode={darkMode} className="w-full" />
                  ))
                ) : (
                  allFoods.slice(0, 10).map((food, idx) => (
                    <FoodCard key={`${food.id}-${idx}`} food={food} onClick={() => onFoodClick(food)} darkMode={darkMode} className="w-full" />
                  ))
                )}
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => (window as any).navigateTo('menu_screen')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#1A9E5C] to-[#128C4F] text-white font-bold uppercase text-[12px] tracking-[0.1em] shadow-[0_8px_24px_rgba(26,158,92,0.15)] active:scale-98 transition-all"
                >
                  Lihat Semua Menu
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, label, color, onClick, darkMode, imageSrc }: { 
  icon: React.ReactNode, 
  label: string, 
  color: string, 
  onClick: () => void, 
  darkMode: boolean,
  imageSrc?: string 
}) {
  const [useImage, setUseImage] = React.useState(!!imageSrc);

  return (
    <button
      onClick={onClick}
      className="group flex-shrink-0 flex flex-col items-center gap-0 transition-transform duration-200 active:scale-95 pointer-events-auto transform will-change-transform"
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="w-[80px] h-[80px] flex items-center justify-center relative transform group-hover:scale-105 transition-all duration-300 z-10">
        {useImage ? (
          <img 
            src={imageSrc} 
            alt={label} 
            loading="lazy"
            className="w-[80px] h-[80px] object-contain transition-transform duration-200 group-hover:scale-110"
            onError={() => setUseImage(false)}
          />
        ) : (
          <div className={`${color} w-[80px] h-[80px] rounded-[22px] flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-200 shadow-md`}>
            {icon}
          </div>
        )}
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-[0.06em] text-center px-1 z-10 transition-colors duration-200 ${
        darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-black'
      }`}>
        {label}
      </span>
    </button>
  );
}

