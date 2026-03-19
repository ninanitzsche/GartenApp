/**
 * GardenStatsCard Component
 * Displays garden statistics
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import MetricCard from './MetricCard';
import Colors from '../theme/colors';

interface GardenStatsCardProps {
  bedCount: number;
  plantCount: number;
}

export default function GardenStatsCard({
  bedCount,
  plantCount,
}: GardenStatsCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gartenübersicht</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <MetricCard
          title="Beete"
          value={bedCount}
          icon="dashboard"
          color={Colors.primary}
          style={styles.metric}
        />
        <MetricCard
          title="Pflanzen"
          value={plantCount}
          icon="eco"
          color={Colors.success}
          style={styles.metric}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  metric: {
    width: 160,
    marginRight: 12,
  },
});
