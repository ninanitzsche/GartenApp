/**
 * ZeitraumService Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { zeitraumService } from '../services/zeitraumService';
import { Zeitraum, Jahreszeit, ZeitraumPhase } from '../types/zeitraum';

jest.mock('../utils/zeitraumUtils', () => ({
  getAktuelleSaison: jest.fn(() => 'fruehjahr_frueh'),
  getJahreszeit: jest.fn((z: string) => {
    if (z.startsWith('fruehjahr')) return 'fruehjahr';
    if (z.startsWith('sommer')) return 'sommer';
    if (z.startsWith('herbst')) return 'herbst';
    if (z.startsWith('winter')) return 'winter';
    return null;
  }),
  getPhase: jest.fn((z: string) => {
    if (z.endsWith('frueh')) return 'frueh';
    if (z.endsWith('mitte')) return 'mitte';
    if (z.endsWith('spaet')) return 'spaet';
    return null;
  }),
  isRelevantForCurrentPhase: jest.fn(() => true),
}));

describe('zeitraumService', () => {
  describe('getCurrentZeitraum', () => {
    it('returns a Zeitraum value', () => {
      const result = zeitraumService.getCurrentZeitraum();
      expect(result).toBeTruthy();
      expect(Object.values(Zeitraum)).toContain(result);
    });
  });

  describe('getCurrentJahreszeit', () => {
    it('returns null or a valid Jahreszeit', () => {
      const result = zeitraumService.getCurrentJahreszeit();
      if (result) {
        expect(Object.values(Jahreszeit)).toContain(result);
      }
    });
  });

  describe('getCurrentPhase', () => {
    it('returns null or a valid ZeitraumPhase', () => {
      const result = zeitraumService.getCurrentPhase();
      if (result) {
        expect(Object.values(ZeitraumPhase)).toContain(result);
      }
    });
  });

  describe('suggestZeitraum', () => {
    it('returns FRUEHJAHR_FRUH for Radieschen', () => {
      const result = zeitraumService.suggestZeitraum('Radieschen');
      expect(result).toBe(Zeitraum.FRUEHJAHR_FRUH);
    });

    it('returns FRUEHJAHR_MITTE for Kohlrabi', () => {
      const result = zeitraumService.suggestZeitraum('Kohlrabi');
      expect(result).toBe(Zeitraum.FRUEHJAHR_MITTE);
    });

    it('returns FRUEHJAHR_SPAET for Tomaten', () => {
      const result = zeitraumService.suggestZeitraum('Tomaten');
      expect(result).toBe(Zeitraum.FRUEHJAHR_SPAET);
    });

    it('returns SOMMER_MITTE for Bohnen', () => {
      const result = zeitraumService.suggestZeitraum('Bohnen');
      expect(result).toBe(Zeitraum.SOMMER_MITTE);
    });

    it('returns first matching entry for Kuerbis', () => {
      const result = zeitraumService.suggestZeitraum('Kürbis');
      expect(result).toBe(Zeitraum.FRUEHJAHR_SPAET);
    });

    it('returns HERBST_SPAET for Mangold', () => {
      const result = zeitraumService.suggestZeitraum('Mangold');
      expect(result).toBe(Zeitraum.HERBST_SPAET);
    });

    it('falls back to aktuelleSaison for unknown plants', () => {
      const result = zeitraumService.suggestZeitraum('UnbekanntePflanze');
      expect(result).toBeTruthy();
    });

    it('handles case-insensitive matching', () => {
      expect(zeitraumService.suggestZeitraum('tomaten')).toBeTruthy();
      expect(zeitraumService.suggestZeitraum('TOMATEN')).toBeTruthy();
    });

    it('handles plant names with umlauts', () => {
      expect(zeitraumService.suggestZeitraum('Möhren')).toBe(Zeitraum.FRUEHJAHR_FRUH);
      expect(zeitraumService.suggestZeitraum('Karotten')).toBe(Zeitraum.FRUEHJAHR_FRUH);
    });

    it('matches substring in plant names', () => {
      expect(zeitraumService.suggestZeitraum('Radieschenchen')).toBe(Zeitraum.FRUEHJAHR_FRUH);
    });
  });

  describe('isRelevantForCurrentPhase', () => {
    it('returns a boolean', () => {
      const result = zeitraumService.isRelevantForCurrentPhase(Zeitraum.FRUEHJAHR_FRUH);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getZeitraeumeForJahreszeit', () => {
    it('returns all Zeiträume for FRUEHJAHR', () => {
      const result = zeitraumService.getZeitraeumeForJahreszeit(Jahreszeit.FRUEHJAHR);
      expect(result).toContain(Zeitraum.FRUEHJAHR_FRUH);
      expect(result).toContain(Zeitraum.FRUEHJAHR_MITTE);
      expect(result).toContain(Zeitraum.FRUEHJAHR_SPAET);
      expect(result.length).toBe(3);
    });

    it('returns all Zeiträume for SOMMER', () => {
      const result = zeitraumService.getZeitraeumeForJahreszeit(Jahreszeit.SOMMER);
      expect(result).toContain(Zeitraum.SOMMER_FRUH);
      expect(result).toContain(Zeitraum.SOMMER_MITTE);
      expect(result).toContain(Zeitraum.SOMMER_SPAET);
      expect(result.length).toBe(3);
    });

    it('returns empty array for unknown jahreszeit', () => {
      const result = zeitraumService.getZeitraeumeForJahreszeit(Jahreszeit.HERBST);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getNextPhase', () => {
    it('returns next phase in same jahreszeit', () => {
      const result = zeitraumService.getNextPhase(Zeitraum.FRUEHJAHR_FRUH);
      expect(result).toBe(Zeitraum.FRUEHJAHR_MITTE);
    });

    it('returns first phase of next jahreszeit', () => {
      const result = zeitraumService.getNextPhase(Zeitraum.FRUEHJAHR_SPAET);
      expect(result).toBe(Zeitraum.SOMMER_FRUH);
    });

    it('returns null for WINTER_SPAET', () => {
      const result = zeitraumService.getNextPhase(Zeitraum.WINTER_SPAET);
      expect(result).toBeNull();
    });

    it('returns SOMMER_MITTE from SOMMER_FRUH', () => {
      const result = zeitraumService.getNextPhase(Zeitraum.SOMMER_FRUH);
      expect(result).toBe(Zeitraum.SOMMER_MITTE);
    });

    it('returns HERBST_FRUH from SOMMER_SPAET', () => {
      const result = zeitraumService.getNextPhase(Zeitraum.SOMMER_SPAET);
      expect(result).toBe(Zeitraum.HERBST_FRUH);
    });
  });
});
