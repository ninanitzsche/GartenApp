export const PLANT_ROLES = [
  'Rankgerüst',
  'Stickstofffixierung',
  'Lebender Mulch',
  'Bestäubungsmagnet',
  'Pilzschutz',
  'Blattlaus-Abwehr',
  'Lückenfüller',
  'Halbschatten',
  'Aroma',
  'Bodenschutz',
  'Hauptpflanze',
  'Begleitpflanze',
  'Füllpflanze',
] as const;

export type PlantRole = typeof PLANT_ROLES[number];