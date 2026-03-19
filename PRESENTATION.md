---
title: Gartenplaner
subtitle: Wie ich mit KI smart entwickelt habe
author: Nina Nitzsche
date: 5. März 2026
theme: black
highlightTheme: atom-one-dark
transition: fade
center: true
---

# 🌱 Gartenplaner
## KI-gestützte Entwicklung

Das Geheimnis ist nicht, schneller zu bauen.
Es ist, **smart** zu bauen.

---

## Was ich gebaut habe

Eine **Mobile App** für Garten-Management nach Permakultur-Prinzipien.

Eine Codebasis → Drei Plattformen (iOS, Android, Web)

---

### Die Features

- 🌿 **Pflanzen-Inventar** – 50+ Pflanzen mit Live-Tracking
- 📋 **Dynamische Aufgaben** – Intelligente Planung
- 📸 **Foto-Dokumentation** – Evidenz-basierte Entscheidungen
- 🛒 **Einkaufsliste** – Budget-Tracking
- 📚 **Wissens-Datenbank** – 50+ Artikel
- 📊 **Erfolgs-Metriken** – Dashboard

---

### Die Zahlen

<small>

| Metrik | Ergebnis |
|--------|----------|
| **Sprints** | 5 |
| **Storys** | 13 (56,5 Punkte) |
| **Tests** | 83 Tests, 70% Coverage |
| **Code-Reuse** | 70% |
| **Budget** | $25 geplant, **$2,09 actual** |
| **Ersparnis** | **92% unter Budget** |

</small>

**Status:** ✅ Code-fertig, bereit zum Deployment

---

## Tech Stack

```
React Native + Expo
        ↓
  TypeScript (Strict)
        ↓
  Supabase Backend
        ↓
iOS ✅ | Android ✅ | Web ✅
```

Eine Codebasis. Drei Plattformen. Null Plattform-spezifischer Code.

---

## Die Architektur

```
┌──────────────────────────┐
│  Screens (UI)            │
├──────────────────────────┤
│  Services (Geschäftslogik)│  ← 70% Code-Reuse
│  (CRUD Templates)        │
├──────────────────────────┤
│  Supabase Backend        │  ← Serverless DB
│  (PostgreSQL + Auth)     │
└──────────────────────────┘
```

**Prinzip:** Separation of Concerns

---

# 📋 Mein Vorgehen: BMAD Method

---

## Was ist BMAD?

**B** = Business Brief
**M** = (Market/Method) – Anforderungen klären
**A** = Architecture – Technisches Design
**D** = Development – Entwicklung + Feedback

Strukturierter Prozess von der Idee bis zur Umsetzung.

---

## Die 5 BMAD Phasen

```
1. Product Brief
   ↓ (Was bauen wir? Warum?)
2. PRD (Requirements)
   ↓ (Spezifikation: 25 Features, 7 Epics)
3. Architecture
   ↓ (Wie bauen wir? DB-Schema, API)
4. Sprint Planning
   ↓ (Welche Stories in welchem Sprint?)
5. Development
   ↓ (Code + Tests + Dokumentation)
```

---

## Warum BMAD Kosten spart

### Ohne BMAD ❌

```
"Lass mich schnell coden!"
    ↓
Halfway through: "Ups, falsche Requirements"
    ↓
Refactoring, Redesign, Rework
    ↓
Budget überschritten!
```

### Mit BMAD ✅

```
1. Brief klären (15 min)
2. Anforderungen aufschreiben (30 min)
3. Architektur designen (30 min)
4. Code mit Sicherheit (2-3 Tage)
   (Weiß genau, was zu tun ist!)
```

**Resultat:** 90% weniger Retries

---

## BMAD im Gartenplaner

### Phase 1: Product Brief (30 min)
```
Frage: "Wofür ist diese App?"
Antwort: "Permakultur-Garten intelligent verwalten"
         "Permakultur-Anfänger unterstützen"
         "Zeitersparnis: Unkrautarbeit < 1h/Monat"
```

### Phase 2: Requirements (1 Tag)
```
25 Functional Requirements (FR-001 bis FR-025)
7 Epics (Plant Inventory, Task Management, etc.)
9 Non-Functional Requirements (Performance, Security)
```

