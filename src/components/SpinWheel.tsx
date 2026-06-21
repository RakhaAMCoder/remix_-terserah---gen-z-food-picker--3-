import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RotateCw, Plus, Trash2, Trophy, X, Shuffle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StorageService } from '../services/storageService';
import { translations, Language } from '../translations';

interface SpinWheelProps {
  onBack: () => void;
  darkMode: boolean;
  language: Language;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ onBack, darkMode, language }) => {
  const [items, setItems] = useState<string[]>(StorageService.getSpinWheelItems());
  const [newItem, setNewItem] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  // Use CSS for idle rotation instead of requestAnimationFrame for better performance
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Save items to storage whenever they change
  useEffect(() => {
    StorageService.saveSpinWheelItems(items);
  }, [items]);

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const shuffleItems = () => {
    if (items.length < 2 || isSpinning) return;
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
  };

  const spin = () => {
    if (items.length < 2 || isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const extraSpins = 4 + Math.random() * 2;
    const newRotation = rotation + extraSpins * 360 + Math.random() * 360;
    
    setRotation(newRotation);
    setHasSpun(true); 

    setTimeout(() => {
      setIsSpinning(false);
      
      // Calculate winner
      const actualRotation = newRotation % 360;
      const segmentSize = 360 / items.length;
      
      const winningIndex = Math.floor(((360 - (actualRotation % 360)) % 360) / segmentSize);
      
      const wonItem = items[winningIndex];
      setWinner(wonItem);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1A9E5C', '#22C56E', '#FACC15', '#FFFFFF']
      });
    }, 5000);
  };

  const removeWinnerAndClose = () => {
    if (winner) {
      setItems(items.filter(item => item !== winner));
      setWinner(null);
    }
  };

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-[#f0f2f5]'}`}>
      {/* Header */}
      <div className={`px-6 pt-12 pb-6 space-y-2 shadow-sm border-b transition-colors ${darkMode ? 'bg-black/50 backdrop-blur-xl border-white/10' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-50 text-[#1A1A2E]'}`}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.spinTitle}</h1>
        </div>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] pl-12">{t.spinGreeting}</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Wheel Container */}
        <div className="flex flex-col items-center justify-center py-8 relative">
          {items.length >= 2 ? (
            <>
              {/* Pointer - Improved Design */}
              <div className="absolute top-2 z-20 flex flex-col items-center">
                <div className="w-8 h-10 bg-red-600 rounded-t-full rounded-b-lg shadow-xl relative flex items-center justify-center border-2 border-white/20">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  {/* Arrow Tip */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-red-600 drop-shadow-lg"></div>
                </div>
              </div>

              {/* The Wheel */}
              <style>{`
                @keyframes idle-rotate {
                  from { transform: rotate(0deg) translate3d(0,0,0); }
                  to { transform: rotate(360deg) translate3d(0,0,0); }
                }
                .wheel-idle { 
                  animation: idle-rotate 20s linear infinite; 
                  will-change: transform;
                  backface-visibility: hidden;
                  -webkit-backface-visibility: hidden;
                  transform-style: preserve-3d;
                  -webkit-transform-style: preserve-3d;
                }
              `}</style>
              <div 
                className="w-80 h-80 relative rounded-full shadow-[0_24px_50px_rgba(0,0,0,0.25)] bg-black/10 overflow-hidden"
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transformStyle: 'preserve-3d',
                  WebkitTransformStyle: 'preserve-3d',
                }}
              >
                <motion.div
                  onClick={spin}
                  animate={{ rotate: rotation }}
                  transition={isSpinning ? { duration: 5, ease: "circOut" } : { duration: 0 }}
                  className={`w-full h-full relative flex items-center justify-center cursor-pointer active:scale-95 transition-transform ${isSpinning ? 'pointer-events-none' : 'wheel-idle'}`}
                  style={{ 
                    transformOrigin: 'center', 
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                  }}
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {items.map((item, index) => {
                      const angle = 360 / items.length;
                      const startAngle = angle * index;
                      
                      // Text position (middle of the arc)
                      const textAngle = startAngle + angle / 2;
                      const textRad = (textAngle - 90) * (Math.PI / 180);
                      // Move text to middle of the segment (not at the edge)
                      const textX = 100 + 50 * Math.cos(textRad);
                      const textY = 100 + 50 * Math.sin(textRad);
                      
                      const endAngle = angle * (index + 1);
                      const startRad = (startAngle - 90) * (Math.PI / 180);
                      const endRad = (endAngle - 90) * (Math.PI / 180);
                      const x1 = 100 + 100 * Math.cos(startRad);
                      const y1 = 100 + 100 * Math.sin(startRad);
                      const x2 = 100 + 100 * Math.cos(endRad);
                      const y2 = 100 + 100 * Math.sin(endRad);
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                      
                      const segmentColors = ['#1A9E5C', '#22C56E', '#065F46'];
  
                      // Dynamic font size based on text length
                      // Short text (<= 5 chars): 10px
                      // Medium text (6-10 chars): 8px
                      // Long text (11-15 chars): 6px
                      const getFontSize = (text: string) => {
                        if (text.length <= 5) return "10";
                        if (text.length <= 10) return "8";
                        return "6";
                      };
  
                      const displayText = item.length > 15 ? item.substring(0, 12) + '...' : item;
  
                      return (
                        <g key={index}>
                          <path
                            d={pathData}
                            fill={segmentColors[index % segmentColors.length]}
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="1"
                          />
                          {/* Vertical Text: Rotate text to point towards center */}
                          <g transform={`translate(${textX}, ${textY}) rotate(${textAngle + 90})`}>
                            <text
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize={getFontSize(displayText)}
                              fontWeight="900"
                              className="uppercase tracking-tighter"
                              style={{ pointerEvents: 'none' }}
                            >
                              {displayText}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>
  
                  {/* Center Pin */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full z-10 border-4 border-[#1A9E5C] shadow-lg flex items-center justify-center ${darkMode ? 'bg-white/[0.05] backdrop-blur-xl' : 'bg-white'}`}>
                    <div className="w-3 h-3 bg-[#1A9E5C] rounded-full shadow-[0_0_10px_rgba(26,158,92,0.5)]"></div>
                  </div>
                </motion.div>
              </div>
              
              {!isSpinning && !hasSpun && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  {t.spinTap}
                </motion.p>
              )}
            </>
          ) : (
            <div className={`w-64 h-64 rounded-full border-4 border-dashed flex flex-col items-center justify-center text-center p-6 ${darkMode ? 'border-white/10 text-gray-500' : 'border-black/10 text-gray-400'}`}>
              <RotateCw size={48} className="mb-4 opacity-20" />
              <p className="text-xs font-medium">{t.spinMinPilihan}</p>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder={t.spinPlaceholder}
              className={`flex-1 px-4 py-3 rounded-2xl text-sm border focus:outline-none transition-all ${
                darkMode 
                  ? 'bg-white/[0.05] backdrop-blur-xl border-white/10 text-white focus:border-[#1A9E5C]' 
                  : 'bg-white border-black/5 text-[#1A1A2E] focus:border-[#1A9E5C]'
              }`}
            />
            <button
              onClick={addItem}
              className="p-3 bg-[#1A9E5C] text-white rounded-2xl shadow-lg shadow-[#1A9E5C]/20 active:scale-95"
            >
              <Plus size={24} />
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.spinList} ({items.length})</h3>
              <div className="flex gap-4">
                {items.length >= 2 && (
                  <button 
                    onClick={shuffleItems}
                    disabled={isSpinning}
                    className={`text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 ${isSpinning ? 'text-gray-500' : 'text-[#1A9E5C]'}`}
                  >
                    <Shuffle size={12} />
                    {t.spinShuffle}
                  </button>
                )}
                {items.length > 0 && (
                  <button 
                    onClick={() => setItems([])}
                    className="text-[10px] font-bold text-red-500 uppercase tracking-tight"
                  >
                    {t.spinDeleteAll}
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    darkMode 
                      ? 'bg-white/[0.03] backdrop-blur-md border-white/10 text-white' 
                      : 'bg-white border-black/5 text-[#1A1A2E]'
                  }`}
                >
                  {item}
                  <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Winner Popup */}
      <AnimatePresence>
        {winner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`w-full max-w-xs rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden ${darkMode ? 'bg-black border border-white/10' : 'bg-white'}`}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1A9E5C] to-[#FACC15]"></div>
              
              <div className="space-y-2">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-white/5 text-yellow-500' : 'bg-yellow-50 text-yellow-500'}`}>
                  <Trophy size={40} />
                </div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.spinWinner}</h3>
                <p className="text-xs text-gray-400">{t.spinChosen}</p>
              </div>

              <div className={`py-6 px-4 rounded-3xl border ${darkMode ? 'bg-[#1A9E5C]/20 border-[#1A9E5C]/30' : 'bg-[#1A9E5C]/10 border-[#1A9E5C]/20'}`}>
                <h2 className="text-3xl font-black text-[#1A9E5C] uppercase tracking-tight leading-tight">
                  {winner}
                </h2>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => setWinner(null)}
                  className="w-full py-4 bg-[#1A9E5C] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#1A9E5C]/20 active:scale-95 transition-transform"
                >
                  {t.spinMantap}
                </button>
                <button
                  onClick={removeWinnerAndClose}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                    darkMode 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-red-50 text-red-500 hover:bg-red-100'
                  }`}
                >
                  <Trash2 size={16} />
                  {t.spinRemoveWinner}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
