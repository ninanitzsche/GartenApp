import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlantListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌿 Pflanzen-Inventar</Text>
      <Text style={styles.placeholder}>
        Hier kommt die Pflanzenliste
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
    color: '#4CAF50',
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
  },
});
