"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Instagram, Palette, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

export type ShareDataType = 'insights' | 'top-aspects';

export interface InsightShareData {
  type: 'music-radar' | 'musical-age' | 'mood-ring' | 'genre-passport' | 'night-owl';
  title: string;
  mainValue: string | number;
  description: string;
  aiInsight?: string;
  visualData: any;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface TopAspectShareData {
  type: 'top-tracks' | 'top-artists' | 'top-albums' | 'top-genres' | 'recent-plays';
  title: string;
  items: Array<{
    name: string;
    artist?: string;
    album?: string;
    image?: string;
    plays?: number;
    popularity?: number;
  }>;
  period: string;
}

export interface GlobalShareProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: ShareDataType;
  insightData?: InsightShareData[];
  topAspectData?: TopAspectShareData[];
  onTimeRangeChange?: (timeRange: TimeRange) => Promise<TopAspectShareData[]>;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export const timeRangeLabels = {
  'short_term': '1 Month',
  'medium_term': '6 Months', 
  'long_term': 'All Time'
};

const colorThemes = [
  {
    name: 'Vynce Aurora',
    primary: '#1DB954',
    secondary: '#00FF7F', 
    accent: '#32CD32',
    bg: 'linear-gradient(135deg, #0D0F0D 0%, #1a2f1a 50%, #0D0F0D 100%)',
    bgSolid: '#0D0F0D',
    gradient: 'linear-gradient(135deg, #1DB954 0%, #00FF7F 50%, #32CD32 100%)',
    glow: 'rgba(29, 185, 84, 0.4)',
    preview: 'linear-gradient(45deg, #1DB954, #00FF7F)'
  },
  {
    name: 'Cyberpunk Neon',
    primary: '#00D4FF',
    secondary: '#FF0080',
    accent: '#7C3AED',
    bg: 'linear-gradient(135deg, #0A0A0F 0%, #1a0a2e 50%, #16213e 100%)',
    bgSolid: '#0A0A0F',
    gradient: 'linear-gradient(135deg, #00D4FF 0%, #FF0080 50%, #7C3AED 100%)',
    glow: 'rgba(0, 212, 255, 0.5)',
    preview: 'linear-gradient(45deg, #00D4FF, #FF0080)'
  },
  {
    name: 'Miami Vice',
    primary: '#FF6B9D',
    secondary: '#C44569',
    accent: '#F8B500',
    bg: 'linear-gradient(135deg, #2C1810 0%, #3a1f3d 50%, #2C1810 100%)',
    bgSolid: '#2C1810',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 50%, #F8B500 100%)',
    glow: 'rgba(255, 107, 157, 0.4)',
    preview: 'linear-gradient(45deg, #FF6B9D, #F8B500)'
  },
  {
    name: 'Northern Lights',
    primary: '#4FACFE',
    secondary: '#00F2FE', 
    accent: '#43E97B',
    bg: 'linear-gradient(135deg, #0A1628 0%, #1e3a5f 50%, #0A1628 100%)',
    bgSolid: '#0A1628',
    gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 50%, #43E97B 100%)',
    glow: 'rgba(79, 172, 254, 0.5)',
    preview: 'linear-gradient(45deg, #4FACFE, #43E97B)'
  },
  {
    name: 'Sunset Blaze',
    primary: '#FF512F',
    secondary: '#DD2476',
    accent: '#F953C6',
    bg: 'linear-gradient(135deg, #1A0A0A 0%, #3d1a1a 50%, #1A0A0A 100%)',
    bgSolid: '#1A0A0A',
    gradient: 'linear-gradient(135deg, #FF512F 0%, #DD2476 50%, #F953C6 100%)',
    glow: 'rgba(255, 81, 47, 0.4)',
    preview: 'linear-gradient(45deg, #FF512F, #F953C6)'
  },
  {
    name: 'Golden Hour',
    primary: '#FFB75E',
    secondary: '#ED8F03',
    accent: '#FF6B35',
    bg: 'linear-gradient(135deg, #1F1611 0%, #3d2914 50%, #1F1611 100%)',
    bgSolid: '#1F1611',
    gradient: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 50%, #FF6B35 100%)',
    glow: 'rgba(255, 183, 94, 0.4)',
    preview: 'linear-gradient(45deg, #FFB75E, #FF6B35)'
  }
];

export default function GlobalShareInterface({ 
  isOpen, 
  onClose, 
  dataType, 
  insightData = [], 
  topAspectData = [],
  onTimeRangeChange
}: GlobalShareProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [includeAIInsight, setIncludeAIInsight] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('medium_term');
  const [dynamicTopAspectData, setDynamicTopAspectData] = useState<TopAspectShareData[]>([]);
  const [isLoadingTimeRange, setIsLoadingTimeRange] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use dynamic data for top aspects when time range changes
  const currentData = dataType === 'insights' 
    ? insightData 
    : (dataType === 'top-aspects' && dynamicTopAspectData.length > 0) 
      ? dynamicTopAspectData 
      : topAspectData;
  const totalCards = currentData.length;
  
  // Reset current index when data changes to prevent out-of-bounds
  useEffect(() => {
    if (currentIndex >= totalCards && totalCards > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalCards]);
  


  // Device detection
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    }
  }, []);

  // Handle time range changes for top aspects
  // Memoize the stable reference to prevent infinite re-renders
  const stableOnTimeRangeChange = useCallback(onTimeRangeChange || (() => Promise.resolve([])), [onTimeRangeChange]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDataForTimeRange = async () => {
      if (dataType === 'top-aspects' && stableOnTimeRangeChange && isOpen) {
        setIsLoadingTimeRange(true);
        // Clear existing data immediately to show loading state
        setDynamicTopAspectData([]);
        try {
          const newData = await stableOnTimeRangeChange(selectedTimeRange);
          if (isMounted) {
            setDynamicTopAspectData(newData);
            // Keep user on the same card when time range changes
            // Only reset to first card if current index is out of bounds
            if (currentIndex >= newData.length && newData.length > 0) {
              setCurrentIndex(0);
            }
          }
        } catch (error) {
          console.error('Failed to fetch data for time range:', error);
          // Keep existing data if fetch fails
        } finally {
          if (isMounted) {
            setIsLoadingTimeRange(false);
          }
        }
      }
    };

    // Only fetch if we're not already loading and interface is open
    if (dataType === 'top-aspects' && isOpen) {
      fetchDataForTimeRange();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedTimeRange, dataType, isOpen, stableOnTimeRangeChange]);

  // Note: Initial data fetching is now handled by the main useEffect above

  // Reset dynamic data when interface closes
  useEffect(() => {
    if (!isOpen) {
      setDynamicTopAspectData([]);
      setCurrentIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen || totalCards <= 1) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, totalCards, currentIndex]);

  // Handle swipe gestures
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (info.offset.x < -threshold && currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Navigation functions
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Generate shareable image
  const generateShareableImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    setIsGeneratingImage(true);
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: colorThemes[selectedTheme].bgSolid,
        useCORS: true,
        scale: 2,
        width: 1080,
        height: 1920, // Instagram story dimensions
      });

      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.95);
      });
    } catch (error) {
      console.error('Failed to generate image:', error);
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Share to Instagram Stories
  const shareToInstagram = async () => {
    const blob = await generateShareableImage();
    if (!blob) return;

    try {
      if (deviceType === 'ios' || deviceType === 'android') {
        // For mobile devices, try to open Instagram app
        const file = new File([blob], 'vynce-insight.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Music Insights from Vynce',
            text: 'Check out my music personality!'
          });
        } else {
          // Fallback: download the image
          downloadImage(blob);
        }
      } else {
        // Desktop: download image with instructions
        downloadImage(blob);
        alert('Image downloaded! Upload it manually to Instagram Stories.');
      }
    } catch (error) {
      console.error('Failed to share to Instagram:', error);
      downloadImage(blob);
    }
  };

  // Download image
  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vynce-${dataType}-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Save to device
  const saveToDevice = async () => {
    const blob = await generateShareableImage();
    if (!blob) return;

    try {
      if (deviceType === 'ios' || deviceType === 'android') {
        // For mobile devices, try to trigger download
        downloadImage(blob);
      } else {
        // Desktop: download
        downloadImage(blob);
      }
    } catch (error) {
      console.error('Failed to save image:', error);
      downloadImage(blob);
    }
  };

  // Native share
  const nativeShare = async () => {
    const blob = await generateShareableImage();
    if (!blob) return;

    try {
      const file = new File([blob], 'vynce-insight.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Music Insights from Vynce',
          text: 'Discover your musical DNA with Vynce!'
        });
      } else {
        downloadImage(blob);
      }
    } catch (error) {
      console.error('Native share failed:', error);
      downloadImage(blob);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="h-full w-full flex flex-col max-h-screen overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Mobile Optimized */}
          <div className="flex items-center justify-between p-3 lg:p-4 bg-zinc-900/90 backdrop-blur-sm border-b border-white/10">
            <h2 className="text-base lg:text-lg font-semibold text-white">
              Share Your {dataType === 'insights' ? 'Music Insights' : 'Top Music'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={18} className="text-white lg:w-5 lg:h-5" />
            </button>
          </div>

          {/* Main Content Area - Mobile Optimized Layout */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            {/* Card Display Area */}
            <div className="flex-1 flex items-center justify-center p-2 lg:p-4 bg-gradient-to-br from-zinc-900 to-black min-h-0">
              {totalCards > 0 ? (
                <div className="relative w-full max-w-sm lg:max-w-md mx-auto px-3 lg:px-8 h-full flex flex-col justify-center">
                  {/* Navigation Arrows */}
                  {totalCards > 1 && (
                    <>
                      <button
                        onClick={goToPrevious}
                        disabled={currentIndex === 0}
                        className="absolute -left-1 lg:-left-4 top-1/2 -translate-y-1/2 z-20 p-2 lg:p-4 rounded-full bg-black/80 backdrop-blur-md shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/90 hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20"
                        style={{ 
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                        }}
                      >
                        <ChevronLeft size={20} className="text-white lg:w-7 lg:h-7" />
                      </button>
                      <button
                        onClick={goToNext}
                        disabled={currentIndex === totalCards - 1}
                        className="absolute -right-1 lg:-right-4 top-1/2 -translate-y-1/2 z-20 p-2 lg:p-4 rounded-full bg-black/80 backdrop-blur-md shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/90 hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20"
                        style={{ 
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                        }}
                      >
                        <ChevronRight size={20} className="text-white lg:w-7 lg:h-7" />
                      </button>
                    </>
                  )}

                  {/* Card */}
                  <motion.div
                    key={`${dataType}-${currentIndex}-${selectedTimeRange}-${currentData.length}`}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={handleDragEnd}
                    whileDrag={{ scale: 0.95 }}
                    className="w-full aspect-[9/16] max-h-[55vh] lg:max-h-[70vh]"
                  >
                    <div
                      ref={cardRef}
                      className="w-full h-full rounded-xl lg:rounded-3xl overflow-hidden shadow-2xl"
                      style={{
                        background: colorThemes[selectedTheme].bg
                      }}
                    >
                      {dataType === 'insights' ? (
                        <InsightShareCard 
                          data={currentData[currentIndex] as InsightShareData} 
                          theme={colorThemes[selectedTheme]} 
                          includeAIInsight={includeAIInsight}
                        />
                      ) : (
                        <TopAspectShareCard 
                          data={currentData[currentIndex] as TopAspectShareData} 
                          theme={colorThemes[selectedTheme]}
                          timeRange={selectedTimeRange}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Card Indicator */}
                  {totalCards > 1 && (
                    <div className="flex justify-center mt-3 lg:mt-6 gap-2 lg:gap-3">
                      {Array.from({ length: totalCards }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`w-2.5 h-2.5 lg:w-4 lg:h-4 rounded-full transition-all duration-200 border-2 ${
                            index === currentIndex 
                              ? 'bg-white border-white scale-125 shadow-lg' 
                              : 'bg-white/20 border-white/40 hover:bg-white/50 hover:border-white/60 hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-white/60">
                  <p>No data available for sharing</p>
                </div>
              )}
            </div>

            {/* Controls Panel - Mobile Optimized */}
            <div className="w-full lg:w-72 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-white/10 p-3 lg:p-4 space-y-3 lg:space-y-4 overflow-y-auto flex-shrink-0 max-h-[35vh] lg:max-h-none">
              {/* Share Actions - Top Priority */}
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Instagram Stories */}
                  <button
                    onClick={shareToInstagram}
                    disabled={isGeneratingImage}
                    className="flex items-center justify-center gap-2 p-2 lg:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-xs lg:text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                  >
                    <Instagram size={16} className="lg:w-4 lg:h-4" />
                    Story
                  </button>

                  {/* Native Share */}
                  <button
                    onClick={nativeShare}
                    disabled={isGeneratingImage}
                    className="flex items-center justify-center gap-2 p-2 lg:p-3 bg-blue-600 rounded-lg text-white text-xs lg:text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    <Sparkles size={16} className="lg:w-4 lg:h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Time Range Selector - Only for top aspects */}
              {dataType === 'top-aspects' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Time Period</label>
                  <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                    {Object.entries(timeRangeLabels).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setSelectedTimeRange(value as TimeRange)}
                        disabled={isLoadingTimeRange}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${
                          selectedTimeRange === value
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        } disabled:opacity-50`}
                      >
                        {isLoadingTimeRange && selectedTimeRange === value ? 'Loading...' : label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insight Toggle - Only for insights */}
              {dataType === 'insights' && (
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">AI Insight</span>
                    <button
                      onClick={() => setIncludeAIInsight(!includeAIInsight)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        includeAIInsight ? 'bg-white' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-black transition-transform ${
                          includeAIInsight ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>
              )}

              {/* Color Theme Selector */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">Theme</label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {colorThemes.map((theme, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTheme(index)}
                      className={`relative group transition-all duration-300 ${
                        selectedTheme === index 
                          ? 'scale-110' 
                          : 'hover:scale-105'
                      }`}
                      title={theme.name}
                    >
                      <div 
                        className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 transition-all duration-300 relative overflow-hidden ${
                          selectedTheme === index 
                            ? 'border-white shadow-xl' 
                            : 'border-white/40 hover:border-white/70'
                        }`}
                        style={{ 
                          background: theme.preview,
                          boxShadow: selectedTheme === index 
                            ? `0 0 25px ${theme.glow}` 
                            : 'none'
                        }}
                      >
                        {/* Shimmer effect */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
                          style={{ animationDuration: '2s' }}
                        />
                      </div>
                      
                      {/* Active indicator */}
                      {selectedTheme === index && (
                        <div 
                          className="absolute inset-0 rounded-full animate-pulse"
                          style={{
                            background: theme.preview,
                            filter: 'blur(12px)',
                            opacity: 0.4,
                            zIndex: -1
                          }}
                        />
                      )}
                      
                      {/* Theme name tooltip */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20">
                        {theme.name}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/90"></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Individual card components remain the same but with better styling
function InsightShareCard({ 
  data, 
  theme, 
  includeAIInsight 
}: { 
  data: InsightShareData; 
  theme: typeof colorThemes[0]; 
  includeAIInsight: boolean;
}) {
  if (!data) return null;

  // Get descriptive subtitle for each insight type
  const getInsightSubtitle = (type: string) => {
    switch (type) {
      case 'music-radar':
        return 'Your music personality across 5 key dimensions';
      case 'mood-ring':
        return 'The emotional landscape of your music';
      case 'night-owl':
        return 'When you listen to music throughout the day';
      case 'musical-age':
        return 'The decades that define your musical taste';
      case 'genre-passport':
        return 'Your musical journey across different genres';
      default:
        return 'Discover insights about your music taste';
    }
  };

  // Render visual component based on insight type
  const renderVisual = () => {
    switch (data.type) {
      case 'music-radar':
        return <CompactRadarChart data={data.visualData} theme={theme} />;
      case 'mood-ring':
        return <CompactMoodRing data={data.visualData} theme={theme} />;
      case 'night-owl':
        return <CompactNightOwlChart data={data.visualData} theme={theme} />;
      case 'musical-age':
        return <CompactMusicalAgeChart data={data.visualData} theme={theme} />;
      case 'genre-passport':
        return <CompactGenreChart data={data.visualData} theme={theme} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full p-4 lg:p-6 text-white relative overflow-hidden">
      {/* Enhanced Background Pattern with Translucent Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            background: `radial-gradient(circle at 30% 20%, ${theme.glow} 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${theme.glow} 0%, transparent 50%)`
          }}
        />
        
        {/* Floating orbs with glow */}
        <div 
          className="absolute top-6 lg:top-10 left-6 lg:left-10 w-20 lg:w-32 h-20 lg:h-32 rounded-full border-2 border-white/30 animate-pulse"
          style={{
            background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
            boxShadow: `0 0 30px ${theme.glow}`
          }}
        />
        <div 
          className="absolute bottom-6 lg:bottom-10 right-6 lg:right-10 w-16 lg:w-24 h-16 lg:h-24 rounded-full border border-white/20"
          style={{
            background: `conic-gradient(from 0deg, ${theme.primary}20, ${theme.secondary}20, ${theme.accent}20, ${theme.primary}20)`,
            animation: 'spin 20s linear infinite'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/4 w-12 lg:w-16 h-12 lg:h-16 rounded-full border border-white/15"
          style={{
            background: `linear-gradient(45deg, ${theme.glow}, transparent)`,
            filter: 'blur(2px)'
          }}
        />
        
        {/* Subtle particle effects */}
        <div className="absolute inset-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 12}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header for Music Radar */}
        {data.type === 'music-radar' && (
          <div className="text-center mb-2">
            <h1 className="text-base lg:text-lg font-semibold text-white/90 mb-1">{data.title}</h1>
            <p className="text-white/70 text-xs lg:text-sm">{getInsightSubtitle(data.type)}</p>
          </div>
        )}

        {/* Header for other insights */}
        {data.type !== 'music-radar' && data.type !== 'genre-passport' && data.type !== 'night-owl' && (
          <div className="text-center mb-3 lg:mb-4">
            <div className="w-10 lg:w-12 h-10 lg:h-12 mx-auto mb-2 lg:mb-3 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={20} className="lg:w-6 lg:h-6" />
            </div>
            <h1 className="text-lg lg:text-xl font-bold mb-1">{data.title}</h1>
            <p className="text-white/70 text-xs lg:text-sm mb-1">{getInsightSubtitle(data.type)}</p>
            <p className="text-white/80 text-xs lg:text-sm">{data.description}</p>
          </div>
        )}

        {/* Header for Genre Passport */}
        {data.type === 'genre-passport' && (
          <div className="text-center mb-3 lg:mb-4">
            <div className="w-10 lg:w-12 h-10 lg:h-12 mx-auto mb-2 lg:mb-3 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg lg:text-xl">🎵</span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold mb-1">{data.title}</h1>
            <p className="text-white/70 text-xs lg:text-sm">{getInsightSubtitle(data.type)}</p>
          </div>
        )}

        {/* Header for Night Owl */}
        {data.type === 'night-owl' && (
          <div className="text-center mb-3 lg:mb-4">
            <div className="w-10 lg:w-12 h-10 lg:h-12 mx-auto mb-2 lg:mb-3 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg lg:text-xl">
                {data.visualData?.isNightOwl ? '🌙' : '☀️'}
              </span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold mb-1">{data.title}</h1>
            <p className="text-white/70 text-xs lg:text-sm">{getInsightSubtitle(data.type)}</p>
          </div>
        )}

        {/* Visual Chart - Larger for Music Radar, Hidden for Genre Passport and Night Owl */}
        {data.type !== 'genre-passport' && data.type !== 'night-owl' && (
          <div className="flex-1 flex items-center justify-center mb-1 lg:mb-2">
            <div className={`w-full h-full ${
              data.type === 'music-radar' 
                ? 'max-w-[280px] lg:max-w-[320px] max-h-[200px] lg:max-h-[240px]' 
                : 'max-w-[200px] lg:max-w-[240px] h-[120px] lg:h-[150px]'
            }`}>
              {renderVisual()}
            </div>
          </div>
        )}

        {/* Main Value - Only for non-radar insights */}
        {data.type !== 'music-radar' && data.type !== 'musical-age' && data.type !== 'mood-ring' && data.type !== 'genre-passport' && data.type !== 'night-owl' && (
          <div className="text-center mb-3 lg:mb-4">
            <div className="text-2xl lg:text-3xl font-bold mb-2">{data.mainValue}</div>
          </div>
        )}

        {/* Mood Ring specific display */}
        {data.type === 'mood-ring' && (
          <div className="text-center mb-3 lg:mb-4">
            {/* All Moods with Percentages - Compact */}
            {data.visualData?.emotions && (
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {Object.entries(data.visualData.emotions)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([mood, value]) => {
                    const total = Object.values(data.visualData.emotions).reduce((sum: number, val) => sum + (val as number), 0);
                    const percentage = total > 0 ? Math.round((value as number / total) * 100) : 0;
                    const moodColors = {
                      happy: '#1DB954',
                      energetic: '#FF6B6B', 
                      chill: '#4ECDC4',
                      melancholy: '#9B59B6'
                    };
                    const moodColor = moodColors[mood as keyof typeof moodColors] || theme.primary;
                    
                    return (
                      <div 
                        key={mood}
                        className="rounded-md p-1.5 backdrop-blur-sm border flex items-center justify-between"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          borderColor: 'rgba(255,255,255,0.15)'
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: moodColor }}
                          />
                          <span className="text-white/80 font-medium capitalize text-xs">
                            {mood}
                          </span>
                        </div>
                        <span className="text-white font-semibold text-xs">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Musical Age specific display */}
        {data.type === 'musical-age' && (
          <div className="text-center mb-3 lg:mb-4">
            {/* Enhanced Age Display with better styling */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div 
                className="text-5xl lg:text-6xl font-black tracking-tight text-white"
                style={{ 
                  textShadow: `0 0 20px rgba(255,255,255,0.4)`
                }}
              >
                {data.visualData.age || '9'}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white font-bold text-lg lg:text-xl">years</span>
                <div 
                  className="text-xs px-3 py-1 rounded-full font-semibold mt-1 border text-white"
                  style={{ 
                    backgroundColor: `${theme.primary}25`, 
                    borderColor: `${theme.primary}50`
                  }}
                >
                  {data.visualData.description || 'Streaming Era'}
                </div>
              </div>
            </div>

            {/* Enhanced Compact Track Info - Always show with fallback data */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div 
                className="rounded-lg p-2.5 backdrop-blur-sm border"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.15)'
                }}
              >
                <div className="text-white/60 font-medium mb-1.5 text-center">Oldest Track</div>
                <div className="text-white font-semibold truncate text-center text-xs">
                  {data.visualData.oldestTrack?.name || 
                   data.visualData.oldestSong?.name || 
                   'What A Wonderful World'}
                </div>
                <div className="text-white/70 truncate text-center text-xs">
                  {(data.visualData.oldestTrack?.artist || 
                    data.visualData.oldestSong?.artist || 
                    'Louis Armstrong')} • {(data.visualData.oldestTrack?.year || 
                    data.visualData.oldestSong?.year || 
                    '1968')}
                </div>
              </div>
              
              <div 
                className="rounded-lg p-2.5 backdrop-blur-sm border"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.15)'
                }}
              >
                <div className="text-white/60 font-medium mb-1.5 text-center">Newest Track</div>
                <div className="text-white font-semibold truncate text-center text-xs">
                  {data.visualData.newestTrack?.name || 
                   data.visualData.newestSong?.name || 
                   'Madira'}
                </div>
                <div className="text-white/70 truncate text-center text-xs">
                  {(data.visualData.newestTrack?.artist || 
                    data.visualData.newestSong?.artist || 
                    'Seedhe Maut')} • {(data.visualData.newestTrack?.year || 
                    data.visualData.newestSong?.year || 
                    '2025')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Genre Passport specific display */}
        {data.type === 'genre-passport' && (
          <div className="text-center mb-3 lg:mb-4">
            {/* Exploration Text */}
            <div className="mb-4">
              <p className="text-white text-sm lg:text-base font-medium">
                You have explored
              </p>
              <div className="text-3xl lg:text-4xl font-bold">
                <span 
                  className="font-black"
                  style={{ 
                    color: theme.primary,
                    textShadow: `0 0 20px ${theme.primary}80, 0 2px 4px rgba(0,0,0,0.8)`,
                    WebkitTextFillColor: theme.primary,
                    filter: 'brightness(1.2)'
                  }}
                >
                  {data.visualData?.totalGenres || data.mainValue || 0}
                </span>
                <span 
                  className="text-white font-bold ml-2"
                  style={{ 
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  genres
                </span>
              </div>
            </div>

            {/* Top 3 Genres Display */}
            {data.visualData?.topGenres && (
              <div className="space-y-2 max-w-[200px] lg:max-w-[240px] mx-auto">
                <h4 className="text-white/70 text-xs lg:text-sm font-medium mb-3">Your Top Genres</h4>
                {data.visualData.topGenres.slice(0, 3).map((genre: any, index: number) => {
                  const genreName = typeof genre === 'string' ? genre : genre.name || genre.genre;
                  return (
                    <div
                      key={genreName}
                      className="flex items-center gap-2 lg:gap-3 bg-white/8 rounded-lg lg:rounded-xl p-2 lg:p-3 backdrop-blur-sm border border-white/15"
                    >
                      {/* Rank Badge */}
                      <div className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold
                        ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                          'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                        }`}
                      >
                        {index + 1}
                      </div>
                      
                      {/* Genre Name */}
                      <div className="flex-1 text-left">
                        <span className="text-white font-medium capitalize text-sm lg:text-base">
                          {genreName}
                        </span>
                      </div>
                      
                      {/* Musical Note Icon */}
                      <div className="text-sm lg:text-base" style={{ color: theme.primary }}>🎵</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Night Owl specific display */}
        {data.type === 'night-owl' && (
          <div className="text-center mb-3 lg:mb-4">
            {/* Pattern Type & Peak Hour */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-2xl lg:text-3xl">
                  {data.visualData?.isNightOwl ? '🌙' : '☀️'}
                </span>
                <div className="text-center">
                  <div 
                    className="text-lg lg:text-xl font-bold leading-tight"
                    style={{ 
                      color: theme.primary,
                      textShadow: `0 0 15px ${theme.primary}60, 0 2px 4px rgba(0,0,0,0.8)`,
                      WebkitTextFillColor: theme.primary,
                      filter: 'brightness(1.1)'
                    }}
                  >
                    {data.visualData?.isNightOwl ? 'Night Owl' : 'Early Bird'}
                  </div>
                  <div className="text-white/80 text-xs lg:text-sm">
                    Peak at {data.visualData?.peakHour !== undefined ? 
                      (data.visualData.peakHour === 0 ? '12AM' : 
                       data.visualData.peakHour === 12 ? '12PM' :
                       data.visualData.peakHour > 12 ? `${data.visualData.peakHour - 12}PM` : 
                       `${data.visualData.peakHour}AM`) : '9PM'}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced 24-Hour Heatmap */}
            {data.visualData?.histogram && (
              <div className="w-full max-w-[280px] lg:max-w-[300px] mx-auto">
                <h4 className="text-white/80 text-xs lg:text-sm font-medium mb-3">24-Hour Listening Pattern</h4>
                
                {/* Visual Heatmap */}
                <div className="grid grid-cols-12 gap-1 mb-3">
                  {data.visualData.histogram.slice(0, 12).map((value: number, index: number) => {
                    const hour = index * 2; // Show every 2 hours for better spacing
                    const maxValue = Math.max(...data.visualData.histogram);
                    const intensity = maxValue > 0 ? value / maxValue : 0;
                    const isPeak = hour === data.visualData.peakHour || (hour + 1) === data.visualData.peakHour;
                    const height = Math.max(6, intensity * 32);
                    
                    return (
                      <div key={hour} className="flex flex-col items-center">
                        <div
                          className="w-full rounded-sm transition-all duration-300 relative overflow-hidden"
                          style={{
                            background: isPeak 
                              ? `linear-gradient(to top, ${theme.primary}, ${theme.secondary || theme.primary})`
                              : intensity > 0.1 
                                ? `linear-gradient(to top, ${theme.primary}${Math.round(intensity * 255).toString(16).padStart(2, '0')}, ${theme.primary}${Math.round(intensity * 180).toString(16).padStart(2, '0')})`
                                : 'rgba(255,255,255,0.1)',
                            height: `${height}px`,
                            boxShadow: isPeak 
                              ? `0 0 8px ${theme.primary}60, 0 0 12px ${theme.primary}30`
                              : intensity > 0.5 ? `0 0 4px ${theme.primary}40` : 'none',
                            border: isPeak ? `1px solid ${theme.primary}` : 'none'
                          }}
                        >
                          {/* Peak indicator glow */}
                          {isPeak && (
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-sm" />
                          )}
                        </div>
                        
                        {/* Time labels */}
                        <span className="text-xs text-white/60 mt-1 font-medium">
                          {hour === 0 ? '12A' : hour === 12 ? '12P' : hour > 12 ? `${hour-12}P` : `${hour}A`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Activity Summary */}
                <div className="flex justify-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span className="text-white/70">High</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: `${theme.primary}60` }}
                    />
                    <span className="text-white/70">Med</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                    <span className="text-white/70">Low</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Insight - Optimized spacing */}
        {includeAIInsight && data.aiInsight && (
          <div className={`bg-white/10 rounded-lg lg:rounded-xl backdrop-blur-sm ${
            data.type === 'music-radar' 
              ? 'p-2 lg:p-3 mb-2' 
              : 'p-3 lg:p-4 mb-3 lg:mb-4'
          }`}>
            <p className="text-white/90 leading-relaxed text-xs lg:text-sm line-clamp-3">{data.aiInsight}</p>
          </div>
        )}

        {/* Tiny Footer - Bottom Right */}
        <div className="absolute bottom-2 right-2 lg:bottom-3 lg:right-3">
          <div className="text-xs text-white/50 font-medium">
            Vynce
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact visual components for each insight type
function CompactRadarChart({ data, theme }: { data: any; theme: typeof colorThemes[0] }) {
  if (!data || !data.scores) return null;

  const chartData = Object.entries(data.scores).map(([name, value]) => ({
    axis: name.replace('-', ' '),
    value: value as number,
  }));

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 220 220" className="overflow-visible">
        {/* Radial grid lines */}
        <g>
          {chartData.map((_, i) => {
            const angle = (i * 2 * Math.PI) / chartData.length - Math.PI / 2;
            const x2 = 110 + 80 * Math.cos(angle);
            const y2 = 110 + 80 * Math.sin(angle);
            return (
              <line
                key={`radial-${i}`}
                x1="110"
                y1="110"
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Concentric circles */}
        <g>
          {[0.3, 0.6, 1].map((scale) => (
            <circle
              key={scale}
              cx="110"
              cy="110"
              r={80 * scale}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
          ))}
        </g>
        
        {/* Data polygon with gradient */}
        <defs>
          <radialGradient id="radarGradient" cx="0.5" cy="0.5" r="0.8">
            <stop offset="0%" stopColor={theme.primary} stopOpacity="0.9" />
            <stop offset="70%" stopColor={theme.primary} stopOpacity="0.6" />
            <stop offset="100%" stopColor={theme.primary} stopOpacity="0.3" />
          </radialGradient>
        </defs>
        
        <polygon
          points={chartData.map((item, i) => {
            const angle = (i * 2 * Math.PI) / chartData.length - Math.PI / 2;
            const radius = (item.value / 100) * 80;
            const x = 110 + radius * Math.cos(angle);
            const y = 110 + radius * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ')}
          fill="url(#radarGradient)"
          stroke={theme.primary}
          strokeWidth="2.5"
          opacity="0.95"
        />
        
        {/* Data points */}
        {chartData.map((item, i) => {
          const angle = (i * 2 * Math.PI) / chartData.length - Math.PI / 2;
          const radius = (item.value / 100) * 80;
          const x = 110 + radius * Math.cos(angle);
          const y = 110 + radius * Math.sin(angle);
          
          return (
            <circle
              key={`point-${i}`}
              cx={x}
              cy={y}
              r="2.5"
              fill={theme.primary}
              opacity="0.9"
            />
          );
        })}
        
        {/* Axis labels - matching home tab names */}
        {chartData.map((item, i) => {
          const angle = (i * 2 * Math.PI) / chartData.length - Math.PI / 2;
          const labelRadius = 95;
          const x = 110 + labelRadius * Math.cos(angle);
          const y = 110 + labelRadius * Math.sin(angle);
          
          // Use exact same names as home tab radar
          let label = item.axis;
          
          return (
            <text
              key={item.axis}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="8"
              fontWeight="400"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function CompactMoodRing({ data, theme }: { data: any; theme: typeof colorThemes[0] }) {
  if (!data || !data.emotions) return null;

  const emotions = data.emotions;
  const total = Object.values(emotions).reduce((sum: number, val) => sum + (val as number), 0);
  
  const colors = {
    happy: '#1DB954',
    energetic: '#FF6B6B', 
    chill: '#4ECDC4',
    melancholy: '#9B59B6'
  };

  const segments = Object.entries(emotions).map(([emotion, value]) => {
    const percentage = total > 0 ? (value as number / total) * 100 : 0;
    const angle = total > 0 ? (value as number / total) * 360 : 0;
    return { emotion, value: value as number, percentage, angle };
  });

  // Enhanced dimensions for better visibility
  const outerRadius = 70;
  const innerRadius = 45;
  const center = 90;

  let accumulatedAngle = 0;
  const pathSegments = segments.map((segment) => {
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + segment.angle;
    
    const x1 = center + outerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
    const y1 = center + outerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
    const x2 = center + outerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
    const y2 = center + outerRadius * Math.sin((endAngle - 90) * Math.PI / 180);
    
    const x3 = center + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
    const y3 = center + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180);
    const x4 = center + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
    const y4 = center + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
    
    const largeArcFlag = segment.angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
    
    accumulatedAngle += segment.angle;
    
    return {
      ...segment,
      pathData
    };
  });

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="lg:w-[200px] lg:h-[200px]">
        {/* Enhanced background ring with gradient */}
        <defs>
          <radialGradient id="moodRingBg" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
          </radialGradient>
          
          {/* Individual gradients for each mood */}
          {Object.entries(colors).map(([mood, color]) => (
            <radialGradient key={`${mood}Gradient`} id={`${mood}Gradient`} cx="0.5" cy="0.5" r="0.8">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="70%" stopColor={color} stopOpacity="0.7" />
              <stop offset="100%" stopColor={color} stopOpacity="0.5" />
            </radialGradient>
          ))}
        </defs>
        
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={(outerRadius + innerRadius) / 2}
          fill="url(#moodRingBg)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />
        
        {/* Enhanced segments with gradients and glow */}
        {pathSegments.map((segment) => (
          <g key={segment.emotion}>
            {/* Glow effect */}
            <path
              d={segment.pathData}
              fill={`url(#${segment.emotion}Gradient)`}
              stroke={colors[segment.emotion as keyof typeof colors]}
              strokeWidth="3"
              opacity="0.95"
              filter="drop-shadow(0 0 8px rgba(255,255,255,0.3))"
            />
          </g>
        ))}
        
        {/* Enhanced center with mood icon */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 5}
          fill="rgba(0,0,0,0.3)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
        />
        
        {/* Center mood icon */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-2xl"
          fill="white"
        >
          🎭
        </text>
      </svg>
    </div>
  );
}

function CompactNightOwlChart({ data, theme }: { data: any; theme: typeof colorThemes[0] }) {
  if (!data || !data.histogram) return null;

  const hourlyData = data.histogram;
  const maxValue = Math.max(...hourlyData);
  const peakHour = data.peakHour;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[160px] lg:max-w-[180px]">
        <div className="grid grid-cols-12 gap-0.5 lg:gap-1">
          {hourlyData.map((value: number, hour: number) => {
            const intensity = maxValue > 0 ? value / maxValue : 0;
            const isPeak = hour === peakHour;
            const height = Math.max(3, intensity * 24); // Reduced height for mobile
            
            return (
              <div
                key={hour}
                className="flex flex-col items-center"
              >
                <div
                  className="w-full rounded-sm transition-all duration-300"
                  style={{
                    backgroundColor: isPeak 
                      ? theme.primary 
                      : `${theme.primary}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
                    height: `${height}px`
                  }}
                />
                {[0, 6, 12, 18].includes(hour) && (
                  <span className="text-xs text-white/60 mt-0.5 lg:mt-1">
                    {hour === 0 ? '12A' : hour === 12 ? '12P' : hour > 12 ? `${hour-12}P` : `${hour}A`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CompactMusicalAgeChart({ data, theme }: { data: any; theme: typeof colorThemes[0] }) {
  if (!data) return null;

  // Use actual decade distribution data if available, otherwise generate based on age
  let chartData;
  
  if (data.decadeDistribution && Array.isArray(data.decadeDistribution)) {
    // Use real data from musical age calculation
    chartData = data.decadeDistribution.slice(0, 7); // Limit to 7 decades for space
  } else {
    // Fallback: Generate sample data based on the musical age
    const decades = ['60s', '70s', '80s', '90s', '00s', '10s', '20s'];
    const currentYear = new Date().getFullYear();
    const age = typeof data.age === 'number' ? data.age : parseInt(data.age) || 25;
    const peakDecade = Math.max(0, Math.min(6, Math.floor((currentYear - age) / 10) - 196));
    
    chartData = decades.map((decade, index) => {
      const distance = Math.abs(index - peakDecade);
      const value = Math.max(10, 100 - (distance * 20));
      return { decade, value };
    });
  }

  const maxValue = Math.max(...chartData.map((d: any) => d.value || d.weight || 0));

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[180px] lg:max-w-[200px]">
        <div className="flex items-end justify-between gap-1.5 lg:gap-2 h-20 lg:h-24">
          {chartData.map((item: any, index: number) => {
            const value = item.value || item.weight || 0;
            const height = maxValue > 0 ? (value / maxValue) * 75 : 12;
            const label = item.decade || item.label || `${60 + index * 10}s`;
            const isPeak = value === maxValue;
            const intensity = maxValue > 0 ? value / maxValue : 0.3;
            
            return (
              <div key={label} className="flex flex-col items-center flex-1 relative">
                {/* Enhanced bar with gradient and glow effect */}
                <div
                  className="w-full rounded-t-lg lg:rounded-t-xl transition-all duration-500 relative overflow-hidden"
                  style={{
                    background: isPeak 
                      ? `linear-gradient(to top, ${theme.primary}, ${theme.secondary})`
                      : `linear-gradient(to top, ${theme.primary}${Math.round(intensity * 255).toString(16).padStart(2, '0')}, ${theme.primary}${Math.round(intensity * 180).toString(16).padStart(2, '0')})`,
                    height: `${Math.max(8, height)}px`,
                    boxShadow: isPeak 
                      ? `0 0 12px ${theme.primary}40, 0 0 20px ${theme.primary}20`
                      : `0 0 6px ${theme.primary}30`,
                    border: isPeak ? `1px solid ${theme.primary}60` : 'none'
                  }}
                >
                  {/* Highlight overlay for peak */}
                  {isPeak && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-t-lg lg:rounded-t-xl"
                    />
                  )}
                  
                  {/* Subtle animation shimmer */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"
                    style={{ animationDuration: isPeak ? '2s' : '3s' }}
                  />
                </div>
                
                {/* Enhanced label */}
                <span 
                  className={`text-xs mt-1.5 lg:mt-2 font-medium transition-colors duration-300 ${
                    isPeak ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {label}
                </span>
                
                {/* Peak indicator */}
                {isPeak && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: theme.primary }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CompactGenreChart({ data, theme }: { data: any; theme: typeof colorThemes[0] }) {
  if (!data) return null;

  // Use actual genre data if available, otherwise fallback to sample data
  let genreData;
  
  if (data.genres && Array.isArray(data.genres)) {
    // Use real genre data
    genreData = data.genres.slice(0, 4).map((genre: any) => ({
      name: genre.name || genre.genre || genre,
      value: genre.count || genre.percentage || genre.value || 50
    }));
  } else if (data.topGenres && Array.isArray(data.topGenres)) {
    // Alternative data structure
    genreData = data.topGenres.slice(0, 4).map((genre: any) => ({
      name: genre,
      value: 50 // Default value when no count available
    }));
  } else {
    // Fallback to sample data
    genreData = [
      { name: 'Pop', value: 85 },
      { name: 'Rock', value: 65 },
      { name: 'Hip-Hop', value: 45 },
      { name: 'Electronic', value: 30 }
    ];
  }

  const maxValue = Math.max(...genreData.map((g: any) => g.value));
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[140px] space-y-2">
        {genreData.map((genre: any, index: number) => {
          const width = maxValue > 0 ? (genre.value / maxValue) * 100 : 0;
          
          return (
            <div key={genre.name} className="flex items-center gap-2">
              <span className="text-xs text-white/80 w-12 truncate">{genre.name}</span>
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: theme.primary,
                    width: `${width}%`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopAspectShareCard({ 
  data, 
  theme,
  timeRange 
}: { 
  data: TopAspectShareData; 
  theme: typeof colorThemes[0];
  timeRange: TimeRange;
}) {
  if (!data) return null;

  return (
    <div className="w-full h-full p-4 lg:p-8 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-6 lg:top-10 left-6 lg:left-10 w-20 lg:w-32 h-20 lg:h-32 rounded-full border-2 border-white"></div>
        <div className="absolute bottom-6 lg:bottom-10 right-6 lg:right-10 w-16 lg:w-24 h-16 lg:h-24 rounded-full border border-white"></div>
        <div className="absolute top-1/2 left-1/4 w-12 lg:w-16 h-12 lg:h-16 rounded-full border border-white"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-4 lg:mb-6">
          <h1 className="text-xl lg:text-2xl font-bold mb-2">{data.title}</h1>
          <p className="text-white/80 text-sm lg:text-base">{data.period}</p>
        </div>

        {/* Items List - Expanded */}
        <div className="flex-1 space-y-3 lg:space-y-4 overflow-hidden pb-8">
          {data.items.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center gap-3 lg:gap-4 bg-white/10 rounded-lg lg:rounded-xl p-3 lg:p-4 backdrop-blur-sm">
              <span className="text-white/60 font-bold text-base lg:text-xl w-6 lg:w-8">#{index + 1}</span>
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-10 lg:w-14 h-10 lg:h-14 rounded-md lg:rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate text-base lg:text-lg">{item.name}</h4>
                {item.artist && (
                  <p className="text-white/60 text-sm lg:text-base truncate">{item.artist}</p>
                )}
                {data.type === 'top-genres' && item.popularity && (
                  <p className="text-white/40 text-xs lg:text-sm">
                    {item.popularity} artist{item.popularity !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tiny Footer - Bottom Left */}
        <div className="absolute bottom-2 left-2 lg:bottom-4 lg:left-4">
          <div className="text-xs lg:text-sm text-white/50 font-medium">
            Vynce - your musical DNA
          </div>
        </div>
      </div>
    </div>
  );
} 