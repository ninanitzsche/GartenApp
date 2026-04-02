# Wissensdatenbank - Manuelle Einträge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wissensdatenbank mit Manuellen Einträgen (Chat-Inputs + eigene Notizen) nach Themen/Pflanzen gruppiert

**Architecture:** Neue Felder (sourceType, sourceFile, topic) zum KnowledgeArticle-Typ hinzufügen, UI mit Quell-Filter und Topic-Gruppierung erweitern, neue Notiz-Funktion implementieren

**Tech Stack:** React Native, Supabase, TypeScript

---

## Task 1: Datenmodell erweitern

**Files:**
- Modify: `src/types/knowledge.ts:17-26`

- [ ] **Step 1: TypeScript prüfen - Compile-Fehler erwartet**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Fehler wegen fehlender Felder in KnowledgeArticle

- [ ] **Step 2: Felder hinzufügen**

```typescript
// src/types/knowledge.ts - erweitern
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  user_id: null;
  created_at: string;
  updated_at?: string;
  
  // NEUE FELDER
  sourceType?: 'chat' | 'manual' | 'api';
  sourceFile?: 'chat1' | 'chat2' | 'manual';
  topic?: string;
}
```

- [ ] **Step 3: TypeScript prüfen - PASS erwartet**

Run: `npx tsc --noEmit`
Expected: Keine Fehler

- [ ] **Step 4: Commit**

```bash
git add src/types/knowledge.ts
git commit -m "feat(knowledge): add sourceType, sourceFile, topic fields"
```

---

## Task 2: KnowledgeService erweitern

**Files:**
- Modify: `src/services/knowledgeService.ts:1-200`
- Test: `src/__tests__/knowledgeService.test.ts` (neu)

- [ ] **Step 1: Failing Test schreiben**

```typescript
// src/__tests__/knowledgeService.test.ts
import { fetchArticlesByTopic, createManualEntry } from '../services/knowledgeService';

describe('KnowledgeService', () => {
  it('should filter articles by topic', async () => {
    const result = await fetchArticlesByTopic('Tomaten');
    result.forEach(article => {
      expect(article.topic).toBe('Tomaten');
    });
  });
});
```

- [ ] **Step 2: Test ausführen - FAIL erwartet**

`npx jest src/__tests__/knowledgeService.test.ts`
Expected: FAIL - fetchArticlesByTopic not defined

- [ ] **Step 3: Neue Funktionen implementieren**

```typescript
// src/services/knowledgeService.ts - hinzufügen

/**
 * Fetch articles by topic
 */
export async function fetchArticlesByTopic(topic: string): Promise<KnowledgeArticle[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('topic', topic)  // FIX: Suche nach topic, nicht title
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as KnowledgeArticle[];
  } catch (error: any) {
    console.error('Error fetching articles by topic:', error.message);
    throw new Error(`Error fetching articles: ${error.message}`);
  }
}

/**
 * Create manual entry
 */
export async function createManualEntry(entry: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
  try {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .insert({
        title: entry.title,
        content: entry.content,
        category: entry.category || 'sonstiges',
        tags: entry.tags || [],
        sourceType: 'manual',
        sourceFile: 'manual',
        topic: entry.topic,
        user_id: null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as KnowledgeArticle;
  } catch (error: any) {
    console.error('Error creating manual entry:', error.message);
    throw new Error(`Error creating entry: ${error.message}`);
  }
}

/**
 * Fetch articles grouped by topic
 */
export async function fetchArticlesGroupedByTopic(): Promise<Record<string, KnowledgeArticle[]>> {
  try {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .order('topic', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    const grouped: Record<string, KnowledgeArticle[]> = {};
    (data || []).forEach((article: KnowledgeArticle) => {
      const topic = article.topic || 'General';
      if (!grouped[topic]) {
        grouped[topic] = [];
      }
      grouped[topic].push(article);
    });

    return grouped;
  } catch (error: any) {
    console.error('Error fetching grouped articles:', error.message);
    throw new Error(`Error fetching articles: ${error.message}`);
  }
}
```

- [ ] **Step 4: Test ausführen - PASS erwartet**

`npx jest src/__tests__/knowledgeService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/knowledgeService.ts src/__tests__/knowledgeService.test.ts
git commit -m "feat(knowledge): add topic-based fetch and manual entry creation"
```

---

## Task 3: KnowledgeBaseScreen UI anpassen

