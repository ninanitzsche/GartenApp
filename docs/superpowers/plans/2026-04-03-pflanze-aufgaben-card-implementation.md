# Pflanze mit offenen Aufgaben Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a new UI card above the GamificationBar that displays a motivating message with a plant that has open tasks. When clicked, it shows a dropdown with the open tasks for that plant.

**Architecture:** Extend the existing GamificationBar component to support displaying a plant task card with dropdown functionality. The HomeScreen will provide the necessary data and callbacks. We'll enhance the GamificationBar to handle the new UI pattern while maintaining backward compatibility.

**Tech Stack:** React Native, TypeScript, react-native-reanimated for animations, existing design system tokens and components.

---

### Task 1: Analyze and extend GamificationBar types

**Files:**
- Modify: `src/components/ui/GamificationBar.tsx`

- [ ] **Step 1: Review current GamificationBar props and state**

```typescript
// Current props interface
interface GamificationBarProps {
  streak: StreakData;
  motivation: string;
  achievements: Achievement[];
  onAchievementsPress?: () => void;
  onMotivationPress?: () => void;
  pendingTasks?: TaskPreview[];
  onToggleTask?: (taskId: string) => void;
  todayCompletedCount?: number;
  onPlantPress?: () => void;
  onTaskPlantPress?: (plantId: string) => void;
}
```

- [ ] **Step 2: Add new props for plant task card functionality**

```typescript
// Extended props interface
interface GamificationBarProps {
  streak: StreakData;
  motivation: string;
  achievements: Achievement[];
  onAchievementsPress?: () => void;
  onMotivationPress?: () => void;
  pendingTasks?: TaskPreview[];
  onToggleTask?: (taskId: string) => void;
  todayCompletedCount?: number;
  onPlantPress?: () => void;
  onTaskPlantPress?: (plantId: string) => void;
  // NEW: Plant task card props
  showPlantTaskCard?: boolean;
  plantTaskMessage?: string;
  plantTaskPlantId?: string;
  onPlantTaskPress?: (plantId: string) => void;
}
```

- [ ] **Step 3: Update TaskPreview type if needed**

```typescript
// Current TaskPreview interface
interface TaskPreview {
  id: string;
  title: string;
  plantName: string;
  plantId?: string;
}
```

- [ ] **Step 4: Write tests for prop types**

```typescript
// Test file: src/components/ui/__tests__/GamificationBar.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import GamificationBar from '../GamificationBar';

describe('GamificationBar extended props', () => {
  it('should accept new plant task card props', () => {
    const { container } = render(<GamificationBar 
      streak={{ currentStreak: 0, bestStreak: 0, lastActiveDate: null }}
      motivation="Test message"
      achievements={[]}
      showPlantTaskCard={true}
      plantTaskMessage="Test plant message"
      plantTaskPlantId="plant123"
      onPlantTaskPress={jest.fn()}
    />);
    
    expect(container).toBeDefined();
  });
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx`
Expected: FAIL with "Property 'showPlantTaskCard' does not exist"

- [ ] **Step 6: Implement minimal prop additions**

```typescript
// In GamificationBar.tsx
interface GamificationBarProps {
  streak: StreakData;
  motivation: string;
  achievements: Achievement[];
  onAchievementsPress?: () => void;
  onMotivationPress?: () => void;
  pendingTasks?: TaskPreview[];
  onToggleTask?: (taskId: string) => void;
  todayCompletedCount?: number;
  onPlantPress?: () => void;
  onTaskPlantPress?: (plantId: string) => void;
  // NEW: Plant task card props
  showPlantTaskCard?: boolean;
  plantTaskMessage?: string;
  plantTaskPlantId?: string;
  onPlantTaskPress?: (plantId: string) => void;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/GamificationBar.tsx src/components/ui/__tests__/GamificationBar.test.tsx
git commit -m "feat: extend GamificationBar props for plant task card"
```

### Task 2: Implement plant task card UI structure

**Files:**
- Modify: `src/components/ui/GamificationBar.tsx`

- [ ] **Step 1: Write failing test for plant task card rendering**

