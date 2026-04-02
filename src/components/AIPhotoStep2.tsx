import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../theme/designSystemV2';

interface AIPhotoStep2Props {
  identificationStatus: 'pending' | 'loading' | 'done' | 'error';
  diseaseStatus: 'pending' | 'loading' | 'done' | 'error';
  matchingStatus: 'pending' | 'loading' | 'done' | 'error';
  error?: string | null;
}

export default function AIPhotoStep2({
  identificationStatus,
  diseaseStatus,
  matchingStatus,
  error,
}: AIPhotoStep2Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <MaterialIcons name="check-circle" size={20} color={Colors2026.status.success} />;
      case 'error':
        return <MaterialIcons name="error" size={20} color={Colors2026.status.error} />;
      case 'loading':
        return <ActivityIndicator size="small" color={Colors2026.primary} />;
      default:
        return <MaterialIcons name="radio-button-unchecked" size={20} color={Colors2026.textSecondary} />;
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors2026.primary} />
      <Text style={styles.title}>KI analysiert...</Text>
      
      <View style={styles.statusList}>
        <View style={styles.statusItem}>
          {getStatusIcon(identificationStatus)}
          <Text style={styles.statusText}>Pflanze wird identifiziert...</Text>
        </View>
        <View style={styles.statusItem}>
          {getStatusIcon(diseaseStatus)}
          <Text style={styles.statusText}>Gesundheit wird analysiert...</Text>
        </View>
        <View style={styles.statusItem}>
          {getStatusIcon(matchingStatus)}
          <Text style={styles.statusText}>Passende Pflanzen werden gesucht...</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={20} color={Colors2026.status.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors2026.text,
    marginTop: 16,
    marginBottom: 24,
  },
  statusList: {
    width: '100%',
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors2026.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors2026.status.error + '20',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors2026.status.error,
    flex: 1,
  },
});
