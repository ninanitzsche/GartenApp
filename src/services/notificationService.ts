/**
 * NotificationService - Push-Benachrichtigungen
 * Story 050: Push-Benachrichtigungen
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = '@gartenplaner_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  harvestReminders: boolean;
  seasonChanges: boolean;
  quietHoursStart: number; // 0-23
  quietHoursEnd: number; // 0-23
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  taskReminders: true,
  harvestReminders: true,
  seasonChanges: true,
  quietHoursStart: 22,
  quietHoursEnd: 7,
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
} as any);

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Standard',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D9D4F',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const saved = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return defaultSettings;
  }
}

export async function saveNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

export async function scheduleTaskNotification(
  taskId: string,
  taskTitle: string,
  dueDate: Date
): Promise<string | null> {
  try {
    const settings = await getNotificationSettings();
    if (!settings.enabled || !settings.taskReminders) {
      return null;
    }

    const now = new Date();
    const hour = now.getHours();
    if (hour >= settings.quietHoursStart || hour < settings.quietHoursEnd) {
      // Schedule for after quiet hours
      const scheduleDate = new Date(dueDate);
      scheduleDate.setHours(settings.quietHoursEnd, 0, 0, 0);
      if (scheduleDate <= now) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌱 Aufgabe fällig',
          body: taskTitle,
          data: { taskId, type: 'task' },
        },
        trigger: {
          type: 'date',
          date: scheduleDate,
        } as any,
      });

      return notificationId;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌱 Aufgabe fällig',
        body: taskTitle,
        data: { taskId, type: 'task' },
      },
      trigger: {
        date: dueDate,
      } as any,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling task notification:', error);
    return null;
  }
}

export async function scheduleHarvestNotification(
  plantId: string,
  plantName: string,
  harvestDate: Date
): Promise<string | null> {
  try {
    const settings = await getNotificationSettings();
    if (!settings.enabled || !settings.harvestReminders) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍅 Erntezeit!',
        body: `${plantName} ist bereit zur Ernte`,
        data: { plantId, type: 'harvest' },
      },
      trigger: {
        date: harvestDate,
      } as any,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling harvest notification:', error);
    return null;
  }
}

export async function scheduleSeasonChangeNotification(
  season: string,
  seasonLabel: string
): Promise<string | null> {
  try {
    const settings = await getNotificationSettings();
    if (!settings.enabled || !settings.seasonChanges) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌿 Saisonwechsel',
        body: `Es ist ${seasonLabel}! Neue Pflanzempfehlungen verfügbar.`,
        data: { season, type: 'season' },
      },
      trigger: {
        seconds: 60, // 1 minute delay for demo
      } as any,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling season notification:', error);
    return null;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}
