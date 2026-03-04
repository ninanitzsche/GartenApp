# Web vs Native - Gotchas & Lösungen
**Lese BEVOR du Features für Web/Mobile schreibst!**

---

## 🚨 KRITISCH - Diese Features funktionieren NICHT auf Web

### 1. Kamera (expo-camera)
```typescript
// ❌ NATIVE ONLY
import { Camera } from 'expo-camera';

// ✅ LÖSUNG: expo-image-picker mit fallback
import * as ImagePicker from 'expo-image-picker';

export async function takePhoto() {
  if (Platform.OS === 'web') {
    // Web: Image Gallery
    const result = await ImagePicker.launchImageLibraryAsync();
    return result;
  } else {
    // Native: Camera
    const result = await Camera.takePictureAsync();
    return result;
  }
}
```

### 2. GPS / Location (expo-location)
```typescript
// ❌ NATIVE ONLY - Web hat keine GPS
import * as Location from 'expo-location';

// ✅ LÖSUNG: Web-Fallback schreiben
export async function getLocation() {
  if (Platform.OS === 'web') {
    // Browser Geolocation API
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err)
      );
    });
  } else {
    // Native Expo
    const location = await Location.getCurrentPositionAsync();
    return location.coords;
  }
}
```

### 3. Notifications (expo-notifications)
```typescript
// ❌ NATIVE ONLY - Web braucht Web Push API
// ✅ LÖSUNG: Später implementieren oder ignorieren für MVP
```

### 4. Native Modules (expo-secure-store, etc)
```
expo-secure-store ❌ Web
expo-sqlite ❌ Web
expo-file-system ❌ Web (benutze localStorage stattdessen)
```

---

## ⚠️ UI COMPONENTS - Unterschiedliches Verhalten

### Alert.alert() - BRICHT AUF WEB!
```typescript
// ❌ NATIVE - funktioniert nicht auf Web
Alert.alert('Title', 'Message', [
  { text: 'Cancel' },
  { text: 'Delete', onPress: () => {...} }
]);

// ✅ WEB - benutze window.confirm()
// ✅ UNIVERSAL - erstelle Wrapper
import { Platform } from 'react-native';

export async function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) {
  if (Platform.OS === 'web') {
    // Web: window.confirm
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) onConfirm();
    else onCancel?.();
  } else {
    // Native: Alert.alert
    Alert.alert(title, message, [
      { text: 'Cancel', onPress: onCancel },
      { text: 'Confirm', onPress: onConfirm }
    ]);
  }
}

// Nutzen:
const handleDelete = () => {
  showConfirm(
    'Delete?',
    'This cannot be undone',
    () => deletePhoto(id)
  );
};
```

### useFocusEffect() - Unreliable auf Web
```typescript
// ⚠️ PROBLEM: useFocusEffect triggert nicht immer auf Web
useFocusEffect(
  useCallback(() => {
    loadItems();
  }, [])
);

// ✅ LÖSUNG: Fallback useEffect hinzufügen
useEffect(() => {
  loadItems(); // Auch bei Component Mount aufrufen
}, []);

useFocusEffect(
  useCallback(() => {
    loadItems(); // + bei Tab-Focus
  }, [])
);
```

### Modal - Unterschiedliches Verhalten
```typescript
// Native: animationType funktioniert gut
// Web: Manchmal langsam oder flackert

// ✅ LÖSUNG: Platform-spezifische Animation
<Modal
  visible={visible}
  animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
  transparent={true}
/>
```

---

## 📁 FILE HANDLING - KRITISCH FÜR WEB!

### Problem: file:// URIs funktionieren NICHT auf Web

```typescript
// ❌ NATIVE: file:// URIs
// /data/user/0/com.example/cache/photo.jpg

// ❌ WEB: Dateiensystem nicht zugänglich!
// Stattdessen: blob:// URLs

// ✅ LÖSUNG: Blob-Konvertierung

async function handleImageUpload(imageUri: string) {
  try {
    // 1. Fetch image from URI
    const response = await fetch(imageUri);
    if (!response.ok) throw new Error('Fetch failed');

    // 2. Convert to Blob
    const blob = await response.blob();

    // 3. Upload zu Supabase
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('bucket-name')
      .upload(`path/file.jpg`, uint8Array);

    return data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

### Problem: Lokale Dateien auf Web anzeigen

```typescript
// ❌ NATIVE: kann file:// URIs anzeigen
<Image source={{ uri: 'file:///data/...jpg' }} />

// ❌ WEB: CORS Error!
<Image source={{ uri: 'blob:...' }} />

// ✅ LÖSUNG: Öffentliche URLs nutzen
<Image source={{ uri: publicUrl }} /> // https://...

// ✅ ODER: Datatype bei Upload speichern
// Supabase Storage → getPublicUrl()
const { data } = supabase.storage
  .from('plant-photos')
  .getPublicUrl(storagePath);

