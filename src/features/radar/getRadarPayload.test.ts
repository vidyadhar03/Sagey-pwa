// src/features/radar/getRadarPayload.test.ts

import { getRadarPayload } from './getRadarPayload';
import { mockRecentTracks, mockTopArtists, mockAudioFeatures } from '../../mocks/radar';

describe('getRadarPayload', () => {
  const mockData = {
    recentTracks: mockRecentTracks,
    topArtists: mockTopArtists,
    audioFeatures: mockAudioFeatures,
  };

  it('should return a default payload if input data is empty', () => {
    const payload = getRadarPayload({ recentTracks: [], topArtists: [], audioFeatures: [] });
    expect(payload.isDefault).toBe(true);
    expect(payload.trackCount).toBe(0);
    expect(Object.values(payload.scores).every(score => score === 0)).toBe(true);
  });

  it('should calculate all radar scores and ensure they are within the 0-100 range', () => {
    const payload = getRadarPayload(mockData);
    
    expect(payload.isDefault).toBe(false);
    expect(payload.trackCount).toBe(mockData.recentTracks.length);

    Object.values(payload.scores).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it('should calculate Positivity score based on weighted valence', () => {
    const payload = getRadarPayload(mockData);
    // track1 (valence 0.9) has high weight, track2 (valence 0.2) has low weight.
    // So the weighted average should be closer to 0.9 than 0.2.
    // Let's expect it to be > 60
    expect(payload.scores.Positivity).toBeGreaterThan(60);
    expect(payload.stats.positivity.weightedMeanValence).toBeGreaterThan(0.6);
  });
  
  it('should calculate Energy score based on weighted energy and normalized tempo', () => {
    const payload = getRadarPayload(mockData);
    // Expecting a high-ish energy score due to recent high-energy tracks
    expect(payload.scores.Energy).toBeGreaterThan(60);
  });

  it('should calculate Exploration score based on genre entropy', () => {
    const payload = getRadarPayload(mockData);
    // We have 3 artists with 7 unique genres among them. This should result in a decent exploration score.
    expect(payload.scores.Exploration).toBeGreaterThan(50);
    expect(payload.stats.exploration.genreCount).toBe(7);
  });

  it('should calculate Nostalgia score based on median track age', () => { // Note: This test is sensitive to the current year
    const payload = getRadarPayload(mockData);
    const currentYear = new Date().getFullYear();
    const expectedMedianAge = currentYear - 2021; // From track 'Night Drive' (2021) which is the median
    const expectedScore = (expectedMedianAge / 40) * 100;
    
    expect(payload.stats.nostalgia.medianTrackAge).toBe(expectedMedianAge);
    expect(payload.scores.Nostalgia).toBeCloseTo(expectedScore, 0);
  });

  it('should calculate Night-Owl score based on listening times', () => {
    const payload = getRadarPayload(mockData);
    // 1 out of 3 tracks was played at night (23:00)
    expect(payload.scores['Night-Owl']).toBeCloseTo(33.33, 2);
    expect(payload.stats.nightOwl.nightPlayCount).toBe(1);
    expect(payload.stats.nightOwl.totalPlayCount).toBe(3);
  });

  it('should execute in under 2ms', () => {
    const startTime = performance.now();
    getRadarPayload(mockData);
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log(`getRadarPayload execution time: ${executionTime.toFixed(2)}ms`);
    expect(executionTime).toBeLessThan(2);
  });
}); 