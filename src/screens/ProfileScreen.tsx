import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GlassCard from '../components/ui/GlassCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { user } = useAuth();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Unbekannt';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Unbekannt';
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.spacer} />
      </View>

      {/* User Info Section */}
      <View style={styles.section}>
        <View style={styles.userInfoCard}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={80} color={Colors2026.primary} />
          </View>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      {/* Account Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kontoinformationen</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <MaterialIcons name="event" size={20} color={Colors2026.primary} />
              <Text style={styles.infoLabelText}>Konto erstellt am</Text>
            </View>
            <Text style={styles.infoValue}>
              {formatDate(user?.created_at)}
            </Text>
          </View>
        </View>
      </View>

      {/* Manage Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konto verwalten</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleChangePassword}
          activeOpacity={0.7}
        >
          <View style={styles.actionButtonContent}>
            <MaterialIcons name="lock" size={20} color={Colors2026.primary} />
            <View style={styles.actionButtonText}>
              <Text style={styles.actionButtonTitle}>Passwort ändern</Text>
              <Text style={styles.actionButtonDesc}>Ihr Passwort aktualisieren</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={Colors2026.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Footer Spacer */}
      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  userInfoCard: {
    backgroundColor: Colors2026.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors2026.text,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors2026.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: Colors2026.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabelText: {
    fontSize: 14,
    color: Colors2026.text,
    marginLeft: 10,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: Colors2026.textSecondary,
    marginLeft: 10,
  },
  actionButton: {
    backgroundColor: Colors2026.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors2026.text,
  },
  actionButtonDesc: {
    fontSize: 12,
    color: Colors2026.textSecondary,
    marginTop: 2,
  },
  footerSpacer: {
    height: 30,
  },
});
