/**
 * AI Plant Identification Types
 * Using Pl@ntNet API
 */

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

export interface PlantIdentificationCacheEntry {
  imageHash: string;
  result: PlantIdentificationResult;
  timestamp: number;
}

export interface PestDetectionResult {
  pest: string;
  confidence: number;
  treatment: string;
  knowledgeLinks?: string[];
}

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
  default_image?: {
    regular_url: string;
    medium_url: string;
    small_url: string;
  };
}

export interface PermapeoplePlantData {
  id: number;
  name: string;
  scientific_name: string;
  data: Array<{
    key: string;
    value: string;
  }>;
}

export interface CombinedPlantData {
  plantnet: PlantNetData | null;
  perenual: PerenualPlantData | null;
  permapeople: PermapeoplePlantData | null;
  notFound: boolean;
  sources: string[];
}

export interface PlantNetSpecies {
  scientificNameWithoutAuthor: string;
  scientificNameAuthorship: string;
  scientificName: string;
  genus: {
    scientificNameWithoutAuthor: string;
  };
  family: {
    scientificNameWithoutAuthor: string;
  };
  commonNames: string[];
}

export interface PlantNetResult {
  score: number;
  species: PlantNetSpecies;
  gbif?: { id: string };
  powo?: { id: string };
}

export interface PlantNetResponse {
  query: {
    project: string;
    images: string[];
  };
  bestMatch: string;
  results: PlantNetResult[];
  predictedOrgans: Array<{
    organ: string;
    score: number;
  }>;
  remainingIdentificationRequests: number;
}

export interface IdentificationCache {
  imageHash: string;
  result: PlantIdentificationResult;
  timestamp: number;
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
};

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,
  LOW: 0.3,
};

export interface AIIdentification {
  id: string;
  user_id: string;
  ai_type: 'plant' | 'pest';
  image_url: string;
  result_json: any;
  confidence: number;
  created_at: string;
}

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

export type AIAnalysisResult = AIIdentification;
