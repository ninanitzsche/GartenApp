/**
 * Photo Service Tests
 * Tests for photo CRUD operations
 */

import {
  fetchPhotos,
  fetchPhoto,
  deletePhoto,
  getPublicPhotoUrl,
} from '../services/photoService';

jest.mock('../services/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
    storage: { from: jest.fn() },
  },
}));

import { supabase } from '../services/supabase';

describe('photoService', () => {
  const mockPhotoId = 'photo-123';
  const mockPlantId = 'plant-123';
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.skip('fetchPhotos', () => {
    it('should fetch photos for a plant', async () => {
      const mockPhoto = { id: mockPhotoId, file_url: 'test.jpg' };
      const mockPhotoPlant = { photo_id: mockPhotoId };

      const builder1 = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      builder1.eq.mockResolvedValue({ data: [mockPhotoPlant], error: null });

      const builder2 = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      builder2.order.mockResolvedValue({ data: [mockPhoto], error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(builder1)
        .mockReturnValueOnce(builder2);

      const result = await fetchPhotos(mockPlantId);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle errors when fetching photos', async () => {
      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      builder.eq.mockRejectedValue(new Error('DB error'));

      (supabase.from as jest.Mock).mockReturnValueOnce(builder);

      await expect(fetchPhotos(mockPlantId)).rejects.toThrow();
    });

    it('should return empty array when no photos exist', async () => {
      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      builder.eq.mockResolvedValue({ data: [], error: null });

      (supabase.from as jest.Mock).mockReturnValueOnce(builder);

      const result = await fetchPhotos(mockPlantId);
      expect(result).toEqual([]);
    });
  });

  describe.skip('fetchPhoto', () => {
    it('should fetch a single photo by ID', async () => {
      const mockPhoto = { id: mockPhotoId, file_url: 'test.jpg' };
      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
      };
      builder.single.mockResolvedValue({ data: mockPhoto, error: null });

      (supabase.from as jest.Mock).mockReturnValueOnce(builder);

      const result = await fetchPhoto(mockPhotoId);
      expect(result).toBeDefined();
    });

    it('should handle error when fetching single photo', async () => {
      const builder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
      };
      builder.single.mockRejectedValue(new Error('Not found'));

      (supabase.from as jest.Mock).mockReturnValueOnce(builder);

      await expect(fetchPhoto(mockPhotoId)).rejects.toThrow();
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo from database', async () => {
      const builder = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      builder.eq.mockResolvedValue({ error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(builder)
        .mockReturnValueOnce(builder);

      await expect(deletePhoto(mockPhotoId)).resolves.toBeUndefined();
    });

    it('should handle database delete error', async () => {
      const builder = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      builder.eq.mockRejectedValue(new Error('DB error'));

      (supabase.from as jest.Mock).mockReturnValueOnce(builder);

      await expect(deletePhoto(mockPhotoId)).rejects.toThrow();
    });
  });

  describe('getPublicPhotoUrl', () => {
    it('should return public URL for photo', () => {
      const mockStorage = {
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/photo.jpg' },
        }),
      };

      (supabase.storage.from as jest.Mock).mockReturnValueOnce(mockStorage);

      const result = getPublicPhotoUrl('photo.jpg');
      expect(result).toBe('https://example.com/photo.jpg');
    });
  });
});
