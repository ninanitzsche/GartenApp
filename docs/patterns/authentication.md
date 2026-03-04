# 🔐 Authentication Pattern

**Status:** Active
**Last Updated:** 2026-03-04
**Audience:** Developers
**Related:** [SERVICE-LAYER.md](SERVICE-LAYER.md), [REACT-HOOKS.md](REACT-HOOKS.md)

---

## 📌 Pattern Overview

Gartenplaner uses **Supabase Auth** with **Context API** for session management.

**Features:**
- ✅ Email/Password authentication
- ✅ Persistent sessions (survives app restart)
- ✅ Type-safe user context
- ✅ Logout on password change
- ✅ Session auto-refresh

---

## 🏗️ Architecture

```
App.tsx
  ↓
AuthProvider (wraps entire app)
  ↓
AuthContext.tsx (manages user/session state)
  ↓
Services (all scoped to user_id)
  ↓
Screens (access user via useAuth hook)
```

---

## 📂 Files

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Auth state provider + methods |
| `src/services/authService.ts` | Auth operations (signup, signin, etc.) |
| `src/screens/LoginScreen.tsx` | Login UI example |
| `src/screens/SignupScreen.tsx` | Signup UI example |
| `src/screens/ProfileScreen.tsx` | User profile + password change |

---

## 🔑 Core Implementation

### 1. AuthContext (State Management)

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Restore session on app launch
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth anywhere
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### 2. Auth Service (Operations)

```typescript
// src/services/authService.ts
import { supabase } from './supabase';

export async function changePassword(oldPassword: string, newPassword: string) {
  // Change password in Supabase
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) throw updateError;

  // On password change, log out (security: old tokens no longer valid)
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email);
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
```

---

## 🎯 How to Use Auth in Components

### Example 1: Protect a Screen

```typescript
// src/screens/HomeScreen.tsx
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export function HomeScreen({ navigation }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Not authenticated, redirect to login
      navigation.navigate('Login');
    }
  }, [user, loading, navigation]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <View>
      <Text>Welcome, {user.email}</Text>
    </View>
  );
}
```

### Example 2: Use User ID in Service Call

```typescript
// src/screens/PlantsScreen.tsx
import { useAuth } from '../contexts/AuthContext';
import { fetchPlants } from '../services/plantService';

export function PlantsScreen() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    if (user) {
      // Service automatically filters by user_id (see SERVICE-LAYER.md)
      fetchPlants().then(setPlants);
    }
  }, [user]);

  return (
    <FlatList
      data={plants}
      renderItem={({ item }) => <PlantCard plant={item} />}
    />
  );
}
```

### Example 3: Login Form

```typescript
// src/screens/LoginScreen.tsx
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      // Navigation happens automatically via AuthContext
      navigation.navigate('Home');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

---

## 🔒 Security Best Practices

### ✅ Do This
- ✅ Always check `user` in protected screens
- ✅ Scope all database queries to `user_id` (RLS enforces this)
- ✅ Use session for auth state (not localStorage)
- ✅ Log out on password change
- ✅ Handle loading state properly

### ❌ Don't Do This
- ❌ Don't store passwords
- ❌ Don't bypass Supabase auth
- ❌ Don't expose user data in props
- ❌ Don't fetch data before user is loaded

---

## 🧪 Testing Auth

```typescript
// src/__tests__/AuthContext.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

describe('AuthContext', () => {
  it('should provide auth methods', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.signIn).toBeDefined();
    expect(result.current.signUp).toBeDefined();
    expect(result.current.signOut).toBeDefined();
  });

  it('should handle login', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });
});
```

---

## 🔄 User Scoping (RLS Pattern)

**All services automatically scope to current user:**

```typescript
// Example: plantService.ts filters by user_id
export async function fetchPlants() {
  let query = supabase
    .from('plants')
    .select('*');

  // RLS policy ensures only user's own plants
  const { data } = await query;
  return data;
}
```

**Database RLS Policy:**
```sql
CREATE POLICY "Plants are visible to owner"
  ON plants
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🚀 Session Management

### Persistent Sessions (Automatic)
```typescript
// User is automatically restored on app launch
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    // This runs even after app restart
    setSession(session);
  });
}, []);
```

### Manual Logout
```typescript
// Explicit logout
await signOut(); // User is cleared
```

### Password Change Logout (Security)
```typescript
// When user changes password, force logout
await changePassword(oldPwd, newPwd); // Calls signOut()
// User must log back in with new password
```

---

## 🔗 Related Patterns

- [Service Layer](SERVICE-LAYER.md) - How services scope to user
- [React Hooks](REACT-HOOKS.md) - useAuth hook usage
- [Database Guide](../database/database-guide.md) - RLS policies

---

## ✅ Checklist

When implementing auth in new screen:
- [ ] Import `useAuth` from AuthContext
- [ ] Check `user` exists before rendering
- [ ] Handle `loading` state
- [ ] Show error messages to user
- [ ] Services automatically scoped to user_id
- [ ] RLS policies verified in database

---

**Last Updated:** 2026-03-04
**Version:** 1.0
**Implemented by:** Supabase Auth + Context API

