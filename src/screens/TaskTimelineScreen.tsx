import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Colors2026 } from '../theme/designSystemV2';
import TaskTimelineView from '../components/TaskTimelineView';

interface Task {
  id: string;
  title: string;
  category: 'planting' | 'pruning' | 'watering' | 'mulching' | 'harvesting' | 'maintenance';
  priority: 'hoch' | 'mittel';
  scheduled_date: string;
  description?: string;
}

export const TaskTimelineScreen = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  const loadTasks = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('id, title, category, priority, scheduled_date, description')
        .eq('user_id', user.id)
        .eq('auto_generated', true)
        .order('scheduled_date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setTasks(data || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Fehler beim Laden der Tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskPress = (task: Task) => {
    // Navigate to task detail or show modal
    console.log('Task pressed:', task);
    // TODO: Implement navigation to task detail
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors2026.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TaskTimelineView
        tasks={tasks}
        onTaskPress={handleTaskPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors2026.status.error,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default TaskTimelineScreen;
