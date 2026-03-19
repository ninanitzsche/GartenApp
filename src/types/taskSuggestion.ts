/**
 * Task Suggestion Types
 * Rule-based task generation from plant family and season
 */

export interface TaskSuggestion {
  title: string;
  category: 'Aussaat' | 'Pflanzen' | 'Gartenarbeiten' | 'Beobachten' | 'Ernten';
  priority: 'niedrig' | 'mittel' | 'hoch';
  reason: string;
  isPestTreatment?: boolean;
}

export interface PlantFamilyRule {
  familyPattern: string;
  tasks: string[];
  priority?: 'hoch' | 'mittel' | 'niedrig';
}

export interface SeasonalTask {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  tasks: string[];
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface TaskSuggestionContext {
  plantFamily?: string;
  plantName?: string;
  pestType?: string;
  season?: Season;
  linkedPlantId?: string;
}

export const SEASONAL_TASKS: Record<Season, string[]> = {
  spring: ['Aussaat', 'Pflanzen', 'Boden vorbereiten'],
  summer: ['Gartenarbeiten', 'Ernten', 'Gießen', 'Düngen'],
  autumn: ['Ernten', 'Wintervorbereitung', 'Laub kompostieren', 'Pflanzzeit'],
  winter: ['Planung', 'Samen bestellen', 'Werkzeug pflegen'],
};

export const PLANT_FAMILY_RULES: PlantFamilyRule[] = [
  {
    familyPattern: 'Solanaceae',
    tasks: ['Ausgeizen', 'Gießen', 'Düngen', 'Ernten'],
  },
  {
    familyPattern: 'Brassicaceae',
    tasks: ['Gießen', 'Ernten', 'Schädlinge kontrollieren'],
  },
  {
    familyPattern: 'Apiaceae',
    tasks: ['Boden lockern', 'Gießen', 'Ernten'],
  },
  {
    familyPattern: 'Asteraceae',
    tasks: ['Gießen', 'Jäten', 'Ernten'],
  },
  {
    familyPattern: 'Cucurbitaceae',
    tasks: ['Gießen', 'Ernten', 'Düngen'],
  },
  {
    familyPattern: 'Lamiaceae',
    tasks: ['Gießen', 'Ernten', 'Schnitt'],
  },
  {
    familyPattern: 'Fabaceae',
    tasks: ['Rankhilfe geben', 'Ernten', 'Gießen'],
  },
  {
    familyPattern: 'Rosaceae',
    tasks: ['Gießen', 'Schnitt', 'Ernten', 'Schädlinge kontrollieren'],
  },
  {
    familyPattern: 'Poaceae',
    tasks: ['Ernten', 'Bodenpflege'],
  },
];

export const PEST_TREATMENT_TASKS: Record<string, TaskSuggestion> = {
  aphids: {
    title: 'Behandlung: Läuse bekämpfen',
    category: 'Gartenarbeiten',
    priority: 'hoch',
    reason: 'Läuse wurden erkannt - sofort behandeln',
    isPestTreatment: true,
  },
  'powdery mildew': {
    title: 'Behandlung: Mehltau behandeln',
    category: 'Gartenarbeiten',
    priority: 'hoch',
    reason: 'Mehltau erkannt - schnell behandeln',
    isPestTreatment: true,
  },
  spider_mites: {
    title: 'Behandlung: Spinnmilben behandeln',
    category: 'Gartenarbeiten',
    priority: 'hoch',
    reason: 'Spinnmilben erkannt - sofort behandeln',
    isPestTreatment: true,
  },
  slugs: {
    title: 'Behandlung: Schnecken bekämpfen',
    category: 'Gartenarbeiten',
    priority: 'mittel',
    reason: 'Schnecken erkannt - Fraßschaden verhindern',
    isPestTreatment: true,
  },
  leaf_spot: {
    title: 'Behandlung: Blattflecken behandeln',
    category: 'Gartenarbeiten',
    priority: 'mittel',
    reason: 'Blattflecken erkannt - Ausbreitung verhindern',
    isPestTreatment: true,
  },
  default: {
    title: 'Behandlung durchführen',
    category: 'Gartenarbeiten',
    priority: 'hoch',
    reason: 'Pest erkannt - Behandlung erforderlich',
    isPestTreatment: true,
  },
};

export const TASK_CATEGORY_MAP: Record<string, 'Aussaat' | 'Pflanzen' | 'Gartenarbeiten' | 'Beobachten' | 'Ernten'> = {
  'Aussaat': 'Aussaat',
  'Pflanzen': 'Pflanzen',
  'Ausgeizen': 'Gartenarbeiten',
  'Gießen': 'Gartenarbeiten',
  'Düngen': 'Gartenarbeiten',
  'Ernten': 'Ernten',
  'Jäten': 'Gartenarbeiten',
  'Schnitt': 'Gartenarbeiten',
  'Rankhilfe geben': 'Gartenarbeiten',
  'Boden lockern': 'Gartenarbeiten',
  'Boden pflegen': 'Gartenarbeiten',
  'Bodenpflege': 'Gartenarbeiten',
  'Boden vorbereiten': 'Gartenarbeiten',
  'Schädlinge kontrollieren': 'Beobachten',
  'Laub kompostieren': 'Gartenarbeiten',
  'Pflanzzeit': 'Pflanzen',
  'Planung': 'Beobachten',
  'Samen bestellen': 'Beobachten',
  'Werkzeug pflegen': 'Gartenarbeiten',
  'Wintervorbereitung': 'Gartenarbeiten',
  'Gartenarbeiten': 'Gartenarbeiten',
  'Behandlung: Läuse bekämpfen': 'Gartenarbeiten',
  'Behandlung: Mehltau behandeln': 'Gartenarbeiten',
  'Behandlung: Spinnmilben behandeln': 'Gartenarbeiten',
  'Behandlung: Schnecken bekämpfen': 'Gartenarbeiten',
  'Behandlung: Blattflecken behandeln': 'Gartenarbeiten',
  'Behandlung durchführen': 'Gartenarbeiten',
};

export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}
