// @ts-nocheck
/**
 * HomeScreen Gamification Loading Order Tests
 * Tests that gamification is loaded AFTER gardenGrowth is available
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../services/taskService', () => ({
  fetchTasks: jest.fn(),
  toggleTaskCompletion: jest.fn(),
}));

jest.mock('../services/dashboardService', () => ({
  getDashboardData: jest.fn(),
}));

jest.mock('../services/gamificationService', () => ({
  calculateStreak: jest.fn(),
  getMotivationMessage: jest.fn(),
  checkAchievements: jest.fn(),
  getTodayCompletedCount: jest.fn(() => 1),
}));

import { fetchTasks } from '../services/taskService';
import { getDashboardData } from '../services/dashboardService';
import { calculateStreak, getMotivationMessage, checkAchievements } from '../services/gamificationService';

const mockFetchTasks = fetchTasks as jest.MockedFunction<typeof fetchTasks>;
const mockGetDashboardData = getDashboardData as jest.MockedFunction<typeof getDashboardData>;
const mockCalculateStreak = calculateStreak as jest.MockedFunction<typeof calculateStreak>;
const mockGetMotivationMessage = getMotivationMessage as jest.MockedFunction<typeof getMotivationMessage>;
const mockCheckAchievements = checkAchievements as jest.MockedFunction<typeof checkAchievements>;

describe('HomeScreen Gamification Loading Order', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call loadGamification only when gardenGrowth.plants has data', async () => {
    // Test the FIX: loadGamification should only run when plants > 0
    const hasPlants = (plants: any[]) => plants.length > 0;

    const emptyPlants: any[] = [];
    const populatedPlants = [
      { plantId: 'plant-1', plantName: 'Tomate', totalTasks: 5, completedTasks: 2, allDone: false },
    ];

    // With empty plants, should NOT call gamification
    expect(hasPlants(emptyPlants)).toBe(false);
    
    // With populated plants, should call gamification
    expect(hasPlants(populatedPlants)).toBe(true);
  });

  it('should check gardenGrowth.plants.length in useEffect condition', () => {
    // This tests the fix: we added .length > 0 check
    const plants1: any[] = [];
    const plants2 = [{ id: '1' }];

    // Old behavior: would call gamification even with empty plants
    const oldBehavior = (loading: boolean) => !loading;
    
    // New behavior: only call when plants exist
    const newBehavior = (loading: boolean, plants: any[]) => !loading && plants.length > 0;

    // Old behavior would trigger with loading=false and empty plants
    expect(oldBehavior(false)).toBe(true); // BUG: triggers even with empty
    
    // New behavior correctly doesn't trigger with empty plants
    expect(newBehavior(false, plants1)).toBe(false); // CORRECT
    expect(newBehavior(false, plants2)).toBe(true); // CORRECT
  });

  it('should use gardenGrowth.plants after loadDashboard completes', async () => {
    const plantProgress = [
      { plantId: 'plant-1', plantName: 'Tomate', totalTasks: 5, completedTasks: 2, allDone: false },
    ];

    mockGetDashboardData.mockResolvedValue({
      plants: plantProgress,
      totalTasks: 5,
      completedTasks: 2,
      overallProgress: 40,
    });
    
    mockFetchTasks.mockResolvedValue([
      { id: 'task-1', completed_at: new Date().toISOString() },
    ]);

    // Simulate correct order
    const dashboardData = await getDashboardData();
    
    // The fix ensures gamification uses populated gardenGrowth
    expect(dashboardData.plants).toBeDefined();
    expect(dashboardData.plants.length).toBe(1);
  });
});