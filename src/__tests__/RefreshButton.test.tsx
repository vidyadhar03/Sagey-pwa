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

  it('shows disabled state when disabled prop is true', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} disabled={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
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

  it('does not call onRefresh when disabled', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} disabled={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });



  it('applies custom className', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('shows blue icon color in idle state', () => {
    render(<RefreshButton onRefresh={mockOnRefresh} />);
    
    const icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toHaveClass('text-blue-400');
  });

  it('shows blue icon with reduced opacity during cooldown', async () => {
    mockOnRefresh.mockResolvedValueOnce(undefined);
    
    render(<RefreshButton onRefresh={mockOnRefresh} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
    
    const icon = button.querySelector('svg');
    expect(icon).toHaveClass('text-blue-300/50');
  });
}); 