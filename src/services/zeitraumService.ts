/**
 * Zeitraum Service
 * Service für Zeitraum-basierte Logik und Auto-Suggestion
 */

import {
  Zeitraum,
  Jahreszeit,
  ZeitraumPhase,
} from '../types/zeitraum';
import {
  getAktuelleSaison,
  getJahreszeit,
  getPhase,
  isRelevantForCurrentPhase,
} from '../utils/zeitraumUtils';

/**
 * Pflanzen-spezifische Zeiträume
 * Wann sollte diese Pflanze typischerweise gepflanzt/gepflegt/geerntet werden?
 * Array von Tupeln [pflanzenName, zeitraum]
 */
const PFLANZEN_ZEITRAUM: [string, Zeitraum][] = [
  // Frühjahr - frühe Aussaat (Direktsaat)
  ['Radieschen', Zeitraum.FRUEHJAHR_FRUH],
  ['Spinat', Zeitraum.FRUEHJAHR_FRUH],
  ['Erbsen', Zeitraum.FRUEHJAHR_FRUH],
  ['Möhren', Zeitraum.FRUEHJAHR_FRUH],
  ['Karotten', Zeitraum.FRUEHJAHR_FRUH],
  ['Salat', Zeitraum.FRUEHJAHR_FRUH],
  ['Rucola', Zeitraum.FRUEHJAHR_FRUH],

  // Frühjahr - mittlere Phase (Vorkultur pikieren, Freilandaussaat)
  ['Kohlrabi', Zeitraum.FRUEHJAHR_MITTE],
  ['Brokkoli', Zeitraum.FRUEHJAHR_MITTE],
  ['Lauch', Zeitraum.FRUEHJAHR_MITTE],

  // Frühjahr - späte Phase (Auspflanzen nach drinnen)
  ['Tomaten', Zeitraum.FRUEHJAHR_SPAET],
  ['Paprika', Zeitraum.FRUEHJAHR_SPAET],
  ['Aubergine', Zeitraum.FRUEHJAHR_SPAET],
  ['Gurken', Zeitraum.FRUEHJAHR_SPAET],
  ['Zucchini', Zeitraum.FRUEHJAHR_SPAET],
  ['Kürbis', Zeitraum.FRUEHJAHR_SPAET],

  // Sommer - frühe Phase (Auspflanzen nach draußen)
  ['Tomaten', Zeitraum.SOMMER_FRUH],
  ['Paprika', Zeitraum.SOMMER_FRUH],
  ['Aubergine', Zeitraum.SOMMER_FRUH],
  ['Gurken', Zeitraum.SOMMER_FRUH],
  ['Zucchini', Zeitraum.SOMMER_FRUH],

  // Sommer - mittlere Phase (Haupternte, Pflege)
  ['Bohnen', Zeitraum.SOMMER_MITTE],
  ['Zucchini', Zeitraum.SOMMER_MITTE],
  ['Gurken', Zeitraum.SOMMER_MITTE],

  // Sommer - späte Phase (Letzte Ernten, Folientunnel)
  ['Tomaten', Zeitraum.SOMMER_SPAET],
  ['Paprika', Zeitraum.SOMMER_SPAET],

  // Herbst - frühe Phase (Haupternte)
  ['Kürbis', Zeitraum.HERBST_FRUH],
  ['Tomaten', Zeitraum.HERBST_FRUH],
  ['Gurken', Zeitraum.HERBST_FRUH],
  ['Bohnen', Zeitraum.HERBST_FRUH],
  ['Zucchini', Zeitraum.HERBST_FRUH],

  // Herbst - mittlere Phase (Bodenpflege)
  ['Knoblauch', Zeitraum.HERBST_MITTE],

  // Herbst - späte Phase (Vorbereitung Winter)
  ['Spinat', Zeitraum.HERBST_SPAET],
  ['Mangold', Zeitraum.HERBST_SPAET],

  // Winter - späte Phase (Anzucht beginnt)
  ['Tomaten', Zeitraum.WINTER_SPAET],
  ['Paprika', Zeitraum.WINTER_SPAET],
];

/**
 * Kategorie-basierte Zeiträume (Fallback)
 */
