/**
 * PrioritaetBadge Tests
 */

import React from 'react';
import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react-native';
import PrioritaetBadge from '../components/PrioritaetBadge';
import Colors from '../theme/colors';

describe('PrioritaetBadge', () => {
  describe('Priority Levels', () => {
    it('renders "HOCH" label for hoch priority', () => {
      const { getByText } = render(<PrioritaetBadge prioritaet="hoch" />);
      expect(getByText('HOCH')).toBeTruthy();
    });

    it('renders "MITTEL" label for mittel priority', () => {
      const { getByText } = render(<PrioritaetBadge prioritaet="mittel" />);
      expect(getByText('MITTEL')).toBeTruthy();
    });

    it('renders "NIEDRIG" label for niedrig priority', () => {
      const { getByText } = render(<PrioritaetBadge prioritaet="niedrig" />);
      expect(getByText('NIEDRIG')).toBeTruthy();
    });

    it('applies priorityHigh color for hoch priority', () => {
      const { getByTestId } = render(<PrioritaetBadge prioritaet="hoch" />);
      const badge = getByTestId('badge');
      expect(badge.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: Colors.priorityHigh })
      );
    });

    it('applies priorityMedium color for mittel priority', () => {
      const { getByTestId } = render(<PrioritaetBadge prioritaet="mittel" />);
      const badge = getByTestId('badge');
      expect(badge.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: Colors.priorityMedium })
      );
    });

    it('applies #757575 color for niedrig priority', () => {
      const { getByTestId } = render(<PrioritaetBadge prioritaet="niedrig" />);
      const badge = getByTestId('badge');
      expect(badge.props.style).toContainEqual(
        expect.objectContaining({ backgroundColor: '#757575' })
      );
    });
  });

  describe('Sizes', () => {
    it('renders with small size by default', () => {
      const { getByTestId } = render(<PrioritaetBadge prioritaet="hoch" />);
      const text = getByTestId('text');
      expect(text.props.style).not.toContainEqual(
        expect.objectContaining({ fontSize: 12 })
      );
    });

    it('renders with small size explicitly', () => {
      const { getByTestId } = render(<PrioritaetBadge prioritaet="hoch" size="small" />);
      const text = getByTestId('text');
      expect(text.props.style).not.toContainEqual(
        expect.objectContaining({ fontSize: 12 })
      );
    });

    it('renders with medium size and larger font', () => {
      const { getByTestId } = render(<PrioritaetBadge prioritaet="hoch" size="medium" />);
      const text = getByTestId('text');
      expect(text.props.style).toContainEqual(
        expect.objectContaining({ fontSize: 12 })
      );
    });

    it('renders with medium size and larger padding on text', () => {
      const { getByTestId } = render(<PrioritaetBadge prioritaet="mittel" size="medium" />);
      const text = getByTestId('text');
      expect(text.props.style).toContainEqual(
        expect.objectContaining({ paddingHorizontal: 12 })
      );
      expect(text.props.style).toContainEqual(
        expect.objectContaining({ paddingVertical: 4 })
      );
    });
  });

  describe('Styling', () => {
    it('applies white text color', () => {
      const { getByTestId } = render(<PrioritaetBadge prioritaet="hoch" />);
      const text = getByTestId('text');
      expect(text.props.style).toContainEqual(
        expect.objectContaining({ color: '#fff' })
      );
    });

    it('applies bold font weight', () => {
      const { getByTestId } = render(<PrioritaetBadge prioritaet="niedrig" />);
      const text = getByTestId('text');
      expect(text.props.style).toContainEqual(
        expect.objectContaining({ fontWeight: 'bold' })
      );
    });

    it('applies border radius of 4', () => {
      const { getByTestId } = render(<PrioritaetBadge prioritaet="mittel" />);
      const badge = getByTestId('badge');
      expect(badge.props.style).toContainEqual(
        expect.objectContaining({ borderRadius: 4 })
      );
    });
  });
});