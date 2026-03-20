/**
 * ZeitraumUtils Tests
 */

import React from 'react';
import { describe, it, expect } from '@jest/globals';
import {
  getJahreszeit,
  getPhase,
  getZeitraumFromJahreszeitPhase,
  getZeitraumLabel,
  getZeitraumShortLabel,
  getZeitraumIcon,
  getZeitraumIconComponent,
  getJahreszeitLabel,
  getPhaseLabel,
  isRelevantForCurrentPhase,
  sortZeitraeume,
} from '../utils/zeitraumUtils';
import { Zeitraum, Jahreszeit, ZeitraumPhase } from '../types/zeitraum';

describe('zeitraumUtils', () => {
  describe('getJahreszeit', () => {
    it('extracts FRUEHJAHR from fruehjahr_*', () => {
      expect(getJahreszeit(Zeitraum.FRUEHJAHR_FRUH)).toBe(Jahreszeit.FRUEHJAHR);
      expect(getJahreszeit(Zeitraum.FRUEHJAHR_MITTE)).toBe(Jahreszeit.FRUEHJAHR);
      expect(getJahreszeit(Zeitraum.FRUEHJAHR_SPAET)).toBe(Jahreszeit.FRUEHJAHR);
    });

    it('extracts SOMMER from sommer_*', () => {
      expect(getJahreszeit(Zeitraum.SOMMER_FRUH)).toBe(Jahreszeit.SOMMER);
      expect(getJahreszeit(Zeitraum.SOMMER_MITTE)).toBe(Jahreszeit.SOMMER);
      expect(getJahreszeit(Zeitraum.SOMMER_SPAET)).toBe(Jahreszeit.SOMMER);
    });

    it('extracts HERBST from herbst_*', () => {
      expect(getJahreszeit(Zeitraum.HERBST_FRUH)).toBe(Jahreszeit.HERBST);
      expect(getJahreszeit(Zeitraum.HERBST_MITTE)).toBe(Jahreszeit.HERBST);
      expect(getJahreszeit(Zeitraum.HERBST_SPAET)).toBe(Jahreszeit.HERBST);
    });

    it('extracts WINTER from winter_*', () => {
      expect(getJahreszeit(Zeitraum.WINTER_FRUH)).toBe(Jahreszeit.WINTER);
      expect(getJahreszeit(Zeitraum.WINTER_MITTE)).toBe(Jahreszeit.WINTER);
      expect(getJahreszeit(Zeitraum.WINTER_SPAET)).toBe(Jahreszeit.WINTER);
    });

    it('returns null for DIESE_WOCHE and FLEXIBEL', () => {
      expect(getJahreszeit(Zeitraum.DIESE_WOCHE)).toBeNull();
      expect(getJahreszeit(Zeitraum.FLEXIBEL)).toBeNull();
    });
  });

  describe('getPhase', () => {
    it('extracts FRUEH phase', () => {
      expect(getPhase(Zeitraum.FRUEHJAHR_FRUH)).toBe(ZeitraumPhase.FRUEH);
      expect(getPhase(Zeitraum.SOMMER_FRUH)).toBe(ZeitraumPhase.FRUEH);
      expect(getPhase(Zeitraum.HERBST_FRUH)).toBe(ZeitraumPhase.FRUEH);
      expect(getPhase(Zeitraum.WINTER_FRUH)).toBe(ZeitraumPhase.FRUEH);
    });

    it('extracts MITTE phase', () => {
      expect(getPhase(Zeitraum.FRUEHJAHR_MITTE)).toBe(ZeitraumPhase.MITTE);
      expect(getPhase(Zeitraum.SOMMER_MITTE)).toBe(ZeitraumPhase.MITTE);
      expect(getPhase(Zeitraum.HERBST_MITTE)).toBe(ZeitraumPhase.MITTE);
      expect(getPhase(Zeitraum.WINTER_MITTE)).toBe(ZeitraumPhase.MITTE);
    });

    it('extracts SPAET phase', () => {
      expect(getPhase(Zeitraum.FRUEHJAHR_SPAET)).toBe(ZeitraumPhase.SPAET);
      expect(getPhase(Zeitraum.SOMMER_SPAET)).toBe(ZeitraumPhase.SPAET);
      expect(getPhase(Zeitraum.HERBST_SPAET)).toBe(ZeitraumPhase.SPAET);
      expect(getPhase(Zeitraum.WINTER_SPAET)).toBe(ZeitraumPhase.SPAET);
    });

    it('returns null for DIESE_WOCHE and FLEXIBEL', () => {
      expect(getPhase(Zeitraum.DIESE_WOCHE)).toBeNull();
      expect(getPhase(Zeitraum.FLEXIBEL)).toBeNull();
    });
  });

  describe('getZeitraumFromJahreszeitPhase', () => {
    it('creates correct Zeitraeume for all combinations', () => {
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.FRUEHJAHR, ZeitraumPhase.FRUEH)).toBe(Zeitraum.FRUEHJAHR_FRUH);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.FRUEHJAHR, ZeitraumPhase.MITTE)).toBe(Zeitraum.FRUEHJAHR_MITTE);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.FRUEHJAHR, ZeitraumPhase.SPAET)).toBe(Zeitraum.FRUEHJAHR_SPAET);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.SOMMER, ZeitraumPhase.FRUEH)).toBe(Zeitraum.SOMMER_FRUH);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.SOMMER, ZeitraumPhase.MITTE)).toBe(Zeitraum.SOMMER_MITTE);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.SOMMER, ZeitraumPhase.SPAET)).toBe(Zeitraum.SOMMER_SPAET);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.HERBST, ZeitraumPhase.FRUEH)).toBe(Zeitraum.HERBST_FRUH);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.HERBST, ZeitraumPhase.MITTE)).toBe(Zeitraum.HERBST_MITTE);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.HERBST, ZeitraumPhase.SPAET)).toBe(Zeitraum.HERBST_SPAET);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.WINTER, ZeitraumPhase.FRUEH)).toBe(Zeitraum.WINTER_FRUH);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.WINTER, ZeitraumPhase.MITTE)).toBe(Zeitraum.WINTER_MITTE);
      expect(getZeitraumFromJahreszeitPhase(Jahreszeit.WINTER, ZeitraumPhase.SPAET)).toBe(Zeitraum.WINTER_SPAET);
    });
  });

  describe('Labels', () => {
    it('getZeitraumLabel returns label from ZEITRAUM_LABELS', () => {
      expect(getZeitraumLabel(Zeitraum.FRUEHJAHR_FRUH)).toBe('Frühjahr · Frühe Phase');
      expect(getZeitraumLabel(Zeitraum.SOMMER_MITTE)).toBe('Sommer · Mittlere Phase');
      expect(getZeitraumLabel(Zeitraum.DIESE_WOCHE)).toBe('Diese Woche');
    });

    it('getZeitraumShortLabel returns label from ZEITRAUM_SHORT_LABELS', () => {
      expect(getZeitraumShortLabel(Zeitraum.FRUEHJAHR_FRUH)).toBe('Frühjahr, früh');
      expect(getZeitraumShortLabel(Zeitraum.DIESE_WOCHE)).toBe('Diese Woche');
    });

    it('getZeitraumIcon returns icon name for jahreszeit', () => {
      expect(getZeitraumIcon(Zeitraum.FRUEHJAHR_FRUH)).toBe('eco');
      expect(getZeitraumIcon(Zeitraum.SOMMER_MITTE)).toBe('wb-sunny');
      expect(getZeitraumIcon(Zeitraum.HERBST_SPAET)).toBe('park');
      expect(getZeitraumIcon(Zeitraum.WINTER_MITTE)).toBe('ac-unit');
    });

    it('getZeitraumIcon returns event icon for DIESE_WOCHE', () => {
      expect(getZeitraumIcon(Zeitraum.DIESE_WOCHE)).toBe('event');
    });

    it('getZeitraumIcon returns schedule icon for FLEXIBEL', () => {
      expect(getZeitraumIcon(Zeitraum.FLEXIBEL)).toBe('schedule');
    });

    it('getZeitraumIconComponent returns React element', () => {
      const component = getZeitraumIconComponent(Zeitraum.FRUEHJAHR_FRUH);
      expect(React.isValidElement(component)).toBe(true);
    });

    it('getZeitraumIconComponent accepts size and color props', () => {
      const component = getZeitraumIconComponent(Zeitraum.SOMMER_MITTE, 24, '#ff0000');
      expect(React.isValidElement(component)).toBe(true);
    });

    it('getJahreszeitLabel returns label from JAHRESZEIT_LABELS', () => {
      expect(getJahreszeitLabel(Jahreszeit.FRUEHJAHR)).toBe('Frühjahr');
      expect(getJahreszeitLabel(Jahreszeit.SOMMER)).toBe('Sommer');
      expect(getJahreszeitLabel(Jahreszeit.HERBST)).toBe('Herbst');
      expect(getJahreszeitLabel(Jahreszeit.WINTER)).toBe('Winter');
    });

    it('getPhaseLabel returns label from PHASE_LABELS', () => {
      expect(getPhaseLabel(ZeitraumPhase.FRUEH)).toBe('Frühe Phase');
      expect(getPhaseLabel(ZeitraumPhase.MITTE)).toBe('Mittlere Phase');
      expect(getPhaseLabel(ZeitraumPhase.SPAET)).toBe('Späte Phase');
    });
  });

  describe('isRelevantForCurrentPhase', () => {
    it('returns true for FLEXIBEL and DIESE_WOCHE', () => {
      expect(isRelevantForCurrentPhase(Zeitraum.FLEXIBEL)).toBe(true);
      expect(isRelevantForCurrentPhase(Zeitraum.DIESE_WOCHE)).toBe(true);
    });
  });

  describe('sortZeitraeume', () => {
    it('sorts by defined order', () => {
      const unsorted = [
        Zeitraum.WINTER_SPAET,
        Zeitraum.FRUEHJAHR_FRUH,
        Zeitraum.HERBST_FRUH,
        Zeitraum.SOMMER_MITTE,
        Zeitraum.FLEXIBEL,
      ];
      const sorted = sortZeitraeume(unsorted);
      expect(sorted[0]).toBe(Zeitraum.FRUEHJAHR_FRUH);
      expect(sorted[1]).toBe(Zeitraum.SOMMER_MITTE);
      expect(sorted[2]).toBe(Zeitraum.HERBST_FRUH);
      expect(sorted[3]).toBe(Zeitraum.WINTER_SPAET);
      expect(sorted[4]).toBe(Zeitraum.FLEXIBEL);
    });

    it('handles empty array', () => {
      expect(sortZeitraeume([])).toEqual([]);
    });

    it('puts unknown values at end', () => {
      const sorted = sortZeitraeume([Zeitraum.FLEXIBEL]);
      expect(sorted[0]).toBe(Zeitraum.FLEXIBEL);
    });
  });
});
