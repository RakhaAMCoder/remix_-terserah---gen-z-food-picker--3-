import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dice5, X, Sparkles, Star, RefreshCw, Target, Plus, Utensils, Coffee, ChevronRight, Filter } from 'lucide-react';
import { Food } from '../types';
import { foods } from '../data/foods';
import { StorageService } from '../services/storageService';
import { translations, Language } from '../translations';

interface RandomizerProps {
  onClose: () => void;
  onSelect: (food: Food) => void;
  onNavigateToSpin?: () => void;
  darkMode: boolean;
  language: Language;
}

export default function Randomizer({ onClose, onSelect, onNavigateToSpin, darkMode, language }: RandomizerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Food | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [spinWheelItems, setSpinWheelItems] = useState<string[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [filter, setFilter] = useState<'semua' | 'makanan' | 'minuman'>('semua');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const t = translations[language];

  useEffect(() => {
    const savedItems = StorageService.getSpinWheelItems();
    setSpinWheelItems(savedItems);
    return () => {
      if (spinIntervalRef.current) clearTimeout(spinIntervalRef.current);
    };
  }, []);

  const filteredFoods = foods.filter(food => {
    if (filter === 'semua') return true;
    if (filter === 'makanan') return food.jenis.includes('makanan');
    if (filter === 'minuman') return food.jenis.includes('minuman');
    return true;
  });

  const confirmAddToSpinWheel = () => {
    if (!result) return;
    
    if (spinWheelItems.includes(result.nama)) {
      setShowOptionsModal(false);
      return;
    }
    
    const newItems = [...spinWheelItems, result.nama];
    setSpinWheelItems(newItems);
    StorageService.saveSpinWheelItems(newItems);
    setShowAddPopup(true);
    setTimeout(() => setShowAddPopup(false), 2000);
    setShowOptionsModal(false);
  };

  const startSpinning = () => {
    setHasStarted(true);
    spin();
  };

  const spin = () => {
    if (filteredFoods.length === 0) return;
    
    setIsSpinning(true);
    const previousId = result?.id;
    setResult(null);
    
    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    
    const shuffle = (array: Food[]) => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    let iterations = 0;
    const maxIterations = 14; 
    let speed = 90; 
    
    const runSpin = () => {
      const tempIndex = Math.floor(Math.random() * filteredFoods.length);
      const randomFood = filteredFoods[tempIndex];
      setResult(randomFood);
      
      iterations++;
      
      if (iterations < maxIterations) {
        if (iterations > maxIterations * 0.7) {
          speed += 50;
        }
        spinIntervalRef.current = setTimeout(runSpin, speed);
      } else {
        const finalPool = shuffle(filteredFoods);
        let candidates = finalPool.filter(f => f.id !== previousId);
        if (candidates.length === 0) candidates = finalPool;
        
        const finalResult = candidates[Math.floor(Math.random() * candidates.length)];
        setResult(finalResult);
        setIsSpinning(false);
        spinIntervalRef.current = null;
      }
    };

    runSpin();
  };

  const filterLabels: Record<typeof filter, string> = {
    semua: t.filterSemua,
    makanan: t.filterMakanan,
    minuman: t.filterMinuman
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden ${darkMode ? 'bg-black' : 'bg-[#1A9E5C]'}`}>
      {/* Background Animated Blobs - Simplified for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-yellow-400/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>

      <AnimatePresence>
        {showAddPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-12 z-[200] px-6 py-4 rounded-[28px] font-bold shadow-2xl flex items-center gap-3 border backdrop-blur-2xl ${
              darkMode ? 'bg-black/60 border-white/10 text-[#1A9E5C]' : 'bg-white border-black/5 text-[#1A9E5C]'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-[#1A9E5C]/10 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <span className="text-sm">{t.randomSuccessAdd}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-12 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all z-[105] border border-white/10"
      >
        <X size={20} />
      </motion.button>

      {/* Filter UI */}
      <div className="absolute top-12 left-6 z-[110]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className={`p-3 rounded-2xl text-white hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center backdrop-blur-md ${showFilterMenu ? 'bg-white/20' : 'bg-white/10'}`}
        >
          <Filter size={18} />
        </motion.button>

        <AnimatePresence>
          {showFilterMenu && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilterMenu(false)}
                className="fixed inset-0 z-[-1]"
              />
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, y: 15, scale: 0.9, x: -10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`absolute top-full left-0 mt-4 w-64 rounded-[32px] shadow-2xl overflow-hidden p-2 backdrop-blur-3xl border ${
                  darkMode ? 'bg-black/80 border-white/10' : 'bg-white/95 border-black/5'
                }`}
              >
                <div className="px-4 py-3 mb-1">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>PILIH KATEGORI</p>
                </div>
                {(['semua', 'makanan', 'minuman'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setResult(null);
                      setHasStarted(false);
                      setIsSpinning(false);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full px-4 py-3.5 rounded-2xl text-left text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between group ${
                      filter === f 
                        ? (darkMode ? 'bg-[#1A9E5C]/20 text-[#1A9E5C]' : 'bg-[#1A9E5C]/10 text-[#1A9E5C]')
                        : darkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {f === 'semua' && <Plus size={16} className="opacity-70" />}
                      {f === 'makanan' && <Utensils size={16} className="opacity-70" />}
                      {f === 'minuman' && <Coffee size={16} className="opacity-70" />}
                      {filterLabels[f]}
                    </span>
                    {filter === f && (
                      <motion.div 
                        layoutId="activeFilter"
                        className="w-1.5 h-1.5 rounded-full bg-[#1A9E5C]" 
                      />
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showOptionsModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-black/70 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`w-full max-w-sm rounded-[48px] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden ${
                darkMode ? 'bg-[#0A0A0A] border border-white/10' : 'bg-white'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-[#1A9E5C] to-yellow-400"></div>
              
              <div className="text-center space-y-4 mb-8">
                <motion.div 
                  initial={{ rotate: -20, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className={`w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto ${
                    darkMode ? 'bg-white/5 text-[#1A9E5C]' : 'bg-[#1A9E5C]/10 text-[#1A9E5C]'
                  }`}
                >
                  <Target size={40} />
                </motion.div>
                <div className="space-y-1">
                  <h3 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.spinTitle}</h3>
                  <p className="text-sm text-gray-500 font-medium px-4">{t.randomActionTitle}</p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmAddToSpinWheel}
                  className="w-full py-5 bg-[#1A9E5C] text-white rounded-[24px] font-black text-base shadow-xl shadow-[#1A9E5C]/25 transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={20} strokeWidth={3} />
                  {t.randomAddToSpin}
                </motion.button>
                
                <motion.button
                  disabled={spinWheelItems.length < 2}
                  whileHover={spinWheelItems.length >= 2 ? { scale: 1.02 } : {}}
                  whileTap={spinWheelItems.length >= 2 ? { scale: 0.98 } : {}}
                  onClick={onNavigateToSpin}
                  className={`w-full py-5 rounded-[24px] font-black text-base shadow-xl transition-all flex items-center justify-center gap-3 ${
                    spinWheelItems.length >= 2 
                      ? 'bg-yellow-400 text-[#1A9E5C] shadow-yellow-400/25' 
                      : darkMode ? 'bg-white/5 text-gray-700 cursor-not-allowed shadow-none' : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                  }`}
                >
                  <RefreshCw size={20} strokeWidth={3} />
                  {t.randomSpinNow(spinWheelItems.length)}
                </motion.button>

                <button
                  onClick={() => setShowOptionsModal(false)}
                  className="w-full py-4 text-gray-500 font-bold text-sm tracking-wide"
                >
                  {t.randomClose}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-10 w-full max-w-sm px-6 z-10 flex flex-col items-center justify-center min-h-[90vh]">
        <header className="space-y-3">
          <motion.div
            layoutId="dice-icon"
            animate={isSpinning ? { 
              rotate: 360,
              scale: 1.1,
              opacity: 1
            } : { 
              rotate: 0,
              scale: 1,
              opacity: 1
            }}
            transition={{ 
              rotate: isSpinning ? { repeat: Infinity, duration: 0.3, ease: "linear" } : { type: "spring", damping: 15, stiffness: 300 },
              scale: isSpinning ? { repeat: Infinity, duration: 0.3, ease: "easeInOut", repeatType: "reverse" } : { type: "spring", damping: 15, stiffness: 300 },
              opacity: { duration: 0.2 }
            }}
            className={`inline-flex p-4 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.3)] ${
              darkMode ? 'bg-[#121212] border border-white/10' : 'bg-white'
            }`}
          >
            <Dice5 size={34} className="text-[#1A9E5C]" strokeWidth={2.5} />
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tight leading-none">{t.randomAjaDeh}</h2>
            <p className="text-white/60 text-sm font-bold italic tracking-wide">{t.randomAIPick}</p>
          </div>
        </header>

        <div className="relative h-72 w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!hasStarted ? (
              <motion.div
                key="start-screen"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="text-center space-y-8 group w-full"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border-2 border-white/10 transition-transform duration-500 group-hover:scale-105">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                      <Dice5 size={40} className="text-white/20" />
                    </div>
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20 blur-2xl rounded-full z-[-1]"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startSpinning}
                  className={`px-12 py-4.5 rounded-[28px] font-black text-lg shadow-2xl transition-all ${
                    darkMode ? 'bg-[#1A9E5C] text-white' : 'bg-white text-[#1A9E5C]'
                  }`}
                >
                  {t.randomStartSearch}
                </motion.button>
              </motion.div>
            ) : (
              <div className="w-full">
                <AnimatePresence mode="popLayout">
                  {result && (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, scale: 0.85, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: -50 }}
                      transition={{ 
                        type: "spring", 
                        damping: 22, 
                        stiffness: 140
                      }}
                      style={{ willChange: 'transform, opacity' }}
                      className={`relative rounded-[32px] p-4 w-full max-w-[280px] mx-auto shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] space-y-3 border overflow-hidden ${
                        darkMode ? 'bg-[#121212]/90 backdrop-blur-3xl border-white/10' : 'bg-white border-black/5'
                      }`}
                    >
                      <motion.div 
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden rounded-[24px] group"
                      >
                        {isSpinning ? (
                          <div className={`w-full h-32 flex items-center justify-center transition-colors duration-200 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                            <motion.div
                              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                            >
                              <Dice5 size={48} className="text-[#1A9E5C]" strokeWidth={2} />
                            </motion.div>
                          </div>
                        ) : (
                          <img 
                            src={result.foto_url} 
                            className="w-full h-32 object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt={result.nama} 
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </motion.div>
                      
                      <div className="text-center space-y-1">
                        <motion.h3 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className={`font-black text-lg leading-tight tracking-tight uppercase ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}
                        >
                          {result.nama}
                        </motion.h3>
                        
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center justify-center gap-1"
                        >
                          <Star size={14} fill="#EAB308" className="text-yellow-500" />
                          <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{result.rating}</span>
                        </motion.div>
                      </div>

                      {/* Sparkle background elements for the winner */}
                      {!isSpinning && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.8], x: [-20, -40], y: [-20, -50] }}
                            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
                            className="absolute top-1/2 left-10 text-yellow-400"
                          >
                            <Sparkles size={20} fill="currentColor" />
                          </motion.div>
                          <motion.div 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.7], x: [20, 45], y: [10, -20] }}
                            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.3 }}
                            className="absolute bottom-1/4 right-8 text-[#1A9E5C]"
                          >
                            <Sparkles size={16} fill="currentColor" />
                          </motion.div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col justify-center w-full">
          <AnimatePresence>
            {!isSpinning && result && hasStarted && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25 }}
                className="space-y-6 w-full"
              >
                <div className="flex gap-3 items-center w-full">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(result)}
                    className={`flex-[4] py-4.5 rounded-[24px] font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 ${
                      darkMode ? 'bg-[#1A9E5C] text-white' : 'bg-white text-[#1A9E5C]'
                    }`}
                  >
                    <Sparkles size={20} fill="currentColor" className={darkMode ? 'text-white' : 'text-[#1A9E5C]'} />
                    {t.randomGo}
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowOptionsModal(true)}
                    className="flex-1 p-4.5 bg-white/10 text-white rounded-[24px] shadow-2xl transition-all border border-white/20 backdrop-blur-md flex items-center justify-center relative"
                  >
                    <Target size={24} />
                    {spinWheelItems.length > 0 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 text-[#1A9E5C] rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white z-10"
                      >
                        {spinWheelItems.length}
                      </motion.div>
                    )}
                  </motion.button>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={spin}
                  className="flex items-center gap-2 text-white/90 font-black tracking-widest uppercase text-xs hover:text-white transition-all mx-auto bg-transparent border-none outline-none"
                >
                  <RefreshCw size={14} strokeWidth={3} />
                  {t.randomTryAgain}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
