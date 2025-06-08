import '@testing-library/jest-dom';

// Suppress Recharts warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeEach(() => {
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('width(0) and height(0) of chart') ||
       args[0].includes('linearGradient') ||
       args[0].includes('unrecognized in this browser'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('linearGradient') ||
       args[0].includes('unrecognized in this browser') ||
       args[0].includes('update to TransitionRootFn'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
});

afterEach(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));

// Mock framer-motion to avoid issues with animations in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
    path: 'path',
    circle: 'circle',
    text: 'text',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID = 'test-client-id';
process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI = 'http://localhost:3000/api/spotify/callback';
process.env.NEXT_PUBLIC_DISABLE_AI = 'true';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  constructor(cb: any) {
    this.cb = cb;
  }
  observe(target: Element) {
    // Mock a proper ResizeObserver entry format that Recharts expects
    const mockEntry = {
      target,
      contentRect: {
        width: 500,
        height: 300,
        top: 0,
        left: 0,
        right: 500,
        bottom: 300
      },
      borderBoxSize: [{ inlineSize: 500, blockSize: 300 }],
      contentBoxSize: [{ inlineSize: 500, blockSize: 300 }],
      devicePixelContentBoxSize: [{ inlineSize: 500, blockSize: 300 }]
    };
    
    // Call the callback immediately with mock data
    setTimeout(() => this.cb([mockEntry], this), 0);
  }
  unobserve() {}
  disconnect() {}
  private cb: any;
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 