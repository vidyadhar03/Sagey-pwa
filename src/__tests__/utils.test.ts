import { getTrackImage } from '../utils';

describe('getTrackImage', () => {
  it('returns image_url when available', () => {
    const track = {
      image_url: 'direct-image.jpg',
      album: {
        images: [{ url: 'album-image.jpg' }]
      }
    };
    
    expect(getTrackImage(track)).toBe('direct-image.jpg');
  });

  it('returns album image when image_url is not available', () => {
    const track = {
      album: {
        images: [{ url: 'album-image.jpg' }]
      }
    };
    
    expect(getTrackImage(track)).toBe('album-image.jpg');
  });

  it('returns null when no image is available', () => {
    const track = {
      album: {
        images: []
      }
    };
    
    expect(getTrackImage(track)).toBeNull();
  });

  it('handles null/undefined track', () => {
    expect(getTrackImage(null)).toBeNull();
    expect(getTrackImage(undefined)).toBeNull();
  });

  it('handles track without album', () => {
    const track = {
      name: 'Test Track'
    };
    
    expect(getTrackImage(track)).toBeNull();
  });
}); 