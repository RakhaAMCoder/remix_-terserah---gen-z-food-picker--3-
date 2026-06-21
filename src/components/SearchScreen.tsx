import React, { useState, useEffect, useMemo } from 'react';
import { Search as SearchIcon, X, Filter, ChevronRight, MapPin, Star, Loader2 } from 'lucide-react';
import { foods } from '../data/foods';
import { Food, Branch } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../translations';
import { supabase } from '../lib/supabase';

interface SearchScreenProps {
  onFoodClick: (food: Food) => void;
  darkMode: boolean;
  language: Language;
  autoFocus?: boolean;
}

export default function SearchScreen({ onFoodClick, darkMode, language, autoFocus }: SearchScreenProps) {
  const [dbMenus, setDbMenus] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Semua"]);
  const [displayLimit, setDisplayLimit] = useState(10);
  const t = translations[language];
  const inputRef = React.useRef<HTMLInputElement>(null);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Reset display limit when query or filters change
  useEffect(() => {
    setDisplayLimit(10);
  }, [debouncedQuery, selectedFilters]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) setIsLoading(false);
    }, 350);

    const fetchMenus = async () => {
      try {
        if (!supabase) return;
        // Gunakan select hanya pada field yang dibutuhkan. Hindari select("*")
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
        console.error("Failed to fetch search menus:", err);
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

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  const categoryIds = React.useMemo(() => Object.keys(t.categories), [t.categories]);

  const allFoods = useMemo(() => {
    const combined = [...dbMenus, ...foods];
    const seen = new Set();
    return combined.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [dbMenus]);

  const filteredFoods = React.useMemo(() => allFoods.filter(f => {
    const matchesQuery = !debouncedQuery ? true : (
      f.nama.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      f.jenis.some(j => j.toLowerCase().includes(debouncedQuery.toLowerCase())) ||
      f.tags.some(t => t.toLowerCase().includes(debouncedQuery.toLowerCase()))
    );
    
    const matchesFilters = selectedFilters.includes("Semua") ||
                          selectedFilters.some(filter => 
                            f.jenis.some(j => j.toLowerCase() === filter.toLowerCase()) ||
                            f.tags.some(t => t.toLowerCase() === filter.toLowerCase())
                          );
    
    return matchesQuery && matchesFilters;
  }), [debouncedQuery, selectedFilters, allFoods]);

  const displayedFoods = React.useMemo(() => {
    return filteredFoods.slice(0, displayLimit);
  }, [filteredFoods, displayLimit]);

  // Set up intersection observer for infinite scroll / pagination trigger
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && filteredFoods.length > displayLimit) {
        setDisplayLimit(prev => prev + 12);
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
  }, [filteredFoods.length, displayLimit]);

  const toggleFilter = (filterId: string) => {
    if (filterId === "Semua") {
      setSelectedFilters(["Semua"]);
      return;
    }
    
    // Single selection: if clicked already active, go back to "Semua"
    if (selectedFilters.includes(filterId)) {
      setSelectedFilters(["Semua"]);
    } else {
      setSelectedFilters([filterId]);
    }
  };

  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-black text-white' : 'bg-[#f0f2f5]'}`}>
      {/* Search Header */}
      <div className={`px-6 pt-8 pb-6 space-y-5 shadow-sm border-b transition-colors ${darkMode ? 'bg-black border-white/5' : 'bg-white border-black/5'} sticky top-0 z-50`}>
        <h1 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.searchTitle}</h1>
        <div className="relative group">
          <SearchIcon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-gray-500 group-focus-within:text-[#1A9E5C]' : 'text-gray-400 group-focus-within:text-[#1A9E5C]'}`} size={18} />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full border rounded-full pl-11 pr-4 py-3.5 text-sm font-bold transition-all outline-none ${
              darkMode 
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#1A9E5C]/50 focus:bg-white/10' 
                : 'bg-white border-black/5 text-[#1A1A2E] placeholder-gray-400 focus:border-[#1A9E5C]/50 focus:shadow-lg'
            }`}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {categoryIds.map(catId => (
              <FilterChip 
                key={catId} 
                label={(t.categories as any)[catId]} 
                active={selectedFilters.includes(catId)} 
                onClick={() => toggleFilter(catId)} 
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <section className="px-6 py-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-gray-400 uppercase tracking-widest">
            {query || selectedFilters.length > 0 ? t.searchResults : t.searchRecommended}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-black/5 text-gray-400'}`}>
            {t.searchFound(filteredFoods.length)}
          </span>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <FoodItemRowSkeleton key={`sh-search-row-${index}`} darkMode={darkMode} />
              ))
            ) : displayedFoods.length > 0 ? (
              displayedFoods.map((food, index) => (
                <FoodItemRow
                  key={`${food.id}-${index}`}
                  food={food}
                  index={index}
                  darkMode={darkMode}
                  t={t}
                  onClick={() => onFoodClick(food)}
                />
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="text-6xl">😕</div>
                <div className="space-y-1">
                  <p className="font-bold text-gray-500">{t.searchNotFound}</p>
                  <p className="text-xs text-gray-400">{t.searchNotFoundSub}</p>
                </div>
                <button 
                  onClick={() => { setQuery(''); setSelectedFilters(['Semua']); }}
                  className="text-sm font-bold text-[#1A9E5C] underline"
                >
                  {t.searchReset}
                </button>
              </div>
            )}
          </AnimatePresence>

          {/* Observer handle for infinite scroll */}
          {filteredFoods.length > displayLimit && (
            <div ref={loadMoreRef} className="py-6 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#1A9E5C] opacity-60" size={24} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const FoodItemRow = React.memo(({ food, index, darkMode, t, onClick }: { 
  food: Food, 
  index: number, 
  darkMode: boolean, 
  t: any, 
  onClick: () => void 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        delay: Math.min(index * 0.03, 0.3), // Limit delay to avoid long waiting for many items
        duration: 0.2
      }}
      onClick={onClick}
      className={`p-4 rounded-[28px] flex gap-4 items-center border overflow-hidden isolate transform-gpu active:scale-[0.98] transition-all cursor-pointer group ${
        darkMode 
          ? 'bg-white/[0.03] backdrop-blur-md border-white/5 hover:bg-white/[0.06] hover:border-white/10 shadow-lg' 
          : 'bg-white border-black/5 hover:shadow-lg'
      }`}
    >
      <div className="relative shrink-0 overflow-hidden rounded-2xl">
        <img 
          src={food.foto_url} 
          loading="lazy"
          decoding="async"
          className="w-20 h-20 rounded-2xl object-cover transition-transform duration-500 group-hover:scale-105" 
        />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className={`font-black text-sm truncate tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{food.nama}</h4>

        <div className="flex items-center gap-2 opacity-50">
          <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            <MapPin size={10} />
            {t.searchBranch(food.cabang.length)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 pt-1 opacity-40">
          {food.tags.slice(0, 2).map((tag, i) => {
            const cleanTag = String(tag).replace(/^#+/, '');
            return (
              <span key={`${cleanTag}-${i}`} className="text-[8px] font-bold uppercase tracking-widest">#{cleanTag.toUpperCase()}</span>
            );
          })}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-600 transition-transform group-hover:translate-x-1" />
    </motion.div>
  );
});

function FilterChip({ label, active, onClick, darkMode }: { label: string, active: boolean, onClick: () => void, darkMode: boolean, key?: React.Key }) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
        active 
          ? 'bg-[#1A9E5C] text-white border-[#1A9E5C] shadow-lg shadow-[#1A9E5C]/30 scale-105' 
          : darkMode 
            ? 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-gray-300'
            : 'bg-white text-gray-400 border-black/5 hover:shadow-md'
      }`}
    >
      {label}
    </button>
  );
}

const FoodItemRowSkeleton = ({ darkMode }: { darkMode: boolean, key?: any }) => {
  return (
    <div className={`p-4 rounded-[28px] h-[114px] flex gap-4 items-center border overflow-hidden animate-pulse ${
      darkMode 
        ? 'bg-white/[0.03] border-white/5 shadow-lg' 
        : 'bg-white border-black/5'
    }`}>
      <div className={`w-20 h-20 rounded-2xl shrink-0 ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
      <div className="flex-1 min-w-0 space-y-2.5">
        <div className={`h-4.5 w-2/3 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
        <div className={`h-3.5 w-1/3 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
        <div className="flex gap-1 pt-1">
          <div className={`h-3 w-12 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
          <div className={`h-3 w-12 rounded ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
        </div>
      </div>
      <div className={`w-4 h-4 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-gray-200'}`} />
    </div>
  );
};
