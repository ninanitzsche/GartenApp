/**
 * Garden Stack Navigator
 * Handles navigation for garden overview feature
 * Includes PhotoGallery (moved from TabNavigator - Approach B)
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors2026 } from '../theme/designSystemV2';
import { RootStackParamList } from '../types/navigation';

import GardenOverviewScreen from '../screens/GardenOverviewScreen';
import GardenSettingsScreen from '../screens/GardenSettingsScreen';
import GardenPhotoGalleryScreen from '../screens/GardenPhotoGalleryScreen';
import PhotoGalleryScreen from '../screens/PhotoGalleryScreen';
import BedDetailScreen from '../screens/BedDetailScreen';
import AddBedScreen from '../screens/AddBedScreen';
import EditBedScreen from '../screens/EditBedScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function GardenStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors2026.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="GardenOverview"
        component={GardenOverviewScreen}
        options={{
          title: 'Garten',
        }}
      />
      <Stack.Screen
        name="GardenSettings"
        component={GardenSettingsScreen}
        options={{
          title: 'Garteneinstellungen',
        }}
      />
      <Stack.Screen
        name="GardenPhotoGallery"
        component={GardenPhotoGalleryScreen}
        options={{
          title: 'Gartenfotos',
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
        name="BedDetail"
        component={BedDetailScreen}
        options={{
          title: 'Beetdetails',
        }}
      />
      <Stack.Screen
        name="AddBed"
        component={AddBedScreen}
        options={{
          title: 'Beet hinzufügen',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EditBed"
        component={EditBedScreen}
        options={{
          title: 'Beet bearbeiten',
        }}
      />
    </Stack.Navigator>
  );
}
