import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Colors from '../theme/colors';
import { RootStackParamList } from '../types/navigation';

import PlantListScreen from '../screens/PlantListScreen';
import AddPlantScreen from '../screens/AddPlantScreen';
import EditPlantScreen from '../screens/EditPlantScreen';
import PlantDetailScreen from '../screens/PlantDetailScreen';
import PhotoGalleryScreen from '../screens/PhotoGalleryScreen';
import PhotoUploadScreen from '../screens/PhotoUploadScreen';
import CompanionSearchScreen from '../screens/CompanionSearchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function PlantsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="PlantList"
        component={PlantListScreen}
        options={{
          title: 'Pflanzen',
        }}
      />
      <Stack.Screen
        name="PlantDetail"
        component={PlantDetailScreen}
        options={{
          title: 'Pflanzendetails',
        }}
      />
      <Stack.Screen
        name="AddPlant"
        component={AddPlantScreen}
        options={{
          title: 'Pflanze hinzufügen',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EditPlant"
        component={EditPlantScreen}
        options={{
          title: 'Pflanze bearbeiten',
        }}
      />
      <Stack.Screen
        name="PhotoGallery"
        component={PhotoGalleryScreen}
        options={{
          title: 'Fotos',
        }}
      />
      <Stack.Screen
        name="PhotoUpload"
        component={PhotoUploadScreen}
        options={{
          title: 'Foto hochladen',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="CompanionSearch"
        component={CompanionSearchScreen}
        options={{
          title: 'Mischkultur-Suche',
        }}
      />
    </Stack.Navigator>
  );
}
