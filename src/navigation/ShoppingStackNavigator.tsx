import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Colors from '../theme/colors';

// Import Screens
import ShoppingListScreen from '../screens/ShoppingListScreen';
import AddShoppingItemScreen from '../screens/AddShoppingItemScreen';
import EditShoppingItemScreen from '../screens/EditShoppingItemScreen';

const Stack = createNativeStackNavigator();

export default function ShoppingStackNavigator() {
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
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
          title: 'Einkaufsliste',
        }}
      />
      <Stack.Screen
        name="AddShoppingItem"
        component={AddShoppingItemScreen}
        options={{
          title: 'Artikel hinzufügen',
        }}
      />
      <Stack.Screen
        name="EditShoppingItem"
        component={EditShoppingItemScreen}
        options={{
          title: 'Artikel bearbeiten',
        }}
      />
    </Stack.Navigator>
  );
}
