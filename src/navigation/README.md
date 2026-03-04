# src/navigation/ - Navigation Configuration

**Last Updated:** 2026-03-04
**Status:** Production code
**Purpose:** React Navigation setup and routing configuration

---

## 🎯 What is Navigation?

Navigation manages how users move between screens in the app.

**Types:**
- **Stack Navigation** - Linear flow (push/pop screens)
- **Tab Navigation** - Bottom tabs for main sections
- **Drawer Navigation** - Slide-out menu

**In Gartenplaner:**
- Tab Navigation (main screens at bottom)
- Stack Navigation within each tab (drill into details)
- Auth Stack (login/register flow)

---

## 📊 Navigation Structure

```
RootNavigator
├── If NOT authenticated
│   └── AuthStack (Login, Register, ForgotPassword)
│
└── If authenticated
    └── MainTabs
        ├── HomeStack
        │   └── HomeScreen → PlantDetailScreen → EditPlantScreen
        ├── PlantsStack
        │   └── PlantsScreen → AddPlantScreen → EditPlantScreen
        ├── ShoppingStack
        │   └── ShoppingScreen → AddItemScreen
        └── MoreStack
            └── MoreMenuScreen → SettingsScreen → ChangePasswordScreen
```

---

## 🏗️ Navigation Pattern

### Main Navigation File

```typescript
// src/navigation/index.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PlantsScreen } from '../screens/PlantsScreen';
import { ShoppingScreen } from '../screens/ShoppingScreen';
import { MoreMenuScreen } from '../screens/MoreMenuScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack (for unauthenticated users)
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Home Tab Stack
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#4CAF50',
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="PlantDetail" component={PlantDetailScreen} />
    </Stack.Navigator>
  );
}

// Plants Tab Stack
function PlantsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PlantsScreen" component={PlantsScreen} />
      <Stack.Screen name="AddPlant" component={AddPlantScreen} />
      <Stack.Screen name="EditPlant" component={EditPlantScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator (authenticated users)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            HomeTab: focused ? '🏠' : '🏡',
            PlantsTab: focused ? '🌱' : '🌾',
            ShoppingTab: focused ? '🛒' : '🛍️',
            MoreTab: focused ? '⋮' : '⋯',
          };
          return <Text style={{ fontSize: size, color }}>{icons[route.name]}</Text>;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="PlantsTab"
        component={PlantsStack}
        options={{ title: 'Plants' }}
      />
      <Tab.Screen
        name="ShoppingTab"
        component={ShoppingStack}
        options={{ title: 'Shopping' }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{ title: 'More' }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator (handles auth state)
export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />; // Show loading while checking auth
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen
            name="MainApp"
            component={MainTabs}
            options={{ animationEnabled: false }}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{ animationEnabled: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 📱 Navigation Usage in Screens

### Navigate to Another Screen

```typescript
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <Button
      title="View Plant Details"
      onPress={() =>
        navigation.navigate('PlantDetail', { id: 'plant-123' })
      }
    />
  );
}
```

### Access Route Parameters

```typescript
import { useRoute } from '@react-navigation/native';

function PlantDetailScreen() {
  const route = useRoute();
  const { id } = route.params;

  useEffect(() => {
    loadPlant(id);
  }, [id]);

  return <View>/* Plant details */</View>;
}
```

### Go Back

```typescript
function EditPlantScreen() {
  const navigation = useNavigation();

  const handleSave = async () => {
    await savePlant();
    navigation.goBack(); // Return to previous screen
  };

  return <Button title="Save" onPress={handleSave} />;
}
```

### Reset to Home

```typescript
function LoginScreen() {
  const navigation = useNavigation();

  const handleLoginSuccess = () => {
    // Replace entire navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };
}
```

---

## 🔐 Type-Safe Navigation

**Define route param types:**

```typescript
// src/navigation/types.ts

export type RootStackParamList = {
  MainApp: undefined;
  Auth: undefined;
  Login: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  PlantDetail: { id: string };
  EditPlant: { id: string };
};

// Declare global for type checking
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

**Use in screens (TypeScript will check params):**

```typescript
function PlantDetailScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, 'PlantDetail'>>();
  const { id } = route.params; // TypeScript knows 'id' exists
}
```

---

## 🎨 Styling Navigation

### Header Styling

```typescript
<Stack.Screen
  name="HomeScreen"
  component={HomeScreen}
  options={{
    headerTitle: 'Home',
    headerTintColor: '#4CAF50',
    headerStyle: {
      backgroundColor: '#FFF',
      elevation: 0, // Android shadow
    },
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: '600',
    },
  }}
/>
```

### Tab Styling

```typescript
<Tab.Navigator
  screenOptions={{
    tabBarActiveTintColor: '#4CAF50',
    tabBarInactiveTintColor: '#999',
    tabBarStyle: {
      backgroundColor: '#FFF',
      borderTopColor: '#EEE',
      height: 60,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      marginBottom: 5,
    },
  }}
>
  {/* screens */}
</Tab.Navigator>
```

---

## 🔄 Deep Linking (Optional)

**Handle navigation from push notifications, links, etc:**

```typescript
const linking = {
  prefixes: ['gartenplaner://', 'https://gartenplaner.app'],
  config: {
    screens: {
      MainApp: {
        screens: {
          HomeTab: {
            screens: {
              PlantDetail: 'plant/:id',
            },
          },
        },
      },
    },
  },
};

<NavigationContainer linking={linking}>
  {/* navigation */}
</NavigationContainer>
```

---

## ⚠️ Common Navigation Mistakes

❌ **Not handling loading state:**
```typescript
// DON'T: Try to render auth check before done
function RootNavigator() {
  const { user } = useAuth(); // Still loading!
  return user ? <MainApp /> : <Auth />;
}
```

✅ **Wait for auth check:**
```typescript
// DO: Wait for auth to load
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return user ? <MainApp /> : <Auth />;
}
```

---

❌ **Not resetting on logout:**
```typescript
// DON'T: User can go back with hardware back button
const handleLogout = () => {
  signOut();
  navigation.navigate('Login');
};
```

✅ **Reset navigation on logout:**
```typescript
// DO: Clear navigation history
const handleLogout = () => {
  signOut();
  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });
};
```

---

## 🧪 Testing Navigation

```typescript
// src/__tests__/navigation/index.test.tsx

import { render, screen } from '@testing-library/react-native';
import { RootNavigator } from '../../navigation';

// Mock useAuth
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Navigation', () => {
  it('shows Auth stack when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<RootNavigator />);

    // Verify login screen is rendered
    expect(screen.getByText(/login/i)).toBeTruthy();
  });

  it('shows Main tabs when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      loading: false,
    });

    render(<RootNavigator />);

    // Verify main tabs are rendered
    expect(screen.getByText(/home/i)).toBeTruthy();
  });
});
```

---

## 📚 React Navigation Resources

- **Docs:** https://reactnavigation.org/docs/getting-started
- **Stack Navigator:** https://reactnavigation.org/docs/native-stack-navigator
- **Bottom Tabs:** https://reactnavigation.org/docs/bottom-tab-navigator
- **TypeScript:** https://reactnavigation.org/docs/typescript

---

## 🔗 Related Files

- **Auth Context:** `src/contexts/AuthContext.tsx` - Controls auth state
- **Screens:** `src/screens/` - Screen components
- **Root App:** `App.tsx` - Renders RootNavigator
- **Types:** `src/navigation/types.ts` - Navigation type definitions

---

**Purpose:** Handle app-wide navigation and routing
**Owner:** Development team
**Pattern:** Conditional auth/main stacks

