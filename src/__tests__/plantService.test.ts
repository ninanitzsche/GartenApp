/**
 * Plant Service Tests
 * Comprehensive test suite for plantService.ts
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as plantService from '../services/plantService';
import { supabase } from '../services/supabase';
import { mockPlant, mockUser, createMockQueryBuilder } from './mocks/supabaseMock';

// Mock the supabase module
jest.mock('../services/supabase');

describe('plantService', () => {
  const mockUserData = mockUser();
  const mockPlantData = mockPlant();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks for each test
    (supabase.auth.getUser as jest.Mock).mockClear();
    (supabase.from as jest.Mock).mockClear();
  });

  describe('fetchPlants', () => {
    it('should fetch all plants for current user', async () => {
      const plants = [
        mockPlant({ name: 'Tomato' }),
        mockPlant({ id: 'plant-2', name: 'Carrot' }),
      ];

      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({});

      expect(supabase.from).toHaveBeenCalledWith('plants');
      expect(result).toEqual(plants);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should apply search filter', async () => {
      const plants = [mockPlant({ name: 'Tomato', latin_name: 'Solanum lycopersicum' })];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({
        searchQuery: 'Tomato',
      });

      expect(mockBuilder.or).toHaveBeenCalled();
      expect(result).toEqual(plants);
    });

    it('should apply status filter with single status', async () => {
      const plants = [mockPlant({ status: 'gepflanzt' })];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({
        status: 'gepflanzt',
      });

      expect(mockBuilder.eq).toHaveBeenCalledWith('status', 'gepflanzt');
      expect(result).toEqual(plants);
    });

    it('should apply status filter with multiple statuses', async () => {
      const plants = [
        mockPlant({ status: 'gepflanzt' }),
        mockPlant({ id: 'plant-2', status: 'geerntet' }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({
        statuses: ['gepflanzt', 'geerntet'],
      });

      expect(mockBuilder.in).toHaveBeenCalledWith('status', ['gepflanzt', 'geerntet']);
      expect(result).toEqual(plants);
    });

    it('should apply location filter', async () => {
      const plants = [mockPlant({ location: 'Greenhouse' })];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({
        location: 'Greenhouse',
      });

      expect(mockBuilder.eq).toHaveBeenCalledWith('location', 'Greenhouse');
      expect(result).toEqual(plants);
    });

    it('should apply multiple location filter', async () => {
      const plants = [
        mockPlant({ location: 'Greenhouse' }),
        mockPlant({ id: 'plant-2', location: 'Garden' }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({
        locations: ['Greenhouse', 'Garden'],
      });

      expect(mockBuilder.in).toHaveBeenCalledWith('location', ['Greenhouse', 'Garden']);
      expect(result).toEqual(plants);
    });

    it('should apply type filter', async () => {
      const plants = [mockPlant({ type: 'einjährig' })];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({
        type: 'einjährig',
      });

      expect(mockBuilder.eq).toHaveBeenCalledWith('type', 'einjährig');
      expect(result).toEqual(plants);
    });

    it('should apply essbar filter', async () => {
      const plants = [mockPlant({ essbar: true })];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({
        essbar: true,
      });

      expect(mockBuilder.eq).toHaveBeenCalledWith('essbar', true);
      expect(result).toEqual(plants);
    });

    it('should apply combination of filters', async () => {
      const plants = [
        mockPlant({
          name: 'Tomato',
          status: 'gepflanzt',
          location: 'Greenhouse',
          essbar: true,
        }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({
        searchQuery: 'Tomato',
        status: 'gepflanzt',
        location: 'Greenhouse',
        essbar: true,
      });

      expect(result).toEqual(plants);
    });

    it('should handle empty results', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({});

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Database error');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(plantService.fetchPlants({})).rejects.toThrow();
    });

    it('should return empty array when data is null', async () => {
      const mockBuilder = createMockQueryBuilder(null);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({});

      expect(result).toEqual([]);
    });

    it('should handle fetch with all filter types combined', async () => {
      const plants = [
        mockPlant({
          name: 'Tomato Plant',
          latin_name: 'Solanum lycopersicum',
          status: 'gepflanzt',
          location: 'Greenhouse',
          type: 'einjährig',
          essbar: true,
        }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlants({
        searchQuery: 'Tomato',
        statuses: ['gepflanzt'],
        locations: ['Greenhouse'],
        type: 'einjährig',
        essbar: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Tomato Plant');
    });

    it('should order results by created_at descending', async () => {
      const plants = [mockPlantData];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await plantService.fetchPlants({});

      expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  describe('fetchPlant', () => {
    it('should fetch single plant by id', async () => {
      const plant = mockPlant({ id: 'plant-123' });
      const mockBuilder = createMockQueryBuilder([plant]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlant('plant-123');

      expect(supabase.from).toHaveBeenCalledWith('plants');
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', 'plant-123');
      expect(result).toEqual(plant);
    });

    it('should return null if plant not found', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.fetchPlant('non-existent');

      expect(result).toBeNull();
    });

    it('should handle errors when fetching single plant', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Plant not found');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(plantService.fetchPlant('plant-123')).rejects.toThrow();
    });
  });

  describe('createPlant', () => {
    it('should create plant with valid data', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const newPlant = mockPlant();
      const mockBuilder = createMockQueryBuilder([{ ...newPlant }]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const plantData = {
        name: 'Tomato',
        status: 'gepflanzt',
        location: 'Greenhouse',
      };

      const result = await plantService.createPlant(plantData);

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('plants');
      expect(mockBuilder.insert).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw error if user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const plantData = {
        name: 'Tomato',
        status: 'gepflanzt',
      };

      await expect(plantService.createPlant(plantData)).rejects.toThrow(
        'User must be logged in'
      );
    });

    it('should include user_id in created plant', async () => {
      const userId = 'user-123';
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: userId } },
      });

      const newPlant = mockPlant({ user_id: userId });
      const mockBuilder = createMockQueryBuilder([newPlant]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const plantData = {
        name: 'Tomato',
        status: 'gepflanzt',
      };

      const result = await plantService.createPlant(plantData);

      expect(result.user_id).toBe(userId);
    });

    it('should handle database errors during creation', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: new Error('Insert failed') 
            }),
          }),
        }),
      });

      const plantData = {
        name: 'Tomato',
        status: 'gepflanzt',
      };

      await expect(plantService.createPlant(plantData)).rejects.toThrow();
    });
  });

  describe('updatePlant', () => {
    it('should update plant fields', async () => {
      const updatedPlant = mockPlant({
        id: 'plant-1',
        name: 'Updated Tomato',
      });
      const mockBuilder = createMockQueryBuilder([updatedPlant]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.updatePlant('plant-1', {
        name: 'Updated Tomato',
        status: 'gepflanzt',
      });

      expect(supabase.from).toHaveBeenCalledWith('plants');
      expect(mockBuilder.update).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', 'plant-1');
      expect(result.name).toBe('Updated Tomato');
    });

    it('should handle errors during update', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Update failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(
        plantService.updatePlant('plant-1', {
          name: 'Updated',
          status: 'gepflanzt',
        })
      ).rejects.toThrow();
    });

    it('should handle partial updates', async () => {
      const plant = mockPlant({ id: 'plant-1' });
      const mockBuilder = createMockQueryBuilder([plant]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.updatePlant('plant-1', {
        notes: 'Updated notes only',
      });

      expect(result).toHaveProperty('id');
    });
  });

  describe('deletePlant', () => {
    it('should delete plant by id', async () => {
      const mockBuilder = createMockQueryBuilder();
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await plantService.deletePlant('plant-1');

      expect(supabase.from).toHaveBeenCalledWith('plants');
      expect(mockBuilder.delete).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', 'plant-1');
    });

    it('should handle errors during deletion', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Delete failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(plantService.deletePlant('plant-1')).rejects.toThrow();
    });

    it('should handle non-existent plant deletion', async () => {
      const mockBuilder = createMockQueryBuilder();
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      // Should not throw for non-existent plant (Supabase behavior)
      await plantService.deletePlant('non-existent');

      expect(mockBuilder.delete).toHaveBeenCalled();
    });
  });

  describe('searchPlants', () => {
    it('should search plants by name', async () => {
      const plants = [mockPlant({ name: 'Tomato' })];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.searchPlants('Tomato');

      expect(supabase.from).toHaveBeenCalledWith('plants');
      expect(mockBuilder.ilike).toHaveBeenCalledWith('name', '%Tomato%');
      expect(result).toEqual(plants);
    });

    it('should handle empty search results', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.searchPlants('NonExistent');

      expect(result).toEqual([]);
    });

    it('should order search results alphabetically', async () => {
      const plants = [
        mockPlant({ name: 'Apple' }),
        mockPlant({ id: 'plant-2', name: 'Banana' }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await plantService.searchPlants('a');

      expect(mockBuilder.order).toHaveBeenCalledWith('name', { ascending: true });
    });

    it('should handle search errors', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Search failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(plantService.searchPlants('Tomato')).rejects.toThrow();
    });
  });

  describe('filterPlantsByStatus', () => {
    it('should filter plants by status', async () => {
      const plants = [
        mockPlant({ status: 'gepflanzt' }),
        mockPlant({ id: 'plant-2', status: 'gepflanzt' }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.filterPlantsByStatus('gepflanzt');

      expect(supabase.from).toHaveBeenCalledWith('plants');
      expect(mockBuilder.eq).toHaveBeenCalledWith('status', 'gepflanzt');
      expect(result).toEqual(plants);
    });

    it('should handle no plants with status', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.filterPlantsByStatus('non-existent-status');

      expect(result).toEqual([]);
    });

    it('should order results by created_at descending', async () => {
      const plants = [mockPlantData];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await plantService.filterPlantsByStatus('gepflanzt');

      expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should handle filter errors', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Filter failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(plantService.filterPlantsByStatus('status')).rejects.toThrow();
    });
  });

  describe('getUniqueLocations', () => {
    it('should get unique locations from all plants', async () => {
      const plants = [
        mockPlant({ location: 'Greenhouse' }),
        mockPlant({ id: 'plant-2', location: 'Greenhouse' }),
        mockPlant({ id: 'plant-3', location: 'Garden' }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.getUniqueLocations();

      expect(mockBuilder.not).toHaveBeenCalledWith('location', 'is', null);
      // Should have unique locations
      expect(result).toContain('Garden');
      expect(result).toContain('Greenhouse');
    });

    it('should handle no locations', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.getUniqueLocations();

      expect(result).toEqual([]);
    });

    it('should sort locations alphabetically', async () => {
      const plants = [
        mockPlant({ location: 'Zebra Zone' }),
        mockPlant({ id: 'plant-2', location: 'Apple Garden' }),
        mockPlant({ id: 'plant-3', location: 'Banana Field' }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.getUniqueLocations();

      expect(result[0]).toBe('Apple Garden');
      expect(result[1]).toBe('Banana Field');
      expect(result[2]).toBe('Zebra Zone');
    });

    it('should filter out null locations', async () => {
      const plants = [
        mockPlant({ location: 'Greenhouse' }),
        mockPlant({ id: 'plant-2', location: null }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.getUniqueLocations();

      expect(result).not.toContain(null);
    });

    it('should handle location retrieval errors', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Location fetch failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(plantService.getUniqueLocations()).rejects.toThrow();
    });

    it('should deduplicate locations correctly', async () => {
      const plants = [
        mockPlant({ location: 'A' }),
        mockPlant({ id: 'plant-2', location: 'B' }),
        mockPlant({ id: 'plant-3', location: 'A' }),
        mockPlant({ id: 'plant-4', location: 'C' }),
        mockPlant({ id: 'plant-5', location: 'B' }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.getUniqueLocations();

      expect(result).toEqual(['A', 'B', 'C']);
      expect(result.length).toBe(3);
    });

    it('should handle single location', async () => {
      const plants = [
        mockPlant({ location: 'Only Location' }),
        mockPlant({ id: 'plant-2', location: 'Only Location' }),
      ];
      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await plantService.getUniqueLocations();

      expect(result).toEqual(['Only Location']);
    });
  });
});
