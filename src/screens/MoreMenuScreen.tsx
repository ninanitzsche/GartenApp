import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types/navigation';
import Colors from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'MoreMenu'>;

export default function MoreMenuScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    console.log('🔵 LOGOUT BUTTON PRESSED - NEW CODE RUNNING!');
    Alert.alert(
      'Abmelden',
      'Möchten Sie sich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            console.log('🔵 LOGOUT CONFIRMED, signing out...');
            try {
              await signOut();
              console.log('🔵 LOGOUT SUCCESS');
            } catch (error) {
              console.error('🔵 LOGOUT ERROR:', error);
              Alert.alert('Fehler', 'Abmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <MaterialIcons name="account-circle" size={60} color={Colors.primary} />
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Konto</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="account-circle" size={24} color={Colors.primary} />
          <Text style={styles.menuItemText}>Mein Profil</Text>
          <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} style={styles.chevron} />
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Funktionen</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ShoppingDashboard')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="shopping-cart" size={24} color={Colors.primary} />
          <Text style={styles.menuItemText}>Einkaufsliste</Text>
          <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('HarvestLog')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="agriculture" size={24} color={Colors.primary} />
          <Text style={styles.menuItemText}>Ernte-Tagebuch</Text>
          <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('KnowledgeBase')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="menu-book" size={24} color={Colors.primary} />
          <Text style={styles.menuItemText}>Wissensdatenbank</Text>
          <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} style={styles.chevron} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Abmelden</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  email: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 10,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: 15,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  logoutButton: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 'auto',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
