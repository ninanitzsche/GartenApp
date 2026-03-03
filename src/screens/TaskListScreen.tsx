import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types/navigation';
import Colors from '../theme/colors';
import EmptyState from '../components/EmptyState';

type Props = BottomTabScreenProps<TabParamList, 'Tasks'>;

export default function TaskListScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <EmptyState
        icon="assignment"
        title="Keine Aufgaben"
        message="Planen Sie Ihre Gartenpflege mit Aufgaben"
        containerStyle={styles.emptyContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
