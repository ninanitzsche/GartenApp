// @ts-nocheck
/**
 * Gamification Service Tests
 * TDD: Tests first, then implementation
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getTodayCompletedCount, calculateStreak, getMotivationMessage } from '../services/gamificationService';

// Mock dependencies
jest.mock('../services/taskService', () => ({
  fetchTasks: jest.fn(),
}));

jest.mock('../services/dashboardService', () => ({
  getPlantTaskProgress: jest.fn(),
}));

import { fetchTasks } from '../services/taskService';
const mockFetchTasks = fetchTasks as jest.MockedFunction<typeof fetchTasks>;

describe('gamificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTodayCompletedCount', () => {
    it('should return 0 for empty tasks array', () => {
      const tasks: any[] = [];
      expect(getTodayCompletedCount(tasks)).toBe(0);
    });

    it('should count only tasks completed today', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const tasks = [
        { id: '1', completed_at: `${today}T10:00:00Z` },
        { id: '2', completed_at: `${yesterday}T10:00:00Z` },
        { id: '3', completed_at: null },
      ];
      
      expect(getTodayCompletedCount(tasks)).toBe(1);
    });
  });

  describe('calculateStreak', () => {
    it('should return 0 when no tasks completed', async () => {
      mockFetchTasks.mockResolvedValue([]);
      const result = await calculateStreak();
      expect(result.currentStreak).toBe(0);
    });

    it('should return streak of 1 for today only', async () => {
      const today = new Date().toISOString().split('T')[0];
      mockFetchTasks.mockResolvedValue([
        { id: '1', completed_at: `${today}T10:00:00Z` },
      ]);
      
      const result = await calculateStreak();
      expect(result.currentStreak).toBe(1);
    });

    it('should count 3 day streak correctly', async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
      const twoDaysAgo = new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0];
      
      mockFetchTasks.mockResolvedValue([
        { id: '1', completed_at: `${todayStr}T10:00:00Z` },
        { id: '2', completed_at: `${yesterday}T10:00:00Z` },
        { id: '3', completed_at: `${twoDaysAgo}T10:00:00Z` },
      ]);
      
      const result = await calculateStreak();
      expect(result.currentStreak).toBe(3);
    });

    it('should not count streak if yesterday missing', async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
      const twoDaysAgo = new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0];
      
      mockFetchTasks.mockResolvedValue([
        { id: '1', completed_at: `${todayStr}T10:00:00Z` },
        { id: '2', completed_at: `${twoDaysAgo}T10:00:00Z` },
      ]);
      
      const result = await calculateStreak();
      expect(result.currentStreak).toBe(1);
    });

    it('should calculate best streak across gaps', async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
      const fourDaysAgo = new Date(today.getTime() - 4 * 86400000).toISOString().split('T')[0];
      const fiveDaysAgo = new Date(today.getTime() - 5 * 86400000).toISOString().split('T')[0];
      const sixDaysAgo = new Date(today.getTime() - 6 * 86400000).toISOString().split('T')[0];
      
      mockFetchTasks.mockResolvedValue([
        { id: '1', completed_at: `${todayStr}T10:00:00Z` },
        { id: '2', completed_at: `${yesterday}T10:00:00Z` },
        { id: '3', completed_at: `${fourDaysAgo}T10:00:00Z` },
        { id: '4', completed_at: `${fiveDaysAgo}T10:00:00Z` },
        { id: '5', completed_at: `${sixDaysAgo}T10:00:00Z` },
      ]);
      
      const result = await calculateStreak();
      expect(result.currentStreak).toBe(2);
      expect(result.bestStreak).toBe(3);
    });
  });

  describe('getMotivationMessage', () => {
    it('should return start message when 0 completed today', () => {
      const plantProgress = [{ plantId: '1', plantName: 'Tomate', totalTasks: 5, completedTasks: 2, allDone: false }];
      const result = getMotivationMessage(plantProgress, 0);
      expect(result.message).toContain('erste');
    });

    it('should include today count in message when >= 5', () => {
      const plantProgress = [{ plantId: '1', plantName: 'Tomate', totalTasks: 5, completedTasks: 2, allDone: false }];
      const result = getMotivationMessage(plantProgress, 5);
      expect(result.message).toContain('5');
    });

    it('should select plant with open tasks', () => {
      const plantProgress = [
        { plantId: '1', plantName: 'Tomate', totalTasks: 5, completedTasks: 5, allDone: true },
        { plantId: '2', plantName: 'Paprika', totalTasks: 3, completedTasks: 1, allDone: false },
      ];
      const result = getMotivationMessage(plantProgress, 1);
      expect(result.plantId).toBe('2');
      expect(result.message).toContain('Paprika');
    });
  });
});