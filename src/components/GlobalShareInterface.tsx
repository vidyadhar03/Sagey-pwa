"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Instagram, Download, Palette, Sparkles } from 'lucide-react';

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
}

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
  topAspectData = [] 
}: GlobalShareProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [includeAIInsight, setIncludeAIInsight] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentData = dataType === 'insights' ? insightData : topAspectData;
  const totalCards = currentData.length;

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

  // Handle swipe gestures
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (info.offset.x < -threshold && currentIndex < totalCards - 1) {
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
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">
              Share Your {dataType === 'insights' ? 'Music Insights' : 'Top Music'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
            {/* Card Preview Area */}
            <div className="flex-1 p-6 overflow-hidden">
              <div 
                ref={containerRef}
                className="relative h-full flex items-center justify-center"
              >
                {/* Swipeable Card Container */}
                <motion.div
                  ref={cardRef}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  className="w-full max-w-sm mx-auto cursor-grab active:cursor-grabbing"
                  whileDrag={{ scale: 0.95 }}
                >
                  {/* Render current card based on type */}
                  {dataType === 'insights' ? (
                    <InsightShareCard
                      data={insightData[currentIndex]}
                      theme={colorThemes[selectedTheme]}
                      includeAIInsight={includeAIInsight}
                    />
                  ) : (
                    <TopAspectShareCard
                      data={topAspectData[currentIndex]}
                      theme={colorThemes[selectedTheme]}
                    />
                  )}
                </motion.div>

                {/* Card Navigation Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {Array.from({ length: totalCards }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Edit Options */}
            <div className="border-t border-white/10 p-6 space-y-4">
              {/* AI Insight Toggle (only for insights) */}
              {dataType === 'insights' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={16} className="text-purple-400" />
                    <span className="text-white text-sm">Include AI Insight</span>
                  </div>
                  <button
                    onClick={() => setIncludeAIInsight(!includeAIInsight)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      includeAIInsight ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        includeAIInsight ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Color Theme Selector */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Palette size={16} className="text-blue-400" />
                  <span className="text-white text-sm">Color Theme</span>
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {colorThemes.map((theme, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTheme(index)}
                      className={`flex-shrink-0 w-12 h-12 rounded-xl border-2 transition-all ${
                        selectedTheme === index 
                          ? 'border-white scale-110' 
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                      }}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={shareToInstagram}
                  disabled={isGeneratingImage}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl transition-all disabled:opacity-50"
                >
                  <Instagram size={18} />
                  <span>Instagram Story</span>
                </button>
                
                <button
                  onClick={nativeShare}
                  disabled={isGeneratingImage}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-all disabled:opacity-50"
                >
                  <Download size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Individual card components
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

  return (
    <div 
      className="w-full aspect-[9/16] rounded-3xl p-8 text-white relative overflow-hidden"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${theme.primary}40, transparent 50%), radial-gradient(circle at 70% 80%, ${theme.secondary}30, transparent 50%)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">{data.title}</h3>
          <div className="text-4xl font-bold" style={{ color: theme.primary }}>
            {data.mainValue}
          </div>
        </div>

        {/* Visual Data (simplified representation) */}
        <div className="flex-1 flex items-center justify-center mb-8">
          {/* This would render different visuals based on data.type */}
          <div 
            className="w-48 h-48 rounded-full border-4 flex items-center justify-center"
            style={{ borderColor: theme.primary }}
          >
            <span className="text-6xl">🎵</span>
          </div>
        </div>

        {/* AI Insight */}
        {includeAIInsight && data.aiInsight && (
          <div className="bg-white/10 rounded-2xl p-4 mb-6">
            <p className="text-sm leading-relaxed">{data.aiInsight}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm opacity-80 mb-2">{data.description}</p>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg font-bold">Vynce</span>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TopAspectShareCard({ 
  data, 
  theme 
}: { 
  data: TopAspectShareData; 
  theme: typeof colorThemes[0];
}) {
  if (!data) return null;

  return (
    <div 
      className="w-full aspect-[9/16] rounded-3xl p-8 text-white relative overflow-hidden"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${theme.primary}40, transparent 50%), radial-gradient(circle at 70% 80%, ${theme.secondary}30, transparent 50%)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">{data.title}</h3>
          <p className="text-sm opacity-80">{data.period}</p>
        </div>

        {/* Top Items List */}
        <div className="flex-1 space-y-4 overflow-hidden">
          {data.items.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: theme.primary }}
              >
                {index + 1}
              </div>
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                {item.artist && (
                  <p className="text-sm opacity-70 truncate">{item.artist}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg font-bold">Vynce</span>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
          </div>
        </div>
      </div>
    </div>
  );
} 