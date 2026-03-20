/**
 * Seasonal Knowledge Database
 * Tips and information for each month
 */

export interface SeasonalKnowledge {
  month: number;
  title: string;
  tips: string[];
  warnings: string[];
  activities: string[];
  companionPlantingTips: CompanionTip[];
}

export interface CompanionTip {
  plant1: string;
  plant2: string;
  benefit: string;
  type: 'good' | 'avoid';
}

export const SEASONAL_KNOWLEDGE: Record<number, SeasonalKnowledge> = {
  1: {
    month: 1,
    title: 'Januar - Ruhezeit',
    tips: [
      'Planung für die neue Saison: Saatgut bestellen',
      'Lagerfähiges Gemüse verbrauchen',
      'Ernte von Wintergemüse (Kohl, Lauch, Grünkohl)',
    ],
    warnings: [
      'Nicht bei Frost umpflanzen',
      'Keine Aussaat im Freien möglich',
    ],
    activities: ['Saatgut-Inventur machen', 'Beete mulchen', 'Werkzeug prüfen'],
    companionPlantingTips: [
      { plant1: 'Kohl', plant2: 'Sellerie', benefit: 'Kohl profitiert von Sellerie', type: 'good' },
      { plant1: 'Porree', plant2: 'Sellerie', benefit: 'Gegenseitiger Schutz vor Schädlingen', type: 'good' },
    ],
  },
  2: {
    month: 2,
    title: 'Februar - Vorfreude',
    tips: [
      'Erste Aussaaten in Anzuchtschalen auf der Fensterbank',
      'Tomaten, Paprika, Chili jetzt vorziehen',
      'Kompost umsetzen und verteilen',
    ],
    warnings: [
      'Noch zu kalt für Direktsaat',
      'Auspflanzen erst nach den Eisheiligen (Mitte Mai)',
    ],
    activities: ['Paprika und Chili aussäen', 'Frühbeet vorbereiten', 'Beete umgraben'],
    companionPlantingTips: [
      { plant1: 'Tomate', plant2: 'Basilikum', benefit: 'Basilikum fördert Tomatenwachstum', type: 'good' },
      { plant1: 'Tomate', plant2: 'Fenchel', benefit: 'Fenchel hemmt Tomaten - nicht zusammen pflanzen', type: 'avoid' },
    ],
  },
  3: {
    month: 3,
    title: 'März - Startschuss',
    tips: [
      'Erste Direktsaaten: Erbsen, Spinat, Radieschen, Möhren',
      'Vorkultur auf der Fensterbank fortsetzen',
      'Beete von Unkraut befreien',
    ],
    warnings: [
      'Nachtfröste noch möglich',
      'Beim Gießen Frostschäden vermeiden',
    ],
    activities: ['Radieschen und Spinat direkt säen', 'Jungpflanzen pikieren', 'Hochbeet vorbereiten'],
    companionPlantingTips: [
      { plant1: 'Möhren', plant2: 'Zwiebeln', benefit: 'Möhrenfliege wird abgeschreckt', type: 'good' },
      { plant1: 'Möhren', plant2: 'Radieschen', benefit: 'Radieschen lockern den Boden, Möhren geben Struktur', type: 'good' },
      { plant1: 'Erbsen', plant2: 'Möhren', benefit: 'Schöne Beetnachbarn, gleichzeitig erntereif', type: 'good' },
      { plant1: 'Zwiebeln', plant2: 'Bohnen', benefit: 'Zwiebeln hemmen Bohnen - nicht zusammen pflanzen', type: 'avoid' },
    ],
  },
  4: {
    month: 4,
    title: 'April - Wärme kommt',
    tips: [
      'Weitere Direktsaaten: Bohnen, Salate, Rucola, Rote Beete',
      'Kräuter aussäen oder pflanzen',
      'Tomaten nach draußen abhärten',
    ],
    warnings: [
      'Eisheiligen (11.-15.5.) abwarten für wärmeliebende Pflanzen',
      'Schnecken werden aktiv - Schneckenkorn bereithalten',
    ],
    activities: ['Gurken und Zucchini vorziehen', 'Stangenbohnen direkt säen', 'Beete mulchen'],
    companionPlantingTips: [
      { plant1: 'Gurke', plant2: 'Bohnen', benefit: 'Bohnen liefern Stickstoff für Gurken', type: 'good' },
      { plant1: 'Gurke', plant2: 'Erbsen', benefit: 'Gute Nachbarn, Erbsen lockern den Boden', type: 'good' },
      { plant1: 'Zucchini', plant2: 'Mais', benefit: 'Klassische Kombination (Three Sisters)', type: 'good' },
      { plant1: 'Kartoffeln', plant2: 'Tomaten', benefit: 'Nicht nebeneinander pflanzen - erhöhte Krautfäulegefahr', type: 'avoid' },
    ],
  },
  5: {
    month: 5,
    title: 'Mai - Pflanzzeit!',
    tips: [
      'Nach Eisheiligen: Tomaten, Paprika, Gurken, Zucchini auspflanzen',
      'Direktsaaten von Bohnen, Erbsen, Salat',
      'Regelmäßig gießen, besonders bei Neupflanzungen',
    ],
    warnings: [
      'Schnecken! Auf young Pflanzen aufpassen',
      'Zu dicht pflanzen vermeiden',
    ],
    activities: ['Tomaten ausgeizen und aufbinden', 'Bohnen säen', 'Kräuter pflanzen'],
    companionPlantingTips: [
      { plant1: 'Tomate', plant2: 'Basilikum', benefit: 'Verbessert Geschmack und vertreibt Schädlinge', type: 'good' },
      { plant1: 'Tomate', plant2: 'Ringelblume', benefit: 'Ringelblume vertreibt Schädlinge', type: 'good' },
      { plant1: 'Kohl', plant2: 'Tomaten', benefit: 'Beide brauchen ähnlich viel Platz, Konkurrenz um Nährstoffe', type: 'avoid' },
      { plant1: 'Erdbeeren', plant2: 'Knoblauch', benefit: 'Knoblauch schützt Erdbeeren vor Pilzkrankheiten', type: 'good' },
    ],
  },
  6: {
    month: 6,
    title: 'Juni - Wachstum',
    tips: [
      'Regelmäßig gießen, am besten morgens oder abends',
      'Ernte von Frühgemüse: Erbsen, Salat, Radieschen',
      'Nachsaaten für kontinuierliche Ernte',
    ],
    warnings: [
      'Blattläuse können massiv auftreten - frühzeitig bekämpfen',
      'Mehltau bei feuchtem Wetter',
    ],
    activities: ['Ernten und nachsäen', 'Rankhilfen anbringen', 'Düngen nicht vergessen'],
    companionPlantingTips: [
      { plant1: 'Salat', plant2: 'Radieschen', benefit: 'Radieschen wachsen schnell, Salat langsam - perfekte Mischung', type: 'good' },
      { plant1: 'Zucchini', plant2: 'Mais', benefit: 'Starkzehrer zusammen - gute Nährstoffnutzung', type: 'good' },
      { plant1: 'Paprika', plant2: 'Tomaten', benefit: 'Ähnliche Ansprüche, können zusammen im Gewächshaus', type: 'good' },
      { plant1: 'Fenchel', plant2: 'Bohnen', benefit: 'Fenchel hemmt Bohnen', type: 'avoid' },
    ],
  },
  7: {
    month: 7,
    title: 'Juli - Haupternte',
    tips: [
      'Haupterntezeit: Tomaten, Gurken, Zucchini, Bohnen',
      'Bei Hitze morgens oder abends gießen',
      'Verblühtes regelmäßig entfernen (Ausputzen)',
    ],
    warnings: [
      'Wassermangel zeigt sich schnell bei Tomaten (eingerollte Blätter)',
      'Spinnmilben bei trockener Hitze',
    ],
    activities: ['Regelmäßig ernten für mehr Ertrag', 'Tomaten und Gurken düngen', 'Kräuter schneiden'],
    companionPlantingTips: [
      { plant1: 'Tomaten', plant2: 'Knoblauch', benefit: 'Knoblauch schützt vor Pilzkrankheiten', type: 'good' },
      { plant1: 'Gurken', plant2: 'Dill', benefit: 'Dill vertreibt Schädlinge', type: 'good' },
      { plant1: 'Kartoffeln', plant2: 'Kohl', benefit: 'Beide Kohlarten profitieren von Kartoffelnähe', type: 'good' },
      { plant1: 'Schnittlauch', plant2: 'Erdbeeren', benefit: 'Schnittlauch vertreibt Pilzkrankheiten', type: 'good' },
    ],
  },
  8: {
    month: 8,
    title: 'August - Übergangszeit',
    tips: [
      'Ernte von Spätsommergemüse',
      'Beginn der Herbstkultur: Wintersalat, Spinat, Asian Salads',
      'Tomaten weiter ausputzen und ernten',
    ],
    warnings: [
      'Kraut- und Braunfäule bei Tomaten (braune Flecken)',
      'Nicht mehr zu viel düngen - Pflanzen auf Winter vorbereiten',
    ],
    activities: ['Wintersalate aussäen', 'Knoblauch für nächstes Jahr vorbereiten', 'Letzte Bohnen säen'],
    companionPlantingTips: [
      { plant1: 'Spinat', plant2: 'Erdbeeren', benefit: 'Spinat als Bodendecker unter Erdbeeren', type: 'good' },
      { plant1: 'Mangold', plant2: 'Radieschen', benefit: 'Schnelle Nachbarschaft', type: 'good' },
      { plant1: 'Knoblauch', plant2: 'Erdbeeren', benefit: 'Optimaler Pflanzzeitpunkt im Herbst', type: 'good' },
    ],
  },
  9: {
    month: 9,
    title: 'September - Herbstbeginn',
    tips: [
      'Haupterntezeit für Kürbisse und Wurzelgemüse',
      'Tomaten final ernten (grüne Tomaten nachreifen lassen)',
      'Knoblauch für nächstes Jahr stecken',
    ],
    warnings: [
      'Erster Frost kann kommen - Kürbisse und Tomaten schützen',
      'Schnecken werden wieder aktiv',
    ],
    activities: ['Kürbisse ernten und aushärten', 'Knoblauch stecken', 'Beete für Wintersalat vorbereiten'],
    companionPlantingTips: [
      { plant1: 'Kürbis', plant2: 'Mais', benefit: 'Traditionelle Mischkultur (Three Sisters)', type: 'good' },
      { plant1: 'Kürbis', plant2: 'Stangenbohnen', benefit: 'Stangenbohnen liefern Stickstoff', type: 'good' },
      { plant1: 'Lauch', plant2: 'Möhren', benefit: 'Lauchmotte und Möhrenfliege werden verwirrt', type: 'good' },
    ],
  },
  10: {
    month: 10,
    title: 'Oktober - Erntezeit',
    tips: [
      'Letzte Ernten: Kartoffeln, Rote Beete, Kohl',
      'Boden mit Kompost oder Mulch bedecken',
      'Wintergemüse ernten und lagern',
    ],
    warnings: [
      'Vor ersten Frösten ernten',
      'Kürbisse vor Frost schützen',
    ],
    activities: ['Einwintern von Kräutern', 'Zwiebeln und Knoblauch stecken', 'Beete mulchen'],
    companionPlantingTips: [
      { plant1: 'Grünkohl', plant2: 'Zwiebeln', benefit: 'Zwiebeln vertreiben Kohlweißling', type: 'good' },
      { plant1: 'Winterpostelein', plant2: 'Feldsalat', benefit: 'Beide für Herbst-/Winterernte', type: 'good' },
    ],
  },
  11: {
    month: 11,
    title: 'November - Abschluss',
    tips: [
      'Letzte Ernten und Lagergemüse einlagern',
      'Gartengeräte reinigen und einwintern',
      'Saatgut für nächstes Jahr bestellen',
    ],
    warnings: [
      'Nicht mehr umgraben - Bodenleben schonen',
      'Schneeschimmel bei Rasen vermeiden (nicht betreten)',
    ],
    activities: ['Kompost umsetzen', 'Winterschutz für empfindliche Pflanzen', 'Planung für nächstes Jahr'],
    companionPlantingTips: [
      { plant1: 'Feldsalat', plant2: 'Winterpostelein', benefit: 'Beide winterhart und für Herbst-/Winterernte', type: 'good' },
      { plant1: 'Grünkohl', plant2: 'Rosenkohl', benefit: 'Beide frosthart und gute Winterkost', type: 'good' },
    ],
  },
  12: {
    month: 12,
    title: 'Dezember - Planung',
    tips: [
      'Saatgut-Inventur und Katalog wälzen',
      'Gartenbücher und Kataloge lesen',
      'Vorsätze für die nächste Saison fassen',
    ],
    warnings: [
      'Keine Gartenarbeit bei Frost',
      'Wintergemüse nur bei Tauwetter ernten',
    ],
    activities: ['Saatgutbestellung', 'Beetplanung mit Fruchtfolge', 'Kompostieren (langsam)'],
    companionPlantingTips: [
      { plant1: 'Grünkohl', plant2: 'Lauch', benefit: 'Beide winterhart und schmecken nach Frost besser', type: 'good' },
    ],
  },
};

export function getSeasonalKnowledge(month: number): SeasonalKnowledge | undefined {
  return SEASONAL_KNOWLEDGE[month];
}

export function getCurrentSeasonalKnowledge(): SeasonalKnowledge | undefined {
  const currentMonth = new Date().getMonth() + 1;
  return SEASONAL_KNOWLEDGE[currentMonth];
}

export default SEASONAL_KNOWLEDGE;