// Nutzen:
<Image source={{ uri: data.publicUrl }} />
```

---

## 🎨 STYLING - Subtile Unterschiede

```typescript
// PROBLEM: React Native Styles != Web CSS

// ❌ Funktioniert auf Native, nicht Web:
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    shadowColor: '#000', // ← React Native only!
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

// ✅ LÖSUNG: Platform-check
const shadowStyle = Platform.OS === 'web'
  ? {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }
  : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    };

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    ...shadowStyle,
  },
});
```

---

## 🔑 KEYBOARD - Unterschiedliches Verhalten

```typescript
// NATIVE: Keyboard pops up, scrolls content
// WEB: Browser handles keyboard, can interfere

// ✅ LÖSUNG: keyboardShouldPersistTaps

<ScrollView keyboardShouldPersistTaps="handled">
  {/* TextInput & Buttons */}
</ScrollView>
```

---

## 📊 PERFORMANCE - Web ist langsamer

```
Native (React Native):
- Fast re-renders
- Direct native calls
- Good list performance

Web (React Native Web):
- JavaScript execution
- DOM updates can be slow
- FlatList kann laggen

✅ LÖSUNGEN:
1. removeClippedSubviews={true}
2. maxToRenderPerBatch={10}
3. updateCellsBatchingPeriod={50}
4. getItemLayout (für FlatList Höhe)
5. useMemo für teuer Operationen
```

---

## 🔐 PERMISSIONS - Unterschiedlich

### Native Permissions
```typescript
import * as ImagePicker from 'expo-image-picker';

// ✅ Native (iOS/Android): Muss Permissions anfordern
const { status } = await ImagePicker.requestCameraPermissionsAsync();
if (status !== 'granted') {
  Alert.alert('Permission required');
}
```

### Web Permissions
```typescript
// WEB: Browser fragt nach Permissions
// CAMERA: Browser prompt für Camera
// LOCATION: Browser prompt für Location

// ✅ Nutze try/catch
try {
  const result = await ImagePicker.launchCameraAsync();
} catch (error) {
  // Browser hat Permission verweigert
  console.log('Camera permission denied');
}
```

---

## 🧪 TESTING CHECKLIST

Nach JEDEM Feature, das Bilder/Files/Permissions braucht:

- [ ] Auf **Native testen** (Expo Go auf Phone)
- [ ] Auf **Web testen** (npm start → Browser)
- [ ] Unterschiede dokumentieren
- [ ] Fallbacks schreiben wenn nötig

**Typische Test-Cases:**

```
Photo Upload:
- [ ] Native: Wähle aus Galerie
- [ ] Native: Mache mit Kamera
- [ ] Web: Wähle aus Galerie (fallback)
- [ ] Web: Kann Kamera nicht nutzen
- [ ] Beide: Image angezeigt korrekt?
- [ ] Beide: Delete funktioniert?

Shopping List:
- [ ] Native: Add/Edit/Delete funktioniert?
- [ ] Web: Add/Edit/Delete funktioniert?
- [ ] Native: useFocusEffect triggert?
- [ ] Web: useFocusEffect triggert?
```

---

## 📋 QUICK REFERENCE - Copy-Paste Lösungen

### 1. Alert/Confirm Universal
```typescript
export const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export const showConfirm = async (title: string, message: string) => {
  if (Platform.OS === 'web') {
    return window.confirm(`${title}\n\n${message}`);
  } else {
    return new Promise((resolve) => {
      Alert.alert(title, message, [
        { text: 'Cancel', onPress: () => resolve(false) },
        { text: 'OK', onPress: () => resolve(true) },
      ]);
    });
  }
};
```

### 2. File to Blob
```typescript
export async function fileUriToBlob(fileUri: string): Promise<Blob> {
  const response = await fetch(fileUri);
  return await response.blob();
}

export async function fileUriToUint8Array(fileUri: string): Promise<Uint8Array> {
  const blob = await fileUriToBlob(fileUri);
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
```

### 3. Platform-Specific Styling
```typescript
const getShadowStyle = () => {
  if (Platform.OS === 'web') {
    return { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  };
};
```

### 4. useFocusEffect mit Fallback
```typescript
useFocusEffect(
  useCallback(() => {
    loadData();
  }, [])
);

useEffect(() => {
  loadData(); // Fallback
}, []);
```

---

## 🎓 GOLDEN RULES

1. **Immer Platform.OS checken** wenn etwas Native-spezifisch ist
2. **Immer Web testen** nach Features mit Files/Camera/Location
3. **Immer Blob-Konvertierung** für File-Uploads
4. **Immer window.confirm statt Alert** auf Web
5. **Immer useFocusEffect + useEffect** kombinieren
6. **Immer getPublicUrl()** für Image-Anzeige nutzen

---

**Verwende diese Checkliste für JEDEN Code-Review!**
