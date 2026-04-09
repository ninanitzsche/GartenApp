import { Gilde } from '../types/gilde';

export const SYSTEM_GILDEN: Gilde[] = [
  {
    id: 'system-1',
    number: 1,
    name: 'Milpa (Die Drei Schwestern)',
    concept: 'Traditionelle Synergie',
    plants: [
      { name: 'Mais', role: 'Rankgerüst' },
      { name: 'Feuerbohnen', role: 'Stickstofffixierung' },
      { name: 'Kürbis/Hokkaido', role: 'Lebender Mulch' },
      { name: 'Kapuzinerkresse', role: 'Blattlaus-Abwehr' },
    ],
    is_system: true,
  },
  {
    id: 'system-2',
    number: 2,
    name: 'Vertikal-Nasch-Gilde',
    concept: 'Maximale Ernte auf kleinster Fläche',
    plants: [
      { name: 'Wassermelone Sugar Baby', role: 'A-Frame-Gerüst' },
      { name: 'Pak Choi', role: 'Halbschatten unterm Gerüst' },
      { name: 'Pflücksalat', role: 'Halbschatten' },
      { name: 'Lauchzwiebeln', role: 'Schwellschutz durch Geruch' },
      { name: 'Basilikum', role: 'Aroma und Gesundheit' },
    ],
    is_system: true,
  },
  {
    id: 'system-3',
    number: 3,
    name: 'Kartoffel-Gilde (No-Dig)',
    concept: 'Bodenaufbau ohne Umgraben',
    plants: [
      { name: 'Kartoffeln', role: 'Im Mulch-Sandwich', notes: 'Heu, Stroh, Beinwell' },
      { name: 'Dicke Bohnen', role: 'Stickstoffversorgung' },
      { name: 'Tagetes', role: 'Gegen Nematoden' },
      { name: 'Meerrettich', role: 'Pilzschutz' },
      { name: 'Knoblauch', role: 'Pilzschutz (Krautfäule)' },
      { name: 'Rote Rüben', role: 'Lückenfüller' },
    ],
    is_system: true,
  },
  {
    id: 'system-4',
    number: 4,
    name: 'Fruchtgemüse-Insel',
    concept: 'Kombination aus Starkzehrern und Sonnenanbetern',
    plants: [
      { name: 'Zucchini', role: 'Bodenschutz' },
      { name: 'Gurken', role: 'Vertikal am A-Frame' },
      { name: 'Paprika', role: 'Südkante (Sonne pur)' },
      { name: 'Borretsch', role: 'Bestäubungsmagnet' },
      { name: 'Physalis', role: 'Solitärstellung' },
    ],
    is_system: true,
  },
  {
    id: 'system-5',
    number: 5,
    name: 'Physalis & Süßkartoffel-Mix',
    concept: 'Wärme-liebende Spezialkulturen',
    plants: [
      { name: 'Süßkartoffel', role: 'Dichter Blätterteppich (Bodenschutz)' },
      { name: 'Physalis', role: 'Buschartiger Wuchs' },
      { name: 'Zinnien', role: 'Insektenweide' },
      { name: 'Kornblumen', role: 'Insektenweide' },
    ],
    is_system: true,
  },
];