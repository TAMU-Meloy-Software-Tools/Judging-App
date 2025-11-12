# Components Structure

This directory contains all React components organized by feature/screen type.

**Philosophy:** Build the complete feature set first (admin view shows everything). Add role-based access control later when connecting the backend.

## Directory Structure

```
components/
├── authentication/          # Login, Signup, Auth flows
│   └── login-screen.tsx
│
├── dashboard/              # Main event listing
│   └── dashboard-screen.tsx
│
├── events/                 # Event screens (detail, leaderboard, creation, management)
│   ├── event-detail-screen.tsx
│   └── leaderboard-screen.tsx
│
├── judging/               # Team judging interface
│   └── team-detail-screen.tsx
│
├── management/            # System management (admin panel, moderator, users)
│   └── admin-screen.tsx
│
├── settings/              # User settings
│   └── settings-screen.tsx
│
└── ui/                    # Reusable UI components (shadcn/ui)
    └── ... (all UI primitives)
```

## Feature Categories

### 🔐 Authentication (`/authentication`)
Entry point for all users.
- Login/Signup combined screen
- Future: Password reset, email verification

**Flow:** First screen → Gateway to app

---

### 📊 Dashboard (`/dashboard`)
Main event listing after login.
- Shows all events (past, active, upcoming)
- Navigation to admin, settings
- Later: Role-based filtering of which events users can see

**Flow:** Post-login → Central hub

---

### 🎯 Events (`/events`)
All event-related screens.
- **Event Detail** - View teams, stats, info for a specific event
- **Leaderboard** - Rankings and scores
- Future: **Event Creation**, **Event Manager** (edit event)

**Flow:** Dashboard → Select event → Event screens

---

### ⚖️ Judging (`/judging`)
Team scoring interface.
- **Team Detail** - Rubric-based judging interface
- Future: **Judge Summary** (personal history), **Final Summary** (all judges)

**Flow:** Event detail → Select team → Judge/score

---

### 🛠️ Management (`/management`)
System administration.
- **Admin Screen** - Manage events, judges, users
- Future: **Moderator Panel** (event flow control), **User Management**

**Flow:** Dashboard → Admin panel → Management

---

### ⚙️ Settings (`/settings`)
User account management.
- Profile, security, account settings
- Available to all users

**Flow:** Any screen → Settings

---

### 🎨 UI (`/ui`)
Reusable design system components (shadcn/ui).
- Used by all screens
- No business logic

---

## Naming Conventions

- **Screen components:** `*-screen.tsx` (e.g., `login-screen.tsx`)
- **Feature components:** `*-[feature].tsx` (e.g., `event-card.tsx`)
- **UI components:** `[component].tsx` (e.g., `button.tsx`)
- **All exports:** Named exports (e.g., `export function LoginScreen() {}`)

## Import Patterns

```typescript
// Import screens from their feature folders
import { LoginScreen } from "@/components/authentication/login-screen"
import { DashboardScreen } from "@/components/dashboard/dashboard-screen"
import { EventDetailScreen } from "@/components/events/event-detail-screen"

// Import UI components from ui folder
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

## Future Screens (Same Structure)

When adding new features, keep them in the appropriate category:

### `/authentication`
- ✅ `login-screen.tsx`
- 🔜 `forgot-password-screen.tsx`
- 🔜 `email-verification-screen.tsx`

### `/dashboard`
- ✅ `dashboard-screen.tsx`
- 🔜 `judge-selection-screen.tsx` (when judge logs in, select profile)

### `/events`
- ✅ `event-detail-screen.tsx`
- ✅ `leaderboard-screen.tsx`
- 🔜 `event-creation-screen.tsx` (full-page form to create event)
- 🔜 `event-manager-screen.tsx` (edit existing event)

### `/judging`
- ✅ `team-detail-screen.tsx`
- 🔜 `judge-summary-screen.tsx` (my scoring history)
- 🔜 `final-summary-screen.tsx` (all judges, with charts)

### `/management`
- ✅ `admin-screen.tsx`
- 🔜 `moderator-panel-screen.tsx` (control event flow, activate teams)
- 🔜 `users-management-screen.tsx` (promote users, assign judge profiles)

### `/settings`
- ✅ `settings-screen.tsx`

## Role-Based Access (Later)

When connecting backend, add conditional rendering:

```typescript
// Show admin panel button only to admins
{user.role === 'admin' && (
  <Button onClick={() => navigate('/admin')}>
    Admin Panel
  </Button>
)}

// Filter events based on user's assignments
const visibleEvents = user.role === 'admin' 
  ? allEvents 
  : allEvents.filter(e => user.assignedEvents.includes(e.id))

// Show moderator panel only to admins
{user.role === 'admin' && <ModeratorPanelTab />}
```

**Key Point:** Build all features now (admin sees everything). Add `if (user.role === ...)` checks later.

---

## Design Principles

1. **Feature-based:** Group by what the screen does, not who uses it
2. **Workflow-aligned:** Structure mirrors user journey through the app
3. **Scalable:** Easy to add new screens within existing categories
4. **Clear imports:** Obvious where to find components
5. **Maintainable:** Related functionality stays together
