import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Pause, ExternalLink, RefreshCcw, Volume2, VolumeX, Upload, Video, Loader2, CheckCircle2, Heart, MessageCircle, User, Settings, Camera, LogOut, Trash2, MoreVertical, ChevronLeft, Calendar, Home, LogIn, AlertTriangle, Send, Link as LinkIcon, Info, HelpCircle, Globe, WifiOff, Image, ArrowLeft, ArrowRight, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Language, translations } from '../translations';
import { localVideos } from '../data/LocalVideo/localVideos';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { supabase, SUPABASE_BUCKET, isSupabaseConfigured, isSupabaseAvailable } from '../lib/supabase';
import Cropper from 'react-easy-crop';

interface VideoData {
  id: string; // Changed to string (fileName or legacy ID)
  fileName?: string;
  url: string;
  thumbnailUrl?: string;
  thumbnailPath?: string; // New: storage path for deletion
  tiktokUrl: string;
  description?: string; // New
  locationLink?: string; // New
  uploaderName?: string;
  uploaderId?: string;
  uploaderAvatar?: string; // New: resolved from profile
  createdAt?: string;
}

interface CommentData {
  id: string;
  video_id: string;
  video_owner_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_avatar_url: string;
  text: string;
  created_at: string;
  parent_id?: string | null;
  likes_count?: number;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
  created_at?: string;
  updated_at?: string;
}

interface ProfileVideoItemProps {
  video: VideoData;
  onSelect: (v: VideoData) => void;
}

