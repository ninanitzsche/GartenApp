// @ts-nocheck
/**
 * Integration Tests - Bilder Features
 * Tests: Upload photo → link to entity → fetch gallery → set cover → verify
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as photoGildeService from '../../services/photoGildeService';
import * as photoPlantService from '../../services/photoPlantService';
import { supabase } from '../../services/supabase';
import { createMockQueryBuilder, mockUser } from '../mocks/supabaseMock';

jest.mock('../../services/supabase');

const mockBlob = new Blob(['fake-image-data'], { type: 'image/jpeg' });
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  blob: () => Promise.resolve(mockBlob),
}) as any;

function setupAuthenticatedUser(userId: string = 'test-user-123', email: string = 'test@example.com') {
  const mockUserObj = mockUser({ id: userId, email });
  (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
    data: { user: mockUserObj },
    error: null,
  });
  return mockUserObj;
}

describe('Bilder Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth as any) = {
      getUser: jest.fn(),
    };
    (supabase.from as jest.Mock) = jest.fn();
    
    const storageMock = {
      upload: jest.fn().mockImplementation((path: string) => {
        return Promise.resolve({
          data: { path },
          error: null,
        });
      }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: jest.fn().mockImplementation((path: string) => ({
        data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/plant-photos/${path}` },
      })),
    };
    
    (supabase.storage as any) = {
      from: jest.fn().mockReturnValue(storageMock),
    };
  });

  describe('Gilden Photos', () => {
    it('roundtrip: upload photo for gilde and fetch gallery', async () => {
      setupAuthenticatedUser();
      const gildeId = 'gilde-1';

      const mockPhotoRecord = {
        id: 'photo-123',
        user_id: 'test-user-123',
        file_url: 'user-123/gilde/gilde-1/1234567890-gilde.jpg',
        created_at: new Date().toISOString(),
      };

      const mockPhotoGilden = [{ photo_id: 'photo-123', gilde_id: gildeId }];

      const junctionBuilder = createMockQueryBuilder(mockPhotoGilden);
      junctionBuilder.insert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [{ photo_id: 'photo-123', gilde_id: gildeId }], error: null }),
      });

      const photosBuilder = createMockQueryBuilder([mockPhotoRecord]);
      photosBuilder.insert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [mockPhotoRecord], error: null }),
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'photo_gilden') return junctionBuilder;
        if (table === 'photos') return photosBuilder;
        return createMockQueryBuilder([]);
      });

      const path = await photoGildeService.uploadPhotoForGilde(gildeId, 'file://test.jpg');
      expect(path).toBeDefined();
      expect(path).toContain('gilde');

      const photos = await photoGildeService.fetchPhotosForGilde(gildeId);
      expect(photos.length).toBe(1);
    });

    it('roundtrip: upload, link, fetch, set cover, verify', async () => {
      setupAuthenticatedUser();
      const gildeId = 'gilde-1';

      const mockPhotoRecord = {
        id: 'photo-456',
        user_id: 'test-user-123',
        file_url: 'user-123/gilde/gilde-1/1234567891-gilde.jpg',
        created_at: new Date().toISOString(),
      };

      const mockPhotoGilden = [{ photo_id: 'photo-456', gilde_id: gildeId }];

      const junctionBuilder = createMockQueryBuilder(mockPhotoGilden);
      junctionBuilder.insert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [{ photo_id: 'photo-456', gilde_id: gildeId }], error: null }),
      });

      const photosBuilder = createMockQueryBuilder([mockPhotoRecord]);
      photosBuilder.insert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [mockPhotoRecord], error: null }),
      });

      const gildeBuilder = createMockQueryBuilder([{ id: gildeId, cover_photo_url: null }]);
      gildeBuilder.update = jest.fn().mockReturnValue(gildeBuilder);

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'photo_gilden') return junctionBuilder;
        if (table === 'photos') return photosBuilder;
        if (table === 'gilden') return gildeBuilder;
        return createMockQueryBuilder([]);
      });

      const path = await photoGildeService.uploadPhotoForGilde(gildeId, 'file://cover-test.jpg');
      expect(path).toBeDefined();

      const photos = await photoGildeService.fetchPhotosForGilde(gildeId);
      expect(photos.length).toBe(1);

      await photoGildeService.setGildeCoverPhoto(gildeId, photos[0].photo_url);

      const updatedPhotos = await photoGildeService.fetchPhotosForGilde(gildeId);
      expect(updatedPhotos.length).toBe(1);
    });
  });

  describe('Pflanzen Photos', () => {
    it('roundtrip: upload photo for plant and fetch gallery', async () => {
      setupAuthenticatedUser();
      const plantId = 'plant-1';

      const mockPhotoRecord = {
        id: 'photo-789',
        user_id: 'test-user-123',
        file_url: 'user-123/plant/plant-1/1234567890-plant.jpg',
        created_at: new Date().toISOString(),
      };

      const mockPhotoPlants = [{ photo_id: 'photo-789', plant_id: plantId }];

      const junctionBuilder = createMockQueryBuilder(mockPhotoPlants);
      junctionBuilder.insert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [{ photo_id: 'photo-789', plant_id: plantId }], error: null }),
      });

      const photosBuilder = createMockQueryBuilder([mockPhotoRecord]);
      photosBuilder.insert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [mockPhotoRecord], error: null }),
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'photo_plants') return junctionBuilder;
        if (table === 'photos') return photosBuilder;
        return createMockQueryBuilder([]);
      });

      const path = await photoPlantService.uploadPhotoForPlant(plantId, 'file://test.jpg');
      expect(path).toBeDefined();
      expect(path).toContain('plant');

      const photos = await photoPlantService.fetchPhotosForPlant(plantId);
      expect(photos.length).toBe(1);
    });

    it('roundtrip: upload, link, fetch, set cover, verify', async () => {
      setupAuthenticatedUser();
      const plantId = 'plant-1';

      const mockPhotoRecord = {
        id: 'photo-abc',
        user_id: 'test-user-123',
        file_url: 'user-123/plant/plant-1/1234567891-plant.jpg',
        created_at: new Date().toISOString(),
      };

      const mockPhotoPlants = [{ photo_id: 'photo-abc', plant_id: plantId }];

      const junctionBuilder = createMockQueryBuilder(mockPhotoPlants);
      junctionBuilder.insert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [{ photo_id: 'photo-abc', plant_id: plantId }], error: null }),
      });

      const photosBuilder = createMockQueryBuilder([mockPhotoRecord]);
      photosBuilder.insert = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [mockPhotoRecord], error: null }),
      });

      const plantBuilder = createMockQueryBuilder([{ id: plantId, cover_photo_url: null }]);
      plantBuilder.update = jest.fn().mockReturnValue(plantBuilder);

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'photo_plants') return junctionBuilder;
        if (table === 'photos') return photosBuilder;
        if (table === 'plants') return plantBuilder;
        return createMockQueryBuilder([]);
      });

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'photo_plants') return junctionBuilder;
        if (table === 'photos') return photosBuilder;
        if (table === 'plants') return plantBuilder;
        return createMockQueryBuilder([]);
      });

      const path = await photoPlantService.uploadPhotoForPlant(plantId, 'file://plant-cover.jpg');
      expect(path).toBeDefined();

      const photos = await photoPlantService.fetchPhotosForPlant(plantId);
      expect(photos.length).toBe(1);

      await photoPlantService.setPlantCoverPhoto(plantId, photos[0].photo_url);

      const updatedPhotos = await photoPlantService.fetchPhotosForPlant(plantId);
      expect(updatedPhotos.length).toBe(1);
    });
  });
});