/**
 * Supabase Mock Client
 * Provides a complete mock of Supabase client for testing
 */

import { jest } from '@jest/globals';

/**
 * Create a mock query builder
 */
export function createMockQueryBuilder(initialData: any = []) {
  let data = initialData;
  let shouldError = false;
  let errorMessage = '';
  let lastFilters: any = {};
  let queryData = initialData; // Separate data for query operations

  const builder = {
    select: jest.fn(function (columns = '*') {
      lastFilters.select = columns;
      queryData = Array.isArray(data) ? [...data] : data;
      return this;
    }),
    eq: jest.fn(function (column: string, value: any) {
      lastFilters.eq = { column, value };
      if (Array.isArray(queryData)) {
        queryData = queryData.filter((item: any) => item[column] === value);
      }
      return this;
    }),
    in: jest.fn(function (column: string, values: any[]) {
      lastFilters.in = { column, values };
      if (Array.isArray(queryData)) {
        queryData = queryData.filter((item: any) => values.includes(item[column]));
      }
      return this;
    }),
    ilike: jest.fn(function (column: string, pattern: string) {
      lastFilters.ilike = { column, pattern };
      if (Array.isArray(queryData)) {
        const regex = new RegExp(pattern.replace(/%/g, ''), 'i');
        queryData = queryData.filter((item: any) => regex.test(item[column]));
      }
      return this;
    }),
    or: jest.fn(function (query: string) {
      lastFilters.or = query;
      return this;
    }),
    order: jest.fn(function (column: string, options?: any) {
      lastFilters.order = { column, options };
      if (Array.isArray(queryData)) {
        const ascending = options?.ascending !== false;
        queryData = [...queryData].sort((a: any, b: any) => {
          const aVal = a[column];
          const bVal = b[column];
          if (aVal < bVal) return ascending ? -1 : 1;
          if (aVal > bVal) return ascending ? 1 : -1;
          return 0;
        });
      }
      return this;
    }),
    not: jest.fn(function (column: string, operator: string, value: any) {
      lastFilters.not = { column, operator, value };
      if (Array.isArray(queryData) && operator === 'is' && value === null) {
        queryData = queryData.filter((item: any) => item[column] !== null);
      }
      return this;
    }),
    single: jest.fn(function () {
      if (shouldError) {
        return Promise.resolve({ data: null, error: new Error(errorMessage) });
      }
      if (Array.isArray(queryData) && queryData.length > 0) {
        return Promise.resolve({ data: queryData[0], error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }),
    insert: jest.fn(function (records: any[]) {
      data = records.map((record, index) => ({
        id: record.id || `mock-id-${Date.now()}-${index}`,
        ...record,
      }));
      queryData = [...data];
      return {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: data[0], error: null }),
        }),
      };
    }),
    update: jest.fn(function (values: any) {
      lastFilters.update = values;
      if (Array.isArray(queryData)) {
        queryData = queryData.map((item: any) => ({
          ...item,
          ...values,
        }));
        data = queryData;
      }
      return this;
    }),
    delete: jest.fn(function () {
      return this;
    }),
    upsert: jest.fn(function (records: any[], options?: any) {
      data = records.map((record, index) => ({
        id: record.id || `mock-id-${Date.now()}-${index}`,
        ...record,
      }));
      queryData = [...data];
      return this;
    }),
    _setError: function (message: string) {
      shouldError = true;
      errorMessage = message;
      return this;
    },
    _clearError: function () {
      shouldError = false;
      errorMessage = '';
      return this;
    },
    _setData: function (newData: any) {
      data = newData;
      queryData = Array.isArray(newData) ? [...newData] : newData;
      return this;
    },
    _getData: function () {
      return data;
    },
  };

  // Add ability to resolve the query (for await)
  Object.defineProperty(builder, 'then', {
    value: function (onFulfilled: any, onRejected: any) {
      if (shouldError) {
        return Promise.reject(new Error(errorMessage)).then(
          onFulfilled,
          onRejected
        );
      }
      return Promise.resolve({ data: queryData, error: null }).then(
        onFulfilled,
        onRejected
      );
    },
  });

  // Add catch for promise rejection handling
  Object.defineProperty(builder, 'catch', {
    value: function (onRejected: any) {
      const promise = shouldError
        ? Promise.reject(new Error(errorMessage))
        : Promise.resolve({ data: queryData, error: null });
      return promise.catch(onRejected);
    },
  });

  return builder as any;
}

/**
 * Create a mock storage bucket
 */
function createMockStorage() {
  return {
    from: jest.fn((bucket: string) => ({
      upload: jest.fn().mockResolvedValue({ data: { path: `${bucket}/mock-file.jpg` }, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/${bucket}/mock-file.jpg` },
      }),
    })),
  };
}

/**
 * Create a mock Supabase client
 */
export function createMockSupabase(initialData: any = {}) {
  return {
    from: jest.fn((table: string) => {
      const tableData = initialData[table] || [];
      return createMockQueryBuilder(tableData);
    }),
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    storage: createMockStorage(),
  };
}

/**
 * Helper to setup mock user
 */
export function mockUser(overrides: any = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    ...overrides,
  };
}

/**
 * Helper to setup mock plant data
 */
export function mockPlant(overrides: any = {}) {
  return {
    id: 'plant-1',
    name: 'Tomato',
    latin_name: 'Solanum lycopersicum',
    location: 'Greenhouse',
    type: 'einjährig',
    status: 'gepflanzt',
    winterhart: false,
    essbar: true,
    quantity: 5,
    planted_date: '2024-01-01',
    harvest_date: null,
    notes: 'Test plant',
    tags: ['vegetable'],
    user_id: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Helper to setup mock shopping item data
 */
export function mockShoppingItem(overrides: any = {}) {
  return {
    id: 'shopping-1',
    item_name: 'Tomato Seeds',
    category: 'saatgut',
    quantity: '1 packet',
    priority: 'hoch',
    estimated_price: 5.99,
    actual_price: null,
    purchased: false,
    purchased_at: null,
    where_to_buy: 'Garden Store',
    link: null,
    notes: 'For greenhouse planting',
    user_id: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}
