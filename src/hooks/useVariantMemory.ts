"use client";

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vynce_hype_variant';
const DEFAULT_VARIANT: "witty" | "poetic" = "witty";

export function useVariantMemory() {
  // Start with default to avoid SSR mismatch
  const [variant, setVariant] = useState<"witty" | "poetic">(DEFAULT_VARIANT);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load variant from localStorage on client-side hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "witty" || stored === "poetic") {
        setVariant(stored);
      }
    } catch (error) {
      console.warn('Failed to load variant from localStorage:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save variant to localStorage
  const setPersistedVariant = (newVariant: "witty" | "poetic") => {
    setVariant(newVariant);
    
    try {
      localStorage.setItem(STORAGE_KEY, newVariant);
    } catch (error) {
      console.warn('Failed to save variant to localStorage:', error);
    }
  };

  return {
    variant,
    setVariant: setPersistedVariant,
    isHydrated, // Use for preventing SSR flash
  };
}

// Utility function to clear variant memory
export function clearVariantMemory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear variant memory:', error);
  }
} 