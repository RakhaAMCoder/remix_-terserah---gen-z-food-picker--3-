import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Heart, MapPin, Clock, Star, ExternalLink, Share2, RefreshCw, ShoppingCart } from 'lucide-react';
import { Food, Branch } from '../types';
import { LocationService, Position } from '../services/locationService';
import { translations, Language } from '../translations';
import { Share as CapacitorShare } from '@capacitor/share';

interface FoodDetailProps {
  food: Food;
  onBack: () => void;
  onRandomize?: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  darkMode: boolean;
  language: Language;
}

export default function FoodDetail({ food, onBack, isFavorite, onToggleFavorite, darkMode, language }: FoodDetailProps) {
  const [userLocation, setUserLocation] = useState<Position | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const t = translations[language];

  const handleNavigate = (branch: Branch) => {
    const mapsUrl = branch.google_maps_url;
    if (mapsUrl && mapsUrl.trim().length > 0) {
      window.open(mapsUrl, '_blank');
    } else {
      alert("Link Google Maps belum tersedia.");
    }
  };

  const handleShare = async () => {
    const description = language === 'en' && food.deskripsi_en ? food.deskripsi_en : food.deskripsi;
    const shareText = `${t.detailShareText(food.nama, description)}\n${t.detailDownloadApp}`;

    try {
      // 1. Try Capacitor Native Share (Preferred for APK)
      const canShare = await CapacitorShare.canShare();
      if (canShare.value) {
        await CapacitorShare.share({
          title: food.nama,
          text: shareText,
          dialogTitle: t.detailShareText(food.nama, ''),
        });
        return;
      }

      // 2. Fallback to Web Navigator Share
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: food.nama,
          text: shareText,
        });
      } else {
        // 3. Last fallback to Clipboard
        copyToClipboard(shareText);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.log('Error sharing:', error);
        copyToClipboard(shareText);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert(t.detailCopied);
    }
  };

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${darkMode ? 'bg-black text-white' : 'bg-[#f0f2f5]'}`}>
      {/* Hero Image */}
      <div className="relative h-[450px]">
        <img src={food.foto_url} alt={food.nama} className="w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-b from-black/60 via-transparent ${darkMode ? 'to-black' : 'to-[#f0f2f5]'}`}></div>
        
        {/* Top Buttons */}
        <div className="absolute top-8 left-6 right-6 flex justify-between z-20">
          <button 
            onClick={onBack}
            className="p-3.5 bg-black/40 backdrop-blur-2xl rounded-2xl text-white hover:bg-black/60 transition-all border border-white/20 active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="p-3.5 bg-black/40 backdrop-blur-2xl rounded-2xl text-white hover:bg-black/60 transition-all border border-white/20 active:scale-90"
            >
              <Share2 size={24} />
            </button>
            <button 
              onClick={() => onToggleFavorite(food.id)}
              className={`p-3.5 backdrop-blur-2xl rounded-2xl transition-all border border-white/20 active:scale-90 ${
                isFavorite ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30' : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-24 relative z-10">
        <div className={`rounded-[48px] p-8 space-y-10 transition-colors border ${darkMode ? 'bg-white/[0.03] backdrop-blur-3xl border-white/10 shadow-2xl shadow-black/80' : 'bg-white border-black/5 shadow-xl shadow-black/5'}`}>
          {/* Title */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight leading-tight flex-1 ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
                {food.nama}
              </h1>
              
              {/* Rating Display */}
              <div className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 rounded-xl border border-yellow-500/10 shrink-0 mt-0.5">
                {food.rating !== undefined && food.rating !== null ? (
                  <>
                    <Star size={13} className="text-yellow-500 fill-yellow-500 shrink-0" />
                    <span className="text-xs font-black text-yellow-500 leading-none">
                      {typeof food.rating === 'number' ? food.rating.toFixed(1) : food.rating}
                    </span>
                  </>
                ) : (
                  <>
                    <Star size={12} className="text-gray-500 shrink-0" />
                    <span className="text-[10px] font-bold text-gray-500">
                      Belum Dinilai
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {food.tags.map((tag, idx) => {
              const cleanTag = String(tag).replace(/^#+/, '');
              return (
                <span key={`${cleanTag}-${idx}`} className={`text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-[0.1em] border ${darkMode ? 'bg-white/5 text-gray-500 border-white/10' : 'bg-gray-100 text-gray-500 border-black/5'}`}>
                  #{cleanTag.toUpperCase()}
                </span>
              );
            })}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className={`font-black uppercase tracking-[0.2em] flex items-center gap-2 text-xs opacity-50 ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>
              <ExternalLink size={16} className="text-[#1A9E5C]" />
              {t.detailWhy}
            </h3>
            <p className={`text-sm leading-relaxed font-medium p-5 rounded-3xl border-l-4 border-[#1A9E5C]/50 ${darkMode ? 'bg-white/5 text-gray-300' : 'bg-green-50/50 text-gray-600'}`}>
              "{language === 'en' && food.deskripsi_en ? food.deskripsi_en : food.deskripsi}"
            </p>
          </div>

          {/* Branches List */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className={`font-black uppercase tracking-[0.2em] text-xs opacity-50 ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.detailBranches}</h3>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{t.searchBranch(food.cabang.length)}</span>
            </div>
            
            <div className="space-y-5">
              {food.cabang.map((branch, index) => (
                <div key={index} className={`rounded-[32px] p-6 border space-y-5 transition-colors ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-black/5'}`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className={`font-black text-lg tracking-tighter ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{branch.nama}</p>
                      <div className="flex items-start gap-2 text-gray-500">
                        <MapPin size={14} className="mt-0.5 shrink-0" />
                        <p className="text-xs font-medium leading-relaxed">{branch.alamatLengkap}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{branch.jam_buka}</span>
                    </div>
                    <button 
                      onClick={() => handleNavigate(branch)}
                      disabled={isLoadingLocation}
                      className={`bg-[#1A9E5C] text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#1A9E5C]/30 active:scale-95 transition-all ${language === 'en' ? 'px-4' : 'px-6'} ${isLoadingLocation ? 'opacity-70 animate-pulse' : ''}`}
                    >
                      {isLoadingLocation ? <RefreshCw size={14} className="animate-spin" /> : <MapPin size={14} />}
                      {isLoadingLocation ? '...' : t.detailViewLocation}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
