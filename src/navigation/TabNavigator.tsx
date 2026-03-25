import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/navigation';
import GlassTabBar from '../components/ui/GlassTabBar';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import PlantsStackNavigator from './PlantsStackNavigator';
import GardenStackNavigator from './GardenStackNavigator';
import MoreMenuStackNavigator from './MoreMenuStackNavigator';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />

      <Tab.Screen
        name="Plants"
        component={PlantsStackNavigator}
        options={{
          title: 'Pflanzen',
          tabBarLabel: 'Pflanzen',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="GardenOverview"
        component={GardenStackNavigator}
        options={{
          title: 'Garten',
          tabBarLabel: 'Garten',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="More"
        component={MoreMenuStackNavigator}
        options={{
          title: 'Mehr',
          tabBarLabel: 'Mehr',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
