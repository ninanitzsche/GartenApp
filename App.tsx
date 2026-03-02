import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from './src/services/supabase';
import { useEffect, useState } from 'react';

export default function App() {
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking...');

  useEffect(() => {
    // Check Supabase connection
    const checkSupabase = async () => {
      try {
        const { data, error } = await supabase.from('plants').select('count');
        if (error && error.message.includes('relation "plants" does not exist')) {
          setSupabaseStatus('✅ Supabase connected! (Database tables not created yet)');
        } else if (error) {
          setSupabaseStatus(`⚠️ Supabase error: ${error.message}`);
        } else {
          setSupabaseStatus('✅ Supabase fully configured!');
        }
      } catch (e) {
        setSupabaseStatus('❌ Supabase not configured. Check .env file.');
      }
    };

    checkSupabase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Gartenplaner</Text>
      <Text style={styles.subtitle}>Sprint 1 - Development Setup</Text>
      <Text style={styles.status}>{supabaseStatus}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
});
