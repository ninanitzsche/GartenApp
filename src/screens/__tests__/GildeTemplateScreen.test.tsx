import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import GildeTemplateScreen from '../GildeTemplateScreen';

jest.mock('../../services/gildeService', () => ({
  fetchGilden: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../hooks/useBeets', () => ({
  useBeets: () => ({ beets: [], loading: false }),
}));

jest.mock('../../services/bedService', () => ({
  fetchBedPlants: jest.fn().mockResolvedValue([]),
}));

describe('GildeTemplateScreen', () => {
  it('renders loading state', () => {
    render(
      <GildeTemplateScreen route={{ params: {} }} navigation={{} as any} />
    );
  });

  it('renders filter buttons after loading', async () => {
    render(
      <GildeTemplateScreen route={{ params: {} }} navigation={{} as any} />
    );

    await waitFor(() => {
      expect(screen.getByText('Alle')).toBeTruthy();
    });
    expect(screen.getByText('System')).toBeTruthy();
    expect(screen.getByText('Eigene')).toBeTruthy();
  });
});