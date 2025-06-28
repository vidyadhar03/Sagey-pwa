"use client";

import React from 'react';
import MusicalAgeCard from './cards/MusicalAgeCard';
import MoodRingCard from './cards/MoodRingCard';
import GenrePassportCard from './cards/GenrePassportCard';
import NightOwlCard from './cards/NightOwlCard';

export default function InsightsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <NightOwlCard />
      <MusicalAgeCard />
      <MoodRingCard />
      <GenrePassportCard />
    </div>
  );
} 