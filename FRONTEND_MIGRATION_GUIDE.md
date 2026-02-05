# Frontend Migration Guide - Judge Profile Architecture

## Overview

The backend has been updated to support **judge profiles**. This means:
- One user account can have multiple named "judge profiles" per event
- Each device selects a specific judge profile (e.g., "Dr. Smith", "Prof. Chen")
- All scoring is tied to the judge profile ID, not the user account ID

## What Changed in the API

### 1. Type Changes

#### User Type
```typescript
// OLD
interface User {
    id: string;
    netid: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

// NEW
interface User {
    id: string;
    email: string;
    name: string;  // Full name, not first_name/last_name
    role: 'admin' | 'moderator' | 'judge';
    created_at: string;
    updated_at: string;
}
```

#### New JudgeProfile Type
```typescript
interface JudgeProfile {
    id: string;          // This is what you use for scoring
    event_id: string;
    user_id: string;     // References the shared user account
    name: string;        // "Dr. Smith", "Prof. Chen", etc.
    assigned_at: string;
}
```

#### ScoreSubmission Changes
```typescript
// OLD
interface ScoreSubmission {
    eventId: string;
    teamId: string;
    scores: Array<{
        criteriaId: string;  // ← old name
        score: number;
    }>;
    // ...
}

// NEW
interface ScoreSubmission {
    eventId: string;
    teamId: string;
    judgeId: string;  // ← REQUIRED: Judge profile ID
    scores: Array<{
        criterionId: string;  // ← renamed to match backend
        score: number;
    }>;
    // ...
}
```

### 2. API Function Changes

#### Authentication
```typescript
// OLD
logout(): Promise<{ message: string }>

// NEW
logout(judgeId?: string): Promise<{ message: string }>

// NEW FUNCTIONS
getJudgeProfiles(eventId: string): Promise<{ profiles: JudgeProfile[] }>
startJudgeSession(judgeId: string, eventId: string): Promise<{ sessionId: string }>
```

#### Events
```typescript
// OLD
getEventTeams(eventId: string, activeOnly?: boolean)

// NEW
getEventTeams(eventId: string, options?: { 
    activeOnly?: boolean; 
    judgeId?: string  // ← Filter by judge's scoring status
})

// OLD
getMyProgress(eventId: string)

// NEW
getMyProgress(eventId: string, judgeId: string)  // ← Requires judgeId
```

#### Scores
```typescript
// OLD
getRubric(): Promise<RubricResponse>

// NEW
getRubric(eventId: string): Promise<RubricResponse>

// OLD
submitHeartbeat(data: { eventId: string })

// NEW
submitHeartbeat(eventId: string, judgeId: string)  // ← Requires judgeId
```

## Judge Profile Context Helper

A new utility module has been created: `lib/judge-context.ts`

### Usage Examples

```typescript
import {
    setJudgeProfile,
    getJudgeProfile,
    getJudgeId,
    clearJudgeProfile,
    hasJudgeProfile
} from '@/lib/judge-context';

// After user selects their judge profile
const profile = await getJudgeProfiles(eventId);
const selectedProfile = profile.profiles[0];
setJudgeProfile(selectedProfile);

// When making API calls that need judgeId
const judgeId = getJudgeId();
if (judgeId) {
    await submitScore({
        eventId,
        teamId,
        judgeId,  // ← From context
        scores: [...]
    });
}

// On logout
const judgeId = getJudgeId();
await logout(judgeId);
clearJudgeProfile();
```

## Screen-by-Screen Migration Checklist

### ✅ Screens That Need Updates

#### 1. **Login/Authentication Flow**
- [ ] After login, if user role is 'judge', fetch judge profiles
- [ ] Show judge profile selection screen
- [ ] Store selected profile using `setJudgeProfile()`
- [ ] Start judge session with `startJudgeSession()`

#### 2. **Judge Selection Screen** (NEW)
- [ ] Create new screen for selecting judge profile
- [ ] Display available profiles for the event
- [ ] Allow user to select their profile
- [ ] Store selection in localStorage

#### 3. **Team Detail/Scoring Screen**
- [ ] Get `judgeId` from `getJudgeId()`
- [ ] Include `judgeId` in `submitScore()` call
- [ ] Change `criteriaId` to `criterionId` in score objects
- [ ] Update heartbeat calls to include `judgeId`

#### 4. **Team List Screen** (Judge View)
- [ ] Pass `judgeId` to `getEventTeams()` to get accurate `has_scored` status
- [ ] Filter shows only teams this judge hasn't scored

#### 5. **Judge Progress Screen**
- [ ] Pass `judgeId` to `getMyProgress()`
- [ ] Display progress for this specific judge profile

#### 6. **Logout Flow**
- [ ] Get `judgeId` from context before logout
- [ ] Pass to `logout(judgeId)`
- [ ] Call `clearJudgeProfile()` after logout

