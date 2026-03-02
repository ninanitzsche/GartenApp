import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PhotoGalleryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Fotos</Text>
      <Text style={styles.placeholder}>
        Hier kommt die Foto-Galerie
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