### Phase 3: Architecture (1 Tag)
```
Database Schema (11 Tabellen)
Service Layer Pattern (für alle CRUD-Operationen)
RLS Policies (Row Level Security)
API Design
```

### Phase 4: Sprint Planning (1 Tag)
```
Sprint 1-5 Plan
Story Breakdown
Estimation basierend auf Architektur
```

### Phase 5: Development (10 Wochen)
```
Code mit 70% Reuse (via Service Layer Pattern)
Tests folgen Architektur
Dokumentation kontinuierlich
```

---

## Story Breakdown in der Praxis

![Story Details](../../presentation-standort-2026-03/session-2-bmad-method/screenshots/03-story-breakdown/01-story-details.png)

**Was hier passiert:**
- Jede Story hat klare Acceptance Criteria
- Claude weiß GENAU was implementieren ist
- Keine Überraschungen mid-sprint

---

## Das Resultat von BMAD

```
Klare Requirements
        ↓
Konsequente Architektur
        ↓
Vorhersagbare Velocity (10.8 pts/sprint)
        ↓
Keine Überraschungen
        ↓
92% unter Budget!
```

---

# 🧠 Das echte Geheimnis: MEMORY

---

## Was ist MEMORY.md?

**Auto-geladene Kontext-Datei** für Claude

Wenn ich eine neue Conversation starte:
1. ✅ MEMORY lädt automatisch
2. ✅ Claude sieht bewährte Patterns
3. ✅ Keine Wiederholungen nötig
4. ✅ Behobene Bugs sind bekannt

---

## Ohne MEMORY ❌

```
Ich: "Wie schreibe ich einen Service?"

Claude: *erklärt 30 Minuten*
        Code-Beispiel
        Error Handling
        Best Practices
        Testing

Resultat: 30 min, 5.000 Tokens, $1,50
```

---

## Mit MEMORY ✅

```
Ich: "Wie schreibe ich einen Service?"

Claude: "Siehe MEMORY.md → Service Layer Pattern
         Template: plantService.ts"

Resultat: 2 min, 500 Tokens, $0,15
```

---

## Der Pattern-Zyklus

### Sprint 1: Pattern Erstellt
Ich schreibe `plantService.ts` (Service Layer Pattern)

### Sprint 2: Pattern Gespeichert
Claude dokumentiert → speichert in MEMORY.md

### Sprint 3-5: Pattern Wiederverwendet
"Neuer Service? Nutze die Template!"

---

## Echtes Beispiel: Der Code

### plantService.ts (Template)

```typescript
export async function fetchAll(filters?: Filters) {
  let query = supabase.from('plants').select('*');
  if (user?.id) query = query.eq('user_id', user.id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

### Der Pattern in der Praxis

![Service Layer Pattern](../../presentation-standort-2026-03/session-1-claude-obsidian/screenshots/02-memory-patterns/02-service-layer-pattern.png)

Kopieren, Umbenennen, Fertig! 10 Minuten statt 45.

---

# 📸 Die Vision-Feature: Intelligente Foto-Analyse

---

## Das Problem
```
User: "Welche Pflanze ist das?"
      (macht Foto)

Alt-Weg: Googlen, ChatGPT fragen, manuell pflegen
Zeit: 10+ Minuten
Cost (menschlich): Viel Nerven!

Smart-Weg: KI analysiert, migriert automat.
Zeit: 30 Sekunden
Cost (mit Claude): $0.02
```

---

## Wie die Photo-Analyse funktioniert

```
1. User macht Foto im Garten
                ↓
2. Claude Vision analysiert: "Das ist eine Tomate"
                ↓
3. Datenbank abfrage: Tomate in inventory?
                ↓
4a. JA → Foto an Tomate-Eintrag anhängen
4b. NEIN → Neue Pflanze erstellen + auto-fill
                ↓
5. Ergebnis in MEMORY.md speichern
   → Nächstes Mal schneller!
