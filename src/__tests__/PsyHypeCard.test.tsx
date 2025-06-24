import { render, screen } from '@testing-library/react';
import PsyHypeCard from '../features/psycho/ui/PsyHypeCard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('PsyHypeCard', () => {
  it('shows skeleton when loading', () => {
    render(
      <PsyHypeCard 
        isLoading={true}
        hasValidResponse={false}
      />
    );

    // Check for skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);

    // Should not show actual content
    expect(screen.queryByText('🎵 Musical Maverick')).not.toBeInTheDocument();
  });

  it('shows skeleton when no valid response', () => {
    render(
      <PsyHypeCard 
        isLoading={false}
        hasValidResponse={false}
      />
    );

    // Check for skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders headline and context when response is valid', () => {
    render(
      <PsyHypeCard
        headline="🎵 Musical Maverick Detected!"
        context="Your diverse taste spans genres like a true explorer."
        traits={[]}
        tips={[]}
        isLoading={false}
        hasValidResponse={true}
      />
    );

    expect(screen.getByText('🎵 Musical Maverick Detected!')).toBeInTheDocument();
    expect(screen.getByText('Your diverse taste spans genres like a true explorer.')).toBeInTheDocument();
  });

  it('renders traits list correctly', () => {
    const traits = ['Creative Explorer', 'Genre Chameleon', 'Trend Setter'];
    
    render(
      <PsyHypeCard
        headline="🎵 Test Headline"
        context="Test context"
        traits={traits}
        tips={[]}
        isLoading={false}
        hasValidResponse={true}
      />
    );

    traits.forEach(trait => {
      expect(screen.getByText(trait)).toBeInTheDocument();
    });

    // Check bullet points are present
    const bullets = screen.getAllByText('•');
    expect(bullets.length).toBeGreaterThanOrEqual(traits.length);
  });

  it('renders coach tips section when tips are provided', () => {
    const tips = ['Try exploring ambient music for relaxation', 'Mix in some jazz to round out your palette'];
    
    render(
      <PsyHypeCard
        headline="🎵 Test Headline"
        context="Test context"
        traits={['Test Trait']}
        tips={tips}
        isLoading={false}
        hasValidResponse={true}
      />
    );

    expect(screen.getByText('Coach Tips')).toBeInTheDocument();
    
    tips.forEach(tip => {
      expect(screen.getByText(tip)).toBeInTheDocument();
    });
  });

  it('does not render coach tips section when no tips provided', () => {
    render(
      <PsyHypeCard
        headline="🎵 Test Headline"
        context="Test context"
        traits={['Test Trait']}
        tips={[]}
        isLoading={false}
        hasValidResponse={true}
      />
    );

    expect(screen.queryByText('Coach Tips')).not.toBeInTheDocument();
  });

  it('handles empty arrays gracefully', () => {
    render(
      <PsyHypeCard
        headline="🎵 Test Headline"
        context="Test context"
        traits={[]}
        tips={[]}
        isLoading={false}
        hasValidResponse={true}
      />
    );

    expect(screen.getByText('🎵 Test Headline')).toBeInTheDocument();
    expect(screen.getByText('Test context')).toBeInTheDocument();
    expect(screen.queryByText('Coach Tips')).not.toBeInTheDocument();
  });

  it('handles undefined tips gracefully', () => {
    render(
      <PsyHypeCard
        headline="🎵 Test Headline"
        context="Test context"
        traits={['Test Trait']}
        tips={undefined}
        isLoading={false}
        hasValidResponse={true}
      />
    );

    expect(screen.getByText('🎵 Test Headline')).toBeInTheDocument();
    expect(screen.queryByText('Coach Tips')).not.toBeInTheDocument();
  });

  it('renders with correct CSS classes for styling', () => {
    const { container } = render(
      <PsyHypeCard
        headline="🎵 Test Headline"
        context="Test context"
        traits={['Test Trait']}
        tips={['Test Tip']}
        isLoading={false}
        hasValidResponse={true}
      />
    );

    // Check main container classes
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-zinc-900/50', 'border', 'border-white/10', 'rounded-2xl');

    // Check headline styling
    const headline = screen.getByText('🎵 Test Headline');
    expect(headline).toHaveClass('text-2xl', 'md:text-3xl', 'font-semibold', 'text-white');

    // Check context styling
    const context = screen.getByText('Test context');
    expect(context).toHaveClass('text-sm', 'md:text-base', 'text-zinc-300');

    // Check coach tips heading styling
    const coachTips = screen.getByText('Coach Tips');
    expect(coachTips).toHaveClass('text-sm', 'font-semibold', 'text-green-400');
  });

  it('shows dashed divider between sections', () => {
    render(
      <PsyHypeCard
        headline="🎵 Test Headline"
        context="Test context"
        traits={['Test Trait']}
        tips={['Test Tip']}
        isLoading={false}
        hasValidResponse={true}
      />
    );

    // Check for dashed border divider
    const divider = document.querySelector('.border-dashed');
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveClass('border-zinc-700');
  });
}); 