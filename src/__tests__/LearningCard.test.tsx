import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '@testing-library/react-native';
import LearningCard from '../components/LearningCard';
import { Learning } from '../types/learning';

const mockLearning: Learning = {
  id: '1',
  user_id: 'user1',
  source_type: 'knowledge_base',
  source_id: 'kb-1',
  source_name: 'Gartenwissen',
  title: 'Tomaten giessen',
  content: 'Tomaten sollten morgens gegossen werden, um Pilzbefall zu vermeiden.',
  related_plants: ['Tomate'],
  related_categories: ['Bewässerung'],
  valid_for_zeitraeume: ['Sommer'],
  relevance_score: 0.9,
  created_at: '2024-06-01',
  dismissed: false,
};

const mockOnRate = jest.fn();
const mockOnDismiss = jest.fn();

describe('LearningCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title', () => {
    const { getByText } = render(
      <LearningCard learning={mockLearning} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Tomaten giessen')).toBeTruthy();
  });

  it('renders content when present', () => {
    const { getByText } = render(
      <LearningCard learning={mockLearning} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Tomaten sollten morgens gegossen werden, um Pilzbefall zu vermeiden.')).toBeTruthy();
  });

  it('does not render content when not present', () => {
    const learningWithoutContent = { ...mockLearning, content: undefined };
    const { queryByText } = render(
      <LearningCard learning={learningWithoutContent} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    expect(queryByText('Tomaten sollten morgens gegossen werden')).toBeNull();
  });

  it('renders source type indicator with knowledge_base emoji', () => {
    const { getByText } = render(
      <LearningCard learning={mockLearning} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    expect(getByText(/📚 Gartenwissen/)).toBeTruthy();
  });

  it('renders source type indicator with manual emoji', () => {
    const learningWithManualSource = { ...mockLearning, source_type: 'manual' as const, source_name: 'Mein Garten' };
    const { getByText } = render(
      <LearningCard learning={learningWithManualSource} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    expect(getByText(/📝 Mein Garten/)).toBeTruthy();
  });

  it('does not render source when source_name is not present', () => {
    const learningWithoutSource = { ...mockLearning, source_name: undefined };
    const { queryByText } = render(
      <LearningCard learning={learningWithoutSource} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    expect(queryByText(/📚/)).toBeNull();
    expect(queryByText(/📝/)).toBeNull();
  });

  it('renders thumbs up/down buttons when not rated', () => {
    const { getByText } = render(
      <LearningCard learning={mockLearning} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Hilfreich')).toBeTruthy();
    expect(getByText('Nicht hilfreich')).toBeTruthy();
  });

  it('calls onRate with true when helpful button is pressed', () => {
    const { getByText } = render(
      <LearningCard learning={mockLearning} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    fireEvent.press(getByText('Hilfreich'));
    expect(mockOnRate).toHaveBeenCalledWith(true);
  });

  it('calls onRate with false when not helpful button is pressed', () => {
    const { getByText } = render(
      <LearningCard learning={mockLearning} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    fireEvent.press(getByText('Nicht hilfreich'));
    expect(mockOnRate).toHaveBeenCalledWith(false);
  });

  it('calls onDismiss when dismiss button is pressed', () => {
    const { getByLabelText } = render(
      <LearningCard learning={mockLearning} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    fireEvent.press(getByLabelText('Tipp verwerfen'));
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows rated state when user_rating is helpful', () => {
    const ratedLearning = { ...mockLearning, user_rating: 'helpful' as const };
    const { getByText, queryByText } = render(
      <LearningCard learning={ratedLearning} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Als hilfreich markiert')).toBeTruthy();
    expect(queryByText('Hilfreich')).toBeNull();
    expect(queryByText('Nicht hilfreich')).toBeNull();
  });

  it('shows rated state when user_rating is not_helpful', () => {
    const ratedLearning = { ...mockLearning, user_rating: 'not_helpful' as const };
    const { getByText, queryByText } = render(
      <LearningCard learning={ratedLearning} onRate={mockOnRate} onDismiss={mockOnDismiss} />
    );
    expect(getByText('Als nicht hilfreich markiert')).toBeTruthy();
    expect(queryByText('Hilfreich')).toBeNull();
    expect(queryByText('Nicht hilfreich')).toBeNull();
  });
});