```

---

## Der Code: Vision + Auto-Migration

```typescript
async function analyzePhotoAndMigrate(photoUri: string) {
  // 1. Vision API: "Was ist das?"
  const analysis = await claudeVision(photoUri);
  const plantName = analysis.plant_name;

  // 2. Service Layer: "Gibt es das schon?"
  const existing = await plantService.fetchByName(plantName);

  // 3. Auto-Migrate (SMART!)
  if (!existing) {
    // Neue Pflanze mit KI-gefüllten Daten
    await plantService.create({
      name: plantName,
      watering: analysis.watering_needs,
      sunlight: analysis.sunlight,
      soil: analysis.soil_type,
      companion_plants: analysis.companions,
      // ... alle Details aus Vision!
    });
  }

  // 4. Foto speichern + verlinken
  await photoService.create({
    plant_id: existing?.id || newPlant.id,
    uri: photoUri,
  });

  // 5. In MEMORY speichern
  // "Tomate erkannt → schon 3x gesehen"
}
```

**Result:** Dein Garten-Inventar füllt sich von selbst! 🚀

---

## Warum das clever ist

### Der menschliche Weg ❌
```
"Ich sehe was ist das?"
  ↓
Googlen... (2 min)
  ↓
ChatGPT fragen... (3 min)
  ↓
Manuell in App eintragen... (5 min)
  ↓
Zeit: 10 min pro Pflanze
Budget: Deine kostbare Zeit!
```

### Der KI-Weg ✅
```
Foto machen → App analysiert → fertig
Zeit: 30 Sekunden
Cost: $0.02
Bonus: Alle Daten auto-filled!
```

**1 Stunde Garten-Arbeit?**
- Alt: 60 Photos × 10 min = 600 Minuten (!)
- Smart: 60 Photos × 0.5 min = 30 Minuten

---

## Phase 2: Die Roadmap

```
Phase 1 (DONE ✅):
  - App Grundstruktur
  - Manuelle Pflanzenverwaltung
  - Task Management

Phase 2 (GEPLANT 📋):
  - ✨ Photo-basierte Pflanzenerkennung
  - ✨ Auto-Migration in Datenbank
  - ✨ Pest-Erkennung (ist das ein Schädling?)
  - ✨ Automatische Task-Generierung
       ("Tomate erkannt → düngen in 3 Wochen")
```

---

## Das Learning: Foto-Analyse ist nicht teuer!

```
Dein Problem: "Vision API ist teuer, richtig?"

Falsch! ❌
Vision API kostet $0.002 pro Foto
(3000 Photos für $6)

Das ist billiger als deine Zeit!

Falsch genutzt: ❌
"Analysiere alle 83 Screenshots"
→ 15 Screenshots unnötig
→ $0.04 Verschwendung

Richtig genutzt: ✅
"Eine Pflanze? → $0.002"
"Schädling erkannt? → $0.002"
→ Massiv billiger als manuell!
```

---

## Token-Ersparnis: Die Mathematik

### Szenario A: Ohne MEMORY

```
Konversation 1: Service erklärt (5.000 Tokens)
Konversation 2: Service erklärt NOCHMAL (5.000 Tokens)
Konversation 3: Gleiche Konzepte (5.000 Tokens)
──────────────────────────────────
Total: 15.000 Tokens (50% redundant)
```

### Szenario B: Mit MEMORY

```
Konversation 1: Service erklärt + gespeichert (5.000 Tokens)
Konversation 2: MEMORY lädt Pattern (500 Tokens)
Konversation 3: MEMORY lädt Pattern (500 Tokens)
──────────────────────────────────
Total: 6.000 Tokens (60% billiger!)
```

---

## Kostenaufschlüsselung: Wo sind die $22,91 hin?

<small>

| Bereich | Budget | Actual | Grund |
|---------|--------|--------|-------|
| Patterns | $8,00 | $1,50 | In MEMORY gespeichert |
| Services (5×) | $10,00 | $1,00 | 70% Code-Reuse |
| Testing | $4,00 | $0,30 | Jest Templates |
| Bug-Fixes | $2,00 | $0,15 | Bekannte Gotchas |
| Deployment | $1,00 | $0,14 | Automatisierte Scripts |
| **TOTAL** | **$25,00** | **$2,09** | **92% Ersparnis** |

</small>

---

## Die Drei Sparhebel

### 1️⃣ MEMORY + Patterns
Patterns einmal dokumentiert, ewig wiederverwendet.
Ersparnis: ~$8

### 2️⃣ Code-Reuse (70%)
plantService kopieren → shoppingService
Ersparnis: ~$7

### 3️⃣ Anforderungs-Klarheit (BMAD!)
Spezifikation → Beim ersten Versuch richtig → keine Retries
Ersparnis: ~$5

### 4️⃣ Automatisierung
Scripts, Templates, Boilerplate
Ersparnis: ~$3

---

## Velocity über die Zeit

```
Sprint 1: 12 Pkte (Lernen)
Sprint 2: 13 Pkte (Patterns etabliert, MEMORY startet)
Sprint 3: 11 Pkte (MEMORY nutzen, 70% billiger)
Sprint 4: 10 Pkte (Gleich, schneller)
Sprint 5: 10,5 Pkte (Gleich, schneller)

