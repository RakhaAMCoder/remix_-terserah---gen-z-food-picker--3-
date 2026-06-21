import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import Randomizer from './components/Randomizer';
import { Favorites } from './components/Favorites';
import SearchScreen from './components/SearchScreen';
import FoodDetail from './components/FoodDetail';
import { Settings, AboutScreen, FAQScreen, AccountScreen } from './components/Settings';
import { SupportChat } from './components/SupportChat';
import { ResetDataScreen } from './components/ResetDataScreen';
import { SpinWheel } from './components/SpinWheel';
import { ShortFeed } from './components/ShortFeed';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import MenuScreen from './components/MenuScreen';

// Auth Components
import AuthLanding from './components/auth/AuthLanding';
import RoleSelection from './components/auth/RoleSelection';
import UserOnboarding from './components/auth/UserOnboarding';
import MerchantOnboarding from './components/auth/MerchantOnboarding';
import AdminGate from './components/auth/AdminGate';
import AdminDashboard from './components/admin/AdminDashboard';
import MyMenus from './components/menu/MyMenus';

import BecomeMerchant from './components/auth/BecomeMerchant';
import { Food, BatteryData, ChatSession, Message } from './types';
import { UserRole } from './types/auth';
import { useAuth } from './context/AuthContext';
import { foods } from './data/foods';
import { translations, Language } from './translations';

import { BatteryService } from './services/batteryService';
import { StorageService } from './services/storageService';
import { NotificationService } from './services/notificationService';

import { supabase } from './lib/supabase';
import { Home, Search, MessageCircle, Heart, Settings as SettingsIcon, Dice5, RotateCw, Film, Loader2 } from 'lucide-react';

