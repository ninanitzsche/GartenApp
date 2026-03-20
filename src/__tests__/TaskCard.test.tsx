/**
 * TaskCard Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import TaskCard from '../components/TaskCard';
import { Task } from '../types/task';
import { Zeitraum } from '../types/zeitraum';

const mockTask: Task = {
  id: '1',
  user_id: 'user1',
  title: 'Test Task',
  description: 'Test Description',
  location: 'Garten',
  category: 'pflege',
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

  it('renders task title correctly', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    expect(getByText('Test Task')).toBeTruthy();
  });

  it('renders location when provided', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    expect(getByText('Garten')).toBeTruthy();
  });

  it('renders zeitraum label when provided', () => {
    const { getByText } = render(
      <TaskCard task={mockTask} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    expect(getByText(/Frühjahr/)).toBeTruthy();
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

  it('renders without zeitraum when not provided', () => {
    const taskWithoutZeitraum = { ...mockTask, zeitraum: undefined };
    const { queryByText } = render(
      <TaskCard task={taskWithoutZeitraum} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    expect(queryByText(/Frühjahr/)).toBeNull();
  });

  it('renders without location when not provided', () => {
    const taskWithoutLocation = { ...mockTask, location: undefined };
    const { queryByText } = render(
      <TaskCard task={taskWithoutLocation} onToggle={mockOnToggle} onPress={mockOnPress} />
    );
    expect(queryByText('Garten')).toBeNull();
  });
});
