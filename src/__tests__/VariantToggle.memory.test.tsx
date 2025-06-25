import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VariantToggle from '../components/VariantToggle';
import { clearVariantMemory } from '../hooks/useVariantMemory';

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

// Test component that uses variant memory
function TestComponent() {
  const [variant, setVariant] = React.useState<"witty" | "poetic">("witty");
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    // Simulate loading from localStorage
    const stored = localStorage.getItem('vynce_hype_variant');
    if (stored === "witty" || stored === "poetic") {
      setVariant(stored);
    }
    setIsHydrated(true);
  }, []);

  const handleVariantChange = (newVariant: "witty" | "poetic") => {
    setVariant(newVariant);
    localStorage.setItem('vynce_hype_variant', newVariant);
  };

  return (
    <VariantToggle
      variant={variant}
      onVariantChange={handleVariantChange}
      isHydrated={isHydrated}
    />
  );
}

describe('VariantToggle Memory Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should render with default variant when no memory exists', async () => {
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('✨ Witty')).toBeInTheDocument();
    });
    
    // Should show witty description
    expect(screen.getByText('Upbeat & playful with emoji flair')).toBeInTheDocument();
  });

  it('should load remembered variant from localStorage', async () => {
    // Pre-populate localStorage
    localStorageMock.setItem('vynce_hype_variant', 'poetic');
    
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('🎭 Poetic')).toBeInTheDocument();
    });
    
    // Should show poetic description
    expect(screen.getByText('Metaphorical & artistic with flowing prose')).toBeInTheDocument();
  });

  it('should persist variant changes to localStorage', async () => {
    render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('✨ Witty')).toBeInTheDocument();
    });
    
    // Click on Poetic tab
    fireEvent.click(screen.getByText('🎭 Poetic'));
    
    // Should update localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('vynce_hype_variant', 'poetic');
    
    // Should update UI
    await waitFor(() => {
      expect(screen.getByText('Metaphorical & artistic with flowing prose')).toBeInTheDocument();
    });
  });

  it('should remember selection across component remounts', async () => {
    const { unmount } = render(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('✨ Witty')).toBeInTheDocument();
    });
    
    // Change to poetic
    fireEvent.click(screen.getByText('🎭 Poetic'));
    
    await waitFor(() => {
      expect(screen.getByText('Metaphorical & artistic with flowing prose')).toBeInTheDocument();
    });
    
    // Unmount component
    unmount();
    
    // Remount component
    render(<TestComponent />);
    
    // Should remember poetic selection
    await waitFor(() => {
      expect(screen.getByText('Metaphorical & artistic with flowing prose')).toBeInTheDocument();
    });
  });

  it('should handle SSR hydration properly', () => {
    render(
      <VariantToggle
        variant="witty"
        onVariantChange={() => {}}
        isHydrated={false}
      />
    );
    
    // Component should still render but with low opacity during hydration
    expect(screen.getByText('✨ Witty')).toBeInTheDocument();
    expect(screen.getByText('🎭 Poetic')).toBeInTheDocument();
  });

  it('should work with disabled state', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <VariantToggle
        variant="witty"
        onVariantChange={mockOnChange}
        disabled={true}
        isHydrated={true}
      />
    );
    
    // Click should not work when disabled
    fireEvent.click(screen.getByText('🎭 Poetic'));
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should clear memory using utility function', () => {
    localStorageMock.setItem('vynce_hype_variant', 'poetic');
    
    clearVariantMemory();
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('vynce_hype_variant');
  });
}); 