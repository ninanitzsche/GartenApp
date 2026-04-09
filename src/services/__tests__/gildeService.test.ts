import { fetchGilden, fetchGildeById, createGilde, fetchBeetGilden, addGildeToBed, removeGildeFromBed } from '../gildeService';

describe('gildeService', () => {
  describe('fetchGilden', () => {
    it('should be a function', () => {
      expect(typeof fetchGilden).toBe('function');
    });
  });

  describe('fetchGildeById', () => {
    it('should be a function', () => {
      expect(typeof fetchGildeById).toBe('function');
    });
  });

  describe('createGilde', () => {
    it('should be a function', () => {
      expect(typeof createGilde).toBe('function');
    });
  });

  describe('fetchBeetGilden', () => {
    it('should be a function', () => {
      expect(typeof fetchBeetGilden).toBe('function');
    });
  });

  describe('addGildeToBed', () => {
    it('should be a function', () => {
      expect(typeof addGildeToBed).toBe('function');
    });
  });

  describe('removeGildeFromBed', () => {
    it('should be a function', () => {
      expect(typeof removeGildeFromBed).toBe('function');
    });
  });
});