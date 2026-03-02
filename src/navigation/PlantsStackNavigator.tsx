import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Colors from '../theme/colors';

import PlantListScreen from '../screens/PlantListScreen';
import AddPlantScreen from '../screens/AddPlantScreen';
import EditPlantScreen from '../screens/EditPlantScreen';
import PlantDetailScreen from '../screens/PlantDetailScreen';

const Stack = createNativeStackNavigator();

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
    </Stack.Navigator>
  );
}
