# 🐛 Bugs, Gotchas & Solutions

**Häufige Probleme und deren Lösungen in Gartenplaner**
**Datum:** 2026-03-04
**Basierend auf:** BMAD_Lernprozess (Sprint 1-5) + SPRINT-5-SUMMARY

---

## 🌐 Expo Web Spezifische Issues

### 1. Asset Path Handling

**Problem:** Images und Assets funktionieren auf Native, nicht auf Web

**Root Cause:** Expo Web benötigt explizite Asset-Pfade, Native ignoriert relative Pfade

**Solution:**
```typescript
// ❌ Funktioniert nur auf Native
const image = require('../assets/plant.png');

// ✅ Funktioniert auf Web + Native
import plantImage from '../assets/plant.png';
export const IMAGES = {
  plant: plantImage,
};
```

**Cost:** 2h debugging, 30min fix
**Learning:** Asset imports testen IMMER auf Web Day 2!

---

### 2. Babel/JSX Parsing Errors

**Problem:** "SyntaxError: Unexpected token" bei JSX-Dateien

**Root Cause:** Expo Web babel config ist incomplete, benötigt `.babelrc` mit `expo/babel` preset

**Solution:**
```json
// .babelrc
{
  "presets": ["expo/babel"]
}
```

Dann: `expo web --clear` (Cache löschen)

**Cost:** 3h debugging, 10min fix (wenn man weiß wo)
**Learning:** Babel-Fehler = Cache löschen, nicht Code-Fehler!

---

### 3. Package Version Conflicts

**Problem:** Supabase, React Navigation, oder andere packages haben unterschiedliche Versionen auf Web vs Native

**Common Issues:**
- `react-native-svg` hat unterschiedliche APIs
- `expo-image-picker` hat andere Web-API
- `@react-navigation` kann unterschiedliche Versionen haben

**Solution:**
```typescript
// Check package.json für identische Versions
"react-native": "0.72.0",
"@react-native-community/...": "^5.0.0",

// Dann: npm install && expo web --clear
```

**Cost:** 1-2h per dependency issue
**Learning:** Halte Versions konsistent! Use npm audit

---

### 4. Route Params Type Safety Issues

**Problem:** Type-safe Navigation funktioniert auf Native, TypeScript Error auf Web

**Root Cause:** Expo Web hat andere Route Parsing, benötigt explizite Typing

**Solution:**
```typescript
// Navigation Types
export type RootStackParamList = {
  Plant: { plantId: string };
  PlantDetail: { plantId: string };
};

// dann: navigation.navigate('Plant', { plantId: 'ABC' })
// wird auf Web automatisch zu: /Plant?plantId=ABC
```

**Cost:** 45min debugging, 15min fix
**Learning:** Test Web Navigation früh!

---

### 5. Database Schema Mismatches

**Problem:** Database queries funktionieren auf Native, returnieren undefined auf Web

**Root Cause:** Supabase RLS-Policies werden auf Web anders evaluiert, oder Timestamp-Formate unterscheiden sich

**Solution:**
```typescript
// Explicit timezone handling
const now = new Date().toISOString(); // Always ISO string

// RLS policy must work on Web too
// Test: SELECT * FROM plants WHERE user_id = auth.uid()
```

**Cost:** 1-2h troubleshooting, 30min fix
**Learning:** RLS debuggen mit Supabase Studio

---

### 6. Photo Upload/Image Handling

**Problem:** Photo upload funktioniert auf Native, nicht auf Web

**Symptoms:**
- "blob:// URI not supported"
- "File not found"
- Image base64 encoding issues

**Root Cause:**
- Native: `file://` URIs
- Web: `blob://` oder base64 required

**Solution:**
```typescript
// platformService.ts
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
    base64: Platform.OS === 'web', // Web needs base64
  });

  if (result.cancelled) return null;

  if (Platform.OS === 'web' && result.base64) {
    // Upload base64
    return {
      type: 'base64',
      data: result.base64,
    };
  } else {
    // Native: Use file URI
    return {
      type: 'uri',
      uri: result.assets[0].uri,
    };
  }
}
```

**Cost:** 3-4h first time, 30min on next Web feature
**Learning:** Separiere Web/Native asset handling früh!

---

## 🔐 RLS & Security Issues

### 7. RLS Policy Returning Wrong Data

**Problem:** Query returns data, aber user_id filter funktioniert nicht

**Root Cause:** RLS policy nicht korrekt mit `auth.uid()` verglichen

**Bad:**
```sql
-- ❌ Won't work
SELECT * FROM plants WHERE owner_id = current_user_id();
```

