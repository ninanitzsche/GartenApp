# Gartenplaner App 🌱

**Last Updated:** 2026-03-05
**Status:** Active (Phase 1 Complete + Sprint 7 Garden Feature)
**Audience:** All
**Related Files:** [ONBOARDING.md](ONBOARDING.md), [QUICK-LINKS.md](QUICK-LINKS.md), [MVP-RELEASE-SUMMARY.md](MVP-RELEASE-SUMMARY.md)

---

Eine intelligente Mobile App für Familien, die ihren Garten nach Permakultur-Prinzipien bewirtschaften möchten.

---

## 📖 Dokumentation Finden

**Wer bist du?**
- **PO/Stakeholder:** → `BMAD-STATUS.md` (was ist fertig? ✅ alle 5 Sprints)
- **Product Owner:** → `PO-GUIDE.md` (epics, stories, sprints)
- **Neue Developer:** → `ONBOARDING.md` (1h to get started)
- **Schnelle Navigation:** → `QUICK-LINKS.md` (find anything fast)
- **Vollständige Struktur:** → `FILE-STRUCTURE.md` (complete overview)

### 🎯 BMAD Workflow (Für Entwicklung)
- **Product Brief** → `docs/bmad/bmad-01-product-brief.md` (Wofür bauen wir?)
- **Requirements** → `docs/bmad/bmad-02-prd.md` (Was bauen wir? - 25 FRs, 7 Epics)
- **Architecture** → `docs/bmad/bmad-03-architecture.md` (Wie bauen wir?)
- **Sprint Plan** → `docs/sprint/sprint-plan-gartenplaner-mvp-*.md` (Aktueller Sprint)
- **Navigation** → `docs/bmad-index.md` (Alle BMAD-Dateien erklärt)

### 🛠️ Development Reference
- 🏠 **Projekt Setup** → `README.md` (diese Datei)
- 🤖 **Claude Config** → `CLAUDE.md` (Cost Control, Auto-Loading)
- 🔧 **Code Patterns** → `memory/patterns.md` (70% Reuse!)
- 💰 **Budget & Kosten** → `memory/costs.md`
- 🐛 **Probleme & Lösungen** → `memory/troubleshooting.md`
- 📊 **Sprint Metriken** → `memory/sprints.md`
- 🛡️ **Database** → `docs/database/database-guide.md`
- 🧪 **Testing** → `docs/testing/TESTING-GUIDE.md` (automatisiert) + `docs/testing/TESTING-CHECKLIST.md` (manuell)
- 📁 **Navigation** → `docs/FILE-STRUCTURE.md` (Struktur-Übersicht)
- 🌱 **Garden Feature (Sprint 7)** → `docs/GARDEN-FEATURE-IMPLEMENTATION.md` (Complete guide)

---

## Features

### Phase 1 (MVP) ✅
- **Pflanzen-Inventar:** Verwaltung von 50+ Pflanzen mit Status-Tracking
- **Dynamische Aufgaben:** Priorisierte Task-Liste mit saisonalen Vorschlägen
- **Foto-Dokumentation:** Pflanzen und Probleme dokumentieren
- **Einkaufsliste:** Budget-Tracking für Gartenbedarf
- **Success-Tracking:** Unkraut-Zeit < 1h/Monat, Ernte-Logging
- **Wissens-Datenbank:** Permakultur-Infos und Mischkultur

### Sprint 7 (Garden Overview) ✅ NEW
- **Interaktive Beetplan:** Visuelle Darstellung mit positionierten Beeten
- **Beetverwaltung:** Erstellen, bearbeiten, löschen von Beeten
- **Form-basierte Positionierung:** Sliders für X/Y Position (0-100%), Größe
- **Beetdetails:** Farbe, Form (Rechteck/Kreis), Notizen
- **Pflanzenverlinkung:** Link von Pflanzen zu Beeten
- **Garten-Info:** Name, Standort, Größe, Beschreibung
- **Foto-Galerie:** Garten-Fotos verwalten

**Dokumentation:** Siehe `docs/GARDEN-FEATURE-IMPLEMENTATION.md` für vollständige Details

### Phase 2 (KI Features)
- **KI-Pflanzen-Identifikation:** Automatische Pflanzen-Erkennung per Foto
- **Schädlings-Erkennung:** Probleme frühzeitig erkennen
- **Foto-gesteuerte Aufgaben:** Automatische Task-Generierung

