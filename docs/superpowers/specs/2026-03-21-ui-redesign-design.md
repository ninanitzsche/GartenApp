# 🎨 Gartenplaner UI Redesign 2026

**Datum:** 2026-03-21
**Status:** Approved & Ready for Implementation
**Branch:** feature/ui-redesign-2026

---

## 1. Design-Philosophie

**Mixed 2026 Style:**
- Glassmorphism für transparente, elegante Karten
- Bold Cards mit starker Farbgebung
- Saisonale Farb-Adaptionen (Frühling/Sommer/Herbst/Winter)
- Micro-Animations für jeden Interaktion
- Page-Transitions mit Spring-Animationen

---

## 2. Tech Stack

| Package | Purpose |
|---------|---------|
| `@phosphor-icons/react-native` | Icon-Set |
| `react-native-reanimated` | Animation Engine (bereits installiert) |
| `expo-blur` | Glassmorphism Blur-Effects |

---

## 3. Design System V2

### Colors (Erweitert)
```typescript
colors: {
  primary: '#2D9D4F',
  primaryLight: '#4CAF50',
  primaryDark: '#1B7A37',
  
  glass: {
    light: 'rgba(255,255,255,0.72)',
    medium: 'rgba(255,255,255,0.85)',
    dark: 'rgba(0,0,0,0.15)',
    tint: 'rgba(45,157,79,0.08)',
  },
  
  seasonal: {
    spring: { bg: '#F0FAF0', accent: '#2D9D4F' },
    summer: { bg: '#FFF8E7', accent: '#E8943A' },
    autumn: { bg: '#FFF0E7', accent: '#D4633A' },
    winter: { bg: '#F0F4FA', accent: '#5B8DEF' },
  },
  
  gradients: {
    spring: ['#E8F5E9', '#C8E6C9'],
    summer: ['#FFF8E1', '#FFECB3'],
    autumn: ['#FBE9E7', '#FFCCBC'],
    winter: ['#E3F2FD', '#BBDEFB'],
  },
}
```

### Glassmorphism Presets
```typescript
glass: {
  light: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(20px)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  medium: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(40px)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dark: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    backdropFilter: 'blur(30px)',
  },
}
```

### Typography
```typescript
typography: {
  display: { fontFamily: 'Inter-Bold', fontSize: 34, letterSpacing: -1.5 },
  headline: { fontFamily: 'Inter-Semibold', fontSize: 24, letterSpacing: -0.8 },
  title: { fontFamily: 'Inter-Semibold', fontSize: 18, letterSpacing: -0.3 },
  body: { fontFamily: 'Inter-Medium', fontSize: 16, letterSpacing: 0 },
  caption: { fontFamily: 'Inter', fontSize: 13, letterSpacing: 0.2 },
  small: { fontFamily: 'Inter', fontSize: 11, letterSpacing: 0.3 },
}
```

### Spacing & Radius
```typescript
spacing: { xs: 4, sm: 8, md: 16, lg: 20, xl: 24, xxl: 32 }
radius: { sm: 12, md: 16, lg: 20, xl: 28, round: 999 }
```

---

## 4. Komponenten-Architektur

```
src/components/ui/
├── GlassCard.tsx           # Transparente Karten mit Blur
├── AnimatedButton.tsx      # Spring-Animation Buttons
├── GlassInput.tsx          # Glassmorphism Eingabefelder
├── StatusBadge.tsx         # Pflanzen-Status mit Farbverlauf
├── SectionHeader.tsx       # Animierter Sektions-Header
├── FloatingAction.tsx      # FAB mit Spring-Animation
├── EmptyState.tsx          # Schöne Empty States
├── SkeletonLoader.tsx      # Pulse-Loading States
├── AnimatedList.tsx        # Stagger-Animation Lists
├── SeasonalCard.tsx        # Saisonale Farben adaptiv
└── index.ts                # Barrel Export
```

---

## 5. Animation System

### Micro-Animations
- Fade-In: 300ms ease-out
- Slide-Up: 400ms spring
- Scale-In: 300ms spring
- Stagger: 50ms delay between items

### Card-Animations
- Card Press: scale(0.97) 150ms
- Card Enter: opacity + scale mit stagger
- Card Exit: opacity(0) + scale(0.95)

### Page-Transitions
- Stack: Fade + Slide (x: 100 → 0)
- Modal: Slide-Up (y: 100% → 0)
- Tab: Spring (damping: 20)

### Interactive
- Button: Spring-Bounce
- Pull-to-Refresh: Bounce (stiffness: 200)
- Scroll-to-Top: Smooth (500ms)

---

## 6. Screen Update Priority

### Phase 1: Core Screens
1. HomeScreen (Dashboard)
2. PlantListScreen
3. PlantDetailScreen
4. TaskListScreen

### Phase 2: Feature Screens
5. SaisonPlanerScreen
6. ShoppingListScreen
7. GardenOverviewScreen
8. GardenPhotoGalleryScreen

### Phase 3: Form & Detail Screens
9. AddPlantScreen, EditPlantScreen
10. AddTaskScreen, TaskDetailScreen
11. AddShoppingItemScreen, EditShoppingItemScreen
12. AddBedScreen, EditBedScreen, BedDetailScreen

### Phase 4: Auth & Settings
13. LoginScreen, RegisterScreen
14. ProfileScreen, ChangePasswordScreen
15. ForgotPasswordScreen
16. OnboardingScreen

### Phase 5: Remaining
17-36: All other screens

---

## 7. Testing Strategy

- **TDD:** Tests schreiben VOR Implementierung
- **Unit Tests:** Jede UI-Komponente isoliert testen
- **Integration Tests:** Screen-Rendering mit mocked Services
- **Visual Tests:** Snapshot Tests für UI-Konsistenz

---

## 8. Success Criteria

- Alle 36 Screens haben den neuen Look
- Glassmorphism + Bold Cards kombiniert
- Smooth 60fps Animationen
- Phosphor Icons überall
- 426+ Tests bestehen weiterhin
- Keine visuellen Regressionen
