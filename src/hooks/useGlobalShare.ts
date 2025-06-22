"use client";

import { useState, useCallback, useEffect } from 'react';
import { 
  ShareDataType, 
  InsightShareData, 
  TopAspectShareData 
} from '../components/GlobalShareInterface';
import { useSpotifyInsights } from './useSpotifyInsights';
import { useSpotify, SpotifyTrack, SpotifyArtist, SpotifyAlbum, RecentlyPlayedTrack } from './useSpotify';
import { useMusicRadar } from './useMusicRadar';

export function useGlobalShare() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareDataType, setShareDataType] = useState<ShareDataType>('insights');
  
  // State for storing fetched data
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [topAlbums, setTopAlbums] = useState<SpotifyAlbum[]>([]);
  const [recentTracks, setRecentTracks] = useState<RecentlyPlayedTrack[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  
  const { insights } = useSpotifyInsights();
  const { connected, getTopTracks, getTopArtists, getTopAlbums, getRecentTracks } = useSpotify();
  const { payload: radarPayload, ai: radarAI } = useMusicRadar();

  // Fetch all data when connected
  useEffect(() => {
    const fetchData = async () => {
      if (!connected) return;
      
      setDataLoading(true);
      try {
        const [tracks, artists, albums, recent] = await Promise.all([
          getTopTracks('medium_term').catch(() => []),
          getTopArtists('medium_term').catch(() => []),
          getTopAlbums('medium_term').catch(() => []),
          getRecentTracks().catch(() => [])
        ]);
        
        setTopTracks(tracks);
        setTopArtists(artists);
        setTopAlbums(albums);
        setRecentTracks(recent);
      } catch (error) {
        console.error('Failed to fetch share data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [connected, getTopTracks, getTopArtists, getTopAlbums, getRecentTracks]);

  // Prepare insight share data
  const prepareInsightData = useCallback((): InsightShareData[] => {
    const insightData: InsightShareData[] = [];

    // Music Radar
    if (radarPayload && !radarPayload.isDefault) {
      insightData.push({
        type: 'music-radar',
        title: 'Music Radar',
        mainValue: 'Your Musical DNA',
        description: 'Your unique music personality profile',
        aiInsight: radarAI.mainInsight || undefined,
        visualData: radarPayload,
        colors: {
          primary: '#1DB954',
          secondary: '#1AA34A',
          accent: '#16803C'
        }
      });
    }

    // Musical Age
    if (insights.musicalAge && !insights.isDefault) {
      insightData.push({
        type: 'musical-age',
        title: 'Musical Age',
        mainValue: `${insights.musicalAge.age} years`,
        description: insights.musicalAge.description,
        aiInsight: undefined, // Will be fetched separately if needed
        visualData: insights.musicalAge,
        colors: {
          primary: '#1DB954',
          secondary: '#1AA34A',
          accent: '#16803C'
        }
      });
    }

    // Mood Ring
    if (insights.moodRing && !insights.isDefault) {
      const dominantMood = Object.entries(insights.moodRing.emotions)
        .sort(([,a], [,b]) => b - a)[0];
      
      insightData.push({
        type: 'mood-ring',
        title: 'Mood Ring',
        mainValue: dominantMood ? dominantMood[0] : 'Mixed',
        description: 'Your emotional music palette',
        aiInsight: undefined,
        visualData: insights.moodRing,
        colors: {
          primary: '#8B5CF6',
          secondary: '#7C3AED',
          accent: '#6D28D9'
        }
      });
    }

    // Genre Passport
    if (insights.genrePassport && !insights.isDefault) {
      insightData.push({
        type: 'genre-passport',
        title: 'Genre Passport',
        mainValue: `${insights.genrePassport.totalGenres} genres`,
        description: 'Your musical journey across genres',
        aiInsight: undefined,
        visualData: insights.genrePassport,
        colors: {
          primary: '#F97316',
          secondary: '#EA580C',
          accent: '#C2410C'
        }
      });
    }

    // Night Owl Pattern
    if (insights.nightOwlPattern && !insights.isDefault) {
      insightData.push({
        type: 'night-owl',
        title: 'Night Owl Pattern',
        mainValue: `${insights.nightOwlPattern.peakHour}:00`,
        description: 'Your daily listening rhythm',
        aiInsight: undefined,
        visualData: insights.nightOwlPattern,
        colors: {
          primary: '#EC4899',
          secondary: '#DB2777',
          accent: '#BE185D'
        }
      });
    }

    return insightData;
  }, [insights, radarPayload, radarAI]);

  // Prepare top aspect share data
  const prepareTopAspectData = useCallback((): TopAspectShareData[] => {
    const topAspectData: TopAspectShareData[] = [];

    // Top Tracks
    if (topTracks && topTracks.length > 0) {
      topAspectData.push({
        type: 'top-tracks',
        title: 'Top Tracks',
        period: 'Last 4 weeks',
        items: topTracks.slice(0, 10).map((track: SpotifyTrack) => ({
          name: track.name || 'Unknown Track',
          artist: track.artists?.[0]?.name || 'Unknown Artist',
          image: track.album?.images?.[0]?.url,
          popularity: track.popularity
        }))
      });
    }

    // Top Artists
    if (topArtists && topArtists.length > 0) {
      topAspectData.push({
        type: 'top-artists',
        title: 'Top Artists',
        period: 'Last 4 weeks',
        items: topArtists.slice(0, 10).map((artist: SpotifyArtist) => ({
          name: artist.name || 'Unknown Artist',
          image: artist.image_url,
          popularity: artist.popularity
        }))
      });
    }

    // Top Albums
    if (topAlbums && topAlbums.length > 0) {
      topAspectData.push({
        type: 'top-albums',
        title: 'Top Albums',
        period: 'Last 4 weeks',
        items: topAlbums.slice(0, 10).map((album: SpotifyAlbum) => ({
          name: album.name || 'Unknown Album',
          artist: album.artist || 'Unknown Artist',
          image: album.image_url
        }))
      });
    }

    // Recent Plays
    if (recentTracks && recentTracks.length > 0) {
      topAspectData.push({
        type: 'recent-plays',
        title: 'Recently Played',
        period: 'Latest tracks',
        items: recentTracks.slice(0, 10).map((recentTrack: RecentlyPlayedTrack) => ({
          name: recentTrack.track.name || 'Unknown Track',
          artist: recentTrack.track.artists?.[0]?.name || 'Unknown Artist',
          image: recentTrack.track.album?.images?.[0]?.url
        }))
      });
    }

    return topAspectData;
  }, [topTracks, topArtists, topAlbums, recentTracks]);

  // Open share interface for insights
  const openInsightShare = useCallback(() => {
    setShareDataType('insights');
    setIsShareOpen(true);
  }, []);

  // Open share interface for top aspects
  const openTopAspectShare = useCallback(() => {
    setShareDataType('top-aspects');
    setIsShareOpen(true);
  }, []);

  // Close share interface
  const closeShare = useCallback(() => {
    setIsShareOpen(false);
  }, []);

  return {
    isShareOpen,
    shareDataType,
    insightData: prepareInsightData(),
    topAspectData: prepareTopAspectData(),
    openInsightShare,
    openTopAspectShare,
    closeShare
  };
} 