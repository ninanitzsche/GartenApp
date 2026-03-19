import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { TabParamList } from '../types/navigation';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import PlantsStackNavigator from './PlantsStackNavigator';
import ShoppingStackNavigator from './ShoppingStackNavigator';
import MoreMenuStackNavigator from './MoreMenuStackNavigator';
import TaskStackNavigator from './TaskStackNavigator';
import PhotoGalleryScreen from '../screens/PhotoGalleryScreen';
import GardenStackNavigator from './GardenStackNavigator';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Plants"
        component={PlantsStackNavigator}
        options={{
          title: 'Pflanzen',
          tabBarLabel: 'Inventar',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="eco" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Tasks"
        component={TaskStackNavigator}
        options={{
          title: 'Aufgaben',
          tabBarLabel: 'Aufgaben',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="checklist" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Photos"
        component={PhotoGalleryScreen}
        options={{
          title: 'Fotos',
          tabBarLabel: 'Fotos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="photo-library" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Shopping"
        component={ShoppingStackNavigator}
        options={{
          title: 'Einkaufsliste',
          tabBarLabel: 'Einkaufen',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="shopping-cart" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="GardenOverview"
        component={GardenStackNavigator}
        options={{
          title: 'Garten',
          tabBarLabel: 'Garten',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="yard" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="More"
        component={MoreMenuStackNavigator}
        options={{
          title: 'Mehr',
          tabBarLabel: 'Mehr',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
