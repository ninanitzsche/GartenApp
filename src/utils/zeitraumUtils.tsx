/**
 * Zeitraum Utilities
 * Hilfsfunktionen für das phase-basierte Zeitraum-System
 */

import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Zeitraum,
  Jahreszeit,
  ZeitraumPhase,
  ZEITRAUM_LABELS,
  ZEITRAUM_SHORT_LABELS,
  ZEITRAUM_ICON_NAMES,
  JAHRESZEIT_LABELS,
  PHASE_LABELS,
} from '../types/zeitraum';

/**
 * Extrahiert die Jahreszeit aus einem Zeitraum
 */
export function getJahreszeit(zeitraum: Zeitraum): Jahreszeit | null {
  if (zeitraum.startsWith('fruehjahr')) return Jahreszeit.FRUEHJAHR;
  if (zeitraum.startsWith('sommer')) return Jahreszeit.SOMMER;
  if (zeitraum.startsWith('herbst')) return Jahreszeit.HERBST;
  if (zeitraum.startsWith('winter')) return Jahreszeit.WINTER;
  return null;
}

/**
 * Extrahiert die Phase aus einem Zeitraum
 */
export function getPhase(zeitraum: Zeitraum): ZeitraumPhase | null {
  if (zeitraum.endsWith('frueh')) return ZeitraumPhase.FRUEH;
  if (zeitraum.endsWith('mitte')) return ZeitraumPhase.MITTE;
  if (zeitraum.endsWith('spaet')) return ZeitraumPhase.SPAET;
  return null;
}

/**
 * Berechnet die aktuelle Saison basierend auf Monat
 * Monate: 0=Jan, 1=Feb, ..., 11=Dez
 */
export function getAktuelleSaison(): Zeitraum {
  const month = new Date().getMonth();
  const day = new Date().getDate();

  let jahreszeit: Jahreszeit;
  let phase: ZeitraumPhase;

  // Frühjahr: März - Mai
  if (month >= 2 && month <= 4) {
    jahreszeit = Jahreszeit.FRUEHJAHR;
    // Früh: März, Mitte: April, Spät: Mai
    if (month === 2) phase = ZeitraumPhase.FRUEH;
    else if (month === 3) phase = ZeitraumPhase.MITTE;
    else phase = ZeitraumPhase.SPAET;
  }
  // Sommer: Juni - August
  else if (month >= 5 && month <= 7) {
    jahreszeit = Jahreszeit.SOMMER;
    // Früh: Juni-Juli Anfang, Mitte: Juli, Spät: August
    if (month === 5 || (month === 6 && day < 20)) phase = ZeitraumPhase.FRUEH;
    else if (month === 6 && day >= 20) phase = ZeitraumPhase.MITTE;
    else phase = ZeitraumPhase.SPAET;
  }
  // Herbst: September - November
  else if (month >= 8 && month <= 10) {
    jahreszeit = Jahreszeit.HERBST;
    // Früh: September, Mitte: Oktober, Spät: November
    if (month === 8) phase = ZeitraumPhase.FRUEH;
    else if (month === 9) phase = ZeitraumPhase.MITTE;
    else phase = ZeitraumPhase.SPAET;
  }
  // Winter: Dezember - Februar
  else {
    jahreszeit = Jahreszeit.WINTER;
    // Früh: Dezember-Jan, Mitte: Jan-Feb, Spät: Feb-Mär
    if (month === 11) phase = ZeitraumPhase.FRUEH;
    else if (month === 0 || (month === 1 && day < 20)) phase = ZeitraumPhase.MITTE;
    else phase = ZeitraumPhase.SPAET;
  }

  return getZeitraumFromJahreszeitPhase(jahreszeit, phase);
}

/**
 * Erstellt einen Zeitraum aus Jahreszeit und Phase
 */
