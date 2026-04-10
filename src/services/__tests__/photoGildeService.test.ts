import {
  fetchPhotosForGilde,
  linkPhotoToGilde,
  unlinkPhotoFromGilde,
  setGildeCoverPhoto,
  uploadPhotoForGilde,
} from '../photoGildeService';

describe('photoGildeService', () => {
  describe('fetchPhotosForGilde', () => {
    it('should be a function', () => {
      expect(typeof fetchPhotosForGilde).toBe('function');
    });
  });

  describe('linkPhotoToGilde', () => {
    it('should be a function', () => {
      expect(typeof linkPhotoToGilde).toBe('function');
    });
  });

  describe('unlinkPhotoFromGilde', () => {
    it('should be a function', () => {
      expect(typeof unlinkPhotoFromGilde).toBe('function');
    });
  });

  describe('setGildeCoverPhoto', () => {
    it('should be a function', () => {
      expect(typeof setGildeCoverPhoto).toBe('function');
    });
  });

  describe('uploadPhotoForGilde', () => {
    it('should be a function', () => {
      expect(typeof uploadPhotoForGilde).toBe('function');
    });
  });
});