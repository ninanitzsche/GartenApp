/**
 * Gamification Service
 * Streak tracking, achievements, and motivational data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchTasks } from './taskService';
import { getPlantTaskProgress, PlantTaskProgress } from './dashboardService';

const STREAK_KEY = '@gartenplaner_streak';
const ACHIEVEMENTS_KEY = '@gartenplaner_achievements';

// ── Streak ──

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
}

export async function calculateStreak(): Promise<StreakData> {
  try {
    const tasks = await fetchTasks();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const completedDates = tasks
      .filter(t => t.completed_at)
      .map(t => {
        const date = new Date(t.completed_at!);
        return date.toISOString().split('T')[0];
      })
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort()
      .reverse();

    if (completedDates.length === 0) {
      return { currentStreak: 0, bestStreak: 0, lastActiveDate: null };
    }

    const dateSet = new Set(completedDates);
    let currentStreak = 0;
    
    if (completedDates[0] === todayStr || completedDates[0] === yesterdayStr) {
      let checkDay: string = completedDates[0];
      while (dateSet.has(checkDay)) {
        currentStreak++;
        const d = new Date(checkDay);
        d.setDate(d.getDate() - 1);
        checkDay = d.toISOString().split('T')[0];
      }
    }

    // Best streak
    let bestStreak = 1;
    let run = 1;
    for (let i = 1; i < completedDates.length; i++) {
      const prev = new Date(completedDates[i - 1]);
      const curr = new Date(completedDates[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1) {
        run++;
        bestStreak = Math.max(bestStreak, run);
      } else {
        run = 1;
      }
    }
    bestStreak = Math.max(bestStreak, currentStreak);

    const streakData: StreakData = {
      currentStreak,
      bestStreak,
      lastActiveDate: completedDates[0],
    };

    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
    return streakData;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { currentStreak: 0, bestStreak: 0, lastActiveDate: null };
  }
}

// ── Achievements ──

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_task', title: 'Erste Spur', description: 'Erste Aufgabe erledigt', icon: '👣' },
  { id: 'ten_tasks', title: 'Fleißiger Gärtner', description: '10 Aufgaben erledigt', icon: '🌱' },
  { id: 'fifty_tasks', title: 'Gartenprofi', description: '50 Aufgaben erledigt', icon: '🌳' },
  { id: 'first_harvest', title: 'Erntezeit', description: 'Erste Ernte eingetragen', icon: '🌾' },
  { id: 'streak_3', title: 'Dranbleiber', description: '3 Tage Streak', icon: '🔥' },
  { id: 'streak_7', title: 'Gartenwoche', description: '7 Tage Streak', icon: '⚡' },
  { id: 'all_tasks_done', title: 'Alles geschafft', description: 'Alle Aufgaben einer Pflanze fertig', icon: '🏆' },
  { id: 'five_plants', title: 'Sammler', description: '5 Pflanzen angelegt', icon: '🌿' },
];

export async function checkAchievements(
  streakData: StreakData,
  plantProgress: PlantTaskProgress[],
): Promise<Achievement[]> {
  try {
    const raw = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    const existing: Record<string, string> = raw ? JSON.parse(raw) : {};
    const tasks = await fetchTasks();
    const completedCount = tasks.filter(t => t.completed_at).length;

    const newlyUnlocked: Achievement[] = [];

    const checks: Record<string, () => boolean> = {
      first_task: () => completedCount >= 1,
      ten_tasks: () => completedCount >= 10,
      fifty_tasks: () => completedCount >= 50,
      first_harvest: () => false, // checked separately from HomeScreen
      streak_3: () => streakData.currentStreak >= 3,
      streak_7: () => streakData.currentStreak >= 7,
      all_tasks_done: () => plantProgress.some(p => p.allDone),
      five_plants: () => plantProgress.length >= 5,
    };

    for (const def of ACHIEVEMENT_DEFS) {
      if (!existing[def.id] && checks[def.id]?.()) {
        const unlockedAt = new Date().toISOString();
        existing[def.id] = unlockedAt;
        newlyUnlocked.push({ ...def, unlockedAt });
      }
    }

    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(existing));

    return ACHIEVEMENT_DEFS.map(def => ({
      ...def,
      unlockedAt: existing[def.id] || null,
    }));
  } catch (error) {
    console.error('Error checking achievements:', error);
    return ACHIEVEMENT_DEFS.map(d => ({ ...d, unlockedAt: null }));
  }
}

// ── Motivations ──

export interface MotivationResult {
  message: string;
  plantId?: string;
}

export function getMotivationMessage(
  plantProgress: PlantTaskProgress[], 
  todayCompletedCount: number = 0
): MotivationResult {
  // If no tasks completed today, motivate to start
  if (todayCompletedCount === 0) {
    return { message: 'Starte mit deiner ersten Aufgabe! 🌱' };
  }

  // Find plants with remaining tasks (not all done AND has open tasks)
  const openPlants = plantProgress
    .filter(p => !p.allDone && (p.totalTasks - p.completedTasks) > 0);

  if (openPlants.length === 0) {
    if (plantProgress.some(p => p.allDone)) {
      return { message: 'Alle Aufgaben geschafft! Dein Garten blüht! 🌻' };
    }
    return { message: 'Gut gemacht heute! 🌟' };
  }

  // Random plant with remaining tasks
  const randomPlant = openPlants[Math.floor(Math.random() * openPlants.length)];
  const remaining = randomPlant.totalTasks - randomPlant.completedTasks;

  console.log('[MOTIVATION] Selected plant:', {
    plantId: randomPlant.plantId,
    plantName: randomPlant.plantName,
    remaining,
    totalTasks: randomPlant.totalTasks,
  });

  // Base motivation
  let plantMsg = '';
  if (remaining === 1) {
    plantMsg = `Nur noch 1 Aufgabe für ${randomPlant.plantName}! 🌿`;
  } else {
    const options = [
      `Deine ${randomPlant.plantName} braucht dich 💚`,
      `${randomPlant.plantName} wartet auf dich 🌿`,
      `${randomPlant.plantName} braucht noch ${remaining} Aufgaben 🍃`,
    ];
    plantMsg = options[Math.floor(Math.random() * options.length)];
  }

  // Add encouragement if 5+ tasks done today
  if (todayCompletedCount >= 5) {
    return { 
      message: `${plantMsg} — Stark, du hast heute schon ${todayCompletedCount} Tasks abgeschlossen! 🌟`,
      plantId: randomPlant.plantId 
    };
  }

  return { message: plantMsg, plantId: randomPlant.plantId };
}

// Helper function to get today's completed task count
export function getTodayCompletedCount(tasks: any[]): number {
  const today = new Date().toISOString().split('T')[0];
  return tasks.filter(t => {
    if (!t.completed_at) return false;
    const completedDate = new Date(t.completed_at).toISOString().split('T')[0];
    return completedDate === today;
  }).length;
}