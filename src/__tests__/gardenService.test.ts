/**
 * Garden Service Tests
 * Tests for garden CRUD operations
 */
import { fetchGarden, createGarden, updateGarden, deleteGarden } from '../services/gardenService';
import { supabase } from '../services/supabase';
import { Garden, GardenFormData } from '../types/garden';

// Mock supabase
jest.mock('../services/supabase');

const mockUser = { id: 'test-user-123' };

describe('gardenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchGarden', () => {
    it('should fetch user garden', async () => {
      const mockGarden: Garden = {
        id: 'garden-1',
        user_id: mockUser.id,
        name: 'Mein Garten',
        description: 'Test garden',
        size: '50 m²',
        location: 'Hinterm Haus',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockGarden, error: null }),
          }),
        }),
      });

      const result = await fetchGarden();
      expect(result).toEqual(mockGarden);
    });

    it('should create default garden if none exists', async () => {
      const defaultGarden: Garden = {
        id: 'garden-2',
        user_id: mockUser.id,
        name: 'Mein Garten',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      // First call returns no rows (PGRST116 error)
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }),
        }),
      });

      // Second call (createGarden) returns the new garden
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: defaultGarden, error: null }),
          }),
        }),
      });

      const result = await fetchGarden();
      expect(result?.name).toBe('Mein Garten');
    });

    it('should handle errors when fetching garden', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      });

      await expect(fetchGarden()).rejects.toThrow();
    });
  });

  describe('createGarden', () => {
    it('should create a new garden', async () => {
      const newGarden: GardenFormData = {
        name: 'Neuer Garten',
        description: 'Ein neuer Garten',
        size: '100 m²',
        location: 'Vorne',
      };

      const created: Garden = {
        id: 'garden-3',
        user_id: mockUser.id,
        ...newGarden,
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser } });
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: created, error: null }),
          }),
        }),
      });

      const result = await createGarden(newGarden);
      expect(result).toEqual(created);
      expect(result.user_id).toBe(mockUser.id);
    });

    it('should throw error if user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });

      const newGarden: GardenFormData = { name: 'Test' };

      await expect(createGarden(newGarden)).rejects.toThrow('User must be logged in');
    });
  });

  describe('updateGarden', () => {
    it('should update garden metadata', async () => {
      const gardenId = 'garden-1';
      const updates: GardenFormData = {
        name: 'Aktualisierter Garten',
        size: '75 m²',
      };

      const updated: Garden = {
        id: gardenId,
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

      const result = await updateGarden(gardenId, updates);
      expect(result.name).toBe('Aktualisierter Garten');
      expect(result.size).toBe('75 m²');
    });

    it('should handle update errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'ERROR', message: 'Update failed' },
            }),
          }),
        }),
      });

      await expect(updateGarden('garden-1', { name: 'Test' })).rejects.toThrow();
    });
  });

  describe('deleteGarden', () => {
    it('should delete a garden', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      await expect(deleteGarden('garden-1')).resolves.not.toThrow();
    });

    it('should handle delete errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ 
            error: new Error('Delete failed') 
          }),
        }),
      });

      await expect(deleteGarden('garden-1')).rejects.toThrow();
    });
  });
});