export default function App() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const { authUser, profile, isGuest, needsOnboarding, isAuthLoading, refreshProfile, authError, retryAuth, logout } = useAuth();
  const [onboardingStep, setOnboardingStep] = useState<'role' | 'user_onboard' | 'merchant_onboard' | 'admin_gate'>('role');

  useEffect(() => {
    console.log("App state:", { authUser: authUser?.id, profile: profile?.display_name, needsOnboarding, isAuthLoading, isGuest });
  }, [authUser, profile, needsOnboarding, isAuthLoading, isGuest]);

  useEffect(() => {
    if (authUser && needsOnboarding && onboardingStep === 'role') {
      if (authUser.email === 'thewaking5@gmail.com') {
        setOnboardingStep('admin_gate');
      } else if (profile?.role) {
        if (profile.role === 'admin') setOnboardingStep('admin_gate');
        else if (profile.role === 'merchant') setOnboardingStep('merchant_onboard');
        else if (profile.role === 'user') setOnboardingStep('user_onboard');
      }
    }
  }, [authUser, needsOnboarding, onboardingStep, profile]);

  useEffect(() => {
    const handleDeepLink = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        CapApp.addListener('appUrlOpen', async (event: any) => {
          console.log('App opened with URL:', event.url);
          
          if (event.url.includes('login-callback')) {
            try {
              const { Browser } = await import('@capacitor/browser');
              await Browser.close();
              
              const url = new URL(event.url.replace('#', '?'));
              const accessToken = url.searchParams.get('access_token');
              const refreshToken = url.searchParams.get('refresh_token');
              
              if (accessToken && refreshToken) {
                if (!supabase) {
                  console.warn('Supabase client not configured, cannot set session');
                } else {
                  await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                  });
                  console.log('Session set successfully from deep link');
                }
              }
            } catch (err) {
              console.error('Error processing deep link:', err);
            }
          }
        });
      } catch (e) {
        console.warn('Capacitor App plugin not found, skipping deep link listener');
      }
    };
    
    handleDeepLink();
  }, []);

  const [hasSeenOnboarding] = useState(StorageService.hasSeenOnboarding());
  const [isOnboardingFinished, setIsOnboardingFinished] = useState(false);
  const [activeTab, setActiveTabState] = useState('home');
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
  };

  const [navDirection, setNavDirection] = useState(1); // 1 = forward, -1 = back
  const [navStack, setNavStack] = useState<string[]>(['home']);
  const [autoFocusSearch, setAutoFocusSearch] = useState(false);
  const [initialMenuCategory, setInitialMenuCategory] = useState<string | undefined>(undefined);

  const prevTabRef = useRef(activeTab);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  useEffect(() => {
    prevTabRef.current = activeTab;
  }, [activeTab]);

  const [favorites, setFavorites] = useState<string[]>(StorageService.getFavorites());
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(StorageService.getChatHistory());
  const [darkMode, setDarkMode] = useState(StorageService.getSettings().darkMode);
  const [language, setLanguage] = useState<Language>(StorageService.getSettings().language);
  const [notificationsEnabled, setNotificationsEnabled] = useState(StorageService.getSettings().notificationsEnabled);
  const [showDiceMenu, setShowDiceMenu] = useState(false);
  const t = translations[language];

  const navigateTo = (tab: string, options?: any) => {
    if (tab === activeTab && !options?.autofocus && !options?.category) return;
    
    if (tab === 'search' && options?.autofocus) {
      setAutoFocusSearch(true);
    } else if (tab !== 'search') {
      setAutoFocusSearch(false);
    }

    if (tab === 'menu_screen' && options?.category) {
      setInitialMenuCategory(options.category);
    } else {
      setInitialMenuCategory(undefined);
    }

    setNavDirection(1);
    setActiveTab(tab);
    setNavStack(prev => [...prev, tab]);
  };

  const goBack = async () => {
    if (navStack.length > 1) {
      setNavDirection(-1);
      const newStack = [...navStack];
      newStack.pop(); // Remove current
      const previousTab = newStack[newStack.length - 1];
      setActiveTab(previousTab);
      setNavStack(newStack);
    } else {
      // If at home and no more history, maybe exit or do nothing
      if (activeTab === 'home') {
        const { App: CapApp } = await import('@capacitor/app').catch(() => ({ App: null as any }));
        if (CapApp) CapApp.exitApp();
      } else {
        setNavDirection(-1);
        setActiveTab('home');
        setNavStack(['home']);
      }
    }
  };

  // Scroll to top on every tab change
  useEffect(() => {
    // Small delay to ensure the new content is rendered
    setTimeout(() => {
      const mainContainer = document.getElementById('app-content-container');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'instant' });
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  }, [activeTab]);

  // Back button handling for Capacitor
  useEffect(() => {
    let handler: any = null;
    
    const setupBackHandler = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        handler = CapApp.addListener('backButton', () => {
          // If we are in ShortFeed, let it handle its own internal back logic
          // ShortFeed has its own listener that will call goBack() when ready
          if (activeTab === 'shortfeed') {
            return;
          }
          goBack();
        });
      } catch (e) {
        // Not in capacitor
      }
    };

    setupBackHandler();

    return () => {
      if (handler) {
        handler.then((h: any) => h.remove());
      }
    };
  }, [navStack, activeTab]);

  const [battery, setBattery] = useState<BatteryData>({
    level: 100,
    isCharging: false
  });
  const [isAppVisible, setIsAppVisible] = useState(true);

  // Handle App Visibility to pause background tasks
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAppVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle Capacitor App State if available
    let capListener: any = null;
    const setupCapListener = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        capListener = CapApp.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
          setIsAppVisible(isActive);
        });
      } catch (e) {
        // Not in capacitor
      }
    };
    setupCapListener();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (capListener) capListener.then((l: any) => l.remove());
    };
  }, []);

  const [history, setHistory] = useState<string[]>([]);

  // Initialize notifications
  useEffect(() => {
    NotificationService.requestPermissions();
  }, []);

  useEffect(() => {
    if (notificationsEnabled) {
      NotificationService.scheduleDailyNotifications(language);
    } else {
      NotificationService.cancelAll();
    }
  }, [notificationsEnabled, language]);

  // Save settings when they change
  useEffect(() => {
    StorageService.saveSettings({ notificationsEnabled, darkMode, language });
  }, [notificationsEnabled, darkMode, language]);

  // Deep linking logic
  useEffect(() => {
    if (isSplashFinished) {
      const urlParams = new URLSearchParams(window.location.search);
      const foodId = urlParams.get('foodId');
      if (foodId) {
        const food = foods.find(f => f.id === foodId);
        if (food) {
          setSelectedFood(food);
          setActiveTab('detail');
          setNavStack(['home', 'detail']);
          
          // Clean up URL without refreshing
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [isSplashFinished]);

  // Save favorites when they change
  useEffect(() => {
    StorageService.saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    if (isAppVisible) {
      const unsubscribe = BatteryService.subscribeToBatteryChanges(setBattery);
      return () => unsubscribe();
    }
  }, [isAppVisible]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const isDetailActive = ['detail', 'favorites', 'reset', 'faq', 'about', 'shortfeed', 'random', 'spin', 'support'].includes(activeTab);

  const transitionVariants = {
    initial: (custom: { direction: number, isDetail: boolean }) => ({
      opacity: 0,
      scale: custom.isDetail ? 1 : 0.96,
      x: custom.isDetail ? (custom.direction > 0 ? '20%' : '-20%') : 0, 
      y: custom.isDetail ? 0 : 8
    }),
    animate: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
        mass: 0.8
      }
    },
    exit: (custom: { direction: number, isDetail: boolean }) => ({
      opacity: 0,
      scale: custom.isDetail ? 1 : 0.96,
      x: custom.isDetail ? (custom.direction > 0 ? '-20%' : '20%') : 0,
      y: custom.isDetail ? 0 : 8,
      transition: {
        duration: 0.15,
        ease: 'easeInOut' as const
      }
    })
  };

  const resetAllData = () => {
    StorageService.resetAllData();
    setFavorites([]);
    setChatHistory([]);
    setHistory([]);
    alert(t.alertResetAll);
  };

  const deleteFavorites = () => {
    StorageService.deleteFavorites();
    setFavorites([]);
    alert(t.alertResetFav);
  };

  const deleteChatHistory = () => {
    StorageService.deleteChatHistory();
    setChatHistory([]);
    alert(t.resetSuccessChat);
  };

  const toggleFavorite = (foodId: string) => {
    setFavorites(prev => 
      prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId]
    );
  };

  const addToHistory = (foodId: string) => {
    setHistory(prev => [foodId, ...prev.slice(0, 19)]);
  };

  const handleFoodClick = (food: Food) => {
    setSelectedFood(food);
    navigateTo('detail');
  };

  const handleSeeAll = (type: 'recommended' | 'trending') => {
    // For now, we'll just navigate to search with a query or filter
    navigateTo('search');
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    (window as any).toggleDarkMode = toggleDarkMode;
    (window as any).navigateTo = (tab: string, options?: any) => navigateTo(tab, options);
    (window as any).navigateToSupport = () => navigateTo('support');
    (window as any).navigateToFeed = (videoId: string) => {
      // Small delay to ensure any existing modal is closed
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('video', videoId);
        window.history.pushState({}, '', url.toString());
        navigateTo('shortfeed');
      }, 0);
    };
    return () => {
      delete (window as any).toggleDarkMode;
      delete (window as any).navigateTo;
      delete (window as any).navigateToSupport;
      delete (window as any).navigateToFeed;
    };
  }, [navigateTo]);

  // --- RENDERING LOGIC ---

  if (isAuthLoading && isSplashFinished && !authUser && !isGuest) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-black'}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#1A9E5C]" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Sinkronisasi Akun...</p>
        </div>
      </div>
    );
  }

  if (!isSplashFinished) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} language={language} />;
  }

  if (authError) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? 'bg-black text-white' : 'bg-gray-100 text-[#1A1A2E]'}`}>
        <div className={`w-full max-w-sm p-8 rounded-[40px] border space-y-6 text-center ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-2xl'}`}>
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
            <Dice5 size={40} className="animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-tighter">Bermasalah</h2>
            <p className="text-sm text-gray-500 font-medium">
              {authError}
            </p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => retryAuth()}
              className="w-full h-16 bg-[#1A9E5C] text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <RotateCw size={18} />
              Coba Lagi
            </button>
            <button 
              onClick={() => logout()}
              className="w-full h-16 bg-white/5 border border-white/10 text-white/60 rounded-2xl font-black uppercase tracking-widest text-[12px] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Logout dan Login Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!authUser && !isGuest) {
    return <AuthLanding language={language} darkMode={darkMode} />;
  }

  if (authUser && needsOnboarding) {
    if (onboardingStep === 'role') {
      return (
        <RoleSelection 
          language={language} 
          darkMode={darkMode} 
          onSelect={(role) => {
            if (role === 'admin') setOnboardingStep('admin_gate');
            else if (role === 'merchant') setOnboardingStep('merchant_onboard');
            else setOnboardingStep('user_onboard');
          }} 
        />
      );
    }

    if (onboardingStep === 'user_onboard') {
      return <UserOnboarding language={language} darkMode={darkMode} onBack={() => { setOnboardingStep('role'); }} onSuccess={() => refreshProfile()} />;
    }

    if (onboardingStep === 'merchant_onboard') {
      return <MerchantOnboarding language={language} darkMode={darkMode} onBack={() => setOnboardingStep('role')} onSuccess={() => refreshProfile()} />;
    }
    
    if (onboardingStep === 'admin_gate') {
      return <AdminGate language={language} darkMode={darkMode} onBack={() => {
        if (authUser.email === 'thewaking5@gmail.com') logout();
        else setOnboardingStep('role');
      }} onSuccess={() => refreshProfile()} />;
    }

    // Default fallback
    return <RoleSelection language={language} darkMode={darkMode} onSelect={(role) => {
      if (role === 'admin') setOnboardingStep('admin_gate');
      else if (role === 'merchant') setOnboardingStep('merchant_onboard');
      else setOnboardingStep('user_onboard');
    }} />;
  }

  if (!hasSeenOnboarding && !isOnboardingFinished) {
    return (
      <OnboardingScreen 
        language={language} 
        onFinish={() => {
          StorageService.setSeenOnboarding(true);
          setIsOnboardingFinished(true);
        }} 
      />
    );
  }

  const renderContent = () => {
    const activeTabKey = activeTab === 'detail' ? `detail-${selectedFood?.id}` : activeTab;
    
    let content = null;
    if (activeTab === 'detail' && selectedFood) {
      content = (
        <FoodDetail 
          food={selectedFood} 
          onBack={goBack} 
          onRandomize={() => navigateTo('random')}
          isFavorite={favorites.includes(selectedFood.id)}
          onToggleFavorite={toggleFavorite}
          darkMode={darkMode}
          language={language}
        />
      );
    } else {
      switch (activeTab) {
        case 'home':
          content = (
            <Dashboard 
              battery={battery}
              onRandomClick={() => navigateTo('random')}
              onFoodClick={handleFoodClick}
              onSeeAll={handleSeeAll}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
              darkMode={darkMode}
              language={language}
              isAppVisible={isAppVisible}
            />
          );
          break;
        case 'search':
          content = <SearchScreen onFoodClick={handleFoodClick} darkMode={darkMode} language={language} autoFocus={autoFocusSearch} />;
          break;
        case 'menu_screen':
          content = <MenuScreen onBack={goBack} onFoodClick={handleFoodClick} darkMode={darkMode} language={language} initialCategory={initialMenuCategory} />;
          break;
        case 'chat':
          content = (
            <ChatBot 
              onFoodClick={handleFoodClick} 
              history={chatHistory}
              onSaveSession={(session) => {
                StorageService.addChatSession(session);
                setChatHistory(StorageService.getChatHistory());
              }}
              onDeleteSession={(id) => {
                StorageService.deleteChatSession(id);
                setChatHistory(StorageService.getChatHistory());
              }}
              onRenameSession={(id, newTitle) => {
                StorageService.renameChatSession(id, newTitle);
                setChatHistory(StorageService.getChatHistory());
              }}
              onPinSession={(id) => {
                StorageService.togglePinChatSession(id);
                setChatHistory(StorageService.getChatHistory());
              }}
              darkMode={darkMode}
              language={language}
            />
          );
          break;
        case 'favorites':
          content = (
            <Favorites 
              onBack={goBack}
              favorites={favorites} 
              toggleFavorite={toggleFavorite} 
              onFoodClick={handleFoodClick}
              onNavigateToSearch={() => navigateTo('search')}
              darkMode={darkMode}
              language={language}
            />
          );
          break;
        case 'settings':
          content = (
            <Settings 
              onBack={goBack} 
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              language={language}
              onLanguageChange={setLanguage}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
              favorites={favorites}
              onNavigateToFavorites={() => navigateTo('favorites')}
              onNavigateToReset={() => navigateTo('reset')}
              onNavigateToAbout={() => navigateTo('about')}
              onNavigateToFAQ={() => navigateTo('faq')}
              onNavigateToMerchant={() => navigateTo('merchant_dashboard')}
              onNavigateToAdmin={() => navigateTo('admin_dashboard')}
              onNavigateToAccount={() => navigateTo('account')}
            />
          );
          break;
        case 'account':
          content = <AccountScreen onBack={goBack} darkMode={darkMode} language={language} />;
          break;
        case 'faq':
          content = <FAQScreen onBack={goBack} darkMode={darkMode} language={language} />;
          break;
        case 'about':
          content = <AboutScreen onBack={goBack} darkMode={darkMode} language={language} />;
          break;
        case 'support':
          content = <SupportChat onBack={goBack} darkMode={darkMode} language={language} />;
          break;
        case 'reset':
          content = (
            <ResetDataScreen
              onBack={goBack}
              onDeleteFavorites={deleteFavorites}
              onDeleteChatHistory={deleteChatHistory}
              onDeleteAll={resetAllData}
              favoritesCount={favorites.length}
              chatHistoryCount={chatHistory.length}
              darkMode={darkMode}
              language={language}
            />
          );
          break;
        case 'merchant_dashboard':
        case 'merchant_onboarding':
        case 'admin_dashboard':
        case 'random':
        case 'spin':
        case 'shortfeed':
          return null;
        default:
          content = (
            <Dashboard 
              battery={battery} 
              onRandomClick={() => navigateTo('random')} 
              onFoodClick={handleFoodClick}
              onSeeAll={handleSeeAll}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
              darkMode={darkMode}
              language={language}
              isAppVisible={isAppVisible}
            />
          );
      }
    }

    const isAnimatingDetail = activeTab === 'detail' || prevTabRef.current === 'detail';
    const isNoAnimationTab = !isAnimatingDetail;
    const customData = { direction: navDirection, isDetail: isAnimatingDetail };

    if (isNoAnimationTab) {
      return (
        <div 
          key={activeTabKey} 
          className="h-full overflow-hidden" 
          id="app-content-container"
        >
          {content}
        </div>
      );
    }

    return (
      <motion.div
        key={activeTabKey}
        custom={customData}
        variants={transitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ 
          duration: 0.22,
          ease: "easeOut",
          x: { type: "spring", stiffness: 400, damping: 40 }
        }}
        className="h-full overflow-y-auto no-scrollbar scroll-smooth will-change-transform"
        id="app-content-container"
      >
        {content}
      </motion.div>
    );
  };


  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-[#f0f2f5] text-[#1A1A2E]'} font-sans pb-24 max-w-md mx-auto shadow-2xl relative overflow-hidden`}>
      <AnimatePresence 
        mode="popLayout" 
        custom={{ 
          direction: navDirection, 
          isDetail: activeTab === 'detail' || navStack[navStack.length - 2] === 'detail'
        }}
      >
        {!['random', 'spin', 'shortfeed'].includes(activeTab) && renderContent()}
      </AnimatePresence>

      {/* Full Screen Overlays - No Animation to fix black screen */}
      {activeTab === 'random' && (
        <Randomizer 
          onClose={goBack}
          onSelect={(food) => {
            addToHistory(food.id);
            setSelectedFood(food);
            navigateTo('detail');
          }}
          onNavigateToSpin={() => navigateTo('spin')}
          darkMode={darkMode}
          language={language}
        />
      )}
      {activeTab === 'spin' && (
        <SpinWheel
          onBack={goBack}
          darkMode={darkMode}
          language={language}
        />
      )}
      {activeTab === 'shortfeed' && (
        <ShortFeed
          onBack={goBack}
          darkMode={darkMode}
          language={language}
        />
      )}

      {activeTab === 'merchant_dashboard' && (
        <div className="fixed inset-0 z-[200] bg-black overflow-y-auto">
          <MyMenus onBack={() => { goBack(); }} />
        </div>
      )}

      {activeTab === 'merchant_onboarding' && (
        <BecomeMerchant 
          onBack={goBack} 
          onSuccess={() => {
            refreshProfile();
            setActiveTab('merchant_dashboard');
          }}
          darkMode={darkMode}
        />
      )}

      {activeTab === 'admin_dashboard' && (
        <div className="fixed inset-0 z-[200] bg-black overflow-y-auto">
          <AdminDashboard onBack={() => { goBack(); }} />
        </div>
      )}

      {/* Bottom Navigation */}
      {activeTab !== 'detail' && activeTab !== 'random' && activeTab !== 'spin' && activeTab !== 'shortfeed' && activeTab !== 'merchant_dashboard' && activeTab !== 'admin_dashboard' && (
        <>
          <AnimatePresence>
            {showDiceMenu && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDiceMenu(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-md z-[80]"
              />
            )}
          </AnimatePresence>

          <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-2 py-1 flex justify-between items-center z-[100] transition-all duration-300 h-[75px] border-t backdrop-blur-xl ${darkMode ? 'bg-[#121212]/95 border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]' : 'bg-white/95 border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'}`}>
            <div className="flex-1 flex justify-center">
              <NavButton active={activeTab === 'home'} onClick={() => navigateTo('home')} icon={<Home size={20} />} label={t.home} darkMode={darkMode} />
            </div>
            <div className="flex-1 flex justify-center">
              <NavButton active={activeTab === 'search'} onClick={() => navigateTo('search')} icon={<Search size={20} />} label={t.search} darkMode={darkMode} />
            </div>
            
            {/* Special Dice Button - Convex Center */}
            <div className="flex-1 flex justify-center relative -top-4">
              <AnimatePresence>
                {showDiceMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.5, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                    exit={{ opacity: 0, y: 30, scale: 0.5, x: '-50%' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                    className="absolute bottom-28 left-1/2 flex flex-row items-end gap-2 z-[100] w-auto whitespace-nowrap"
                  >
                    {/* LEFT: Short Feed (Slightly Down) */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDiceMenu(false);
                        navigateTo('shortfeed');
                      }}
                      className={`${darkMode ? 'bg-black/80 backdrop-blur-2xl border-white/10 text-white shadow-2xl' : 'bg-white border-black/5 text-[#1A1A2E] shadow-xl'} py-2 px-3.5 rounded-xl flex items-center gap-2 text-[10px] font-bold transition-all border translate-y-4`}
                    >
                      <Film size={12} className="text-blue-500" />
                      {t.shortFeed}
                    </motion.button>
                    
                    {/* CENTER: Terserah */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDiceMenu(false);
                        navigateTo('random');
                      }}
                      className={`${darkMode ? 'bg-black/80 backdrop-blur-2xl border-white/20 text-white shadow-2xl' : 'bg-white border-black/10 text-[#1A1A2E] shadow-xl'} py-3 px-4.5 rounded-2xl flex items-center gap-2 text-[11px] font-black transition-all border-2 border-[#1A9E5C]/30 translate-y-1`}
                    >
                      <Dice5 size={16} className="text-[#1A9E5C]" />
                      {t.terserah}
                    </motion.button>

                    {/* RIGHT: Spin Wheel (Slightly Down) */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDiceMenu(false);
                        navigateTo('spin');
                      }}
                      className={`${darkMode ? 'bg-black/80 backdrop-blur-2xl border-white/10 text-white shadow-2xl' : 'bg-white border-black/5 text-[#1A1A2E] shadow-xl'} py-2 px-3.5 rounded-xl flex items-center gap-2 text-[10px] font-bold transition-all border translate-y-4`}
                    >
                      <RotateCw size={12} className="text-yellow-500" />
                      {t.spinWheel}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex flex-col items-center">
                <motion.button
                  onClick={() => setShowDiceMenu(!showDiceMenu)}
                  animate={{ 
                    rotate: showDiceMenu ? 180 : 0, 
                    scale: showDiceMenu ? 0.95 : 1
                  }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ 
                    rotate: { type: 'spring', damping: 15, stiffness: 200 }
                  }}
                  className={`bg-[#1A9E5C] text-white p-4 rounded-full shadow-[0_5px_20px_rgba(26,158,92,0.5)] z-[100] relative border-4 ${darkMode ? 'border-[#121212]' : 'border-white'}`}
                >
                  <Dice5 size={24} />
                </motion.button>
                <span className={`text-[8px] font-black uppercase tracking-[0.1em] mt-1.5 transition-colors ${darkMode ? 'text-gray-400' : 'text-[#1A9E5C]'}`}>{t.terserah}</span>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <NavButton active={activeTab === 'chat'} onClick={() => navigateTo('chat')} icon={<MessageCircle size={20} />} label={t.bot} darkMode={darkMode} />
            </div>
            <div className="flex-1 flex justify-center">
              <NavButton active={activeTab === 'settings'} onClick={() => navigateTo('settings')} icon={<SettingsIcon size={20} />} label={t.setelan} darkMode={darkMode} />
            </div>
          </nav>
        </>
      )}

    </div>
  );
}

const NavButton = React.memo(({ active, onClick, icon, label, darkMode }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, darkMode: boolean }) => {
  return (
    <button 
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0.5 p-1 px-3 transition-all duration-300 active:scale-95`}
    >
      <motion.div
        animate={{ 
          scale: active ? 1.1 : 1,
          color: active ? '#1A9E5C' : (darkMode ? '#9ca3af' : '#6b7280')
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="z-10"
      >
        {icon}
      </motion.div>
      <motion.span 
        animate={{ 
          opacity: active ? 1 : 0.6,
          color: active ? '#1A9E5C' : (darkMode ? '#9ca3af' : '#6b7280')
        }}
        className="text-[9px] font-black uppercase tracking-[0.1em] z-10"
      >
        {label}
      </motion.span>
      {active && (
        <motion.div 
          layoutId="navIndicator"
          className="absolute -bottom-1 w-5 h-1 bg-[#1A9E5C] rounded-full"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );
});