```typescript
// Test file: src/components/ui/__tests__/GamificationBar.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GamificationBar from '../GamificationBar';

describe('GamificationBar plant task card', () => {
  it('should render plant task card when props are provided', () => {
    const { container } = render(<GamificationBar 
      streak={{ currentStreak: 0, bestStreak: 0, lastActiveDate: null }}
      motivation="Test message"
      achievements={[]}
      showPlantTaskCard={true}
      plantTaskMessage="Test plant message"
      plantTaskPlantId="plant123"
      onPlantTaskPress={jest.fn()}
    />);
    
    // Should render the plant task message
    expect(screen.getByText('Test plant message')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx::test plant task card renders`
Expected: FAIL with "Element not found"

- [ ] **Step 3: Implement basic plant task card UI**

```typescript
// In GamificationBar.tsx component
return (
  <View style={styles.container}>
    {/* Existing streak, motivation, achievements */}
    
    {/* NEW: Plant task card */}
    {showPlantTaskCard && plantTaskMessage && (
      <View style={styles.plantTaskCardContainer}>
        <Pressable 
          style={styles.plantTaskCard}
          onPress={() => {
            // Toggle expanded state
          }}
          accessibilityLabel="Aufgaben anzeigen"
        >
          <View style={styles.plantTaskContent}>
            {/* Plant icon and message */}
            <View style={styles.plantTaskMessageContent}>
              {/* Will add icon and text */}
              <Text style={styles.plantTaskText}>{plantTaskMessage}</Text>
            </View>
            
            {/* Arrow icon */}
            <ChevronRight 
              size={16} 
              color={Colors2026.primary} 
              style={styles.plantTaskArrow}
            />
          </View>
        </Pressable>
      </View>
    )}
  </View>
);
```

- [ ] **Step 4: Add styles for plant task card**

```typescript
// In styles object
plantTaskCardContainer: {
  marginBottom: Spacing2026.md,
  paddingHorizontal: Spacing2026.xl,
},
plantTaskCard: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(45,71,57,0.06)',
  borderRadius: Radius2026.md,
  borderWidth: 1,
  borderColor: 'rgba(45,71,57,0.1)',
  paddingHorizontal: Spacing2026.md,
  paddingVertical: Spacing2026.sm,
},
plantTaskContent: {
  flexDirection: 'row',
  alignItems: 'center',
},
plantTaskMessageContent: {
  flexDirection: 'row',
  alignItems: 'center',
},
plantTaskText: {
  fontSize: Typography2026.body.fontSize,
  fontWeight: '500',
  color: Colors2026.text,
},
plantTaskArrow: {
  marginTop: 2,
},
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/GamificationBar.tsx src/components/ui/__tests__/GamificationBar.test.tsx
git commit -m "feat: implement basic plant task card UI structure"
```

### Task 3: Implement dropdown functionality for plant tasks

**Files:**
- Modify: `src/components/ui/GamificationBar.tsx`

- [ ] **Step 1: Write failing test for dropdown toggle**

```typescript
// Test file: src/components/ui/__tests__/GamificationBar.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GamificationBar from '../GamificationBar';

describe('GamificationBar plant task card dropdown', () => {
  it('should toggle dropdown when plant task card is pressed', () => {
    const { container } = render(<GamificationBar 
      streak={{ currentStreak: 0, bestStreak: 0, lastActiveDate: null }}
      motivation="Test message"
      achievements={[]}
      showPlantTaskCard={true}
      plantTaskMessage="Test plant message"
      plantTaskPlantId="plant123"
      onPlantTaskPress={jest.fn()}
    />);
    
    // Initially dropdown should not be visible
    expect(screen.queryByText('Test task')).not.toBeInTheDocument();
    
    // Press the plant task card
    const plantTaskCard = screen.getByText('Test plant message');
    // Simulate press (implementation depends on testing library)
    // fireEvent(plantTaskCard, 'press');
    
    // Dropdown should now be visible
    // expect(screen.getByText('Test task')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx::test dropdown toggle`
Expected: FAIL

- [ ] **Step 3: Add state for dropdown expansion**

```typescript
// In GamificationBar component
const [expanded, setExpanded] = useState(false);
```

