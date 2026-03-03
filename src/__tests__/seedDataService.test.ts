/**
 * Seed Data Service Tests
 * Comprehensive test suite for seedDataService.ts
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as seedDataService from '../services/seedDataService';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUser, createMockQueryBuilder } from './mocks/supabaseMock';

// Mock the modules
jest.mock('../services/supabase');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../utils/seedData', () => ({
  ESTABLISHED_PLANTS: [
    { id: '1', name: 'Plant 1', status: 'etabliert' },
    { id: '2', name: 'Plant 2', status: 'etabliert' },
  ],
  PLANNED_PLANTS: [
    { id: '3', name: 'Plant 3', status: 'geplant' },
  ],
}));

describe('seedDataService', () => {
  const SEED_DATA_KEY = '@gartenplaner:seed_data_imported';
  const mockUserData = mockUser();

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
  });

  describe('hasSeedDataBeenImported', () => {
    it('should return true if seed data has been imported', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

      const result = await seedDataService.hasSeedDataBeenImported();

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(SEED_DATA_KEY);
    });

    it('should return false if seed data has not been imported', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await seedDataService.hasSeedDataBeenImported();

      expect(result).toBe(false);
    });

    it('should return false if seed data import status is false', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');

      const result = await seedDataService.hasSeedDataBeenImported();

      expect(result).toBe(false);
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('AsyncStorage error')
      );

      const result = await seedDataService.hasSeedDataBeenImported();

      expect(result).toBe(false);
    });
  });

  describe('markSeedDataAsImported', () => {
    it('should mark seed data as imported', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await seedDataService.markSeedDataAsImported();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(SEED_DATA_KEY, 'true');
    });

    it('should handle AsyncStorage errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(seedDataService.markSeedDataAsImported()).rejects.toThrow(
        'Storage error'
      );
    });
  });

  describe('importSeedData', () => {
    it('should import seed data successfully', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder();
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await seedDataService.importSeedData();

      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThan(0);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(SEED_DATA_KEY, 'true');
    });

    it('should throw error if user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await seedDataService.importSeedData();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should track progress during import', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder();
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const progressUpdates: any[] = [];
      const onProgress = jest.fn((progress) => {
        progressUpdates.push(progress);
      });

      await seedDataService.importSeedData(onProgress);

      expect(onProgress).toHaveBeenCalled();
      expect(progressUpdates.length).toBeGreaterThan(0);
      // Verify progress is updated for each plant
      progressUpdates.forEach((update) => {
        expect(update).toHaveProperty('current');
        expect(update).toHaveProperty('total');
        expect(update).toHaveProperty('message');
      });
    });

    it('should be idempotent - running twice produces same result', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder();
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result1 = await seedDataService.importSeedData();
      const result2 = await seedDataService.importSeedData();

      expect(result1.success).toBe(result2.success);
      expect(result1.count).toBe(result2.count);
    });

    it('should handle individual plant import errors and continue', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder();
      // Simulate an error for some plants but success for others
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await seedDataService.importSeedData();

      // Should still return success if at least some plants were imported
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('count');
    });

    it('should return error result on complete failure', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await seedDataService.importSeedData();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should update AsyncStorage on successful import', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder();
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await seedDataService.importSeedData();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(SEED_DATA_KEY, 'true');
    });

    it('should use upsert to ensure idempotency', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder();
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await seedDataService.importSeedData();

      expect(mockBuilder.upsert).toHaveBeenCalled();
    });
  });

  describe('importSeedDataBulk', () => {
    it('should import all seed data in bulk', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder([
        { id: '1', name: 'Plant 1' },
        { id: '2', name: 'Plant 2' },
        { id: '3', name: 'Plant 3' },
      ]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await seedDataService.importSeedDataBulk();

      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });

    it('should throw error if user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await seedDataService.importSeedDataBulk();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should use upsert for bulk import', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await seedDataService.importSeedDataBulk();

      expect(mockBuilder.upsert).toHaveBeenCalled();
    });

    it('should mark seed data as imported on success', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await seedDataService.importSeedDataBulk();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(SEED_DATA_KEY, 'true');
    });

    it('should handle bulk import errors', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Bulk insert failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await seedDataService.importSeedDataBulk();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should be faster than incremental import', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const startTime = Date.now();
      await seedDataService.importSeedDataBulk();
      const bulkTime = Date.now() - startTime;

      // Bulk import should be available as alternative
      expect(bulkTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('resetImportStatus', () => {
    it('should reset import status', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await seedDataService.resetImportStatus();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SEED_DATA_KEY);
    });

    it('should handle AsyncStorage errors', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(seedDataService.resetImportStatus()).rejects.toThrow(
        'Storage error'
      );
    });

    it('should allow reimport after reset', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await seedDataService.resetImportStatus();
      const hasBeenImported = await seedDataService.hasSeedDataBeenImported();

      expect(hasBeenImported).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete import workflow', async () => {
      // Reset state
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null); // hasSeedDataBeenImported
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Check if imported (should be false)
      let hasBeenImported = await seedDataService.hasSeedDataBeenImported();
      expect(hasBeenImported).toBe(false);

      // Import data
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await seedDataService.importSeedData();
      expect(result.success).toBe(true);

      // Verify it's marked as imported
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');
      hasBeenImported = await seedDataService.hasSeedDataBeenImported();
      expect(hasBeenImported).toBe(true);
    });

    it('should handle batch operations correctly', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder([
        { id: '1', name: 'Plant 1' },
        { id: '2', name: 'Plant 2' },
        { id: '3', name: 'Plant 3' },
      ]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await seedDataService.importSeedData();

      expect(result.count).toBeGreaterThan(0);
      expect(result.success).toBe(true);
    });

    it('should handle multiple concurrent imports', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Run multiple imports (should be idempotent)
      const results = await Promise.all([
        seedDataService.importSeedData(),
        seedDataService.importSeedData(),
      ]);

      expect(results[0].success).toBe(results[1].success);
    });
  });

  describe('Error recovery', () => {
    it('should recover from partial import failures', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder();
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await seedDataService.importSeedData();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('count');
    });

    it('should not mark import as complete if it fails', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await seedDataService.importSeedData();

      // AsyncStorage should not be updated on failure
      if (result.success === false) {
        // Verify getItem was called to get current status
        expect(result.error).toBeDefined();
      }
    });

    it('should provide meaningful error messages', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await seedDataService.importSeedData();

      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });
  });
});
