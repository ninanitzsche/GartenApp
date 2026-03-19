# Gartenplaner App - Architecture

## Overview
Mobile-first React Native app with Supabase backend, following clean architecture principles with separation between UI, business logic, and data access.

## Architecture Layers

### 1. Presentation Layer (`src/screens/`, `src/components/`)
- **Screens:** Full-page views, handle user interactions
- **Components:** Reusable UI elements
- **Navigation:** Tab and stack navigators

### 2. Business Logic Layer (`src/services/`)
- CRUD operations for all entities
- Data filtering and transformation
- Status progression logic (plants)
- Authentication flows

### 3. Data Layer (`src/services/supabase.ts`)
- Supabase client configuration
- Auth storage (AsyncStorage)
- Session management

### 4. State Management
- **AuthContext:** Global auth state (user, session, loading)
- **Local state:** React useState for component-level state
- **No global state library** (simple app requirements)

### 5. Type System (`src/types/`)
- TypeScript interfaces for all entities
- Form data types (for create/update)
- Navigation param lists

## Navigation Structure

```
AuthScreen (unauthenticated)
    ↓
TabNavigator (authenticated)
├── Home (Dashboard)
├── Plants → PlantsStackNavigator
│   ├── PlantListScreen
│   ├── AddPlantScreen
│   ├── EditPlantScreen
│   └── PlantDetailScreen
├── Tasks → TaskStackNavigator
│   ├── TaskListScreen
│   ├── AddTaskScreen
│   └── TaskDetailScreen
├── Photos
├── Shopping → ShoppingStackNavigator
│   ├── ShoppingDashboardScreen
│   ├── ShoppingListScreen
│   ├── AddShoppingItemScreen
│   └── EditShoppingItemScreen
├── Garden → GardenStackNavigator
│   ├── GardenOverviewScreen
│   ├── AddBedScreen
│   ├── EditBedScreen
│   └── BedDetailScreen
└── More → MoreMenuStackNavigator
    ├── MoreMenuScreen
    ├── KnowledgeBaseScreen
    ├── HarvestLogScreen
    └── ProfileScreen
```

## Data Flow

```
Screen → Service → Supabase Client → PostgreSQL
                ↓
           AuthContext (user context)
```

## Key Architectural Decisions

1. **Service-based data access:** All DB operations go through services
2. **Type-first design:** Types defined before implementation
3. **Jest testing with mocks:** Node environment, mocked Supabase
4. **Environment variables:** Supabase credentials via `.env`
5. **No global state library:** Simple auth context sufficient

## Database Schema (Supabase)

### Core Tables
- `plants` - Plant inventory with status tracking
- `tasks` - Garden tasks with categories and priorities
- `photos` - Photo documentation
- `shopping_items` - Shopping list items
- `harvests` - Harvest logging
- `knowledge_articles` - Permaculture knowledge base
- `plant_companions` - Companion planting relationships
- `gardens` - Garden metadata
- `beds` - Interactive garden beds
- `bed_plants` - Bed-plant relationships

### Junction Tables
- `plant_tasks` - Task-plant links
- `task_knowledge` - Task-knowledge article links
- `plant_knowledge` - Plant-knowledge article links

### Security
- Row Level Security (RLS) on all tables
- Users can only access their own data
