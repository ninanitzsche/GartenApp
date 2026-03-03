/**
 * Test Helpers and Utilities
 * Common test utilities and assertion helpers
 */

import { jest } from '@jest/globals';
import { createMockSupabase } from '../mocks/supabaseMock';

/**
 * Setup Supabase mock with data
 */
export function setupSupabaseMock(mockData: any = {}) {
  const mockSupabase = createMockSupabase(mockData);
  jest.doMock('../services/supabase', () => ({
    supabase: mockSupabase,
  }));
  return mockSupabase;
}

/**
 * Verify async function throws expected error
 */
export async function expectAsyncError(
  asyncFn: () => Promise<any>,
  errorMessage?: string
) {
  try {
    await asyncFn();
    throw new Error('Expected function to throw error');
  } catch (error: any) {
    if (errorMessage) {
      expect(error.message).toContain(errorMessage);
    }
  }
}

/**
 * Create test data fixtures
 */
export const testFixtures = {
  plant: {
    valid: {
      name: 'Tomato',
      latin_name: 'Solanum lycopersicum',
      location: 'Greenhouse',
      type: 'einjährig',
      status: 'gepflanzt',
      essbar: true,
      quantity: 5,
    },
    invalid: {
      name: '', // Empty name - invalid
      status: '', // Empty status - invalid
    },
    withDates: {
      name: 'Carrot',
      status: 'estabeliert',
      planted_date: '2024-01-01',
      harvest_date: '2024-06-01',
    },
  },

  shoppingItem: {
    valid: {
      item_name: 'Tomato Seeds',
      category: 'saatgut',
      priority: 'hoch',
      estimated_price: 5.99,
      quantity: '1 packet',
    },
    invalid: {
      item_name: '', // Empty name - invalid
    },
    purchased: {
      item_name: 'Compost',
      category: 'erde',
      priority: 'mittel',
      purchased: true,
      actual_price: 12.50,
    },
  },

  user: {
    valid: {
      id: 'test-user-123',
      email: 'test@example.com',
    },
    notAuthenticated: null,
  },
};

/**
 * Wait for async operations
 */
export function waitFor(condition: () => boolean, timeout = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    };
    check();
  });
}

/**
 * Mock AsyncStorage for tests
 */
export function mockAsyncStorage() {
  const store: { [key: string]: string } = {};

  return {
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn((key: string) => {
      return Promise.resolve(store[key] || null);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
      return Promise.resolve(Object.keys(store));
    }),
    multiGet: jest.fn((keys: string[]) => {
      return Promise.resolve(keys.map(key => [key, store[key] || null]));
    }),
    multiSet: jest.fn((keyValuePairs: Array<[string, string]>) => {
      keyValuePairs.forEach(([key, value]) => {
        store[key] = value;
      });
      return Promise.resolve();
    }),
    _getStore: () => store,
  };
}

/**
 * Assert query was called with correct parameters
 */
export function assertQueryCalledWith(
  queryMock: any,
  expectedCall: any
) {
  const calls = queryMock.mock.calls;
  const found = calls.some((call: any) => {
    return JSON.stringify(call) === JSON.stringify([expectedCall]);
  });
  expect(found).toBe(true);
}

/**
 * Create a resolved mock query result
 */
export function mockQueryResult(data: any = null, error: any = null) {
  return Promise.resolve({ data, error });
}

/**
 * Create a rejected mock query result
 */
export function mockQueryError(errorMessage: string) {
  return Promise.reject(new Error(errorMessage));
}
