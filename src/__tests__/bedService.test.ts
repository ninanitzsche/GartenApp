// @ts-nocheck
/**
 * Bed Service Tests
 * Tests for bed CRUD operations and plant linking
 */
import {
  fetchBeds,
  fetchBed,
  createBed,
  updateBed,
  deleteBed,
  linkBedToPlant,
  unlinkBedFromPlant,
  fetchBedPlants,
  getBedPlantCount,
} from '../services/bedService';
import { supabase } from '../services/supabase';
import { Bed, BedFormData } from '../types/bed';
import { Plant } from '../types/plant';

jest.mock('../services/supabase');

const mockUser = { id: 'test-user-123' };
const mockGardenId = 'garden-1';

describe('bedService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchBeds', () => {
    it('should fetch all beds for user', async () => {
      const mockBeds: Bed[] = [
        {
          id: 'bed-1',
          user_id: mockUser.id,
          garden_id: mockGardenId,
          name: 'Hochbeet 1',
          position_x: 20,
          position_y: 30,
          width: 25,
          height: 20,
          color: '#4CAF50',
          shape: 'rectangle',
        },
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockBeds, error: null }),
          }),
        }),
      });

      const result = await fetchBeds();
      expect(result).toEqual(mockBeds);
      expect(result.length).toBe(1);
    });

    it('should fetch beds for specific garden', async () => {
      const mockBeds: Bed[] = [
        {
          id: 'bed-1',
          user_id: mockUser.id,
          garden_id: mockGardenId,
          name: 'Beet 1',
          position_x: 50,
          position_y: 50,
          width: 30,
          height: 25,
          color: '#8D6E63',
        },
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn()
            .mockReturnValueOnce({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockBeds, error: null }),
              }),
            }),
        }),
      });

      const result = await fetchBeds(mockGardenId);
      expect(result).toEqual(mockBeds);
    });

    it('should return empty array when no beds exist', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const result = await fetchBeds();
      expect(result).toEqual([]);
    });
  });

  describe('fetchBed', () => {
    it('should fetch single bed by ID', async () => {
      const mockBed: Bed = {
        id: 'bed-1',
        user_id: mockUser.id,
        garden_id: mockGardenId,
        name: 'Test Beet',
        position_x: 25,
        position_y: 35,
        width: 20,
        height: 15,
        color: '#2196F3',
        shape: 'circle',
        notes: 'In der Sonne',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockBed, error: null }),
          }),
        }),
      });

      const result = await fetchBed('bed-1');
      expect(result).toEqual(mockBed);
    });
  });

  describe('createBed', () => {
    it('should create a new bed', async () => {
      const bedData: BedFormData = {
        name: 'Neues Beet',
        position_x: 50,
        position_y: 50,
        width: 30,
        height: 20,
        color: '#FF9800',
        shape: 'rectangle',
        notes: 'Halbschatten',
      };

      const created: Bed = {
        id: 'bed-2',
        user_id: mockUser.id,
        ...bedData,
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: created, error: null }),
          }),
        }),
      });

      const result = await createBed(bedData);
      expect(result).toEqual(created);
      expect(result.user_id).toBe(mockUser.id);
    });

    it('should throw error if user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      const bedData: BedFormData = { name: 'Test' };

      await expect(createBed(bedData)).rejects.toThrow('User must be logged in');
    });
  });

  describe('updateBed', () => {
    it('should update bed properties', async () => {
      const bedId = 'bed-1';
      const updates: BedFormData = {
        name: 'Aktualisiertes Beet',
        position_x: 40,
        position_y: 45,
        width: 25,
        height: 18,
      };

      const updated: Bed = {
        id: bedId,
        user_id: mockUser.id,
        ...updates,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updated, error: null }),
            }),
          }),
        }),
      });

      const result = await updateBed(bedId, updates);
      expect(result.name).toBe('Aktualisiertes Beet');
      expect(result.position_x).toBe(40);
    });
  });

  describe('deleteBed', () => {
    it('should delete a bed', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await expect(deleteBed('bed-1')).resolves.not.toThrow();
    });
  });

  describe('linkBedToPlant', () => {
    it('should link plant to bed', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      });

      await expect(linkBedToPlant('bed-1', 'plant-1')).resolves.not.toThrow();
    });

    it('should handle linking errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ 
            data: null, 
            error: new Error('Link failed') 
          }),
        }),
      });

      await expect(linkBedToPlant('bed-1', 'plant-1')).rejects.toThrow();
    });
  });

  describe('unlinkBedFromPlant', () => {
    it('should unlink plant from bed', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      await expect(unlinkBedFromPlant('bed-1', 'plant-1')).resolves.not.toThrow();
    });
  });

  describe('fetchBedPlants', () => {
    it('should fetch all plants in a bed', async () => {
      const mockPlants: Plant[] = [
        {
          id: 'plant-1',
          user_id: mockUser.id,
          name: 'Tomate',
          status: 'ausgepflanzt',
          location: 'Hochbeet 1',
        },
      ];

      // First call gets bed_plants IDs
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [{ plant_id: 'plant-1' }],
              error: null,
            }),
          }),
        })
        // Second call gets plant details
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: mockPlants, error: null }),
          }),
        });

      const result = await fetchBedPlants('bed-1');
      expect(result).toEqual(mockPlants);
      expect(result.length).toBe(1);
    });

    it('should return empty array when bed has no plants', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await fetchBedPlants('bed-1');
      expect(result).toEqual([]);
    });
  });

  describe('getBedPlantCount', () => {
    it('should get count of plants in bed', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [{}, {}, {}], error: null, count: 3 }),
        }),
      });

      const result = await getBedPlantCount('bed-1');
      expect(result).toBe(3);
    });

    it('should return 0 when no plants in bed', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        }),
      });

      const result = await getBedPlantCount('bed-1');
      expect(result).toBe(0);
    });
  });
});
