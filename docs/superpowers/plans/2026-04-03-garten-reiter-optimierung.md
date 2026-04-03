# "Mein Garten" Reiter Optimierung - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redundante "20% × 15%" Angabe aus BedCard entfernen und GardenStatsCard mit nützlicher Metrik erweitern.

**Architecture:** 
- BedCard: Details-Zeile mit Prozentangaben entfernen, nur Pflanzenanzahl anzeigen
- GardenStatsCard: Neue Metrik "Anstehende Aufgaben" als dritten Stat hinzufügen

**Tech Stack:** React Native, Expo, TypeScript

---

## Task 1: BedCard - Prozentangaben entfernen

**Files:**
- Modify: `src/components/BedCard.tsx:47-61`

- [ ] **Step 1: Remove the width × height detail row**

Alte Zeilen 47-52 entfernen:
```tsx
<View style={styles.details}>
  <View style={styles.detailRow}>
    <Text style={styles.detailText}>
      {bed.width.toFixed(0)}% × {bed.height.toFixed(0)}%
    </Text>
  </View>
  {plantCount > 0 && (
```

Ersetzen durch:
```tsx
<View style={styles.details}>
  {plantCount > 0 && (
```

- [ ] **Step 2: Verify component renders correctly**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/BedCard.tsx
git commit -m "refactor: remove redundant dimensions from BedCard"
```

---

## Task 2: GardenStatsCard - Aufgaben-Metrik hinzufügen

**Files:**
- Modify: `src/components/GardenStatsCard.tsx:15-50`
- Modify: `src/screens/GardenOverviewScreen.tsx` (props übergeben)

- [ ] **Step 1: Extend GardenStatsCardProps interface**

```tsx
interface GardenStatsCardProps {
  bedCount: number;
  plantCount: number;
  taskCount?: number;  // Neu: anstehende Aufgaben
}
```

- [ ] **Step 2: Add taskCount to component**

```tsx
export default function GardenStatsCard({
  bedCount,
  plantCount,
  taskCount = 0,
}: GardenStatsCardProps) {
```

- [ ] **Step 3: Add third stat item for tasks**

Nach dem Pflanzen-Stat (Zeile 49) hinzufügen:
```tsx
</GlassCard>
        </View>
        <View style={styles.statItem}>
          <GlassCard variant="tint" animated={false}>
            <View style={styles.statContent}>
              <CheckSquare size={20} color={Colors2026.primary} />
              <Text style={styles.statValue}>{taskCount}</Text>
              <Text style={styles.statLabel}>Aufgaben</Text>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
```

- [ ] **Step 4: Add CheckSquare import**

```tsx
import { LayoutGrid, Sprout, CheckSquare } from 'lucide-react-native';
```

- [ ] **Step 5: Pass taskCount from GardenOverviewScreen**

In `GardenOverviewScreen.tsx`:
- `fetchTasks` oder existierenden Task-Service nutzen
- Offene Tasks zählen und an GardenStatsCard übergeben

```tsx
// In loadData() function
const { data: openTasks } = await supabase
  .from('tasks')
  .select('id')
  .eq('completed', false);

<GardenStatsCard 
  bedCount={beds.length} 
  plantCount={totalPlants}
  taskCount={openTasks?.length || 0}
/>
```

- [ ] **Step 6: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/components/GardenStatsCard.tsx src/screens/GardenOverviewScreen.tsx
git commit -m "feat: add task count to GardenStatsCard"
```

---

## Verification

- [ ] App starten und "Mein Garten" Tab öffnen
- [ ] Beet-Cards prüfen: keine Prozentangaben mehr sichtbar
- [ ] GardenStatsCard prüfen: 3 Stats (Beete, Pflanzen, Aufgaben)
- [ ] Aufgaben-Count plausibel (offene Tasks aus DB)
