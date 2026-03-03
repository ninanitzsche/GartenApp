import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Colors from '../theme/colors';

import MoreMenuScreen from '../screens/MoreMenuScreen';
import ShoppingDashboardScreen from '../screens/ShoppingDashboardScreen';

const Stack = createNativeStackNavigator();

export default function MoreMenuStackNavigator() {
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
        name="MoreMenu"
        component={MoreMenuScreen}
        options={{
          title: 'Mehr',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="ShoppingDashboard"
        component={ShoppingDashboardScreen}
        options={{
          title: 'Einkaufsliste',
        }}
      />
    </Stack.Navigator>
  );
}
