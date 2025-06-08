import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import RefreshButton from '@/components/insights/cards/RefreshButton';

describe('RefreshButton', () => {
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders refresh button', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('calls onRefresh when clicked', async () => {
    mockOnRefresh.mockResolvedValueOnce(undefined);
    
    render(<RefreshButton onRefresh={mockOnRefresh} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isLoading is true', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} isLoading={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('enters cooldown state after successful refresh', async () => {
    mockOnRefresh.mockResolvedValueOnce(undefined);
    
    render(<RefreshButton onRefresh={mockOnRefresh} />);
    
    const button = screen.getByRole('button');
    
    // Click the button
    fireEvent.click(button);
    
    // Wait for the promise to resolve
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
    
    // Button should be disabled due to cooldown
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('exits cooldown after 15 seconds', async () => {
    mockOnRefresh.mockResolvedValueOnce(undefined);
    
    render(<RefreshButton onRefresh={mockOnRefresh} />);
    
    const button = screen.getByRole('button');
    
    // Click the button
    fireEvent.click(button);
    
    // Wait for the promise to resolve
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
    
    // Button should be disabled
    expect(button).toBeDisabled();
    
    // Fast-forward 15 seconds
    act(() => {
      jest.advanceTimersByTime(15000);
    });
    
    // Button should be enabled again
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('does not call onRefresh when in cooldown', async () => {
    mockOnRefresh.mockResolvedValueOnce(undefined);
    
    render(<RefreshButton onRefresh={mockOnRefresh} />);
    
    const button = screen.getByRole('button');
    
    // First click
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
    
    // Second click during cooldown
    fireEvent.click(button);
    
    // Should not call onRefresh again
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not call onRefresh when loading', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} isLoading={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });



  it('applies custom className', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
}); 