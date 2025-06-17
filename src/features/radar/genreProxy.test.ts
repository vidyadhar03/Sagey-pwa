import { getProxyFeatures } from './getRadarPayload';

describe('genre proxy calculation', () => {
  it('should estimate valence and energy for a rock track', () => {
    const mockTrack = {
      id: 't1',
      name: 'Test Rock',
      artists: [{ id: 'a1', name: 'Rock Artist', external_urls: { spotify: '' } }],
      album: { id: 'al1', name: 'Rock Album', release_date: '2020-01-01', release_date_precision: 'day', images: [], external_urls: { spotify: '' } },
      duration_ms: 200000,
      explicit: false,
      popularity: 80,
      preview_url: null,
      external_urls: { spotify: '' },
      uri: 'spotify:track:t1',
    };
    const genres = ['rock'];
    const { valence, energy } = getProxyFeatures(mockTrack, genres);
    
    // Rock with popularity 80 and not explicit should have:
    // valence = 0.4 (base) + 0.05 (popular) = 0.45
    // energy = 0.7 * 0.8 (genre energy) + 0.3 * normalizeTempo(130) ≈ 0.70
    expect(valence).toBeGreaterThanOrEqual(0.45);
    expect(valence).toBeLessThanOrEqual(0.55);
    expect(energy).toBeGreaterThanOrEqual(0.65);
    expect(energy).toBeLessThanOrEqual(0.75);
  });
}); 