const KATEGORIE_ZEITRAUM: Record<string, ZeitraumPhase> = {
  'Aussaat': ZeitraumPhase.FRUEH,
  'Pflanzen': ZeitraumPhase.MITTE,
  'Ernten': ZeitraumPhase.SPAET,
  'Bodenpflege': ZeitraumPhase.MITTE,
  'Bewässerung': ZeitraumPhase.FRUEH,
  'Düngung': ZeitraumPhase.MITTE,
  'Schädlingsbekämpfung': ZeitraumPhase.MITTE,
};

export const zeitraumService = {
  /**
   * Gibt den aktuellen Zeitraum zurück
   */
  getCurrentZeitraum(): Zeitraum {
    return getAktuelleSaison();
  },

  /**
   * Gibt die aktuelle Jahreszeit zurück
   */
  getCurrentJahreszeit(): Jahreszeit | null {
    return getJahreszeit(getAktuelleSaison());
  },

  /**
   * Gibt die aktuelle Phase zurück
   */
  getCurrentPhase(): ZeitraumPhase | null {
    return getPhase(getAktuelleSaison());
  },

  /**
   * Schlägt einen Zeitraum basierend auf Pflanzenname und Kategorie vor
   */
  suggestZeitraum(plantName: string, kategorie?: string): Zeitraum {
    // Versuche zuerst Pflanzen-Mapping
    const plantNameLower = plantName.toLowerCase();
    for (const [key, zeitraum] of Object.entries(PFLANZEN_ZEITRAUM)) {
      if (plantNameLower.includes(key.toLowerCase())) {
        return zeitraum;
      }
    }

    // Fallback zu aktueller Saison
    return getAktuelleSaison();
  },

  /**
   * Prüft ob ein Zeitraum für die aktuelle Phase relevant ist
   */
  isRelevantForCurrentPhase(zeitraum: Zeitraum): boolean {
    return isRelevantForCurrentPhase(zeitraum);
  },

  /**
   * Gibt alle verfügbaren Zeiträume für eine Jahreszeit zurück
   */
  getZeitraeumeForJahreszeit(jahreszeit: Jahreszeit): Zeitraum[] {
    const prefix = jahreszeit;
    return Object.values(Zeitraum).filter((z) =>
      z.startsWith(prefix)
    );
  },

  /**
   * Gibt die nächste Phase zurück
   */
  getNextPhase(zeitraum: Zeitraum): Zeitraum | null {
    const phaseOrder: ZeitraumPhase[] = [
      ZeitraumPhase.FRUEH,
      ZeitraumPhase.MITTE,
      ZeitraumPhase.SPAET,
    ];

    const currentJahreszeit = getJahreszeit(zeitraum);
    const currentPhase = getPhase(zeitraum);

    if (!currentJahreszeit || !currentPhase) {
      return null;
    }

    const currentPhaseIndex = phaseOrder.indexOf(currentPhase);

    // Nächste Phase in gleicher Jahreszeit
    if (currentPhaseIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentPhaseIndex + 1];
      const jahreszeitKey = Object.entries(Jahreszeit).find(
        ([, val]) => val === currentJahreszeit
      )?.[0];

      if (jahreszeitKey) {
        return Object.values(Zeitraum).find((z) =>
          z.startsWith(currentJahreszeit) && z.endsWith(nextPhase)
        ) || null;
      }
    }

    // Nächste Jahreszeit
    const jahreszeitOrder: Jahreszeit[] = [
      Jahreszeit.FRUEHJAHR,
      Jahreszeit.SOMMER,
      Jahreszeit.HERBST,
      Jahreszeit.WINTER,
    ];

    const currentJahreszeitIndex = jahreszeitOrder.indexOf(currentJahreszeit);

    if (currentJahreszeitIndex < jahreszeitOrder.length - 1) {
      const nextJahreszeit = jahreszeitOrder[currentJahreszeitIndex + 1];
      return Object.values(Zeitraum).find((z) =>
        z.startsWith(nextJahreszeit) && z.endsWith(ZeitraumPhase.FRUEH)
      ) || null;
    }

    return null;
  },
};
