import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GildeCard from '../GildeCard';
import { Gilde } from '../../../types/gilde';

describe('GildeCard', () => {
  const mockGilde: Gilde = {
    id: 'test-1',
    name: 'Milpa',
    concept: 'Traditionelle Synergie',
    number: 1,
    plants: [
      { name: 'Mais', role: 'Stickstofffixierung' },
      { name: 'Feuerbohnen', role: 'Stickstofffixierung' },
    ],
    is_system: true,
  };

  it('should render gilde name', () => {
    render(<GildeCard gilde={mockGilde} />);
    expect(screen.getByText(/Milpa/)).toBeTruthy();
  });

  it('should render concept', () => {
    render(<GildeCard gilde={mockGilde} />);
    expect(screen.getByText(/Synergie/)).toBeTruthy();
  });

  it('should render plant count', () => {
    render(<GildeCard gilde={mockGilde} />);
    expect(screen.getByText(/2 Pflanzen/)).toBeTruthy();
  });
});