#### 7. **Moderator Screen**
- [ ] Update to show judge profile names (not user names)
- [ ] Display which judge profiles have scored each team

### ✅ Screens That DON'T Need Updates

- **Event List Screen** - No changes needed
- **Event Detail Screen** - No changes needed (unless showing judge info)
- **Leaderboard Screen** - No changes needed (backend handles aggregation)
- **Admin Screens** - Minimal changes (user.name instead of user.first_name/last_name)

## Common Patterns

### Pattern 1: Getting Judge ID Before API Calls
```typescript
import { getJudgeId } from '@/lib/judge-context';

function MyComponent() {
    const handleSubmit = async () => {
        const judgeId = getJudgeId();
        if (!judgeId) {
            // Redirect to judge selection or show error
            return;
        }
        
        await submitScore({
            eventId,
            teamId,
            judgeId,  // ← Always include this
            scores: [...],
        });
    };
}
```

### Pattern 2: Protecting Judge Routes
```typescript
import { hasJudgeProfile } from '@/lib/judge-context';

function JudgeScreen() {
    useEffect(() => {
        if (!hasJudgeProfile()) {
            // Redirect to judge selection screen
            router.push('/judge-selection');
        }
    }, []);
}
```

### Pattern 3: Displaying Judge Info
```typescript
import { getJudgeName } from '@/lib/judge-context';

function Header() {
    const judgeName = getJudgeName();
    
    return (
        <div>
            {judgeName && <span>Judging as: {judgeName}</span>}
        </div>
    );
}
```

## Testing the Migration

### 1. Admin Flow
```bash
# Initialize database with new schema
POST /admin/init-schema

# Seed test data (includes judge profiles)
POST /admin/seed-data
```

### 2. Judge Flow
```typescript
// 1. Login (gets user account)
const { user } = await getCurrentUser();

// 2. Get judge profiles for event
const { profiles } = await getJudgeProfiles(eventId);
// Returns: [
//   { id: 'prof-1', name: 'Dr. Smith', ... },
//   { id: 'prof-2', name: 'Prof. Chen', ... }
// ]

// 3. Select profile
setJudgeProfile(profiles[0]);  // Select "Dr. Smith"

// 4. Start session
await startJudgeSession(profiles[0].id, eventId);

// 5. Score teams
await submitScore({
    eventId,
    teamId,
    judgeId: profiles[0].id,  // ← "Dr. Smith" profile
    scores: [...]
});

// 6. Check progress
const progress = await getMyProgress(eventId, profiles[0].id);

// 7. Logout
await logout(profiles[0].id);
clearJudgeProfile();
```

## Backend Seeded Test Data

After running `/admin/seed-data`, you'll have:

**Shared Judge Account:**
- Email: `judges@event.com`
- Password: `password123`
- Role: `judge`

**Judge Profiles for Event:**
1. "Dr. Alice Johnson" (Computer Science)
2. "Prof. Bob Smith" (Engineering)  
3. "Dr. Carol Williams" (Business)

Each device can login with `judges@event.com`, then select which profile to use.

## Breaking Changes Summary

| What | Old | New |
|------|-----|-----|
| User name | `user.first_name + user.last_name` | `user.name` |
| User netId | `user.netid` | Not available |
| Score submission | No `judgeId` | **Requires `judgeId`** |
| Score criterion field | `criteriaId` | `criterionId` |
| Get teams (judge) | `getEventTeams(id)` | `getEventTeams(id, { judgeId })` |
| Get progress | `getMyProgress(eventId)` | `getMyProgress(eventId, judgeId)` |
| Heartbeat | `submitHeartbeat({ eventId })` | `submitHeartbeat(eventId, judgeId)` |
| Logout | `logout()` | `logout(judgeId)` |
| Get rubric | `getRubric()` | `getRubric(eventId)` |

## FAQ

### Q: What if I don't include `judgeId` in score submission?
**A:** The backend will return a 400 error. The `judgeId` is required and validated.

### Q: Can I use `user.id` instead of judge profile ID?
**A:** No! You must use the judge profile ID from `event_judges` table. Using `user.id` will cause validation errors.

### Q: What happens if I lose the stored judge profile?
**A:** The user will need to select their profile again from the judge selection screen.

### Q: Can one user be both admin and judge?
**A:** Yes, but when acting as a judge, they must select a judge profile. The role determines available features.

### Q: How do I test with multiple judge profiles?
**A:** Use different browsers/incognito windows, all logged in with `judges@event.com`, but select different profiles in each window.

---

**Next Steps:**
1. Review this guide
2. Start with judge-selection-screen (NEW)
3. Update team-detail-screen (scoring)
4. Update other screens as needed
5. Test the full judge flow

**Last Updated:** February 5, 2026
