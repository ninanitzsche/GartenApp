/**
 * Navigation type definitions for the app
 */

export type RootStackParamList = {
  TabNavigator: undefined;
  PlantDetail: { plantId: string };
  EditPlant: { plantId: string };
  AddPlant: undefined;
};

export type TabParamList = {
  Home: undefined;
  Plants: undefined;
  Tasks: undefined;
  Photos: undefined;
  More: undefined;
};
