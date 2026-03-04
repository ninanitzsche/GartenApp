# src/contexts/ - Global State Management

**Last Updated:** 2026-03-04
**Status:** Production code
**Purpose:** React Context for application-wide state

---

## 🎯 What is Context?

React Context lets you **share state globally** without prop drilling.

**Use Context for:**
- Global app state (logged-in user, theme, language)
- State needed by many screens
- Authentication state

**Don't use Context for:**
- Component-specific state (use useState instead)
- Frequently changing data (use Redux/MobX instead)
- Performance-sensitive updates

---

## 📋 Current Contexts

### AuthContext.tsx
**Purpose:** Manage user authentication state

**Provides:**
- `user` - Currently logged-in user object (or null if not authenticated)
- `loading` - Whether auth state is being checked on app startup
- `signUp(email, password)` - Register new user
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `updatePassword(currentPassword, newPassword)` - Change password

**Usage:**
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyScreen() {
  const { user, signOut, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  return (
    <View>
      <Text>Welcome, {user.email}</Text>
      <Button title="Logout" onPress={signOut} />
    </View>
  );
}
```

**Implementation pattern:**
```typescript
// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types/auth';
import * as authService from '../services/authService';

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser || null);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string) => {
    const newUser = await authService.signUp(email, password);
    setUser(newUser);
  };

  const signIn = async (email: string, password: string) => {
    const loggedInUser = await authService.signIn(email, password);
    setUser(loggedInUser);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  const value = { user, loading, signUp, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 🔄 Context Pattern

**Step-by-step: Creating a new context**

1. **Define types:**
   ```typescript
   type MyContextType = {
     state1: string;
     action1: (value: string) => void;
   };
   ```

2. **Create context:**
   ```typescript
   const MyContext = createContext<MyContextType | undefined>(undefined);
   ```

3. **Create provider component:**
   ```typescript
   export function MyProvider({ children }) {
     const [state1, setState1] = useState('');

     const action1 = (value: string) => setState1(value);

     return (
       <MyContext.Provider value={{ state1, action1 }}>
         {children}
       </MyContext.Provider>
     );
   }
   ```

4. **Create custom hook:**
   ```typescript
   export function useMyContext() {
     const context = useContext(MyContext);
     if (context === undefined) {
       throw new Error('useMyContext must be used within MyProvider');
     }
     return context;
   }
   ```

5. **Register in App.tsx:**
   ```typescript
   <MyProvider>
     <YourApp />
   </MyProvider>
   ```

---

## 📱 Setting Up Providers

**In App.tsx, wrap your app with providers:**

```typescript
import { AuthProvider } from './contexts/AuthContext';
import { MyOtherProvider } from './contexts/MyOtherContext';
import { RootNavigator } from './navigation';

export default function App() {
  return (
    <AuthProvider>
      <MyOtherProvider>
        <RootNavigator />
      </MyOtherProvider>
    </AuthProvider>
  );
}
```

**Order matters if providers depend on each other:**
```
AuthProvider (outermost - needed by everything)
  ├── MyOtherProvider
  │   └── RootNavigator
```

---

## ⚠️ Common Mistakes

❌ **Using context for all state:**
```typescript
// DON'T: Every form field in global context
const [formName, setFormName] = useState(''); // Use local state
```

✅ **Use context only for truly global state:**
```typescript
// DO: Only auth state in context
const { user } = useAuth(); // Used by many screens
```

---

❌ **Context without Provider:**
```typescript
// DON'T: Using useAuth() without AuthProvider
function MyScreen() {
  const { user } = useAuth(); // Error if not wrapped!
}
```

✅ **Always wrap app with provider:**
```typescript
// DO: App.tsx wraps with AuthProvider first
<AuthProvider>
  <MyScreen />
</AuthProvider>
```

---

## 🧪 Testing with Context

**Mock context in tests:**

```typescript
import { render, screen } from '@testing-library/react-native';
import { useAuth } from '../contexts/AuthContext';

// Mock the context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('MyScreen with auth', () => {
  beforeEach(() => {
    // Mock useAuth return value
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', email: 'test@example.com' },
      loading: false,
      signOut: jest.fn(),
    });
  });

  it('shows user email', () => {
    render(<MyScreen />);
    expect(screen.getByText(/test@example.com/)).toBeTruthy();
  });
});
```

---

## 📊 Context Design Principles

1. **Keep it simple** - Only necessary state
2. **Keep it stable** - Don't cause unnecessary re-renders
3. **Keep it focused** - One concern per context
4. **Memoize values** - Prevent unnecessary provider re-renders

**Performance optimization:**
```typescript
// Memoize provider value to prevent re-renders
const value = useMemo(() => ({ user, loading, signOut }), [user, loading]);

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

---

## 🚀 When to Use vs When NOT to Use Context

**Use Context:**
- ✅ Authentication state (user, logged in)
- ✅ Theme (dark mode toggle)
- ✅ Language/localization
- ✅ Global app configuration
- ✅ User preferences

**Don't use Context:**
- ❌ Form inputs (use useState)
- ❌ Loading state for single screen (use useState)
- ❌ Frequently changing data (>1000x/sec)
- ❌ Large complex state (consider Redux)

---

## 🔗 Related Files

- **Auth Service:** `src/services/authService.ts` - Auth logic
- **Types:** `src/types/auth.ts` - Auth type definitions
- **App Setup:** `App.tsx` - Provider registration
- **Navigation:** `src/navigation/index.tsx` - Uses auth context

---

**Purpose:** Global state management via React Context
**Owner:** Development team
**Current:** AuthContext (user authentication)

