# Sprint 6 Workflow - TDD + Live Documentation
**Neuer Entwicklungs-Workflow mit Tests-First + Live-Docs**

---

## 📅 SPRINT 6: KI-Integration Phase 2 (Claude Vision)

### Feature: Photo Analysis mit Claude Vision API
```
User: Foto hochladen
  ↓
Claude: Analysiert Bild (Pflanze? Schädling? Krankheit?)
  ↓
App: Speichert Analyse
  ↓
Auto: Erstellt Task basierend auf Analyse
```

---

## 🎯 DAY-BY-DAY PLAN

### DAY 1: PLANNING + TESTING (2 hours)

#### 08:00 - Sprint Start (15 min)
```bash
✅ SPRINT-START-CHECKLIST.md ausfüllen
  - Feature: Photo Analysis with Claude
  - Description: Upload photo → AI analyzes → Task created
  - AC1: Analysis saved to db
  - AC2: Task auto-created if issue found
  - AC3: Web & Mobile both work

✅ Schema Planning (5 min)
  - Tabelle: photos (already has ai_analysis column!)
  - Tabelle: tasks (create if not exists)
  - Junction: tasks_plants (if needed)

✅ Web-Compat Check (4 min)
  - Files? JA → blob:// handling needed
  - API calls? JA → test on web
  - Credentials? JA → .env setup needed

✅ Code Reuse (3 min)
  - Similar: photoService (upload)
  - Similar: shoppingService (task creation)
  - Similar: taskService (NEW - copy from shopping?)
```

#### 08:45 - SCHEMA-CHECKLIST.md (20 min)
```markdown
# Schema Checklist: Photo Analysis

## Tables
- photos: ALREADY EXISTS ✅
  - ai_analysis (jsonb) - ALREADY EXISTS ✅
- tasks: EXISTS ✅
  - description, plant_id, priority, created_at, completed_at
- tasks_plants: CHECK IF EXISTS

## RLS Policies
SELECT: auth.uid() = user_id ✅ (already set)
INSERT: auth.uid() = user_id ✅ (already set)

## Service Functions Needed
- analyzePhotoWithClaude(imageUri): Promise<{plant?, issue?, action?}>
- saveAnalysisToPhoto(photoId, analysis)
- createTaskFromAnalysis(analysis, plantId)

## Error Cases
- Foto zu groß? → compress first
- Claude API down? → fallback (manual entry)
- Invalid response? → try-catch + log
- Web credentials? → .env PUBLIC_CLAUDE_API_KEY?
```

#### 09:05 - Create Documentation Skeleton (15 min)
**File:** `src/services/__docs__/claudeService.md`

```markdown
# Feature: Claude Vision Photo Analysis

## Overview
Purpose: AI-powered plant disease detection and issue identification
User Story: As a gardener, I upload a photo and get AI analysis of what's wrong

## Architecture
```
Photo Upload (already done)
  ↓
Claude Vision API Call
  ↓
Parse Analysis JSON
  ↓
Save to photos.ai_analysis
  ↓
Auto-create Task if issue detected
  ↓
Update UI with results
```

## Service Functions
- [ ] analyzePhotoWithClaude(uri)
- [ ] saveAnalysisToPhoto(photoId, analysis)
- [ ] createTaskFromAnalysis(analysis, plantId)

## Gotchas
- [ ] Web: Need public API key (not secure! Phase 2 only!)
- [ ] blob URIs: Must convert to base64 for API
- [ ] Rate limiting: Claude API has usage limits
- [ ] Errors: API down → graceful fallback

## Testing
- [ ] Mock Claude API response
- [ ] Test JSON parsing
- [ ] Test task creation
- [ ] Web: credential handling

## Gotcha - API Key on Web
⚠️ CRITICAL: Don't put private key on web!
Temporary solution for Phase 2:
1. Ask user to paste API key on first use
2. Store in localStorage (not production!)
3. Phase 3: Use backend proxy
```

#### 09:20 - Write Tests (40 min)

**File:** `src/services/__tests__/claudeService.test.ts`

