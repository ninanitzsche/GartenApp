/**
 * ExtendedFilterModal Tests
 */

import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react-native';
import ExtendedFilterModal from '../components/ui/ExtendedFilterModal';

describe('ExtendedFilterModal', () => {
  const mockFilters = {
    priorities: [],
    categories: [],
    plants: [],
    timeframes: [],
    status: [],
  };

  const mockAvailablePlants = [
    { id: '1', name: 'Tomate' },
    { id: '2', name: 'Paprika' },
  ];

  it('renders without crashing when visible', () => {
    const { toJSON } = render(
      <ExtendedFilterModal
        visible={true}
        onClose={() => {}}
        filters={mockFilters}
        onFiltersChange={() => {}}
        availablePlants={mockAvailablePlants}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders filter sections when visible', () => {
    const { getByText } = render(
      <ExtendedFilterModal
        visible={true}
        onClose={() => {}}
        filters={mockFilters}
        onFiltersChange={() => {}}
        availablePlants={mockAvailablePlants}
      />
    );
    expect(getByText('Filter')).toBeTruthy();
    expect(getByText('Priorität')).toBeTruthy();
    expect(getByText('Kategorie')).toBeTruthy();
    expect(getByText('Zeitraum')).toBeTruthy();
    expect(getByText('Status')).toBeTruthy();
  });

  it('renders all priority options', () => {
    const { getByText } = render(
      <ExtendedFilterModal
        visible={true}
        onClose={() => {}}
        filters={mockFilters}
        onFiltersChange={() => {}}
        availablePlants={mockAvailablePlants}
      />
    );
    expect(getByText('hoch')).toBeTruthy();
    expect(getByText('mittel')).toBeTruthy();
    expect(getByText('niedrig')).toBeTruthy();
  });

  it('shows apply button in footer', () => {
    const { getByText } = render(
      <ExtendedFilterModal
        visible={true}
        onClose={() => {}}
        filters={mockFilters}
        onFiltersChange={() => {}}
        availablePlants={mockAvailablePlants}
      />
    );
    expect(getByText('Anwenden')).toBeTruthy();
  });
});