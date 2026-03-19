/**
 * AI Plant Identification Types
 * Using Pl@ntNet API
 */

export interface PlantIdentificationResult {
  name: string;
  scientificName: string;
  confidence: number;
  family: string;
  commonNames: string[];
  gbifId?: string;
  powoId?: string;
}

export interface Pl@ntNetSpecies {
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

export interface Pl@ntNetResult {
  score: number;
  species: Pl@ntNetSpecies;
  gbif?: { id: string };
  powo?: { id: string };
}

export interface Pl@ntNetResponse {
  query: {
    project: string;
    images: string[];
  };
  bestMatch: string;
  results: Pl@ntNetResult[];
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
