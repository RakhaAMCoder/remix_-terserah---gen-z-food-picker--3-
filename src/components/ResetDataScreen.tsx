import React from 'react';
import { ChevronLeft, Trash2, MessageCircle, Heart, AlertTriangle, Search } from 'lucide-react';
import { translations, Language } from '../translations';

interface ResetDataScreenProps {
  onBack: () => void;
  onDeleteFavorites: () => void;
  onDeleteChatHistory: () => void;
  onDeleteAll: () => void;
  favoritesCount: number;
  chatHistoryCount: number;
  darkMode: boolean;
  language: Language;
}

export const ResetDataScreen: React.FC<ResetDataScreenProps> = ({
  onBack,
  onDeleteFavorites,
  onDeleteChatHistory,
  onDeleteAll,
  favoritesCount,
  chatHistoryCount,
  darkMode,
  language
}) => {
  const [showConfirm, setShowConfirm] = React.useState<{ type: string, action: () => void } | null>(null);
  const t = translations[language];

  const handleConfirm = () => {
    if (showConfirm) {
      showConfirm.action();
      setShowConfirm(null);
    }
  };

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-[#f0f2f5]'}`}>
      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-xs rounded-[32px] p-6 space-y-6 shadow-2xl transition-colors border ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-black/5 text-[#1A1A2E]'}`}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-full ${darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">{t.resetConfirmTitle}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t.resetConfirmSub(<span className="text-red-500 font-bold">{showConfirm.type}</span>)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(null)}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
              >
                {t.resetCancel}
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-red-500/20"
              >
                {t.resetYes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`px-6 pt-12 pb-6 space-y-2 shadow-sm border-b transition-colors ${darkMode ? 'bg-black/50 backdrop-blur-xl border-white/10' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5 text-white' : 'hover:bg-gray-50 text-[#1A1A2E]'}`}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.resetTitle}</h1>
        </div>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] pl-12">{t.resetSub}</p>
      </div>

      <div className="p-6 space-y-8">
        <div className={`p-4 border rounded-2xl flex gap-4 items-start transition-colors ${darkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-100'}`}>
          <AlertTriangle className={darkMode ? 'text-orange-400' : 'text-orange-500'} size={20} />
          <p className={`text-xs leading-relaxed ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
            {t.resetWarningDetailed}
          </p>
        </div>

        {/* Group Favorite */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest px-2 text-gray-500">GROUP FAVORITE</h3>
          <div className={`rounded-[32px] overflow-hidden border transition-colors ${darkMode ? 'bg-white/[0.03] backdrop-blur-md border-white/10' : 'bg-white border-black/5'}`}>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-colors ${darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
                  <Heart size={20} />
                </div>
                <div>
                  <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.resetFavDB}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{favoritesCount} {t.resetItem} {t.resetStored}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirm({ type: t.resetAllFav, action: onDeleteFavorites })}
                disabled={favoritesCount === 0}
                className={`p-3 rounded-xl transition-colors ${favoritesCount === 0 ? 'opacity-30 cursor-not-allowed' : (darkMode ? 'hover:bg-white/5 text-red-400' : 'hover:bg-red-50 text-red-500')}`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Group Chat Bot */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest px-2 text-gray-500">GROUP CHAT BOT</h3>
          <div className={`rounded-[32px] overflow-hidden border transition-colors ${darkMode ? 'bg-white/[0.03] backdrop-blur-md border-white/10' : 'bg-white border-black/5'}`}>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-colors ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500'}`}>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.resetChatDB}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{chatHistoryCount} {t.resetSession} {t.resetStored}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirm({ type: t.resetAllChat, action: onDeleteChatHistory })}
                disabled={chatHistoryCount === 0}
                className={`p-3 rounded-xl transition-colors ${chatHistoryCount === 0 ? 'opacity-30 cursor-not-allowed' : (darkMode ? 'hover:bg-white/5 text-emerald-400' : 'hover:bg-emerald-50 text-emerald-500')}`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Delete All Button */}
        <button 
          onClick={() => setShowConfirm({ type: t.resetAllData, action: onDeleteAll })}
          disabled={favoritesCount === 0 && chatHistoryCount === 0}
          className={`w-full p-5 rounded-[32px] flex items-center justify-center gap-3 font-bold text-sm transition-all ${
            favoritesCount === 0 && chatHistoryCount === 0
              ? (darkMode ? 'bg-white/5 text-gray-600 opacity-50 cursor-not-allowed' : 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed')
              : 'bg-red-500 text-white shadow-lg shadow-red-500/20 active:scale-95'
          }`}
        >
          <Trash2 size={20} />
          {t.resetAll}
        </button>
      </div>
    </div>
  );
};
