import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors2026, Spacing2026, Radius2026 } from '../theme/designSystemV2';
import { createManualEntry } from '../services/knowledgeService';
import { KnowledgeCategory, KNOWLEDGE_CATEGORIES } from '../types/knowledge';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddKnowledgeNote'>;

export default function AddKnowledgeNoteScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('sonstiges');
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Titel und Inhalt ein.');
      return;
    }
    
    setSaving(true);
    try {
      await createManualEntry({
        title: title.trim(),
        content: content.trim(),
        category,
        topic: topic.trim() || 'General',
        tags: [],
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Fehler', `Notiz konnte nicht gespeichert werden: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={Colors2026.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Neue Notiz</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving || !title.trim()}>
          <Text style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}>
            {saving ? 'Speichern...' : 'Speichern'}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.titleInput}
        placeholder="Titel"
        placeholderTextColor={Colors2026.textSecondary}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.topicInput}
        placeholder="Thema (z.B. Tomaten, Gurken, General)"
        placeholderTextColor={Colors2026.textSecondary}
        value={topic}
        onChangeText={setTopic}
      />

      <Text style={styles.categoryLabel}>Kategorie</Text>
      <View style={styles.categoryContainer}>
        {KNOWLEDGE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.contentInput}
        placeholder="Inhalt der Notiz..."
        placeholderTextColor={Colors2026.textSecondary}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors2026.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing2026.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors2026.text },
  saveButton: { fontSize: 16, fontWeight: '600', color: Colors2026.primary },
  saveButtonDisabled: { color: Colors2026.textSecondary },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    padding: Spacing2026.lg,
    color: Colors2026.text,
  },
  topicInput: {
    fontSize: 14,
    paddingHorizontal: Spacing2026.lg,
    paddingBottom: Spacing2026.md,
    color: Colors2026.text,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors2026.textSecondary,
    paddingHorizontal: Spacing2026.lg,
    paddingTop: Spacing2026.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: Spacing2026.lg,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.surface,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  categoryChipActive: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  categoryChipText: { fontSize: 14, color: Colors2026.text },
  categoryChipTextActive: { color: '#fff', fontWeight: '600' },
  contentInput: {
    fontSize: 16,
    padding: Spacing2026.lg,
    minHeight: 200,
    color: Colors2026.text,
  },
});
