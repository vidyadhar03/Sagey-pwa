import { renderHook, act } from '@testing-library/react';
import { useVariantMemory, clearVariantMemory } from '../hooks/useVariantMemory';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Console mock to suppress warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('useVariantMemory', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // Reset mock implementations
    localStorageMock.getItem.mockImplementation((key: string) => null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  describe('initialization', () => {
    it('should start with default variant (witty)', async () => {
      const { result } = renderHook(() => useVariantMemory());
      
      expect(result.current.variant).toBe('witty');
      
      // Wait for hydration
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.isHydrated).toBe(true);
    });

    it('should load stored variant from localStorage after hydration', async () => {
      // Set up stored variant in the mock storage directly
      localStorageMock.getItem.mockReturnValue('poetic');
      
      const { result } = renderHook(() => useVariantMemory());
      
      // Wait for hydration effect (this happens immediately in test environment)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Should now have loaded variant and be hydrated
      expect(result.current.variant).toBe('poetic');
      expect(result.current.isHydrated).toBe(true);
    });

    it('should fallback to default for invalid stored values', async () => {
      localStorageMock.setItem('vynce_hype_variant', 'invalid');
      
      const { result } = renderHook(() => useVariantMemory());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.variant).toBe('witty');
      expect(result.current.isHydrated).toBe(true);
    });

    it('should handle localStorage errors gracefully', async () => {
      const mockGetItem = jest.fn().mockImplementation(() => {
        throw new Error('localStorage error');
      });
      localStorageMock.getItem = mockGetItem;
      
      const { result } = renderHook(() => useVariantMemory());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.variant).toBe('witty');
      expect(result.current.isHydrated).toBe(true);
      expect(console.warn).toHaveBeenCalledWith('Failed to load variant from localStorage:', expect.any(Error));
    });
  });

  describe('setVariant functionality', () => {
    it('should update variant and persist to localStorage', async () => {
      const { result } = renderHook(() => useVariantMemory());
      
      // Hydrate first
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Change variant
      act(() => {
        result.current.setVariant('poetic');
      });
      
      expect(result.current.variant).toBe('poetic');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('vynce_hype_variant', 'poetic');
    });

    it('should handle localStorage setItem errors gracefully', async () => {
      const mockSetItem = jest.fn().mockImplementation(() => {
        throw new Error('localStorage setItem error');
      });
      localStorageMock.setItem = mockSetItem;
      
      const { result } = renderHook(() => useVariantMemory());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      act(() => {
        result.current.setVariant('poetic');
      });
      
      expect(result.current.variant).toBe('poetic');
      expect(console.warn).toHaveBeenCalledWith('Failed to save variant to localStorage:', expect.any(Error));
    });

    it('should work with both valid variants', async () => {
      const { result } = renderHook(() => useVariantMemory());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Test witty
      act(() => {
        result.current.setVariant('witty');
      });
      expect(result.current.variant).toBe('witty');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('vynce_hype_variant', 'witty');
      
      // Test poetic
      act(() => {
        result.current.setVariant('poetic');
      });
      expect(result.current.variant).toBe('poetic');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('vynce_hype_variant', 'poetic');
    });
  });

  describe('clearVariantMemory utility', () => {
    it('should remove variant from localStorage', () => {
      clearVariantMemory();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('vynce_hype_variant');
    });

    it('should handle localStorage removeItem errors gracefully', () => {
      const mockRemoveItem = jest.fn().mockImplementation(() => {
        throw new Error('localStorage removeItem error');
      });
      localStorageMock.removeItem = mockRemoveItem;
      
      clearVariantMemory();
      
      expect(console.warn).toHaveBeenCalledWith('Failed to clear variant memory:', expect.any(Error));
    });
  });

  describe('persistence integration', () => {
    it('should remember variant across hook instances', async () => {
      // Mock localStorage to return 'poetic' for this test
      localStorageMock.getItem.mockReturnValue('poetic');
      
      // First hook instance
      const { result: result1, unmount } = renderHook(() => useVariantMemory());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      act(() => {
        result1.current.setVariant('poetic');
      });
      
      // Unmount first instance
      unmount();
      
      // Second hook instance should remember the variant
      const { result: result2 } = renderHook(() => useVariantMemory());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result2.current.variant).toBe('poetic');
      expect(result2.current.isHydrated).toBe(true);
    });

    it('should handle empty localStorage gracefully', async () => {
      // Ensure localStorage is empty
      localStorageMock.clear();
      
      const { result } = renderHook(() => useVariantMemory());
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(result.current.variant).toBe('witty');
      expect(result.current.isHydrated).toBe(true);
    });
  });
}); 