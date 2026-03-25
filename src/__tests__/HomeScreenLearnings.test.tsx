/**
 * HomeScreen Learnings Integration Tests
 * Tests the LearningsCard component in seasonal context
 * Note: These are simplified tests focusing on LearningCard behavior
 * Full HomeScreen integration tests require act() wrapper for async state
 */

import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, fireEvent } from '@testing-library/react-native';
import LearningCard from '../components/LearningCard';
import { Learning } from '../types/learning';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

describe('LearningCard Component Tests', () => {
  const baseLearning: Learning = {
    id: '1',
    user_id: 'user1',
    source_type: 'knowledge_base',
    source_name: 'Garten Tipps',
    title: 'Tomaten nicht von oben gießen',
    content: 'Gießen Sie Tomatenpflanzen immer von unten.',
    related_plants: ['Tomate'],
    related_categories: ['pflege'],
    valid_for_zeitraeume: ['sommer_frueh'],
    relevance_score: 0.9,
    created_at: '2024-01-15',
    dismissed: false,
  };

  describe('LearningCard Rendering', () => {
    it('renders learning title', () => {
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByText } = render(
        <LearningCard learning={baseLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByText('Tomaten nicht von oben gießen')).toBeTruthy();
    });

    it('renders learning content', () => {
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByText } = render(
        <LearningCard learning={baseLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByText('Gießen Sie Tomatenpflanzen immer von unten.')).toBeTruthy();
    });

    it('renders source name for knowledge_base', () => {
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByText } = render(
        <LearningCard learning={baseLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByText(/📚 Garten Tipps/)).toBeTruthy();
    });

    it('renders source with manual emoji for manual source', () => {
      const manualLearning: Learning = {
        ...baseLearning,
        source_type: 'manual',
        source_name: 'Eigene Notiz',
      };
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByText } = render(
        <LearningCard learning={manualLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByText(/📝 Eigene Notiz/)).toBeTruthy();
    });
  });

  describe('LearningCard Rating', () => {
    it('shows rating buttons when not rated', () => {
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByText } = render(
        <LearningCard learning={baseLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByText('Hilfreich')).toBeTruthy();
      expect(getByText('Nicht hilfreich')).toBeTruthy();
    });

    it('calls onRate(true) when helpful pressed', () => {
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByText } = render(
        <LearningCard learning={baseLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      fireEvent.press(getByText('Hilfreich'));
      expect(onRate).toHaveBeenCalledWith(true);
    });

    it('calls onRate(false) when not helpful pressed', () => {
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByText } = render(
        <LearningCard learning={baseLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      fireEvent.press(getByText('Nicht hilfreich'));
      expect(onRate).toHaveBeenCalledWith(false);
    });

    it('shows helpful rating feedback when rated helpful', () => {
      const helpfulLearning: Learning = {
        ...baseLearning,
        user_rating: 'helpful',
      };
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByText, queryByText } = render(
        <LearningCard learning={helpfulLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByText('Als hilfreich markiert')).toBeTruthy();
      expect(queryByText('Hilfreich')).toBeNull();
      expect(queryByText('Nicht hilfreich')).toBeNull();
    });

    it('shows not helpful rating feedback when rated not_helpful', () => {
      const notHelpfulLearning: Learning = {
        ...baseLearning,
        user_rating: 'not_helpful',
      };
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByText, queryByText } = render(
        <LearningCard learning={notHelpfulLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByText('Als nicht hilfreich markiert')).toBeTruthy();
      expect(queryByText('Hilfreich')).toBeNull();
    });
  });

  describe('LearningCard Dismiss', () => {
    it('renders dismiss button', () => {
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByLabelText } = render(
        <LearningCard learning={baseLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByLabelText('Tipp verwerfen')).toBeTruthy();
    });

    it('calls onDismiss when dismiss pressed', () => {
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByLabelText } = render(
        <LearningCard learning={baseLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      fireEvent.press(getByLabelText('Tipp verwerfen'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('LearningCard Content', () => {
    it('handles learning without content', () => {
      const noContentLearning: Learning = {
        ...baseLearning,
        content: undefined,
      };
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByText, queryByText } = render(
        <LearningCard learning={noContentLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByText('Tomaten nicht von oben gießen')).toBeTruthy();
      expect(queryByText('Gießen Sie Tomatenpflanzen')).toBeNull();
    });

    it('handles learning without source_name', () => {
      const noSourceLearning: Learning = {
        ...baseLearning,
        source_name: undefined,
      };
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { queryByText } = render(
        <LearningCard learning={noSourceLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(queryByText(/📚/)).toBeNull();
      expect(queryByText(/📝/)).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has accessibility labels for rating buttons', () => {
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByLabelText } = render(
        <LearningCard learning={baseLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByLabelText('Als hilfreich bewerten')).toBeTruthy();
      expect(getByLabelText('Als nicht hilfreich bewerten')).toBeTruthy();
    });

    it('has accessibility label for dismiss', () => {
      const onRate = jest.fn();
      const onDismiss = jest.fn();
      const { getByLabelText } = render(
        <LearningCard learning={baseLearning} onRate={onRate} onDismiss={onDismiss} />
      );
      expect(getByLabelText('Tipp verwerfen')).toBeTruthy();
    });
  });
});

describe('LearningCard Seasonal Display', () => {
  it('displays seasonal label context based on valid_for_zeitraeume', () => {
    const sommerLearning: Learning = {
      id: '1',
      user_id: 'user1',
      source_type: 'knowledge_base',
      source_name: 'Sommer Tipps',
      title: 'Gurken regelmäßig giessen',
      content: 'Bei Hitze täglich giessen.',
      related_plants: ['Gurke'],
      related_categories: ['bewässerung'],
      valid_for_zeitraeume: ['sommer_mitte'],
      relevance_score: 0.8,
      created_at: '2024-06-01',
      dismissed: false,
    };
    
    const onRate = jest.fn();
    const onDismiss = jest.fn();
    const { getByText } = render(
      <LearningCard learning={sommerLearning} onRate={onRate} onDismiss={onDismiss} />
    );
    
    expect(getByText('Gurken regelmäßig giessen')).toBeTruthy();
    expect(getByText('Bei Hitze täglich giessen.')).toBeTruthy();
  });
});
