/**
 * Share insight utility
 * Future implementation will use html2canvas to capture card as image
 * and navigator.share for native sharing
 */

export interface ShareData {
  title: string;
  text: string;
  url?: string;
}

export async function shareInsight(element: HTMLElement, data: ShareData): Promise<void> {
  try {
    // Stub implementation - future will use html2canvas
    console.log('Sharing insight:', data);
    
    // Check if native sharing is available
    if (navigator.share) {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url || window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${data.title}\n${data.text}\n${data.url || window.location.href}`);
      console.log('Insight copied to clipboard');
    }
  } catch (error) {
    console.error('Failed to share insight:', error);
  }
}

export function createShareData(insightType: string, value: string | number, description: string): ShareData {
  return {
    title: `My ${insightType} - Vynce Music Insights`,
    text: `🎵 ${description} - ${value}\n\nDiscover your own musical DNA with Vynce!`,
    url: window.location.origin
  };
} 