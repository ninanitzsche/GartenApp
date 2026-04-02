/**
 * AI Plant Identification Types
 */

import { Plant } from './plant';

export type AICacheType = 'plant' | 'pest' | 'suggestion';

export const CACHE_TTL = {
  PLANT: 7 * 24 * 60 * 60 * 1000,
  PEST: 24 * 60 * 60 * 1000,
  SUGGESTION: 24 * 60 * 60 * 1000,
} as const;

export interface AICacheEntry<T> {
  type: AICacheType;
  data: T;
  timestamp: number;
  ttl: number;
}

// --- PlantNet ---

export interface PlantNetData {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  genus: string;
  commonNames: string[];
  confidence: number;
  gbifId?: string;
  powoId?: string;
  images: Array<{
    url: string;
    license: string;
    author?: string;
  }>;
  notFound?: boolean;
}

export interface PlantNetSpecies {
  scientificNameWithoutAuthor: string;
  scientificNameAuthorship: string;
  scientificName: string;
  genus: { scientificNameWithoutAuthor: string };
  family: { scientificNameWithoutAuthor: string };
  commonNames: string[];
}

export interface PlantNetResult {
  score: number;
  species: PlantNetSpecies;
  gbif?: { id: string };
  powo?: { id: string };
}

export interface PlantNetResponse {
  query: { project: string; images: string[] };
  bestMatch: string;
  results: PlantNetResult[];
  predictedOrgans: Array<{ organ: string; score: number }>;
  remainingIdentificationRequests: number;
}

// --- Perenual ---

export interface PerenualPlantData {
  id: number;
  common_name: string;
  scientific_name: string[];
  family: string;
  cycle: 'Annual' | 'Perennial' | 'Biennial';
  watering: 'frequent' | 'average' | 'minimum' | 'none';
  watering_general_benchmark?: { value: string; unit: string };
  sunlight: string[];
  hardiness: { min: string; max: string };
  care_level: 'Easy' | 'Medium' | 'Hard';
  growth_rate: 'Low' | 'Medium' | 'High';
  soil: string[];
  maintenance: string;
  description: string;
  pruning_month?: string[];
  flowering_season?: string;
  fruiting_season?: string;
  harvest_season?: string;
  harvest_method?: string;
  seeds?: number;
  attracts?: string[];
  drought_tolerant?: boolean;
  salt_tolerant?: boolean;
  thorny?: boolean;
  invasive?: boolean;
  rare?: boolean;
  tropical?: boolean;
  cuisine?: boolean;
  indoor?: boolean;
  medicinal?: boolean;
  poisonous_to_humans?: boolean;
  poisonous_to_pets?: boolean;
  edible_fruit?: boolean;
  edible_leaf?: boolean;
  leaves?: boolean;
  default_image?: {
    regular_url: string;
    medium_url: string;
    small_url: string;
  };
}

// --- Permapeople ---

export interface PermapeoplePlantData {
  id: number;
  name: string;
  scientific_name: string;
  data: Array<{ key: string; value: string }>;
  layers?: string[];
  edible_parts?: string[];
  water_requirement?: string;
  light_requirement?: string;
  usda_hardiness_zone?: string;
  soil_type?: string[];
}

// --- AI Care ---

export interface AIPlantCareData {
  plantingNotes: string[];
  careTips: string[];
  companionPlants: string[];
  badCompanions: string[];
  tasks: Array<{ title: string; zeitraum: string; category: string }>;
  profile: {
    height: string;
    spread: string;
    waterNeeds: string;
    wateringMethod: string;
    light: string;
    soil: string;
    pollinatorScore: number;
    beneficialInsectScore: number;
    frostTolerance: string;
    isToxic: boolean;
    toxicTo: string;
    isInvasive: boolean;
    edibleParts: string;
    harvestTime: string;
    expectedYield: string;
  };
  permaculture: {
    pestControl: string[];
    soilImprovement: string[];
    interactions: string[];
    weedManagement: string[];
  };
}

export interface AITaskSuggestion {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  season: string;
  frequency?: string;
}

// --- Combined ---

export interface CombinedPlantData {
  plantnet: PlantNetData | null;
  perenual: PerenualPlantData | null;
  permapeople: PermapeoplePlantData | null;
  ai_care: AIPlantCareData | null;
  notFound: boolean;
  sources: string[];
}

// --- Identification ---

export interface PlantIdentificationResult {
  name: string;
  scientificName: string;
  confidence: number;
  family: string;
  commonNames: string[];
  gbifId?: string;
  powoId?: string;
  genus?: string;
  images?: string[];
}

export interface PlantIdentificationCacheEntry {
  imageHash: string;
  result: PlantIdentificationResult;
  timestamp: number;
}

export interface IdentificationCache {
  imageHash: string;
  result: PlantIdentificationResult;
  timestamp: number;
}

// --- Pest Detection ---

export interface PestDetectionResult {
  pest: string;
  confidence: number;
  treatment: string;
  knowledgeLinks?: string[];
}

// --- Task Suggestions ---

export interface SuggestionCacheEntry {
  plantId: string;
  season: string;
  result: TaskSuggestion[];
  timestamp: number;
}

export interface TaskSuggestion {
  id?: string;
  title: string;
  description: string;
  category: string;
  priority?: string;
  season?: string;
}

// --- Disease ---

export interface PlantDiseaseData {
  results: Array<{
    name: string;
    label: string;
    score: number;
    description: string;
    images?: Array<{
      organ: string;
      url: { o: string; m: string; s: string };
      author: string;
      license: string;
    }>;
  }>;
  remainingRequests: number;
  identifiedAt: string;
}

// --- AI Photo Analysis ---

export interface AIPhotoAnalysis {
  plantIdentification: PlantIdentificationResult | null;
  diseaseAnalysis: PlantDiseaseData | null;
  healthStatus: 'gesund' | 'krank' | 'unsicher';
  matchingPlants: Plant[];
  bestMatch: Plant | null;
  errors?: {
    identification?: string;
    disease?: string;
    matching?: string;
  };
}

// --- AI Meta ---

export interface AIIdentification {
  id: string;
  user_id: string;
  ai_type: 'plant' | 'pest';
  image_url: string;
  result_json: any;
  confidence: number;
  created_at: string;
}

export type AIAnalysisResult = AIIdentification;

export interface PlantIdentificationLink {
  id: string;
  plant_id: string;
  identification_id: string;
  linked_at: string;
}

export interface PhotoAIAnalysis {
  id: string;
  photo_id: string;
  ai_type: string;
  analysis_id: string;
  created_at: string;
}

export interface AIError {
  code: string;
  message: string;
}

export const AI_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  NO_RESULTS: 'NO_RESULTS',
  LOW_CONFIDENCE: 'LOW_CONFIDENCE',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_IMAGE: 'INVALID_IMAGE',
} as const;

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
  LOW: 0.3,
} as const;
