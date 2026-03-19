/**
 * BedCard Component
 * Displays bed information in a card format
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Bed } from '../types/bed';
import Colors from '../theme/colors';

interface BedCardProps {
  bed: Bed;
  plantCount: number;
  onPress: () => void;
}

export default function BedCard({
  bed,
  plantCount,
  onPress,
}: BedCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.colorIndicator}>
          <View
            style={[
              styles.colorDot,
              { backgroundColor: bed.color || '#4CAF50' },
            ]}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.bedName}>{bed.name}</Text>
          {bed.notes && <Text style={styles.notes}>{bed.notes}</Text>}
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialIcons name="aspect-ratio" size={16} color={Colors.textLight} />
          <Text style={styles.detailText}>
            {bed.width.toFixed(0)}% × {bed.height.toFixed(0)}%
          </Text>
        </View>
        {plantCount > 0 && (
          <View style={styles.detailRow}>
            <MaterialIcons name="eco" size={16} color={Colors.success} />
            <Text style={styles.detailText}>
              {plantCount} {plantCount === 1 ? 'Pflanze' : 'Pflanzen'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorIndicator: {
    marginRight: 12,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titleContainer: {
    flex: 1,
  },
  bedName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    color: Colors.textLight,
  },
  details: {
    flexDirection: 'row',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
