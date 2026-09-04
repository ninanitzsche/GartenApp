import { 
  fetchGilden, 
  fetchGildeById, 
  createGilde, 
  fetchBeetGilden, 
  addGildeToBed, 
  removeGildeFromBed,
  getSuggestedGilden,
  fetchRating,
  upsertRating,
  updateGilde,
  deleteGilde,
} from '../gildeService';
import { Gilde } from '../../types/gilde';

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

  describe('getSuggestedGilden', () => {
    it('should be a function', () => {
      expect(typeof getSuggestedGilden).toBe('function');
    });

    it('should return suggestions sorted by match score', () => {
      const gilden: Gilde[] = [
        {
          id: '1',
          name: 'Milpa',
          concept: 'Test',
          plants: [
            { name: 'Mais', role: 'Rankhilfe' },
            { name: 'Bohne', role: 'Stickstoff' },
          ],
          is_system: true,
        },
        {
          id: '2',
          name: 'Kräuter',
          concept: 'Test',
          plants: [
            { name: 'Basilikum', role: 'Aroma' },
          ],
          is_system: true,
        },
      ];

      const bedPlants = ['Mais', 'Tomate'];
      const suggestions = getSuggestedGilden(gilden, bedPlants);

      expect(suggestions.length).toBe(1);
      expect(suggestions[0].gilde.name).toBe('Milpa');
      expect(suggestions[0].matchScore).toBe(50);
      expect(suggestions[0].matchingPlants).toContain('Mais');
    });

    it('should return empty for no matches', () => {
      const gilden: Gilde[] = [
        {
          id: '1',
          name: 'Test',
          concept: 'Test',
          plants: [{ name: 'Kartoffel', role: 'Haupt' }],
          is_system: true,
        },
      ];

      const suggestions = getSuggestedGilden(gilden, ['Tomate', 'Paprika']);
      expect(suggestions.length).toBe(0);
    });
  });

  describe('fetchRating', () => {
    it('should be a function', () => {
      expect(typeof fetchRating).toBe('function');
    });
  });

  describe('upsertRating', () => {
    it('should be a function', () => {
      expect(typeof upsertRating).toBe('function');
    });
  });

  describe('updateGilde', () => {
    it('should be a function', () => {
      expect(typeof updateGilde).toBe('function');
    });
  });

  describe('deleteGilde', () => {
    it('should be a function', () => {
      expect(typeof deleteGilde).toBe('function');
    });
  });
});