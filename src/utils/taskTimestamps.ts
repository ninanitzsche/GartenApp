/**
 * Task Timeline Mapping
 * Maps tasks to seasonal time windows instead of exact dates
 */

export type TimeWindow = 'winter' | 'spring' | 'spring-late' | 'summer-early' | 'summer-late' | 'autumn';

export interface TaskWithTimeWindow {
  id: string;
  title: string;
  category: 'planting' | 'pruning' | 'watering' | 'mulching' | 'harvesting' | 'maintenance';
  priority: 'hoch' | 'mittel';
  scheduled_date: string; // Keep original for reference
  timeWindow: TimeWindow;
  monthLabel: string; // Human-readable: "Januar", "Februar", etc.
}

// Map months to time windows
const monthToTimeWindow = {
  1: 'winter' as const,     // Januar
  2: 'winter' as const,     // Februar
  3: 'spring' as const,     // März
  4: 'spring' as const,     // April
  5: 'spring-late' as const, // Mai
  6: 'summer-early' as const, // Juni
  7: 'summer-late' as const,  // Juli
  8: 'autumn' as const,     // August
  9: 'autumn' as const,     // September
  10: 'autumn' as const,    // Oktober
  11: 'winter' as const,    // November
  12: 'winter' as const,    // Dezember
};

const monthNames = {
  1: 'Januar',
  2: 'Februar',
  3: 'März',
  4: 'April',
  5: 'Mai',
  6: 'Juni',
  7: 'Juli',
  8: 'August',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Dezember',
};

// Time window labels
const timeWindowLabels = {
  winter: 'Winter (Jan-Feb)',
  spring: 'Frühjahr (März-April)',
  'spring-late': 'Mai - Frühsommer',
  'summer-early': 'Sommer (Juni)',
  'summer-late': 'Hochsommer (Juli)',
  autumn: 'Herbst (Aug-Okt)',
};

/**
 * Convert a task with scheduled_date to include timeWindow info
 */
export function mapTaskToTimeWindow(task: any): TaskWithTimeWindow {
  const [year, month, day] = task.scheduled_date.split('-').map(Number);
  const monthNum = month as keyof typeof monthNames;

  return {
    ...task,
    timeWindow: monthToTimeWindow[monthNum] || 'winter',
    monthLabel: monthNames[monthNum] || 'Unbekannt',
  };
}

/**
 * Group tasks by time window
 */
export function groupTasksByTimeWindow(tasks: TaskWithTimeWindow[]) {
  const grouped: { [key in TimeWindow]: TaskWithTimeWindow[] } = {
    winter: [],
    spring: [],
    'spring-late': [],
    'summer-early': [],
    'summer-late': [],
    autumn: [],
  };

  tasks.forEach(task => {
    grouped[task.timeWindow].push(task);
  });

  return grouped;
}

/**
 * Get time window label
 */
export function getTimeWindowLabel(timeWindow: TimeWindow): string {
  return timeWindowLabels[timeWindow] || timeWindow;
}

/**
 * Sample task data with time windows
 * (This would be replaced by actual DB queries)
 */
