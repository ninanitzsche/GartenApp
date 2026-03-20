/**
 * Zeitraum Types - Phase-basiertes Zeitraum-System
 * Unterteilt Jahreszeiten in Früh/Mitte/Spät für feinere Planung
 */

export enum ZeitraumPhase {
  FRUEH = 'frueh',
  MITTE = 'mitte',
  SPAET = 'spaet',
}

export enum Jahreszeit {
  FRUEHJAHR = 'fruehjahr',
  SOMMER = 'sommer',
  HERBST = 'herbst',
  WINTER = 'winter',
}

export enum Zeitraum {
  // Frühjahr
  FRUEHJAHR_FRUH = 'fruehjahr_frueh',     // Feb-Mär
  FRUEHJAHR_MITTE = 'fruehjahr_mitte',     // Apr-Mai
  FRUEHJAHR_SPAET = 'fruehjahr_spaet',     // Mai-Jun

  // Sommer
  SOMMER_FRUH = 'sommer_frueh',             // Jun-Jul
  SOMMER_MITTE = 'sommer_mitte',           // Jul
  SOMMER_SPAET = 'sommer_spaet',           // Aug

  // Herbst
  HERBST_FRUH = 'herbst_frueh',           // Sep-Okt
  HERBST_MITTE = 'herbst_mitte',           // Okt-Nov
  HERBST_SPAET = 'herbst_spaet',           // Nov

  // Winter
  WINTER_FRUH = 'winter_frueh',           // Dez-Jan
  WINTER_MITTE = 'winter_mitte',           // Jan-Feb
  WINTER_SPAET = 'winter_spaet',           // Feb-Mär

  // Kurzfristig
  DIESE_WOCHE = 'diese_woche',

  // Flexibel
  FLEXIBEL = 'flexibel',
}

export const ZEITRAUM_LABELS: Record<Zeitraum, string> = {
  [Zeitraum.FRUEHJAHR_FRUH]: 'Frühjahr · Frühe Phase',
  [Zeitraum.FRUEHJAHR_MITTE]: 'Frühjahr · Mittlere Phase',
  [Zeitraum.FRUEHJAHR_SPAET]: 'Frühjahr · Späte Phase',
  [Zeitraum.SOMMER_FRUH]: 'Sommer · Frühe Phase',
  [Zeitraum.SOMMER_MITTE]: 'Sommer · Mittlere Phase',
  [Zeitraum.SOMMER_SPAET]: 'Sommer · Späte Phase',
  [Zeitraum.HERBST_FRUH]: 'Herbst · Frühe Phase',
  [Zeitraum.HERBST_MITTE]: 'Herbst · Mittlere Phase',
  [Zeitraum.HERBST_SPAET]: 'Herbst · Späte Phase',
  [Zeitraum.WINTER_FRUH]: 'Winter · Frühe Phase',
  [Zeitraum.WINTER_MITTE]: 'Winter · Mittlere Phase',
  [Zeitraum.WINTER_SPAET]: 'Winter · Späte Phase',
  [Zeitraum.DIESE_WOCHE]: 'Diese Woche',
  [Zeitraum.FLEXIBEL]: 'Flexibel',
};

export const ZEITRAUM_SHORT_LABELS: Record<Zeitraum, string> = {
  [Zeitraum.FRUEHJAHR_FRUH]: '🌱 Frühjahr, früh',
  [Zeitraum.FRUEHJAHR_MITTE]: '🌱 Frühjahr, mitte',
  [Zeitraum.FRUEHJAHR_SPAET]: '🌱 Frühjahr, spät',
  [Zeitraum.SOMMER_FRUH]: '☀️ Sommer, früh',
  [Zeitraum.SOMMER_MITTE]: '☀️ Sommer, mitte',
  [Zeitraum.SOMMER_SPAET]: '☀️ Sommer, spät',
  [Zeitraum.HERBST_FRUH]: '🍂 Herbst, früh',
  [Zeitraum.HERBST_MITTE]: '🍂 Herbst, mitte',
  [Zeitraum.HERBST_SPAET]: '🍂 Herbst, spät',
  [Zeitraum.WINTER_FRUH]: '❄️ Winter, früh',
  [Zeitraum.WINTER_MITTE]: '❄️ Winter, mitte',
  [Zeitraum.WINTER_SPAET]: '❄️ Winter, spät',
  [Zeitraum.DIESE_WOCHE]: '📅 Diese Woche',
  [Zeitraum.FLEXIBEL]: '⚪ Flexibel',
};

export const ZEITRAUM_ICONS: Record<Jahreszeit | 'diese_woche' | 'flexibel', string> = {
  [Jahreszeit.FRUEHJAHR]: '🌱',
  [Jahreszeit.SOMMER]: '☀️',
  [Jahreszeit.HERBST]: '🍂',
  [Jahreszeit.WINTER]: '❄️',
  'diese_woche': '📅',
  'flexibel': '⚪',
};

export const JAHRESZEIT_LABELS: Record<Jahreszeit, string> = {
  [Jahreszeit.FRUEHJAHR]: 'Frühjahr',
  [Jahreszeit.SOMMER]: 'Sommer',
  [Jahreszeit.HERBST]: 'Herbst',
  [Jahreszeit.WINTER]: 'Winter',
};

export const PHASE_LABELS: Record<ZeitraumPhase, string> = {
  [ZeitraumPhase.FRUEH]: 'Frühe Phase',
  [ZeitraumPhase.MITTE]: 'Mittlere Phase',
  [ZeitraumPhase.SPAET]: 'Späte Phase',
};