```typescript
import { analyzePhotoWithClaude, saveAnalysisToPhoto } from '../claudeService';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase');
jest.mock('../../lib/claude', () => ({
  analyzeImage: jest.fn()
}));

describe('claudeService', () => {
  describe('analyzePhotoWithClaude', () => {
    // TEST 1: Happy path
    it('should analyze image and return plant + issue', async () => {
      const mockResponse = {
        plant: 'Tomato',
        issue: 'Early Blight',
        severity: 'high',
        recommendation: 'Remove affected leaves, apply fungicide'
      };

      const result = await analyzePhotoWithClaude('blob:http://...');

      expect(result).toEqual(mockResponse);
      expect(result.plant).toBeDefined();
      expect(result.issue).toBeDefined();
    });

    // TEST 2: No issue detected
    it('should return null if no issue found', async () => {
      const mockResponse = {
        plant: 'Basil',
        issue: null, // Healthy!
        severity: null,
        recommendation: 'Plant looks healthy!'
      };

      const result = await analyzePhotoWithClaude('blob:http://...');
      expect(result.issue).toBeNull();
    });

    // TEST 3: Error handling
    it('should throw error if Claude API fails', async () => {
      // Mock API error
      await expect(analyzePhotoWithClaude('blob:http://...'))
        .rejects.toThrow('Claude API error');
    });

    // TEST 4: Web compatibility
    it('should handle blob URI', async () => {
      const result = await analyzePhotoWithClaude('blob:http://localhost/abc123');
      expect(result).toBeDefined();
    });

    // TEST 5: Rate limiting
    it('should handle rate limit error gracefully', async () => {
      // Mock rate limit response
      await expect(analyzePhotoWithClaude('blob:http://...'))
        .rejects.toThrow('Rate limited');
    });
  });

  describe('saveAnalysisToPhoto', () => {
    it('should save analysis to photos.ai_analysis column', async () => {
      const analysis = { plant: 'Tomato', issue: 'Blight' };
      await saveAnalysisToPhoto('photo-123', analysis);

      expect(mockSupabase.from('photos').update)
        .toHaveBeenCalledWith({ ai_analysis: analysis });
    });

    it('should throw if photo not found', async () => {
      await expect(saveAnalysisToPhoto('nonexistent', {}))
        .rejects.toThrow();
    });
  });

  describe('createTaskFromAnalysis', () => {
    it('should create task if issue detected', async () => {
      const analysis = {
        plant: 'Rose',
        issue: 'Powdery Mildew',
        recommendation: 'Apply fungicide'
      };

      await createTaskFromAnalysis(analysis, 'plant-123');

      expect(mockSupabase.from('tasks').insert)
        .toHaveBeenCalledWith(expect.objectContaining({
          description: 'Rose: Powdery Mildew - Apply fungicide',
          plant_id: 'plant-123',
          priority: 'high'
        }));
    });

    it('should NOT create task if no issue', async () => {
      const analysis = { plant: 'Basil', issue: null };

      await createTaskFromAnalysis(analysis, 'plant-123');

      expect(mockSupabase.from('tasks').insert).not.toHaveBeenCalled();
    });
  });
});
```

**Run tests (they will FAIL):**
```bash
npm test -- claudeService.test.ts

# Output:
# ✕ analyzePhotoWithClaude should analyze image
# ✕ analyzePhotoWithClaude should return null
# ... (10 failing)
```

---

### DAY 2-3: IMPLEMENTATION + LIVE DOCS (4 hours)

#### 09:00 - Implement & Update Docs

**File:** `src/services/claudeService.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../lib/supabase';

const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_CLAUDE_API_KEY // ⚠️ Temporary for Phase 2!
});

/**
 * Analyzes a plant photo using Claude Vision
 * @param imageUri - blob:// or file:// URI
 * @returns Analysis with plant name, issue, severity, recommendation
 */
export async function analyzePhotoWithClaude(imageUri: string) {
  try {
    // Convert image URI to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];

          // Call Claude Vision
          const result = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'image/jpeg',
                      data: base64
                    }
                  },
                  {
                    type: 'text',
                    text: `Analyze this garden plant photo and return JSON:
                    {
                      "plant": "plant name or null",
                      "issue": "disease/pest or null",
                      "severity": "low|medium|high or null",
                      "recommendation": "action to take or 'looks healthy'"
                    }`
                  }
                ]
              }
            ]
          });

          // Parse response
          const content = result.content[0];
          if (content.type !== 'text') throw new Error('Unexpected response type');

          const jsonMatch = content.text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('Could not parse Claude response');

          const analysis = JSON.parse(jsonMatch[0]);
          resolve(analysis);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.error('Analysis failed:', error);
    throw new Error(`Claude Vision failed: ${error.message}`);
  }
}

/**
 * Saves analysis to photos table
 */
export async function saveAnalysisToPhoto(
  photoId: string,
  analysis: any
): Promise<void> {
  const { error } = await supabase
    .from('photos')
    .update({ ai_analysis: analysis })
    .eq('id', photoId);

  if (error) throw error;
}

/**
 * Creates task from analysis if issue detected
 */
export async function createTaskFromAnalysis(
  analysis: any,
  plantId: string
): Promise<void> {
  if (!analysis.issue) return; // No issue = no task

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      plant_id: plantId,
      description: `${analysis.plant}: ${analysis.issue} - ${analysis.recommendation}`,
      priority: analysis.severity === 'high' ? 'high' : 'medium',
      status: 'open'
    });

  if (error) throw error;
}
```