const ProfileVideoItem: React.FC<ProfileVideoItemProps> = ({ video: v, onSelect }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useVideoFallback, setUseVideoFallback] = useState(false);
  
  return (
    <div className="aspect-[3/4] bg-white/5 rounded-sm overflow-hidden relative group cursor-pointer border border-white/5" onClick={() => onSelect(v)}>
      <AnimatePresence>
        {(!isLoaded && !hasError) && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-[#121212] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={16} className="text-[#1A9E5C] animate-spin opacity-50" />
              <span className="text-[7px] text-white/20 font-black uppercase tracking-widest">Loading</span>
            </div>
          </motion.div>
        )}
        {(hasError && !useVideoFallback) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 bg-[#1a1a1a] flex flex-col items-center justify-center p-2 text-center"
          >
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
              <AlertTriangle size={14} className="text-red-500 opacity-50" />
            </div>
            <span className="text-[7px] text-white/40 font-bold uppercase tracking-tighter leading-tight">Video<br/>Unavailable</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 p-2 z-10 pointer-events-none">
        {v.createdAt && (
          <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-md w-fit">
            <Calendar size={8} />
            {new Date(v.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            <span className="opacity-50 ml-1">
              {new Date(v.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        )}
      </div>
      {v.thumbnailUrl && !useVideoFallback ? (
        <img 
          src={v.thumbnailUrl} 
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setUseVideoFallback(true);
            setIsLoaded(false);
          }}
          referrerPolicy="no-referrer"
        />
      ) : (
        <video 
          src={`${v.url}#t=0.5`} 
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'}`} 
          preload="metadata"
          playsInline
          muted
          crossOrigin="anonymous"
          onLoadedData={(e) => {
            const vid = e.target as HTMLVideoElement;
            try { vid.currentTime = 0.5; } catch(err) {}
            setIsLoaded(true);
            setHasError(false);
          }}
          onCanPlay={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
        <Play size={18} className="text-[#1A9E5C] fill-[#1A9E5C]/20" />
      </div>
    </div>
  );
};

interface ShortFeedProps {
  onBack: () => void;
  darkMode: boolean;
  language: Language;
}

const getDirectLink = (url: string) => {
  if (!url) {
    return 'https://assets.mixkit.co/videos/preview/mixkit-serving-food-in-a-restaurant-41460-large.mp4';
  }
  return url;
};

const RAW_VIDEOS: VideoData[] = []; // Menghapus data raw agar feed bersih untuk upload Supabase

// Global Profile Cache to avoid redundant network calls in VideoItem
const profileCache: Record<string, any> = {};

// Global Video Cache to reduce Supabase queries and listing calls to zero after first successful fetch
let globalVideosCache: VideoData[] | null = null;
let globalIsOfflineMode: boolean = false;

const VideoItemSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full min-h-full bg-[#121212] flex flex-col justify-between p-6 relative overflow-hidden snap-start snap-always shrink-0">
      {/* Background with custom shimmer wave */}
      <div className="absolute inset-0 bg-[#161616] flex items-center justify-center z-0">
        <Loader2 className="w-8 h-8 text-[#1A9E5C]/10 animate-spin" />
      </div>

      {/* Header Area Skeleton */}
      <div className="flex justify-between items-center z-10 w-full pt-10 opacity-70">
        <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse border border-white/10" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-white/5 rounded-full animate-pulse border border-white/10" />
          <div className="h-8 w-8 bg-white/5 rounded-full animate-pulse border border-white/10" />
        </div>
      </div>

      {/* Info details & Right Action icons Skeleton */}
      <div className="flex justify-between items-end z-10 w-full pb-16">
        {/* Caption details layout */}
        <div className="flex flex-col gap-3 w-[65%]">
          {/* Location link pill */}
          <div className="h-5 w-24 bg-white/5 rounded-full animate-pulse border border-white/10" />
          {/* Creator detail row */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse border border-white/10" />
            <div className="h-4 w-24 bg-white/5 rounded-md animate-pulse" />
          </div>
          {/* Caption text line wrappers */}
          <div className="h-3.5 w-full bg-white/5 rounded-md animate-pulse" />
          <div className="h-3.5 w-[75%] bg-white/5 rounded-md animate-pulse" />
        </div>

        {/* Action controls skeleton column */}
        <div className="flex flex-col items-center gap-5 pr-1 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 animate-pulse" />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse border border-white/10" />
            <div className="h-2 w-6 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse border border-white/10" />
            <div className="h-2 w-6 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

const OFFLINE_SYSTEM_PROFILE = {
  id: 'offline-system-profile',
  email: '',
  username: 'kuliner_feed',
  display_name: 'Kuliner Feed',
  avatar_url: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface VideoItemProps {
  data: VideoData;
  index: number;
  volume: number;
  language: Language;
  currentUser: any;
  isVerified: boolean;
  onProfileClick: (name: string) => void;
  onDelete: (video: VideoData) => void;
  onEdit?: (video: VideoData) => void;
  onCommentClick: (video: VideoData) => void;
  onWatch: (id: string, index: number) => void;
  onLike: (id: string, liked: boolean) => void;
  onMoreClick: (video: VideoData) => void;
  isActive: boolean;
  isLikedInitially: boolean;
  isOfflineMode?: boolean;
  isModal?: boolean;
  onBack?: () => void;
}

const VideoItem = React.memo<VideoItemProps>(({ 
  data, index, volume, language, currentUser, isVerified, onProfileClick, onDelete, onEdit, onCommentClick, onWatch, onLike, onMoreClick, isActive, isLikedInitially, isOfflineMode, isModal, onBack 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const t = translations[language];
  const [showIndicator, setShowIndicator] = useState(false);
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLiked, setIsLiked] = useState(isLikedInitially);
  const [isExpanded, setIsExpanded] = useState(false);
    useEffect(() => {
    setIsLiked(isLikedInitially);
  }, [isLikedInitially, data.id]);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Resolved Profile data
  const [uploaderProfile, setUploaderProfile] = useState<any>(profileCache[data.uploaderId || ''] || null);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const updatedProfile = e.detail;
      if (updatedProfile.id === data.uploaderId) {
        setUploaderProfile(updatedProfile);
      }
    };
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, [data.uploaderId]);

  useEffect(() => {
    if (isOfflineMode) return;
    if (data.uploaderId) {
      if (profileCache[data.uploaderId]) {
        setUploaderProfile(profileCache[data.uploaderId]);
        return;
      }

      const fetchProfile = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username, avatar_url')
            .eq('id', data.uploaderId)
            .maybeSingle();
          if (profile) {
            profileCache[data.uploaderId!] = profile;
            setUploaderProfile(profile);
          }
        } catch (err) {
          console.error("Fetch profile in item error:", err);
        }
      };
      fetchProfile();
    }
  }, [data.uploaderId]);

  const displayName = uploaderProfile?.display_name || uploaderProfile?.username || data.uploaderName || t.feedGuestName;
  const avatarUrl = uploaderProfile?.avatar_url || null;

  const handleLike = () => {
  if (!currentUser && isOfflineMode) {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    onLike(data.id, newLiked);

    if (newLiked) {
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    }

    return;
  }

  if (!currentUser) {
    onLike(data.id, !isLiked);
    return;
  }

  const newLiked = !isLiked;
  setIsLiked(newLiked);
  onLike(data.id, newLiked);

  if (newLiked) {
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  }
};

  const [isInViewport, setIsInViewport] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    setIsVideoLoaded(false);
  }, [isActive, data.id]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && (isModal || isInViewport)) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive, isInViewport, isModal]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
            onWatch(data.id, index);
          } else {
            setIsInViewport(false);
            if (videoRef.current) {
              videoRef.current.playbackRate = 1;
              setIsFastForwarding(false);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = volume === 0;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!isActive) return; // Prevent manual play trigger of inactive videos
    if (videoRef.current && !isFastForwarding) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 600);
    }
  };

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const width = window.innerWidth;
    
    // Check if press is on left side (<15%) or right side (>85%)
    // The user specifically asked for both sides to work for 2x speed but limited radius
    if (clientX > width * 0.85 || clientX < width * 0.15) {
      longPressTimer.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.playbackRate = 2;
          setIsFastForwarding(true);
        }
      }, 350); // Faster trigger for better feel
    }
  };

  const handlePressEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    if (isFastForwarding) {
      // Prevent the immediate click from pausing the video
      e.stopPropagation();
      if (videoRef.current) {
        videoRef.current.playbackRate = 1;
        // Small delay to ensure any pending click event doesn't see isFastForwarding as false
        setTimeout(() => setIsFastForwarding(false), 100);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (!isNaN(total) && total > 0) setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current || isNaN(duration) || duration <= 0) return;
    const val = parseFloat(e.target.value);
    videoRef.current.currentTime = (val / 100) * duration;
    setProgress(val);
  };

  return (
    <div ref={containerRef} data-video-index={index} className="w-full h-full min-h-full snap-start snap-always relative flex items-center justify-center bg-black overflow-hidden shrink-0">
      <div 
        className="w-full h-full relative"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        <div onClick={togglePlay} className="absolute inset-0 z-30 cursor-pointer select-none" />
        
        {/* Modal Back Button */}
        {isModal && onBack && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className="absolute top-12 left-6 z-[100] p-3.5 bg-black/40 backdrop-blur-2xl rounded-2xl text-white border border-white/20 active:scale-95 transition-all shadow-2xl"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
        )}

        {/* 2x Speed Indicator Overlay - Centered and Bold */}
        <AnimatePresence>
          {isFastForwarding && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none"
            >
              <div className="bg-black/60 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/20 flex flex-col items-center gap-1.5 shadow-2xl">
                <div className="flex gap-1">
                  <Play size={12} className="text-[#1A9E5C] fill-[#1A9E5C] animate-[pulse_0.5s_infinite]" />
                  <Play size={12} className="text-[#1A9E5C] fill-[#1A9E5C] animate-[pulse_0.5s_infinite] delay-75" />
                </div>
                <span className="text-[#1A9E5C] text-[8px] font-black uppercase tracking-[0.2em]">{t.feedSpeed}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showIndicator && !isFastForwarding && (
            <motion.div initial={{ opacity: 0, scale: 0.5, x: '-50%', y: '-50%' }} animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }} exit={{ opacity: 0, scale: 1.2, x: '-50%', y: '-50%' }} className="absolute top-1/2 left-1/2 z-30 pointer-events-none">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                {isPlaying ? <Pause size={24} className="text-white fill-white" /> : <Play size={24} className="text-white fill-white" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative w-full h-full flex flex-col justify-center bg-black overflow-hidden pb-16">
          {/* Shimmer background placeholder (never a blank box) */}
          <div className="absolute inset-0 bg-[#161616] animate-pulse z-0 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#1A9E5C]/15 animate-spin" />
            <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
          </div>

          {/* Thumbnail image displayed on top of the video until it is loaded and playing */}
          {data.thumbnailUrl && (!isPlaying || !isVideoLoaded) && (
            <img 
              src={data.thumbnailUrl} 
              alt="Video Thumbnail" 
              className="absolute inset-0 w-full h-full object-cover z-25 transition-opacity duration-500 pointer-events-none"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              referrerPolicy="no-referrer"
            />
          )}

          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-30 p-10 text-center backdrop-blur-sm">
              <div className="bg-red-500/20 p-4 rounded-full mb-4">
                <RefreshCcw size={32} className="text-red-400" />
              </div>
              <p className="text-white text-xs font-bold uppercase tracking-widest">{t.feedError}</p>
              <p className="text-gray-400 text-[10px] mt-2 mb-6 leading-relaxed">{t.feedErrorSub}</p>
              <div className="flex flex-col gap-3 w-full max-w-[200px]">
                <button 
                  onClick={() => {
                    setHasError(false);
                    if (videoRef.current) videoRef.current.load();
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-2 rounded-lg transition-all"
                >
                  {t.feedTryAgain}
                </button>
                <a 
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#1A9E5C]/20 hover:bg-[#1A9E5C]/30 text-[#1A9E5C] text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {t.feedOpenLink}
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )}
          <video 
            ref={videoRef} 
            src={getDirectLink(data.url)} 
            className="w-full h-auto aspect-[9/16] object-cover bg-black shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20 relative" 
            loop 
            playsInline
            muted={volume === 0}
            preload="auto"
            crossOrigin="anonymous"
            onTimeUpdate={handleTimeUpdate} 
            onLoadedMetadata={() => {
              setDuration(videoRef.current?.duration || 0);
              setHasError(false);
            }}
            onError={() => setHasError(true)}
            onPlaying={() => setIsVideoLoaded(true)}
            onCanPlay={() => setIsVideoLoaded(true)}
            onLoadedData={() => setIsVideoLoaded(true)}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-40 px-6 pb-26 pt-20 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex items-end justify-between pointer-events-none">
          <div className="flex flex-col gap-2 max-w-[70%] pointer-events-auto">
            {data.locationLink && (
              <button 
                id={`video-location-link-${data.id}`}
                onClick={(e) => { e.stopPropagation(); window.open(data.locationLink, '_blank'); }}
                className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-white w-fit mb-1 active:scale-95 transition-transform"
              >
                <MapPin size={10} className="text-[#1A9E5C]" />
                <span className="text-[10px] font-black uppercase tracking-widest">{language === 'id' ? 'Lihat Lokasi' : 'View Location'}</span>
                <ExternalLink size={8} className="opacity-50" />
              </button>
            )}
            <button 
              onClick={() => onProfileClick(displayName)}
              className="flex items-center gap-2 mb-1 group"
            >
              <div className="w-7 h-7 rounded-full bg-[#1A9E5C] flex items-center justify-center border border-white/20 shadow-lg group-active:scale-95 transition-transform overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-white/40" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white font-bold text-xs drop-shadow-md">
                  @{displayName}
                </span>
                {isVerified && (
                  <CheckCircle2 size={12} className="text-[#1A9E5C] fill-[#1A9E5C]/20" />
                )}
              </div>
            </button>
            {data.description && (
              <div className="flex flex-col gap-1 items-start relative">
                {isExpanded && (
                  <div className="absolute -inset-x-4 -inset-y-2 bg-gradient-to-b from-transparent via-black/60 to-black/80 blur-xl pointer-events-none z-[-1]" />
                )}
                <p 
                  className={`text-white/80 text-[11px] drop-shadow-sm leading-snug transition-all duration-300 relative z-10 ${isExpanded ? 'max-h-[30vh] overflow-y-auto no-scrollbar pr-2' : 'line-clamp-2'}`}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {data.description}
                </p>
                {data.description.length > 80 && (
                  <button 
                    id={`video-description-toggle-${data.id}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-1 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>Sembunyikan <ChevronUp size={10} /></>
                    ) : (
                      <>Selengkapnya <ChevronDown size={10} /></>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 pointer-events-auto mb-12">
            {/* Profile Avatar (TikTok Style) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick(displayName);
              }}
              className="relative mb-2 group active:scale-90 transition-transform"
            >
              <div className="w-10 h-10 rounded-full border-[2px] border-white bg-gradient-to-tr from-[#1A9E5C] to-[#1A9E5C] p-0.5 shadow-xl relative animate-[pulse_3s_infinite]">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-white/40" />
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1A9E5C] text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-black font-black text-[9px] shadow-lg group-active:scale-90 transition-transform">
                +
              </div>
            </button>

            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className="flex flex-col items-center gap-0"
            >
              <Heart 
                size={26} 
                className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
              />
              <span className="text-[9px] text-white/80 drop-shadow-md">{t.feedLike}</span>
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={() => onCommentClick(data)}
              className="flex flex-col items-center gap-0"
            >
              <MessageCircle 
                size={26} 
                className="text-white" 
                style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
              />
              <span className="text-[9px] text-white/80 drop-shadow-md">{t.feedComment}</span>
            </motion.button>

            {data.tiktokUrl && (data.uploaderId !== currentUser?.id) && (
              <motion.button 
                whileTap={{ scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(data.tiktokUrl, '_blank');
                }}
                className="flex flex-col items-center gap-0"
              >
                <LinkIcon 
                  size={26} 
                  className="text-white" 
                  style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
                />
                <span className="text-[9px] text-white/80 drop-shadow-md">{t.feedSource}</span>
              </motion.button>
            )}

            {(currentUser && (data.uploaderId === currentUser.id || currentUser.email === 'thewaking5@gmail.com')) && (
              <motion.button 
                whileTap={{ scale: 0.8 }}
                onClick={() => onMoreClick?.(data)}
                className="flex flex-col items-center gap-0"
              >
                <MoreVertical 
                  size={26} 
                  className="text-white" 
                  style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
                />
                <span className="text-[9px] text-white/80 drop-shadow-md">Menu</span>
              </motion.button>
            )}

            <a href={data.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-0 opacity-0 pointer-events-none absolute truncate">
              {/* Hidden hidden link for back compatibility or SEO? User wants it in action sheet now */}
            </a>
          </div>
        </div>

        <AnimatePresence>
          {showHeartAnim && (
            <motion.div 
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1.5, y: -50 }}
              exit={{ opacity: 0, scale: 2, y: -100 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] pointer-events-none"
            >
              <Heart size={40} className="fill-red-500 text-red-500 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar (Raised to be extremely safe, above the slim bottom bar) */}
        <div className="absolute bottom-[72px] left-0 right-0 z-50 px-4 pointer-events-none mb-2">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress} 
            onChange={handleSeek} 
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#1A9E5C] pointer-events-auto shadow-sm" 
            style={{ background: `linear-gradient(to right, #1A9E5C ${progress}%, rgba(255,255,255,0.2) ${progress}%)` }} 
          />
        </div>
      </div>
    </div>
  );
});

export const ShortFeed: React.FC<ShortFeedProps> = ({ onBack, darkMode, language }) => {
  const t = translations[language];
  const [isOfflineMode, setIsOfflineMode] = useState(() => globalIsOfflineMode);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [allVideosPool, setAllVideosPool] = useState<VideoData[]>(() => globalVideosCache || []);
  const [visibleCount, setVisibleCount] = useState(6);
  const [videoFeed, setVideoFeed] = useState<VideoData[]>(() => {
    if (globalVideosCache) {
      return globalVideosCache.slice(0, 6);
    }
    return [];
  });

  useEffect(() => {
    if (allVideosPool.length > 0) {
      setVideoFeed(allVideosPool.slice(0, visibleCount));
    } else {
      setVideoFeed([]);
    }
  }, [allVideosPool, visibleCount]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [volume, setVolume] = useState(1); 
  const [showBetaInfo, setShowBetaInfo] = useState(false);
  const [showOfflineSwitchModal, setShowOfflineSwitchModal] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<VideoData | null>(null);
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [editThumbnailBlob, setEditThumbnailBlob] = useState<Blob | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
  const [editThumbnailMode, setEditThumbnailMode] = useState<'video' | 'custom'>('video');
  const [editThumbnailTimestamp, setEditThumbnailTimestamp] = useState(0.5);
  const [isSavingVideoEdit, setIsSavingVideoEdit] = useState(false);
  const [onlineSwitchError, setOnlineSwitchError] = useState<string | null>(null);
  const editThumbnailInputRef = useRef<HTMLInputElement>(null);

  const [inputDescription, setInputDescription] = useState('');
  const [inputLocationLink, setInputLocationLink] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocationLink, setEditLocationLink] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [actionSheetVideo, setActionSheetVideo] = useState<VideoData | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState(() => !globalVideosCache);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadStatusText, setUploadStatusText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [activeVideoForComments, setActiveVideoForComments] = useState<VideoData | null>(null);
  const [modalVideo, setModalVideo] = useState<VideoData | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(true);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [viewingSpecificProfile, setViewingSpecificProfile] = useState<string | null>(null);

  // Auth State
  const [authUser, setAuthUser] = useState<any>(null);

  const [showUploadModal, setShowUploadModalState] = useState(() => {
    return sessionStorage.getItem('show_upload_modal') === 'true';
  });
  const setShowUploadModal = (show: boolean) => {
    sessionStorage.setItem('show_upload_modal', show.toString());
    setShowUploadModalState(show);
  };

  // Custom Notification System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Follow System State (Synced Global)
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [followersMap, setFollowersMap] = useState<Record<string, string[]>>({});

  const [showFollowListModal, setShowFollowListModal] = useState<'followers' | 'following' | null>(null);

  // Profile State
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  
  const authUserRef = useRef<any>(null);
  const currentProfileRef = useRef<any>(null);

  useEffect(() => {
    authUserRef.current = authUser;
  }, [authUser]);

  useEffect(() => {
    currentProfileRef.current = currentProfile;
  }, [currentProfile]);

  const [userName, setUserName] = useState(() => localStorage.getItem('profile_name') || translations[language].feedGuestName);
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('profile_avatar') || '');
  const [viewedProfileAvatar, setViewedProfileAvatar] = useState<string | null>(null);
  const [viewedProfileDisplayName, setViewedProfileDisplayName] = useState<string | null>(null);
  const [viewedProfileId, setViewedProfileId] = useState<string | null>(null);

  // Cropper State
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback((_area: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleProfileUpdateSuccess = (profile: UserProfile) => {
    setCurrentProfile(profile);
    setUserName(profile.display_name || profile.username);
    setUserAvatar(profile.avatar_url);
    localStorage.setItem('profile_name', profile.display_name || profile.username);
    localStorage.setItem('profile_avatar', profile.avatar_url);
    setTempUserName(profile.display_name || profile.username);
    setTempUserAvatar(profile.avatar_url);
    
    // Consistency: update global cache and notify items
    profileCache[profile.id] = profile;
    window.dispatchEvent(new CustomEvent('profile-updated', { detail: profile }));
  };

  const getOrCreateProfile = async (authUser: any) => {
    if (!authUser || !supabase) return null;

    try {
      const { data: existing, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        handleProfileUpdateSuccess(existing);
        return existing;
      }

      const defaultUsername = authUser.email?.split('@')[0] || `user_${authUser.id.slice(0, 5)}`;

      const newProfile = {
        id: authUser.id,
        email: authUser.email || '',
        username: defaultUsername,
        display_name: '', // Kolom nama dibiarkan kosong agar diisi sendiri
        avatar_url: '',  // Avatar default (kosong)
        updated_at: new Date().toISOString()
      };

      const { data: created, error: upsertError } = await supabase
        .from('profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select('*')
        .single();

      if (upsertError) throw upsertError;

      handleProfileUpdateSuccess(created);
      return created;
    } catch (err: any) {
      console.error('Profile sync error detail:', err);
      showToast(`Gagal sinkronisasi profil: ${err.message || JSON.stringify(err)}`, 'error');
      return null;
    } finally {
      setIsAuthChecking(false);
    }
  };

  const updateProfileName = async (newName: string) => {
    if (!authUser) return;
    try {
      const { data: updated, error } = await supabase
        .from('profiles')
        .update({ 
          display_name: newName, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', authUser.id)
        .select('*')
        .single();
      
      if (error) throw error;
      if (updated) {
        handleProfileUpdateSuccess(updated);
        showToast("Nama berhasil diperbarui", "success");
      }
    } catch (err: any) {
      showToast(`Gagal update nama: ${err.message}`, "error");
    }
  };

  const updateProfileAvatar = async (croppedBlob: Blob) => {
    if (!authUser) return;
    setIsCropping(true);
    try {
      const filePath = `${authUser.id}/profile.jpg`;
      
      // Upload/upsert target pixel
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
          upsert: true,
          contentType: 'image/jpeg'
        });
      
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`; // Add timestamp to break cache

      const { data: updated, error: dbError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id)
        .select('*')
        .single();

      if (dbError) throw dbError;
      if (updated) {
        handleProfileUpdateSuccess(updated);
        showToast("Foto profil berhasil diperbarui", "success");
      }
    } catch (err: any) {
      showToast(`Gagal update foto: ${err.message}`, "error");
    } finally {
      setIsCropping(false);
      setCropImage(null);
    }
  };

  const handleMoreClick = (v: VideoData) => {
    setActionSheetVideo(v);
    setShowActionSheet(true);
  };

  const [activeTab, setActiveTabState] = useState<'beranda' | 'tambah' | 'profile'>(() => {
    return (sessionStorage.getItem('feed_active_tab') as 'beranda' | 'tambah' | 'profile') || 'beranda';
  });
  const [feedHistory, setFeedHistory] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('feed_history');
    return saved ? JSON.parse(saved) : ['beranda'];
  });

  const setActiveTab = (tab: 'beranda' | 'tambah' | 'profile') => {
    sessionStorage.setItem('feed_active_tab', tab);
    setActiveTabState(tab);
  };

  useEffect(() => {
    sessionStorage.setItem('feed_history', JSON.stringify(feedHistory));
  }, [feedHistory]);

  const navigateFeed = (tab: 'beranda' | 'tambah' | 'profile') => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    setFeedHistory(prev => [...prev, tab]);
  };
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null);
  const uploadingFileNameRef = useRef<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVideoIdForFeed, setSelectedVideoIdForFeed] = useState<string | null>(null);
  const navigateToFeed = (videoId: string) => {
    setSelectedVideoIdForFeed(videoId);
    setViewingSpecificProfile(null);
    setActiveTab('beranda');
    setFeedHistory(['beranda']);
    setShowSettings(false);
    setShowProfile(false);
  };
  const [likeHistory, setLikeHistory] = useState<string[]>(() => JSON.parse(localStorage.getItem('like_history') || '[]'));
  const [watchHistory, setWatchHistory] = useState<string[]>(() => JSON.parse(localStorage.getItem('watch_history') || '[]'));
  const [currentSettingsView, setCurrentSettingsView] = useState<'menu' | 'edit-profile' | 'likes' | 'history'>('menu');

  // Global State from Backend
  const [globalComments, setGlobalComments] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);
  const [currentProfileFollowers, setCurrentProfileFollowers] = useState(0);
  const [currentProfileFollowing, setCurrentProfileFollowing] = useState(0);
  const [isFollowingActiveProfile, setIsFollowingActiveProfile] = useState(false);
  const [isSyncingFollow, setIsSyncingFollow] = useState(false);
  const [followerList, setFollowerList] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  const [videoToDelete, setVideoToDelete] = useState<VideoData | null>(null);
  const [showDeleteVideoConfirm, setShowDeleteVideoConfirm] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);

  const [profilePullProgress, setProfilePullProgress] = useState(0);
  const [isProfilePulling, setIsProfilePulling] = useState(false);
  const profileTouchStartY = useRef(0);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportCategory, setReportCategory] = useState<'bug' | 'account' | 'other' | ''>('');
  const [isReportCategoryOpen, setIsReportCategoryOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    name: '',
    email: '',
    explanation: ''
  });

  // Capacitor Back Button handling for nested views
  useEffect(() => {
    const handleBackButton = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        const listener = await CapApp.addListener('backButton', () => {
          // Priority handling for internal modals
          if (showComments) {
            setShowComments(false);
          } else if (showReportModal) {
            setShowReportModal(false);
          } else if (showUploadModal) {
            setShowUploadModal(false);
          } else if (showSettings) {
            if (currentSettingsView !== 'menu') {
              setCurrentSettingsView('menu');
            } else {
              setShowSettings(false);
            }
          } else if (viewingSpecificProfile) {
            setViewingSpecificProfile(null);
          } else if (feedHistory.length > 1) {
            const nextHistory = [...feedHistory];
            nextHistory.pop(); // remove current
            const prevTab = nextHistory[nextHistory.length - 1] as 'beranda' | 'tambah' | 'profile';
            setFeedHistory(nextHistory);
            setActiveTab(prevTab);
          } else if (activeTab !== 'beranda') {
            setActiveTab('beranda');
            setFeedHistory(['beranda']);
          } else {
            // No internal views open, call the parent's back handler
            onBack();
          }
        });
        return listener;
      } catch (e) {
        return null;
      }
    };

    let listenerPromise = handleBackButton();

    return () => {
      listenerPromise.then(l => l?.remove());
    };
  }, [showProfile, showSettings, showUploadModal, showComments, currentSettingsView, showReportModal, onBack, feedHistory, activeTab, viewingSpecificProfile]);

  useEffect(() => {
    if (activeTab !== 'beranda') {
      document.querySelectorAll('video').forEach((video) => {
        try {
          video.pause();
          // User requested: Lepaskan src agar memory/GPU tidak tetap dipakai saat tidak di feed
          if (!video.closest('.upload-preview')) { // Don't clear if it's the upload preview
            video.src = "";
            video.removeAttribute('src');
            video.load();
          }
        } catch (e) {
          console.error("Pause/Cleanup video error:", e);
        }
      });
    }
  }, [activeTab]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, _isEditProfile: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showToast("Foto terlalu besar (Max 5MB)", 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropImage(reader.result as string);
    });
    reader.readAsDataURL(file);
  };

  const getThumbnailPath = (fileName: string) => `thumbnails/${fileName}.jpg`;

  const captureVideoFrame = async (file: File, timestamp = 0.5): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const objectUrl = URL.createObjectURL(file);

      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.src = objectUrl;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        video.remove();
      };

      video.onloadedmetadata = () => {
        const safeTime = Math.min(timestamp, Math.max(video.duration - 0.1, 0));
        video.currentTime = safeTime;
      };

      video.onseeked = () => {
        try {
          const targetRatio = 9 / 16;
          const videoRatio = video.videoWidth / video.videoHeight;

          let sx = 0;
          let sy = 0;
          let sw = video.videoWidth;
          let sh = video.videoHeight;

          if (videoRatio > targetRatio) {
            sw = video.videoHeight * targetRatio;
            sx = (video.videoWidth - sw) / 2;
          } else {
            sh = video.videoWidth / targetRatio;
            sy = (video.videoHeight - sh) / 2;
          }

          const canvas = document.createElement("canvas");
          canvas.width = 720;
          canvas.height = 1280;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            cleanup();
            reject(new Error("Canvas tidak tersedia"));
            return;
          }

          ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              cleanup();
              if (!blob) {
                reject(new Error("Gagal membuat thumbnail"));
                return;
              }
              const thumbFile = new File(
                [blob],
                `thumbnail-${Date.now()}.jpg`,
                { type: "image/jpeg" }
              );
              resolve(thumbFile);
            },
            "image/jpeg",
            0.85
          );
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      video.onerror = () => {
        cleanup();
        reject(new Error("Gagal membaca video"));
      };
    });
  };

  const handleApplyCrop = async () => {
    if (!cropImage || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      await updateProfileAvatar(croppedBlob);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleReportNow = async () => {
    if (!reportCategory || !reportForm.name || !reportForm.email || !reportForm.explanation) {
      showToast(t.reportError, 'error');
      return;
    }

    setIsSubmittingReport(true);
    try {
      if (supabase) {
        const reportData: any = {
          target_type: 'app_help',
          reason: reportCategory,
          details: `Nama Pelapor: ${reportForm.name}\n\nPenjelasan:\n${reportForm.explanation}`,
          reporter_email: reportForm.email,
          status: 'open'
        };

        if (authUser?.id) {
          reportData.reporter_id = authUser.id;
        }

        const { error } = await supabase
          .from('reports')
          .insert(reportData);

        if (error) {
          throw error;
        }
      } else {
        throw new Error("Layanan database tidak tersedia.");
      }

      showToast(t.reportSuccess, 'success');
      setShowReportModal(false);
      setReportForm({ name: '', email: '', explanation: '' });
      setReportCategory('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleDeleteVideo = useCallback(async (video: VideoData) => {
    if (!video.fileName) {
      showToast(t.feedDeleteErrorInternal, 'error');
      return;
    }

    if (!authUser) {
      showToast(t.feedLoginToDelete, 'error');
      return;
    }

    // Pemilik video (uploaderId di storage filename adalah authUser.id)
    const isOwner = video.uploaderId === authUser.id;
    // Super Admin: thewaking5@gmail.com
    const isAdmin = authUser.email === 'thewaking5@gmail.com';

    if (!isOwner && !isAdmin) {
      showToast(t.feedNoPermissionDelete, 'error');
      return;
    }
    
    setVideoToDelete(video);
    setShowDeleteVideoConfirm(true);
  }, [authUser, t]);

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    
    setIsDeletingVideo(true);
    try {
      showToast(t.feedDeleting, 'info');
      
      // Delete from Storage
      const storagePaths = [];
      if (videoToDelete.fileName) {
        storagePaths.push(videoToDelete.fileName);
        storagePaths.push(getThumbnailPath(videoToDelete.fileName));
      }
      if (videoToDelete.thumbnailPath && !storagePaths.includes(videoToDelete.thumbnailPath)) {
        storagePaths.push(videoToDelete.thumbnailPath);
      }
      
      if (storagePaths.length > 0) {
        await supabase.storage.from(SUPABASE_BUCKET).remove(storagePaths);
      }

      // Delete from DB
      await supabase.from('feed_videos').delete().eq('id', videoToDelete.id);
      
      showToast(t.feedDeleteSuccess, 'success');
      
      setShowDeleteVideoConfirm(false);
      setVideoToDelete(null);
      fetchSupabaseVideos(true); // Silent refresh
    } catch (err: any) {
      showToast(t.feedDeleteErrorGeneric(err.message), 'error');
    } finally {
      setIsDeletingVideo(false);
    }
  };

  const handleToggleLike = useCallback(async (id: string, isLiked: boolean) => {
    if (isOfflineMode) {
      setLikeHistory(prev => {
        let next;
        if (isLiked) {
          next = [...new Set([...prev, id])];
        } else {
          next = prev.filter(vidId => vidId !== id);
        }
        localStorage.setItem('like_history', JSON.stringify(next));
        return next;
      });
      return;
    }

    if (!authUser) {
      setShowLoginPrompt(true);
      return;
    }

    // Update UI immediately (Optimistic)
    setLikeHistory(prev => {
      let next: string[];
      if (isLiked) {
        next = [...new Set([...prev, id])];
      } else {
        next = prev.filter(vidId => vidId !== id);
      }
      localStorage.setItem('like_history', JSON.stringify(next));
      return next;
    });

    try {
      if (isLiked) {
        await supabase.from('likes').upsert({ user_id: authUser.id, video_id: id });
      } else {
        await supabase.from('likes').delete().eq('user_id', authUser.id).eq('video_id', id);
      }
    } catch (err) {
      console.error("Like toggle error:", err);
    }
  }, [authUser, isOfflineMode]);

  const handleVideoWatched = useCallback((id: string, index?: number) => {
    if (index !== undefined) {
      setActiveVideoIndex(index);
    }
    setWatchHistory(prev => {
      const next = prev.filter(vidId => vidId !== id);
      next.push(id);
      const limited = next.slice(-50);
      localStorage.setItem('watch_history', JSON.stringify(limited));
      return limited;
    });
  }, []);

  const handleFeedScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const nextIndex = Math.round(container.scrollTop / container.clientHeight);

    if (
      nextIndex !== activeVideoIndex &&
      nextIndex >= 0 &&
      nextIndex < videoFeed.length
    ) {
      setActiveVideoIndex(nextIndex);

      // Slicing next batch (3 videos) when approaching end of loaded feed (2 item threshold)
      if (nextIndex >= videoFeed.length - 2 && videoFeed.length < allVideosPool.length) {
        setVisibleCount(prev => Math.min(prev + 3, allVideosPool.length));
      }
    }
  }, [activeVideoIndex, videoFeed.length, allVideosPool.length]);

  const handleProfileClick = useCallback((name: string) => {
    if (isOfflineMode) {
      const clickedName = String(name || '').toLowerCase().replace(/\s+/g, '_');
      const systemName = OFFLINE_SYSTEM_PROFILE.display_name.toLowerCase().replace(/\s+/g, '_');
      const systemUsername = OFFLINE_SYSTEM_PROFILE.username.toLowerCase();

      if (
        clickedName === systemName ||
        clickedName === systemUsername ||
        name === OFFLINE_SYSTEM_PROFILE.display_name ||
        name === OFFLINE_SYSTEM_PROFILE.username
      ) {
        setViewingSpecificProfile(OFFLINE_SYSTEM_PROFILE.display_name);
        setViewedProfileId(OFFLINE_SYSTEM_PROFILE.id);
        setViewedProfileDisplayName(OFFLINE_SYSTEM_PROFILE.display_name);
        setViewedProfileAvatar(OFFLINE_SYSTEM_PROFILE.avatar_url || '');
        navigateFeed('profile');
        return;
      }

      // Kalau bukan profile system, tetap arahkan ke profile user sendiri
      // Karena user belum login, nanti tetap muncul halaman Belum Login.
      setViewingSpecificProfile(null);
      navigateFeed('profile');
      return;
    }

    const normalize = (s: string) => s ? s.toLowerCase().replace(/\s+/g, '_') : '';
    const targetNorm = normalize(name);
    const selfName = currentProfile?.display_name || currentProfile?.username || userName;
    const selfNorm = normalize(selfName);
    const guestNorm = normalize(t.feedGuestName);
    
    // Clear old viewed data immediately to prevent mismatch during load
    setViewedProfileAvatar(null);
    setViewedProfileDisplayName(null);
    setViewedProfileId(null);

    if (targetNorm === selfNorm || targetNorm === guestNorm) {
      setViewingSpecificProfile(null);
      navigateFeed('profile');
    } else {
      setViewingSpecificProfile(name);
      navigateFeed('profile');
    }
  }, [isOfflineMode, userName, currentProfile, t.feedGuestName, navigateFeed]);

  const handleCommentClick = useCallback((v: VideoData) => {
    if (isOfflineMode) {
      showToast("Komentar tidak tersedia di mode offline demo.", "info");
      return;
    }
    if (!authUser) {
      setShowLoginPrompt(true);
      return;
    }
    setActiveVideoForComments(v);
    setShowComments(true);
  }, [authUser, isOfflineMode]);

  const likeHistorySet = new Set(likeHistory);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const reloadTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewVideoRef.current) {
      if (previewPlaying) {
        previewVideoRef.current.play().catch(() => {});
      } else {
        previewVideoRef.current.pause();
      }
    }
  }, [previewPlaying]);

  // Safety handler for background-to-foreground issues
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        document.querySelectorAll('video').forEach((video) => {
          try {
            video.pause();
          } catch (e) {}
        });
      }
    };

    const handleFocus = () => {
      // If we are stuck in loading for too long, reset it
      if (isRefreshing || isInitialLoading) {
        console.log("App returned from background - checking feed health...");
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleRefresh);
    
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleRefresh);
    };
  }, [isRefreshing, isInitialLoading]);

const handleGoogleLogin = async () => {
  if (isOfflineMode) {
    showToast("Login tidak tersedia saat mode offline demo.", "info");
    return;
  }
  if (!isSupabaseConfigured()) {
    showToast(t.feedSupabaseConfigPrompt, 'error');
    return;
  }

  setIsAuthChecking(true);

  try {
    if (Capacitor.isNativePlatform()) {
      try {
        await GoogleSignIn.initialize({
          clientId: '939384428783-q6j35mkniie5l6r4gramdk60g1sgutqt.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
        });

        const result = await GoogleSignIn.signIn();

        if (!result?.idToken) {
          throw new Error('Google ID Token tidak ditemukan');
        }

        console.log('[Auth] Native Success, syncing with Supabase...');

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: result.idToken,
        });

        if (error) throw error;

        if (data.user) {
          await getOrCreateProfile(data.user);
          showToast('Berhasil Login', 'success');
        }

        return;
      } catch (nativeErr: any) {
        console.error('[Auth] Native Login Error:', nativeErr);

        const isCancelled =
          nativeErr.message?.toLowerCase().includes('cancel') ||
          nativeErr.code === 'USER_CANCELLED';

        if (!isCancelled) {
          showToast(`Login gagal: ${nativeErr.message}`, 'error');
        }

        return; // jangan fallback ke browser di Android native
      }
    }

    // WEB FLOW ONLY
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
  } catch (err: any) {
    console.error('Login Error:', err);
    showToast(`Login gagal: ${err.message}`, 'error');
  } finally {
    setIsAuthChecking(false);
  }
};

  const handleLogout = async () => {
    if (!supabase) return;
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await supabase.auth.signOut();
    setCurrentProfile(null);
    setUserName(t.feedGuestName);
    setUserAvatar('');
    setLikeHistory([]);
    localStorage.removeItem('profile_name');
    localStorage.removeItem('profile_avatar');
    localStorage.removeItem('like_history');
    showToast(t.feedLogoutSuccess, 'success');
  };

  const fetchGlobalLikes = async (userId: string) => {
    if (isOfflineMode) return;
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('video_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      if (data) {
        const ids = data.map((l: any) => l.video_id);
        setLikeHistory(ids);
        localStorage.setItem('like_history', JSON.stringify(ids));
      }
    } catch (err) {
      console.error("Fetch likes error:", err);
    }
  };


  useEffect(() => {
    // Suppress benign WebSocket errors from Vite HMR that can trigger unhandled rejection overlays
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('WebSocket closed') || event.reason?.message?.includes('failed to connect to websocket')) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);

    if (!supabase) {
      setIsAuthChecking(false);
      setIsInitialLoading(false);
      return () => window.removeEventListener('unhandledrejection', handleRejection);
    }

    const authTimeout = setTimeout(() => setIsAuthChecking(false), 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      clearTimeout(authTimeout);
      const currentUser = session?.user;
      
      const isSameUser = authUserRef.current?.id === currentUser?.id;
      const alreadyHasProfile = !!currentProfileRef.current;

      try {
        if (event === 'SIGNED_IN') {
          const isFreshLogin = !localStorage.getItem('auth_session_active');
          if (isFreshLogin) {
            localStorage.setItem('auth_session_active', 'true');
            console.log("Fresh login detected, syncing profile...");
          }
        }

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (currentUser) {
            localStorage.setItem('auth_session_active', 'true');
            setAuthUser(currentUser);
            
            // Background sync if possible
            if (isSameUser && alreadyHasProfile && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
              fetchGlobalLikes(currentUser.id);
              return;
            }

            const metaName = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0];
            if (metaName && !localStorage.getItem('profile_name')) {
              setUserName(metaName);
            }
            
            Promise.all([
              getOrCreateProfile(currentUser),
              fetchGlobalLikes(currentUser.id)
            ]).finally(() => {
              setIsAuthChecking(false);
              fetchSupabaseVideos();
            });
            return;
          } else if (event === 'INITIAL_SESSION') {
            setIsAuthChecking(false);
            fetchSupabaseVideos();
            return;
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('auth_session_active');
          setAuthUser(null);
          setCurrentProfile(null);
          setUserName(t.feedGuestName);
          setUserAvatar('');
          setFollowingList([]);
          localStorage.removeItem('profile_name');
          localStorage.removeItem('profile_avatar');
          localStorage.removeItem('like_history');
          setLikeHistory([]);
          setShowSettings(false);
          setCurrentSettingsView('menu');
        } else if (currentUser) {
          setAuthUser(currentUser);
        } else {
          setAuthUser(null);
        }
      } catch (err) {
        console.error("Auth listener error:", err);
        setIsAuthChecking(false);
        fetchSupabaseVideos();
      } finally {
        if (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION') {
          setIsAuthChecking(false);
          fetchSupabaseVideos();
        }
      }
    });

    // Subscribe to realtime changes in feed_videos
    const feedChannel = supabase.channel('feed_realtime')
      .on('postgres_changes' as any, { 
        event: '*', 
        schema: 'public', 
        table: 'feed_videos' 
      }, (payload: any) => {
        console.log("Feed videos changed, action:", payload.eventType);
        fetchSupabaseVideos(true);
      })
      .subscribe();

    return () => {
      clearTimeout(authTimeout);
      subscription.unsubscribe();
      supabase.removeChannel(feedChannel);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Upload Modal State
  const [inputTiktok, setInputTiktok] = useState(() => sessionStorage.getItem('upload_link') || '');
  
  useEffect(() => {
    sessionStorage.setItem('upload_link', inputTiktok);
  }, [inputTiktok]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailMode, setThumbnailMode] = useState<'default' | 'custom'>(() => {
    const stored = sessionStorage.getItem('upload_thumbnail_mode');
    if (stored === 'video') return 'default';
    return (stored as 'default' | 'custom') || 'default';
  });
  const [thumbnailTimestamp, setThumbnailTimestamp] = useState(() => {
    return parseFloat(sessionStorage.getItem('upload_thumbnail_timestamp') || '0.5');
  });

  useEffect(() => {
    sessionStorage.setItem('upload_thumbnail_mode', thumbnailMode);
  }, [thumbnailMode]);

  useEffect(() => {
    sessionStorage.setItem('upload_thumbnail_timestamp', thumbnailTimestamp.toString());
  }, [thumbnailTimestamp]);
  const [videoDuration, setVideoDuration] = useState(10);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [tempUserName, setTempUserName] = useState(userName);
  const [tempUserAvatar, setTempUserAvatar] = useState(userAvatar);

  useEffect(() => {
    setTempUserName(userName);
    setTempUserAvatar(userAvatar);
  }, [userName, userAvatar, showSettings]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    if (!authUser) return;
    if (!tempUserName.trim()) {
      showToast(t.feedNameEmpty, 'error');
      return;
    }
    
    await updateProfileName(tempUserName.trim());
    setShowSettings(false);
    setCurrentSettingsView('menu');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showToast(t.feedVideoTooLarge, 'error');
        return;
      }
      setSelectedFile(file);
      // Create preview UI
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Get video duration
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setThumbnailTimestamp(Math.min(0.5, video.duration));
        // Auto-generate initial thumbnail after duration is known
        (async () => {
          try {
            const thumbFile = await captureVideoFrame(file, Math.min(0.5, video.duration));
            setThumbnailBlob(thumbFile);
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
            setThumbnailPreview(URL.createObjectURL(thumbFile));
          } catch (err) {
            console.warn("Initial thumbnail auto-gen failed:", err);
          }
        })();
        video.remove();
      };
    }
  };

  useEffect(() => {
    if (!selectedFile || thumbnailMode !== 'default') return;
    
    const timeoutId = setTimeout(async () => {
      try {
        const thumbFile = await captureVideoFrame(selectedFile, thumbnailTimestamp);
        setThumbnailBlob(thumbFile);
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        setThumbnailPreview(URL.createObjectURL(thumbFile));
      } catch (err) {
        console.error("Real-time thumbnail update failed:", err);
      }
    }, 150); // Debounce to prevent lag

    return () => clearTimeout(timeoutId);
  }, [thumbnailTimestamp, selectedFile, thumbnailMode]);

  const handleNextStep = () => {
    if (!selectedFile) return;
    const isLinkValid = (inputTiktok.startsWith('https://') || inputTiktok.startsWith('http://')) && inputTiktok.includes('.');
    if (!isLinkValid) {
      showToast(t.feedInvalidTikTok, 'error');
      return;
    }
    setUploadStep(2);
  };

  const handleFinalUpload = async () => {
    if (isOfflineMode) {
      showToast("Upload tidak tersedia di Mode Offline", "info");
      return;
    }
    if (!selectedFile) return;
    
    // Video Link Validation (Generic)
    const isLinkValid = (inputTiktok.startsWith('https://') || inputTiktok.startsWith('http://')) && inputTiktok.includes('.');
    if (!isLinkValid) {
      showToast(t.feedInvalidTikTok, 'error');
      return;
    }

    if (!isSupabaseConfigured()) {
      showToast(t.feedSupabaseNotConfigured, 'error');
      return;
    }

    // Safe Base64 for Filenames (supports UTF-8)
    const encodeMetadata = (str: string) => {
      try {
        return btoa(unescape(encodeURIComponent(str)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      } catch (e) { return 'error'; }
    };
    
    setIsUploading(true);
    setUploadProgress(10);
    setUploadStatusText(t.uploadStatusVideo);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        const increment = prev < 30 ? 2 : prev < 60 ? 1 : 0.5;
        return Math.min(90, prev + increment);
      });
    }, 1000);
    
    // Encode TikTok dan Username (Safe version)
    const encodedTiktok = encodeMetadata(inputTiktok);
    const encodedUser = encodeMetadata(userName);
    const encodedUid = authUser?.id ? encodeMetadata(authUser.id) : encodeMetadata('guest');
    const safeOrigName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}--uid--${encodedUid}--user--${encodedUser}--tiktok--${encodedTiktok}--${safeOrigName}`;
    
    uploadingFileNameRef.current = fileName;
    const abortController = new AbortController();
    setUploadAbortController(abortController);

    try {
      // 1. Upload Video
      const { error: videoError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          signal: abortController.signal,
          onUploadProgress: (evt: any) => {
            if (evt && evt.total > 0) {
              const loaded = evt.loaded || 0;
              const total = evt.total;
              const percent = Math.floor((loaded / total) * 90);
              setUploadProgress(prev => Math.max(prev, percent));
            }
          }
        } as any);

      if (videoError) throw videoError;

      // 2. Prepare & Upload Thumbnail
      setUploadStatusText(t.uploadStatusThumb);
      setUploadProgress(92);
      
      let finalThumbFile: File | null = null;
      if (thumbnailMode === 'default') {
        finalThumbFile = await captureVideoFrame(selectedFile, thumbnailTimestamp);
      } else if (thumbnailBlob) {
        finalThumbFile = new File([thumbnailBlob], `thumb-${Date.now()}.jpg`, { type: 'image/jpeg' });
      }

      let thumbUrl = '';
      let thumbPath = '';
      if (finalThumbFile) {
        thumbPath = getThumbnailPath(fileName);
        const { error: thumbError } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .upload(thumbPath, finalThumbFile, {
            cacheControl: '86400',
            upsert: true,
            contentType: 'image/jpeg'
          });
        
        if (!thumbError) {
          const { data: tData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(thumbPath);
          thumbUrl = tData.publicUrl;
        }
      }

      // 3. Insert into DB
      setUploadStatusText(t.uploadStatusDB);
      setUploadProgress(95);
      const { data: { publicUrl: videoUrl } } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(fileName);
      
      const { error: dbError } = await supabase.from('feed_videos').insert({
        file_name: fileName,
        url: videoUrl,
        thumbnail_url: thumbUrl || null,
        thumbnail_path: thumbPath || null,
        tiktok_url: inputTiktok,
        description: inputDescription || null,
        location_link: inputLocationLink || null,
        uploader_id: authUser?.id,
        uploader_name: userName,
        created_at: new Date().toISOString()
      });

      if (dbError) {
        // Cleanup storage if DB insertion fails
        await supabase.storage.from(SUPABASE_BUCKET).remove([fileName, thumbPath]);
        throw dbError;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatusText(t.uploadComplete);
      setUploadSuccess(true);
      setUploadAbortController(null);
      uploadingFileNameRef.current = null;
      
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadStep(1);
        setSelectedFile(null);
        setThumbnailBlob(null);
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        setThumbnailPreview(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setInputTiktok('');
        setInputLocationLink('');
        setInputDescription('');
        setActiveTab('beranda');
        setFeedHistory(['beranda']);
        setIsUploading(false);
        setUploadProgress(0);
        fetchSupabaseVideos(true);
      }, 2000);
      
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsUploading(false);
      if (err.name === 'AbortError') {
        console.log("Upload aborted by user");
        return;
      }
      console.error("Upload Error:", err);
      showToast(t.feedUploadError(err.message || "Unknown error"), 'error');
      setUploadAbortController(null);
      uploadingFileNameRef.current = null;
    }
  };

  const handleCancelUpload = async () => {
    if (uploadAbortController) {
      uploadAbortController.abort();
      setUploadAbortController(null);
    }
    
    setIsUploading(false);
    setUploadProgress(0);
    showToast(t.feedCancellingUpload, 'info');

    // Clean up if it was partially or fully uploaded
    if (uploadingFileNameRef.current) {
      const fileNameToDelete = uploadingFileNameRef.current;
      uploadingFileNameRef.current = null;
      try {
        await supabase.storage.from(SUPABASE_BUCKET).remove([fileNameToDelete, getThumbnailPath(fileNameToDelete)]);
      } catch (err) {
        console.error("Error deleting cancelled video/thumb from storage:", err);
      }
    }
    
    setActiveTab('beranda');
    setFeedHistory(['beranda']);
  };

  // Fetch videos from Supabase on mount
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchSupabaseVideos();
    } else {
      enableOfflineMode("Supabase not configured");
    }

    // Cleanup on unmount to completely free memory/GPU
    return () => {
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => {
        try {
          video.pause();
          video.src = "";
          video.removeAttribute('src');
          video.load();
        } catch (e) {
          console.error("Cleanup video on unmount error:", e);
        }
      });
    };
  }, []);

  // Triggered when Supabase fails or optionally for demo
  const enableOfflineMode = useCallback((reason?: string) => {
    console.warn("Offline demo mode enabled:", reason);
    setIsOfflineMode(true);

    // User tetap guest / belum login
    setAuthUser(null);
    setCurrentProfile(null);
    setUserName(t.feedGuestName);
    setUserAvatar('');

    // Jangan otomatis membuka profile system
    setViewingSpecificProfile(null);
    setViewedProfileAvatar(null);
    setViewedProfileDisplayName(null);

    // Feed pakai local videos
    const randomizedLocalVideos = shuffleArrayAvoidSameFirst(localVideos, videoFeed[0]?.id);
    setAllVideosPool(randomizedLocalVideos);
    setVisibleCount(6);
    setVideoFeed(randomizedLocalVideos.slice(0, 6));
    setActiveVideoIndex(0);

    globalVideosCache = localVideos;
    globalIsOfflineMode = true;

    setIsInitialLoading(false);
    setIsAuthChecking(false);
    setIsRefreshing(false);
    
    showToast("Mode Demo Offline Aktif", "info");
  }, [t.feedGuestName, videoFeed]);

const fetchSupabaseVideos = async (forceOnline = false) => {
  if (globalVideosCache && !forceOnline) {
    console.log("Using globalVideosCache, pool size:", globalVideosCache.length);
    setAllVideosPool(globalVideosCache);
    setIsOfflineMode(globalIsOfflineMode);
    
    // Sort or shuffle feed
    const pool = [...globalVideosCache];
    
    // Check for ?video=id param
    const urlParams = new URLSearchParams(window.location.search);
    const targetVideoId = urlParams.get('video');
    
    let prioritizedVideos = pool;
    if (targetVideoId) {
      const targetIndex = pool.findIndex(v => v.id === targetVideoId);
      if (targetIndex !== -1) {
        prioritizedVideos = [
          pool[targetIndex],
          ...pool.filter((_, i) => i !== targetIndex)
        ];
        // Clear URL param
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } else {
        prioritizedVideos = shuffleArray(pool);
      }
    } else {
      prioritizedVideos = shuffleArray(pool);
    }
    
    setAllVideosPool(prioritizedVideos);
    setVisibleCount(6);
    setVideoFeed(prioritizedVideos.slice(0, 6));
    setActiveVideoIndex(0);
    setIsInitialLoading(false);
    setIsAuthChecking(false);
    setIsRefreshing(false);
    return;
  }

  if (isOfflineMode && !forceOnline) {
    console.log("Already offline mode, using local videos:", localVideos.length);

    const randomizedLocalVideos = shuffleArrayAvoidSameFirst(localVideos, videoFeed[0]?.id);

    setAllVideosPool(randomizedLocalVideos);
    setVisibleCount(6);
    setVideoFeed(randomizedLocalVideos.slice(0, 6));
    setActiveVideoIndex(0);
    setIsInitialLoading(false);
    setIsAuthChecking(false);
    setIsRefreshing(false);
    return;
  }

  if (!isSupabaseAvailable() || !isSupabaseConfigured()) {
    enableOfflineMode("Supabase not available or not configured");
    return;
  }

  try {
    // 1. Try DB first
    try {
      const { data: dbVideos, error: dbError } = await supabase
        .from('feed_videos')
        .select('id, file_name, url, thumbnail_url, thumbnail_path, tiktok_url, description, location_link, uploader_id, uploader_name, created_at')
        .order('created_at', { ascending: false })
        .limit(40);

      if (!dbError && dbVideos && dbVideos.length > 0) {
        const videos: VideoData[] = dbVideos.map(v => ({
          id: v.id,
          fileName: v.file_name,
          url: v.url,
          thumbnailUrl: v.thumbnail_url,
          thumbnailPath: v.thumbnail_path,
          tiktokUrl: v.tiktok_url,
          description: v.description,
          locationLink: v.location_link,
          uploaderId: v.uploader_id,
          uploaderName: v.uploader_name,
          createdAt: v.created_at
        }));
        
        globalVideosCache = videos;
        globalIsOfflineMode = false;

        setIsOfflineMode(false);
        setOnlineSwitchError(null);

        // Check for ?video=id param
        const urlParams = new URLSearchParams(window.location.search);
        const targetVideoId = urlParams.get('video');
        
        let prioritizedVideos = [...videos];
        if (targetVideoId) {
          const targetIndex = videos.findIndex(v => v.id === targetVideoId);
          if (targetIndex !== -1) {
            prioritizedVideos = [
              videos[targetIndex],
              ...videos.filter((_, i) => i !== targetIndex)
            ];
            // Clear URL param
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          } else {
            prioritizedVideos = shuffleArray(videos);
          }
        } else {
          prioritizedVideos = shuffleArray(videos);
        }

        setAllVideosPool(prioritizedVideos);
        setVisibleCount(6);
        setVideoFeed(prioritizedVideos.slice(0, 6));

        setActiveVideoIndex(0);
        setShowOfflineSwitchModal(false);
        setIsInitialLoading(false);
        setIsAuthChecking(false);
        setIsRefreshing(false);
        return;
      }
    } catch (e) {
      console.warn("DB fetch failed, falling back to storage:", e);
    }

    // Check thumbnail existence by listing thumbnails folder
    const { data: thumbFiles } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .list('thumbnails', { limit: 1000 });

    const thumbSet = new Set((thumbFiles || []).map(f => `thumbnails/${f.name}`));

    const { data, error } = await supabase
      .storage
      .from(SUPABASE_BUCKET)
      .list('', {
        limit: 100, // Increased limit
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      const message = String(error.message || error);
      const lower = message.toLowerCase();

      if (
        message.includes('402') ||
        lower.includes('quota') ||
        lower.includes('restricted') ||
        lower.includes('cached_egress') ||
        lower.includes('payment required') ||
        lower.includes('exceed_cached_egress_quota') ||
        lower.includes('network') ||
        lower.includes('failed to fetch')
      ) {
        setOnlineSwitchError(message);
        // User requested: Tampilkan error dan tombol manual, jangan otomatis switch/spam request.
        setIsInitialLoading(false);
        setIsRefreshing(false);
        return;
      }

      throw error;
    }

    if (!data || data.length === 0) {
      enableOfflineMode("Supabase empty, using local videos");
      return;
    }

    const supabaseVideos: VideoData[] = data
      .filter((file: any) => file.name.match(/\.(mp4|mov|webm)$/i) && !file.name.startsWith('thumbnails/'))
      .map((file: any) => {
        const { data: { publicUrl } } = supabase
          .storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(file.name);

        const thumbPath = getThumbnailPath(file.name);
        const thumbnailUrl = thumbSet.has(thumbPath)
          ? supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(thumbPath).data.publicUrl
          : undefined;

        const decodeMetadata = (safe: string | undefined) => {
          if (!safe) return null;
          try {
            let base64 = safe.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) base64 += '=';
            return decodeURIComponent(escape(atob(base64)));
          } catch (e) {
            return null;
          }
        };

        let tiktokUrl = 'https://www.tiktok.com';
        let uploaderName = t.feedGuestName;
        let uploaderId = 'founder_id';

        const uidMatch = file.name.match(/uid--(.+?)(?:--|\.|$)/);
        if (uidMatch && uidMatch[1]) {
          const decoded = decodeMetadata(uidMatch[1]);
          if (decoded) uploaderId = decoded;
        }

        const tiktokMatch = file.name.match(/tiktok--(.+?)(?:--|\.|$)/);
        if (tiktokMatch && tiktokMatch[1]) {
          const decoded = decodeMetadata(tiktokMatch[1]);
          if (decoded) tiktokUrl = decoded;
        }

        const userMatch = file.name.match(/user--(.+?)(?:--|\.|$)/);
        if (userMatch && userMatch[1]) {
          const decoded = decodeMetadata(userMatch[1]);
          if (decoded) uploaderName = decoded.replace(/[\[\]]/g, '').trim();
        }

        return {
          id: file.name,
          fileName: file.name,
          url: publicUrl,
          thumbnailUrl,
          tiktokUrl,
          uploaderName,
          uploaderId,
          createdAt: file.created_at,
        };
      });

    if (supabaseVideos.length > 0) {
      globalVideosCache = supabaseVideos;
      globalIsOfflineMode = false;

      setIsOfflineMode(false);
      setOnlineSwitchError(null);
      
      const shuffled = shuffleArray(supabaseVideos);
      setAllVideosPool(shuffled);
      setVisibleCount(6);
      setVideoFeed(shuffled.slice(0, 6));
      setActiveVideoIndex(0);
      setShowOfflineSwitchModal(false); // Close the modal on success
      showToast("Kembali Online!", "success");
    } else {
      enableOfflineMode("No Supabase videos found, using local videos");
    }
  } catch (err: any) {
    console.error("Error fetching Supabase videos:", err);
    setOnlineSwitchError(err?.message || "Supabase fetch failed");
    if (!forceOnline) enableOfflineMode(err?.message || "Supabase fetch failed");
  } finally {
    setIsInitialLoading(false);
    setIsAuthChecking(false);
    setIsRefreshing(false);
  }
};

  // Generate thumbnail from existing video URL
  const createVideoThumbnailBlobFromUrl = (videoUrl: string, time: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Thumbnail generation timed out. Jika sering terjadi, coba gunakan upload gambar manual."));
      }, 10000);

      const cleanup = () => {
        clearTimeout(timeout);
        video.remove();
      };

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(time, video.duration || time);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 480;
          canvas.height = (canvas.width * 16) / 9;

          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");

          const videoAspect = video.videoWidth / video.videoHeight;
          const canvasAspect = canvas.width / canvas.height;

          let drawWidth, drawHeight, drawX, drawY;

          if (videoAspect > canvasAspect) {
            drawHeight = video.videoHeight;
            drawWidth = video.videoHeight * canvasAspect;
            drawX = (video.videoWidth - drawWidth) / 2;
            drawY = 0;
          } else {
            drawWidth = video.videoWidth;
            drawHeight = video.videoWidth / canvasAspect;
            drawX = 0;
            drawY = (video.videoHeight - drawHeight) / 2;
          }

          ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            cleanup();
            if (blob) resolve(blob);
            else reject(new Error("Failed to create thumbnail blob"));
          }, 'image/jpeg', 0.8);
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      video.onerror = () => {
        cleanup();
        reject(new Error("Video loading error (CORS or Path issue). Silakan gunakan upload gambar manual."));
      };
    });
  };

  const handleEditVideo = (video: VideoData) => {
    if (!authUser) {
      setShowLoginPrompt(true);
      return;
    }

    const isOwner = video.uploaderId === authUser.id;
    const isAdmin = authUser.email === 'thewaking5@gmail.com';

    if (!isOwner && !isAdmin) {
      showToast("Kamu hanya bisa edit video milikmu sendiri", "error");
      return;
    }

    setVideoToEdit(video);
    setEditDescription(video.description || '');
    setEditLocationLink(video.locationLink || '');
    setEditThumbnailBlob(null);
    setEditThumbnailPreview(video.thumbnailUrl || null);
    setEditThumbnailMode('video');
    setEditThumbnailTimestamp(0.5);
    setShowEditVideoModal(true);
  };

  const handleSaveVideoEdit = async () => {
    if (!videoToEdit?.fileName) return;

    if (!authUser) {
      setShowLoginPrompt(true);
      return;
    }

    const isOwner = videoToEdit.uploaderId === authUser.id;
    const isAdmin = authUser.email === 'thewaking5@gmail.com';

    if (!isOwner && !isAdmin) {
      showToast("Kamu hanya bisa edit video milikmu sendiri", "error");
      return;
    }

    if (!editThumbnailBlob) {
      showToast("Pilih atau buat thumbnail terlebih dahulu", "error");
      return;
    }

    setIsSavingVideoEdit(true);

    try {
      let newThumbnailUrl = videoToEdit.thumbnailUrl;
      let newThumbnailPath = videoToEdit.thumbnailPath;

      if (editThumbnailBlob) {
        const timestamp = Date.now();
        const newPath = `thumbnails/${videoToEdit.id || 'edit'}_${timestamp}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .upload(newPath, editThumbnailBlob, {
            cacheControl: '86400',
            upsert: true,
            contentType: 'image/jpeg'
          });

        if (uploadError) throw uploadError;

        // Delete old thumbnail if it exists and is different
        if (videoToEdit.thumbnailPath && videoToEdit.thumbnailPath !== newPath) {
          await supabase.storage.from(SUPABASE_BUCKET).remove([videoToEdit.thumbnailPath]);
        }

        const { data: tData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(newPath);
        newThumbnailUrl = tData.publicUrl;
        newThumbnailPath = newPath;
      }

      // Update DB
      const { error: dbError } = await supabase
        .from('feed_videos')
        .update({
          description: editDescription || null,
          location_link: editLocationLink || null,
          thumbnail_url: newThumbnailUrl,
          thumbnail_path: newThumbnailPath,
          updated_at: new Date().toISOString()
        })
        .eq('id', videoToEdit.id);

      if (dbError) throw dbError;

      showToast("Video berhasil diperbarui", "success");

      setShowEditVideoModal(false);
      setVideoToEdit(null);
      setEditThumbnailBlob(null);

      if (editThumbnailPreview) URL.revokeObjectURL(editThumbnailPreview);
      setEditThumbnailPreview(null);

      await fetchSupabaseVideos(true);
    } catch (err: any) {
      showToast(`Gagal menyimpan edit: ${err.message}`, "error");
    } finally {
      setIsSavingVideoEdit(false);
    }
  };

  const handleFileUpload = () => {
    setShowUploadModal(true);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const shuffleArrayAvoidSameFirst = <T extends { id: string }>(
  array: T[],
  currentFirstId?: string
): T[] => {
  const shuffled = shuffleArray(array);

  if (shuffled.length > 1 && shuffled[0]?.id === currentFirstId) {
    const swapIndex = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
    [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
  }

  return shuffled;
};

    const resetFeedScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollSnapType = 'none';
      scrollContainerRef.current.scrollTop = 0;
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      
      // Re-enable snap after a short delay to allow DOM to settle
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.style.scrollSnapType = 'y mandatory';
        }
      }, 50);
    }
  };


  const handleRefresh = async () => {
    if (isRefreshing) return;

    if (isOfflineMode) {
      setIsRefreshing(true);

      const randomizedLocalVideos = shuffleArrayAvoidSameFirst(localVideos, videoFeed[0]?.id);

      setAllVideosPool(randomizedLocalVideos);
      setVisibleCount(6);
      setVideoFeed(randomizedLocalVideos.slice(0, 6));
      setActiveVideoIndex(0);

      resetFeedScroll();

      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);

      return;
    }

    setIsRefreshing(true);

    console.log("Refreshing feed...");

    const safetyTimeout = setTimeout(() => {
      console.warn("Refresh safety timeout reached");
      setIsRefreshing(false);
    }, 6000);

    try {
      // Clear cache on refresh so user retrieves latest uploads from Supabase
      globalVideosCache = null;
      await fetchSupabaseVideos(true);
      resetFeedScroll();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      clearTimeout(safetyTimeout);
      setIsRefreshing(false);
    }
  };

  const handleShuffleReload = () => {
    if (allVideosPool.length === 0) return;
    setIsRefreshing(true);
    
    // Shuffle with better algorithm on the main source pool
    const reshuffled = shuffleArrayAvoidSameFirst(allVideosPool, videoFeed[0]?.id);
    setAllVideosPool(reshuffled);
    setVisibleCount(6);
    setVideoFeed(reshuffled.slice(0, 6));
    setActiveVideoIndex(0);

    // Force aggressive scroll to top
    setTimeout(() => {
      resetFeedScroll();
      setIsRefreshing(false);
    }, 600);
  };

  const handleDeleteAccount = async () => {
    if (!authUser?.email) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      // 1. IMPROVED DELETION: Fetch all files from bucket to ensure we don't miss any (up to 1000)
      const { data: allFiles } = await supabase.storage.from(SUPABASE_BUCKET).list('', { limit: 1000 });
      
      if (allFiles && allFiles.length > 0) {
        // Safe decoding helper
        const decodeSafe = (safe: string) => {
          try {
            let base64 = safe.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) base64 += '=';
            return decodeURIComponent(escape(atob(base64)));
          } catch (e) { return null; }
        };

        const targetUid = authUser.id;
        const videosToDelete: string[] = [];
        allFiles.forEach(file => {
          const uidMatch = file.name.match(/uid--(.+?)(?:--|\.|$)/);
          if (uidMatch && uidMatch[1]) {
            const decoded = decodeSafe(uidMatch[1]);
            if (decoded === targetUid) {
              videosToDelete.push(file.name);
              videosToDelete.push(getThumbnailPath(file.name));
            }
          }
        });

        if (videosToDelete.length > 0) {
          console.log(`Deleting ${videosToDelete.length} files (videos + thumbs) for user ${authUser.email}`);
          await supabase.storage.from(SUPABASE_BUCKET).remove(videosToDelete);
        }
      }

      // 2. Delete from Supabase
      await Promise.all([
        supabase.from('comments').delete().eq('user_id', authUser.id),
        supabase.from('follows').delete().or(`follower_id.eq.${authUser.id},following_id.eq.${authUser.id}`),
        supabase.from('profiles').delete().eq('id', authUser.id)
      ]);

      // 3. Optional: Clear Supabase Auth table isn't possible from client SDK easily
      // but we sign out and clear all local trace.
      await supabase.auth.signOut();
      
      showToast(t.feedDeleteAccountSuccess, 'success');
      setShowDeleteConfirm(false);
      setTimeout(() => {
        window.location.reload(); 
      }, 3000);
    } catch (err: any) {
      showToast(t.feedDeleteAccountError(err.message), 'error');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleLoadMore = () => {
    // When reaching bottom of the shuffled feed, we can trigger shuffle reload
    // but the user might want a manual reload at the end.
    // We already show a button at the end.
  };

  const toggleMute = () => {
    setVolume(prev => (prev === 0 ? 1 : 0));
  };

  useEffect(() => {
    if (activeTab === 'beranda' && selectedVideoIdForFeed !== null) {
      const vidId = selectedVideoIdForFeed;
      let attempts = 0;

      const tryScroll = () => {
        if (scrollContainerRef.current) {
          const index = videoFeed.findIndex(v => v.id === vidId);
          if (index !== -1) {
            const container = scrollContainerRef.current;
            // Force the scroll to the calculated position
            const targetTop = index * container.clientHeight;
            
            // Log for debugging
            console.log(`Jumping to ${index}, Top: ${targetTop}, ClientHeight: ${container.clientHeight}`);
            
            container.scrollTo({
              top: targetTop,
              behavior: 'auto'
            });
            
            // Double check scroll after a tick to prevent race conditions with layout
            setTimeout(() => {
              if (container.scrollTop !== targetTop) {
                container.scrollTop = targetTop;
              }
            }, 50);

            setSelectedVideoIdForFeed(null);
            return;
          }
        }

        if (attempts < 20) {
          attempts++;
          requestAnimationFrame(tryScroll);
        }
      };

      tryScroll();
    }
  }, [activeTab, selectedVideoIdForFeed, videoFeed]);

  // Sync following/followers when viewing a profile or changing tabs
  useEffect(() => {
    if (activeTab === 'profile' || viewingSpecificProfile) {
      fetchFollowData();
    }
  }, [activeTab, viewingSpecificProfile, userName, authUser]);

  // Sync Global Comments with Realtime
  useEffect(() => {
    let subscription: any = null;
    
    if (showComments && activeVideoForComments) {
      const videoId = activeVideoForComments.fileName || activeVideoForComments.url;
      fetchComments(videoId);

      // Setup Realtime subscription
      subscription = supabase
        .channel(`comments:${videoId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'comments',
            filter: `video_id=eq.${videoId}`
          },
          (payload: any) => {
            setGlobalComments(prev => {
              if (!payload.new) return prev;
              // Avoid duplicates (if we already did optimistic update)
              const exists = prev.some(c => c.id === payload.new.id);
              if (exists) return prev;
              
              // Filter out the optimistic temp version if this is the confirmed insert for the same user/text
              // but payload.new.id will be the real one. 
              // Simplest: filter any with matching user/text/video that are temp
              const filtered = prev.filter(c => 
                !(c.id?.toString().startsWith('temp-') && 
                  c.user_id === payload.new.user_id && 
                  c.text === payload.new.text)
              );
              return [...filtered, payload.new as CommentData];
            });
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [showComments, activeVideoForComments]);

  const fetchComments = async (videoId: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      // Fetching explicit columns to avoid issues with missing columns like parent_id
      const { data, error } = await supabase
        .from('comments')
        .select('id, video_id, video_owner_id, user_id, user_email, user_name, user_avatar_url, text, created_at, parent_id')
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });
      
      if (error) {
        // Fallback for missing parent_id column
        if (error.message?.includes('parent_id')) {
           const { data: secondData, error: secondError } = await supabase
            .from('comments')
            .select('id, video_id, video_owner_id, user_id, user_email, user_name, user_avatar_url, text, created_at')
            .eq('video_id', videoId)
            .order('created_at', { ascending: true });
           if (secondError) throw secondError;
           setGlobalComments(secondData || []);
           return;
        }
        throw error;
      }
      setGlobalComments(data || []);
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !activeVideoForComments) return;
    if (!authUser) {
      setShowLoginPrompt(true);
      return;
    }

    setIsPostingComment(true);
    const tempId = 'temp-' + Date.now();
    try {
      const now = new Date().toISOString();
      const videoId = activeVideoForComments.fileName || activeVideoForComments.url;
      const newComment: any = {
        video_id: videoId,
        video_owner_id: activeVideoForComments.uploaderId || null,
        user_id: authUser.id,
        user_email: authUser.email,
        user_name: userName,
        user_avatar_url: userAvatar,
        text: commentText.trim(),
        created_at: now,
      };

      if (replyingTo?.id) {
        newComment.parent_id = replyingTo.id;
      }

      // Optimistic update for immediate feedback
      const optimisticComment = { 
        ...newComment, 
        id: tempId,
        likes_count: 0
      };
      setGlobalComments(prev => [...prev, optimisticComment]);
      
      const currentText = commentText.trim();
      setCommentText("");
      setReplyingTo(null);

      const { error } = await supabase
        .from('comments')
        .insert(newComment);

      if (error) {
        // Rollback optimistic update on error
        setGlobalComments(prev => prev.filter(c => c.id !== tempId));
        
        // Specific error handling for missing column
        if (error.message?.includes('parent_id')) {
          showToast("Balasan terkirim sebagai komentar biasa (Sistem sedang diperbaiki Admin)", "info");
          delete newComment.parent_id;
          const { error: secondError } = await supabase.from('comments').insert(newComment);
          if (secondError) throw secondError;
          return;
        }
        
        throw error;
      }

      showToast(t.commentSuccess, 'success');
    } catch (err: any) {
      setGlobalComments(prev => prev.filter(c => c.id !== tempId));
      showToast(`Gagal kirim komentar: ${err.message}`, 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (comment: CommentData) => {
    if (!authUser || !activeVideoForComments) return;
    
    // Permission check
    const isVideoOwner = activeVideoForComments.uploaderId === authUser.id;
    const isCommentAuthor = comment.user_id === authUser.id;
    const isAdmin = authUser.email === 'thewaking5@gmail.com';

    // Creator can delete everything. 
    // Regular users can only delete their own comments.
    const canDelete = isVideoOwner || isCommentAuthor || isAdmin;

    if (!canDelete) {
      showToast("Tidak memiliki izin untuk menghapus komentar ini", "error");
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id);

      if (error) throw error;

      setGlobalComments(prev => prev.filter(c => c.id !== comment.id));
      showToast("Komentar dihapus", "success");
    } catch (err: any) {
      showToast(`Gagal menghapus komentar: ${err.message}`, "error");
    }
  };

  const handleToggleFollow = async (targetName: string) => {
    if (!authUser) {
      setShowLoginPrompt(true);
      return;
    }
    
    setIsSyncingFollow(true);
    const willBeFollowing = !isFollowingActiveProfile;
    
    // Save current states for potential rollbacks upon failure
    const oldIsFollowing = isFollowingActiveProfile;
    const oldFollowersCount = currentProfileFollowers;
    
    try {
      // Optimistic updates
      setIsFollowingActiveProfile(willBeFollowing);
      setCurrentProfileFollowers(prev => willBeFollowing ? prev + 1 : Math.max(0, prev - 1));

      // Resolve target profile
      let targetId = viewedProfileId;
      if (!targetId) {
        const { data: targetProfile, error: profileErr } = await supabase
          .from('profiles')
          .select('id')
          .or(`username.eq.${targetName},display_name.eq.${targetName}`)
          .maybeSingle();

        if (profileErr) throw profileErr;
        if (targetProfile) {
          targetId = targetProfile.id;
        }
      }
      
      if (!targetId) throw new Error("User profile not found");

      if (!willBeFollowing) {
        const { error: delErr } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', authUser.id)
          .eq('following_id', targetId);
          
        if (delErr) throw delErr;
      } else {
        const { error: insErr } = await supabase
          .from('follows')
          .insert({ follower_id: authUser.id, following_id: targetId });
          
        if (insErr) {
          // If already following, ignore duplicate key error
          if (insErr.code !== '23505') throw insErr;
        }
      }

      // Sync local follow lists
      if (willBeFollowing) {
        if (!followingList.includes(targetName)) {
          setFollowingList(prev => [...prev, targetName]);
        }
      } else {
        setFollowingList(prev => prev.filter(name => name !== targetName));
      }
    } catch (err: any) {
      // Fallback
      setIsFollowingActiveProfile(oldIsFollowing);
      setCurrentProfileFollowers(oldFollowersCount);
      showToast(err.message || "Gagal mengikuti", 'error');
    } finally {
      setIsSyncingFollow(false);
    }
  };

  const fetchFollowData = async () => {
    if (isOfflineMode) return;

    const target = viewingSpecificProfile || userName;
    if (!target || !isSupabaseConfigured()) return;

    try {
      // Find target profile
      const { data: targetProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.eq.${target},display_name.eq.${target}`)
        .maybeSingle();
      
      if (profileErr || !targetProfile) return;

      if (viewingSpecificProfile) {
        setViewedProfileAvatar(targetProfile.avatar_url);
        setViewedProfileDisplayName(targetProfile.display_name || targetProfile.username);
        setViewedProfileId(targetProfile.id);
      } else {
        setViewedProfileId(null);
      }

      // Get counts
      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetProfile.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetProfile.id)
      ]);

      setCurrentProfileFollowers(followers || 0);
      setCurrentProfileFollowing(following || 0);

      if (authUser) {
        const { data, error: checkErr } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', authUser.id)
          .eq('following_id', targetProfile.id)
          .maybeSingle();
        
        if (!checkErr) {
          setIsFollowingActiveProfile(!!data);
        }
      }
    } catch (err) {
      console.error("Follow data sync error:", err);
    }
  };

  const getFollowerCount = (name: string) => {
    if (name === (viewingSpecificProfile || userName)) return currentProfileFollowers;
    return 0; // fallback
  };

  const getFollowingCount = (name: string) => {
    if (name === (viewingSpecificProfile || userName)) return currentProfileFollowing;
    return 0; // fallback
  };

  const isUserVerified = useCallback((uploaderIdOrEmail: string | undefined, name: string) => {
    const verifiedIds = ['e7874618-cb15-46eb-8e5f-147321523456']; // UID thewaking5@gmail.com
    const verifiedEmails = ['thewaking5@gmail.com'];
    const normalizedName = name.toLowerCase().replace(/\s+/g, '');
    const verifiedNames = ['thewaking5', 'kulinermalang'];
    
    return (uploaderIdOrEmail && (verifiedIds.includes(uploaderIdOrEmail) || verifiedEmails.includes(uploaderIdOrEmail))) || 
           verifiedNames.includes(normalizedName);
  }, []);

  // Sync Follower/Following Lists for Modal
  useEffect(() => {
    if (showFollowListModal) {
      const fetchList = async () => {
        const target = viewingSpecificProfile || userName;
        if (!target || !isSupabaseConfigured()) return;

        try {
          // Find target profile
          const { data: targetProfile } = await supabase
            .from('profiles')
            .select('id')
            .or(`username.eq."${target}",display_name.eq."${target}"`)
            .single();
          
          if (!targetProfile) return;

          if (showFollowListModal === 'followers') {
            const { data: followsData } = await supabase
              .from('follows')
              .select('follower_id')
              .eq('following_id', targetProfile.id);
            
            if (followsData && followsData.length > 0) {
              const followerIds = followsData.map(f => f.follower_id);
              const { data: profiles } = await supabase
                .from('profiles')
                .select('username, display_name')
                .in('id', followerIds);
              
              const names = profiles?.map(p => p.display_name || p.username) || [];
              setFollowerList(names);
            } else {
              setFollowerList([]);
            }
          } else {
            const { data: followsData } = await supabase
              .from('follows')
              .select('following_id')
              .eq('follower_id', targetProfile.id);
            
            if (followsData && followsData.length > 0) {
              const followingIds = followsData.map(f => f.following_id);
              const { data: profiles } = await supabase
                .from('profiles')
                .select('username, display_name')
                .in('id', followingIds);
              
              const names = profiles?.map(p => p.display_name || p.username) || [];
              setFollowingList(names);
            } else {
              setFollowingList([]);
            }
          }
        } catch (err) {
          console.error("Fetch list error:", err);
        }
      };
      fetchList();
    }
  }, [showFollowListModal, viewingSpecificProfile, userName, authUser]);

  // Continuous Reload Observer
  useEffect(() => {
    if (activeTab !== 'beranda' || isInitialLoading || isRefreshing) return;

    // Small delay before observing to avoid initial intersection trigger
    const delayTimer = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isRefreshing && videoFeed.length > 0) {
          console.log("Triggering auto-reload from observer");
          handleShuffleReload();
        }
      }, { threshold: 0.1 });

      if (reloadTriggerRef.current) observer.observe(reloadTriggerRef.current);
      
      return () => observer.disconnect();
    }, 1000);

    return () => clearTimeout(delayTimer);
  }, [activeTab, isInitialLoading, isRefreshing, videoFeed.length]);

  // Force scroll to top when entering feed or loading finishes
  useEffect(() => {
    if (activeTab === 'beranda' && !isInitialLoading && !isRefreshing && videoFeed.length > 0) {
      resetFeedScroll();
    }
  }, [activeTab, isInitialLoading, isRefreshing]);

  useEffect(() => {
    resetFeedScroll();
  }, []);

  const renderProfileContent = () => {
    // If viewingSpecificProfile is set, we are definitely NOT viewing our own profile unless explicitly cleared
    const isOwnProfile = !viewingSpecificProfile;
    
    // Check if we are viewing the offline system profile
    const isOfflineSystemProfile = isOfflineMode && viewingSpecificProfile === OFFLINE_SYSTEM_PROFILE.display_name;

    const currentName = isOfflineSystemProfile 
      ? OFFLINE_SYSTEM_PROFILE.username 
      : String(viewingSpecificProfile || (currentProfile?.display_name || currentProfile?.username || userName) || t.feedGuestName);

    const displayAvatar = isOfflineSystemProfile
      ? OFFLINE_SYSTEM_PROFILE.avatar_url
      : (isOwnProfile ? userAvatar : viewedProfileAvatar);

    const displayNameToUse = isOfflineSystemProfile
      ? OFFLINE_SYSTEM_PROFILE.display_name
      : (isOwnProfile ? (currentProfile?.display_name || currentProfile?.username || userName) : (viewedProfileDisplayName || viewingSpecificProfile || currentName));

    // Fix ReferenceError: define displayName here as a reliable fallback
    const displayName = displayNameToUse || "User";

    const handleTouchStart = (e: React.TouchEvent) => {
      // Only trigger if at the top of scroll and not searching
      if (scrollContainerRef.current?.scrollTop === 0) {
        profileTouchStartY.current = e.touches[0].clientY;
      } else {
        profileTouchStartY.current = -1;
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (profileTouchStartY.current === -1 || isRefreshing) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - profileTouchStartY.current;
      
      if (diff > 0) {
        // Resistance factor
        const progress = Math.min(diff / 2.5, 80);
        setProfilePullProgress(progress);
        setIsProfilePulling(true);
        // Prevent scroll when pulling
        if (progress > 5 && (e.nativeEvent as any).cancelable) e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (profilePullProgress > 60) {
        handleRefresh();
      }
      setIsProfilePulling(false);
      setProfilePullProgress(0);
    };

    return (
      <div 
        className="flex-1 bg-black flex flex-col pt-8 overflow-y-auto no-scrollbar pb-24 relative h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to Refresh Indicator */}
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden transition-all duration-200 pointer-events-none z-[100]"
          style={{ height: `${profilePullProgress}px` }}
        >
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
            <RefreshCcw 
              size={18} 
              className={`text-[#1A9E5C] ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ transform: `rotate(${profilePullProgress * 4}deg)` }}
            />
          </div>
        </div>
        {/* Profile Frame Header */}
        <div className="flex items-center justify-between mb-8 px-8 shrink-0">
          <div className="flex items-center gap-2">
            {(showSettings || viewingSpecificProfile || activeTab === 'profile') && (
              <button 
                onClick={() => {
                  if (showSettings) {
                    if (currentSettingsView === 'menu') setShowSettings(false);
                    else setCurrentSettingsView('menu');
                  } else if (viewingSpecificProfile || activeTab === 'profile') {
                    setViewingSpecificProfile(null);
                    setActiveTab('beranda');
                    setFeedHistory(['beranda']);
                  }
                }}
                className="p-2 text-white hover:text-[#1A9E5C] transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h2 className="text-white font-black text-lg uppercase tracking-tighter">
              {(authUser || viewingSpecificProfile || isOfflineMode) ? (
                showSettings ? t.setelan : viewingSpecificProfile ? (isOfflineSystemProfile ? "PROFILE DEMO" : `${t.feedProfile} @${String(viewingSpecificProfile).replace(/\s+/g, '_').toLowerCase()}`) : t.feedProfile
              ) : null}
            </h2>
          </div>
          {(authUser || viewingSpecificProfile || (isOfflineMode && isOfflineSystemProfile)) && isOwnProfile && !showSettings && authUser && (
            <button 
              onClick={() => setShowSettings(true)}
              className="p-3 bg-white/10 rounded-full text-white border border-white/10"
            >
              <Settings size={20} />
            </button>
          )}
          {(viewingSpecificProfile || showSettings) && (
            <button 
              onClick={() => {
                if (showSettings) {
                  setShowSettings(false);
                  setCurrentSettingsView('menu');
                } else if (viewingSpecificProfile) {
                  // When viewing someone else, X button returns to beranda
                  setViewingSpecificProfile(null);
                  setActiveTab('beranda');
                  setFeedHistory(['beranda']);
                }
              }}
              className="p-3 bg-white/10 rounded-full text-white border border-white/10 active:scale-95 transition-all outline-none"
            >
              <X size={24} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Profile Frame Content */}
        {(!authUser && !viewingSpecificProfile) || (isOfflineMode && !isOfflineSystemProfile && !viewingSpecificProfile) ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pb-20">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <User size={50} className="text-white/20" />
            </motion.div>
            <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-2">{t.feedLoginPromptTitle}</h3>
            <p className="text-gray-500 text-[11px] font-medium leading-relaxed max-w-xs mb-10">
              {t.feedLoginPromptDesc}
            </p>
            <button onClick={handleGoogleLogin} className="bg-[#1A9E5C] text-white font-black uppercase text-xs px-12 py-4 rounded-2xl shadow-[0_0_30px_rgba(26,158,92,0.2)] active:scale-95 transition-all flex items-center gap-3">
              <LogOut size={18} className="rotate-180" />
              {t.feedLoginButton}
            </button>
          </div>
        ) : showSettings && isOwnProfile ? (
          <div className="flex-1 px-6 flex flex-col gap-6">
            {currentSettingsView === 'menu' && (
              <div className="flex flex-col gap-2">
                <button onClick={() => setCurrentSettingsView('edit-profile')} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#1A9E5C]/20 rounded-xl text-[#1A9E5C]"><User size={20} /></div>
                    <span className="text-white font-bold text-sm">{t.feedEditProfile}</span>
                  </div>
                  <Play size={12} className="text-white/20" />
                </button>
                
                <button onClick={() => setCurrentSettingsView('likes')} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-500/20 rounded-xl text-red-500"><Heart size={20} /></div>
                    <span className="text-white font-bold text-sm">{t.feedLikeHistory}</span>
                  </div>
                  <Play size={12} className="text-white/20" />
                </button>

                <button onClick={() => setCurrentSettingsView('history')} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-xl text-blue-500"><Play size={20} /></div>
                    <span className="text-white font-bold text-sm">{t.feedWatchHistory}</span>
                  </div>
                  <Play size={12} className="text-white/20" />
                </button>

                <button onClick={() => { setShowReportModal(true); setReportForm({ ...reportForm, name: userName || '', email: authUser?.email || '' }); }} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-500/20 rounded-xl text-orange-500"><AlertTriangle size={20} /></div>
                    <span className="text-white font-bold text-sm">Laporkan Masalah</span>
                  </div>
                  <Play size={12} className="text-white/20" />
                </button>

                <div className="mt-8 border-t border-white/5 pt-8">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
                    <LogOut size={18} />
                    {t.feedLogout}
                  </button>
                  
                  <button onClick={handleDeleteAccount} className="w-full flex items-center justify-center gap-3 p-4 bg-red-600/5 text-red-600/60 rounded-2xl border border-red-600/10 font-bold uppercase text-[9px] tracking-[0.2em] active:scale-95 transition-all mt-4">
                    <Trash2 size={14} />
                    {t.feedDeleteAccountPermanent}
                  </button>
                </div>
              </div>
            )}
            {currentSettingsView === 'edit-profile' && (
              <div className="flex flex-col items-center gap-8 py-4">
                <div className="relative group mx-auto">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1A9E5C] to-[#1A9E5C] p-1 shadow-2xl relative">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-2 border-white/10">
                      {tempUserAvatar ? <img src={tempUserAvatar} className="w-full h-full object-cover" /> : <User size={40} className="text-white/20" />}
                    </div>
                  </div>
                  <label className="absolute bottom-1 right-1 p-2 bg-[#1A9E5C] rounded-full text-white border-2 border-black shadow-lg cursor-pointer active:scale-90 transition-transform">
                    <Camera size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, true)} />
                  </label>
                </div>
                <div className="w-full space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest px-1">{t.feedUsername}</label>
                    <input 
                      type="text" 
                      value={tempUserName} 
                      onChange={(e) => { 
                        const val = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''); 
                        if (val.includes("kulinermalang")) return; 
                        setTempUserName(val); 
                      }} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-[#1A9E5C]" 
                      placeholder={`${t.feedUsername}...`} 
                    />
                  </div>
                  <button 
                    onClick={handleSaveProfile} 
                    className="w-full bg-[#1A9E5C] text-black font-black uppercase text-xs py-4 rounded-xl shadow-lg active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
                  >
                    {t.feedSaveChanges}
                  </button>
                </div>
              </div>
            )}
            {(currentSettingsView === 'likes' || currentSettingsView === 'history') && (
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    {currentSettingsView === 'likes' ? <Heart size={14} className="text-red-500 fill-red-500" /> : <Play size={14} className="text-blue-500" />}
                    {currentSettingsView === 'likes' ? t.feedVideosYouLiked : t.feedLastViewed}
                </h4>
                {(currentSettingsView === 'likes' ? likeHistory : watchHistory).length > 0 ? (
                  <div className="grid grid-cols-3 gap-1">
                    {videoFeed.filter(v => currentSettingsView === 'likes' ? likeHistory.includes(v.id) : watchHistory.includes(v.id)).map((v, i) => (
                      <ProfileVideoItem 
                        key={`settings-list-${v.id || "v"}-${i}-${currentSettingsView}`}
                        video={v} 
                        onSelect={(v) => setModalVideo(v)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center"><p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{t.feedNoData}</p></div>
                )}
              </div>
            )}
          </div>

        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="relative group cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1A9E5C] to-[#1A9E5C] p-1 shadow-2xl relative">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-2 border-white/10 group-hover:opacity-80 transition-opacity">
                  {(displayAvatar) ? (
                    <img src={displayAvatar} className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-white/20" />
                  )}
                </div>
              </div>
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 p-2 bg-[#1A9E5C] rounded-full text-white border-2 border-black shadow-lg shadow-[#1A9E5C]/40 cursor-pointer active:scale-90 transition-all">
                  <Camera size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, false)} />
                </label>
              )}
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-white font-black text-xl tracking-tighter">@{displayNameToUse.replace(/\s+/g, '_').toLowerCase()}</h3>
                {(isOfflineSystemProfile || isUserVerified(isOwnProfile ? authUser?.email : undefined, displayNameToUse)) && <CheckCircle2 size={16} className="text-[#1A9E5C] fill-[#1A9E5C]/20 shadow-[0_0_10px_rgba(26,158,92,0.4)]" />}
              </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-8 mt-4">
                    <button 
                      className="text-center group cursor-pointer active:scale-95 transition-transform" 
                      onClick={() => !isOfflineMode && setShowFollowListModal('following')}
                    >
                      <p className="text-white font-black text-xl tracking-tight">{isOfflineMode ? 0 : getFollowingCount(currentName)}</p>
                      <p className="text-gray-500 text-[9px] uppercase font-black tracking-[0.2em] opacity-60">Following</p>
                    </button>
                    <div className="w-[1px] h-8 bg-white/5" />
                    <button 
                      className="text-center group cursor-pointer active:scale-95 transition-transform" 
                      onClick={() => !isOfflineMode && setShowFollowListModal('followers')}
                    >
                      <p className="text-white font-black text-xl tracking-tight">{isOfflineMode ? 0 : getFollowerCount(currentName)}</p>
                      <p className="text-gray-500 text-[9px] uppercase font-black tracking-[0.2em] opacity-60">Followers</p>
                    </button>
                    <div className="w-[1px] h-8 bg-white/5" />
                    <div className="text-center">
                      <p className="text-white font-black text-xl tracking-tight">
                        {(videoFeed.filter(v => 
                          isOfflineMode 
                            ? (isOfflineSystemProfile ? v.uploaderId === OFFLINE_SYSTEM_PROFILE.id : false)
                            : (isOwnProfile && authUser?.id ? v.uploaderId === authUser.id : (viewedProfileId ? v.uploaderId === viewedProfileId : v.uploaderName === currentName))
                        ).length * 12).toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-[9px] uppercase font-black tracking-[0.2em] opacity-60">Likes</p>
                    </div>
                  </div>
                  
                  {!isOfflineMode && !isOwnProfile && viewingSpecificProfile && viewingSpecificProfile !== userName && (
                    <motion.button 
                      whileTap={{ scale: 0.9 }} 
                      onClick={() => handleToggleFollow(viewingSpecificProfile)} 
                      className={`min-w-[160px] py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl transition-all mt-4 border ${
                        isFollowingActiveProfile 
                          ? 'bg-white/5 text-white border-white/10 hover:bg-white/10' 
                          : 'bg-[#1A9E5C] text-white border-[#1A9E5C] shadow-[0_10px_30px_rgba(26,158,92,0.2)]'
                      }`}
                    >
                      {isFollowingActiveProfile ? t.feedFollowingState : t.feedFollow}
                    </motion.button>
                  )}
                </div>
            </div>
            
            <div className="w-full px-4 mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Play size={16} className="text-[#1A9E5C]" />
                <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">{isOwnProfile ? t.feedMyVideos : t.feedVideosBy(currentName)}</h4>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {videoFeed
                  .filter(v => 
                    isOfflineMode 
                      ? (isOfflineSystemProfile && v.uploaderId === OFFLINE_SYSTEM_PROFILE.id) 
                      : (isOwnProfile && authUser?.id ? v.uploaderId === authUser.id : (viewedProfileId ? v.uploaderId === viewedProfileId : v.uploaderName === currentName))
                  )
                  .sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map((v, i) => (
                    <ProfileVideoItem 
                      key={`profile-list-${v.id || "v"}-${i}`}
                      video={v} 
                      onSelect={(v) => setModalVideo(v)} 
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
        <p className="text-center text-gray-500 text-[10px] leading-relaxed mb-4 p-8">{t.feedProfileIdentityDesc}</p>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-[100] bg-[#050505] flex justify-center overflow-hidden select-none">
      <div className={`w-full max-w-[480px] h-full bg-black relative flex flex-col no-scrollbar border-x border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)]`}>
        
        {/* Global Loading Overlay for Auth Check only on absolute initial load */}
        <AnimatePresence>
          {isAuthChecking && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-2 border-[#1A9E5C] border-t-transparent rounded-full mb-4"
              />
              <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest animate-pulse">{t.feedAuthChecking}</p>
            </motion.div>
          )}
        </AnimatePresence>
        {viewingSpecificProfile && activeTab === 'beranda' && (
          <div className="absolute inset-0 z-[500] bg-black flex flex-col h-full w-full overflow-hidden">
            {renderProfileContent()}
          </div>
        )}

        {activeTab === 'profile' ? (
          <div className="flex-1 bg-black flex flex-col no-scrollbar shrink-0 h-full overflow-hidden">
            {renderProfileContent()}
          </div>
        ) : activeTab === 'tambah' ? (
          <div className="flex-1 bg-black flex flex-col pt-8 overflow-y-auto no-scrollbar pb-24">
            <div className="flex items-center justify-between mb-8 px-8 shrink-0">
              <h2 className="text-white font-black text-lg uppercase tracking-tighter">
                {authUser ? t.feedUploadVideo : t.feedRestrictedAccess}
              </h2>
              <button 
                onClick={() => {
                  if (isUploading) {
                    handleCancelUpload();
                  } else {
                    setActiveTab('beranda');
                    setFeedHistory(['beranda']);
                  }
                }}
                className="p-3 bg-white/10 rounded-full text-white border border-white/10 active:scale-95 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {!authUser ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <LogOut size={40} className="text-[#1A9E5C] rotate-180" />
                </div>
                <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-2">{t.feedLoginTitle}</h3>
                <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-xs mb-10">
                  {t.feedLoginDesc}
                </p>
                <button 
                  onClick={handleGoogleLogin}
                  className="bg-white text-black font-black uppercase text-xs px-12 py-4 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center gap-3"
                >
                  <LogOut size={18} className="rotate-180" />
                  {t.feedLoginButton}
                </button>
              </div>
            ) : (
              <div className="px-8 flex-1 flex flex-col gap-8 max-w-sm mx-auto w-full py-10">
                {uploadSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full aspect-[4/5] rounded-3xl bg-[#1A9E5C]/10 border-2 border-[#1A9E5C]/30 flex flex-col items-center justify-center text-center p-8"
                  >
                    <div className="w-20 h-20 bg-[#1A9E5C] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(26,158,92,0.4)]">
                      <CheckCircle2 size={40} className="text-black" />
                    </div>
                    <h3 className="text-[#1A9E5C] font-black text-xl uppercase tracking-tighter mb-2">{t.feedUploadSuccessTitle}</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                      {t.feedUploadSuccessDesc}
                    </p>
                  </motion.div>
                ) : isUploading ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-10 py-10">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center">
                        <Loader2 size={48} className="text-[#1A9E5C] animate-spin" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-black text-sm">{Math.round(uploadProgress)}%</span>
                      </div>
                    </div>
                    <div className="text-center space-y-4 w-full">
                      <h3 className="text-white font-black text-xl uppercase tracking-tighter animate-pulse">
                        {uploadStatusText || t.feedUploading(Math.round(uploadProgress))}
                      </h3>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-[#1A9E5C] shadow-[0_0_15px_rgba(26,158,92,0.5)]"
                        />
                      </div>
                      <div className="flex flex-col gap-2 pt-4">
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                           <CheckCircle2 size={12} className={uploadProgress > 90 ? "text-[#1A9E5C]" : "text-gray-600"} />
                           {t.uploadStatusVideo}
                        </p>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                           <CheckCircle2 size={12} className={uploadProgress > 92 ? "text-[#1A9E5C]" : "text-gray-600"} />
                           {t.uploadStatusThumb}
                        </p>
                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                           <CheckCircle2 size={12} className={uploadProgress > 95 ? "text-[#1A9E5C]" : "text-gray-600"} />
                           {t.uploadStatusDB}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : uploadStep === 1 ? (
                  <div className="flex-1 flex flex-col gap-6">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                      accept="video/*" 
                      className="hidden" 
                    />
                    {!selectedFile ? (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[4/5] rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 hover:border-[#1A9E5C]/40 transition-colors bg-white/5 group"
                      >
                        <div className="p-5 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                          <Upload size={40} className="text-[#1A9E5C]" />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-sm">{t.feedSelectFile}</p>
                          <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest font-black">{t.feedMax50MB}</p>
                        </div>
                      </button>
                    ) : (
                        <div 
                          className="relative w-full aspect-[4/5] rounded-3xl bg-black border border-white/10 flex items-center justify-center overflow-hidden group cursor-pointer"
                          onClick={() => setPreviewPlaying(!previewPlaying)}
                        >
                          {previewUrl && (
                            <video 
                              ref={previewVideoRef}
                              key={previewUrl}
                              src={previewUrl} 
                              className={`w-full h-full object-cover upload-preview transition-opacity duration-300 ${previewPlaying ? 'opacity-80' : 'opacity-40'}`} 
                              autoPlay 
                              loop 
                              muted 
                              playsInline
                            />
                          )}
                          
                          <AnimatePresence>
                            {!previewPlaying && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="absolute inset-0 flex items-center justify-center z-10"
                              >
                                <div className="bg-white/20 backdrop-blur-md p-5 rounded-full border border-white/30">
                                  <Play size={32} className="text-white fill-white" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black flex flex-col items-center z-20">
                            <p className="text-white text-[10px] font-bold truncate max-w-full mb-2 tracking-tighter">
                              {selectedFile.name}
                            </p>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedFile(null); 
                                setPreviewUrl(null); 
                                setThumbnailPreview(null);
                                setThumbnailBlob(null);
                              }}
                              className="bg-red-500/20 text-red-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20 transition-all active:scale-95"
                            >
                              {t.feedDeleteReplace}
                            </button>
                          </div>
                        </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-gray-400 text-[10px] uppercase font-bold tracking-widest px-1">
                        {t.uploadSourceLabel}
                      </label>
                      <input 
                        type="text" 
                        value={inputTiktok} 
                        onChange={(e) => setInputTiktok(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-medium text-xs outline-none focus:border-[#1A9E5C] transition-colors"
                        placeholder={t.uploadSourcePlaceholder}
                      />
                    </div>

                    <button 
                      disabled={!selectedFile || !inputTiktok}
                      onClick={handleNextStep}
                      className="w-full bg-white text-black font-black uppercase text-xs py-4 rounded-xl shadow-xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                      {t.uploadNext}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setUploadStep(1)}
                        className="p-2 bg-white/5 rounded-full text-white/40 border border-white/10"
                      >
                        <ArrowLeft size={18} />
                      </button>
                    </div>

                    <div className="space-y-6 overflow-y-auto no-scrollbar pb-10">
                      {/* Thumbnail Choice */}
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-black text-[10px] uppercase tracking-widest">{t.feedThumbnailVideo}</p>
                          <div className="flex bg-black rounded-lg p-1">
                            <button 
                              onClick={() => { setThumbnailMode('default'); setThumbnailBlob(null); }}
                              className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all ${thumbnailMode === 'default' ? 'bg-[#1A9E5C] text-white shadow-lg' : 'text-gray-500'}`}
                            >
                              {t.feedAutoFrame}
                            </button>
                            {/* Hidden Image Upload option for now to keep it simple as requested, or implement if needed */}
                          </div>
                        </div>

                        <div className="relative aspect-[9/16] w-40 mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                           {thumbnailPreview ? (
                             <img src={thumbnailPreview} className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                               <Loader2 size={24} className="text-[#1A9E5C] animate-spin opacity-30" />
                             </div>
                           )}
                        </div>

                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-gray-500">{t.uploadCaptureHint}</span>
                              <span className="text-[#1A9E5C] font-mono">{thumbnailTimestamp.toFixed(1)}s</span>
                           </div>
                           <input 
                             type="range"
                             min="0"
                             max={videoDuration || 30}
                             step="0.1"
                             value={thumbnailTimestamp}
                             onChange={(e) => setThumbnailTimestamp(parseFloat(e.target.value))}
                             className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#1A9E5C]"
                           />
                        </div>
                      </div>

                      {/* Info Form */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-widest px-1">
                            Link Google Maps <span className="opacity-40 text-[9px] italic">{t.feedOptional}</span>
                          </label>
                          <input 
                            id="upload-location-link-input"
                            type="text" 
                            value={inputLocationLink} 
                            onChange={(e) => setInputLocationLink(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-medium text-xs outline-none focus:border-[#1A9E5C] transition-colors"
                            placeholder="Masukkan link lokasi Google Maps..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-gray-400 text-[10px] uppercase font-bold tracking-widest px-1">
                            {t.feedDescriptionLabel} <span className="opacity-40 text-[9px] italic">{t.feedOptional}</span>
                          </label>
                          <textarea 
                            value={inputDescription} 
                            onChange={(e) => setInputDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-medium text-xs outline-none focus:border-[#1A9E5C] transition-colors resize-none"
                            placeholder="Ceritakan rasa kulinermu..."
                          />
                        </div>
                      </div>

                      <button 
                        onClick={handleFinalUpload}
                        className="w-full bg-[#1A9E5C] text-white font-black uppercase text-xs py-4 rounded-xl shadow-[0_10px_20px_rgba(26,158,92,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {t.feedPostNow}
                        <Upload size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <p className="text-center text-gray-500 text-[10px] leading-relaxed mb-4 mt-8 px-8">
              {t.feedPostNote(userName)}
            </p>
          </div>
        ) : (
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {/* Unified Loading Overlay for Refresh */}
            <AnimatePresence>
              {isRefreshing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[500] bg-black/80 flex flex-col items-center justify-center gap-6"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative w-20 h-20"
                  >
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#1A9E5C] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full border border-[#1A9E5C]/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={24} className="text-[#1A9E5C] fill-[#1A9E5C]/10" />
                    </div>
                  </motion.div>
                  <div className="flex flex-col items-center gap-2">
                    <h3 className="text-white font-black uppercase tracking-widest text-xl">{t.feedLoading}</h3>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div 
                          key={`loading-dot-${i}`}
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1.5 h-1.5 bg-[#1A9E5C] rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header Feed */}
            <div className="absolute top-0 left-0 right-0 px-6 pt-10 pb-16 flex items-center justify-between z-[110] bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="flex items-center justify-between w-full pointer-events-auto">
                <div className="flex flex-col items-start">
                  <h1 className="text-lg font-black text-white uppercase tracking-[0.2em] opacity-90">{t.shortFeed}</h1>
                  <button 
                    onClick={() => setShowBetaInfo(!showBetaInfo)}
                    className={`backdrop-blur-md border px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all mt-1.5 active:scale-95 ${
                      isOfflineMode 
                        ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                        : 'bg-white/5 text-[#1A9E5C] border-white/10 shadow-[0_0_8px_rgba(0,255,0,0.2)]'
                    }`}
                  >
                    {isOfflineMode ? t.feedOfflineModeTag : t.feedBetaTag}
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={handleRefresh} className="p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all active:rotate-180">
                    <RefreshCcw size={16} />
                  </button>
                  <button onClick={toggleMute} className="p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 active:scale-95">
                    {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <button onClick={onBack} className="p-2.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 active:scale-90">
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

              <div 
                ref={scrollContainerRef}
                onScroll={handleFeedScroll}
                className="w-full h-full flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
              >
              {videoFeed.length > 0 ? (
                videoFeed.map((video, index) => {
                  const shouldRenderVideo = Math.abs(index - activeVideoIndex) <= 1;
                  const isMenuOrModalOpen = showComments || showActionSheet || modalVideo || showEditVideoModal || showDeleteVideoConfirm || showDeleteConfirm;
                  const isActive = index === activeVideoIndex && activeTab === 'beranda' && !isMenuOrModalOpen;
                  
                  if (!shouldRenderVideo) {
                    return (
                      <div 
                        key={`feed-video-placeholder-${video.id || index}-${index}`} 
                        className="w-full h-full min-h-full snap-start snap-always bg-black shrink-0 flex items-center justify-center"
                      >
                         <Loader2 size={24} className="text-[#1A9E5C]/10 animate-spin" />
                      </div>
                    );
                  }

                  return (
                    <VideoItem 
                      key={`feed-video-${video.id || index}-${index}`}
                      data={video} 
                      index={index} 
                      volume={volume} 
                      language={language} 
                      currentUser={authUser}
                      isVerified={isOfflineMode && video.uploaderId === OFFLINE_SYSTEM_PROFILE.id ? true : isUserVerified(video.uploaderId, video.uploaderName || t.feedGuestName)}
                      onProfileClick={handleProfileClick}
                      onDelete={handleDeleteVideo}
                      onEdit={handleEditVideo}
                      onCommentClick={handleCommentClick}
                      isLikedInitially={likeHistorySet.has(video.id)}
                      onWatch={handleVideoWatched}
                      onLike={handleToggleLike}
                      onMoreClick={handleMoreClick}
                      isActive={isActive}
                      isOfflineMode={isOfflineMode}
                    />
                  );
                })
              ) : !isInitialLoading && !isAuthChecking && videoFeed.length === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center">
                  <div className="bg-neutral-900/50 p-6 rounded-3xl border border-white/5 flex flex-col items-center mb-6">
                    <Loader2 size={32} className={`text-[#1A9E5C] mb-4 opacity-50 ${onlineSwitchError ? 'animate-none' : 'animate-spin'}`} />
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                      {onlineSwitchError ? "Connection Error" : t.feedEmpty}
                    </p>
                    {onlineSwitchError && (
                       <p className="text-red-500/60 text-[8px] mt-2 font-mono max-w-[200px] line-clamp-2">{onlineSwitchError}</p>
                    )}
                  </div>
                  
                  {onlineSwitchError ? (
                    <div className="space-y-4">
                      <button 
                        onClick={() => enableOfflineMode(onlineSwitchError)}
                        className="px-8 py-4 bg-[#1A9E5C] text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-[0_0_20px_rgba(0,255,0,0.2)] active:scale-95 transition-all"
                      >
                        Gunakan Mode Offline
                      </button>
                      <button 
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2 text-white/40 text-[9px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                      >
                        <RefreshCcw size={12} />
                        Coba Lagi
                      </button>
                    </div>
                  ) : (
                    <>
                      {authUser ? (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-[280px]">
                          <p className="text-red-400 text-[10px] font-bold uppercase leading-tight mb-2">
                            {t.feedSupabaseRLSWarning}
                          </p>
                          <p className="text-gray-400 text-[9px] leading-relaxed">
                            {t.feedSupabaseRLSDesc}
                          </p>
                          <p className="text-white text-[9px] mt-2 font-bold">
                            {t.feedSupabaseRLSFix}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-[9px] mt-2 max-w-[200px]">
                          {t.feedGuestPrompt}
                        </p>
                      )}

                      <button 
                        onClick={handleRefresh}
                        className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <RefreshCcw size={14} className="text-[#1A9E5C]" />
                        {t.feedManualRefresh}
                      </button>
                    </>
                  )}
                  {!authUser && !onlineSwitchError && (
                    <p className="mt-4 text-[#1A9E5C]/40 text-[8px] font-bold uppercase">{t.feedStatusGuest}</p>
                  )}
                </div>
              )}

              {/* Boundary at the end of the feed as item N+1 */}
              {!isInitialLoading && !isRefreshing && videoFeed.length > 0 && (
                  <>
                    <div className="w-full h-full snap-start snap-always shrink-0 bg-[#050505] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                      {/* Decorative Background Elements */}
                      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#1A9E5C]/10 blur-[100px] rounded-full" />
                      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-[#1A9E5C]/5 blur-[100px] rounded-full" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
                      
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="z-10 flex flex-col items-center"
                      >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_40px_rgba(0,255,0,0.1)]">
                          <CheckCircle2 size={36} className="text-[#1A9E5C] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]" />
                        </div>
                        
                        <h3 className="text-white font-black text-xl uppercase tracking-[0.2em] mb-3">{t.feedFinishedTitle}</h3>
                        <p className="text-gray-500 text-[11px] uppercase font-bold tracking-widest leading-loose max-w-[220px]">
                          {t.feedFinishedDesc(videoFeed.length)}
                        </p>
                        
                        <div className="flex flex-col gap-3 mt-12 w-full max-w-[240px]">
                          <button 
                            onClick={handleShuffleReload}
                            className="bg-[#1A9E5C] text-black font-black uppercase text-[10px] py-4 px-10 rounded-full shadow-[0_0_30px_rgba(0,255,0,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 group"
                          >
                            <RefreshCcw size={16} className="group-active:rotate-180 transition-transform" />
                            {t.feedReloadFeed}
                          </button>
                          
                          <p className="text-gray-600 text-[9px] font-bold uppercase tracking-[0.3em] mt-4 opacity-50 animate-bounce">
                            {t.feedScrollToReload}
                          </p>
                        </div>
                        
                        <div className="mt-16 opacity-20">
                          <div className="text-[11px] font-black tracking-[0.5em] text-white uppercase">Kuliner Feed</div>
                          <div className="w-16 h-0.5 bg-[#1A9E5C] mx-auto mt-3" />
                        </div>
                      </motion.div>
                    </div>
                    {/* The "Scroll to Reload" Trigger Zone */}
                    <div 
                      ref={reloadTriggerRef}
                      className="w-full h-80 snap-start shrink-0 flex items-start justify-center pt-20"
                    >
                       <div className="flex flex-col items-center gap-4 opacity-20">
                         <Loader2 size={32} className="text-[#1A9E5C] animate-spin" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A9E5C]">{t.feedLoadingMore}</span>
                       </div>
                    </div>
                  </>
                )}
              </div>
            </div>
        )}

      <AnimatePresence>
        {modalVideo && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-[1500] bg-black"
          >
            <VideoItem 
              data={modalVideo} 
              index={0} 
              volume={volume} 
              language={language} 
              currentUser={authUser}
              isVerified={isOfflineMode && modalVideo.uploaderId === OFFLINE_SYSTEM_PROFILE.id ? true : isUserVerified(modalVideo.uploaderId, modalVideo.uploaderName || t.feedGuestName)}
              onProfileClick={handleProfileClick}
              onDelete={handleDeleteVideo}
              onEdit={handleEditVideo}
              onCommentClick={handleCommentClick}
              isLikedInitially={likeHistorySet.has(modalVideo.id)}
              onWatch={handleVideoWatched}
              onLike={handleToggleLike}
              onMoreClick={handleMoreClick}
              isActive={!(showComments || showActionSheet || showEditVideoModal || showDeleteVideoConfirm || showDeleteConfirm)}
              isModal={true}
              onBack={() => setModalVideo(null)}
              isOfflineMode={isOfflineMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComments && activeVideoForComments && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowComments(false);
                setReplyingTo(null);
              }}
              className="absolute inset-0 z-[1999] bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 z-[2000] h-[75vh] bg-[#0f0f0f] border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-3 mb-1 shrink-0" />
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
                <div className="w-10"></div>
                <div className="flex flex-col items-center">
                  <p className="text-white font-black text-xs uppercase tracking-[0.2em]">{t.feedGlobalComments}</p>
                  <p className="text-[9px] text-[#1A9E5C] font-bold uppercase tracking-widest mt-0.5 opacity-60">{globalComments.length} Comments</p>
                </div>
                <button 
                  onClick={() => {
                    setShowComments(false);
                    setReplyingTo(null);
                  }}
                  className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 no-scrollbar">
                {globalComments.length > 0 ? (
                  globalComments
                    .filter(c => !c.parent_id || c.parent_id === "" || c.parent_id === null) // Show top-level comments first
                    .map((comment, i) => {
                      const isCreator = comment.user_id === activeVideoForComments.uploaderId;
                      // Support both real IDs and temp IDs for replies
                      const replies = globalComments.filter(r => r.parent_id === comment.id && r.id !== comment.id);
                      
                      return (
                        <div key={`comment-${comment.id || "c"}-${i}`} className="flex flex-col gap-4">
                          <div className="flex gap-3 items-start group">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1A9E5C] to-[#1A9E5C] p-0.5 shrink-0 shadow-lg" onClick={() => handleProfileClick(comment.user_name)}>
                              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                {comment.user_avatar_url ? (
                                  <img src={comment.user_avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <User size={20} className="text-white/40" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleProfileClick(comment.user_name)}>
                                    <p className="text-white font-black text-[11px] tracking-tight truncate max-w-[120px]">@{String(comment.user_name || 'user').toLowerCase().replace(/\s/g, '_')}</p>
                                    {isUserVerified(comment.user_email, comment.user_name) && (
                                      <CheckCircle2 size={10} className="text-[#1A9E5C] fill-[#1A9E5C]/20" />
                                    )}
                                  </div>
                                  {isCreator && (
                                    <span className="bg-[#1A9E5C]/10 text-[#1A9E5C] text-[7px] font-black uppercase px-2 py-0.5 rounded-full border border-[#1A9E5C]/20 tracking-widest">
                                      {t.creator}
                                    </span>
                                  )}
                                  <span className="text-white/30 text-[9px] font-medium">
                                    {new Date(comment.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {(authUser && (
                                    (comment.user_id === authUser.id) || 
                                    activeVideoForComments.uploaderId === authUser.id || 
                                    authUser.email === 'thewaking5@gmail.com'
                                  )) && (
                                    <button 
                                      onClick={() => handleDeleteComment(comment)}
                                      className="p-1 text-red-500/40 hover:text-red-500 transition-all flex items-center gap-1 group/del"
                                    >
                                      <Trash2 size={12} />
                                      <span className="text-[8px] font-black uppercase opacity-0 group-hover/del:opacity-100 transition-opacity">Hapus</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-white/90 text-xs leading-relaxed font-medium">{comment.text}</p>
                              <div className="flex items-center gap-5 pt-1.5 border-t border-white/5">
                                <button 
                                  onClick={() => setReplyingTo(comment)}
                                  className="flex items-center gap-1.5 group/reply"
                                >
                                  <span className="text-[9px] text-white/40 font-black uppercase tracking-widest group-hover/reply:text-[#1A9E5C] transition-colors">{t.feedReply}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Replies Display */}
                          {replies.length > 0 && (
                            <div className="ml-12 space-y-4 pt-2 border-l border-white/5 pl-4">
                              {replies.map((reply, ri) => (
                                <div key={`reply-${reply.id || "r"}-${ri}`} className="flex gap-3 items-start group/replyitem">
                                  <div className="w-7 h-7 rounded-full bg-white/5 shrink-0 border border-white/10 overflow-hidden" onClick={() => handleProfileClick(reply.user_name)}>
                                    {reply.user_avatar_url ? (
                                      <img src={reply.user_avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-white/30">
                                        <User size={12} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-white/70 font-black text-[10px]">@{String(reply.user_name || 'user').toLowerCase().replace(/\s/g, '_')}</p>
                                        {reply.user_id === activeVideoForComments.uploaderId && (
                                          <span className="bg-[#1A9E5C]/10 text-[#1A9E5C] text-[6px] font-black uppercase px-1.5 py-0.5 rounded-full border border-[#1A9E5C]/20 tracking-[0.15em]">{t.creator}</span>
                                        )}
                                      </div>
                                      {(authUser && (
                                        (reply.user_id === authUser.id) || 
                                        activeVideoForComments.uploaderId === authUser.id || 
                                        authUser.email === 'thewaking5@gmail.com'
                                      )) && (
                                        <button onClick={() => handleDeleteComment(reply)} className="text-red-500/30 hover:text-red-500 transition-colors p-1">
                                          <Trash2 size={10} />
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-white/60 text-[11px] leading-relaxed">{reply.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/10 opacity-20">
                      <MessageCircle size={32} className="text-white" />
                    </div>
                    <p className="text-[#1A9E5C] font-black text-xs uppercase tracking-[0.2em] mb-1">{t.feedNoCommentsAlt}</p>
                    <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest">{t.feedFirstCommentPrompt}</p>
                  </div>
                )}
              </div>

              {/* Reply Indicator Bar */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="px-6 py-3 bg-[#1a1a1a] border-t border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-1 h-4 bg-[#1A9E5C] rounded-full" />
                      <p className="text-[10px] text-white/70 font-black uppercase tracking-widest truncate">
                        {t.feedReply} <span className="text-[#1A9E5C]">@{replyingTo.user_name}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setReplyingTo(null)} 
                      className="p-1.5 bg-white/5 rounded-full text-white/30 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 bg-[#161616] border-t border-white/10 pb-10 flex items-center gap-4 shrink-0 transition-all">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A9E5C] to-[#1A9E5C] p-0.5 shrink-0 overflow-hidden shadow-2xl relative">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                    {userAvatar ? (
                      <img src={userAvatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={18} className="text-white/40" />
                    )}
                  </div>
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                    placeholder={replyingTo ? `Reply to @${replyingTo.user_name}...` : t.feedAddCommentPlaceholder} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#1A9E5C] focus:bg-white/10 transition-all font-medium"
                  />
                </div>
                <button 
                  onClick={handlePostComment}
                  disabled={isPostingComment || !commentText.trim()}
                  className="w-11 h-11 rounded-2xl bg-[#1A9E5C] flex items-center justify-center text-black disabled:opacity-20 disabled:grayscale transition-all active:scale-90 shadow-lg"
                >
                  {isPostingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} fill="currentColor" />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFollowListModal && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-x-0 bottom-0 z-[2100] h-[60vh] bg-[#121212] border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="w-10"></div>
              <p className="text-white font-bold text-xs uppercase tracking-widest">{showFollowListModal === 'followers' ? t.feedFollowers : t.feedFollowing}</p>
              <button 
                onClick={() => setShowFollowListModal(null)}
                className="p-2 text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {(showFollowListModal === 'followers' ? followerList : followingList).length > 0 ? (
                (showFollowListModal === 'followers' ? followerList : followingList).map((targetName, i) => (
                  <div key={`follow-list-${targetName || "user"}-${i}`} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setViewingSpecificProfile(targetName); setShowFollowListModal(null); }}>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 uppercase text-[12px] font-black text-[#1A9E5C]">
                        {targetName[0]}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-white font-black text-xs">@{targetName.toLowerCase().replace(/\s+/g, '_')}</p>
                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-tight">{targetName}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setViewingSpecificProfile(targetName); setShowFollowListModal(null); }}
                      className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg border border-white/10 transition-all"
                    >
                      {t.feedView}
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center opacity-30">
                  <User size={48} className="text-white mb-4" />
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{t.feedNoList}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBetaInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[500] bg-black/20"
            onClick={() => setShowBetaInfo(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-6 top-28 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 w-auto max-w-[240px] z-[510] shadow-2xl"
            >
              <div className="flex flex-col gap-2 relative">
                {isOfflineMode && (
                  <button 
                    onClick={() => {
                      setShowBetaInfo(false);
                      setShowOfflineSwitchModal(true);
                    }}
                    className="absolute -top-1 -right-1 bg-white/10 p-1.5 rounded-lg hover:bg-[#1A9E5C]/20 transition-colors group"
                    title={t.feedSwitchMode}
                  >
                    <RefreshCcw size={12} className="text-[#1A9E5C] group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                )}
                
                {isOfflineMode && (
                  <div className="flex items-center gap-2 text-red-500 mb-1 pr-6">
                    <AlertTriangle size={14} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.feedOfflineModalTitle}</span>
                  </div>
                )}
                <p className={`text-[10px] leading-relaxed font-medium ${isOfflineMode ? 'text-white pr-4' : 'text-gray-300'}`}>
                  {isOfflineMode ? t.feedOfflineModalDesc : t.feedBetaInfo}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Connection Mode Switch Modal */}
        <AnimatePresence>
          {showOfflineSwitchModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[600] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
              onClick={() => setShowOfflineSwitchModal(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-[320px] bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setShowOfflineSwitchModal(false)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[#1A9E5C]/10 rounded-2xl flex items-center justify-center mb-2">
                    <RefreshCcw size={32} className="text-[#1A9E5C]" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                      {t.feedSwitchTitle}
                    </h3>
                    <p className="text-[10px] text-white/50 font-medium">
                      {t.feedSwitchDesc}
                    </p>
                    {onlineSwitchError && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400 text-[9px] font-bold uppercase leading-tight text-left">
                          Supabase Error:
                        </p>
                        <p className="text-red-300/60 text-[8px] mt-1 text-left line-clamp-2">
                          {onlineSwitchError}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="w-full grid gap-3 pt-4">
                    <button 
                      onClick={async () => {
                        showToast("Menghubungkan ke Supabase...", "info");
                        await fetchSupabaseVideos(true);
                      }}
                      className="w-full bg-[#1A9E5C] hover:bg-[#1A9E5C]/80 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,255,0,0.2)]"
                    >
                      <Globe size={16} strokeWidth={3} />
                      {t.feedSwitchOnline}
                    </button>
                    
                    <button 
                      onClick={() => setShowOfflineSwitchModal(false)}
                      className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 mb-2"
                    >
                      <WifiOff size={16} strokeWidth={2} />
                      {t.feedSwitchOffline}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Action Sheet (Bottom Sheet UI) */}
        <AnimatePresence>
          {showActionSheet && actionSheetVideo && (
            <div className="fixed inset-0 z-[6000] flex items-end justify-center px-4 pb-12 lg:pb-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowActionSheet(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300, mass: 0.8 }}
                className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-[32px] overflow-hidden p-6 pb-12 shadow-2xl"
              >
                {/* Grabber */}
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8 cursor-pointer" onClick={() => setShowActionSheet(false)} />
                
                <h3 className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-center">{t.feedActionSheetTitle}</h3>
                
                <div className="space-y-3">
                  <a 
                    href={actionSheetVideo.tiktokUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => setShowActionSheet(false)}
                    className="flex items-center gap-5 p-4.5 bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all text-white font-bold text-sm group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center group-active:scale-90 transition-transform">
                      <ExternalLink size={22} className="text-blue-500" />
                    </div>
                    <div className="flex flex-col">
                      <span>{t.feedActionSource}</span>
                      <span className="text-[10px] text-white/30 font-medium">Lihat video asli di TikTok</span>
                    </div>
                  </a>

                  {authUser && (actionSheetVideo.uploaderId === authUser.id || authUser.email === 'thewaking5@gmail.com') && (
                    <>
                      <button 
                        onClick={() => {
                          setShowActionSheet(false);
                          handleEditVideo(actionSheetVideo);
                        }}
                        className="w-full flex items-center gap-5 p-4.5 bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all text-white font-bold text-sm group"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-[#1A9E5C]/10 flex items-center justify-center group-active:scale-90 transition-transform">
                          <Settings size={22} className="text-[#1A9E5C]" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span>{t.feedActionEdit}</span>
                          <span className="text-[10px] text-white/30 font-medium">Ubah judul, deskripsi & thumbnail</span>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => {
                          setShowActionSheet(false);
                          handleDeleteVideo(actionSheetVideo);
                        }}
                        className="w-full flex items-center gap-5 p-4.5 bg-red-500/5 rounded-2xl border border-red-500/10 active:scale-95 transition-all text-red-500 font-bold text-sm group"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-red-500/10 flex items-center justify-center group-active:scale-90 transition-transform">
                          <Trash2 size={22} className="text-red-500" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span>{t.feedActionDelete}</span>
                          <span className="text-[10px] text-red-500/30 font-medium">Hapus video secara permanen</span>
                        </div>
                      </button>
                    </>
                  )}
                </div>
                
                <button 
                  onClick={() => setShowActionSheet(false)}
                  className="w-full mt-8 py-4.5 bg-white/5 rounded-2xl text-white/60 font-bold text-sm active:scale-95 transition-all border border-white/5"
                >
                  {t.resetCancel}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEditVideoModal && videoToEdit && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-2xl flex flex-col p-6 overflow-y-auto no-scrollbar pb-24"
            >
              <div className="flex items-center justify-between mb-10 max-w-sm mx-auto w-full">
                <h2 className="text-white font-black text-2xl uppercase tracking-tighter italic">EDIT <span className="text-[#1A9E5C]">VIDEO</span></h2>
                <button 
                  onClick={() => setShowEditVideoModal(false)} 
                  className="p-3 bg-white/5 rounded-full text-white/50 hover:text-white transition-all active:rotate-90"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-10 max-w-sm mx-auto w-full flex flex-col items-center">
                {/* Thumbnail Preview Area */}
                <div className="space-y-5 w-full flex flex-col items-center">
                  <label className="text-[#1A9E5C] text-[10px] font-black uppercase tracking-[0.4em] mb-2">{t.feedThumbnailPreview}</label>
                  <div className="aspect-[9/16] w-full max-w-[220px] bg-[#0a0a0a] rounded-[40px] border-4 border-white/5 overflow-hidden relative group shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]">
                    {editThumbnailPreview ? (
                      <img key={editThumbnailPreview} src={editThumbnailPreview} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/10">
                        <Image size={48} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">No Thumbnail</span>
                      </div>
                    )}
                    {isSavingVideoEdit && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-10 gap-4">
                        <Loader2 size={40} className="text-[#1A9E5C] animate-spin" />
                        <span className="text-[#1A9E5C] text-[9px] font-black uppercase tracking-widest animate-pulse">Menyimpan...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Options */}
                <div className="space-y-8 w-full">
                  {/* Frame Slider */}
                  <div className="space-y-5 p-7 bg-white/5 rounded-[32px] border border-white/5 shadow-inner">
                    <div className="flex items-center justify-center gap-2">
                      <Video size={14} className="text-[#1A9E5C]" />
                      <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{t.feedThumbnailSliderHint}</label>
                    </div>
                    <div className="flex justify-center mb-1">
                       <div className="bg-[#1A9E5C] text-black px-4 py-1.5 rounded-full text-[12px] font-black font-mono shadow-lg shadow-[#1A9E5C]/20">
                        {editThumbnailTimestamp.toFixed(1)}s
                       </div>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="60"
                      step="0.1"
                      value={editThumbnailTimestamp}
                      onChange={(e) => setEditThumbnailTimestamp(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                    />
                    <button 
                      onClick={async () => {
                        try {
                          showToast("Memproses frame...", "info");
                          const blob = await createVideoThumbnailBlobFromUrl(videoToEdit.url, editThumbnailTimestamp);
                          const url = URL.createObjectURL(blob);
                          if (editThumbnailPreview) URL.revokeObjectURL(editThumbnailPreview);
                          setEditThumbnailPreview(url);
                          setEditThumbnailBlob(blob);
                        } catch (err: any) {
                          showToast(err.message, "error");
                        }
                      }}
                      className="w-full mt-4 py-3 bg-white/10 hover:bg-[#1A9E5C] hover:text-black rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 border border-white/5"
                    >
                      TETAPKAN FRAME INI
                    </button>
                  </div>

                  {/* Description & Location Fields */}
                  <div className="bg-white/5 rounded-[32px] p-7 border border-white/5 space-y-6 shadow-inner">
                    <div className="space-y-2">
                      <label className="text-white/30 text-[10px] uppercase font-black tracking-widest px-1">
                        Link Google Maps <span className="opacity-30 font-normal italic lowercase">{t.feedOptional}</span>
                      </label>
                      <input 
                        id="edit-location-link-input"
                        type="text" 
                        value={editLocationLink} 
                        onChange={(e) => setEditLocationLink(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-[20px] px-5 py-4 text-white font-bold text-sm outline-none focus:border-[#1A9E5C]/50 transition-all placeholder:text-white/10"
                        placeholder="Link lokasi kulinermu..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-white/30 text-[10px] uppercase font-black tracking-widest px-1">
                        {t.feedDescriptionLabel} <span className="opacity-30 font-normal italic lowercase">{t.feedOptional}</span>
                      </label>
                      <textarea 
                        value={editDescription} 
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={4}
                        className="w-full bg-black/40 border border-white/5 rounded-[20px] px-5 py-4 text-white font-medium text-sm outline-none focus:border-[#1A9E5C]/50 transition-all resize-none placeholder:text-white/10"
                        placeholder="Ceritakan sedikit tentang video ini..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      disabled={isSavingVideoEdit}
                      onClick={handleSaveVideoEdit}
                      className="w-full bg-[#1A9E5C] text-black font-black uppercase text-sm py-5 rounded-[24px] shadow-2xl shadow-[#1A9E5C]/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      {isSavingVideoEdit ? "MENYIMPAN..." : t.feedSaveChanges}
                    </button>
                    <button 
                      onClick={() => setShowEditVideoModal(false)}
                      className="w-full py-4 text-white/30 font-bold text-[11px] uppercase tracking-widest hover:text-white transition-colors"
                    >
                      {t.resetCancel}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </AnimatePresence>

      {/* REPORT MODAL */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[5000] bg-black/90 backdrop-blur-xl flex flex-col p-6 overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-white font-black text-xl uppercase tracking-tight">{t.reportTitle}</h2>
              <button onClick={() => setShowReportModal(false)} className="p-2 text-white opacity-50 hover:opacity-100 transition-opacity"><X size={24} /></button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2 relative">
                <label className="text-[#1A9E5C] text-[9px] font-black uppercase tracking-[0.2em] px-1">{t.reportCategory}</label>
                
                <button 
                  onClick={() => setIsReportCategoryOpen(!isReportCategoryOpen)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left flex items-center justify-between transition-all group active:scale-[0.98]"
                >
                  <span className={`font-bold text-sm tracking-tight ${reportCategory ? 'text-white' : 'text-white/40'}`}>
                    {reportCategory === 'bug' ? t.reportBug : 
                     reportCategory === 'account' ? t.reportAccount : 
                     reportCategory === 'other' ? t.reportOther : 
                     t.reportSelectCategory}
                  </span>
                  <motion.div animate={{ rotate: isReportCategoryOpen ? 180 : 0 }}>
                    <Play size={12} className="text-white/20 rotate-90" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isReportCategoryOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 z-[5100] bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                      {[
                        { id: 'bug', label: t.reportBug },
                        { id: 'account', label: t.reportAccount },
                        { id: 'other', label: t.reportOther }
                      ].map((cat, idx) => (
                        <button 
                          key={`report-cat-${cat.id || idx}-${idx}`}
                          onClick={() => {
                            setReportCategory(cat.id as any);
                            setIsReportCategoryOpen(false);
                          }}
                          className={`w-full p-4 text-left font-bold text-sm hover:bg-[#1A9E5C]/10 transition-colors flex items-center justify-between ${
                            reportCategory === cat.id ? 'text-[#1A9E5C] bg-[#1A9E5C]/5' : 'text-white/80'
                          }`}
                        >
                          {cat.label}
                          {reportCategory === cat.id && <CheckCircle2 size={16} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <label className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] px-1">{t.reportName}</label>
                <input 
                  type="text" 
                  value={reportForm.name}
                  onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                  placeholder={t.reportPlaceholderName}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-bold text-sm outline-none focus:border-[#1A9E5C] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] px-1">{t.reportEmail}</label>
                <input 
                  type="email" 
                  value={reportForm.email}
                  onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                  placeholder={t.reportPlaceholderEmail}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-bold text-sm outline-none focus:border-[#1A9E5C] transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] px-1">{t.reportExplanation}</label>
                <textarea 
                  rows={4}
                  value={reportForm.explanation}
                  onChange={(e) => setReportForm({ ...reportForm, explanation: e.target.value })}
                  placeholder={t.reportPlaceholderDetail}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white font-medium text-sm outline-none focus:border-[#1A9E5C] transition-colors resize-none leading-relaxed"
                />
              </div>

              <button 
                onClick={handleReportNow}
                disabled={isSubmittingReport}
                className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl ${
                  isSubmittingReport ? 'bg-gray-800 text-gray-500' : 'bg-[#1A9E5C] text-black shadow-[0_10px_30px_rgba(0,255,0,0.15)]'
                }`}
              >
                {isSubmittingReport ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                {isSubmittingReport ? t.reportSending : t.reportSend}
              </button>
              
              <p className="text-center text-gray-600 text-[8px] font-bold uppercase tracking-widest mt-6 pb-20 opacity-40">
                {t.reportProcessed}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteVideoConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[4000] bg-black/80 backdrop-blur-md flex items-center justify-center p-8 text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-black border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full backdrop-blur-2xl">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-2">{t.feedDeleteVideo}</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8 opacity-60">
                {t.feedDeleteConfirm}
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  disabled={isDeletingVideo}
                  onClick={confirmDeleteVideo} 
                  className="w-full bg-red-500 text-white font-black uppercase text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isDeletingVideo ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {isDeletingVideo ? "MENGHAPUS..." : "IYA, HAPUS"}
                </button>
                <button 
                  disabled={isDeletingVideo}
                  onClick={() => setShowDeleteVideoConfirm(false)} 
                  className="w-full text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] py-2 mt-2 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {t.resetCancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM LOGOUT CONFIRM MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[4000] bg-black/80 backdrop-blur-md flex items-center justify-center p-8 text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#121212] border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} className="text-red-500" />
              </div>
              <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-2">{t.feedLogout}</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8 opacity-60">
                {t.feedLogoutConfirm}
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmLogout} className="w-full bg-red-500 text-white font-black uppercase text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-95 transition-all">
                  {t.feedLogout}
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} className="w-full text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] py-2 mt-2 opacity-50 hover:opacity-100 transition-opacity">
                  {t.resetCancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM DELETE ACCOUNT CONFIRM MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[4000] bg-black/80 backdrop-blur-md flex items-center justify-center p-8 text-center">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#121212] border border-red-500/20 p-8 rounded-3xl shadow-2xl max-w-sm w-full">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-red-500 font-black text-lg uppercase tracking-tighter mb-4">HAPUS AKUN PERMANEN</h3>
              <div className="bg-red-500/5 rounded-xl p-4 mb-8 text-left border border-red-500/10">
                <p className="text-gray-300 text-[9px] font-medium leading-relaxed">
                  {t.feedDeleteAccountWarning.split('\n\n').slice(1).join('\n\n')}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  disabled={isDeletingAccount}
                  onClick={confirmDeleteAccount} 
                  className="w-full bg-red-600 text-white font-black uppercase text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isDeletingAccount ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  {isDeletingAccount ? "PROSES..." : "IYA, HAPUS PERMANEN"}
                </button>
                <button 
                  disabled={isDeletingAccount}
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="w-full text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] py-2 mt-2 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {t.resetCancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-8 text-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#121212] border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full"
            >
              <div className="w-16 h-16 bg-[#1A9E5C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={32} className="text-[#1A9E5C] fill-[#1A9E5C]/20" />
              </div>
              <h3 className="text-white font-black text-xl uppercase tracking-tighter mb-2">{t.feedLoginPromptTitle}</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8 opacity-60">
                {t.feedLoginPromptDesc}
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { handleGoogleLogin(); setShowLoginPrompt(false); }}
                  className="w-full bg-[#1A9E5C] text-black font-black uppercase text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(0,255,0,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <LogIn size={18} />
                  {t.feedLoginButton}
                </button>
                <button 
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] py-2 mt-2 opacity-50 hover:opacity-100 transition-opacity"
                >
                  {t.feedMaybeLater}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM NOTIFICATION TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-10 left-4 right-4 z-[9999] flex justify-center pointer-events-none"
          >
            <div className={`
              px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 max-w-[90%]
              ${toast.type === 'success' ? 'bg-[#1A9E5C]/10 border-[#1A9E5C]/30 text-[#1A9E5C]' : 
                toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                'bg-blue-500/10 border-blue-500/30 text-blue-400'}
            `}>
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <Loader2 size={20} className={toast.type === 'info' ? 'animate-spin' : ''} />}
              <span className="text-xs font-black uppercase tracking-tight leading-tight">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Ultra-Thin Elegant Design) */}
      <div className="absolute bottom-0 left-0 right-0 z-[160] bg-black/40 backdrop-blur-3xl px-6 pt-1 pb-3 border-t border-white/10 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => {
              const wasAlreadyOnBeranda = activeTab === 'beranda';
              setViewingSpecificProfile(null);
              
              if (!wasAlreadyOnBeranda) {
                // Just navigate, no reload
                setActiveTab('beranda');
                setFeedHistory(['beranda']);
                resetFeedScroll();
              } else if (!isRefreshing) {
                // On beranda and not currently loading, trigger reload
                handleRefresh();
                resetFeedScroll();
              }
            }}
            className={`flex flex-col items-center gap-0.5 transition-all ${activeTab === 'beranda' ? 'text-[#1A9E5C]' : 'text-white/30'}`}
          >
            {isRefreshing ? (
              <Loader2 size={18} className="animate-spin text-[#1A9E5C]" />
            ) : (
              <Home size={18} className={activeTab === 'beranda' ? 'fill-[#1A9E5C]/10' : ''} />
            )}
            <span className="text-[7.5px] uppercase tracking-[0.2em] font-black">{t.feedHome}</span>
          </button>

          <button 
            onClick={() => {
              setViewingSpecificProfile(null);
              if (isOfflineMode) {
                showToast("Upload tidak tersedia di mode offline demo.", "info");
                return;
              }
              navigateFeed('tambah');
            }}
            className={`relative flex items-center justify-center group active:scale-95 transition-all px-2 ${activeTab === 'tambah' ? 'opacity-100' : 'opacity-40'}`}
          >
            <div className="w-8 h-5.5 bg-white rounded-md flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1.5 bg-[#00F2EA] -translate-x-1"></div>
              <div className="absolute inset-y-0 right-0 w-1.5 bg-[#FF0050] translate-x-1"></div>
              <div className="bg-white absolute inset-0 z-0"></div>
              <X size={14} className="text-black rotate-45 relative z-10" />
            </div>
          </button>

          <button 
            onClick={() => {
              setViewingSpecificProfile(null);
              navigateFeed('profile');
            }}
            className={`flex flex-col items-center gap-0.5 transition-all ${activeTab === 'profile' ? 'text-white' : 'text-white/30'}`}
          >
            <User size={18} className={activeTab === 'profile' ? 'fill-white' : ''} />
            <span className="text-[7.5px] uppercase tracking-[0.2em] font-black">{t.feedProfile}</span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {cropImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] bg-black flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md">
              <button onClick={() => setCropImage(null)} className="text-white p-2">
                <X size={24} />
              </button>
              <h3 className="text-white font-black uppercase text-xs tracking-widest">CROP FOTO PROFIL</h3>
              <button 
                onClick={handleApplyCrop}
                className="bg-[#1A9E5C] text-black font-black uppercase text-[10px] px-6 py-2 rounded-full active:scale-95 transition-all shadow-lg"
              >
                TERAPKAN
              </button>
            </div>
            
            <div className="flex-1 relative bg-black">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-8 bg-black/50 backdrop-blur-md border-t border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-white/40 font-black text-[9px] uppercase">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-white/20 rounded-full appearance-none accent-[#1A9E5C]"
                />
              </div>
            </div>

            {isCropping && (
              <div className="absolute inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 size={32} className="text-[#1A9E5C] animate-spin" />
                  <span className="text-[#1A9E5C] font-black uppercase text-[10px] tracking-widest animate-pulse">Menyimpan...</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
};
