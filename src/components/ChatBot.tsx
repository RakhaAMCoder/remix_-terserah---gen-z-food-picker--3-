  import React, { useState, useRef, useEffect } from 'react';
  import { Send, User, Bot, Sparkles, RefreshCw, MapPin, Star, History, Plus, ChevronLeft, Trash2, Clock, Play, Menu, X as CloseIcon, MoreVertical, Edit2, Trash } from 'lucide-react';
  import { motion, AnimatePresence } from 'motion/react';
  import { GoogleGenAI } from "@google/genai";
  import { foods } from '../data/foods';
  import { Food, ChatSession, ChatMessage, Message } from '../types';
  import SecretChess from './SecretChess';
  import { translations, Language } from '../translations';

  interface ChatBotProps {
    onFoodClick: (food: Food) => void;
    history: ChatSession[];
    onSaveSession: (session: ChatSession) => void;
    onDeleteSession: (id: string) => void;
    onRenameSession: (id: string, newTitle: string) => void;
    onPinSession: (id: string) => void;
    darkMode: boolean;
    language: Language;
  }

  export default function ChatBot({ 
    onFoodClick, 
    history: rawHistory, 
    onSaveSession, 
    onDeleteSession,
    onRenameSession,
    onPinSession,
    darkMode, 
    language 
  }: ChatBotProps) {
    // MASUKKAN API KEY ANDA DI SINI (1-5)
  const API_KEYS = [
    "AIzaSyDMjkexhg1VGxzd6tJAvK8d4ovc-GHpHPI", // API Key 1
    "AIzaSyD9DpjcHNK2Q6YTNrSDt8YTL5aSmz0Hz_k", // API Key 2
    "AIzaSyBdXOTd9jS6N3wYAELp4JvhobscIgbgaog", // API Key 3
    "AIzaSyCzQGzuVqhzDGIwqroyYn75HDoz_Yeit5o", // API Key 4
    "AIzaSyDufEM6w39HCPC3X-rEMWoMhbyBjsN3c14",
  ];

    const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
    const [messages, setMessages] = useState<Message[]>([]);
    const skipNextSave = useRef(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showChess, setShowChess] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isAutoScrolling = useRef(true);
    const t = translations[language];

    const showSendButton = isFocused || input.trim().length > 0;

    const scrollToBottom = (force = false) => {
      if (force || isAutoScrolling.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      // If user is within 100px of bottom, resume auto-scrolling
      isAutoScrolling.current = distanceToBottom < 100;
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages, isTyping]);

    // Close menu on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // Check if the click target is the more-vertical button or inside it
        const target = event.target as HTMLElement;
        const isToggleButton = target.closest('.menu-toggle-btn');
        
        if (activeMenuId && menuRef.current && !menuRef.current.contains(target) && !isToggleButton) {
          setActiveMenuId(null);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenuId]);

    // Debounce session save
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (messages.length > 1) {
        if (skipNextSave.current) {
          skipNextSave.current = false;
          return;
        }

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
          const session: ChatSession = {
            id: currentSessionId,
            title: messages.find(m => m.role === 'user')?.text.slice(0, 30) || t.chatNewChat,
            messages: messages.map(({ role, text, timestamp, suggestedFoods, isChessTrigger }) => ({ 
              role, text, timestamp, suggestedFoods, isChessTrigger 
            })),
            lastUpdated: Date.now()
          };
          onSaveSession(session);
        }, 1000); // 1s debounce
      }
      return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      }
    }, [messages, currentSessionId]);

    // Maintain the history order: pinned first, then newest first based on lastUpdated
    const sortedHistory = [...rawHistory].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.lastUpdated - a.lastUpdated;
    });

    const startNewChat = () => {
      setCurrentSessionId(Date.now().toString());
      setMessages([]);
      setShowSidebar(false);
    };

    const loadSession = (session: ChatSession) => {
      skipNextSave.current = true;
      setCurrentSessionId(session.id);
      setMessages(session.messages.map((m, i) => ({
        ...m,
        id: `${session.id}-${i}`
      })));
      setShowSidebar(false);
    };

    const handleRename = (id: string) => {
      if (editValue.trim()) {
        onRenameSession(id, editValue.trim());
      }
      setEditingId(null);
      setActiveMenuId(null);
    };

    const handleDelete = (id: string) => {
      onDeleteSession(id);
      if (currentSessionId === id) {
        startNewChat();
      }
      setActiveMenuId(null);
    };

    const handlePin = (id: string) => {
      onPinSession(id);
      setActiveMenuId(null);
    };

    const isMounted = useRef(true);

    useEffect(() => {
      isMounted.current = true;
      return () => { isMounted.current = false; };
    }, []);

    const typeMessage = async (fullText: string, suggestedFoods?: Food[]) => {
      if (!isMounted.current) return;
      setIsTyping(true);
      const messageId = (Date.now() + 1).toString();
      
      // Create initial empty message
      const initialMessage: Message = {
        id: messageId,
        text: "",
        role: 'model',
        timestamp: Date.now(),
        suggestedFoods
      };
      
      setMessages(prev => [...prev, initialMessage]);

      const words = fullText.split(" ");
      let currentText = "";
      
      // Determine dynamic chunk size to ensure fast display for longer text
      const chunkSize = words.length > 30 ? 4 : 1;
      
      for (let i = 0; i < words.length; i += chunkSize) {
        if (!isMounted.current) break;
        
        const chunk = words.slice(i, i + chunkSize);
        currentText += (i === 0 ? "" : " ") + chunk.join(" ");
        
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, text: currentText } : m
        ));
        
        // Super short delay for modern flow (only 2-5ms)
        await new Promise(resolve => setTimeout(resolve, 2 + Math.random() * 3));
      }
      
      // Ensure the exact complete string is printed at the end
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, text: fullText } : m
      ));
      
      if (isMounted.current) setIsTyping(false);
    };

    const handleSend = async () => {
      if (!input.trim() || isLoading || isTyping) return;

      // Check internet connection
      const isOffline = !navigator.onLine;

      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        role: 'user',
        timestamp: Date.now(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput('');

      // Pre-processing: Simple Local Logic for true Offline
      const lowInput = input.toLowerCase();
      
      // Check if user is asking for time, but offline
      const isAskingTime = lowInput.includes("jam berapa") || lowInput.includes("pukul berapa") || (lowInput.includes("what") && lowInput.includes("time"));
      
      if (isOffline && isAskingTime) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        const offlineTimeMsg = language === 'id' 
          ? `Sssttt... Aku lagi offline (nggak ada internet), tapi aku tau kok sekarang jam ${timeStr}. Hubungkan internet ya supaya aku bisa bantu yang lain! 📡`
          : `Psst... I'm currently offline, but I know it's ${timeStr} right now. Connect to the internet so I can help you with more! 📡`;
        
        setTimeout(() => {
          typeMessage(offlineTimeMsg);
        }, 500);
        return;
      }

      if (isOffline) {
        setTimeout(() => {
          typeMessage(language === 'id' 
            ? "Aduh kak, sepertinya internet kamu mati. Hubungkan ke data atau Wi-Fi dulu ya supaya aku bisa mikir! 🌐" 
            : "Oops, looks like you're offline. Please connect to the internet first so I can think! 🌐"
          );
        }, 500);
        return;
      }

      // Check for Chess Trigger
      const chessKeywords = ['catur', 'chess', 'main catur', 'play chess', 'play catur'];
      const isChessTrigger = chessKeywords.some(kw => input.toLowerCase().includes(kw));

      if (isChessTrigger) {
        setIsLoading(true);
        setTimeout(() => {
          const chessText = t.chatChessDiscovery;
          setIsLoading(false);
          typeMessage(chessText).then(() => {
            // After typing, we need to mark it as chess trigger
            setMessages(prev => prev.map(m => 
              m.text === chessText ? { ...m, isChessTrigger: true } : m
            ));
          });
        }, 1000);
        return;
      }

      setIsLoading(true);

      try {
        // Rotation logic using the API_KEYS array defined at the top
        const keysToTry = [0, 1, 2, 3, 4, 0]; // Index 0-4 then back to 0
        let lastResult: any = null;
        let success = false;

        const currentTimeString = new Date().toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        const systemInstruction = `
          You are "Terserah AI", the coolest personal assistant from Malang. 
          Current time in Malang: ${currentTimeString}.
          
          Style: Friendly, trendy Gen Z (use terms like "kak", "gaul", "bestie", etc.), but helpful and informative.
          Language: Strictly use ${language === 'id' ? 'Indonesian' : 'English'}.
          
          RESPONSE LENGTH & STYLE GUIDELINE:
          Adjust your response length dynamically based on the user's query context:
          - If the user sends a short message, simple greeting, or casual chit-chat, reply briefly and conversational (1-2 sentences).
          - If the user asks for recommendations, detailed comparisons, explanations, or culinary advice, provide a rich, detailed, and helpful response.
          - Make smart self-decisions on response length so your answers feel natural, informative, and engaging.

          CREATOR & FOUNDER INFO:
          Jika user tanya siapa pembuat, founder, pencipta, atau tim di balik aplikasi ini, jelaskan dengan gaya asik khas Gen Z (jangan kaku!):
          - Pencipta utamanya adalah Kak Rakha Aminullah, seorang mahasiswa di Universitas Muhammadiyah Malang (UMM) jurusan Informatika.
          - Aplikasi ini awalnya dikembangkan sebagai bagian dari tugas kampusnya yang menantang mahasiswa untuk membangun aplikasi keren.
          - Tapi Kak Rakha tidak bergerak sendirian! Ada dua bestie hebat lainnya dari kampus yang sama-sama mahasiswa Informatika UMM yang turut membantu mengembangkan aplikasi ini, yaitu Muhammad Rosyad dan Gilang Saputra (tim solid banget!).
          - Sampaikan info ini dengan bangga dan santai, tunjukkan kalau aplikasi ini adalah karya lokal mahasiswa teknologi Malang yang kece abis!
          
          Capabilities:
          1. General Assistant: You can answer common questions (time, greetings, general facts, jokes).
          2. Culinary Specialist: You have access to a local food database to help users decide what to eat in Malang.
          3. Feature Update: We have a new feature called "Kuliner Feed" (Short Feed). It's an immersive video feed of the best food spots.
          
          Important Note on "Kuliner Feed":
          - It is currently in BETA testing.
          - Currently only provides 32 exclusive feed videos as we are still developing more content.
          - If users ask about new features or videos, mention this "Kuliner Feed" and its beta status.
          
          Food Database (Strictly use these names):
          ${JSON.stringify(foods.map(f => ({ id: f.id, nama: f.nama, jenis: f.jenis, tags: f.tags })))}
          
          Guidelines for Recommendations:
          - ONLY recommend food from the database list above.
          - If a user asks for a specific food (e.g., "Nasi Goreng Ampela", "Pizza", etc.) that is NOT in the database list above:
            - You MUST NOT recommend it.
            - You MUST reply: "${language === 'id' ? 'Untuk saat ini Aplikasi Terserah belum menyediakan makanan tersebut karena keterbatasan data, yang di mana app ini masih dalam pengembangan.' : 'For now, the Terserah Application does not provide that food yet due to data limitations, as this app is still in development.'}"
            - Do not try to find "closest matches" unless they are explicitly in the database.
          - ONLY recommend food if:
            a) The user explicitly asks for suggestions, recommendations, or what to eat.
            b) The user is confused about food choices.
            c) It fits naturally with the conversation about time (e.g., if user asks the time and it's 12:00, you can mention lunch).
          - If answering a general question (like "jam berapa sekarang?"), answer directly first. You may *briefly* slip in a food suggestion related to that time ONLY if it is in the database and it feels natural. 
          - If the user asks a general question unrelated to food, just answer normally without forcing food recommendations.
          - Do not be "overly" repetitive with food suggestions.
          - KEEP FOOD NAMES IN INDONESIAN as they are in the database.
        `;

        for (let i = 0; i < keysToTry.length; i++) {
          const keyIndex = keysToTry[i];
          const apiKey = API_KEYS[keyIndex] || process.env.GEMINI_API_KEY; // Fallback to env key if present
          
          if (!apiKey) continue;

          try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              config: {
                systemInstruction: systemInstruction,
              },
              contents: [
                ...messages.map(m => ({
                  role: m.role === 'user' ? 'user' : 'model',
                  parts: [{ text: m.text }]
                })),
                { role: 'user', parts: [{ text: input }] }
              ],
            });

            lastResult = response;
            success = true;
            break;
          } catch (error: any) {
            const errMsg = error.message?.toLowerCase() || "";
            if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("limit")) {
              console.warn(`API Key at index ${keyIndex} reached limit, trying next...`);
              continue;
            } else {
              console.error(`Error with API Key at index ${keyIndex}:`, error);
              continue;
            }
          }
        }

        if (!success) {
          setIsLoading(false);
          await typeMessage((t as any).chatMaintenance || "Oops, service is currently busy. Please try again later!");
          return;
        }

        const botText = lastResult.text || (language === 'id' ? "Waduh, koneksi lagi lambat nih. Coba lagi ya!" : "Ops, connection is slow. Try again!");
        
        // Strict matching for indicated foods
        const suggestedFoods = foods.filter(f => 
          botText.includes(f.nama) || // Case sensitive check to be more precise with Indonesian names
          botText.toLowerCase().includes(f.nama.toLowerCase())
        ).slice(0, 3);

        setIsLoading(false);
        await typeMessage(botText, suggestedFoods.length > 0 ? suggestedFoods : undefined);
      } catch (error) {
        console.error("Chat Error:", error);
        setIsLoading(false);
        await typeMessage(language === 'id' ? "Aduh, sepertinya server sedang bermasalah. Coba sebentar lagi ya!" : "Ops, looks like server has problem. Try again later!");
      }
    };

    const renderText = (text: string) => {
      // Support both **text** and *text*
      const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-black text-[#1A9E5C]">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <strong key={i} className="font-black text-[#1A9E5C]">{part.slice(1, -1)}</strong>;
        }
        return part;
      });
    };

    return (
      <div className={`flex flex-col h-screen max-h-[calc(100vh-96px)] transition-colors duration-300 relative overflow-hidden ${darkMode ? 'bg-black' : 'bg-[#f0f2f5]'}`}>
        
        {/* Sidebar Sidebar Overlay */}
        <AnimatePresence>
          {showSidebar && (
            <div className="fixed inset-x-0 top-0 bottom-0 z-[99] pointer-events-auto overflow-hidden">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSidebar(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className={`absolute top-0 left-0 h-full w-[85%] max-w-[320px] shadow-2xl flex flex-col pb-24 ${
                  darkMode ? 'bg-[#121212] border-r border-white/10' : 'bg-white border-r border-black/5'
                }`}
              >
                <div className={`p-6 pt-12 flex items-center justify-between border-b ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
                  <div className="flex items-center gap-3">
                    <h2 className={`font-black tracking-tight text-xl ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>MENU</h2>
                  </div>
                  <button onClick={() => setShowSidebar(false)} className={`p-2 rounded-xl transition-all active:scale-95 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-[#1A1A2E] hover:bg-gray-100'}`}>
                    <CloseIcon size={20} />
                  </button>
                </div>

                <div className="p-4">
                  <button 
                    onClick={startNewChat}
                    className={`w-full p-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 hover:brightness-110 ${
                      darkMode ? 'bg-[#1A9E5C] text-white shadow-[0_8px_20px_rgba(26,158,92,0.3)]' : 'bg-[#1A9E5C] text-white shadow-lg shadow-[#1A9E5C]/20'
                    }`}
                  >
                    <Plus size={18} strokeWidth={3} />
                    {t.chatNewChat}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t.chatHistory}
                  </p>
                  {sortedHistory.length === 0 ? (
                    <div className="py-10 text-center opacity-40">
                      <p className="text-xs font-bold">{t.chatEmpty}</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Menu Overlay to block clicks and close menu */}
                      <AnimatePresence>
                        {activeMenuId && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveMenuId(null)}
                            className="fixed inset-0 z-[125]"
                          />
                        )}
                      </AnimatePresence>

                      <div className="space-y-2">
                        {sortedHistory.map(session => (
                          <div key={session.id} className="relative group/item">
                                <button
                                  onClick={() => !activeMenuId && loadSession(session)}
                                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                                    currentSessionId === session.id 
                                      ? (darkMode ? 'bg-[#1A9E5C]/10 border-[#1A9E5C]/30 text-[#1A9E5C]' : 'bg-[#1A9E5C]/5 border-[#1A9E5C]/20 text-[#1A9E5C]')
                                      : (darkMode ? 'bg-white/[0.02] border-white/[0.05] text-gray-300 hover:border-white/20 hover:bg-white/[0.05]' : 'bg-gray-50/50 border-black/[0.03] text-gray-600 hover:border-black/10 hover:bg-gray-100/50')
                                  }`}
                                >
                              <div className="flex-1 min-w-0 pr-6">
                                {editingId === session.id ? (
                                  <input
                                    autoFocus
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => handleRename(session.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRename(session.id)}
                                    className={`w-full bg-transparent border-b border-[#1A9E5C] outline-none font-bold text-xs ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <div className="flex items-center gap-2 pr-2 overflow-hidden">
                                    <p className="font-bold text-xs truncate">{session.title}</p>
                                    {session.isPinned && (
                                      <Star size={10} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                    )}
                                  </div>
                                )}
                                <p className="text-[9px] opacity-60 mt-0.5">
                                  {(() => {
                                    const date = new Date(session.lastUpdated);
                                    const now = new Date();
                                    const isToday = date.toDateString() === now.toDateString();
                                    return isToday 
                                      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                      : date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                                  })()}
                                </p>
                              </div>
                            </button>

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center z-[130]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === session.id ? null : session.id);
                                }}
                                className={`menu-toggle-btn p-2 rounded-xl transition-all shadow-sm ${
                                  activeMenuId === session.id 
                                    ? 'bg-[#1A9E5C] text-white' 
                                    : (currentSessionId === session.id ? 'bg-white/10 opacity-100' : 'opacity-0 group-hover/item:opacity-100 focus:opacity-100')
                                } ${darkMode ? 'hover:bg-white/20 text-gray-300' : 'hover:bg-black/5 text-gray-500'}`}
                              >
                                <MoreVertical size={16} />
                              </button>

                              <AnimatePresence>
                                {activeMenuId === session.id && (
                                  <motion.div
                                    ref={menuRef}
                                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                    className={`absolute right-10 top-0 py-1.5 min-w-[120px] rounded-xl shadow-2xl z-[140] border ${
                                      darkMode ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-black/5'
                                    }`}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingId(session.id);
                                        setEditValue(session.title);
                                        setActiveMenuId(null);
                                      }}
                                      className={`w-full px-3 py-2 text-left text-[10px] font-bold flex items-center gap-2.5 transition-colors ${
                                        darkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Edit2 size={12} className="text-blue-500" />
                                      </div>
                                      {language === 'id' ? 'Ubah Nama' : 'Rename'}
                                    </button>
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePin(session.id);
                                      }}
                                      className={`w-full px-3 py-2 text-left text-[10px] font-bold flex items-center gap-2.5 transition-colors ${
                                        darkMode ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                                      }`}
                                    >
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${session.isPinned ? 'bg-yellow-500/10' : 'bg-gray-500/10'}`}>
                                        <Star size={12} className={session.isPinned ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
                                      </div>
                                      {session.isPinned 
                                        ? (language === 'id' ? 'Lepas Pin' : 'Unpin') 
                                        : (language === 'id' ? 'Sematkan' : 'Pin')}
                                    </button>

                                    <div className={`mx-2 my-1 border-t ${darkMode ? 'border-white/5' : 'border-black/5'}`} />

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(language === 'id' ? 'Hapus percakapan ini?' : 'Delete this chat?')) {
                                          handleDelete(session.id);
                                        }
                                      }}
                                      className={`w-full px-3 py-2 text-left text-[10px] font-bold flex items-center gap-2.5 transition-colors ${
                                        darkMode ? 'hover:bg-white/5 text-red-400' : 'hover:bg-red-50 text-red-500'
                                      }`}
                                    >
                                      <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <Trash size={12} className="text-red-500" />
                                      </div>
                                      {language === 'id' ? 'Hapus' : 'Delete'}
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
                  <div className={`p-3 rounded-xl text-[8px] leading-relaxed ${darkMode ? 'bg-orange-500/5 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                    <p className="font-black uppercase tracking-wider mb-0.5 flex items-center gap-1.5 line-clamp-1">
                      <Clock size={8} />
                      {t.chatHistoryNoteTitle}
                    </p>
                    <p className="opacity-80 leading-tight">{t.chatHistoryNote}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className={`px-6 pt-8 pb-4 flex items-center justify-between border-b transition-colors z-[90] ${darkMode ? 'bg-black/80 backdrop-blur-xl border-white/10' : 'bg-white border-black/5'}`}>
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSidebar(true)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                darkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Menu size={22} />
            </motion.button>
            <div>
              <h2 className={`font-black text-sm tracking-tight ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{t.chatHeader}</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.chatStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 pt-6 no-scrollbar relative flex flex-col"
        >
          <div className="flex-1" />
          <AnimatePresence>
            {messages.length === 0 && (
              <div 
                className="absolute inset-0 flex items-center justify-center p-12 text-center pointer-events-none opacity-30"
              >
                <p className={`${darkMode ? 'text-white' : 'text-[#1A1A2E]'} text-lg font-medium leading-relaxed`}>
                  {t.chatIntro}
                </p>
              </div>
            )}
          </AnimatePresence>

          <div className="space-y-6 pb-14">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm break-words ${
                    msg.role === 'user' 
                      ? 'bg-[#1A9E5C] text-white rounded-tr-none' 
                      : (darkMode ? 'bg-[#121212] text-white rounded-tl-none border border-white/10' : 'bg-gray-100 text-[#1A1A2E] rounded-tl-none border border-black/5')
                  }`}>
                    {msg.isChessTrigger ? (
                      <div className="space-y-4">
                        <div className={`relative w-full aspect-video rounded-2xl overflow-hidden border ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
                          <img 
                            src="https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=800&auto=format&fit=crop" 
                            className="w-full h-full object-cover"
                            alt="Chess Banner"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                            <p className="text-white font-black text-lg tracking-tighter">SECRET CHESS</p>
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap">{renderText(msg.text)}</p>
                        <button
                          onClick={() => setShowChess(true)}
                          className="w-full py-4 bg-yellow-400 text-[#0F172A] rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 active:scale-95 transition-all"
                        >
                          <Play size={18} fill="currentColor" />
                          {t.chatPlayChess}
                        </button>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{renderText(msg.text)}</div>
                    )}
                  </div>
                  
                  {msg.suggestedFoods && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                      {msg.suggestedFoods.map((food, i) => (
                          <motion.div
                            key={`${msg.id}-${food.id}-${i}`}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onFoodClick(food)}
                            className={`flex-shrink-0 p-2 rounded-2xl border shadow-sm flex items-center gap-3 cursor-pointer transition-all ${
                              darkMode ? 'bg-[#121212] border-white/10 hover:border-[#1A9E5C]' : 'bg-white border-black/5 hover:border-[#1A9E5C]'
                            }`}
                          >
                          <img src={food.foto_url} className="w-10 h-10 rounded-xl object-cover" />
                          <div className="pr-2">
                            <p className={`text-[10px] font-bold whitespace-nowrap ${darkMode ? 'text-white' : 'text-[#1A1A2E]'}`}>{food.nama}</p>
                            <div className="flex items-center gap-1 text-[8px] text-gray-400">
                              <Star size={8} className="text-yellow-500 fill-yellow-500" />
                              {food.rating}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  <span className="text-[8px] text-gray-400 font-medium px-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`p-4 rounded-3xl rounded-tl-none border flex items-center transition-all ${darkMode ? 'bg-[#121212] border-white/10' : 'bg-gray-100 border-black/5'}`}>
                  <div className="flex gap-1 px-1">
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chess Game Overlay */}
        <AnimatePresence>
          {showChess && (
            <SecretChess onClose={() => setShowChess(false)} darkMode={darkMode} />
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 z-[50] px-4 pb-1 pointer-events-none">
          {/* Soft Background Fade */}
          <div className={`absolute -bottom-4 left-0 right-0 h-20 pointer-events-none ${
            darkMode 
              ? 'bg-gradient-to-t from-black via-black/95 to-transparent' 
              : 'bg-gradient-to-t from-[#f0f2f5] via-[#f0f2f5]/95 to-transparent'
          }`} />

          <div className="mx-auto w-full max-w-4xl flex items-center gap-2 relative z-10 pointer-events-auto">
            <div 
              className={`flex-1 flex items-center relative rounded-[2.5rem] border transition-all ${
                darkMode 
                  ? `${isFocused ? 'bg-[#1A1A1A] border-[#1A9E5C]/50' : 'bg-[#1A1A1A]/80 border-white/10'} shadow-xl` 
                  : `${isFocused ? 'bg-white border-[#1A9E5C]/50' : 'bg-white/80 border-black/5'} shadow-md`
              } backdrop-blur-xl`}
            >
              <input
                type="text"
                value={input}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.chatPlaceholder}
                className={`flex-1 bg-transparent pl-8 pr-4 py-5 text-base outline-none border-none ${
                  darkMode ? 'text-white' : 'text-[#1A1A2E]'
                }`}
              />
            </div>
            
            <div className="flex-shrink-0">
              {showSendButton ? (
                <button
                  onClick={handleSend}
                  disabled={isLoading || isTyping || !input.trim()}
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                    isLoading || isTyping || !input.trim()
                      ? (darkMode ? 'bg-white/5 text-gray-700' : 'bg-gray-100 text-gray-400')
                      : 'bg-[#1A9E5C] text-white shadow-xl active:scale-95 hover:brightness-110'
                  }`}
                >
                  <Send size={20} strokeWidth={2.5} />
                </button>
              ) : (
                <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all opacity-20 ${
                  darkMode ? 'bg-white/5 text-white' : 'bg-white text-[#1A1A2E]'
                }`}>
                  <Send size={20} strokeWidth={2.5} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