**UPDATE DOCS:** While coding!
```markdown
Implementation Notes:
- Convert blob to base64 for Claude API
- Use claude-3-5-sonnet model
- Parse JSON from text response
- Only create task if issue != null

Gotcha Found!
⚠️ Base64 conversion needs FileReader on web
   (file:// URIs on native are different)
```

#### 10:30 - Run Tests (should be GREEN now!)
```bash
npm test -- claudeService.test.ts

# ✓ analyzePhotoWithClaude should analyze
# ✓ analyzePhotoWithClaude should return null if no issue
# ✓ analyzePhotoWithClaude should handle error
# ✓ analyzePhotoWithClaude should handle blob URI
# ✓ saveAnalysisToPhoto should save analysis
# ✓ createTaskFromAnalysis should create task
# ✓ createTaskFromAnalysis should NOT create if no issue
# ... (all green!)

TESTS PASSED ✅
```

#### 11:00 - UI Integration (30 min)
```typescript
// PhotoDetailScreen.tsx - Update to show analysis

const [analysis, setAnalysis] = useState<any>(null);
const [analyzing, setAnalyzing] = useState(false);

const handleAnalyzePhoto = async () => {
  setAnalyzing(true);
  try {
    const result = await analyzePhotoWithClaude(photo.photo_url);
    await saveAnalysisToPhoto(photo.id, result);
    await createTaskFromAnalysis(result, plantId);
    setAnalysis(result);
    Alert.alert('Analysis Complete!', `${result.plant}: ${result.issue || 'Healthy'}`);
  } catch (error: any) {
    Alert.alert('Analysis Failed', error.message);
  } finally {
    setAnalyzing(false);
  }
};

// UI to show results
{analysis && (
  <View style={styles.analysisCard}>
    <Text style={styles.plant}>{analysis.plant}</Text>
    {analysis.issue && (
      <>
        <Text style={styles.issue}>{analysis.issue}</Text>
        <Text style={styles.recommendation}>{analysis.recommendation}</Text>
      </>
    )}
  </View>
)}
```

---

### DAY 4: WEB-TESTING (1 hour)

#### 14:00 - EOD Web Build Test
```bash
npm start --web

# Test:
- [ ] Upload photo
- [ ] Click "Analyze"
- [ ] See Claude response
- [ ] Task created in list?
```

**UPDATE DOCS:** Any web-specific issues found?
```markdown
## Web-Testing Results (Day 4)
✅ Image upload works
✅ Claude API call works
✅ Base64 conversion works
⚠️ Found: API key exposure (temp solution okay for Phase 2)
```

---

### DAY 5: MOBILE-TESTING + FINAL (1 hour)

#### 14:00 - Mobile Test
```bash
# Test on Expo Go
- [ ] Same flow on native
- [ ] Performance OK?
- [ ] Network errors handled?
```

#### 15:00 - Final Polish
```bash
# Update MEMORY.md with new pattern
# Final doc review (doc should be 95% done!)
# Cost check: Should be $0.60-0.80
# All tests green? ✅
```

---

## 📊 EXPECTED RESULTS

### Code Metrics
- Service functions: 3 (analyze, save, createTask)
- Test cases: 10+ (all passing)
- Coverage: >85%
- Lines of code: ~150

### Documentation
- ✅ Overview & Architecture
- ✅ All functions documented
- ✅ Gotchas & warnings
- ✅ Testing guide
- ✅ Debugging guide
- ✅ Examples & workflows

### Time Breakdown
```
Day 1: Planning + Testing skeleton (2 hours)
Day 2-3: Implementation + Live Docs (4 hours)
Day 4: Web-Testing + UI (1 hour)
Day 5: Mobile + Polish (1 hour)
TOTAL: 8 hours (vs 10-12 without TDD)

✅ SAVES: 2-4 hours!
```

### Cost
```
Expected: $0.60-0.80 (vs $1.50-2.00 without TDD)
✅ SAVES: 60-70% cost!
```

---

## ✅ DEFINITION OF DONE

- [ ] All tests passing (green)
- [ ] Coverage > 80%
- [ ] Code reviewed by TDD template
- [ ] Documentation complete (Live Docs)
- [ ] Web-tested (Day 4)
- [ ] Mobile-tested (Day 5)
- [ ] MEMORY.md updated with new pattern
- [ ] Cost tracked < $1.00

---

## 🚀 SPRINT 6 STATUS

**Goal:** Implement Claude Vision Analysis with TDD + Live Docs
**Timeline:** 5 days (optimized)
**Cost:** $0.60-0.80
**Quality:** 100% test coverage + complete documentation

**Ready?** 🎯