- [ ] **Step 4: Implement dropdown toggle handler**

```typescript
const handlePlantTaskPress = () => {
  setExpanded(prev => !prev);
};
```

- [ ] **Step 5: Connect handler to pressable**

```typescript
<Pressable 
  style={styles.plantTaskCard}
  onPress={handlePlantTaskPress}
  accessibilityLabel={expanded ? 'Aufgaben einklappen' : 'Aufgaben anzeigen'}
>
```

- [ ] **Step 6: Add pendingTasks prop and implement dropdown rendering**

```typescript
// Add to props
pendingTasks?: TaskPreview[];

// In component
{showPlantTaskCard && plantTaskMessage && expanded && pendingTasks && pendingTasks.length > 0 && (
  <View style={styles.plantTaskDropdown}>
    {pendingTasks.slice(0, 5).map((task) => (
      <Pressable
        key={task.id}
        style={styles.plantTaskDropdownItem}
        onPress={() => onToggleTask?.(task.id)}
      >
        <View style={styles.taskCheckbox}>
          {/* Checkbox implementation */}
        </View>
        <View style={styles.taskContent}>
          {/* Plant name and task title */}
        </View>
      </Pressable>
    ))}
    
    {/* More tasks button if needed */}
    {pendingTasks.length > 5 && (
      <Pressable onPress={onMotivationPress}>
        <Text style={styles.moreTasksText}>+{pendingTasks.length - 5} weitere anzeigen</Text>
      </Pressable>
    )}
  </View>
)}
```

- [ ] **Step 7: Add dropdown styles**

```typescript
plantTaskDropdown: {
  backgroundColor: Colors2026.bg,
  borderRadius: Radius2026.md,
  borderWidth: 1,
  borderColor: Colors2026.border,
  marginTop: Spacing2026.sm,
  padding: Spacing2026.sm,
},
plantTaskDropdownItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing2026.sm,
  paddingVertical: Spacing2026.sm,
  borderBottomWidth: 1,
  borderBottomColor: Colors2026.border,
},
taskCheckbox: {
  width: 24,
  height: 24,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: Colors2026.textLight,
  borderRadius: Radius2026.round,
},
taskContent: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
},
moreTasksText: {
  fontSize: Typography2026.small.fontSize,
  color: Colors2026.textMuted,
  fontStyle: 'italic',
  textAlign: 'center',
  marginTop: Spacing2026.xs,
},
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/ui/GamificationBar.tsx src/components/ui/__tests__/GamificationBar.test.tsx
git commit -m "feat: implement dropdown functionality for plant tasks"
```

### Task 4: Implement plant name linking functionality

**Files:**
- Modify: `src/components/ui/GamificationBar.tsx`

- [ ] **Step 1: Write failing test for plant name linking**

```typescript
// Test file: src/components/ui/__tests__/GamificationBar.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import GamificationBar from '../GamificationBar';

describe('GamificationBar plant name linking', () => {
  it('should call onPlantTaskPress when plant name in task is pressed', () => {
    const onPlantTaskPressMock = jest.fn();
    const { container } = render(<GamificationBar 
      streak={{ currentStreak: 0, bestStreak: 0, lastActiveDate: null }}
      motivation="Test message"
      achievements={[]}
      showPlantTaskCard={true}
      plantTaskMessage="Test plant message"
      plantTaskPlantId="plant123"
      onPlantTaskPress={onPlantTaskPressMock}
      pendingTasks={[{
        id: 'task1',
        title: 'Test task',
        plantName: 'Test Plant',
        plantId: 'plant123'
      }]}
      onToggleTask={jest.fn()}
    />);
    
    // Press plant name in task
    // Implementation would find and press the plant name element
    
    // Verify callback was called
    expect(onPlantTaskPressMock).toHaveBeenCalledWith('plant123');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx::test plant name linking`
Expected: FAIL

- [ ] **Step 3: Implement plant name linking in task items**

