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
    name: 'Vynce Green',
    primary: '#1DB954',
    secondary: '#1AA34A',
    accent: '#16803C',
    bg: '#0D0F0D'
  },
  {
    name: 'Electric Blue',
    primary: '#3B82F6',
    secondary: '#2563EB',
    accent: '#1D4ED8',
    bg: '#0F1419'
  },
  {
    name: 'Purple Haze',
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#6D28D9',
    bg: '#1A0F2E'
  },
  {
    name: 'Sunset Orange',
    primary: '#F97316',
    secondary: '#EA580C',
    accent: '#C2410C',
    bg: '#1F1209'
  },
  {
    name: 'Rose Gold',
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#BE185D',
    bg: '#1F0A14'
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
        backgroundColor: colorThemes[selectedTheme].bg,
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
                        background: `linear-gradient(135deg, ${colorThemes[selectedTheme].primary}, ${colorThemes[selectedTheme].secondary})`
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
                <label className="block text-sm font-medium text-white mb-2">Color</label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {colorThemes.map((theme, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTheme(index)}
                      className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full transition-all duration-200 border-3 ${
                        selectedTheme === index
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-white/30 hover:border-white/60 hover:scale-105'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                      }}
                      title={theme.name}
                    />
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
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-6 lg:top-10 left-6 lg:left-10 w-20 lg:w-32 h-20 lg:h-32 rounded-full border-2 border-white"></div>
        <div className="absolute bottom-6 lg:bottom-10 right-6 lg:right-10 w-16 lg:w-24 h-16 lg:h-24 rounded-full border border-white"></div>
        <div className="absolute top-1/2 left-1/4 w-12 lg:w-16 h-12 lg:h-16 rounded-full border border-white"></div>
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
        {data.type !== 'music-radar' && (
          <div className="text-center mb-3 lg:mb-4">
            <div className="w-10 lg:w-12 h-10 lg:h-12 mx-auto mb-2 lg:mb-3 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={20} className="lg:w-6 lg:h-6" />
            </div>
            <h1 className="text-lg lg:text-xl font-bold mb-1">{data.title}</h1>
            <p className="text-white/70 text-xs lg:text-sm mb-1">{getInsightSubtitle(data.type)}</p>
            <p className="text-white/80 text-xs lg:text-sm">{data.description}</p>
          </div>
        )}

        {/* Visual Chart - Larger for Music Radar */}
        <div className="flex-1 flex items-center justify-center mb-1 lg:mb-2">
          <div className={`w-full h-full ${
            data.type === 'music-radar' 
              ? 'max-w-[280px] lg:max-w-[320px] max-h-[200px] lg:max-h-[240px]' 
              : 'max-w-[200px] lg:max-w-[240px] h-[120px] lg:h-[150px]'
          }`}>
            {renderVisual()}
          </div>
        </div>

        {/* Main Value - Only for non-radar insights */}
        {data.type !== 'music-radar' && (
          <div className="text-center mb-3 lg:mb-4">
            <div className="text-2xl lg:text-3xl font-bold mb-2">{data.mainValue}</div>
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

  const outerRadius = 50;
  const innerRadius = 35;
  const center = 60;

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
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={(outerRadius + innerRadius) / 2}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={outerRadius - innerRadius}
        />
        
        {/* Segments */}
        {pathSegments.map((segment) => (
          <path
            key={segment.emotion}
            d={segment.pathData}
            fill={colors[segment.emotion as keyof typeof colors]}
            stroke={colors[segment.emotion as keyof typeof colors]}
            strokeWidth="1"
            opacity="0.9"
          />
        ))}
        
        {/* Center icon */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-lg"
        >
          🎵
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
      <div className="w-full max-w-[160px]">
        <div className="flex items-end justify-between gap-1 h-16">
          {chartData.map((item: any, index: number) => {
            const value = item.value || item.weight || 0;
            const height = maxValue > 0 ? (value / maxValue) * 60 : 10;
            const label = item.decade || item.label || `${60 + index * 10}s`;
            const isPeak = value === maxValue;
            
            return (
              <div key={label} className="flex flex-col items-center flex-1">
                <div
                  className="w-full rounded-t-sm transition-all duration-300"
                  style={{
                    backgroundColor: isPeak ? theme.primary : `${theme.primary}80`,
                    height: `${Math.max(4, height)}px`
                  }}
                />
                <span className="text-xs text-white/60 mt-1">{label}</span>
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