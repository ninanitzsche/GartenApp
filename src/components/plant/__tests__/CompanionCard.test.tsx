/**
 * CompanionCard Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import CompanionCard from '../CompanionCard';

describe('CompanionCard', () => {
  it('should render good companions section', () => {
    render(<CompanionCard plantName="Tomate" goodCompanions={['Basilikum', 'Knoblauch']} badCompanions={[]} />);
    
    expect(screen.getByText(/Basilikum/)).toBeTruthy();
    expect(screen.getByText(/Knoblauch/)).toBeTruthy();
  });

  it('should render bad companions section', () => {
    render(<CompanionCard plantName="Tomate" goodCompanions={[]} badCompanions={['Fenchel', 'Kartoffel']} />);
    
    expect(screen.getByText(/Fenchel/)).toBeTruthy();
    expect(screen.getByText(/Kartoffel/)).toBeTruthy();
  });

  it('should render when there are companions', () => {
    render(<CompanionCard plantName="Tomate" goodCompanions={['Basilikum']} badCompanions={[]} />);
    
    expect(screen.getByText(/Tomate/)).toBeTruthy();
  });

  it('should show good companion section', () => {
    render(<CompanionCard plantName="Tomate" goodCompanions={['Basilikum']} badCompanions={[]} />);
    
    expect(screen.getByText(/Gute Nachbarn/)).toBeTruthy();
  });

  it('should show bad companion section', () => {
    render(<CompanionCard plantName="Tomate" goodCompanions={[]} badCompanions={['Fenchel']} />);
    
    expect(screen.getByText(/Schlechte Nachbarn/)).toBeTruthy();
  });
});