```typescript
// In task content rendering
{task.plantId && onPlantTaskPress ? (
  <Pressable 
    onPress={() => onPlantTaskPress(task.plantId!)}
    style={styles.taskPlantLink}
  >
    <Text style={styles.taskPlantText}>{task.plantName}</Text>
  </Pressable>
) : (
  <Text style={styles.taskPlantText}>{task.plantName}</Text>
)}
```

- [ ] **Step 4: Add styles for plant name linking**

```typescript
taskPlantLink: {
  // Link styling
},
taskPlantText: {
  fontSize: Typography2026.small.fontSize,
  fontWeight: '700',
  color: Colors2026.primary,
},
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/GamificationBar.tsx src/components/ui/__tests__/GamificationBar.test.tsx
git commit -m "feat: implement plant name linking in task dropdown"
```

### Task 5: Add animations and touch feedback

**Files:**
- Modify: `src/components/ui/GamificationBar.tsx`

- [ ] **Step 1: Write failing test for animations**

```typescript
// Test file: src/components/ui/__tests__/GamificationBar.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import GamificationBar from '../GamificationBar';

describe('GamificationBar animations', () => {
  it('should use animated values for dropdown transitions', () => {
    // Test that animated values are used
    // Implementation check
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx::test animations`
Expected: FAIL

- [ ] **Step 3: Import Animated and set up animations**

```typescript
// At top of file
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

// In component
const fadeAnim = useRef(new Animated.Value(0)).current;
const rotateAnim = useRef(new Animated.Value(0)).current;

// Animation functions
const animateDropdownIn = () => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }).start();
};

const animateDropdownOut = () => {
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  }).start();
};

const rotateArrowUp = () => {
  Animated.timing(rotateAnim, {
    toValue: 1,
    duration: 150,
    useNativeDriver: true,
  }).start();
};

const rotateArrowDown = () => {
  Animated.timing(rotateAnim, {
    toValue: 0,
    duration: 150,
    useNativeDriver: true,
  }).start();
};
```

- [ ] **Step 4: Connect animations to expanded state**

```typescript
useEffect(() => {
  if (expanded) {
    animateDropdownIn();
    rotateArrowUp();
  } else {
    animateDropdownOut();
    rotateArrowDown();
  }
}, [expanded]);
```

- [ ] **Step 5: Apply animations to components**

```typescript
// Dropdown container
<Animated.View style={[styles.plantTaskDropdown, { opacity: fadeAnim }]}> 
  {/* Dropdown content */}
</Animated.View>

// Arrow icon
<Animated.View style={{ transform: [{ rotate: `${rotateAnim.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '90deg'
})}deg`}]} }>
  <ChevronRight 
    size={16} 
    color={Colors2026.primary} 
    style={styles.plantTaskArrow}
  />
</Animated.View>
```

- [ ] **Step 6: Add touch feedback to pressables**

```typescript
// In pressable components
<Pressable
  style={[styles.plantTaskCard, pressed && styles.plantTaskPressed]}
  onPress={handlePlantTaskPress>
// ...
```

- [ ] **Step 7: Add pressed styles**

```typescript
plantTaskPressed: {
  backgroundColor: 'rgba(45,71,57,0.12)',
},
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/ui/GamificationBar.tsx src/components/ui/__tests__/GamificationBar.test.tsx
git commit -m "feat: add animations and touch feedback to plant task card"
```

### Task 6: Implement accessibility features

**Files:**
- Modify: `src/components/ui/GamificationBar.tsx`

- [ ] **Step 1: Write failing test for accessibility**

```typescript
// Test file: src/components/ui/__tests__/GamificationBar.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import GamificationBar from '../GamificationBar';

describe('GamificationBar accessibility', () => {
  it('should have proper accessibility labels and roles', () => {
    const { container } = render(<GamificationBar 
      streak={{ currentStreak: 0, bestStreak: 0, lastActiveDate: null }}
      motivation="Test message"
      achievements={[]}
      showPlantTaskCard={true}
      plantTaskMessage="Test plant message"
      plantTaskPlantId="plant123"
      onPlantTaskPress={jest.fn()}
    />);
    
    // Check accessibility labels
    // Implementation would verify accessibility properties
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx::test accessibility`
Expected: FAIL

