import {
  fetchPhotosForPlant,
  linkPhotoToPlant,
  unlinkPhotoFromPlant,
  setPlantCoverPhoto,
  uploadPhotoForPlant,
} from '../photoPlantService';

describe('photoPlantService', () => {
  describe('fetchPhotosForPlant', () => {
    it('should be a function', () => {
      expect(typeof fetchPhotosForPlant).toBe('function');
    });
  });

  describe('linkPhotoToPlant', () => {
    it('should be a function', () => {
      expect(typeof linkPhotoToPlant).toBe('function');
    });
  });

  describe('unlinkPhotoFromPlant', () => {
    it('should be a function', () => {
      expect(typeof unlinkPhotoFromPlant).toBe('function');
    });
  });

  describe('setPlantCoverPhoto', () => {
    it('should be a function', () => {
      expect(typeof setPlantCoverPhoto).toBe('function');
    });
  });

  describe('uploadPhotoForPlant', () => {
    it('should be a function', () => {
      expect(typeof uploadPhotoForPlant).toBe('function');
    });
  });
});