import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors2026 } from '../theme/designSystemV2';
import { RootStackParamList } from '../types/navigation';

import MoreMenuScreen from '../screens/MoreMenuScreen';
import ShoppingDashboardScreen from '../screens/ShoppingDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import HarvestLogScreen from '../screens/HarvestLogScreen';
import AddHarvestScreen from '../screens/AddHarvestScreen';
import KnowledgeBaseScreen from '../screens/KnowledgeBaseScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import AddKnowledgeNoteScreen from '../screens/AddKnowledgeNoteScreen';
import EditKnowledgeArticleScreen from '../screens/EditKnowledgeArticleScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MoreMenuStackNavigator() {
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
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HarvestLog"
        component={HarvestLogScreen}
        options={{
          title: 'Ernte-Tagebuch',
        }}
      />
      <Stack.Screen
        name="AddHarvest"
        component={AddHarvestScreen}
        options={{
          title: 'Ernte dokumentieren',
        }}
      />
      <Stack.Screen
        name="KnowledgeBase"
        component={KnowledgeBaseScreen}
        options={{
          title: 'Wissensdatenbank',
        }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{
          title: 'Artikel',
        }}
      />
      <Stack.Screen
        name="AddKnowledgeNote"
        component={AddKnowledgeNoteScreen}
        options={{
          title: 'Neue Notiz',
        }}
      />
      <Stack.Screen
        name="EditKnowledgeArticle"
        component={EditKnowledgeArticleScreen}
        options={{
          title: 'Artikel bearbeiten',
        }}
      />
    </Stack.Navigator>
  );
}
