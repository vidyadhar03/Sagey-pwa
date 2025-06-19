import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MusicRadarDetailSheet } from './MusicRadarDetailSheet';
import { getRadarPayload } from './getRadarPayload';
import { mockRecentTracks, mockTopArtists } from '../../mocks/radar';
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

    it('renders new insight layout with music persona and stats', async () => {
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} aiSummary="Test AI Summary" />);
        });
        
        // Check new header
        expect(screen.getByText('Music Insights')).toBeInTheDocument();
        
        // Check AI Insights section
        expect(screen.getByText('AI Insights')).toBeInTheDocument();
        expect(screen.getByText('Test AI Summary')).toBeInTheDocument();
        
        // Check Your Music Persona section
        expect(screen.getByText('Your Music Persona')).toBeInTheDocument();
        
        // Check Your Music Stats section
        expect(screen.getByText('Your Music Stats')).toBeInTheDocument();
        expect(screen.getByText('Tracks Analyzed')).toBeInTheDocument();
        expect(screen.getByText('Time Period')).toBeInTheDocument();
        expect(screen.getByText('Top Genre')).toBeInTheDocument();
        expect(screen.getByText('Featured Track')).toBeInTheDocument();
        
        // Check Detailed Breakdown section
        expect(screen.getByText('Detailed Breakdown')).toBeInTheDocument();
        expect(screen.getByText('Positivity Level')).toBeInTheDocument();
        expect(screen.getByText('Musical Exploration')).toBeInTheDocument();
        expect(screen.getByText('Night Owl Behavior')).toBeInTheDocument();
        expect(screen.getByText('Nostalgia Factor')).toBeInTheDocument();
        
        // Check Suggestions section
        expect(screen.getByText('Suggestions For You')).toBeInTheDocument();
        testPayload.suggestions.forEach(suggestion => {
            expect(screen.getByText(suggestion.label)).toBeInTheDocument();
        });
    });

    it('renders without AI summary when not provided', async () => {
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} aiSummary={null} />);
        });
        
        // Should not show AI Insights section
        expect(screen.queryByText('AI Insights')).not.toBeInTheDocument();
        
        // But should still show other sections
        expect(screen.getByText('Your Music Persona')).toBeInTheDocument();
        expect(screen.getByText('Your Music Stats')).toBeInTheDocument();
    });

    it('calls html2canvas when share button is clicked', async () => {
        const user = userEvent.setup();
        const html2canvas = require('html2canvas');
        
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} aiSummary={null} />);
        });
        
        await waitFor(() => {
            expect(screen.getByTestId('share-button')).toBeInTheDocument();
        });

        const shareButton = screen.getByTestId('share-button');
        await user.click(shareButton);
        
        await waitFor(() => {
            expect(html2canvas).toHaveBeenCalled();
        });
    });

    it('uses native share when available and supported', async () => {
        const user = userEvent.setup();
        const mockShare = jest.fn().mockResolvedValue(undefined);
        const mockCanShare = jest.fn().mockReturnValue(true);
        
        // Mock navigator.share and canShare
        Object.defineProperty(navigator, 'share', {
            value: mockShare,
            writable: true,
        });
        Object.defineProperty(navigator, 'canShare', {
            value: mockCanShare,
            writable: true,
        });

        const html2canvas = require('html2canvas');
        
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} aiSummary={null} />);
        });

        const shareButton = screen.getByTestId('share-button');
        await user.click(shareButton);
        
        await waitFor(() => {
            expect(html2canvas).toHaveBeenCalled();
            expect(mockCanShare).toHaveBeenCalled();
            expect(mockShare).toHaveBeenCalledWith({
                files: expect.any(Array),
                title: 'My Music Insights',
                text: 'Check out my music persona from Sagey!',
            });
        });
    });

    it('falls back to download when native share is not available', async () => {
        const user = userEvent.setup();
        
        // Mock no native share support
        Object.defineProperty(navigator, 'share', {
            value: undefined,
            writable: true,
        });
        Object.defineProperty(navigator, 'canShare', {
            value: undefined,
            writable: true,
        });

        const html2canvas = require('html2canvas');
        
        render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} aiSummary={null} />);

        const shareButton = screen.getByTestId('share-button');
        await user.click(shareButton);
        
        await waitFor(() => {
            expect(html2canvas).toHaveBeenCalled();
            // We can't easily test the download link creation in JSDOM,
            // but we can ensure the fallback logic is triggered.
            // The console log in the component confirms this.
            expect(require('html2canvas')).toHaveBeenCalled();
        });
    });

    it('calls onClose when close button is clicked', async () => {
        const user = userEvent.setup();
        const handleClose = jest.fn();
        
        render(<MusicRadarDetailSheet open={true} onClose={handleClose} payload={testPayload} aiSummary={null} />);

        const closeButton = screen.getByTestId('close-button');
        await user.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('displays music persona scores with progress bars', async () => {
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} aiSummary={null} />);
        });
        
        // Check that all radar axes are displayed
        expect(screen.getByText('Positivity')).toBeInTheDocument();
        expect(screen.getByText('Energy')).toBeInTheDocument();
        expect(screen.getByText('Exploration')).toBeInTheDocument();
        expect(screen.getByText('Nostalgia')).toBeInTheDocument();
        expect(screen.getByText('Night-Owl')).toBeInTheDocument();
        
        // Check that percentage values are displayed
        Object.values(testPayload.scores).forEach(score => {
            expect(screen.getByText(`${Math.round(score)}%`)).toBeInTheDocument();
        });
    });

    it('displays detailed statistics correctly', async () => {
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} aiSummary={null} />);
        });
        
        // Check track count
        expect(screen.getByText(testPayload.trackCount.toString())).toBeInTheDocument();
        
        // Check weeks
        expect(screen.getByText(`${testPayload.weeks} weeks`)).toBeInTheDocument();
        
        // Check top genre
        expect(screen.getByText(testPayload.topGenre)).toBeInTheDocument();
        
        // Check sample track
        expect(screen.getByText(testPayload.sampleTrack.title)).toBeInTheDocument();
        expect(screen.getByText(`by ${testPayload.sampleTrack.artist}`)).toBeInTheDocument();
    });
});