**Files:**
- Modify: `src/screens/KnowledgeBaseScreen.tsx`

- [ ] **Step 1: Imports und State hinzufügen**

```typescript
// Im KnowledgeBaseScreen
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026 } from '../theme/designSystemV2';

const [sourceFilter, setSourceFilter] = useState<'all' | 'chat' | 'manual'>('all');
const [articlesGrouped, setArticlesGrouped] = useState<Record<string, KnowledgeArticle[]>>({});
const [searchQuery, setSearchQuery] = useState('');
```

- [ ] **Step 2: Suchleiste hinzufügen (aus Spec)** - NEU

```tsx
// Vor der Kategorie-Auswahl
<View style={styles.searchContainer}>
  <MaterialIcons name="search" size={20} color={Colors2026.textMuted} />
  <TextInput
    style={styles.searchInput}
    placeholder="Suchen..."
    placeholderTextColor={Colors2026.textMuted}
    value={searchQuery}
    onChangeText={setSearchQuery}
  />
</View>
```

- [ ] **Step 3: Horizontale Kategorien-Scroll (aus Spec)** - NEU

```tsx
// Nach der Suchleiste
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
  {['Alle', ...KNOWLEDGE_CATEGORIES].map(cat => (
    <TouchableOpacity
      key={cat}
      style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
      onPress={() => setSelectedCategory(cat)}
    >
      <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
        {cat}
      </Text>
    </TouchableOpacity>
  ))}
</ScrollView>
```

- [ ] **Step 4: Daten laden mit Gruppierung**

```typescript
// useEffect für grouped articles
useEffect(() => {
  loadGroupedArticles();
}, []);

const loadGroupedArticles = async () => {
  const grouped = await fetchArticlesGroupedByTopic();
  setArticlesGrouped(grouped);
};
```

- [ ] **Step 5: Filter-Tabs UI hinzufügen**

```tsx
// Vor der Article-Liste
<View style={styles.sourceTabs}>
  <TouchableOpacity 
    style={[styles.sourceTab, sourceFilter === 'all' && styles.sourceTabActive]}
    onPress={() => setSourceFilter('all')}
  >
    <Text style={[styles.sourceTabText, sourceFilter === 'all' && styles.sourceTabTextActive]}>Alle</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={[styles.sourceTab, sourceFilter === 'chat' && styles.sourceTabActive]}
    onPress={() => setSourceFilter('chat')}
  >
    <Text style={[styles.sourceTabText, sourceFilter === 'chat' && styles.sourceTabTextActive]}>Chat</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={[styles.sourceTab, sourceFilter === 'manual' && styles.sourceTabActive]}
    onPress={() => setSourceFilter('manual')}
  >
    <Text style={[styles.sourceTabText, sourceFilter === 'manual' && styles.sourceTabTextActive]}>Notizen</Text>
  </TouchableOpacity>
</View>
```

- [ ] **Step 6: Styles hinzufügen**

```typescript
const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors2026.divider,
  },
  searchInput: { flex: 1, fontSize: 16, color: Colors2026.text, marginLeft: 8 },
  
  categoryScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors2026.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors2026.divider,
  },
  categoryChipActive: { backgroundColor: Colors2026.primary, borderColor: Colors2026.primary },
  categoryChipText: { fontSize: 14, color: Colors2026.textSecondary },
  categoryChipTextActive: { color: '#fff', fontWeight: '600' },

  sourceTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  sourceTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors2026.surface,
  },
  sourceTabActive: { backgroundColor: Colors2026.primary },
  sourceTabText: { fontSize: 14, fontWeight: '600', color: Colors2026.textSecondary },
  sourceTabTextActive: { color: '#fff' },
});
```

- [ ] **Step 7: Gruppierte Liste rendern**

```tsx
// Statt FlatList jetzt Sections
{Object.keys(articlesGrouped).map(topic => (
  <View key={topic} style={styles.topicSection}>
    <Text style={styles.topicTitle}>
      {topic === 'General' ? '🍃 General' : `🍅 ${topic}`}
    </Text>
    {articlesGrouped[topic]
      .filter(a => (sourceFilter === 'all' || a.sourceType === sourceFilter))
      .filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
  </View>
))}
```

**Hinweis zu topic: null**: Wenn topic null ist, wird automatisch 'General' verwendet (Fallback in fetchArticlesGroupedByTopic).