Durchschnitt: 10,8 Pkte/Sprint
Kosten: $2-3/Punkt (mit MEMORY)
Ohne MEMORY: $5-8/Punkt
```

---

## Was steht in MEMORY.md?

```
✅ Bewährte Patterns (Copy-Paste)
   Service Layer, Auth, FlatList, Testing

✅ Bekannte Gotchas (Bereits gelöst)
   RLS-Bugs, Photo Upload, Web Issues

✅ Metriken (Keine Vermutungen)
   Velocity, Kosten/Punkt, Coverage

✅ Dateien-Positionen (Finde alles)
   Wo Code lebt, wo Docs sind
```

---

## Wie ein neuer Developer das nutzt

### Tag 1
```
Lese AI&ME.md + README.md (1 Stunde)
```

### Tag 2: Erste Feature
```
1. Prüfe MEMORY.md (30 Sekunden)
   "Service Layer Pattern? → plantService.ts"

2. Kopiere Pattern (2 Min)
   shoppingService.ts

3. Schreibe Tests (5 Min)
   Folge Jest Pattern

4. Fertig! (10 Minuten total)
```

vs. 45 Minuten ohne MEMORY

---

## Wichtigste Learnings

### ✅ Was funktioniert

- Service Layer Pattern (70% Reuse ✓)
- MEMORY für Kontext (Kosten sinken ✓)
- TypeScript Strict (Fehler werden abgefangen ✓)
- Plattform-Testing (3 Plattformen ✓)
- **Messungen** (keine Vermutungen ✓)
- **BMAD vor dem Coden** (keine Überraschungen ✓)

### ❌ Was nicht funktioniert

- Ohne Spezifikation coden
- Für imaginäre Zukünfte designen
- Tests überspringen
- Web-Code ohne Testing
- Bekannte Probleme ignorieren

---

# ⚠️ Die harte Realität: KI-Fallstricke

---

## Was KI NICHT gut kann

### ❌ Screenshots in Bulk analysieren
```
Ich: "Analysiere 83 Screenshots"
Claude: *Vision API kostet $0.60-0.80*
Länger: 15 Minuten, 83 API-Calls

Besser: "Sample 5 Screenshots, Pattern erkennen"
        *dann Bash-Automation statt Vision*
Kosten: $0.08 (87% billiger!)
```

**Learning:** Vision ist 10-20x teurer als Text!

---

## Der Screenshot-Fehler (Lessons Learned)

### Falsch ❌
```
"Schau dir 83 Screenshots an,
 kategorisiere sie, gib mir einen Report"

Cost: $0.60
Time: 15 min
Quality: OK, aber teuer
```

### Richtig ✅
```
"Schau dir 5 Screenshots an,
 erkenne das Pattern"

→ Dann: "bash-Skript schreiben, alle umbenennen"

Cost: $0.08
Time: 5 min
Quality: Besser, billiger, schneller
```

**Rule:** KI für Pattern-Erkennung. Dann Automation für Bulk-Ops!

---

## Andere KI-Fallstricke

### 1. Halluzinationen bei APIs
```
Claude: "Nutze feature X aus Supabase"
Ich: "Das gibt es nicht!"

