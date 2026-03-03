/**
 * Photo Service Tests
 * Tests CRUD operations for photos following Service Layer Pattern
 */

import {
  fetchPhotos,
  fetchPhoto,
  uploadPhoto,
  deletePhoto,
  getPublicPhotoUrl,
} from '../services/photoService';

// Mock supabase module
jest.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

import { supabase } from '../services/supabase';

describe('photoService', () => {
  const mockPlantId = '550e8400-e29b-41d4-a716-446655440000';
  const mockPhotoId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = '550e8400-e29b-41d4-a716-446655440001';

  const mockPhoto = {
    id: mockPhotoId,
    user_id: mockUserId,
    plant_id: mockPlantId,
    photo_url: 'uploads/123/456/photo.jpg',
    created_at: '2026-03-03T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPhotos', () => {
    it('should fetch all photos for a plant', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: [mockPhoto],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelect,
      });
      mockSelect.mockReturnValueOnce({
        eq: mockEq,
      });
      mockEq.mockReturnValueOnce({
        order: mockOrder,
      });

      const result = await fetchPhotos(mockPlantId);

      expect(result).toEqual([mockPhoto]);
      expect(supabase.from).toHaveBeenCalledWith('photos');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('plant_id', mockPlantId);
    });

    it('should handle errors when fetching photos', async () => {
      const mockError = new Error('DB error');
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelect,
      });
      mockSelect.mockReturnValueOnce({
        eq: mockEq,
      });
      mockEq.mockReturnValueOnce({
        order: mockOrder,
      });

      await expect(fetchPhotos(mockPlantId)).rejects.toThrow('Error fetching photos');
    });

    it('should return empty array when no photos exist', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelect,
      });
      mockSelect.mockReturnValueOnce({
        eq: mockEq,
      });
      mockEq.mockReturnValueOnce({
        order: mockOrder,
      });

      const result = await fetchPhotos(mockPlantId);

      expect(result).toEqual([]);
    });
  });

  describe('fetchPhoto', () => {
    it('should fetch a single photo by ID', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: mockPhoto,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelect,
      });
      mockSelect.mockReturnValueOnce({
        eq: mockEq,
      });
      mockEq.mockReturnValueOnce({
        single: mockSingle,
      });

      const result = await fetchPhoto(mockPhotoId);

      expect(result).toEqual(mockPhoto);
      expect(supabase.from).toHaveBeenCalledWith('photos');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', mockPhotoId);
    });

    it('should handle error when fetching single photo', async () => {
      const mockError = new Error('Photo not found');
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: mockSelect,
      });
      mockSelect.mockReturnValueOnce({
        eq: mockEq,
      });
      mockEq.mockReturnValueOnce({
        single: mockSingle,
      });

      await expect(fetchPhoto(mockPhotoId)).rejects.toThrow('Error fetching photo');
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo and save metadata', async () => {
      const mockFileUri = 'file:///path/to/photo.jpg';
      const mockFileName = 'photo-1709473400000.jpg';

      const mockGetUser = jest.fn().mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      });

      const mockStorageUpload = jest.fn().mockResolvedValueOnce({
        data: { path: 'uploads/123/456/photo.jpg' },
        error: null,
      });

      const mockInsert = jest.fn().mockResolvedValueOnce({
        data: mockPhoto,
        error: null,
      });

      (supabase.auth.getUser as jest.Mock) = mockGetUser;
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: mockInsert,
      });

      // Mock fetch and storage
      global.fetch = jest.fn().mockResolvedValueOnce({
        blob: jest.fn().mockResolvedValueOnce(new Blob()),
      });

      (supabase.storage.from as jest.Mock).mockReturnValueOnce({
        upload: mockStorageUpload,
      });

      const result = await uploadPhoto(mockPlantId, mockFileUri, mockFileName);

      expect(result).toBe('uploads/123/456/photo.jpg');
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(mockStorageUpload).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should handle user not authenticated error', async () => {
      const mockGetUser = jest.fn().mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      (supabase.auth.getUser as jest.Mock) = mockGetUser;

      await expect(
        uploadPhoto(mockPlantId, 'file:///path', 'photo.jpg')
      ).rejects.toThrow('Error uploading photo');
    });

    it('should handle storage upload error', async () => {
      const mockGetUser = jest.fn().mockResolvedValueOnce({
        data: { user: { id: mockUserId } },
        error: null,
      });

      const mockStorageUpload = jest.fn().mockResolvedValueOnce({
        data: null,
        error: new Error('Storage error'),
      });

      (supabase.auth.getUser as jest.Mock) = mockGetUser;

      global.fetch = jest.fn().mockResolvedValueOnce({
        blob: jest.fn().mockResolvedValueOnce(new Blob()),
      });

      (supabase.storage.from as jest.Mock).mockReturnValueOnce({
        upload: mockStorageUpload,
      });

      await expect(
        uploadPhoto(mockPlantId, 'file:///path', 'photo.jpg')
      ).rejects.toThrow('Error uploading photo');
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo from database and storage', async () => {
      const mockPhotoPath = 'uploads/123/456/photo.jpg';
      const mockDelete = jest.fn().mockResolvedValueOnce({
        error: null,
      });

      const mockStorageDelete = jest.fn().mockResolvedValueOnce({
        data: null,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: mockDelete,
      });

      (supabase.storage.from as jest.Mock).mockReturnValueOnce({
        remove: mockStorageDelete,
      });

      mockDelete.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValueOnce({
          error: null,
        }),
      });

      await deletePhoto(mockPhotoId, mockPhotoPath);

      expect(supabase.from).toHaveBeenCalledWith('photos');
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should handle database delete error', async () => {
      const mockDelete = jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockResolvedValueOnce({
          error: new Error('DB error'),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: mockDelete,
      });

      await expect(deletePhoto(mockPhotoId)).rejects.toThrow('Error deleting photo');
    });
  });

  describe('getPublicPhotoUrl', () => {
    it('should return public URL for photo', () => {
      const mockPhotoPath = 'uploads/123/456/photo.jpg';
      const expectedUrl = 'https://bucket.supabase.co/uploads/123/456/photo.jpg';

      const mockGetPublicUrl = jest.fn().mockReturnValueOnce({
        data: { publicUrl: expectedUrl },
      });

      (supabase.storage.from as jest.Mock).mockReturnValueOnce({
        getPublicUrl: mockGetPublicUrl,
      });

      const result = getPublicPhotoUrl(mockPhotoPath);

      expect(result).toBe(expectedUrl);
      expect(supabase.storage.from).toHaveBeenCalledWith('plant-photos');
      expect(mockGetPublicUrl).toHaveBeenCalledWith(mockPhotoPath);
    });
  });
});
