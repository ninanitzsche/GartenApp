/**
 * GildeListScreen - List all gilden (system + user)
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Typography2026 } from '../theme/designSystemV2';
import EmptyState from '../components/ui/EmptyState';
import GildeCard from '../components/gilde/GildeCard';
import { fetchGilden } from '../services/gildeService';
import { Gilde } from '../types/gilde';

type Props = NativeStackScreenProps<RootStackParamList, 'GildeList'>;

export default function GildeListScreen({ navigation }: Props) {
  const [systemGilden, setSystemGilden] = useState<Gilde[]>([]);
  const [userGilden, setUserGilden] = useState<Gilde[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGilden();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadGilden();
    });
    return unsubscribe;
  }, [navigation]);

  const loadGilden = async () => {
    try {
      const gilden = await fetchGilden();
      const system = gilden.filter(g => g.is_system);
      const user = gilden.filter(g => !g.is_system);
      setSystemGilden(system);
      setUserGilden(user);
    } catch (error) {
      console.error('Error loading gilden:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGilden();
  };

  const handleGildePress = (gilde: Gilde) => {
    navigation.navigate('GildeEdit', { gildeId: gilde.id });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors2026.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gilden</Text>
        <TouchableOpacity onPress={() => navigation.navigate('GildeEdit', {})}>
          <MaterialIcons name="add" size={24} color={Colors2026.primary} />
        </TouchableOpacity>
      </View>

      {systemGilden.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System-Gilden</Text>
          <Text style={styles.sectionSubtitle}>
            Vordefinierte Pflanzinseln
          </Text>
          {systemGilden.map(gilde => (
            <TouchableOpacity key={gilde.id} onPress={() => handleGildePress(gilde)}>
              <GildeCard gilde={gilde} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meine Gilden</Text>
        {userGilden.length > 0 ? (
          userGilden.map(gilde => (
            <TouchableOpacity key={gilde.id} onPress={() => handleGildePress(gilde)}>
              <GildeCard gilde={gilde} />
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            icon={<MaterialIcons name="group-add" size={48} color={Colors2026.textMuted} />}
            title="Keine eigenen Gilden"
            subtitle="Erstelle deine eigene Gilde für spezielle Pflanzkombinationen."
            action={
              <TouchableOpacity
                onPress={() => navigation.navigate('GildeEdit', {})}
                style={styles.createButton}
              >
                <MaterialIcons name="add" size={18} color="#fff" />
                <Text style={styles.createButtonText}>Gilde erstellen</Text>
              </TouchableOpacity>
            }
          />
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  headerTitle: {
    ...Typography2026.title,
    color: Colors2026.text,
  },
  section: {
    paddingHorizontal: Spacing2026.md,
    paddingTop: Spacing2026.lg,
  },
  sectionTitle: {
    ...Typography2026.title,
    color: Colors2026.text,
    marginBottom: Spacing2026.xs,
  },
  sectionSubtitle: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
    marginBottom: Spacing2026.md,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors2026.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginTop: Spacing2026.md,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 50,
  },
});
