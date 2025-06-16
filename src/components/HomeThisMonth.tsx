"use client";

import { useEffect, useState } from 'react';
import { useSpotify } from '../hooks/useSpotify';
import { getTrackImage } from '../utils';

interface ThisMonthData {
  topGenre: string | null;
  topAlbum: {
    name: string;
    artist: string;
    image: string | null;
  } | null;
}

export default function HomeThisMonth() {
  const { connected, getTopTracks, getTopArtists } = useSpotify();
  const [data, setData] = useState<ThisMonthData>({
    topGenre: null,
    topAlbum: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThisMonthData = async () => {
      if (!connected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch data from past 30 days (medium_term is ~6 months, short_term is ~4 weeks)
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

        let topGenre = null;
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
                image: getTrackImage(track),
                count: 1
              });
            }
          }
        });

        let topAlbum = null;
        if (albumMap.size > 0) {
          const sortedAlbums = Array.from(albumMap.values()).sort((a, b) => b.count - a.count);
          topAlbum = sortedAlbums[0];
        }

        setData({
          topGenre,
          topAlbum
        });
      } catch (err) {
        console.error('❌ HomeThisMonth: Error fetching data:', err);
        setError('Failed to load monthly data');
      } finally {
        setLoading(false);
      }
    };

    fetchThisMonthData();
  }, [connected, getTopTracks, getTopArtists]);

  // Don't render if not connected
  if (!connected) {
    return null;
  }

  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-4">This Month</h3>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Top Genre Card */}
        <div className="flex-1 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#1DB954]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Top Genre</p>
            </div>
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
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#1DB954]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Top Album</p>
            </div>
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
  );
} 