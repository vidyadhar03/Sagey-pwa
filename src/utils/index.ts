import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the best available image URL for a track
 */
export function getTrackImage(track: any): string | null {
  // Handle null/undefined track
  if (!track) {
    return null;
  }
  
  // Try direct image_url first (from API responses)
  if (track.image_url) {
    return track.image_url;
  }
  
  // Try album images array
  if (track.album?.images?.[0]?.url) {
    return track.album.images[0].url;
  }
  
  // No image available
  return null;
} 