- [ ] **Step 8: Commit**

```bash
git add src/screens/KnowledgeBaseScreen.tsx
git commit -m "feat(knowledge): add search, category scroll, source filter tabs and topic grouping"
```

---

## Task 4: ArticleDetailScreen mit Badge

**Files:**
- Modify: `src/screens/ArticleDetailScreen.tsx`

- [ ] **Step 1: Badge-Komponente hinzufügen**

```tsx
// Im ArticleDetailScreen, nach dem Titel
<View style={styles.badges}>
  <View style={[
    styles.sourceBadge,
    article.sourceType === 'chat' && styles.badgeChat,
    article.sourceType === 'manual' && styles.badgeManual,
    article.sourceType === 'api' && styles.badgeApi,
  ]}>
    <Text style={styles.badgeText}>
      {article.sourceType === 'chat' ? '🤖 Chat' : 
       article.sourceType === 'manual' ? '✏️ Notiz' : '🌐 API'}
    </Text>
  </View>
  {article.topic && (
    <View style={styles.topicBadge}>
      <Text style={styles.topicBadgeText}>🍅 {article.topic}</Text>
    </View>
  )}
</View>
```

- [ ] **Step 2: Styles hinzufügen**

```typescript
badges: {
  flexDirection: 'row',
  gap: 8,
  marginTop: 8,
},
sourceBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
},
badgeChat: { backgroundColor: '#E3F2FD' },
badgeManual: { backgroundColor: '#FFF3E0' },
badgeApi: { backgroundColor: '#E8F5E9' },
badgeText: {
  fontSize: 12,
  fontWeight: '600',
  color: Colors2026.text,
},
topicBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  backgroundColor: Colors2026.surface,
  borderWidth: 1,
  borderColor: Colors2026.divider,
},
topicBadgeText: {
  fontSize: 12,
  fontWeight: '500',
  color: Colors2026.textSecondary,
},
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/ArticleDetailScreen.tsx
git commit -m "feat(knowledge): add source and topic badges"
```

---

## Task 5: Notiz hinzufügen Screen

**Files:**
- Create: `src/screens/AddKnowledgeNoteScreen.tsx`
- Modify: `src/navigation/MoreMenuStackNavigator.tsx`
- Modify: `src/types/navigation.ts`

- [ ] **Step 1: Screen erstellen**

```tsx
// src/screens/AddKnowledgeNoteScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors2026, Spacing2026, Radius2026 } from '../theme/designSystemV2';
import { createManualEntry } from '../services/knowledgeService';
import { KnowledgeCategory, KNOWLEDGE_CATEGORIES } from '../types/knowledge';

type Props = NativeStackScreenProps<any, 'AddKnowledgeNote'>;

export default function AddKnowledgeNoteScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('sonstiges');
  const [topic, setTopic] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    
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
    } catch (error) {
      console.error('Error saving note:', error);
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
        placeholderTextColor={Colors2026.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.topicInput}
        placeholder="Thema (z.B. Tomaten, Gurken, General)"
        placeholderTextColor={Colors2026.textMuted}
        value={topic}
        onChangeText={setTopic}
      />

      <Text style={styles.categoryLabel}>Kategorie</Text>
      <View style={styles.categoryContainer}>
        {KNOWLEDGE_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.contentInput}
        placeholder="Inhalt der Notiz..."
        placeholderTextColor={Colors2026.textMuted}
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
    borderBottomColor: Colors2026.divider,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors2026.text },
  saveButton: { fontSize: 16, fontWeight: '600', color: Colors2026.primary },
  saveButtonDisabled: { color: Colors2026.textMuted },
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
    borderColor: Colors2026.divider,
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
```

- [ ] **Step 2: Navigation erweitern**

```typescript
// src/types/navigation.ts - MoreMenuStackParamList erweitern
export type MoreMenuStackParamList = {
  MoreMenu: undefined;
  AddKnowledgeNote: undefined;
  // ... existing routes
};

// src/navigation/MoreMenuStackNavigator.tsx - Screen hinzufügen
import AddKnowledgeNoteScreen from '../screens/AddKnowledgeNoteScreen';

// Im Stack:
<Stack.Screen name="AddKnowledgeNote" component={AddKnowledgeNoteScreen} options={{ title: 'Neue Notiz' }} />
```

