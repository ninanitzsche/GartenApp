import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import PlantListScreen from '../screens/PlantListScreen';
import TaskListScreen from '../screens/TaskListScreen';
import PhotoGalleryScreen from '../screens/PhotoGalleryScreen';
import MoreMenuScreen from '../screens/MoreMenuScreen';

const Tab = createBottomTabNavigator();

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
        component={PlantListScreen}
        options={{
          title: 'Pflanzen',
          tabBarLabel: 'Inventar',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="eco" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Tasks"
        component={TaskListScreen}
        options={{
          title: 'Aufgaben',
          tabBarLabel: 'Aufgaben',
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
        name="More"
        component={MoreMenuScreen}
        options={{
          title: 'Mehr',
          tabBarLabel: 'Mehr',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
