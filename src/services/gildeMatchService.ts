import { Gilde, GildeMatch } from '../types/gilde';

export function calculateMatchScore(bedPlants: string[], gilde: Gilde): number {
  if (!gilde.plants || gilde.plants.length === 0) return 0;
  
  const gildePlantNames = gilde.plants.map(p => p.name.toLowerCase());
  const bedPlantNames = bedPlants.map(p => p.toLowerCase());
  
  const matching = gildePlantNames.filter(name => 
    bedPlantNames.some(bedName => bedName.includes(name) || name.includes(bedName))
  );
  
  return Math.round((matching.length / gildePlantNames.length) * 100);
}

export function getMatchingPlants(bedPlants: string[], gilde: Gilde): { matching: string[]; missing: string[] } {
  if (!gilde.plants || gilde.plants.length === 0) return { matching: [], missing: [] };
  
  const gildePlantNames = gilde.plants.map(p => p.name.toLowerCase());
  const bedPlantNames = bedPlants.map(p => p.toLowerCase());
  
  const matching: string[] = [];
  const missing: string[] = [];
  
  for (const gildePlant of gildePlantNames) {
    const found = bedPlantNames.some(bedName => 
      gildePlant.includes(bedName) || bedName.includes(gildePlant)
    );
    if (found) {
      matching.push(gildePlant);
    } else {
      missing.push(gildePlant);
    }
  }
  
  return { matching, missing };
}

export function calculateGildeMatches(bedPlants: string[], gilden: Gilde[]): GildeMatch[] {
  return gilden.map(gilde => {
    const { matching, missing } = getMatchingPlants(bedPlants, gilde);
    return {
      gilde,
      matchScore: calculateMatchScore(bedPlants, gilde),
      matchingPlants: matching,
      missingPlants: missing,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}