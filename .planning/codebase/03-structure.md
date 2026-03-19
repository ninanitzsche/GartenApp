# Gartenplaner App - Project Structure

## Root Directory
```
gartenplaner-app/
├── App.tsx                    # App entry point
├── index.ts                   # Expo entry
├── package.json
├── tsconfig.json              # TypeScript config (strict mode)
├── jest.config.js             # Jest testing config
├── app.json                   # Expo app config
├── expo.config.js             # Expo build config
├── babel.config.js
├── .env / .env.example        # Environment variables
├── .portkey.json              # AI config
├── assets/                    # Images, fonts, icons
├── data/                      # Static data files
├── docs/                      # Documentation
├── scripts/                   # Migration/seed scripts
├── src/                       # Main source code
├── supabase/                  # Database migrations
├── coverage/                  # Test coverage reports
└── web-interface/            # Web-specific files
```

## Source Structure (`src/`)
```
src/
├── __tests__/                # Test files
│   ├── mocks/                # Mock implementations
│   │   ├── fileMock.ts
│   │   ├── styleMock.ts
│   │   └── supabaseMock.ts
│   ├── setup.ts              # Jest setup
│   ├── *.test.ts             # Unit tests
│   └── integration/          # Integration tests
├── components/                # Reusable UI components
│   ├── BedCard.tsx
│   ├── BedMapView.tsx
│   ├── EmptyState.tsx
│   ├── GardenStatsCard.tsx
│   ├── MetricCard.tsx
│   ├── PhotoFilterModal.tsx
│   ├── ProgressBar.tsx
│   ├── TaskListItem.tsx
│   └── TasksGroupedByTimeWindow.tsx
├── contexts/                 # React contexts
│   └── AuthContext.tsx       # Authentication state
├── hooks/                     # Custom hooks (if any)
├── navigation/                # Navigation configuration
│   ├── GardenStackNavigator.tsx
│   ├── MoreMenuStackNavigator.tsx
│   ├── PlantsStackNavigator.tsx
│   ├── ShoppingStackNavigator.tsx
│   ├── TabNavigator.tsx
│   ├── TaskStackNavigator.tsx
│   └── types/navigation.ts   # Navigation type definitions
├── screens/                   # Screen components
│   ├── AddBedScreen.tsx
│   ├── AddHarvestScreen.tsx
│   ├── AddPlantScreen.tsx
│   ├── AddShoppingItemScreen.tsx
│   ├── AddTaskScreen.tsx
│   ├── ArticleDetailScreen.tsx
│   ├── AuthScreen.tsx
│   ├── BedDetailScreen.tsx
│   ├── ChangePasswordScreen.tsx
│   ├── EditBedScreen.tsx
│   ├── EditPlantScreen.tsx
│   ├── EditShoppingItemScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── GardenOverviewScreen.tsx
│   ├── GardenPhotoGalleryScreen.tsx
│   ├── GardenSettingsScreen.tsx
│   ├── HarvestLogScreen.tsx
│   ├── HomeScreen.tsx
│   ├── KnowledgeBaseScreen.tsx
│   ├── KnowledgeDetailScreen.tsx
│   ├── LoginScreen.tsx
│   ├── MoreMenuScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── PhotoGalleryScreen.tsx
│   ├── PhotoUploadScreen.tsx
│   ├── PlantDetailScreen.tsx
│   ├── PlantListScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── ShoppingDashboardScreen.tsx
│   ├── ShoppingListScreen.tsx
│   ├── TaskDetailScreen.tsx
│   ├── TaskListScreen.tsx
│   └── TaskTimelineScreen.tsx
├── services/                  # Business logic & API
│   ├── authService.ts
│   ├── bedService.ts
│   ├── companionService.ts
│   ├── dashboardService.ts
│   ├── gardenService.ts
│   ├── harvestService.ts
│   ├── knowledgeService.ts
│   ├── photoService.ts
│   ├── plantService.ts
│   ├── seedDataService.ts
│   ├── shoppingService.ts
│   ├── supabase.ts            # Supabase client
│   └── taskService.ts
├── theme/                     # Styling
│   └── colors.ts              # Color palette
├── types/                      # TypeScript types
│   ├── companion.ts
│   ├── garden.ts
│   ├── harvest.ts
│   ├── knowledge.ts
│   ├── navigation.ts
│   ├── photo.ts
│   ├── plant.ts
│   ├── shopping_item.ts
│   └── task.ts
└── utils/                     # Utility functions
    ├── seedData.ts
    └── taskTimestamps.ts
```

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `screens/` | 30+ screen components |
| `services/` | 12 service modules for CRUD operations |
| `components/` | 10 reusable UI components |
| `navigation/` | 7 navigation configurations |
| `types/` | 9 type definition files |
| `__tests__/` | Comprehensive test suite |

## File Naming Conventions
- Components: `PascalCase.tsx`
- Services: `camelCase.ts`
- Types: `camelCase.ts`
- Tests: `*.test.ts`
- Mocks: `*.mock.ts`
