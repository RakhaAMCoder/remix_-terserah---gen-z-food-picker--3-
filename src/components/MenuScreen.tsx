import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  LayoutGrid, 
  Clock, 
  ChevronRight,
  Filter,
  Check,
  Star,
  Loader2
} from 'lucide-react';
import { Food, Branch } from '../types';
import { foods } from '../data/foods';
import { translations, Language } from '../translations';
import { supabase } from '../lib/supabase';

interface MenuScreenProps {
  onBack: () => void;
  onFoodClick: (food: Food) => void;
  darkMode: boolean;
  language: Language;
  initialCategory?: string;
}

export default function MenuScreen({ onBack, onFoodClick, darkMode, language, initialCategory }: MenuScreenProps) {
  const [dbMenus, setDbMenus] = React.useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(initialCategory || 'Semua');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(8);
  const t = translations[language];

  const filterRef = React.useRef<HTMLDivElement>(null);
  const filterButtonRef = React.useRef<HTMLButtonElement>(null);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isFilterOpen &&
        filterRef.current &&
        !filterRef.current.contains(target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(target)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, [isFilterOpen]);

  const filters = ['Semua', 'Makanan', 'Minuman', 'Snack'];

  React.useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) setIsLoading(false);
    }, 350);

    const fetchMenus = async () => {
      try {
        if (!supabase) return;
        const { data } = await supabase
          .from('food_menus')
          .select('id, name, image_url, description, category, hashtags, rating, locations, place_name, address, google_maps_url')
          .eq('status', 'approved')
          .order('rating', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(150);
        
        if (data && active) {
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
        console.error("Failed to fetch menus in MenuScreen:", err);
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

  // Reset display limit when filter changes
  React.useEffect(() => {
    setDisplayLimit(8);
  }, [activeFilter]);

  const allFoods = useMemo(() => {
    const combined = [...dbMenus, ...foods];
    const seen = new Set();
    const uniqueList = combined.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });

    if (activeFilter === 'Semua') return uniqueList;
    
    return uniqueList.filter(food => {
      const category = activeFilter.toLowerCase();
      // Simple mapping for categories
      if (category === 'makanan') return food.jenis.some(j => j.toLowerCase().includes('nasi') || j.toLowerCase().includes('ayam') || j.toLowerCase().includes('pedas') || j.toLowerCase().includes('mie') || j.toLowerCase().includes('makanan'));
      if (category === 'minuman') return food.jenis.some(j => j.toLowerCase().includes('minuman') || j.toLowerCase().includes('drink'));
      if (category === 'snack') return food.jenis.some(j => j.toLowerCase().includes('cemilan') || j.toLowerCase().includes('snack') || j.toLowerCase().includes('roti'));
      
      // If it's a specific category like 'nasi' passed from dashboard
      return food.jenis.some(j => j.toLowerCase().includes(category)) || food.tags.some(t => t.toLowerCase().includes(category));
    });
  }, [dbMenus, activeFilter]);

  const displayedFoods = useMemo(() => {
    return allFoods.slice(0, displayLimit);
  }, [allFoods, displayLimit]);

  // Set up intersection observer for infinite scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && allFoods.length > displayLimit) {
        setDisplayLimit(prev => prev + 8);
      }
    }, { threshold: 0.1 });

    const currentTarget = loadMoreRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [allFoods.length, displayLimit]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#F8F9FF] text-[#1A1A2E]'}`}>

      {/* Header */}
      <div className={`sticky top-0 z-[100] px-6 pt-10 pb-6 border-b backdrop-blur-xl ${
        darkMode ? 'bg-black/50 border-white/5' : 'bg-white/80 border-black/5'
      }`}>
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/5 text-[#1A1A2E] shadow-sm'
            }`}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-black uppercase tracking-tighter">Eksplor Menu</h1>
            <p className="text-[10px] text-[#1A9E5C] font-black uppercase tracking-widest leading-none">Semua Pilihan Lezat</p>
          </div>
          <div className="relative">
            <motion.button 
              ref={filterButtonRef}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors relative z-[160] ${
                isFilterOpen 
                  ? 'bg-[#1A9E5C] text-white shadow-lg' 
                  : darkMode ? 'bg-white/5 text-gray-400' : 'bg-[#1A9E5C]/10 text-[#1A9E5C]'
              }`}
            >
              <Filter size={18} />
            </motion.button>
 
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  ref={filterRef}
                  initial={{ opacity: 0, scale: 0.9, y: 10, x: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10, x: 10 }}
                  className={`absolute right-0 mt-3 w-48 rounded-[24px] shadow-2xl border overflow-hidden z-[170] ${
                    darkMode ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-black/5'
                  }`}
                >
                  <div className="p-2 space-y-1">
                    {filters.map(f => (
                      <button
                        key={f}
                        onClick={() => {
                          setActiveFilter(f);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeFilter === f
                            ? 'bg-[#1A9E5C] text-white'
                            : darkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-500'
                        }`}
                      >
                        {f}
                        {activeFilter === f && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <MenuListItemSkeleton key={`sh-menu-list-${index}`} darkMode={darkMode} />
            ))
          ) : (
            displayedFoods.map((food, index) => (
              <div
                key={`${food.id}-${index}`}
                onClick={() => onFoodClick(food)}
                className={`group rounded-[40px] overflow-hidden border transition-all duration-300 relative cursor-pointer transform active:scale-[0.99] will-change-transform ${
                  darkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.04)]'
                }`}
                style={{ transform: 'translateZ(0)' }}
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img 
                    src={food.foto_url} 
                    alt={food.nama} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  
                  <div className="absolute top-5 left-5 flex gap-2">
                  </div>

                  <div className="absolute bottom-5 left-6 right-6">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {food.tags.slice(0, 2).map((tag, idx) => {
                        const cleanTag = String(tag).replace(/^#+/, '');
                        return (
                          <span key={`${cleanTag}-${idx}`} className="px-3 py-1 bg-[#1A9E5C] text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                            #{cleanTag.toUpperCase()}
                          </span>
                        );
                      })}
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{food.nama}</h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-2">
                    {food.deskripsi}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1A9E5C]/10 flex items-center justify-center">
                        <MapPin size={18} className="text-[#1A9E5C]" />
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-gray-900'}`}>{food.cabang[0]?.nama}</p>
                        <p className="text-[9px] text-gray-500 font-bold max-w-[150px] truncate">{food.cabang[0]?.alamatLengkap}</p>
                      </div>
                    </div>
                    
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      darkMode ? 'bg-white/5 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-[#1A9E5C] group-hover:text-white'
                    }`}>
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load more observer for infinite scroll representation */}
        {allFoods.length > displayLimit && (
          <div ref={loadMoreRef} className="py-8 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#1A9E5C] opacity-65" size={24} />
          </div>
        )}
      </div>
    </div>
  );
}

const MenuListItemSkeleton = ({ darkMode }: { darkMode: boolean, key?: any }) => {
  return (
    <div className={`rounded-[40px] overflow-hidden border animate-pulse ${
      darkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-black/5 shadow-[0_20px_40px_rgba(0,0,0,0.04)]'
    }`}>
      <div className="h-56 w-full relative bg-neutral-800 dark:bg-neutral-800 flex items-end p-6">
        <div className="space-y-2 w-full">
          <div className="flex gap-2">
            <div className={`h-5 w-16 rounded-lg ${darkMode ? 'bg-neutral-700' : 'bg-gray-300'}`} />
            <div className={`h-5 w-16 rounded-lg ${darkMode ? 'bg-neutral-700' : 'bg-gray-300'}`} />
          </div>
          <div className={`h-8 w-1/2 rounded ${darkMode ? 'bg-neutral-700' : 'bg-gray-300'}`} />
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className={`h-4 w-full rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
          <div className={`h-4 w-3/4 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
            <div className="space-y-1.5">
              <div className={`h-3 w-28 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
              <div className={`h-2.5 w-36 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
            </div>
          </div>
          <div className={`w-10 h-10 rounded-2xl ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
        </div>
      </div>
    </div>
  );
};
