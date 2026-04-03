interface Task {
  id: string;
  title: string;
  completed_at?: string | null;
  linked_plants?: Array<{ id: string; name: string }>;
}

const PLANT_NAME_PATTERNS = [
  /^Deine\s+(.+?)\s+braucht/,
  /^Nur noch\s+\d+\s+Aufgabe(?:n)?\s+f(?:ür|or)\s+(.+?)!/,
  /^Nur noch\s+\d+\s+(.+?)\s+Aufgabe$/,
  /^(.+?)\s+wartet\s+auf\s+dich/,
  /^(.+?)\s+braucht\s+noch\s+\d+\s+Aufgabe/,
  /^(.+?)\s+braucht\s+dich/,
];

export function extractPlantNameFromMotivation(motivation: string): string | null {
  for (const pattern of PLANT_NAME_PATTERNS) {
    const match = motivation.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function normalizeUmlauts(str: string): string {
  return str
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/Ä/g, 'A')
    .replace(/Ö/g, 'O')
    .replace(/Ü/g, 'U');
}

export function filterTasksByMotivation(
  tasks: Task[],
  motivation: string
): Task[] {
  const plantNameFromMotivation = extractPlantNameFromMotivation(motivation);

  if (!plantNameFromMotivation) {
    return tasks;
  }

  const filtered = tasks.filter(t => {
    const linkedPlantName = t.linked_plants?.[0]?.name?.toLowerCase() || '';
    const searchName = plantNameFromMotivation.toLowerCase();

    return (
      linkedPlantName.includes(searchName) ||
      searchName.includes(linkedPlantName) ||
      linkedPlantName.includes(normalizeUmlauts(searchName))
    );
  });

  if (filtered.length === 0) {
    return tasks;
  }

  return filtered;
}