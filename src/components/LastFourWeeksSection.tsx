"use client";

import { useEffect, useState } from 'react';
import { useSpotify } from '../hooks/useSpotify';
import { calculateLast4WeeksStats, formatMinutes } from '../utils';

interface Last4WeeksData {
  minutesThis: number;
  minutesPrev: number;
  topGenre: string | null;
  topAlbum: {
    name: string;
    artist: string;
    image: string | null;
  } | null;
}

export default function LastFourWeeksSection() {
  const { connected, getRecentTracks, getTopTracks, getTopArtists } = useSpotify();
  const [data, setData] = useState<Last4WeeksData>({
    minutesThis: 0,
    minutesPrev: 0,
    topGenre: null,
    topAlbum: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLast4WeeksData = async () => {
      if (!connected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch recent tracks for minutes calculation
        const recentTracks = await getRecentTracks().catch(() => []);
        
        // Calculate minutes-based stats from recent tracks
        const minutesStats = calculateLast4WeeksStats(recentTracks);
        
        // Get top genre and album from short_term data (approximately 4 weeks)
        const [tracks, artists] = await Promise.all([
          getTopTracks('short_term').catch(() => []),
          getTopArtists('short_term').catch(() => [])
        ]);

        // Calculate top genre from artists
        const genreMap = new Map<string, number>();
        artists.forEach((artist: any) => {
          if (artist.genres && Array.isArray(artist.genres)) {
            artist.genres.forEach((genre: string) => {
              genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
            });
          }
        });

        let topGenre = minutesStats.topGenre; // fallback to recent tracks genre
        if (genreMap.size > 0) {
          const sortedGenres = Array.from(genreMap.entries()).sort((a, b) => b[1] - a[1]);
          topGenre = sortedGenres[0][0];
        }

        // Get top album from tracks
        const albumMap = new Map<string, { name: string; artist: string; image: string | null; count: number }>();
        tracks.forEach((track: any) => {
          if (track.album) {
            const albumKey = `${track.album.name || track.album}-${track.artist || track.artists?.[0]?.name || 'Unknown'}`;
            const existing = albumMap.get(albumKey);
            if (existing) {
              existing.count += 1;
            } else {
              albumMap.set(albumKey, {
                name: track.album.name || track.album || 'Unknown Album',
                artist: track.artist || track.artists?.[0]?.name || 'Unknown Artist',
                image: track.image_url || track.album?.images?.[0]?.url || null,
                count: 1
              });
            }
          }
        });

        let topAlbum = minutesStats.topAlbum; // fallback to recent tracks album
        if (albumMap.size > 0) {
          const sortedAlbums = Array.from(albumMap.values()).sort((a, b) => b.count - a.count);
          topAlbum = sortedAlbums[0];
        }

        setData({
          minutesThis: minutesStats.minutesThis,
          minutesPrev: minutesStats.minutesPrev,
          topGenre,
          topAlbum
        });
      } catch (err) {
        console.error('❌ LastFourWeeksSection: Error fetching data:', err);
        setError('Failed to load 4-week stats');
      } finally {
        setLoading(false);
      }
    };

    fetchLast4WeeksData();
  }, [connected, getRecentTracks, getTopTracks, getTopArtists]);

  // Calculate percentage change for display
  const delta = data.minutesPrev === 0
    ? null
    : Math.round(((data.minutesThis - data.minutesPrev) / data.minutesPrev) * 100);

  const subtitle = delta === null
    ? null
    : `${delta > 0 ? "+" : ""}${delta}% vs previous 4 weeks`;

  // Don't render if not connected
  if (!connected) {
    return null;
  }

  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-4">30-Day Recap</h3>
      
      <div className="space-y-4">
        {/* Listening Time Card - Full Width */}
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#1DB954]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Tune time</p>
            </div>
          </div>
          
          {loading ? (
            <>
              <div className="animate-pulse bg-[#1DB954]/20 h-8 w-32 rounded mb-1"></div>
              <div className="animate-pulse bg-gray-600/20 h-3 w-40 rounded"></div>
            </>
          ) : error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : (
            <>
              <div className="text-[#1DB954] text-2xl font-bold mb-1">
                {formatMinutes(data.minutesThis)}
              </div>
              {subtitle && (
                <p className={`text-xs ${
                  (delta ?? 0) < 0 ? 'text-red-400' :
                  (delta ?? 0) > 0 ? 'text-green-400' :
                  'text-zinc-400'
                }`}>
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>

        {/* Top Genre & Album Cards - Side by Side */}
        <div className="flex gap-4 sm:grid sm:grid-cols-2">
          {/* Top Genre Card */}
          <div className="flex-1 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="mb-3">
              <p className="text-white font-semibold text-sm">Top Genre</p>
            </div>
            
            {loading ? (
              <div className="animate-pulse bg-[#1DB954]/20 h-6 w-24 rounded"></div>
            ) : error ? (
              <p className="text-red-400 text-sm">{error}</p>
            ) : (
              <p className="text-[#1DB954] text-lg font-bold capitalize">
                {data.topGenre || 'Mixed'}
              </p>
            )}
          </div>

          {/* Top Album Card */}
          <div className="flex-1 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="mb-3">
              <p className="text-white font-semibold text-sm">Top Album</p>
            </div>
            
            {loading ? (
              <div className="flex items-center">
                <div className="animate-pulse bg-white/10 w-16 h-16 rounded-lg mr-3"></div>
                <div className="flex-1">
                  <div className="animate-pulse bg-[#1DB954]/20 h-4 w-32 rounded mb-1"></div>
                  <div className="animate-pulse bg-gray-600/20 h-3 w-24 rounded"></div>
                </div>
              </div>
            ) : error ? (
              <p className="text-red-400 text-sm">{error}</p>
            ) : data.topAlbum ? (
              <div className="flex items-center">
                {data.topAlbum.image ? (
                  <img 
                    src={data.topAlbum.image} 
                    alt={data.topAlbum.name}
                    className="w-16 h-16 rounded-lg mr-3"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg mr-3 bg-white/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{data.topAlbum.name}</p>
                  <p className="text-gray-400 text-xs truncate">{data.topAlbum.artist}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No album data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 