- [ ] **Step 3: In KnowledgeBaseScreen Button hinzufügen**

```tsx
// FAB oder Header-Button
<TouchableOpacity 
  style={styles.addNoteButton}
  onPress={() => navigation.navigate('AddKnowledgeNote')}
>
  <MaterialIcons name="add" size={24} color="#fff" />
</TouchableOpacity>
```

- [ ] **Step 4: Commit**

```bash
git add src/screens/AddKnowledgeNoteScreen.tsx src/navigation/MoreMenuStackNavigator.tsx src/types/navigation.ts
git commit -m "feat(knowledge): add note creation screen"
```

---

## Task 6: Chat-Migration Topic-Extraktion

**Files:**
- Modify: `scripts/migrate-chat-knowledge.js`
- Create: `scripts/re-migrate-knowledge-with-topics.js`

- [ ] **Step 1: Topics aus Titel extrahieren**

```javascript
// Neue Funktion zum Topic-Extraktieren
function extractTopic(title) {
  // Häufige Pflanzen/Themen erkennen
  const topics = ['Tomaten', 'Gurken', 'Paprika', 'Aubergine', 'Zucchini', 'Kräuter', 'Salat', 'Bohnen', 'Erbsen', 'Kartoffeln', 'Zwiebeln', 'Möhren', 'Rote Bete', 'Kohl', 'Blumen'];
  
  const lowerTitle = title.toLowerCase();
  for (const topic of topics) {
    if (lowerTitle.includes(topic.toLowerCase())) {
      return topic;
    }
  }
  return 'General';
}
```

- [ ] **Step 2: Migration Script erweitern**

```javascript
// In migrate-chat-knowledge.js
articles.push({
  title: parsedTitle,
  content: parsedContent,
  category: categorizeArticle(title),
  tags: [],
  sourceType: 'chat',
  sourceFile: chatFile === GEMINI_1_PATH ? 'chat1' : 'chat2',
  topic: extractTopic(title),  // NEU
  user_id: null,
  created_at: new Date().toISOString(),
});
```

- [ ] **Step 3: Commit**

```bash
git add scripts/migrate-chat-knowledge.js
git commit -m "feat(knowledge): add topic extraction to chat migration"
```

---

## Task 7: Article Bearbeiten (aus Spec)

**Files:**
- Create: `src/screens/EditKnowledgeArticleScreen.tsx`
- Modify: `src/navigation/MoreMenuStackNavigator.tsx`
- Modify: `src/types/navigation.ts`

- [ ] **Step 1: Edit Screen erstellen**

Similar to AddKnowledgeNoteScreen but:
- Lädt existierenden Artikel per ID
- Speichert Änderungen mit `updateKnowledgeArticle`
- Lösch-Button hinzufügen

```typescript
// src/services/knowledgeService.ts - hinzufügen
export async function updateKnowledgeArticle(id: string, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> {
  const { data, error } = await supabase
    .from('knowledge_articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as KnowledgeArticle;
}

export async function deleteKnowledgeArticle(id: string): Promise<void> {
  const { error } = await supabase.from('knowledge_articles').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 2: In ArticleDetailScreen Edit-Button**

```tsx
// Header-Right Button
<TouchableOpacity onPress={() => navigation.navigate('EditKnowledgeArticle', { articleId })}>
  <MaterialIcons name="edit" size={24} color={Colors2026.primary} />
</TouchableOpacity>
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/EditKnowledgeArticleScreen.tsx src/services/knowledgeService.ts src/screens/ArticleDetailScreen.tsx
git commit -m "feat(knowledge): add article edit and delete functionality"
```

---

## Summary

| Task | Beschreibung |
|------|--------------|
| 1 | Datenmodell erweitern (sourceType, sourceFile, topic) |
| 2 | KnowledgeService mit Topic-Funktionen |
| 3 | KnowledgeBaseScreen mit Suche, Kategorien-Scroll, Filter-Tabs, Topic-Gruppierung |
| 4 | ArticleDetailScreen mit Badge-Anzeige |
| 5 | Notiz hinzufügen Screen |
| 6 | Chat-Migration Topic-Extraktion |
| 7 | Artikel bearbeiten/löschen (aus Spec)

---

**Plan complete.** Which execution approach?

1. **Subagent-Driven (recommended)** - I dispatch fresh subagent per task
2. **Inline Execution** - Execute tasks in this session