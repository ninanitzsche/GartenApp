/**
 * LearningService Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  fetchLearningsForSeason,
  fetchLearnings,
  fetchLearning,
  createLearning,
  updateLearning,
  rateLearning,
  dismissLearning,
  deleteLearning,
  fetchLearningsForPlant,
} from '../services/learningService';
import { Zeitraum } from '../types/zeitraum';
import { Learning } from '../types/learning';
import { supabase } from '../services/supabase';
import { mockUser, createMockQueryBuilder } from './mocks/supabaseMock';

jest.mock('../services/supabase');

const mockUserData = mockUser();

const mockLearning: Learning = {
  id: 'learning-1',
  user_id: mockUserData.id,
  source_type: 'knowledge_base',
  source_name: 'Test Knowledge',
  title: 'Tomaten nicht zu früh pflanzen',
  content: 'Tomaten sollten erst nach den Eisheiligen ins Freiland.',
  related_plants: ['Tomaten'],
  related_categories: [],
  valid_for_zeitraeume: ['fruehjahr_spaet'],
  relevance_score: 8,
  created_at: '2024-01-15T10:00:00Z',
  user_rating: undefined,
  dismissed: false,
};

describe('learningService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUserData },
      error: null,
    });
  });

  describe('fetchLearningsForSeason', () => {
    it('returns learnings for valid zeitraum', async () => {
      const mockBuilder = createMockQueryBuilder([mockLearning]);
      mockBuilder.or = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.order = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.limit = jest.fn().mockResolvedValue({ data: [mockLearning], error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchLearningsForSeason(['Tomaten'], Zeitraum.FRUEHJAHR_SPAET);

      expect(supabase.from).toHaveBeenCalledWith('learnings');
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns empty array when no learnings found', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      mockBuilder.or = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.order = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.limit = jest.fn().mockResolvedValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchLearningsForSeason(['Unbekannt'], Zeitraum.SOMMER_MITTE);

      expect(result).toEqual([]);
    });

    it('throws error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(fetchLearningsForSeason(['Tomaten'], Zeitraum.FRUEHJAHR_SPAET)).rejects.toThrow('User not authenticated');
    });

    it('throws error on database error', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      mockBuilder._setError('DB Error');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(fetchLearningsForSeason(['Tomaten'], Zeitraum.FRUEHJAHR_SPAET)).rejects.toThrow();
    });
  });

  describe('fetchLearnings', () => {
    it('returns all learnings for user', async () => {
      const learnings = [mockLearning, { ...mockLearning, id: 'learning-2' }];
      const mockBuilder = createMockQueryBuilder(learnings);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchLearnings();

      expect(Array.isArray(result)).toBe(true);
    });

    it('throws error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(fetchLearnings()).rejects.toThrow('User not authenticated');
    });
  });

  describe('fetchLearning', () => {
    it('returns single learning by id', async () => {
      const mockBuilder = createMockQueryBuilder([mockLearning]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchLearning('learning-1');

      expect(result).toBeDefined();
    });

    it('throws error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(fetchLearning('learning-1')).rejects.toThrow('User not authenticated');
    });
  });

  describe('createLearning', () => {
    it('creates learning with valid form data', async () => {
      const formData = {
        title: 'Neue Erkenntnis',
        content: 'Test content',
        related_plants: ['Tomaten'],
        valid_for_zeitraeume: ['fruehjahr_spaet'],
        flexible: false,
        relevance_score: 5,
      };

      const createdLearning = { ...mockLearning, ...formData };
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: [createdLearning], error: null }),
        }),
      });

      const result = await createLearning(formData);

      expect(result.title).toBe('Neue Erkenntnis');
    });

    it('throws error when title is empty', async () => {
      const formData = { title: '', content: 'Some content' };
      await expect(createLearning(formData as any)).rejects.toThrow('Learning title is required');
    });

    it('throws error when content is empty', async () => {
      const formData = { title: 'Valid Title', content: '' };
      await expect(createLearning(formData as any)).rejects.toThrow('Learning content is required');
    });

    it('throws error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const formData = { title: 'Valid Title', content: 'Valid content' };
      await expect(createLearning(formData)).rejects.toThrow('User not authenticated');
    });
  });

  describe('updateLearning', () => {
    it('updates learning with valid data', async () => {
      const formData = { title: 'Updated Title' };
      const updatedLearning = { ...mockLearning, title: 'Updated Title' };
      const mockBuilder = createMockQueryBuilder([updatedLearning]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await updateLearning('learning-1', formData);

      expect(result).toBeDefined();
    });

    it('throws error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(updateLearning('learning-1', { title: 'New' })).rejects.toThrow('User not authenticated');
    });
  });

  describe('rateLearning', () => {
    it('rates learning as helpful', async () => {
      const ratedLearning = { ...mockLearning, user_rating: 'helpful' as const };
      const mockBuilder = createMockQueryBuilder([ratedLearning]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await rateLearning('learning-1', 'helpful');

      expect(result.user_rating).toBe('helpful');
    });

    it('rates learning as not helpful', async () => {
      const ratedLearning = { ...mockLearning, user_rating: 'not_helpful' as const };
      const mockBuilder = createMockQueryBuilder([ratedLearning]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await rateLearning('learning-1', 'not_helpful');

      expect(result.user_rating).toBe('not_helpful');
    });

    it('throws error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(rateLearning('learning-1', 'helpful')).rejects.toThrow('User not authenticated');
    });
  });

  describe('dismissLearning', () => {
    it('sets dismissed to true', async () => {
      const dismissedLearning = { ...mockLearning, dismissed: true };
      const mockBuilder = createMockQueryBuilder([dismissedLearning]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await dismissLearning('learning-1');

      expect(result.dismissed).toBe(true);
    });

    it('throws error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(dismissLearning('learning-1')).rejects.toThrow('User not authenticated');
    });

    it('throws error when learning not found', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      mockBuilder._setData([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(dismissLearning('nonexistent')).rejects.toThrow('Failed to dismiss learning');
    });
  });

  describe('deleteLearning', () => {
    it('deletes learning successfully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      await expect(deleteLearning('learning-1')).resolves.toBeUndefined();
    });

    it('throws error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(deleteLearning('learning-1')).rejects.toThrow('User not authenticated');
    });
  });

  describe('fetchLearningsForPlant', () => {
    it('returns learnings for specific plant', async () => {
      const mockBuilder = createMockQueryBuilder([mockLearning]);
      mockBuilder.contains = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.order = jest.fn().mockResolvedValue({ data: [mockLearning], error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await fetchLearningsForPlant('Tomaten');

      expect(result).toBeInstanceOf(Array);
    });

    it('throws error when user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(fetchLearningsForPlant('Tomaten')).rejects.toThrow('User not authenticated');
    });
  });
});