Fix: Immer Docu vor Augen haben
```

### 2. Zu viel auf einmal
```
Task: "Mach alles auf einmal"
Claude: Macht nur 60%, vergisst die Hälfte

Fix: Sequential Development
     (eine Sache nach der anderen)
```

### 3. Over-Engineering
```
Task: "Mach eine CRUD API"
Claude: "Lass mich auch noch caching,
         retry-logic, feature-flags bauen!"

Fix: KISS - Keep It Simple, Stupid
     Nur das was gefragt ist!
```

### 4. Retries bei vague Requirements
```
Vage Task: "Mache die App besser"
Claude: Versucht zufällig Sachen
Result: 5 Retries, $1.50 wasted

Clear Task: "Implementiere FR-005 mit AC1, AC2, AC3"
Claude: First Try Success!
Result: $0.15, perfekt
```

---

## Die Große Lektion

```
Gutes Prompting + Klare Specs
           ↓
KI arbeitet sehr günstig (92% unter Budget)

Schlechtes Prompting + Vage Anforderungen
           ↓
KI wird sehr teuer (Retries, Halluzinationen, Bloat)
```

**Es ist nicht "KI ist teuer".**
**Es ist "Schlechte Anforderungen sind teuer."**

Claude macht nur, was man sagt. Wenn man unklar ist, wird es unklar!

---

## Was ich hätte besser machen können

### 1. RLS-Policies testen
```
Fehler: Vergessen auf production zu testen
Fix: `ENVIRONMENT_TESTING_CHECKLIST.md`
     iOS + Android + Web IMMER
```

### 2. Nicht parallel agenten verwenden
```
Problem: Parallel agents = Context verloren
         5 verschiedene Lösungsansätze
         Konflikt-Auflösung = $0.50+ wasted

Fix: Sequential Development nur!
     (ist trotzdem 70% schneller)
```

### 3. Vision-API sparsamer nutzen
```
Fehler: Alle 83 Screenshots mit Vision analysieren
Cost: $0.60
Time: 15 min

Better: 5 Screenshots samplen, Rest mit Bash
Cost: $0.08
Time: 5 min
```

---

## Bottom Line für euch

```
✅ Klare Anforderungen (BMAD!) = günstiger
✅ Patterns speichern (MEMORY) = günstiger
✅ Sequential Development = günstiger
✅ Richtige Toolwahl (Bash > Vision für Bulk) = günstiger
✅ Messen, nicht raten = günstiger

❌ Halluzinationen vertrauen = teuer
❌ Parallel Agents = teuer
❌ Vision-API missbrauchen = teuer
❌ Over-Engineering = teuer
❌ Vage Anforderungen = teuer
```

---

## Für eure eigenen Projekte

**Falls ihr mit KI baut:**

1. **BMAD nutzen** → Anforderungen klären VOR dem Coden
2. **Patterns speichern** → Was funktioniert
3. **Metriken tracken** → Echte Zahlen
4. **MEMORY auto-laden** → Für jede Konversation
5. **Alles messen** → Keine Vermutungen

**Erwartete Ersparnis:** 60-90% nach Sprint 2

---

# Die echte Erkenntnis

> **Das Geheimnis ist nicht, schneller zu bauen.**
>
> **Es ist, smart zu bauen, sich zu merken was funktioniert,**
> **und Fehler nicht zu wiederholen.**

---

## Die Formel

```
BMAD (klare Anforderungen)
   +
MEMORY + Patterns + Messungen
   ↓
Selbstlernende KI
   ↓
70% Kosten-Ersparnis
   ↓
Vorhersagbare, skalierbare Velocity
```

---

# Fragen?

**Weitere Infos:**
- 📖 `AI&ME.md` – Vollständige Erklärung
- 🧠 `MEMORY.md` – Alles was Claude weiß
- 📖 `README.md` – Projekt-Übersicht
- 🔧 `docs/patterns/` – Code-Templates
- 📋 `docs/bmad/` – BMAD Dokumentation

---

**Gebaut mit BMAD Method + Claude AI**

🌿 React Native | 🔥 Supabase | 🌱 Permakultur

*"Smarte Entwicklung skaliert. Schnelle Entwicklung bricht."*
