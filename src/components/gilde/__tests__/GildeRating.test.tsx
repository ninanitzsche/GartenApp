import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GildeRating from '../GildeRating';
import { GildeRating as GildeRatingType } from '../../../types/gilde';

describe('GildeRating', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render 5 stars', () => {
    render(<GildeRating onSave={mockOnSave} />);
    const stars = screen.getAllByText('★');
    expect(stars).toHaveLength(5);
  });

  it('should call onSave when star is pressed', () => {
    render(<GildeRating onSave={mockOnSave} />);
    const stars = screen.getAllByText('★');
    fireEvent.press(stars[3]);
    expect(mockOnSave).toHaveBeenCalledWith(4, '');
  });

  it('should display existing rating comment in readonly mode', () => {
    const existingRating: GildeRatingType = {
      id: 'rating-1',
      bed_id: 'bed-1',
      gilde_id: 'gilde-1',
      rating: 4,
      comment: 'Sehr gut!',
    };

    render(<GildeRating rating={existingRating} onSave={mockOnSave} readonly />);
    expect(screen.getByText(/Sehr gut!/)).toBeTruthy();
  });

  it('should show readonly mode without interaction', () => {
    const existingRating: GildeRatingType = {
      id: 'rating-1',
      bed_id: 'bed-1',
      gilde_id: 'gilde-1',
      rating: 3,
    };

    render(<GildeRating rating={existingRating} onSave={mockOnSave} readonly />);
    const stars = screen.getAllByText('★');
    fireEvent.press(stars[4]);
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
