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
  AddPlant: { prefillName?: string; prefillLatinName?: string; identificationSource?: 'ai' | 'manual' };
  EditPlant: { plantId: string };
  CompanionSearch: undefined;
  SaisonPlaner: undefined;

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

  // Harvest Stack (Sprint 6A)
  HarvestLog: { plantId?: string };
  AddHarvest: { harvestId?: string; plantId?: string };

  // Knowledge Stack (Sprint 6A)
  KnowledgeBase: undefined;
  ArticleDetail: { articleId: string };
  AddKnowledgeNote: undefined;
  EditKnowledgeArticle: { articleId: string };

  // Garden Stack (Sprint 7)
  GardenOverview: undefined;
  GardenSettings: undefined;
  GardenPhotoGallery: undefined;
  BedDetail: { bedId: string };
  AddBed: undefined;
  EditBed: { bedId: string };

  // More Menu
  MoreMenu: undefined;
};

// Tasks stack for Tasks tab
export type TasksStackParamList = {
  TaskList: undefined;
  AddTask: { taskId?: string };
  TaskDetail: { taskId: string };
  ArticleDetail: { articleId: string };
};

// Tab navigator - bottom tabs (4 tabs - Approach B)
export type TabParamList = {
  Home: undefined;
  Plants: undefined;
  Tasks: undefined;
  GardenOverview: undefined;
  More: undefined;
};
