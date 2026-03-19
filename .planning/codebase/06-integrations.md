# Gartenplaner App - Integrations

## External Services

### Supabase (Backend-as-a-Service)
- **Purpose:** Database, Authentication, Storage
- **Package:** `@supabase/supabase-js` ^2.98.0
- **Setup:** `src/services/supabase.ts`
- **Env Vars:**
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Supabase Client Config
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

## Database Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `plants` | Plant inventory | Yes |
| `tasks` | Garden tasks | Yes |
| `photos` | Photo storage | Yes |
| `shopping_items` | Shopping list | Yes |
| `harvests` | Harvest logs | Yes |
| `knowledge_articles` | Permaculture info | Yes |
| `plant_companions` | Companion data | Yes |
| `gardens` | Garden metadata | Yes |
| `beds` | Garden beds | Yes |
| `bed_plants` | Bed-plant links | Yes |
| `plant_tasks` | Task-plant links | Yes |
| `task_knowledge` | Task-knowledge links | Yes |
| `plant_knowledge` | Plant-knowledge links | Yes |

## Migrations

### Location
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/add_scheduled_date.sql`

### Run Migrations
Execute SQL in Supabase SQL Editor or use:
```bash
# See docs/migrations/ for additional migrations
```

## Storage
- Photos stored in Supabase Storage
- Managed via `photoService.ts`
- Image picker: `expo-image-picker`
- Image manipulation: `expo-image-manipulator`

## Environment Configuration

### `.env` Variables
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### `.env.example`
Template for new developers

## Deployment

### Expo EAS
- Android builds via `eas build --platform android`
- iOS builds via `eas build --platform ios`

### App Configuration
- `app.json` - name, icon, splash, platforms
- `expo.config.js` - additional build config

## Web Support
- React Native Web (`react-native-web`)
- Expo web support
- Responsive design (portrait orientation)
