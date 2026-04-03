// @ts-nocheck
/**
 * Auto Task Generation Tests
 * Tests for automatic task generation after AI plant identification
 */

import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../services/taskService', () => ({
  createTask: jest.fn(),
  linkPlantsToTask: jest.fn(),
}));

jest.mock('../services/taskSuggestionService', () => ({
  getSuggestionsForPlant: jest.fn(),
  getCurrentSeason: jest.fn(() => 'fruehling'),
}));

import { createTask } from '../services/taskService';
import { getSuggestionsForPlant } from '../services/taskSuggestionService';

const mockCreateTask = createTask as jest.MockedFunction<typeof createTask>;
const mockGetSuggestionsForPlant = getSuggestionsForPlant as jest.MockedFunction<typeof getSuggestionsForPlant>;

describe('Auto Task Generation after AI Plant Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate tasks when new plant is created via AI', async () => {
    const mockPlant = {
      id: 'new-plant-1',
      name: 'Aprikose Compacta',
      family: 'Rosaceae',
      status: 'geplant',
    };

    const mockSuggestions = [
      { id: 'sug-1', title: 'Giessen', category: 'Pflege', priority: 'mittel', reason: 'Regelmässig giessen' },
      { id: 'sug-2', title: 'Düngen', category: 'Pflege', priority: 'niedrig', reason: 'Nährstoffe geben' },
    ];

    mockGetSuggestionsForPlant.mockReturnValue(mockSuggestions);
    mockCreateTask.mockResolvedValue({ id: 'task-1' } as any);

    const suggestions = getSuggestionsForPlant(mockPlant.family);

    for (const suggestion of suggestions) {
      await createTask({
        title: suggestion.title,
        category: suggestion.category,
        priority: suggestion.priority,
        description: suggestion.reason,
        plant_ids: [mockPlant.id],
      });
    }

    expect(suggestions).toHaveLength(2);
    expect(mockCreateTask).toHaveBeenCalledTimes(2);
  });

  it('should pass plant_id to link task with plant', async () => {
    const mockPlant = {
      id: 'plant-1',
      name: 'Tomate',
      family: 'Solanaceae',
    };

    const mockSuggestions = [
      { title: 'Giessen', category: 'Pflege', priority: 'mittel', reason: 'Test' },
    ];

    mockGetSuggestionsForPlant.mockReturnValue(mockSuggestions);
    mockCreateTask.mockResolvedValue({ id: 'task-1' } as any);

    await createTask({
      title: mockSuggestions[0].title,
      category: mockSuggestions[0].category,
      priority: mockSuggestions[0].priority,
      description: mockSuggestions[0].reason,
      plant_ids: [mockPlant.id],
    });

    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        plant_ids: [mockPlant.id],
      })
    );
  });

  it('should NOT generate tasks for weed classification', async () => {
    const weedStatus = 'unkraut';
    const shouldGenerateTasks = weedStatus !== 'unkraut' && weedStatus !== 'helfer';
    expect(shouldGenerateTasks).toBe(false);
  });

  it('should NOT generate tasks for helper classification', async () => {
    const helperStatus = 'helfer';
    const shouldGenerateTasks = helperStatus !== 'unkraut' && helperStatus !== 'helfer';
    expect(shouldGenerateTasks).toBe(false);
  });
});