/**
 * QuickFilterChips Tests
 */

import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react-native';
import QuickFilterChips from '../components/ui/QuickFilterChips';

describe('QuickFilterChips', () => {
  const mockCounts = {
    overdue: 3,
    thisWeek: 5,
    nextWeek: 2,
    nextSteps: 8,
  };

  it('renders without crashing', () => {
    const { toJSON } = render(
      <QuickFilterChips
        activeFilter={null}
        onFilterChange={() => {}}
        counts={mockCounts}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders all filter chips', () => {
    const { getByText } = render(
      <QuickFilterChips
        activeFilter={null}
        onFilterChange={() => {}}
        counts={mockCounts}
      />
    );
    expect(getByText('Überfällig')).toBeTruthy();
    expect(getByText('Diese Woche')).toBeTruthy();
    expect(getByText('Nächste Woche')).toBeTruthy();
    expect(getByText('Next Steps')).toBeTruthy();
  });

  it('renders count badges when counts > 0', () => {
    const { getByText } = render(
      <QuickFilterChips
        activeFilter={null}
        onFilterChange={() => {}}
        counts={mockCounts}
      />
    );
    expect(getByText('3')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('8')).toBeTruthy();
  });
});