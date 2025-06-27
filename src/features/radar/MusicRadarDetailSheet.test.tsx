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
            <MusicRadarDetailSheet open={false} onClose={() => {}} payload={testPayload} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders music persona and stats sections', async () => {
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} />);
        });
        
        // Check header
        expect(screen.getByText('Music Radar Details')).toBeInTheDocument();
        
        // Check Your Music Persona section
        expect(screen.getByText('Your Music Persona')).toBeInTheDocument();
        
        // Check Your Music Stats section
        expect(screen.getByText('Your Music Stats')).toBeInTheDocument();
        expect(screen.getByText('Tracks Analyzed')).toBeInTheDocument();
        expect(screen.getByText('Time Period')).toBeInTheDocument();
        expect(screen.getByText('Top Genre')).toBeInTheDocument();
        expect(screen.getByText('Recent Track')).toBeInTheDocument();
        
        // Check Detailed Breakdown section
        expect(screen.getByText('Detailed Breakdown')).toBeInTheDocument();
        expect(screen.getByText('Positivity Level')).toBeInTheDocument();
        expect(screen.getByText('Musical Exploration')).toBeInTheDocument();
        expect(screen.getByText('Night Owl Behavior')).toBeInTheDocument();
        expect(screen.getByText('Nostalgia Factor')).toBeInTheDocument();
    });

    it('renders main sections correctly', async () => {
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} />);
        });
        
        // Should show main sections
        expect(screen.getByText('Your Music Persona')).toBeInTheDocument();
        expect(screen.getByText('Your Music Stats')).toBeInTheDocument();
        expect(screen.getByText('Detailed Breakdown')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
        const user = userEvent.setup();
        const handleClose = jest.fn();
        
        render(<MusicRadarDetailSheet open={true} onClose={handleClose} payload={testPayload} />);

        const closeButton = screen.getByTestId('close-button');
        await user.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('displays music persona scores with progress bars', async () => {
        await act(async () => {
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} />);
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
            render(<MusicRadarDetailSheet open={true} onClose={() => {}} payload={testPayload} />);
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