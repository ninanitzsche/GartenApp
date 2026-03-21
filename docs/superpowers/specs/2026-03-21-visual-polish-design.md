# Visual Polish: POC zu Premium App

## Context

Die Gartenplaner-App hat aktuell zwei existierende Design-Systeme nebeneinander:
- **Altes System** (`src/theme/colors.ts`): Flache Farben, einfache Cards, MaterialIcons
- **Neues System** (`src/theme/designSystemV2.ts`): Glassmorphism, BlurView, lucide-react-native, Reanimated-3

Ungefähr die Hälfte der Screens nutzt das alte System und sieht dadurch nach POC aus. Das Ziel ist eine konsistente, hochwertige visuelle Erscheinung die sich wie eine Premium-App anfühlt.

## Design Decisions

- **Stil**: Glassmorphism vertiefen (Transparenz, Blur, Gradienten)
- **Vorgehensweise**: Phasiert (4 Phasen)
- **Illustrationen**: Custom SVGs für Splash, Onboarding, Empty States
- **Icon-Set**: Lucide React Native (einheitlich, modern)

---

## Phase 1: Design System Consolidation

### Ziel
100% konsistenter Look durch Migration aller alten Screens auf `designSystemV2`.

### Phase 1 ist fertig wenn:
- Keine Datei mehr `import Colors from '../theme/colors'` nutzt (außer `colors.ts` selbst)
- Alle Cards haben Glassmorphism oder 2026-Shadows
- Alle Icons sind Lucide (keine `MaterialIcons` mehr in gemigrierten Dateien)
- TypeScript kompiliert ohne neue Errors

### Zu migrierende Dateien

| Datei | Aktuell | Ziel |
|-------|---------|------|
| `src/screens/MoreMenuScreen.tsx` | `Colors` + `TouchableOpacity` + `MaterialIcons` | Glassmorphism Header, GlassCard Sektionen, Lucide Icons |
| `src/screens/GardenOverviewScreen.tsx` | `Colors` + flache Cards | Glass-Header, GlassCard Beetliste, GlassCard Stats |
| `src/screens/OnboardingScreen.tsx` | `Colors` + `TouchableOpacity` | GlassCard, AnimatedButton, Illustration |
| `src/components/TaskCard.tsx` | `Colors` + flache Card | GlassCard-Wrapper, animated Checkbox |
| `src/components/BedCard.tsx` | `Colors` + flache Card | GlassCard, animated Color-Dot |
| `src/components/GardenStatsCard.tsx` | `Colors` + MetricCard | GlassCard Metrics |
| `src/screens/TaskTimelineScreen.tsx` | Hardcoded `#FAFAFA` / `#4CAF50` | DesignSystemV2 |
| `src/components/EmptyState.tsx` (root) | Alter EmptyState mit MaterialIcons | Neuer EmptyState mit Lucide |

### Migration Pattern

Jede migrierte Datei erhält:
1. `import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2'`
2. `TouchableOpacity` → `Animated.createAnimatedComponent(Pressable)` mit Scale-Feedback
3. `MaterialIcons` → Lucide-Äquivalente
4. Cards → GlassCard wo Blur sinnvoll ist, sonst Surface-Card mit 2026-Shadows
5. Spacing/Radius-Werte aus dem Design-System

### Design-System-Erweiterungen

In `src/theme/designSystemV2.ts`:
- Neue Shadows: `glow` (für aktive Elemente), `card` (leichteres Glass-Shadow)
- Saisonale Gradient-Arrays erweitern für `linear-gradient` Kompatibilität
- Exportiere `getSeasonalGradient(zeitraum: string)` Helper — `zeitraum` ist ein String wie `"fruehjahr"`, `"sommer"`, `"herbst"`, `"winter"` (aus `Zeitraum` enum)

---

## Phase 2: Visual Personality

### Ziel
Die App fühlt sich an wie ein Garten — nicht wie ein Formular.

### Phase 2 ist fertig wenn:
- Splash-Screen hat saisonalen Gradient statt weißem Background
- Onboarding hat SVG-Illustration und staggered Entry-Animation
- Mindestens 2 Empty States haben Custom-Illustrationen
- HomeScreen Header zeigt saisonalen Gradient

### Splash Screen
- Saisonaler Hintergrund-Gradient basierend auf aktueller Jahreszeit
- Zentrales Logo (Leaf-Icon) mit subtiler Glow-Animation
- `app.json` splash.backgroundColor → saisonaler Wert

### Onboarding Screen
- Hero-Illustration (SVG): Vereinfachter Garten mit Sonne und Pflanzen
- Staggered Entry der UI-Elemente (FadeInUp mit 100ms Delay)
- Progress-Dots unten für Schritt-Indikation

