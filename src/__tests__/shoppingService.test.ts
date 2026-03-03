/**
 * Shopping Service Tests
 * Comprehensive test suite for shoppingService.ts
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as shoppingService from '../services/shoppingService';
import { supabase } from '../services/supabase';
import { mockShoppingItem, mockUser, createMockQueryBuilder } from './mocks/supabaseMock';

// Mock the supabase module
jest.mock('../services/supabase');

describe('shoppingService', () => {
  const mockUserData = mockUser();
  const mockItemData = mockShoppingItem();

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockClear();
    (supabase.from as jest.Mock).mockClear();
  });

  describe('fetchShoppingItems', () => {
    it('should fetch all shopping items', async () => {
      const items = [
        mockShoppingItem({ item_name: 'Tomato Seeds' }),
        mockShoppingItem({ id: 'shopping-2', item_name: 'Compost' }),
      ];

      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({});

      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(result).toEqual(items);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should apply search filter', async () => {
      const items = [mockShoppingItem({ item_name: 'Tomato Seeds' })];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({
        searchQuery: 'Tomato',
      });

      expect(mockBuilder.ilike).toHaveBeenCalledWith('item_name', '%Tomato%');
      expect(result).toEqual(items);
    });

    it('should apply category filter', async () => {
      const items = [mockShoppingItem({ category: 'saatgut' })];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({
        category: 'saatgut',
      });

      expect(mockBuilder.eq).toHaveBeenCalledWith('category', 'saatgut');
      expect(result).toEqual(items);
    });

    it('should apply priority filter', async () => {
      const items = [mockShoppingItem({ priority: 'hoch' })];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({
        priority: 'hoch',
      });

      expect(mockBuilder.eq).toHaveBeenCalledWith('priority', 'hoch');
      expect(result).toEqual(items);
    });

    it('should apply purchased filter (true)', async () => {
      const items = [mockShoppingItem({ purchased: true })];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({
        purchased: true,
      });

      expect(mockBuilder.eq).toHaveBeenCalledWith('purchased', true);
      expect(result).toEqual(items);
    });

    it('should apply purchased filter (false)', async () => {
      const items = [mockShoppingItem({ purchased: false })];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({
        purchased: false,
      });

      expect(mockBuilder.eq).toHaveBeenCalledWith('purchased', false);
      expect(result).toEqual(items);
    });

    it('should apply combination of filters', async () => {
      const items = [
        mockShoppingItem({
          item_name: 'Tomato Seeds',
          category: 'saatgut',
          priority: 'hoch',
          purchased: false,
        }),
      ];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({
        searchQuery: 'Tomato',
        category: 'saatgut',
        priority: 'hoch',
        purchased: false,
      });

      expect(result).toEqual(items);
    });

    it('should order results by created_at descending', async () => {
      const items = [mockItemData];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await shoppingService.fetchShoppingItems({});

      expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should handle empty results', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({});

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Database error');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(shoppingService.fetchShoppingItems({})).rejects.toThrow();
    });

    it('should return empty array when data is null', async () => {
      const mockBuilder = createMockQueryBuilder(null);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({});

      expect(result).toEqual([]);
    });
  });

  describe('fetchShoppingItem', () => {
    it('should fetch single shopping item by id', async () => {
      const item = mockShoppingItem({ id: 'shopping-123' });
      const mockBuilder = createMockQueryBuilder([item]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItem('shopping-123');

      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', 'shopping-123');
      expect(result).toEqual(item);
    });

    it('should return null if item not found', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItem('non-existent');

      expect(result).toBeNull();
    });

    it('should handle errors when fetching single item', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Item not found');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(shoppingService.fetchShoppingItem('shopping-123')).rejects.toThrow();
    });
  });

  describe('createShoppingItem', () => {
    it('should create shopping item with valid data', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const newItem = mockShoppingItem();
      const mockBuilder = createMockQueryBuilder([newItem]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const itemData = {
        item_name: 'Tomato Seeds',
        category: 'saatgut',
        priority: 'hoch',
      };

      const result = await shoppingService.createShoppingItem(itemData);

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(mockBuilder.insert).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw error if user not authenticated', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const itemData = {
        item_name: 'Seeds',
        category: 'saatgut',
      };

      await expect(shoppingService.createShoppingItem(itemData)).rejects.toThrow(
        'User must be logged in'
      );
    });

    it('should include user_id in created item', async () => {
      const userId = 'user-123';
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: userId } },
      });

      const newItem = mockShoppingItem({ user_id: userId });
      const mockBuilder = createMockQueryBuilder([newItem]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const itemData = {
        item_name: 'Seeds',
        category: 'saatgut',
      };

      const result = await shoppingService.createShoppingItem(itemData);

      expect(result.user_id).toBe(userId);
    });

    it('should handle optional fields', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const newItem = mockShoppingItem({
        estimated_price: undefined,
        notes: undefined,
      });
      const mockBuilder = createMockQueryBuilder([newItem]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const itemData = {
        item_name: 'Seeds',
        category: 'saatgut',
      };

      const result = await shoppingService.createShoppingItem(itemData);

      expect(result).toHaveProperty('item_name');
    });

    it('should handle database errors during creation', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUserData },
      });

      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Insert failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const itemData = {
        item_name: 'Seeds',
        category: 'saatgut',
      };

      await expect(shoppingService.createShoppingItem(itemData)).rejects.toThrow();
    });
  });

  describe('updateShoppingItem', () => {
    it('should update shopping item fields', async () => {
      const updatedItem = mockShoppingItem({
        id: 'shopping-1',
        item_name: 'Premium Tomato Seeds',
      });
      const mockBuilder = createMockQueryBuilder([updatedItem]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.updateShoppingItem('shopping-1', {
        item_name: 'Premium Tomato Seeds',
        priority: 'hoch',
      });

      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(mockBuilder.update).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', 'shopping-1');
      expect(result.item_name).toBe('Premium Tomato Seeds');
    });

    it('should handle partial updates', async () => {
      const item = mockShoppingItem({ id: 'shopping-1' });
      const mockBuilder = createMockQueryBuilder([item]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.updateShoppingItem('shopping-1', {
        notes: 'Updated notes only',
      });

      expect(result).toHaveProperty('id');
    });

    it('should handle errors during update', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Update failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(
        shoppingService.updateShoppingItem('shopping-1', {
          item_name: 'Updated',
        })
      ).rejects.toThrow();
    });

    it('should update price information', async () => {
      const item = mockShoppingItem({
        id: 'shopping-1',
        estimated_price: 10.00,
      });
      const mockBuilder = createMockQueryBuilder([item]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.updateShoppingItem('shopping-1', {
        estimated_price: 12.50,
      });

      expect(result).toHaveProperty('estimated_price');
    });
  });

  describe('deleteShoppingItem', () => {
    it('should delete shopping item by id', async () => {
      const mockBuilder = createMockQueryBuilder();
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await shoppingService.deleteShoppingItem('shopping-1');

      expect(supabase.from).toHaveBeenCalledWith('shopping_items');
      expect(mockBuilder.delete).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', 'shopping-1');
    });

    it('should handle errors during deletion', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Delete failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(shoppingService.deleteShoppingItem('shopping-1')).rejects.toThrow();
    });

    it('should handle non-existent item deletion', async () => {
      const mockBuilder = createMockQueryBuilder();
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await shoppingService.deleteShoppingItem('non-existent');

      expect(mockBuilder.delete).toHaveBeenCalled();
    });
  });

  describe('markAsPurchased', () => {
    it('should mark item as purchased without price', async () => {
      const purchasedItem = mockShoppingItem({
        id: 'shopping-1',
        purchased: true,
        purchased_at: expect.any(String),
      });
      const mockBuilder = createMockQueryBuilder([purchasedItem]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.markAsPurchased('shopping-1');

      expect(mockBuilder.update).toHaveBeenCalled();
      expect(result.purchased).toBe(true);
    });

    it('should mark item as purchased with actual price', async () => {
      const purchasedItem = mockShoppingItem({
        id: 'shopping-1',
        purchased: true,
        actual_price: 8.99,
        purchased_at: expect.any(String),
      });
      const mockBuilder = createMockQueryBuilder([purchasedItem]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.markAsPurchased('shopping-1', 8.99);

      expect(mockBuilder.update).toHaveBeenCalled();
      expect(result.purchased).toBe(true);
      expect(result.actual_price).toBe(8.99);
    });

    it('should set purchased_at timestamp', async () => {
      const mockBuilder = createMockQueryBuilder([mockShoppingItem()]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await shoppingService.markAsPurchased('shopping-1');

      expect(mockBuilder.update).toHaveBeenCalled();
      const updateCall = (mockBuilder.update as jest.Mock).mock.calls[0][0];
      expect(updateCall).toHaveProperty('purchased_at');
    });

    it('should handle errors when marking purchased', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Update failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(shoppingService.markAsPurchased('shopping-1')).rejects.toThrow();
    });

    it('should accept zero as valid price', async () => {
      const mockBuilder = createMockQueryBuilder([mockShoppingItem()]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await shoppingService.markAsPurchased('shopping-1', 0);

      expect(mockBuilder.update).toHaveBeenCalled();
    });
  });

  describe('markAsNotPurchased', () => {
    it('should mark item as not purchased', async () => {
      const item = mockShoppingItem({
        id: 'shopping-1',
        purchased: false,
        purchased_at: null,
        actual_price: null,
      });
      const mockBuilder = createMockQueryBuilder([item]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.markAsNotPurchased('shopping-1');

      expect(mockBuilder.update).toHaveBeenCalled();
      expect(result.purchased).toBe(false);
    });

    it('should clear purchased_at timestamp', async () => {
      const mockBuilder = createMockQueryBuilder([mockShoppingItem()]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await shoppingService.markAsNotPurchased('shopping-1');

      expect(mockBuilder.update).toHaveBeenCalled();
      const updateCall = (mockBuilder.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.purchased_at).toBeNull();
    });

    it('should clear actual_price', async () => {
      const mockBuilder = createMockQueryBuilder([mockShoppingItem()]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await shoppingService.markAsNotPurchased('shopping-1');

      expect(mockBuilder.update).toHaveBeenCalled();
      const updateCall = (mockBuilder.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.actual_price).toBeNull();
    });

    it('should handle errors when marking not purchased', async () => {
      const mockBuilder = createMockQueryBuilder();
      mockBuilder._setError('Update failed');
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(shoppingService.markAsNotPurchased('shopping-1')).rejects.toThrow();
    });

    it('should reset item to unpurchased state', async () => {
      const item = mockShoppingItem({
        id: 'shopping-1',
        purchased: false,
      });
      const mockBuilder = createMockQueryBuilder([item]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.markAsNotPurchased('shopping-1');

      expect(result.purchased).toBe(false);
    });
  });

  describe('filtering and sorting', () => {
    it('should handle multiple priority levels', async () => {
      const items = [
        mockShoppingItem({ priority: 'niedrig' }),
        mockShoppingItem({ id: 'shopping-2', priority: 'mittel' }),
        mockShoppingItem({ id: 'shopping-3', priority: 'hoch' }),
        mockShoppingItem({ id: 'shopping-4', priority: 'dringend' }),
      ];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({});

      expect(result.length).toBe(4);
    });

    it('should handle multiple categories', async () => {
      const items = [
        mockShoppingItem({ category: 'saatgut' }),
        mockShoppingItem({ id: 'shopping-2', category: 'werkzeug' }),
        mockShoppingItem({ id: 'shopping-3', category: 'erde' }),
      ];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({});

      expect(result.length).toBe(3);
    });

    it('should distinguish purchased vs unpurchased items', async () => {
      const items = [
        mockShoppingItem({ purchased: true }),
        mockShoppingItem({ id: 'shopping-2', purchased: false }),
      ];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({});

      expect(result.some(item => item.purchased === true)).toBe(true);
      expect(result.some(item => item.purchased === false)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle item with all optional fields', async () => {
      const fullItem = mockShoppingItem({
        item_name: 'Premium Seeds',
        category: 'saatgut',
        quantity: '5 packets',
        priority: 'hoch',
        estimated_price: 25.99,
        actual_price: 20.50,
        purchased: true,
        where_to_buy: 'Garden Center',
        link: 'https://example.com/seeds',
        notes: 'Best quality seeds',
      });
      const mockBuilder = createMockQueryBuilder([fullItem]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({});

      expect(result[0].link).toBe('https://example.com/seeds');
      expect(result[0].where_to_buy).toBe('Garden Center');
    });

    it('should handle price difference between estimated and actual', async () => {
      const item = mockShoppingItem({
        estimated_price: 10.00,
        actual_price: 8.50,
      });
      const mockBuilder = createMockQueryBuilder([item]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({});

      expect(result[0].estimated_price).toBe(10.00);
      expect(result[0].actual_price).toBe(8.50);
    });

    it('should handle undefined purchase status filter', async () => {
      const items = [
        mockShoppingItem({ purchased: true }),
        mockShoppingItem({ id: 'shopping-2', purchased: false }),
      ];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await shoppingService.fetchShoppingItems({
        purchased: undefined,
      });

      expect(result.length).toBe(2);
    });

    it('should handle case-insensitive search', async () => {
      const items = [mockShoppingItem({ item_name: 'TOMATO SEEDS' })];
      const mockBuilder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await shoppingService.fetchShoppingItems({ searchQuery: 'tomato' });

      expect(mockBuilder.ilike).toHaveBeenCalled();
    });
  });
});
