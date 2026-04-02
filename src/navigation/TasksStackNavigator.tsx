import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors2026 } from '../theme/designSystemV2';

// Import Screens
import TaskListScreen from '../screens/TaskListScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';

// Import Types
import { TasksStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<TasksStackParamList>();

export default function TasksStackNavigator() {
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
        name="TaskList"
        component={TaskListScreen}
        options={{
          title: 'Aufgaben',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{
          title: 'Aufgabe erstellen',
        }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          title: 'Aufgabe',
          presentation: 'modal',
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors2026.surface,
          },
          headerTintColor: Colors2026.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{
          title: 'Wissen',
          headerStyle: {
            backgroundColor: Colors2026.surface,
          },
          headerTintColor: Colors2026.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
}