"use client";

import { useEffect, useState } from 'react';
import { useSpotify, RecentlyPlayedTrack, SpotifyArtistSummary } from '../hooks/useSpotify';

interface RecentPlaysProps {
  limit?: number;
}

export default function RecentPlays({ limit }: RecentPlaysProps) {
  const { connected, getRecentTracks } = useSpotify();
  const [tracks, setTracks] = useState<RecentlyPlayedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentTracks = async () => {
      if (!connected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const recentTracks = await getRecentTracks();
        console.log('🎵 RecentPlays: Data received:', { 
          tracks: recentTracks, 
          length: recentTracks?.length, 
          firstTrack: recentTracks?.[0] 
        });
        
        // Verify we have valid data before setting
        if (Array.isArray(recentTracks) && recentTracks.length > 0) {
          setTracks(recentTracks);
        } else {
          setTracks([]);
        }
      } catch (err) {
        console.error('❌ RecentPlays: Error fetching tracks:', err);
        // Only show error if we actually have no data and there was a real error
        if (tracks.length === 0) {
          setError('No recent listening activity found.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTracks();
  }, [connected, getRecentTracks]);

  const formatPlayedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/5 h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error && tracks.length === 0) {
    return <p className="text-center text-gray-400 text-sm">{error}</p>;
  }
  
  if (tracks.length === 0) {
    return <p className="text-center text-zinc-400 text-sm">No recent plays found.</p>;
  }

  return (
    <div className="space-y-2">
      {tracks.slice(0, limit || 5).map(({ track, played_at }) => (
        <div key={`${track.id}-${played_at}`} className="flex items-center gap-3 py-3 px-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
          {track.album?.images?.[0]?.url && (
            <img 
              src={track.album.images[0].url} 
              alt={track.album.name}
              className="h-12 w-12 rounded-lg"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium truncate">{track.name}</h4>
            <p className="text-gray-400 text-sm truncate">
              {track.artists.map((artist: SpotifyArtistSummary) => artist.name).join(', ')}
            </p>
          </div>
          <span className="text-xs text-zinc-400">{formatPlayedAt(played_at)}</span>
        </div>
      ))}
    </div>
  );
} 