export function getZeitraumFromJahreszeitPhase(
  jahreszeit: Jahreszeit,
  phase: ZeitraumPhase
): Zeitraum {
  const prefix = jahreszeit;
  const suffix = phase;

  const mapping: Record<string, Zeitraum> = {
    [`${Jahreszeit.FRUEHJAHR}_${ZeitraumPhase.FRUEH}`]: Zeitraum.FRUEHJAHR_FRUH,
    [`${Jahreszeit.FRUEHJAHR}_${ZeitraumPhase.MITTE}`]: Zeitraum.FRUEHJAHR_MITTE,
    [`${Jahreszeit.FRUEHJAHR}_${ZeitraumPhase.SPAET}`]: Zeitraum.FRUEHJAHR_SPAET,
    [`${Jahreszeit.SOMMER}_${ZeitraumPhase.FRUEH}`]: Zeitraum.SOMMER_FRUH,
    [`${Jahreszeit.SOMMER}_${ZeitraumPhase.MITTE}`]: Zeitraum.SOMMER_MITTE,
    [`${Jahreszeit.SOMMER}_${ZeitraumPhase.SPAET}`]: Zeitraum.SOMMER_SPAET,
    [`${Jahreszeit.HERBST}_${ZeitraumPhase.FRUEH}`]: Zeitraum.HERBST_FRUH,
    [`${Jahreszeit.HERBST}_${ZeitraumPhase.MITTE}`]: Zeitraum.HERBST_MITTE,
    [`${Jahreszeit.HERBST}_${ZeitraumPhase.SPAET}`]: Zeitraum.HERBST_SPAET,
    [`${Jahreszeit.WINTER}_${ZeitraumPhase.FRUEH}`]: Zeitraum.WINTER_FRUH,
    [`${Jahreszeit.WINTER}_${ZeitraumPhase.MITTE}`]: Zeitraum.WINTER_MITTE,
    [`${Jahreszeit.WINTER}_${ZeitraumPhase.SPAET}`]: Zeitraum.WINTER_SPAET,
  };

  return mapping[`${prefix}_${suffix}`] || Zeitraum.FLEXIBEL;
}

/**
 * Gibt das vollständige Label für einen Zeitraum zurück
 */
export function getZeitraumLabel(zeitraum: Zeitraum): string {
  return ZEITRAUM_LABELS[zeitraum] || zeitraum;
}

/**
 * Gibt das Kurzlabel mit Icon zurück
 */
export function getZeitraumShortLabel(zeitraum: Zeitraum): string {
  return ZEITRAUM_SHORT_LABELS[zeitraum] || zeitraum;
}

/**
 * Gibt den Icon-Namen für einen Zeitraum zurück
 */
export function getZeitraumIcon(zeitraum: Zeitraum): string {
  const jahreszeit = getJahreszeit(zeitraum);
  if (jahreszeit) {
    return ZEITRAUM_ICON_NAMES[jahreszeit];
  }
  if (zeitraum === Zeitraum.DIESE_WOCHE) {
    return ZEITRAUM_ICON_NAMES['diese_woche'];
  }
  return ZEITRAUM_ICON_NAMES['flexibel'];
}

/**
 * Gibt die Icon-Komponente für einen Zeitraum zurück
 */
export function getZeitraumIconComponent(zeitraum: Zeitraum, size?: number, color?: string): React.ReactElement {
  const iconName = getZeitraumIcon(zeitraum);
  return (
    <MaterialIcons 
      name={iconName as any} 
      size={size || 16} 
      color={color || '#666'} 
    />
  );
}

/**
 * Gibt das Label für eine Jahreszeit zurück
 */
export function getJahreszeitLabel(jahreszeit: Jahreszeit): string {
  return JAHRESZEIT_LABELS[jahreszeit] || jahreszeit;
}

/**
 * Gibt das Label für eine Phase zurück
 */
export function getPhaseLabel(phase: ZeitraumPhase): string {
  return PHASE_LABELS[phase] || phase;
}

/**
 * Prüft ob ein Zeitraum zur aktuellen Phase passt
 */
export function isRelevantForCurrentPhase(zeitraum: Zeitraum): boolean {
  if (zeitraum === Zeitraum.FLEXIBEL || zeitraum === Zeitraum.DIESE_WOCHE) {
    return true;
  }
  const aktuell = getAktuelleSaison();
  return zeitraum === aktuell;
}

/**
 * Sortiert Zeiträume in eine logische Reihenfolge
 */
export function sortZeitraeume(zeitraeume: Zeitraum[]): Zeitraum[] {
  const order: Record<Zeitraum, number> = {
    [Zeitraum.FRUEHJAHR_FRUH]: 1,
    [Zeitraum.FRUEHJAHR_MITTE]: 2,
    [Zeitraum.FRUEHJAHR_SPAET]: 3,
    [Zeitraum.SOMMER_FRUH]: 4,
    [Zeitraum.SOMMER_MITTE]: 5,
    [Zeitraum.SOMMER_SPAET]: 6,
    [Zeitraum.HERBST_FRUH]: 7,
    [Zeitraum.HERBST_MITTE]: 8,
    [Zeitraum.HERBST_SPAET]: 9,
    [Zeitraum.WINTER_FRUH]: 10,
    [Zeitraum.WINTER_MITTE]: 11,
    [Zeitraum.WINTER_SPAET]: 12,
    [Zeitraum.DIESE_WOCHE]: 13,
    [Zeitraum.FLEXIBEL]: 14,
  };

  return [...zeitraeume].sort((a, b) => (order[a] || 99) - (order[b] || 99));
}
