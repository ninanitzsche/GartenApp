# Design: Wissensdatenbank - Manuelle Einträge

**Datum:** 2026-03-27
**Status:** Entwurf

---

## Ziel

Die Wissensdatenbank soll strukturierte Einträge aus Chat-Verläufen und eigenen Notizen enthalten, gruppiert nach Themen/Pflanzen.

---

## Architektur

### Datenmodell (Erweiterung)

```typescript
type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  category: 'pflege' | 'schädlinge' | 'pflanzen' | 'ernte' | 'boden' | 'sonstiges';
  tags: string[];
  
  // NEUE FELDER
  sourceType: 'chat' | 'manual' | 'api';
  sourceFile?: 'chat1' | 'chat2' | 'manual';
  topic?: string; // Thema/Pflanze (z.B. "Tomaten", "Gurken", "General")
  
  createdAt: string;
  updatedAt?: string;
}
```

---

## UI-Struktur

### KnowledgeBaseScreen

```
┌─────────────────────────────────────────────┐
│  🔍 Suche...                          🔎   │
├─────────────────────────────────────────────┤
│  KATEGORIEN (horiz. Scroll)                 │
│  [Alle] [Pflege] [Schädlinge] [Pflanzen]   │
│  [Ernte] [Boden] [Sonstiges]                │
├─────────────────────────────────────────────┤
│  QUELLEN (Tabs)                             │
│  ┌─────────┬─────────┬─────────┐              │
│  │  Alle   │  Chat   │ Notizen │              │
│  └─────────┴─────────┴─────────┘              │
├─────────────────────────────────────────────┤
│  EINTRÄGE (gruppiert nach Thema/Pflanze)   │
│                                             │
│  🍅 TOMATEN                                 │
│    ├─ Chat: Tomaten - Pflege (Pflege)       │
│    ├─ Chat: Tomaten - Schädlinge (Schädlinge)│
│    └─ Notiz: Meine Tomatenerfahrungen       │
│                                             │
│  🥒 GURKEN                                   │
│    ├─ Chat: Gurken - Anbau (Pflanzen)       │
│    └─ Notiz: Gurken Tipps 2025               │
│                                             │
│  🍃 GENERAL                                  │
│    ├─ Chat: Bodenverbesserung (Boden)       │
│    └─ Notiz: Frühjahrscheck                  │
└─────────────────────────────────────────────┘
```

### ArticleDetailScreen

```
┌─────────────────────────────────────────────┐
│  ← Zurück         Wissen          ✏️ Edit   │
├─────────────────────────────────────────────┤
│  TOMATEN: Späte Frostgefahr!               │
│  ┌─────────────────────────────────────┐    │
│  │ 🤖 Chat    │ 🏷️ Pflege    │ 🍅 Tomaten │    │
│  └─────────────────────────────────────┘    │
│  ─────────────────────────────────────────  │
│  Artikel-Text...                            │
└─────────────────────────────────────────────┘
```

---

## Features

| Feature | Beschreibung |
|---------|--------------|
| Topic-Gruppierung | Einträge nach Pflanze/Thema sortiert |
| Quelle sichtbar | Badge zeigt "Chat" / "Notiz" / "API" |
| Thema-Tag | z.B. "Tomaten", "Gurken", "General" |
| Neue Notiz erstellen | Eigene Notizen hinzufügen |
| Kategorie-Filter | Pflege, Schädlinge, Pflanzen, etc. |
| Quell-Filter | Alle / Chat / Notizen |

---

## Änderungen an bestehenden Screens

1. **KnowledgeBaseScreen** - Neue Tabs + Topic-Gruppierung
2. **ArticleDetailScreen** - Badge für Quelle anzeigen
3. **Neuer AddNoteScreen** - Notiz erstellen mit Kategorie + Topic

---

## Nächste Schritte

1. Bestehende Chat-Migration analysieren
2. Topic-Extraktion implementieren
3. UI-Komponenten anpassen
4. "Notiz hinzufügen" Screen erstellen
5. PlantNet-API Integration (später)