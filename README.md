# Gartenplaner App 🌱

Eine intelligente Mobile App für Familien, die ihren Garten nach Permakultur-Prinzipien bewirtschaften möchten.

## Features

### Phase 1 (MVP)
- **Pflanzen-Inventar:** Verwaltung von 50+ Pflanzen mit Status-Tracking
- **Dynamische Aufgaben:** Priorisierte Task-Liste mit saisonalen Vorschlägen
- **Foto-Dokumentation:** Pflanzen und Probleme dokumentieren
- **Einkaufsliste:** Budget-Tracking für Gartenbedarf
- **Success-Tracking:** Unkraut-Zeit < 1h/Monat, Ernte-Logging
- **Wissens-Datenbank:** Permakultur-Infos und Mischkultur

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

See `docs/architecture-gartenplaner-2026-03-02.md` for complete database schema.

**Tables:**
- `plants` - Pflanzen-Inventar
- `tasks` - Aufgaben
- `photos` - Foto-Dokumentation
- `shopping_items` - Einkaufsliste
- `harvests` - Ernte-Logging
- `knowledge_articles` - Wissens-Datenbank
- `plant_companions` - Mischkultur-Datenbank
- Plus junction tables

### Row Level Security (RLS)

All tables have RLS policies to ensure users can only access their own data.

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

See `docs/sprint-plan-gartenplaner-2026-03-02.md` for detailed sprint plan.

**Current Sprint:** Sprint 1 (Mar 3-17, 2026)
- ✅ STORY-000: Development Environment Setup
- ⏳ STORY-INF-001: Database Schema & RLS Setup
- ⏳ STORY-034: App Navigation & Layout

**Target MVP Completion:** Ende Juli 2026

## Contributing

This is a personal family project. Not currently accepting external contributions.

## License

Private - All rights reserved

---

**Built with BMAD Method v6** | Permakultur 🌿 | React Native ⚛️ | Supabase 🔥
