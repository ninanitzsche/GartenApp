import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Colors from '../theme/colors';

export default function MoreMenuScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchten Sie sich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            await signOut();
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
        <Text style={styles.sectionTitle}>Kommende Funktionen</Text>
        <View style={styles.menuItem}>
          <MaterialIcons name="shopping-cart" size={24} color={Colors.textLight} />
          <Text style={styles.menuItemText}>Einkaufsliste</Text>
        </View>
        <View style={styles.menuItem}>
          <MaterialIcons name="map" size={24} color={Colors.textLight} />
          <Text style={styles.menuItemText}>Garten-Pläne</Text>
        </View>
        <View style={styles.menuItem}>
          <MaterialIcons name="book" size={24} color={Colors.textLight} />
          <Text style={styles.menuItemText}>Wissensbank</Text>
        </View>
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
