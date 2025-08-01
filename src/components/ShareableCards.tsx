"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ShareableCardsProps {
  onClose: () => void;
  data: {
    tracks?: any[];
    artists?: any[];
    albums?: any[];
    genres?: any[];
    recent?: any[];
    timeRange?: string;
  };
}

interface CardData {
  type: 'tracks' | 'artists' | 'albums' | 'genres' | 'recent';
  title: string;
  items: any[];
  color: string;
}

export default function ShareableCards({ onClose, data }: ShareableCardsProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Generate cards based on available data
  const generateCards = (): CardData[] => {
    const cards: CardData[] = [];

    if (data.tracks && data.tracks.length > 0) {
      cards.push({
        type: 'tracks',
        title: 'Your Top Tracks',
        items: data.tracks.slice(0, 5),
        color: '#1DB954'
      });
    }

    if (data.artists && data.artists.length > 0) {
      cards.push({
        type: 'artists',
        title: 'Your Top Artists',
        items: data.artists.slice(0, 5),
        color: '#1ED760'
      });
    }

    if (data.albums && data.albums.length > 0) {
      cards.push({
        type: 'albums',
        title: 'Your Top Albums',
        items: data.albums.slice(0, 5),
        color: '#1AA34A'
      });
    }

    if (data.genres && data.genres.length > 0) {
      cards.push({
        type: 'genres',
        title: 'Your Top Genres',
        items: data.genres.slice(0, 5),
        color: '#16803C'
      });
    }

    if (data.recent && data.recent.length > 0) {
      cards.push({
        type: 'recent',
        title: 'Recently Played',
        items: data.recent.slice(0, 5),
        color: '#FF6B35'
      });
    }

    return cards;
  };

  const cards = generateCards();

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const shareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
                title: `My ${cards[currentCardIndex].title} - Vynce`,
      text: `Check out my music taste on Vynce!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const downloadCard = () => {
    // This would implement card download functionality
    // For now, we'll just show an alert
    alert('Download functionality coming soon!');
  };

  if (cards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="bg-[#1A1A1A] rounded-2xl p-6 max-w-md w-full border border-white/10 text-center">
          <h2 className="text-white text-xl font-semibold mb-4">No Data Available</h2>
          <p className="text-gray-400 mb-4">Connect to Spotify and listen to some music to generate shareable cards!</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#1DB954] hover:bg-[#1AA34A] rounded-full text-white font-medium transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  const currentCard = cards[currentCardIndex];

  const renderCardContent = (card: CardData) => {
    switch (card.type) {
      case 'tracks':
        return (
          <div className="space-y-3">
            {card.items.map((track, index) => (
              <div key={track.id} className="flex items-center">
                <span className="text-white/60 font-bold text-lg w-8">#{index + 1}</span>
                {track.image_url && (
                  <img 
                    src={track.image_url} 
                    alt={track.name}
                    className="w-10 h-10 rounded mr-3"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-sm">{track.name}</p>
                  <p className="text-white/60 text-xs truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'artists':
        return (
          <div className="space-y-3">
            {card.items.map((artist, index) => (
              <div key={artist.id} className="flex items-center">
                <span className="text-white/60 font-bold text-lg w-8">#{index + 1}</span>
                {artist.image_url && (
                  <img 
                    src={artist.image_url} 
                    alt={artist.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-sm">{artist.name}</p>
                  <p className="text-white/60 text-xs">{artist.followers ? `${Math.floor(artist.followers / 1000)}K followers` : 'Artist'}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'albums':
        return (
          <div className="space-y-3">
            {card.items.map((album, index) => (
              <div key={album.id} className="flex items-center">
                <span className="text-white/60 font-bold text-lg w-8">#{index + 1}</span>
                {album.image_url && (
                  <img 
                    src={album.image_url} 
                    alt={album.name}
                    className="w-10 h-10 rounded mr-3"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-sm">{album.name}</p>
                  <p className="text-white/60 text-xs truncate">{album.artist}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'genres':
        return (
          <div className="space-y-3">
            {card.items.map((genre, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-white/60 font-bold text-lg w-8">#{index + 1}</span>
                  <p className="text-white font-medium capitalize text-sm">{genre.genre}</p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-2 bg-white/20 rounded-full overflow-hidden mr-2">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: card.color,
                        width: `${Math.min((genre.count / Math.max(...card.items.map(g => g.count))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-white/60 text-xs w-6">{genre.count}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'recent':
        return (
          <div className="space-y-3">
            {card.items.map((track, index) => (
              <div key={track.id} className="flex items-center">
                <span className="text-white/60 font-bold text-lg w-8">#{index + 1}</span>
                {track.image_url && (
                  <img 
                    src={track.image_url} 
                    alt={track.name}
                    className="w-10 h-10 rounded mr-3"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-sm">{track.name}</p>
                  <p className="text-white/60 text-xs truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card */}
        <div 
          className="relative rounded-3xl p-8 shadow-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${currentCard.color}20 0%, ${currentCard.color}40 100%)`,
            border: `1px solid ${currentCard.color}30`
          }}
        >
          {/* Modern Gradient Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Layered gradient mesh */}
            <div 
              className="absolute inset-0 opacity-8"
              style={{ 
                background: `
                  conic-gradient(from 0deg at 20% 30%, ${currentCard.color}15 0%, transparent 50%),
                  conic-gradient(from 120deg at 80% 70%, ${currentCard.color}12 0%, transparent 50%),
                  radial-gradient(ellipse at 60% 20%, ${currentCard.color} 0%, transparent 70%)
                `
              }}
            />
            
            {/* Geometric pattern elements */}
            <div 
              className="absolute top-4 right-4 w-16 h-16 opacity-15"
              style={{
                background: `linear-gradient(135deg, ${currentCard.color}20 0%, ${currentCard.color}15 50%, transparent 100%)`,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                filter: 'blur(0.5px)'
              }}
            />
            
            {/* Flowing curves */}
            <div 
              className="absolute bottom-6 left-3 w-20 h-10 opacity-12"
              style={{
                background: `linear-gradient(90deg, ${currentCard.color}18 0%, ${currentCard.color}12 50%, transparent 100%)`,
                borderRadius: '100px 20px 100px 20px',
                transform: 'rotate(-15deg)'
              }}
            />
            
            {/* Translucent hexagon */}
            <div 
              className="absolute top-1/2 left-3 w-12 h-12 opacity-10"
              style={{
                background: `linear-gradient(60deg, ${currentCard.color}15, ${currentCard.color} 50%, transparent)`,
                clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
                filter: 'blur(0.8px)'
              }}
            />
            
            {/* Subtle gradient lines */}
            <div className="absolute inset-0 opacity-8">
              <div 
                className="absolute top-1/4 left-0 w-full h-px"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${currentCard.color}30 50%, transparent 100%)`
                }}
              />
              <div 
                className="absolute top-3/4 left-0 w-full h-px"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${currentCard.color}25 50%, transparent 100%)`
                }}
              />
            </div>
            
            {/* Corner accent */}
            <div 
              className="absolute bottom-3 right-3 w-8 h-8 opacity-12"
              style={{
                background: `radial-gradient(ellipse at center, ${currentCard.color}20 0%, ${currentCard.color}10 50%, transparent 100%)`,
                borderRadius: '50% 10% 50% 10%'
              }}
            />
          </div>

          {/* Header */}
          <div className="relative z-10 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white text-xl font-bold">{currentCard.title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {data.timeRange && (
              <p className="text-white/60 text-sm">
                {data.timeRange === 'short_term' ? 'Last 4 weeks' : 
                 data.timeRange === 'medium_term' ? 'Last 6 months' : 'All time'}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="relative z-10 mb-6 pb-8">
            {renderCardContent(currentCard)}
          </div>

          {/* Branding and Index */}
          <span className="absolute bottom-1 left-3 text-white/90 text-sm lg:text-base font-mono leading-none select-none pointer-events-none z-20 tracking-tight drop-shadow-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            Vynce - Your music, analyzed
          </span>
          <span className="absolute bottom-1 right-3 text-white/40 text-xs select-none z-10">
            {currentCardIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevCard}
            disabled={cards.length <= 1}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={shareCard}
              className="px-4 py-2 bg-[#1DB954] hover:bg-[#1AA34A] rounded-full text-white text-sm font-medium transition-all flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z" />
              </svg>
              Share
            </button>
            <button
              onClick={downloadCard}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-all flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Save
            </button>
          </div>

          <button
            onClick={nextCard}
            disabled={cards.length <= 1}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 