### Empty States (Custom SVGs)
Falls noch nicht vorhanden, erstelle komponenten-basierte SVG-Illustrationen:
- **Keine Pflanzen**: Sprossende Pflanze mit Wassertropfen
- **Keine Aufgaben**: Gartenbank unter Baum (Entspannung)
- **Keine Ernten**: Korb mit Platzhalter-Frucht
- **Keine Fotos**: Kamera umgeben von Blumen

Implementierung als inline-SVGs in `src/components/illustrations/`:
- `EmptyPlantsIllustration.tsx`
- `EmptyTasksIllustration.tsx`
- `EmptyHarvestIllustration.tsx`
- `EmptyPhotosIllustration.tsx`

### Saisonale Backgrounds
- HomeScreen Glass-Header bekommt saisonalen Gradient-Hintergrund
- Login/Registrierung: Saisonaler Background-Gradient
- Helper-Funktion `getSeasonalHeaderStyle(zeitraum)` im Theme

---

## Phase 3: Animationen & Micro-Interactions

### Ziel
Jede Interaktion fühlt sich lebendig an.

### Phase 3 ist fertig wenn:
- Listen-Items erscheinen mit staggered FadeIn
- Task-Erledigung hat visuelle Feedback-Animation
- Tab-Wechsel hat Fade/Slide-Transition

### Staggered List Entry
- Pflanzen-Liste: FadeInUp mit 50ms Stagger pro Item
- Task-Liste: Gleiche Pattern
- Beet-Liste: Gleiche Pattern
- Implementierung via `stagger(index, 50)` aus `animations.ts`

### Pull-to-Refresh
- Aktiver Spinner zeigt saisonales Icon
- Farb-Wechsel zum saisonalen Accent
- Bounce-Animation beim Loslassen

### Scroll-Parallax
- Detail-Screens (PlantDetail, BedDetail): Header schrumpft beim Scrollen
- Implementierung via `Animated.ScrollView` + `Animated.interpolate`

### Task-Erledigung
- Check-Animation: Scale-Bounce + Farbwechsel
- Kurzer Glow-Effekt auf dem Check-Icon
- Optionale Haptic-Feedback Integration

### Tab-Wechsel
- Fade + Slide Transition zwischen Tab-Inhalten
- Tab-Bar Indicator: Animated Sliding Underline

### Card-Press-Effects
- Alle klickbaren Cards: Scale-Down auf 0.97 + Shadow-Change
- Bereits implementiert in GlassCard und AnimatedButton — wird auf alle Cards ausgeweitet

---

## Phase 4: Navigation Polish

### Ziel
Tab-Bar sieht nicht mehr nach Standard aus.

### Phase 4 ist fertig wenn:
- Tab-Bar nutzt Glassmorphism (BlurView)
- Aktiver Tab hat animierten Indicator
- Screen-Transitions sind smooth (kein harter Cut)

### Glassmorphism Tab-Bar
- BlurView als Tab-Bar Hintergrund
- Semi-transparent mit saisonalem Tint
- Border-Top: Subtiler Glas-Rand

### Aktiver Tab Indicator
- Sliding Underline oder Glow unter dem aktiven Tab
- Animation bei Tab-Wechsel (300ms Spring)
- Saisonale Farbe für den Indicator

### Screen-Transitions
- `react-native-screens` Shared-Element Transitions wo möglich
- Fade-Transition als Fallback
- Hero-Animation: Pflanzen-Icon zoomt von List-Card zu Detail-Header

---

## File Structure Changes

```
src/
  theme/
    designSystemV2.ts          # Erweitert mit neuen Shadows/Gradients
    colors.ts                  # DEPRECATED — nur für Migration Reference
  components/
    illustrations/             # NEU
      EmptyPlantsIllustration.tsx
      EmptyTasksIllustration.tsx
      EmptyHarvestIllustration.tsx
      EmptyPhotosIllustration.tsx
    ui/
      GlassTabBar.tsx          # NEU — Custom Tab-Bar
  navigation/
    TabNavigator.tsx           # UMGESTALTET — nutzt GlassTabBar
```

---

## Non-Functional Requirements

- **Performance**: BlurView nur wo sichtbar (nicht auf jedem Card in langen Listen)
- **Accessibility**: Alle Animationen respektieren `prefers-reduced-motion`
- **Dark Mode**: Alle neuen Farben/Shadows haben Dark-Mode-Äquivalent
- **Bundle Size**: SVG-Illustrationen inline (~2-5KB pro Illustration), kein Asset-Download

---

## Out of Scope

- Lottie-Animationen (zu schwer, können Phase 5 sein)
- Native Shared-Element-Transitions (iOS-spezifisch, `react-native-shared-element` — zu komplex für jetzt)
- Custom Fonts (vorhandene System-Fonts sind gut genug)
- Tablet-optimiertes Layout (Phase später)