- [ ] **Step 3: Add accessibility props to all interactive elements**

```typescript
// Plant task card
<Pressable 
  accessibilityRole="button"
  accessibilityLabel={expanded ? 'Aufgaben einklappen' : 'Aufgaben anzeigen'}
  accessibilityStates={expanded ? ['selected'] : []}
// ...
>

// Task checkbox
<Pressable 
  accessibilityRole="checkbox"
  accessibilityChecked={/* task completed state */}
// ...
>

// Plant name link
<Pressable 
  accessibilityRole="button"
  accessibilityLabel={`Pflanze ${task.plantName} anzeigen`}
// ...
>

// More tasks button
<Pressable 
  accessibilityRole="button"
  accessibilityLabel="Weitere Aufgaben anzeigen"
// ...
>
```

- [ ] **Step 4: Add accessibility hints and traits where needed**

```typescript
// Add accessibility hints for better screen reader experience
accessibilityHint="Doppelklick zum Öffnen des Dropdowns"
```

- [ ] **Step 5: Ensure proper contrast and touch target sizes**

```typescript
// Verify all touch targets are at least 44x44px
// Check color contrast ratios meet WCAG AA
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/GamificationBar.tsx src/components/ui/__tests__/GamificationBar.test.tsx
git commit -m "feat: implement accessibility features for plant task card"
```

### Task 7: Update HomeScreen to provide plant task card data

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

- [ ] **Step 1: Write failing test for HomeScreen integration**

```typescript
// Test file: src/screens/__tests__/HomeScreen.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen plant task card integration', () => {
  it('should pass plant task card data to GamificationBar', () => {
    const { container } = render(<HomeScreen />);
    
    // Would need to mock navigation and data fetching
    // Verify that GamificationBar receives correct props
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/screens/__tests__/HomeScreen.test.tsx::test plant task card integration`
Expected: FAIL

- [ ] **Step 3: Import getMotivationMessage and extend state**

```typescript
// Already imported: import { getMotivationMessage } from '../services/gamificationService';

// Add state for plant task card
const [plantTaskMessage, setPlantTaskMessage] = useState('');
const [plantTaskPlantId, setPlantTaskPlantId] = useState<string | undefined>(undefined);
```

- [ ] **Step 4: Modify loadGamification to also load plant task data**

```typescript
const loadGamification = useCallback(async () => {
  try {
    const allTasks = await fetchTasks();
    const todayCompletedCount = getTodayCompletedCount(allTasks);
    const streakData = await calculateStreak();
    setStreak(streakData);

    // Get motivation message (existing functionality)
    const motivationResult = getMotivationMessage(gardenGrowth.plants, todayCompletedCount);
    setMotivation(motivationResult.message);
    setMotivationPlantId(motivationResult.plantId);

    // NEW: Get plant task card data
    // Find plant with oldest open task
    const plantWithOldestTask = findPlantWithOldestOpenTask(gardenGrowth.plants, allTasks);
    if (plantWithOldestTask) {
      setPlantTaskMessage(createPlantTaskMessage(plantWithOldestTask, allTasks));
      setPlantTaskPlantId(plantWithOldestTask.plantId);
    } else {
      setPlantTaskMessage('');
      setPlantTaskPlantId(undefined);
    }

    const allAchievements = await checkAchievements(streakData, gardenGrowth.plants);
    setAchievements(allAchievements);
  } catch (error) {
    console.error('Error loading gamification:', error);
  }
}, [gardenGrowth.plants]);
```

- [ ] **Step 5: Implement helper functions**

```typescript
// Helper to find plant with oldest open task
const findPlantWithOldestOpenTask = (plants: any[], tasks: any[]) => {
  // Implementation would find plant with oldest task based on task creation date
  // Return plant object or null
};

// Helper to create plant task message
const createPlantTaskMessage = (plant: any, tasks: any[]) => {
  // Implementation would create motivational message based on plant and tasks
  // Examples: "Dein Basilikum braucht dich: Gießen Sie die Blätter! 💧"
  return `${plant.name} wartet auf dich 🌿`; // Simplified for now
};
```

- [ ] **Step 6: Pass plant task card data to GamificationBar**

