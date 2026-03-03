import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/navigation';

type Props = BottomTabScreenProps<TabParamList, 'Tasks'>;

export default function TaskListScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Aufgaben</Text>
      <Text style={styles.placeholder}>
        Hier kommt die Aufgabenliste
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
  },
});
