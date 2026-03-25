/**
 * OfflineCacheService - Offline-Caching
 * Story 051: Offline-Caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetInfo } from '@react-native-community/netinfo';

const CACHE_PREFIX = '@gartenplaner_cache_';
const SYNC_QUEUE_KEY = '@gartenplaner_sync_queue';
const LAST_SYNC_KEY = '@gartenplaner_last_sync';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

class OfflineCacheService {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  constructor() {
    this.initNetworkListener();
  }

  private initNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  // Cache Management
  async setCache<T>(key: string, data: T, ttlMinutes: number = 60): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttlMinutes * 60 * 1000,
      };
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > entry.expiresAt) {
        await this.removeCache(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  async removeCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Sync Queue Management
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const newItem: SyncQueueItem = {
        ...item,
        id: `${item.type}_${item.table}_${Date.now()}`,
        timestamp: Date.now(),
      };
      queue.push(newItem);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

      // Try to sync immediately if online
      if (this.isOnline) {
        await this.processSyncQueue();
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    try {
      this.syncInProgress = true;
      const queue = await this.getSyncQueue();

      for (const item of queue) {
        try {
          // Process each item - in a real app, this would call Supabase
          console.log('Processing sync item:', item);
          
          // Remove from queue after successful sync
          const updatedQueue = queue.filter(q => q.id !== item.id);
          await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
        } catch (error) {
          console.error('Error processing sync item:', error);
          // Keep item in queue for retry
        }
      }

      // Update last sync timestamp
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async getLastSyncTime(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      return timestamp ? new Date(parseInt(timestamp)) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  // Conflict Resolution
  async resolveConflict(
    localData: any,
    remoteData: any,
    strategy: 'local' | 'remote' | 'merge' = 'remote'
  ): Promise<any> {
    switch (strategy) {
      case 'local':
        return localData;
      case 'remote':
        return remoteData;
      case 'merge':
        // Simple merge - remote wins on conflicts
        return { ...localData, ...remoteData };
      default:
        return remoteData;
    }
  }
}

export const offlineCache = new OfflineCacheService();
export default offlineCache;