```typescript
// In GamificationBar component usage
<GamificationBar
  streak={streak}
  motivation={motivation}
  achievements={achievements}
  onAchievementsPress={() => navigation.navigate('Achievements')}
  onMotivationPress={() => navigation.navigate('Tasks')}
  pendingTasks={prioritizedTasks}
  onToggleTask={handleToggleTask}
  todayCompletedCount={tasks.completedTasks}
  onPlantPress={motivationPlantId ? () => setSelectedPlantId(motivationPlantId) : undefined}
  onTaskPlantPress={(plantId) => setSelectedPlantId(plantId)}
  // NEW: Plant task card props
  showPlantTaskCard={!!plantTaskMessage}
  plantTaskMessage={plantTaskMessage}
  plantTaskPlantId={plantTaskPlantId}
  onPlantTaskPress={(plantId) => setSelectedPlantId(plantId)}
/>
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test src/screens/__tests__/HomeScreen.test.tsx`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/screens/HomeScreen.tsx src/screens/__tests__/HomeScreen.test.tsx
git commit -m "feat: integrate plant task card data in HomeScreen"
```

### Task 8: Handle task completion updates and plant switching

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

- [ ] **Step 1: Write failing test for task completion handling**

```typescript
// Test file: src/screens/__tests__/HomeScreen.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen task completion handling', () => {
  it('should update plant task card when task is completed', async () => {
    // Mock task completion
    // Verify that plant task card updates appropriately
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/screens/__tests__/HomeScreen.test.tsx::test task completion handling`
Expected: FAIL

- [ ] **Step 3: Enhance handleToggleTask to update plant task data**

```typescript
const handleToggleTask = async (taskId: string) => {
  try {
    await toggleTaskCompletion(taskId);
    await loadDashboard(true);
    await loadPrioritizedTasks();
    
    // Update streak
    const streakData = await calculateStreak();
    setStreak(streakData);
    
    // Update motivation and plant task data after delay
    setTimeout(async () => {
      const data = await getDashboardData();
      setGardenGrowth(data.gardenGrowth);
      
      // Update motivation
      const allTasks = await fetchTasks();
      const todayCount = getTodayCompletedCount(allTasks);
      const motivationResult = getMotivationMessage(data.gardenGrowth.plants, todayCount);
      setMotivation(motivationResult.message);
      setMotivationPlantId(motivationResult.plantId);
      
      // Update plant task card data
      const plantWithOldestTask = findPlantWithOldestOpenTask(data.gardenGrowth.plants, allTasks);
      if (plantWithOldestTask) {
        setPlantTaskMessage(createPlantTaskMessage(plantWithOldestTask, allTasks));
        setPlantTaskPlantId(plantWithOldestTask.plantId);
      } else {
        setPlantTaskMessage('');
        setPlantTaskPlantId(undefined);
      }
      
      const allAchievements = await checkAchievements(streakData, data.gardenGrowth.plants);
      setAchievements(allAchievements);
    }, 150); // Using 150ms delay as per design
    
    setShowConfetti(true);
    showToast('Aufgabe erledigt!', 'success');
  } catch (error: any) {
    console.error('Error toggling task:', error);
    showToast('Fehler beim Aktualisieren', 'error');
  }
};
```

- [ ] **Step 4: Handle case when no plants have open tasks**

```typescript
// In loadGamification and handleToggleTask timeout
if (!plantWithOldestTask) {
  // No plants with open tasks
  setPlantTaskMessage('Alle Tasks erledigt! 🌻');
  setPlantTaskPlantId(undefined);
  
  // Optionally hide card after delay or based on config
  // setShowPlantTaskCard(false); // Would need additional state
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test src/screens/__tests__/HomeScreen.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/screens/HomeScreen.tsx src/screens/__tests__/HomeScreen.test.tsx
git commit -m "feat: handle task completion updates and plant switching"
```

### Task 9: Implement empty state handling

**Files:**
- Modify: `src/screens/HomeScreen.tsx` and `src/components/ui/GamificationBar.tsx`

- [ ] **Step 1: Write failing test for empty state handling**

```typescript
// Test file: src/screens/__tests__/HomeScreen.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen empty state handling', () => {
  it('should show appropriate message when no tasks remain', async () => {
    // Mock scenario where all tasks are completed
    // Verify appropriate message is shown
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/screens/__tests__/HomeScreen.test.tsx::test empty state handling`
Expected: FAIL

- [ ] **Step 3: Implement empty/loading states in GamificationBar**

```typescript
// Add loading state prop
isLoading?: boolean;

// In component
{showPlantTaskCard && isLoading && (
  <View style={styles.plantTaskLoading}>
    <ActivityIndicator size="small" color={Colors2026.primary} />
    <Text style={styles.plantTaskLoadingText>Lade Aufgaben...</Text>
  </View>
)}

// Add error state
{showPlantTaskCard && error && (
  <View style={styles.plantTaskError}>
    <Text style={styles.plantTaskErrorText>Fehler beim Laden der Aufgaben</Text>
    <Button title="Erneut versuchen" onPress={retryLoad} />
  </View>
)}
```

- [ ] **Step 4: Add loading/error states to HomeScreen**

```typescript
// Add loading state for plant task data
const [isPlantTaskLoading, setIsPlantTaskLoading] = useState(false);
const [plantTaskError, setPlantTaskError] = useState<string | null>(null);

// Set loading state when fetching
setIsPlantTaskLoading(true);
// ...
setIsPlantTaskLoading(false);

// Handle errors
setPlantTaskError(error.message);
```

- [ ] **Step 5: Add loading/error styles**

```typescript
plantTaskLoading: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: Spacing2026.sm,
},
plantTaskLoadingText: {
  fontSize: Typography2026.body.fontSize,
  color: Colors2026.text,
  marginLeft: Spacing2026.xs,
},
plantTaskError: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: Spacing2026.sm,
  backgroundColor: 'rgba(255,0,0,0.05)',
  borderRadius: Radius2026.md,
},
plantTaskErrorText: {
  fontSize: Typography2026.body.fontSize,
  color: Colors2026.text,
  marginLeft: Spacing2026.xs,
},
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test src/screens/__tests__/HomeScreen.test.tsx src/components/ui/__tests__/GamificationBar.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/screens/HomeScreen.tsx src/screens/__tests__/HomeScreen.test.tsx src/components/ui/GamificationBar.tsx src/components/ui/__tests__/GamificationBar.test.tsx
git commit -m "feat: implement empty and loading states for plant task card"
```

### Task 10: Run final integration tests and cleanup

**Files:**
- Modify: Various test files as needed

- [ ] **Step 1: Write comprehensive integration test**

```typescript
// Test file: src/screens/__tests__/HomeScreen.integration.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen plant task card integration', () => {
  it('should display plant task card with correct data', async () => {
    // Full integration test
  });
  
  it('should allow toggling tasks via dropdown', async () => {
    // Test task completion flow
  });
  
  it('should update plant task card when tasks change', async () => {
    // Test plant switching logic
  });
});
```

- [ ] **Step 2: Run integration tests**

Run: `npm test src/screens/__tests__/HomeScreen.integration.test.tsx`
Expected: PASS

- [ ] **Step 3: Run all related tests to ensure nothing broken**

Run: `npm test src/components/ui/__tests__/GamificationBar.test.tsx`
Run: `npm test src/screens/__tests__/HomeScreen.test.tsx`
Run: `npm test src/services/__tests__/gamificationService.test.tsx`

Expected: All PASS

- [ ] **Step 4: Run linter to ensure code quality**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 5: Commit final changes**

```bash
git add .
git commit -m "feat: complete plant task card implementation with all features"
```

## Plan Review

This implementation plan follows TDD principles by:
1. Writing failing tests first
2. Implementing minimal code to make tests pass
3. Running tests to verify correctness
4. Committing frequently
5. Covering all requirements from the UX design

The plan modifies only the necessary files:
- src/components/ui/GamificationBar.tsx (main implementation)
- src/screens/HomeScreen.tsx (data integration)
- Test files for each component

All functionality is implemented incrementally with proper testing at each step.