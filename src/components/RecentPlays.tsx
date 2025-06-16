"use client";

import { useEffect, useState } from 'react';
import { useSpotify, RecentlyPlayedTrack, SpotifyArtistSummary } from '../hooks/useSpotify';

export default function RecentPlays() {
  const { getRecentTracks } = useSpotify();
  const [tracks, setTracks] = useState<RecentlyPlayedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentTracks = async () => {
      try {
        setLoading(true);
        const recentTracks = await getRecentTracks();
        setTracks(recentTracks || []);
      } catch (err) {
        setError('Failed to load recent tracks.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentTracks();
  }, [getRecentTracks]);

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

  if (error) {
    return <p className="text-center text-red-400">{error}</p>;
  }
  
  if (tracks.length === 0) {
    return <p className="text-center text-zinc-400">No recent plays found.</p>;
  }

  return (
    <div className="space-y-2">
      {tracks.slice(0, 5).map(({ track, played_at }) => (
        <div key={`${track.id}-${played_at}`} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
          <img 
            src={track.album.images[0]?.url} 
            alt={track.album.name}
            className="w-12 h-12 rounded-md"
          />
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