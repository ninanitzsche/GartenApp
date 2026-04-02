// @ts-nocheck
/**
 * SegmentedControl Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SegmentedControl from '../components/SegmentedControl';

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

const mockOnSelect = jest.fn();

const defaultProps = {
  segments: ['Segment 1', 'Segment 2', 'Segment 3'],
  selectedIndex: 0,
  onSelect: mockOnSelect,
};

describe('SegmentedControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders all segments', () => {
    it('renders all segment labels', () => {
      const { getByText } = render(<SegmentedControl {...defaultProps} />);
      expect(getByText('Segment 1')).toBeTruthy();
      expect(getByText('Segment 2')).toBeTruthy();
      expect(getByText('Segment 3')).toBeTruthy();
    });

    it('renders correct number of segments', () => {
      const { UNSAFE_getAllByType } = render(<SegmentedControl {...defaultProps} />);
      const tabs = UNSAFE_getAllByType('TouchableOpacity');
      expect(tabs).toHaveLength(3);
    });

    it('handles single segment', () => {
      const { UNSAFE_getAllByType } = render(
        <SegmentedControl
          segments={['Single']}
          selectedIndex={0}
          onSelect={mockOnSelect}
        />
      );
      expect(UNSAFE_getAllByType('TouchableOpacity')).toHaveLength(1);
    });

    it('handles multiple segments', () => {
      const { UNSAFE_getAllByType } = render(
        <SegmentedControl
          segments={['A', 'B', 'C', 'D', 'E']}
          selectedIndex={2}
          onSelect={mockOnSelect}
        />
      );
      expect(UNSAFE_getAllByType('TouchableOpacity')).toHaveLength(5);
    });
  });

  describe('selected segment styling', () => {
    it('marks selected segment with accessibilityState selected', () => {
      const { UNSAFE_getAllByType } = render(<SegmentedControl {...defaultProps} selectedIndex={1} />);
      const tabs = UNSAFE_getAllByType('TouchableOpacity');
      const state1 = tabs[1].props.accessibilityState;
      const state0 = tabs[0].props.accessibilityState;
      const state2 = tabs[2].props.accessibilityState;
      const parseState = (s) => typeof s === 'string' ? JSON.parse(s) : s;
      expect(parseState(state1).selected).toBe(true);
      expect(parseState(state0).selected).toBe(false);
      expect(parseState(state2).selected).toBe(false);
    });

    it('marks different selected segment correctly', () => {
      const { UNSAFE_getAllByType } = render(<SegmentedControl {...defaultProps} selectedIndex={2} />);
      const tabs = UNSAFE_getAllByType('TouchableOpacity');
      const state2 = tabs[2].props.accessibilityState;
      const state0 = tabs[0].props.accessibilityState;
      const state1 = tabs[1].props.accessibilityState;
      const parseState = (s) => typeof s === 'string' ? JSON.parse(s) : s;
      expect(parseState(state2).selected).toBe(true);
      expect(parseState(state0).selected).toBe(false);
      expect(parseState(state1).selected).toBe(false);
    });
  });

  describe('onSelect callback', () => {
    it('calls onSelect with correct index when segment is pressed', () => {
      const { getByText } = render(<SegmentedControl {...defaultProps} />);
      fireEvent.press(getByText('Segment 2'));
      expect(mockOnSelect).toHaveBeenCalledWith(1);
    });

    it('calls onSelect with correct index for first segment', () => {
      const { getByText } = render(
        <SegmentedControl {...defaultProps} selectedIndex={2} />
      );
      fireEvent.press(getByText('Segment 1'));
      expect(mockOnSelect).toHaveBeenCalledWith(0);
    });

    it('calls onSelect with correct index for last segment', () => {
      const { getByText } = render(<SegmentedControl {...defaultProps} />);
      fireEvent.press(getByText('Segment 3'));
      expect(mockOnSelect).toHaveBeenCalledWith(2);
    });

    it('calls onSelect only once per press', () => {
      const { getByText } = render(<SegmentedControl {...defaultProps} />);
      fireEvent.press(getByText('Segment 2'));
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('does not call onSelect when already selected segment is pressed', () => {
      const { getByText } = render(
        <SegmentedControl {...defaultProps} selectedIndex={0} />
      );
      fireEvent.press(getByText('Segment 1'));
      expect(mockOnSelect).toHaveBeenCalledWith(0);
    });
  });

  describe('multiple segment selections', () => {
    it('can select second segment', () => {
      const { getByText } = render(
        <SegmentedControl {...defaultProps} selectedIndex={0} />
      );
      fireEvent.press(getByText('Segment 2'));
      expect(mockOnSelect).toHaveBeenCalledWith(1);
    });

    it('can select third segment', () => {
      const { getByText } = render(
        <SegmentedControl {...defaultProps} selectedIndex={0} />
      );
      fireEvent.press(getByText('Segment 3'));
      expect(mockOnSelect).toHaveBeenCalledWith(2);
    });

    it('supports selecting different segments in sequence', () => {
      const { getByText } = render(
        <SegmentedControl {...defaultProps} selectedIndex={0} />
      );
      
      fireEvent.press(getByText('Segment 2'));
      expect(mockOnSelect).toHaveBeenLastCalledWith(1);
      
      fireEvent.press(getByText('Segment 3'));
      expect(mockOnSelect).toHaveBeenLastCalledWith(2);
      
      fireEvent.press(getByText('Segment 1'));
      expect(mockOnSelect).toHaveBeenLastCalledWith(0);
    });
  });

  describe('icons display', () => {
    it('renders icons when icons prop is provided', () => {
      const { UNSAFE_getAllByType } = render(
        <SegmentedControl
          segments={['A', 'B']}
          selectedIndex={0}
          onSelect={mockOnSelect}
          icons={['home', 'star']}
        />
      );
      const icons = UNSAFE_getAllByType('MaterialIcons');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });

    it('does not render icons when icons prop is not provided', () => {
      const { UNSAFE_queryAllByType } = render(<SegmentedControl {...defaultProps} />);
      const icons = UNSAFE_queryAllByType('MaterialIcons');
      expect(icons).toHaveLength(0);
    });

    it('renders correct number of icons matching segments', () => {
      const { UNSAFE_getAllByType } = render(
        <SegmentedControl
          segments={['A', 'B', 'C']}
          selectedIndex={0}
          onSelect={mockOnSelect}
          icons={['home', 'star', 'favorite']}
        />
      );
      const icons = UNSAFE_getAllByType('MaterialIcons');
      expect(icons).toHaveLength(3);
    });

    it('handles partial icons array', () => {
      const { UNSAFE_getAllByType } = render(
        <SegmentedControl
          segments={['A', 'B', 'C']}
          selectedIndex={0}
          onSelect={mockOnSelect}
          icons={['home']}
        />
      );
      const icons = UNSAFE_getAllByType('MaterialIcons');
      expect(icons).toHaveLength(1);
    });

    it('handles empty icons array', () => {
      const { UNSAFE_queryAllByType } = render(
        <SegmentedControl
          segments={['A', 'B']}
          selectedIndex={0}
          onSelect={mockOnSelect}
          icons={[]}
        />
      );
      const icons = UNSAFE_queryAllByType('MaterialIcons');
      expect(icons).toHaveLength(0);
    });
  });
});