## Tech Stack

- **Frontend:** React Native + Expo (TypeScript)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **KI:** Claude Vision API (Phase 2)
- **Deployment:** Expo EAS

## Setup

### Prerequisites

- Node.js 18+
- npm oder yarn
- Expo CLI (wird automatisch installiert)
- Supabase Account

### Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd gartenplaner-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Kopiere `.env.example` zu `.env`:
   ```bash
   cp .env.example .env
   ```

   Füge deine Supabase Credentials ein:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

   Dann:
   - Drücke `a` für Android Emulator
   - Drücke `i` für iOS Simulator
   - Scanne QR-Code mit Expo Go App auf deinem Phone

## Project Structure

```
gartenplaner-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API services (Supabase)
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── App.tsx               # App entry point
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Development

### Running Tests
```bash
npm test
```

### Building for Production

**Android:**
```bash
eas build --platform android
```

**iOS:**
```bash
eas build --platform ios
```

## Database Setup

### Supabase Schema

See `docs/bmad-03-architecture.md` for complete database schema.

**Tables:**
- `plants` - Pflanzen-Inventar
- `tasks` - Aufgaben
- `photos` - Foto-Dokumentation
- `shopping_items` - Einkaufsliste
- `harvests` - Ernte-Logging
- `knowledge_articles` - Wissens-Datenbank
- `plant_companions` - Mischkultur-Datenbank
- `gardens` - Garten-Metadaten (Sprint 7)
- `beds` - Interaktive Beete (Sprint 7)
- `bed_plants` - Beet-Pflanze Beziehungen (Sprint 7)
- Plus junction tables

### Row Level Security (RLS)

All tables have RLS policies to ensure users can only access their own data.

### Database Migrations

**Sprint 7 - Garden Feature:**

Run the SQL migration in Supabase SQL Editor:
```bash
# Location: docs/migrations/add-garden-tables.sql
# Creates: gardens, beds, bed_plants tables with RLS policies
```

See `docs/migrations/add-garden-tables.sql` for the complete migration script.

## Seed Data - Garten2026

Die App wird automatisch mit Garten-Daten aus Garten2026/Pflanzen_Inventar_und_Pflege.md vorausgefüllt.

### Verfügbare Seed-Daten

**Etablierte Pflanzen (7):**
- Weinreben, Schnittlauch, Erdbeeren, Federnelke, Sonnenhut, Günsel, Vogelmiere

**Geplante/Bestellte Pflanzen (50+):**
- Kartoffeln: 5 Sorten (Innovator, Laura, Agria, Spunta, Cara)
- Tomaten: 4 Sorten (Zuckertraube, Matina, Marmande, Tom Red)
- Drei-Schwestern: Mais, Bohnen, Hokkaido Kürbis
- Gemüse: Gurke, Kohlrabi, Zwiebeln, Porree, Salate
- Kräuter: Basilikum, Thymian, Bärlauch, Petersilie
- Bodendecker: Neuseeländer Spinat, Rotklee, Weißklee, Phacelia
- Blumen: Blaukissen, Lavendel, Katzenminze, Wildblumenmischung, Rittersporn, Ringelblume, Sonnenblume

### Manueller Import (Script)

```bash
ts-node scripts/seed-garden.ts
```

Synchronisiert alle Pflanzen mit Supabase (idempotent via upsert).

## Roadmap

See `docs/sprint-plan-gartenplaner-mvp-2026-03-02.md` for detailed sprint plan.

**Status:**
- ✅ **Sprint 1-5:** All Phase 1 features complete (56.5 points)
- ✅ **Sprint 7:** Garden Overview Feature complete (Interactive bed map, metadata, photo gallery)
  - 18 files created (services, screens, components, navigation)
  - Full TypeScript support
  - Database migration ready
  - See `docs/GARDEN-FEATURE-IMPLEMENTATION.md` for details
- ⏳ **Sprint 6/8:** Phase 2 planning (AI features)
- See `MVP-RELEASE-SUMMARY.md` for Phase 1 details

**Target MVP Completion:** Ende Juli 2026

## Contributing

This is a personal family project. Not currently accepting external contributions.

## License

Private - All rights reserved

---

**Built with BMAD Method v6** | Permakultur 🌿 | React Native ⚛️ | Supabase 🔥
