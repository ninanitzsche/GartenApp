# Gartenplaner App - Concerns & Issues

## Known Issues

### 1. Plant Link Setup Required
- **Status:** Action required
- **File:** `SETUP-PLANT-LINKS-REQUIRED.md`
- **Description:** Plant-knowledge and plant-task links need to be established

### 2. Image Processing
- **Package:** `sharp` used for image processing
- **Note:** Native dependency, may require rebuilds

### 3. Testing Environment
- **Current:** Node environment (not React Native)
- **Impact:** No component rendering tests
- **Note:** Services and utilities only

## Technical Considerations

### 1. No Global State Management
- Simple AuthContext for auth state
- No Redux/Zustand/Jotai
- OK for current app complexity

### 2. No API Error Boundaries
- Errors logged to console
- No global error handling UI

### 3. Session Management
- Supabase handles token refresh
- Uses AsyncStorage for persistence
- `detectSessionInUrl: false` (mobile-only)

## Security Notes

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Verify policies in migrations

### Environment Variables
- Never commit `.env` file
- Use `.env.example` for template
- Anon key is public (RLS protects data)

## Performance Considerations

### Image Handling
- Use `expo-image-manipulator` for resizing
- Consider lazy loading for photo gallery
- Large images may impact memory

### List Rendering
- Consider FlatList for large lists
- Current screens may need optimization

## Future Considerations

### Phase 2 (AI Features)
- Plant identification (Claude Vision)
- Pest detection
- Photo-driven task generation

### State Management
- May need global state for:
  - Theme/preferences
  - Cached data
  - Offline support

### Offline Support
- Currently online-only
- Consider AsyncStorage cache
- Supabase offline-first patterns

## Development Notes

### TypeScript Strict Mode
- All strict checks enabled
- May need `// @ts-ignore` for some Expo modules
- Keep type definitions up-to-date

### Supabase Schema Changes
- Run migrations in order
- Check RLS policies after changes
- Update TypeScript types to match
