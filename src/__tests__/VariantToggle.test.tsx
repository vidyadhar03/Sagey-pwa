import { render, screen, fireEvent } from '@testing-library/react';
import VariantToggle from '../components/VariantToggle';

describe('VariantToggle', () => {
  const mockOnVariantChange = jest.fn();

  beforeEach(() => {
    mockOnVariantChange.mockClear();
  });

  it('renders with witty variant selected by default', () => {
    render(
      <VariantToggle 
        variant="witty" 
        onVariantChange={mockOnVariantChange} 
      />
    );

    const wittyButton = screen.getByText('✨ Witty').closest('button');
    const poeticButton = screen.getByText('🎭 Poetic').closest('button');

    expect(wittyButton).toHaveClass('text-white');
    expect(poeticButton).toHaveClass('text-zinc-400');
  });

  it('renders with poetic variant selected', () => {
    render(
      <VariantToggle 
        variant="poetic" 
        onVariantChange={mockOnVariantChange} 
      />
    );

    const wittyButton = screen.getByText('✨ Witty').closest('button');
    const poeticButton = screen.getByText('🎭 Poetic').closest('button');

    expect(wittyButton).toHaveClass('text-zinc-400');
    expect(poeticButton).toHaveClass('text-white');
  });

  it('calls onVariantChange when witty button is clicked', () => {
    render(
      <VariantToggle 
        variant="poetic" 
        onVariantChange={mockOnVariantChange} 
      />
    );

    const wittyButton = screen.getByText('✨ Witty');
    fireEvent.click(wittyButton);

    expect(mockOnVariantChange).toHaveBeenCalledWith('witty');
  });

  it('calls onVariantChange when poetic button is clicked', () => {
    render(
      <VariantToggle 
        variant="witty" 
        onVariantChange={mockOnVariantChange} 
      />
    );

    const poeticButton = screen.getByText('🎭 Poetic');
    fireEvent.click(poeticButton);

    expect(mockOnVariantChange).toHaveBeenCalledWith('poetic');
  });

  it('shows correct description for witty variant', () => {
    render(
      <VariantToggle 
        variant="witty" 
        onVariantChange={mockOnVariantChange} 
      />
    );

    expect(screen.getByText('Upbeat & playful with emoji flair')).toBeInTheDocument();
  });

  it('shows correct description for poetic variant', () => {
    render(
      <VariantToggle 
        variant="poetic" 
        onVariantChange={mockOnVariantChange} 
      />
    );

    expect(screen.getByText('Metaphorical & artistic with flowing prose')).toBeInTheDocument();
  });

  it('disables buttons when disabled prop is true', () => {
    render(
      <VariantToggle 
        variant="witty" 
        onVariantChange={mockOnVariantChange} 
        disabled={true}
      />
    );

    const wittyButton = screen.getByText('✨ Witty').closest('button');
    const poeticButton = screen.getByText('🎭 Poetic').closest('button');

    expect(wittyButton).toBeDisabled();
    expect(poeticButton).toBeDisabled();
    expect(wittyButton).toHaveClass('cursor-not-allowed');
    expect(poeticButton).toHaveClass('cursor-not-allowed');
  });

  it('does not call onVariantChange when disabled', () => {
    render(
      <VariantToggle 
        variant="witty" 
        onVariantChange={mockOnVariantChange} 
        disabled={true}
      />
    );

    const poeticButton = screen.getByText('🎭 Poetic');
    fireEvent.click(poeticButton);

    expect(mockOnVariantChange).not.toHaveBeenCalled();
  });
}); 