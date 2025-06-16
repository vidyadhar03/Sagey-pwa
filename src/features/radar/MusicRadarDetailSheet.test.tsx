import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MusicRadarDetailSheet } from './MusicRadarDetailSheet';
import { getRadarPayload } from './getRadarPayload';
import { mockRecentTracks, mockTopArtists, mockAudioFeatures } from '../../mocks/radar';
import { RadarAxis } from './types';

// Mock window/browser APIs
Object.assign(global, {
    open: jest.fn(),
    matchMedia: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Generate a realistic payload for testing
const testPayload = getRadarPayload({
    recentTracks: mockRecentTracks,
    topArtists: mockTopArtists,
    audioFeatures: mockAudioFeatures,
});

describe('MusicRadarDetailSheet', () => {
    beforeEach(() => {
        (global.open as jest.Mock).mockClear();
        (require('html2canvas') as jest.Mock).mockClear();
    });

    it('renders null when open is false', () => {
        const { container } = render(
            <MusicRadarDetailSheet open={false} onClose={() => {}} payload={testPayload} aiSummary={null} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders hero, chart, and suggestions when open', async () => {
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} aiSummary={null} />);
        });
        
        // Direct synchronous assertions since mocks are now synchronous
        expect(screen.getByText('Your Music Persona')).toBeInTheDocument();
        
        // Check for visible chips instead of specific numeric values
        expect(screen.getByText(/Strongest:/)).toBeInTheDocument();
        expect(screen.getByText(/Weakest:/)).toBeInTheDocument();
        
        expect(screen.getByText('Suggestions For You')).toBeInTheDocument();
        testPayload.suggestions.forEach(suggestion => {
            expect(screen.getByText(suggestion.label)).toBeInTheDocument();
        });
    });

    it('toggles trend switch when clicked', async () => {
        const user = userEvent.setup();
        
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} aiSummary={null} />);
        });
        
        const trendSwitch = screen.getByRole('switch');
        
        // Initial state should be unchecked
        expect(trendSwitch).toHaveAttribute('aria-checked', 'false');

        // Click to enable trends
        await user.click(trendSwitch);
        
        await waitFor(() => {
            expect(trendSwitch).toHaveAttribute('aria-checked', 'true');
        });

        // Click again to disable trends
        await user.click(trendSwitch);

        await waitFor(() => {
            expect(trendSwitch).toHaveAttribute('aria-checked', 'false');
        });
    });

    it('calls html2canvas when share button is clicked', async () => {
        const user = userEvent.setup();
        const html2canvas = require('html2canvas');
        
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} aiSummary={null} />);
        });
        
        await waitFor(() => {
            expect(screen.getByTestId('shareable-radar')).toBeInTheDocument();
        });

        const shareButton = screen.getByTestId('share-button');
        await user.click(shareButton);
        
        await waitFor(() => {
            expect(html2canvas).toHaveBeenCalled();
        });
    });

    it('calls onClose when close button is clicked', async () => {
        const user = userEvent.setup();
        const handleClose = jest.fn();
        
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={handleClose} payload={testPayload} aiSummary={null} />);
        });

        const closeButton = screen.getByTestId('close-button');
        await user.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});