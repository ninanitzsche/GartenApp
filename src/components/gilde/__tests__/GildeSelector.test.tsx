import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GildeSelector from '../GildeSelector';
import { Gilde } from '../../../types/gilde';

jest.mock('react-native/Libraries/Modal/Modal', () => {
  const { View } = require('react-native');
  return ({ children, visible, ...props }: any) => 
    visible ? <View {...props}>{children}</View> : null;
});

describe('GildeSelector', () => {
  const mockGilden: Gilde[] = [
    { id: '1', name: 'Milpa', concept: 'Synergie', plants: [], is_system: true },
    { id: '2', name: 'Kartoffel', concept: 'No-Dig', plants: [], is_system: true },
  ];

  it('should render search input', () => {
    render(<GildeSelector gilden={mockGilden} onSelect={jest.fn()} visible={true} />);
    expect(screen.getByPlaceholderText(/Gilde suchen/)).toBeTruthy();
  });

  it('should render gilde list', () => {
    render(<GildeSelector gilden={mockGilden} onSelect={jest.fn()} visible={true} />);
    expect(screen.getAllByText(/Milpa/)).toBeTruthy();
  });

  it('should call onSelect when gilde is tapped', () => {
    const onSelect = jest.fn();
    render(<GildeSelector gilden={mockGilden} onSelect={onSelect} visible={true} />);
    
    fireEvent.press(screen.getAllByText(/Milpa/)[0]);
    expect(onSelect).toHaveBeenCalled();
  });
});
