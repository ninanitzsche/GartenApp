/**
 * SeasonFilterDropdown Tests
 */

import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react-native';
import SeasonFilterDropdown from '../components/ui/SeasonFilterDropdown';

describe('SeasonFilterDropdown', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      <SeasonFilterDropdown
        selectedSeason="Alle"
        onSeasonChange={() => {}}
      />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crashing with different season', () => {
    const { toJSON } = render(
      <SeasonFilterDropdown
        selectedSeason="Frühling"
        onSeasonChange={() => {}}
      />
    );
    expect(toJSON()).toBeTruthy();
  });
});