export const SAMPLE_TASKS_WITH_TIME_WINDOWS: TaskWithTimeWindow[] = [
  {
    id: '1',
    title: 'Bärlauch-Samen Stratifizieren (Kühlschrank)',
    category: 'maintenance',
    priority: 'mittel',
    scheduled_date: '2026-01-15',
    timeWindow: 'winter',
    monthLabel: 'Januar',
  },
  {
    id: '2',
    title: 'Winterschnitt Kernobst, Wein & Beerensträucher',
    category: 'pruning',
    priority: 'mittel',
    scheduled_date: '2026-02-15',
    timeWindow: 'winter',
    monthLabel: 'Februar',
  },
  {
    id: '3',
    title: 'Rückschnitt der alten Stauden & Kräuter',
    category: 'pruning',
    priority: 'mittel',
    scheduled_date: '2026-03-01',
    timeWindow: 'spring',
    monthLabel: 'März',
  },
  {
    id: '4',
    title: 'Tomaten Vorzucht starten',
    category: 'maintenance',
    priority: 'hoch',
    scheduled_date: '2026-03-15',
    timeWindow: 'spring',
    monthLabel: 'März',
  },
  {
    id: '5',
    title: 'Aussaat Zwiebeln & robuste Kräuter / Blaukissen',
    category: 'planting',
    priority: 'mittel',
    scheduled_date: '2026-03-20',
    timeWindow: 'spring',
    monthLabel: 'März',
  },
  {
    id: '6',
    title: 'Brennnessel-Barriere anlegen (Pappen-Trick & Stauden)',
    category: 'maintenance',
    priority: 'mittel',
    scheduled_date: '2026-03-25',
    timeWindow: 'spring',
    monthLabel: 'März',
  },
  {
    id: '7',
    title: 'Wassermelone Vorzucht starten',
    category: 'watering',
    priority: 'hoch',
    scheduled_date: '2026-04-10',
    timeWindow: 'spring',
    monthLabel: 'April',
  },
  {
    id: '8',
    title: 'Kartoffeln legen (Mulchkultur/No-Dig)',
    category: 'mulching',
    priority: 'mittel',
    scheduled_date: '2026-04-15',
    timeWindow: 'spring',
    monthLabel: 'April',
  },
  {
    id: '9',
    title: 'Blumen & Stauden für Außenbereiche säen/pflanzen',
    category: 'planting',
    priority: 'mittel',
    scheduled_date: '2026-04-20',
    timeWindow: 'spring',
    monthLabel: 'April',
  },
  {
    id: '10',
    title: 'Neuseeländer Spinat Samen einweichen',
    category: 'maintenance',
    priority: 'mittel',
    scheduled_date: '2026-05-10',
    timeWindow: 'spring-late',
    monthLabel: 'Mai',
  },
  {
    id: '11',
    title: 'Neuseeländer Spinat & Gründüngung aussäen (Lebender Mulch)',
    category: 'planting',
    priority: 'mittel',
    scheduled_date: '2026-05-11',
    timeWindow: 'spring-late',
    monthLabel: 'Mai',
  },
  {
    id: '12',
    title: 'Hauptaussaat: Mais, Bohnen, Gurken & Kürbis (Drei Schwestern)',
    category: 'planting',
    priority: 'mittel',
    scheduled_date: '2026-05-15',
    timeWindow: 'spring-late',
    monthLabel: 'Mai',
  },
  {
    id: '13',
    title: 'Tomaten & Wassermelonen auspflanzen',
    category: 'watering',
    priority: 'mittel',
    scheduled_date: '2026-05-16',
    timeWindow: 'spring-late',
    monthLabel: 'Mai',
  },
  {
    id: '14',
    title: 'Schneckenschutz-Wache (Kritische Phase)',
    category: 'maintenance',
    priority: 'hoch',
    scheduled_date: '2026-05-20',
    timeWindow: 'spring-late',
    monthLabel: 'Mai',
  },
  {
    id: '15',
    title: 'Große Mulch-Aktion (Boden abdecken)',
    category: 'mulching',
    priority: 'mittel',
    scheduled_date: '2026-06-01',
    timeWindow: 'summer-early',
    monthLabel: 'Juni',
  },
  {
    id: '16',
    title: 'Permakultur-Jauche ansetzen/gießen (Starkzehrer-Schub)',
    category: 'watering',
    priority: 'mittel',
    scheduled_date: '2026-06-07',
    timeWindow: 'summer-early',
    monthLabel: 'Juni',
  },
  {
    id: '17',
    title: 'Ernte-Check & Lücken füllen (Permakultur-Erhalt)',
    category: 'harvesting',
    priority: 'mittel',
    scheduled_date: '2026-07-15',
    timeWindow: 'summer-late',
    monthLabel: 'Juli',
  },
  {
    id: '18',
    title: 'Sommerschnitt Beeren & Steinobst (nach Ernte)',
    category: 'pruning',
    priority: 'mittel',
    scheduled_date: '2026-07-25',
    timeWindow: 'summer-late',
    monthLabel: 'Juli',
  },
  {
    id: '19',
    title: 'Saatgut für nächstes Jahr ernten',
    category: 'harvesting',
    priority: 'mittel',
    scheduled_date: '2026-08-20',
    timeWindow: 'autumn',
    monthLabel: 'August',
  },
  {
    id: '20',
    title: 'Garten winterfest machen (Permakultur-Art)',
    category: 'maintenance',
    priority: 'mittel',
    scheduled_date: '2026-10-25',
    timeWindow: 'autumn',
    monthLabel: 'Oktober',
  },
];