**Good:**
```sql
-- ✅ Correct
SELECT * FROM plants WHERE user_id = auth.uid();
```

**Cost:** 1-2h debugging
**Learning:** Immer `auth.uid()` verwenden, nie `current_user_id()`

---

### 8. Authentication Session Lost on Web Refresh

**Problem:** User logged in, refreshes page on Web, logged out

**Root Cause:** Supabase session nicht persistent auf Web, AuthContext nicht auf Reload re-initialize

**Solution:**
```typescript
// AuthContext.tsx
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  checkSession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => subscription?.unsubscribe();
}, []);
```

**Cost:** 1h first time
**Learning:** Always restore session on app/page load!

---

## 📱 React Native Platform Issues

### 9. FlatList Performance on Web

**Problem:** FlatList scrolling is slow/jittery on Web

**Root Cause:** Web uses different rendering, needs explicit height and getItemLayout

**Solution:**
```typescript
const ITEM_HEIGHT = 100;

<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
/>
```

**Cost:** 1h optimization
**Learning:** Immer getItemLayout für Web + Mobile Perf

---

### 10. Delete Button Not Giving Feedback on Web

**Problem:** Delete button press, nothing happens (on Web)

**Root Cause:** Alert.alert() nicht auf Web, oder async delete nicht awaited

**Solution:**
```typescript
// ❌ Bad
const handleDelete = () => {
  deleteItem(id); // Not awaited
};

// ✅ Good
const handleDelete = async () => {
  if (Platform.OS === 'web') {
    if (!window.confirm('Delete this item?')) return;
  } else {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => deleteItem(id) },
    ]);
    return;
  }

  try {
    await deleteItem(id);
    Alert.alert('Deleted!');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

**Cost:** 30min debugging
**Learning:** Test user feedback on all platforms!

---

### 11. Shopping List Updates Not Reflecting on Web

**Problem:** Mark item as purchased, doesn't update UI on Web (works on Native)

**Root Cause:** State not updating because mutation, not replacement

**Solution:**
```typescript
// ❌ Mutating state
items[index].purchased = true;
setItems(items);

// ✅ Correct
setItems(items.map((item, i) =>
  i === index ? { ...item, purchased: true } : item
));
```

**Cost:** 1h debugging
**Learning:** Always use spread operator, never mutate state directly!

---

## 🖼️ Image & Media Issues

### 12. Image Compression Optimization

**Problem:** Images are too large, slow uploads, waste storage

**Learned Solution:**
- 70% quality reduction = 80% file size reduction
- Use `expo-image-manipulator` for consistent compression

**Code:**
```typescript
import * as ImageManipulator from 'expo-image-manipulator';

export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200, height: 1200 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
```

**Savings:** 70% compression = 70% less storage + bandwidth
**Cost:** 1-2h first implementation, 0 on repeat

---

## ✅ Testing & Quality Issues

### 13. Integration Tests Failing Between Sprint

**Problem:** Tests pass in Sprint 5, fail in Sprint 6

**Root Cause:** Database schema changed, test data outdated

**Solution:**
```typescript
// test-setup.ts
beforeEach(async () => {
  // Fresh test data every test
  const { error } = await supabase.from('plants').delete().gte('id', 0);

  // Seed test data
  await seedTestData();
});
```

**Cost:** 1h debugging per schema change
**Learning:** Maintain test-setup.ts as part of schema changes

---

## 📊 State Management Issues

### 14. Context Updates Causing Performance Issues

**Problem:** AuthContext updates, entire app re-renders

**Root Cause:** All state in one context, useContext causes full re-render

**Solution:**
```typescript
// Separate contexts by concern
export const UserContext = createContext(); // user data
export const AuthContext = createContext(); // auth status
export const NotificationContext = createContext(); // temp notifications

// then use only what you need
const { user } = useContext(UserContext); // Only re-renders if user changes
```

**Cost:** 2h refactoring
**Learning:** Keep contexts focused (single responsibility)

---

## 🚀 Performance Insights (Learned)

### Best Practices Summary

✅ **Image Handling:**
- Always compress to 70% quality
- Use getItemLayout for lists
- Test on Web early (Day 2)

✅ **State Management:**
- Separate contexts by concern
- Never mutate state directly
- Use useCallback for event handlers

✅ **Platform Differences:**
- Test Web + Native daily
- Use Platform.OS for conditional logic
- Document Web-specific workarounds

✅ **RLS & Security:**
- Always use auth.uid() not current_user_id()
- Test RLS in Supabase Studio
- Verify auth state on reload

---

**Status:** 🟢 Growing with each sprint
**Last Updated:** 2026-03-04
**Next Update:** After Sprint 6 with new gotchas
