/**
 * Navigation type definitions for entire app
 * Used to provide type-safe navigation throughout the application
 */

// Auth stack - used in AuthScreen
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Root/App-level navigation
// This is used for all screens that require authentication
export type RootStackParamList = {
  // Plants Stack
  PlantList: undefined;
  PlantDetail: { plantId: string };
  AddPlant: undefined;
  EditPlant: { plantId: string };

  // Profile Stack
  Profile: undefined;
  ChangePassword: undefined;

  // Shopping Stack
  ShoppingList: undefined;
  AddShoppingItem: undefined;
  EditShoppingItem: { itemId: string };
  ShoppingDashboard: undefined;

  // Photo Stack (Sprint 5)
  PhotoGallery: { plantId?: string };
  PhotoUpload: { plantId: string };

  // Task Stack (Sprint 6)
  TaskList: undefined;
  AddTask: { taskId?: string };
  TaskDetail: { taskId: string };

  // More Menu
  MoreMenu: undefined;
};

// Tab navigator - bottom tabs
export type TabParamList = {
  Home: undefined;
  Plants: undefined;
  Tasks: undefined;
  Photos: undefined;
  Shopping: undefined;
  More: undefined;
};
