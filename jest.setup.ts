import '@testing-library/jest-dom';

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