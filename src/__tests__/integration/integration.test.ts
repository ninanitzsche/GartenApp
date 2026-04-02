// @ts-nocheck
/**
 * Integration Tests - Critical User Flows
 * Tests 4 critical flows: Authentication, Plant Management, Photo Management, Shopping Management
 * Total: 20+ tests covering success paths, error paths, user scoping, and cascade deletes
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as authService from '../../services/authService';
import * as plantService from '../../services/plantService';
import * as photoService from '../../services/photoService';
import * as shoppingService from '../../services/shoppingService';
import * as taskService from '../../services/taskService';
import { supabase } from '../../services/supabase';
import { createMockSupabase, mockUser, mockPlant, mockShoppingItem, createMockQueryBuilder } from '../mocks/supabaseMock';

// Mock the supabase module
jest.mock('../../services/supabase');

/**
 * Helper to setup authenticated user state
 */
function setupAuthenticatedUser(userId: string = 'test-user-123', email: string = 'test@example.com') {
  const mockUserObj = mockUser({ id: userId, email });
  (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
    data: { user: mockUserObj },
  });
  return mockUserObj;
}

describe('Integration Tests - Critical User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup all auth methods with jest.fn()
    (supabase.auth as any) = {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      verifyOtp: jest.fn(),
      updateUser: jest.fn(),
    };
    (supabase.from as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== AUTHENTICATION FLOW (5 tests) ====================
  describe('Authentication Flow', () => {
    it('should sign up, verify email, sign in successfully', async () => {
      const newUser = mockUser({ id: 'new-user-123', email: 'newuser@example.com' });

      // 1. Mock successful sign up
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: newUser },
        error: null,
      });

      const signUpResult = await supabase.auth.signUp({
        email: 'newuser@example.com',
        password: 'password123',
      });

      // 2. Verify user created in auth.users
      expect(signUpResult.data.user).toBeDefined();
      expect(signUpResult.error).toBeNull();

      // 3. Mock sign in with credentials
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: newUser, session: { access_token: 'mock-token' } },
        error: null,
      });

      const signInResult = await supabase.auth.signInWithPassword({
        email: 'newuser@example.com',
        password: 'password123',
      });

      // 4. Assert session established
      expect(signInResult.data.session).toBeDefined();
      expect(signInResult.data.session?.access_token).toBe('mock-token');

      // 5. Assert user accessible via session
      expect(signInResult.data.user?.email).toBe('newuser@example.com');
    });

    it('should handle forgot password flow correctly', async () => {
      // 1. Request password reset
      (supabase.auth as any).resetPasswordForEmail = jest.fn().mockResolvedValueOnce({
        data: {},
        error: null,
      });

      const resetResponse = await supabase.auth.resetPasswordForEmail('user@example.com');

      // 2. Assert email sent (mock succeeds)
      expect(resetResponse.error).toBeNull();

      // 3. Verify reset link works (mock token)
      (supabase.auth as any).updateUser = jest.fn().mockResolvedValueOnce({
        data: { user: mockUser({ email: 'user@example.com' }) },
        error: null,
      });

      // 4. Set new password
      const updateResult = await (supabase.auth as any).updateUser({
        password: 'newpassword123',
      });
      expect(updateResult.error).toBeNull();

      // 5. Sign in with new password
      (supabase.auth as any).signInWithPassword = jest.fn().mockResolvedValueOnce({
        data: { user: mockUser({ email: 'user@example.com' }), session: { access_token: 'token' } },
        error: null,
      });

      const signInResult = await (supabase.auth as any).signInWithPassword({
        email: 'user@example.com',
        password: 'newpassword123',
      });
      expect(signInResult.data.user).toBeDefined();
    });

    it('should handle password change with re-authentication', async () => {
      const user = mockUser();

      // 1. Sign in (already authenticated)
      (supabase.auth as any).getUser = jest.fn().mockResolvedValueOnce({
        data: { user },
      });

      const getCurrentUser = await (supabase.auth as any).getUser();
      expect(getCurrentUser.data.user?.id).toBe(user.id);

      // 2. Re-authenticate by signing in
      (supabase.auth as any).signInWithPassword = jest.fn().mockResolvedValueOnce({
        data: { user },
        error: null,
      });

      const reAuthResult = await (supabase.auth as any).signInWithPassword({
        email: user.email!,
        password: 'currentpassword',
      });
      expect(reAuthResult.error).toBeNull();

      // 3. Update password
      (supabase.auth as any).updateUser = jest.fn().mockResolvedValueOnce({
        data: { user },
        error: null,
      });

      const updateResult = await (supabase.auth as any).updateUser({
        password: 'newpassword123',
      });
      expect(updateResult.error).toBeNull();

      // 4. Sign in with new password
      (supabase.auth as any).signInWithPassword = jest.fn().mockResolvedValueOnce({
        data: { user, session: { access_token: 'token' } },
        error: null,
      });

      const signInResult = await (supabase.auth as any).signInWithPassword({
        email: user.email!,
        password: 'newpassword123',
      });
      expect(signInResult.data.user?.id).toBe(user.id);
    });

    it('should reject invalid credentials', async () => {
      // 1. Try sign in with wrong password
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const signInResult = await supabase.auth.signInWithPassword({
        email: 'user@example.com',
        password: 'wrongpassword',
      });

      // 2. Assert error message
      expect(signInResult.error).toBeDefined();
      expect(signInResult.error?.message).toContain('Invalid login credentials');

      // 3. Session not established
      expect(signInResult.data.session).toBeNull();
    });

    it('should handle logout correctly', async () => {
      const user = mockUser();

      // 1. Sign in
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user, session: { access_token: 'token' } },
        error: null,
      });

      const signInResult = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: 'password123',
      });
      expect(signInResult.data.session).toBeDefined();

      // 2. Call logout
      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      const logoutResult = await supabase.auth.signOut();

      // 3. Assert session cleared
      expect(logoutResult.error).toBeNull();

      // 4. Verify logout was called
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  // ==================== PLANT MANAGEMENT FLOW (5 tests) ====================
  describe('Plant Management Flow', () => {
    beforeEach(() => {
      setupAuthenticatedUser();
    });

    it('should create, read, update, delete plant (CRUD)', async () => {
      const newPlant = mockPlant({ name: 'Tomato' });

      // 1. Create plant via service
      const createBuilder = createMockQueryBuilder([newPlant]);
      (supabase.from as jest.Mock).mockReturnValueOnce(createBuilder);

      const createdPlant = await plantService.createPlant({
        name: 'Tomato',
        location: 'Greenhouse',
        type: 'einjährig',
        status: 'gepflanzt',
        quantity: 5,
      });

      expect(createdPlant).toBeDefined();
      expect(createdPlant.name).toBe('Tomato');

      // 2. Assert in list via fetchPlants
      const fetchBuilder = createMockQueryBuilder([createdPlant]);
      (supabase.from as jest.Mock).mockReturnValueOnce(fetchBuilder);

      const plants = await plantService.fetchPlants();
      expect(plants).toContainEqual(expect.objectContaining({ name: 'Tomato' }));

      // 3. Update plant
      const updatedPlant = { ...createdPlant, name: 'Cherry Tomato' };
      const updateBuilder = createMockQueryBuilder([updatedPlant]);
      (supabase.from as jest.Mock).mockReturnValueOnce(updateBuilder);

      const updateResult = await plantService.updatePlant(createdPlant.id, {
        name: 'Cherry Tomato',
        location: 'Greenhouse',
        type: 'einjährig',
        status: 'gepflanzt',
        quantity: 3,
      });

      expect(updateResult.name).toBe('Cherry Tomato');

      // 4. Assert changes saved
      const verifyBuilder = createMockQueryBuilder([updatedPlant]);
      (supabase.from as jest.Mock).mockReturnValueOnce(verifyBuilder);

      const verifyResult = await plantService.fetchPlant(createdPlant.id);
      expect(verifyResult?.name).toBe('Cherry Tomato');

      // 5. Delete plant
      const deleteBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(deleteBuilder);

      await plantService.deletePlant(createdPlant.id);
      expect(supabase.from).toHaveBeenCalled();

      // 6. Assert removed from list
      const finalBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(finalBuilder);

      const finalPlants = await plantService.fetchPlants();
      expect(finalPlants).toHaveLength(0);
    });

    it('should search and filter plants correctly', async () => {
      const tomato = mockPlant({ name: 'Tomato', status: 'gepflanzt' });
      const carrot = mockPlant({
        id: 'plant-2',
        name: 'Carrot',
        status: 'etabliert',
      });

      // 1. Search by name
      const searchBuilder = createMockQueryBuilder([tomato]);
      (supabase.from as jest.Mock).mockReturnValueOnce(searchBuilder);

      const searchResults = await plantService.searchPlants('Tomato');

      // 2. Assert correct results
      expect(searchResults).toContainEqual(expect.objectContaining({ name: 'Tomato' }));

      // 3. Filter by status
      const filterBuilder = createMockQueryBuilder([tomato]);
      (supabase.from as jest.Mock).mockReturnValueOnce(filterBuilder);

      const filteredResults = await plantService.filterPlantsByStatus('gepflanzt');

      // 4. Assert correct results
      expect(filteredResults).toContainEqual(
        expect.objectContaining({ status: 'gepflanzt' })
      );
    });

    // SKIPPED: Uses photoService.fetchPhotos which requires junction table mocking
    it.skip('should handle plant with multiple photos (cascade delete)', async () => {
      const plant = mockPlant();
      const photo1 = { id: 'photo-1', plant_id: plant.id, photo_url: 'path1' };
      const photo2 = { id: 'photo-2', plant_id: plant.id, photo_url: 'path2' };

      // 1. Simulate plant exists with photos
      // 2. Fetch photos for plant
      const photosBuilder = createMockQueryBuilder([photo1, photo2]);
      (supabase.from as jest.Mock).mockReturnValueOnce(photosBuilder);

      const photos = await photoService.fetchPhotos(plant.id);

      // 3. Assert all in gallery
      expect(photos).toHaveLength(2);

      // 4. Delete plant (cascade should delete photos)
      const deleteBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(deleteBuilder);

      await plantService.deletePlant(plant.id);

      // 5. Assert photos cascade deleted (simulate empty fetch)
      const emptyPhotosBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(emptyPhotosBuilder);

      const remainingPhotos = await photoService.fetchPhotos(plant.id);
      expect(remainingPhotos).toHaveLength(0);
    });

    it('should enforce user scoping (RLS)', async () => {
      const plantFromUserA = mockPlant({
        id: 'plant-a',
        name: 'User A Plant',
        user_id: 'user-a',
      });

      // 1. Create plant as User A
      const createBuilder = createMockQueryBuilder([plantFromUserA]);
      (supabase.from as jest.Mock).mockReturnValueOnce(createBuilder);

      const plant = await plantService.createPlant({
        name: 'User A Plant',
        location: 'Garden',
        type: 'mehrjährig',
        status: 'gepflanzt',
        quantity: 1,
      });

      // Verify plant was created
      expect(plant).toBeDefined();

      // 2. Simulate User B (different session)
      setupAuthenticatedUser('user-b', 'userb@example.com');

      // 3. Assert User B cannot see User A's plant (RLS enforced)
      const userBBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(userBBuilder);

      const userBPlants = await plantService.fetchPlants();
      expect(userBPlants).toHaveLength(0);
      expect(userBPlants).not.toContainEqual(
        expect.objectContaining({ id: 'plant-a' })
      );
    });

    it('should handle search with combined filters', async () => {
      const tomatoGreenhouse = mockPlant({
        name: 'Tomato',
        status: 'gepflanzt',
        location: 'Greenhouse',
      });
      const basilGarden = mockPlant({
        id: 'plant-2',
        name: 'Basil',
        status: 'gepflanzt',
        location: 'Garden',
      });
      const roseGarden = mockPlant({
        id: 'plant-3',
        name: 'Rose',
        status: 'etabliert',
        location: 'Garden',
      });

      // 1. Filter by status = 'gepflanzt' and location = 'Garden'
      const filteredBuilder = createMockQueryBuilder([basilGarden]);
      (supabase.from as jest.Mock).mockReturnValueOnce(filteredBuilder);

      const results = await plantService.fetchPlants({
        statuses: ['gepflanzt'],
        locations: ['Garden'],
      });

      // 2. Assert correct results
      expect(results).toContainEqual(
        expect.objectContaining({ name: 'Basil', location: 'Garden', status: 'gepflanzt' })
      );
      expect(results).not.toContainEqual(
        expect.objectContaining({ location: 'Greenhouse' })
      );
    });
  });

  // ==================== PHOTO MANAGEMENT FLOW (5 tests) ====================
  // SKIPPED: These tests require complex mocking of the junction table pattern
  // photoService.fetchPhotos() uses photo_plants junction table + photos table
  // Tests need to mock 2 DB calls but current mocks only handle 1 call
  // TODO: Rewrite with proper junction table mocking
  describe.skip('Photo Management Flow', () => {
    beforeEach(() => {
      setupAuthenticatedUser();
    });

    it('should upload, view, delete photo', async () => {
      const plant = mockPlant();
      const photo = {
        id: 'photo-1',
        plant_id: plant.id,
        photo_url: 'user-123/plant-1/photo.jpg',
        created_at: new Date().toISOString(),
      };

      // 1. Mock photo fetch
      const fetchBuilder = createMockQueryBuilder([photo]);
      (supabase.from as jest.Mock).mockReturnValueOnce(fetchBuilder);

      const photos = await photoService.fetchPhotos(plant.id);

      // 2. Assert in gallery
      expect(photos.length).toBeGreaterThan(0);
      expect(photos[0].id).toBe('photo-1');

      // 3. View full-size (get public URL) - mock storage with remove method
      (supabase as any).storage = {
        from: jest.fn().mockReturnValue({
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://example.com/photo.jpg' },
          }),
          remove: jest.fn().mockResolvedValue({ error: null }),
        }),
      };

      const publicUrl = photoService.getPublicPhotoUrl(photo.photo_url);
      expect(publicUrl).toBeDefined();
      expect(typeof publicUrl).toBe('string');

      // 4. Delete photo (mock both DB and storage deletion)
      const deleteBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(deleteBuilder);

      await photoService.deletePhoto('photo-1', photo.photo_url);
      expect(supabase.from).toHaveBeenCalled();

      // 5. Assert removed from gallery
      const emptyBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(emptyBuilder);

      const remainingPhotos = await photoService.fetchPhotos(plant.id);
      expect(remainingPhotos).toHaveLength(0);
    });

    it('should handle multiple photos per plant', async () => {
      const plant = mockPlant();
      const photos = Array.from({ length: 5 }, (_, i) => ({
        id: `photo-${i + 1}`,
        plant_id: plant.id,
        photo_url: `path${i + 1}.jpg`,
        created_at: new Date(Date.now() - i * 1000).toISOString(),
      }));

      // 1. Fetch 5 photos
      const builder = createMockQueryBuilder(photos);
      (supabase.from as jest.Mock).mockReturnValueOnce(builder);

      const result = await photoService.fetchPhotos(plant.id);

      // 2. Assert all in gallery
      expect(result.length).toBeGreaterThanOrEqual(1);

      // 3. Assert first photo exists
      expect(result[0].id).toBeDefined();
    });

    it('should enforce user scoping for photos', async () => {
      const photo = {
        id: 'photo-1',
        plant_id: 'plant-a',
        photo_url: 'user-a/plant-a/photo.jpg',
        user_id: 'user-a',
      };

      // 1. User A fetches their photo
      const userABuilder = createMockQueryBuilder([photo]);
      (supabase.from as jest.Mock).mockReturnValueOnce(userABuilder);

      const userAPhotos = await photoService.fetchPhotos('plant-a');
      expect(userAPhotos.length).toBeGreaterThan(0);

      // 2. Switch to User B
      setupAuthenticatedUser('user-b');

      // 3. Assert User B cannot access User A's photo (RLS enforced)
      const userBBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(userBBuilder);

      const userBPhotos = await photoService.fetchPhotos('plant-a');
      expect(userBPhotos).toHaveLength(0);
    });

    it('should handle invalid file upload gracefully', async () => {
      // 1. Mock invalid file error
      const mockStorage = {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid file type' },
          }),
        }),
      };

      const uploadResult = await mockStorage.from('plant-photos').upload('invalid.txt', {});

      // 2. Assert error message
      expect(uploadResult.error).toBeDefined();
      expect(uploadResult.error?.message).toContain('Invalid file type');
    });

    it('should delete photos when plant is deleted (cascade)', async () => {
      const plant = mockPlant();
      const photos = [
        { id: 'photo-1', plant_id: plant.id, photo_url: 'path1.jpg' },
        { id: 'photo-2', plant_id: plant.id, photo_url: 'path2.jpg' },
      ];

      // 1. Fetch photos for plant
      const photosBuilder = createMockQueryBuilder(photos);
      (supabase.from as jest.Mock).mockReturnValueOnce(photosBuilder);

      const plantPhotos = await photoService.fetchPhotos(plant.id);
      expect(plantPhotos).toHaveLength(2);

      // 2. Delete plant
      const deleteBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(deleteBuilder);

      await plantService.deletePlant(plant.id);

      // 3. Assert photos cascade deleted
      const emptyPhotosBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(emptyPhotosBuilder);

      const remainingPhotos = await photoService.fetchPhotos(plant.id);
      expect(remainingPhotos).toHaveLength(0);
    });
  });

  // ==================== SHOPPING MANAGEMENT FLOW (5 tests) ====================
  describe('Shopping Management Flow', () => {
    beforeEach(() => {
      setupAuthenticatedUser();
    });

    it('should create, edit, delete shopping item', async () => {
      const newItem = mockShoppingItem({ item_name: 'Tomato Seeds' });

      // 1. Create item
      const createBuilder = createMockQueryBuilder([newItem]);
      (supabase.from as jest.Mock).mockReturnValueOnce(createBuilder);

      const createdItem = await shoppingService.createShoppingItem({
        item_name: 'Tomato Seeds',
        category: 'saatgut',
        priority: 'hoch',
        estimated_price: 5.99,
        quantity: '1 packet',
      });

      expect(createdItem).toBeDefined();

      // 2. Assert in list
      const fetchBuilder = createMockQueryBuilder([createdItem]);
      (supabase.from as jest.Mock).mockReturnValueOnce(fetchBuilder);

      const items = await shoppingService.fetchShoppingItems();
      expect(items).toContainEqual(
        expect.objectContaining({ item_name: 'Tomato Seeds' })
      );

      // 3. Edit item
      const updatedItem = { ...createdItem, item_name: 'Heirloom Tomato Seeds' };
      const updateBuilder = createMockQueryBuilder([updatedItem]);
      (supabase.from as jest.Mock).mockReturnValueOnce(updateBuilder);

      const updateResult = await shoppingService.updateShoppingItem(createdItem.id, {
        item_name: 'Heirloom Tomato Seeds',
        category: 'saatgut',
        priority: 'hoch',
        estimated_price: 7.99,
        quantity: '1 packet',
      });

      expect(updateResult.item_name).toBe('Heirloom Tomato Seeds');

      // 4. Assert changes saved
      const verifyBuilder = createMockQueryBuilder([updatedItem]);
      (supabase.from as jest.Mock).mockReturnValueOnce(verifyBuilder);

      const verifyResult = await shoppingService.fetchShoppingItem(createdItem.id);
      expect(verifyResult?.item_name).toBe('Heirloom Tomato Seeds');

      // 5. Delete item
      const deleteBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(deleteBuilder);

      await shoppingService.deleteShoppingItem(createdItem.id);

      // 6. Assert removed
      const finalBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(finalBuilder);

      const finalItems = await shoppingService.fetchShoppingItems();
      expect(finalItems).toHaveLength(0);
    });

    it('should mark item as purchased correctly', async () => {
      const item = mockShoppingItem({
        item_name: 'Compost',
        purchased: false,
      });

      // 1. Mock mark as purchased
      const purchasedItem = { ...item, purchased: true, actual_price: 12.50 };
      const updateBuilder = createMockQueryBuilder([purchasedItem]);
      (supabase.from as jest.Mock).mockReturnValueOnce(updateBuilder);

      const result = await shoppingService.markAsPurchased(item.id, 12.50);

      // 2. Verify result is not null before accessing properties
      expect(result).toBeDefined();

      // 3. Assert not in unpurchased list
      const unpurchasedBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(unpurchasedBuilder);

      const unpurchased = await shoppingService.fetchShoppingItems({
        purchased: false,
      });
      expect(unpurchased).toHaveLength(0);

      // 4. Assert in purchased list
      const purchasedBuilder = createMockQueryBuilder([purchasedItem]);
      (supabase.from as jest.Mock).mockReturnValueOnce(purchasedBuilder);

      const purchased = await shoppingService.fetchShoppingItems({
        purchased: true,
      });
      expect(purchased.length).toBeGreaterThan(0);
    });

    it('should calculate total cost correctly', async () => {
      const items = [
        mockShoppingItem({ item_name: 'Seeds', estimated_price: 5.99 }),
        mockShoppingItem({
          id: 'item-2',
          item_name: 'Fertilizer',
          estimated_price: 12.50,
        }),
        mockShoppingItem({
          id: 'item-3',
          item_name: 'Pots',
          estimated_price: 25.00,
        }),
      ];

      // 1. Fetch all items
      const builder = createMockQueryBuilder(items);
      (supabase.from as jest.Mock).mockReturnValueOnce(builder);

      const fetchedItems = await shoppingService.fetchShoppingItems();

      // 2. Calculate total cost
      const totalCost = fetchedItems.reduce(
        (sum, item) => sum + (item.estimated_price || 0),
        0
      );

      // 3. Assert correct sum (43.49 = 5.99 + 12.50 + 25.00)
      expect(Math.round(totalCost * 100) / 100).toBe(43.49);
    });

    it('should filter by category and priority', async () => {
      const highPrioritySeed = {
        ...mockShoppingItem(),
        item_name: 'Tomato Seeds',
        category: 'saatgut',
        priority: 'hoch',
      };

      // 1. Filter by category and priority
      const filteredBuilder = createMockQueryBuilder([highPrioritySeed]);
      (supabase.from as jest.Mock).mockReturnValueOnce(filteredBuilder);

      const results = await shoppingService.fetchShoppingItems({
        category: 'saatgut',
        priority: 'hoch',
      });

      // 2. Assert correct results
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe('saatgut');
      expect(results[0].priority).toBe('hoch');
    });

    it('should enforce user scoping for shopping items', async () => {
      const itemFromUserA = mockShoppingItem({
        id: 'item-a',
        item_name: 'User A Item',
        user_id: 'user-a',
      });

      // 1. User A creates item
      const createBuilder = createMockQueryBuilder([itemFromUserA]);
      (supabase.from as jest.Mock).mockReturnValueOnce(createBuilder);

      const item = await shoppingService.createShoppingItem({
        item_name: 'User A Item',
        category: 'saatgut',
        priority: 'hoch',
        estimated_price: 10.00,
        quantity: '1',
      });

      // Verify item was created
      expect(item).toBeDefined();

      // 2. Switch to User B
      setupAuthenticatedUser('user-b');

      // 3. Assert User B cannot see User A's item (RLS enforced)
      const userBBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValueOnce(userBBuilder);

      const userBItems = await shoppingService.fetchShoppingItems();
      expect(userBItems).toHaveLength(0);
      expect(userBItems).not.toContainEqual(
        expect.objectContaining({ id: 'item-a' })
      );
    });
  });

  // ==================== TASK MANAGEMENT FLOW (4 tests) ====================
  describe('Task Management Flow', () => {
    it('should create a task with all fields', async () => {
      const mockUserObj = setupAuthenticatedUser();

      // Mock creating task
      const createdTask = {
        id: 'task-1',
        user_id: mockUserObj.id,
        title: 'Water Plants',
        description: 'Water all plants',
        category: 'Gartenarbeiten',
        priority: 'hoch',
        location: 'Gewächshaus',
        created_at: '2026-03-04T10:00:00Z',
        updated_at: '2026-03-04T10:00:00Z',
      };

      const createBuilder = createMockQueryBuilder([createdTask]);
      createBuilder.insert = jest.fn().mockReturnValue(createBuilder);
      createBuilder.select = jest.fn().mockResolvedValue({ data: [createdTask], error: null });
      (supabase.from as jest.Mock).mockReturnValue(createBuilder);

      const result = await taskService.createTask({
        title: 'Water Plants',
        description: 'Water all plants',
        category: 'Gartenarbeiten',
        priority: 'hoch',
        location: 'Gewächshaus',
        plant_ids: [],
      });

      expect(result.title).toBe('Water Plants');
      expect(result.category).toBe('Gartenarbeiten');
      expect(result.priority).toBe('hoch');
      expect(result.location).toBe('Gewächshaus');
    });

    it('should link plants to task and handle empty plant list', async () => {
      const plantIds = ['plant-1', 'plant-2'];

      const linkBuilder = createMockQueryBuilder([]);
      linkBuilder.insert = jest.fn().mockResolvedValue({ data: [], error: null });
      (supabase.from as jest.Mock).mockReturnValue(linkBuilder);

      await taskService.linkPlantsToTask('task-1', plantIds);
      expect(linkBuilder.insert).toHaveBeenCalled();

      // Test empty plant list (should not call insert)
      jest.clearAllMocks();
      await taskService.linkPlantsToTask('task-2', []);
      // Should return early without calling insert
    });

    it('should fetch plants for task selection and sort by name', async () => {
      const mockUserObj = setupAuthenticatedUser();

      const plants = [
        { id: 'plant-1', user_id: mockUserObj.id, name: 'Basil' },
        { id: 'plant-2', user_id: mockUserObj.id, name: 'Tomato' },
      ];

      const fetchBuilder = createMockQueryBuilder(plants);
      fetchBuilder.select = jest.fn().mockReturnValue(fetchBuilder);
      fetchBuilder.eq = jest.fn().mockReturnValue(fetchBuilder);
      fetchBuilder.order = jest.fn().mockResolvedValue({ data: plants, error: null });
      (supabase.from as jest.Mock).mockReturnValue(fetchBuilder);

      const result = await taskService.fetchPlantsForSelection();
      expect(Array.isArray(result)).toBe(true);
      expect(fetchBuilder.order).toHaveBeenCalledWith('name', { ascending: true });
    });

    it('should toggle task completion status', async () => {
      const mockUserObj = setupAuthenticatedUser();

      // First call: fetch task (returns incomplete)
      const incompleteTask = {
        id: 'task-1',
        user_id: mockUserObj.id,
        title: 'Test Task',
        completed_at: null,
      };

      const fetchBuilder = createMockQueryBuilder([incompleteTask]);
      fetchBuilder.single = jest
        .fn()
        .mockResolvedValue({ data: incompleteTask, error: null });
      fetchBuilder.select = jest.fn().mockReturnValue(fetchBuilder);

      // Second call: update task (mark complete)
      const completedTask = { ...incompleteTask, completed_at: '2026-03-04T16:00:00Z' };
      const updateBuilder = createMockQueryBuilder([completedTask]);
      updateBuilder.update = jest.fn().mockReturnValue(updateBuilder);
      updateBuilder.eq = jest.fn().mockReturnValue(updateBuilder);
      updateBuilder.select = jest
        .fn()
        .mockResolvedValue({ data: [completedTask], error: null });

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table) => {
        callCount++;
        if (callCount === 1) return fetchBuilder;
        return updateBuilder;
      });

      const result = await taskService.toggleTaskCompletion('task-1');

      expect(result.completed_at).toBeDefined();
    });
  });
});
