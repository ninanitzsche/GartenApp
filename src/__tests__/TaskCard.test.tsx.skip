/**
 * TaskCard Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '@testing-library/react-native';
import TaskCard from '../components/TaskCard';
import { Task } from '../types/task';
import { Zeitraum } from '../types/zeitraum';
import { MaterialIcons } from '@expo/vector-icons';
import PrioritaetBadge from '../components/PrioritaetBadge';

const mockTask: Task = {
  id: '1',
  user_id: 'user1',
  title: 'Test Task',
  description: 'Test Description',
  location: 'Garten',
  category: 'Gartenarbeiten',
  priority: 'mittel',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  completed_at: null,
  zeitraum: Zeitraum.FRUEHJAHR_FRUH,
};

const mockOnToggle = jest.fn();
const mockOnPress = jest.fn();

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    expect(getByText('Test Task')).toBeTruthy();
  });

  it('renders priority badge', () => {
    const { UNSAFE_getAllByType } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    const badges = UNSAFE_getAllByType(PrioritaetBadge);
    expect(badges.length).toBe(1);
  });

  it('renders priority badge with correct priority', () => {
    const { UNSAFE_getAllByType } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    const badge = UNSAFE_getAllByType(PrioritaetBadge)[0];
    expect(badge.props.prioritaet).toBe('mittel');
  });

  it('renders zeitraum icon and label', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    expect(getByText(/Frühjahr/)).toBeTruthy();
    expect(getByText(/früh/)).toBeTruthy();
  });

  it('shows completed state with strikethrough', () => {
    const completedTask = { ...mockTask, completed_at: '2024-01-02' };
    const { getByText } = render(
      <TaskCard task={completedTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    const title = getByText('Test Task');
    expect(title.props.style).toContainEqual(
      expect.objectContaining({ textDecorationLine: 'line-through' })
    );
  });

  it('checkbox toggle callback is called on checkbox press', () => {
    const { getByLabelText } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    const checkbox = getByLabelText('Test Task nicht erledigt');
    fireEvent.press(checkbox);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('onPress callback is called on card press', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    const card = getByText('Test Task');
    fireEvent.press(card.parent?.parent);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders location display', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    expect(getByText('Garten')).toBeTruthy();
  });

  it('shows unchecked icon when task is not completed', () => {
    const { UNSAFE_getAllByType } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    const icons = UNSAFE_getAllByType(MaterialIcons);
    const uncheckedIcon = icons.find(icon => icon.props.name === 'radio-button-unchecked');
    expect(uncheckedIcon).toBeTruthy();
  });

  it('shows checked icon when task is completed', () => {
    const completedTask = { ...mockTask, completed_at: '2024-01-02' };
    const { UNSAFE_getAllByType } = render(
      <TaskCard task={completedTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    const icons = UNSAFE_getAllByType(MaterialIcons);
    const checkedIcon = icons.find(icon => icon.props.name === 'check-circle');
    expect(checkedIcon).toBeTruthy();
  });

  it('renders skeleton when loading is true', () => {
    const { UNSAFE_getAllByType } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} loading={true} />
    );
    const activityIndicators = UNSAFE_getAllByType(require('react-native').ActivityIndicator);
    expect(activityIndicators.length).toBeGreaterThan(0);
  });

  it('renders content when loading is false', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} loading={false} />
    );
    expect(getByText('Test Task')).toBeTruthy();
  });

  it('does not render zeitraum when not provided', () => {
    const taskWithoutZeitraum = { ...mockTask, zeitraum: undefined };
    const { queryByText } = render(
      <TaskCard task={taskWithoutZeitraum} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    expect(queryByText(/Frühjahr/)).toBeNull();
  });

  it('does not render location when not provided', () => {
    const taskWithoutLocation = { ...mockTask, location: undefined };
    const { queryByText } = render(
      <TaskCard task={taskWithoutLocation} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    expect(queryByText('Garten')).toBeNull();
  });
});
