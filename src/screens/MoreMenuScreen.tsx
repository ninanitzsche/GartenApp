import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MoreMenuScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>☰ Mehr</Text>
      <Text style={styles.placeholder}>
        Einkaufsliste • Garten-Pläne • Wissensbank • Profile
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
    textAlign: 'center',
  },
});
