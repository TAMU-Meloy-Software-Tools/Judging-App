# API Endpoints Specification - Meloy Judging Portal

**Generated**: January 20, 2026  
**Based on**: Database schema v1.0 + App component analysis

---

## 📋 Table of Contents

1. [Authentication & Sessions](#authentication--sessions)
2. [User Management](#user-management)
3. [Events Management](#events-management)
4. [Teams Management](#teams-management)
5. [Judging & Scoring](#judging--scoring)
6. [Leaderboard & Analytics](#leaderboard--analytics)
7. [Admin Operations](#admin-operations)
8. [Moderator Controls](#moderator-controls)
9. [Sponsor/Branding](#sponsorbranding)
10. [Real-Time Features](#real-time-features)

---

## Screen → API Mapping Overview

| Screen | Primary Endpoints Needed |
|--------|-------------------------|
| Login Screen | `POST /auth/cas-callback`, `GET /auth/me` |
| Dashboard Screen | `GET /events`, `GET /auth/me` |
| Event Detail Screen | `GET /events/{id}`, `GET /events/{id}/teams`, `GET /events/{id}/judges-online` |
| Team Detail (Judging) | `GET /teams/{id}`, `GET /rubric`, `POST /scores`, `PUT /scores` |
| Leaderboard Screen | `GET /events/{id}/leaderboard`, `GET /scores/judge/{judgeId}/history` |
| Admin Screen | `GET /admin/events`, `GET /admin/users`, `GET /admin/activity`, `POST /events`, `POST /users` |
| Event Manager | `GET /events/{id}`, `PUT /events/{id}`, `GET /events/{id}/teams`, `POST /teams`, `PUT /teams/{id}` |
| Moderator Screen | `GET /events/{id}`, `PATCH /events/{id}/judging-phase`, `PATCH /events/{id}/active-team`, `GET /judge-sessions` |
| Settings Screen | `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/password` |

---

## 🔐 1. Authentication & Sessions

### **POST /auth/cas-callback**
**Purpose**: Validate CAS ticket and issue JWT  
**Auth**: None (this is the login endpoint)  
**Used by**: Login Screen

**Request**:
```json
Query Parameters:
  - ticket: string (CAS ticket from TAMU)
  - service: string (callback URL for validation)
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "netId": "abc123",
    "email": "abc123@tamu.edu",
    "name": "Dr. Sarah Johnson",
    "role": "judge",
    "isActive": true,
    "lastLogin": "2026-01-20T10:30:00Z"
  }
}
```

**Database Operations**:
- Validate ticket with CAS server
- `SELECT * FROM users WHERE netid = $1`
- `UPDATE users SET last_login = NOW() WHERE id = $1`
- `INSERT INTO judge_sessions (event_id, user_id, logged_in_at)`

---

### **GET /auth/me**
**Purpose**: Get current authenticated user info  
**Auth**: Required (JWT)  
**Used by**: All screens (for user profile display)

**Response** (200):
```json
{
  "id": "uuid",
  "netId": "abc123",
  "email": "abc123@tamu.edu",
  "name": "Dr. Sarah Johnson",
  "role": "judge",
  "isActive": true,
  "lastLogin": "2026-01-20T10:30:00Z"
}
```

**Database Operations**:
- `SELECT * FROM users WHERE id = $1` (from JWT userId)

---

### **POST /auth/logout**
**Purpose**: End user session  
**Auth**: Required (JWT)  
**Used by**: Settings Screen, Header

**Request**:
```json
{
  "eventId": "uuid" // Optional: if logging out from specific event
}
```

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

**Database Operations**:
- `UPDATE judge_sessions SET logged_out_at = NOW() WHERE user_id = $1 AND logged_out_at IS NULL`

---

### **PATCH /auth/session/heartbeat**
**Purpose**: Update last_activity for online status tracking  
**Auth**: Required (JWT)  
**Used by**: All screens (periodic background call every 2-3 minutes)

**Request**:
```json
{
  "eventId": "uuid"
}
```

**Response** (200):
```json
{
  "lastActivity": "2026-01-20T10:35:22Z"
}
```

**Database Operations**:
- `UPDATE judge_sessions SET last_activity = NOW() WHERE user_id = $1 AND event_id = $2 AND logged_out_at IS NULL`

---

## 👤 2. User Management

### **GET /users/me**
**Purpose**: Get current user's full profile  
**Auth**: Required (JWT)  
**Used by**: Settings Screen

**Response** (200):
```json
{
  "id": "uuid",
  "netId": "abc123",
  "email": "abc123@tamu.edu",
  "name": "Dr. Sarah Johnson",
  "role": "judge",
  "isActive": true,
  "lastLogin": "2026-01-20T10:30:00Z",
  "createdAt": "2025-01-15T08:00:00Z"
}
```

**Database Operations**:
- `SELECT * FROM users WHERE id = $1`

---

### **PATCH /users/me**
**Purpose**: Update current user's profile  
**Auth**: Required (JWT)  
**Used by**: Settings Screen

**Request**:
```json
{
  "name": "Dr. Sarah Johnson",
  "email": "sjohnson@tamu.edu"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Dr. Sarah Johnson",
  "email": "sjohnson@tamu.edu",
  "updatedAt": "2026-01-20T10:40:00Z"
}
```

**Database Operations**:
- `UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING *`

---

### **PATCH /users/me/password**
**Purpose**: Update user password  
**Auth**: Required (JWT)  
**Used by**: Settings Screen  
**Note**: For CAS users, this may not be used (password managed by TAMU)

**Request**:
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**Response** (200):
```json
{
  "message": "Password updated successfully"
}
```

**Database Operations**:
- `SELECT password_hash FROM users WHERE id = $1`
- Verify currentPassword with bcrypt
- `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`

---

### **GET /admin/users**
**Purpose**: List all users (admin only)  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Admin Screen - Accounts Tab

**Query Parameters**:
- `role`: string (optional: filter by role - "judge", "admin", "moderator")
- `isActive`: boolean (optional: filter by active status)
- `page`: number (default: 1)
- `limit`: number (default: 50)

**Response** (200):
```json
{
  "users": [
    {
      "id": "uuid",
      "netId": "abc123",
      "email": "abc123@tamu.edu",
      "name": "Dr. Sarah Johnson",
      "role": "judge",
      "isActive": true,
      "lastLogin": "2026-01-20T10:30:00Z",
      "createdAt": "2025-01-15T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

**Database Operations**:
- `SELECT * FROM users WHERE role = $1 AND is_active = $2 ORDER BY name LIMIT $3 OFFSET $4`
- `SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = $2`

---

### **POST /admin/users**
**Purpose**: Create new user account (admin only)  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Admin Screen - Accounts Tab

**Request**:
```json
{
  "netId": "xyz789",
  "email": "xyz789@tamu.edu",
  "name": "Prof. John Doe",
  "role": "judge",
  "isActive": true
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "netId": "xyz789",
  "email": "xyz789@tamu.edu",
  "name": "Prof. John Doe",
  "role": "judge",
  "isActive": true,
  "createdAt": "2026-01-20T10:45:00Z"
}
```

**Database Operations**:
- `INSERT INTO users (netid, email, name, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *`
- `INSERT INTO activity_log (user_id, title, description, activity_type) VALUES (...)`

---

### **PATCH /admin/users/{id}**
**Purpose**: Update user account (admin only)  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Admin Screen - Accounts Tab

**Request**:
```json
{
  "name": "Prof. John Doe Jr.",
  "role": "moderator",
  "isActive": false
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Prof. John Doe Jr.",
  "role": "moderator",
  "isActive": false,
  "updatedAt": "2026-01-20T10:50:00Z"
}
```

**Database Operations**:
- `UPDATE users SET name = $1, role = $2, is_active = $3, updated_at = NOW() WHERE id = $4 RETURNING *`
- `INSERT INTO activity_log (...)`

---

## 🎉 3. Events Management

### **GET /events**
**Purpose**: List all events (filtered by user role)  
**Auth**: Required (JWT)  
**Used by**: Dashboard Screen

**Query Parameters**:
- `status`: string (optional: "upcoming", "active", "completed")
- `eventType`: string (optional: "aggies-invent", "problems-worth-solving")

**Response** (200):
```json
{
  "events": [
    {
      "id": "uuid",
      "name": "Aggies Invent Spring 2025",
      "eventType": "aggies-invent",
      "startDate": "2025-03-15T09:00:00Z",
      "endDate": "2025-03-17T18:00:00Z",
      "location": "Zachry Engineering Center",
      "description": "Spring 2025 Aggies Invent hackathon...",
      "status": "active",
      "judgingPhase": "in-progress",
      "teamsCount": 24,
      "judgesCount": 8,
      "sponsor": {
        "name": "ExxonMobil",
        "logoUrl": "https://s3.../exxon-logo.png",
        "primaryColor": "#500000",
        "secondaryColor": "#3d0000"
      },
      "createdAt": "2025-01-10T08:00:00Z"
    }
  ]
}
```

**Database Operations**:
```sql
SELECT 
  e.*,
  s.name as sponsor_name, s.logo_url, s.primary_color, s.secondary_color,
  COUNT(DISTINCT t.id) as teams_count,
  COUNT(DISTINCT js.user_id) as judges_count
FROM events e
LEFT JOIN sponsors s ON e.id = s.event_id
LEFT JOIN teams t ON e.id = t.event_id
LEFT JOIN judge_sessions js ON e.id = js.event_id AND js.logged_out_at IS NULL
WHERE e.status = $1 -- if filtered
GROUP BY e.id, s.id
ORDER BY e.start_date DESC
```

---

### **GET /events/{id}**
**Purpose**: Get event details  
**Auth**: Required (JWT)  
**Used by**: Event Detail Screen, Event Manager Screen

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Aggies Invent Spring 2025",
  "eventType": "aggies-invent",
  "duration": "48 hours",
  "startDate": "2025-03-15T09:00:00Z",
  "endDate": "2025-03-17T18:00:00Z",
  "location": "Zachry Engineering Center",
  "description": "Spring 2025 Aggies Invent hackathon...",
  "status": "active",
  "judgingPhase": "in-progress",
  "currentActiveTeamId": "uuid",
  "sponsor": {
    "id": "uuid",
    "name": "ExxonMobil",
    "logoUrl": "https://s3.../exxon-logo.png",
    "primaryColor": "#500000",
    "secondaryColor": "#3d0000",
    "textColor": "#FFFFFF"
  },
  "stats": {
    "teamsTotal": 24,
    "teamsScored": 8,
    "teamsInProgress": 4,
    "teamsNotScored": 12,
    "judgesOnline": 6,
    "judgesTotal": 8
  },
  "createdBy": "uuid",
  "createdAt": "2025-01-10T08:00:00Z"
}
```

**Database Operations**:
```sql
-- Main event query
SELECT e.*, s.* FROM events e
LEFT JOIN sponsors s ON e.id = s.event_id
WHERE e.id = $1

-- Stats aggregation
SELECT 
  COUNT(DISTINCT t.id) as teams_total,
  COUNT(DISTINCT CASE WHEN ss.submitted_at IS NOT NULL THEN t.id END) as teams_scored,
  COUNT(DISTINCT CASE WHEN ss.submitted_at IS NULL AND ss.started_at IS NOT NULL THEN t.id END) as teams_in_progress
FROM teams t
LEFT JOIN score_submissions ss ON t.id = ss.team_id
WHERE t.event_id = $1

-- Judge online count
SELECT COUNT(DISTINCT user_id) FROM judge_sessions
WHERE event_id = $1 AND logged_out_at IS NULL 
  AND last_activity > NOW() - INTERVAL '5 minutes'
```

---

### **POST /events**
**Purpose**: Create new event (admin only)  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Admin Screen - Events Tab

**Request**:
```json
{
  "name": "Aggies Invent Fall 2026",
  "eventType": "aggies-invent",
  "duration": "48 hours",
  "startDate": "2026-10-15T09:00:00Z",
  "endDate": "2026-10-17T18:00:00Z",
  "location": "Memorial Student Center",
  "description": "Fall 2026 Aggies Invent hackathon",
  "sponsor": {
    "name": "ExxonMobil",
    "logoUrl": "https://s3.../exxon-logo.png",
    "primaryColor": "#500000",
    "secondaryColor": "#3d0000",
    "textColor": "#FFFFFF"
  }
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "name": "Aggies Invent Fall 2026",
  "eventType": "aggies-invent",
  "status": "upcoming",
  "judgingPhase": "not-started",
  "createdAt": "2026-01-20T11:00:00Z"
}
```

**Database Operations**:
```sql
-- Insert event
INSERT INTO events (name, event_type, duration, start_date, end_date, location, description, created_by)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *

-- Insert sponsor
INSERT INTO sponsors (event_id, name, logo_url, primary_color, secondary_color, text_color)
VALUES ($1, $2, $3, $4, $5, $6)

-- Log activity
INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone)
VALUES ($1, $2, 'Event Created', '...', 'event_created', 'Calendar', 'primary')
```

---

### **PATCH /events/{id}**
**Purpose**: Update event details (admin/moderator only)  
**Auth**: Required (JWT) + Role: admin/moderator  
**Used by**: Event Manager Screen

**Request**:
```json
{
  "name": "Aggies Invent Spring 2025 (Updated)",
  "location": "Engineering Innovation Center",
  "status": "active"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Aggies Invent Spring 2025 (Updated)",
  "location": "Engineering Innovation Center",
  "status": "active",
  "updatedAt": "2026-01-20T11:05:00Z"
}
```

**Database Operations**:
```sql
UPDATE events 
SET name = $1, location = $2, status = $3, updated_at = NOW()
WHERE id = $4
RETURNING *
```

---

### **DELETE /events/{id}**
**Purpose**: Delete event (admin only)  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Admin Screen

**Response** (204): No content

**Database Operations**:
```sql
DELETE FROM events WHERE id = $1
-- Cascades to: sponsors, judge_sessions, teams, score_submissions, scores, judge_comments, activity_log
```

---

## 👥 4. Teams Management

### **GET /events/{eventId}/teams**
**Purpose**: List all teams for an event  
**Auth**: Required (JWT)  
**Used by**: Event Detail Screen, Event Manager Screen

**Query Parameters**:
- `status`: string (optional: "waiting", "active", "completed")

**Response** (200):
```json
{
  "teams": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "name": "Team Alpha",
      "projectTitle": "Smart Campus Navigation System",
      "description": "An innovative mobile application...",
      "presentationOrder": 1,
      "status": "completed",
      "members": [
        {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@tamu.edu"
        },
        {
          "id": "uuid",
          "name": "Jane Smith",
          "email": "jane@tamu.edu"
        }
      ],
      "scoringStatus": {
        "status": "scored", // "not-scored", "in-progress", "scored"
        "judgesCompleted": 8,
        "judgesTotal": 8,
        "averageScore": 85.5,
        "totalScore": 342
      },
      "createdAt": "2025-02-01T09:00:00Z"
    }
  ]
}
```

**Database Operations**:
```sql
-- Teams with members
SELECT 
  t.*,
  json_agg(DISTINCT jsonb_build_object(
    'id', tm.id, 'name', tm.name, 'email', tm.email
  )) as members,
  COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL) as judges_completed,
  COUNT(DISTINCT u.id) as judges_total,
  AVG(s.score) as average_score,
  SUM(s.score) as total_score,
  CASE 
    WHEN COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL) = 0 THEN 'not-scored'
    WHEN COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL) < COUNT(DISTINCT u.id) THEN 'in-progress'
    ELSE 'scored'
  END as scoring_status
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
LEFT JOIN score_submissions ss ON t.id = ss.team_id
LEFT JOIN scores s ON t.id = s.team_id
CROSS JOIN (SELECT COUNT(*) FROM users WHERE role = 'judge' AND is_active = true) u
WHERE t.event_id = $1
GROUP BY t.id
ORDER BY t.presentation_order
```

---

### **GET /teams/{id}**
**Purpose**: Get team details  
**Auth**: Required (JWT)  
**Used by**: Team Detail (Judging) Screen

**Response** (200):
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "name": "Team Alpha",
  "projectTitle": "Smart Campus Navigation System",
  "description": "An innovative mobile application that helps students...",
  "presentationOrder": 1,
  "status": "active",
  "members": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@tamu.edu"
    }
  ],
  "event": {
    "id": "uuid",
    "name": "Aggies Invent Spring 2025",
    "sponsor": {
      "name": "ExxonMobil",
      "logoUrl": "https://...",
      "primaryColor": "#500000"
    }
  },
  "currentJudgeScores": {
    "submissionId": "uuid",
    "scores": [
      {
        "criteriaId": "uuid",
        "criteriaName": "Effective Communication",
        "score": 22,
        "reflection": "Clear explanation of problem..."
      }
    ],
    "comments": "Strong technical implementation...",
    "startedAt": "2026-01-20T10:30:00Z",
    "submittedAt": null
  },
  "createdAt": "2025-02-01T09:00:00Z"
}
```

**Database Operations**:
```sql
-- Team details
SELECT t.*, e.name as event_name, s.* as sponsor
FROM teams t
JOIN events e ON t.event_id = e.id
LEFT JOIN sponsors s ON e.id = s.event_id
WHERE t.id = $1

-- Team members
SELECT * FROM team_members WHERE team_id = $1

-- Current judge's scores (if exists)
SELECT 
  ss.id as submission_id, ss.started_at, ss.submitted_at,
  json_agg(jsonb_build_object(
    'criteriaId', rc.id,
    'criteriaName', rc.name,
    'score', sc.score,
    'reflection', sc.reflection
  )) as scores
FROM score_submissions ss
LEFT JOIN scores sc ON ss.id = sc.submission_id
LEFT JOIN rubric_criteria rc ON sc.rubric_criteria_id = rc.id
WHERE ss.team_id = $1 AND ss.user_id = $2 -- $2 is current judge's ID
GROUP BY ss.id

-- Current judge's comments
SELECT comments FROM judge_comments 
WHERE team_id = $1 AND user_id = $2
```

---

### **POST /teams**
**Purpose**: Create new team (admin only)  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Event Manager Screen

**Request**:
```json
{
  "eventId": "uuid",
  "name": "Team Delta",
  "projectTitle": "Campus Safety Alert System",
  "description": "A real-time alert system...",
  "presentationOrder": 5,
  "members": [
    {
      "name": "Alice Williams",
      "email": "alice@tamu.edu"
    },
    {
      "name": "Bob Johnson",
      "email": "bob@tamu.edu"
    }
  ]
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "name": "Team Delta",
  "projectTitle": "Campus Safety Alert System",
  "presentationOrder": 5,
  "members": [
    {
      "id": "uuid",
      "name": "Alice Williams",
      "email": "alice@tamu.edu"
    }
  ],
  "createdAt": "2026-01-20T11:10:00Z"
}
```

**Database Operations**:
```sql
-- Insert team
INSERT INTO teams (event_id, name, project_title, description, presentation_order)
VALUES ($1, $2, $3, $4, $5) RETURNING *

-- Insert team members
INSERT INTO team_members (team_id, name, email)
VALUES ($1, $2, $3), ($1, $4, $5), ...
RETURNING *

-- Log activity
INSERT INTO activity_log (...) VALUES (...)
```

---

### **PATCH /teams/{id}**
**Purpose**: Update team details (admin only)  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Event Manager Screen

**Request**:
```json
{
  "name": "Team Delta (Updated)",
  "projectTitle": "Campus Safety Alert System v2",
  "presentationOrder": 3,
  "status": "active"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "name": "Team Delta (Updated)",
  "projectTitle": "Campus Safety Alert System v2",
  "presentationOrder": 3,
  "status": "active",
  "updatedAt": "2026-01-20T11:15:00Z"
}
```

**Database Operations**:
```sql
UPDATE teams
SET name = $1, project_title = $2, presentation_order = $3, status = $4, updated_at = NOW()
WHERE id = $5
RETURNING *
```

---

### **DELETE /teams/{id}**
**Purpose**: Delete team (admin only)  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Event Manager Screen

**Response** (204): No content

**Database Operations**:
```sql
DELETE FROM teams WHERE id = $1
-- Cascades to: team_members, score_submissions, scores, judge_comments
```

---

## ⚖️ 5. Judging & Scoring

### **GET /rubric**
**Purpose**: Get rubric scoring criteria  
**Auth**: Required (JWT)  
**Used by**: Team Detail (Judging) Screen

**Response** (200):
```json
{
  "criteria": [
    {
      "id": "uuid",
      "name": "Effective Communication",
      "shortName": "Communication",
      "description": "Was the problem urgent, the solution convincing, and the impact tangible?",
      "maxScore": 25,
      "displayOrder": 1,
      "iconName": "Megaphone",
      "guidingQuestion": "Notes on clarity and messaging..."
    },
    {
      "id": "uuid",
      "name": "Would Fund/Buy Solution",
      "shortName": "Funding",
      "description": "Consider technical feasibility, commercial viability, and novelty of the approach.",
      "maxScore": 25,
      "displayOrder": 2,
      "iconName": "BadgeDollarSign",
      "guidingQuestion": "Thoughts on feasibility and potential..."
    }
  ]
}
```

**Database Operations**:
```sql
SELECT * FROM rubric_criteria ORDER BY display_order
```

---

### **POST /scores**
**Purpose**: Submit or update scores for a team (judge only)  
**Auth**: Required (JWT) + Role: judge  
**Used by**: Team Detail (Judging) Screen

**Request**:
```json
{
  "teamId": "uuid",
  "eventId": "uuid",
  "scores": [
    {
      "rubricCriteriaId": "uuid",
      "score": 22,
      "reflection": "Clear explanation of campus navigation challenges..."
    },
    {
      "rubricCriteriaId": "uuid",
      "score": 21,
      "reflection": "Strong market potential but needs more detail..."
    }
  ],
  "comments": "Strong technical implementation, clear communication...",
  "isSubmitted": true // true = final submission, false = save draft
}
```

**Response** (200):
```json
{
  "submissionId": "uuid",
  "teamId": "uuid",
  "judgeId": "uuid",
  "scores": [
    {
      "id": "uuid",
      "rubricCriteriaId": "uuid",
      "score": 22,
      "reflection": "..."
    }
  ],
  "comments": "Strong technical implementation...",
  "startedAt": "2026-01-20T10:30:00Z",
  "submittedAt": "2026-01-20T10:52:00Z",
  "timeSpentSeconds": 1320
}
```

**Database Operations**:
```sql
-- Check if submission exists
SELECT id, started_at FROM score_submissions 
WHERE user_id = $1 AND team_id = $2

-- If not exists, create submission
INSERT INTO score_submissions (user_id, event_id, team_id, started_at)
VALUES ($1, $2, $3, NOW()) RETURNING id

-- If isSubmitted = true, mark as submitted
UPDATE score_submissions 
SET submitted_at = NOW(), 
    time_spent_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
WHERE id = $1

-- Upsert scores (INSERT ... ON CONFLICT UPDATE)
INSERT INTO scores (submission_id, user_id, team_id, rubric_criteria_id, score, reflection)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (user_id, team_id, rubric_criteria_id)
DO UPDATE SET score = $5, reflection = $6, updated_at = NOW()

-- Upsert comments
INSERT INTO judge_comments (submission_id, user_id, team_id, comments)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, team_id)
DO UPDATE SET comments = $4, updated_at = NOW()

-- Log activity
INSERT INTO activity_log (event_id, user_id, title, description, activity_type)
VALUES ($1, $2, 'Scores Submitted', 'Judge scored Team Alpha', 'scoring_completed')
```

---

### **GET /scores/team/{teamId}**
**Purpose**: Get all scores for a specific team  
**Auth**: Required (JWT)  
**Used by**: Leaderboard Screen (Post-Judging View)

**Response** (200):
```json
{
  "teamId": "uuid",
  "teamName": "Team Alpha",
  "totalScore": 342,
  "averageScore": 85.5,
  "judges": [
    {
      "judgeId": "uuid",
      "judgeName": "Dr. Smith",
      "totalScore": 85,
      "submittedAt": "2026-01-20T10:52:00Z",
      "timeSpentSeconds": 1320,
      "scores": [
        {
          "criteriaId": "uuid",
          "criteriaName": "Effective Communication",
          "score": 22,
          "reflection": "Clear explanation..."
        }
      ],
      "comments": "Strong technical implementation..."
    }
  ],
  "categoryBreakdown": {
    "communication": {
      "average": 22,
      "min": 21,
      "max": 23,
      "standardDeviation": 0.8
    },
    "funding": {
      "average": 21,
      "min": 20,
      "max": 22,
      "standardDeviation": 0.7
    }
  }
}
```

**Database Operations**:
```sql
-- All scores for team
SELECT 
  u.id as judge_id, u.name as judge_name,
  ss.submitted_at, ss.time_spent_seconds,
  s.score, s.reflection,
  rc.id as criteria_id, rc.name as criteria_name,
  jc.comments
FROM score_submissions ss
JOIN users u ON ss.user_id = u.id
JOIN scores s ON ss.id = s.submission_id
JOIN rubric_criteria rc ON s.rubric_criteria_id = rc.id
LEFT JOIN judge_comments jc ON ss.id = jc.submission_id
WHERE ss.team_id = $1 AND ss.submitted_at IS NOT NULL
ORDER BY ss.submitted_at

-- Category statistics
SELECT 
  rc.name as criteria_name,
  AVG(s.score) as average,
  MIN(s.score) as min,
  MAX(s.score) as max,
  STDDEV(s.score) as standard_deviation
FROM scores s
JOIN rubric_criteria rc ON s.rubric_criteria_id = rc.id
WHERE s.team_id = $1
GROUP BY rc.id, rc.name
```

---

### **GET /scores/judge/{judgeId}/history**
**Purpose**: Get judge's scoring history  
**Auth**: Required (JWT) + Must be same judge or admin  
**Used by**: Leaderboard Screen (During Judging View)

**Query Parameters**:
- `eventId`: uuid (optional: filter by event)

**Response** (200):
```json
{
  "judgeId": "uuid",
  "judgeName": "Dr. Sarah Johnson",
  "totalTeamsJudged": 3,
  "averageScore": 85,
  "submissions": [
    {
      "submissionId": "uuid",
      "teamId": "uuid",
      "teamName": "Team Alpha",
      "projectTitle": "Smart Campus Navigation System",
      "totalScore": 85,
      "scores": [
        {
          "criteriaId": "uuid",
          "criteriaName": "Effective Communication",
          "score": 22,
          "reflection": "Clear explanation..."
        }
      ],
      "comments": "Strong technical implementation...",
      "startedAt": "2026-01-20T10:30:00Z",
      "submittedAt": "2026-01-20T10:52:00Z",
      "timeSpentSeconds": 1320
    }
  ]
}
```

**Database Operations**:
```sql
SELECT 
  ss.id as submission_id,
  t.id as team_id, t.name as team_name, t.project_title,
  ss.started_at, ss.submitted_at, ss.time_spent_seconds,
  json_agg(jsonb_build_object(
    'criteriaId', rc.id,
    'criteriaName', rc.name,
    'score', s.score,
    'reflection', s.reflection
  )) as scores,
  jc.comments,
  SUM(s.score) as total_score
FROM score_submissions ss
JOIN teams t ON ss.team_id = t.id
LEFT JOIN scores s ON ss.id = s.submission_id
LEFT JOIN rubric_criteria rc ON s.rubric_criteria_id = rc.id
LEFT JOIN judge_comments jc ON ss.id = jc.submission_id
WHERE ss.user_id = $1 AND ss.event_id = $2 -- optional event filter
GROUP BY ss.id, t.id, jc.comments
ORDER BY ss.submitted_at DESC
```

---

## 📊 6. Leaderboard & Analytics

### **GET /events/{eventId}/leaderboard**
**Purpose**: Get ranked leaderboard for event  
**Auth**: Required (JWT)  
**Used by**: Leaderboard Screen

**Query Parameters**:
- `includeDetails`: boolean (default: false) - Include per-judge breakdown

**Response** (200):
```json
{
  "eventId": "uuid",
  "eventName": "Aggies Invent Spring 2025",
  "leaderboard": [
    {
      "rank": 1,
      "teamId": "uuid",
      "teamName": "Team Epsilon",
      "projectTitle": "Food Waste Reduction Platform",
      "totalScore": 368,
      "averageScore": 92,
      "judgesCompleted": 4,
      "judgesTotal": 4,
      "categoryBreakdown": {
        "communication": 23.5,
        "funding": 22.75,
        "presentation": 23,
        "cohesion": 22.5
      },
      "scoreVariance": 2.1,
      "judges": [ // Only if includeDetails=true
        {
          "judgeId": "uuid",
          "judgeName": "Dr. Smith",
          "totalScore": 95,
          "judgeOrder": 1,
          "scores": {
            "communication": 24,
            "funding": 24,
            "presentation": 24,
            "cohesion": 23
          }
        }
      ]
    }
  ],
  "stats": {
    "teamsTotal": 24,
    "teamsScored": 5,
    "averageScore": 83.2,
    "highestScore": 92,
    "lowestScore": 78
  }
}
```

**Database Operations**:
```sql
SELECT 
  t.id as team_id, t.name as team_name, t.project_title,
  COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL) as judges_completed,
  COUNT(DISTINCT u.id) as judges_total,
  SUM(s.score) as total_score,
  AVG(s.score) as average_score,
  STDDEV(s.score) as score_variance,
  -- Category averages
  AVG(s.score) FILTER (WHERE rc.name = 'Effective Communication') as communication_avg,
  AVG(s.score) FILTER (WHERE rc.name = 'Would Fund/Buy Solution') as funding_avg,
  AVG(s.score) FILTER (WHERE rc.name = 'Presentation Quality') as presentation_avg,
  AVG(s.score) FILTER (WHERE rc.name = 'Team Cohesion') as cohesion_avg,
  RANK() OVER (ORDER BY SUM(s.score) DESC) as rank
FROM teams t
CROSS JOIN (SELECT * FROM users WHERE role = 'judge' AND is_active = true) u
LEFT JOIN score_submissions ss ON t.id = ss.team_id
LEFT JOIN scores s ON ss.id = s.submission_id
LEFT JOIN rubric_criteria rc ON s.rubric_criteria_id = rc.id
WHERE t.event_id = $1
GROUP BY t.id
ORDER BY total_score DESC

-- If includeDetails=true, also fetch per-judge breakdown
SELECT 
  ss.user_id as judge_id,
  u.name as judge_name,
  SUM(s.score) as total_score,
  ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY ss.submitted_at) as judge_order,
  jsonb_object_agg(rc.name, s.score) as scores_by_category
FROM score_submissions ss
JOIN users u ON ss.user_id = u.id
JOIN scores s ON ss.id = s.submission_id
JOIN rubric_criteria rc ON s.rubric_criteria_id = rc.id
JOIN teams t ON ss.team_id = t.id
WHERE t.event_id = $1 AND ss.submitted_at IS NOT NULL
GROUP BY ss.id, u.id, t.id
```

---

### **GET /events/{eventId}/judge-stats**
**Purpose**: Get judge participation statistics  
**Auth**: Required (JWT) + Role: admin/moderator  
**Used by**: Admin Screen - Insights Tab

**Response** (200):
```json
{
  "eventId": "uuid",
  "judges": [
    {
      "judgeId": "uuid",
      "judgeName": "Dr. Smith",
      "teamsJudged": 5,
      "teamsTotal": 24,
      "averageScore": 87.2,
      "averageTimeSpent": 1284,
      "totalTimeSpent": 6420,
      "isOnline": true,
      "lastActivity": "2026-01-20T11:20:00Z"
    }
  ],
  "summary": {
    "judgesTotal": 8,
    "judgesOnline": 6,
    "averageTeamsPerJudge": 3.1,
    "totalScoringTime": 48360
  }
}
```

**Database Operations**:
```sql
SELECT 
  u.id as judge_id, u.name as judge_name,
  COUNT(DISTINCT ss.team_id) FILTER (WHERE ss.submitted_at IS NOT NULL) as teams_judged,
  COUNT(DISTINCT t.id) as teams_total,
  AVG(s.score) as average_score,
  AVG(ss.time_spent_seconds) as average_time_spent,
  SUM(ss.time_spent_seconds) as total_time_spent,
  js.last_activity,
  CASE 
    WHEN js.logged_out_at IS NULL AND js.last_activity > NOW() - INTERVAL '5 minutes'
    THEN true ELSE false 
  END as is_online
FROM users u
CROSS JOIN teams t
LEFT JOIN score_submissions ss ON u.id = ss.user_id AND ss.event_id = $1
LEFT JOIN scores s ON ss.id = s.submission_id
LEFT JOIN judge_sessions js ON u.id = js.user_id AND js.event_id = $1
WHERE u.role = 'judge' AND u.is_active = true AND t.event_id = $1
GROUP BY u.id, js.last_activity, js.logged_out_at
```

---

## 🛡️ 7. Admin Operations

### **GET /admin/activity**
**Purpose**: Get recent activity log  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Admin Screen - Events Tab

**Query Parameters**:
- `eventId`: uuid (optional: filter by event)
- `limit`: number (default: 20)

**Response** (200):
```json
{
  "activities": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "userId": "uuid",
      "userName": "Prof. Michael Chen",
      "title": "Event timeline published",
      "description": "Aggies Invent Spring 2025 schedule locked and shared with judges.",
      "activityType": "event_created",
      "iconName": "Calendar",
      "tone": "primary",
      "createdAt": "2026-01-20T09:41:00Z"
    }
  ]
}
```

**Database Operations**:
```sql
SELECT 
  al.*,
  u.name as user_name
FROM activity_log al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.event_id = $1 -- if filtered by event
ORDER BY al.created_at DESC
LIMIT $2
```

---

### **POST /admin/activity**
**Purpose**: Log custom admin activity  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Various admin operations

**Request**:
```json
{
  "eventId": "uuid",
  "title": "Judge assignments balanced",
  "description": "Average of 3.1 teams per judge after latest assignments.",
  "activityType": "judge_assigned",
  "iconName": "UsersRound",
  "tone": "success"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "createdAt": "2026-01-20T11:25:00Z"
}
```

**Database Operations**:
```sql
INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *
```

---

### **GET /admin/events-recap**
**Purpose**: Get historical event analytics  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Admin Screen - Events Recap Tab

**Response** (200):
```json
{
  "events": [
    {
      "eventId": "uuid",
      "name": "Aggies Invent Fall 2024",
      "date": "2024-10-20",
      "status": "completed",
      "teamsCount": 18,
      "judgesCount": 6,
      "teams": [
        {
          "teamId": "uuid",
          "teamName": "Team Alpha",
          "averageScore": 85,
          "averageTime": 22,
          "judges": [
            {
              "judgeName": "Dr. Smith",
              "scores": {
                "communication": 22,
                "funding": 21,
                "presentation": 21,
                "cohesion": 21
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**Database Operations**:
```sql
-- Event summary
SELECT 
  e.id, e.name, e.start_date, e.status,
  COUNT(DISTINCT t.id) as teams_count,
  COUNT(DISTINCT ss.user_id) as judges_count
FROM events e
LEFT JOIN teams t ON e.id = t.event_id
LEFT JOIN score_submissions ss ON e.id = ss.event_id
WHERE e.status = 'completed'
GROUP BY e.id
ORDER BY e.start_date DESC

-- For each event, get detailed team/judge data
SELECT 
  t.id as team_id, t.name as team_name,
  u.name as judge_name,
  ss.time_spent_seconds,
  AVG(s.score) as average_score,
  jsonb_object_agg(rc.name, s.score) as scores_by_category
FROM teams t
JOIN score_submissions ss ON t.id = ss.team_id
JOIN users u ON ss.user_id = u.id
JOIN scores s ON ss.id = s.submission_id
JOIN rubric_criteria rc ON s.rubric_criteria_id = rc.id
WHERE t.event_id = $1 AND ss.submitted_at IS NOT NULL
GROUP BY t.id, u.name, ss.time_spent_seconds
```

---

## 🎮 8. Moderator Controls

### **PATCH /events/{eventId}/judging-phase**
**Purpose**: Update event judging phase  
**Auth**: Required (JWT) + Role: admin/moderator  
**Used by**: Moderator Screen

**Request**:
```json
{
  "judgingPhase": "in-progress" // "not-started", "in-progress", "ended"
}
```

**Response** (200):
```json
{
  "eventId": "uuid",
  "judgingPhase": "in-progress",
  "updatedAt": "2026-01-20T11:30:00Z"
}
```

**Database Operations**:
```sql
UPDATE events 
SET judging_phase = $1, updated_at = NOW()
WHERE id = $2
RETURNING *

-- Log activity
INSERT INTO activity_log (event_id, user_id, title, description, activity_type)
VALUES ($1, $2, 'Judging Phase Updated', 'Judging phase set to in-progress', 'phase_changed')
```

---

### **PATCH /events/{eventId}/active-team**
**Purpose**: Set currently active team (team being judged)  
**Auth**: Required (JWT) + Role: admin/moderator  
**Used by**: Moderator Screen

**Request**:
```json
{
  "teamId": "uuid" // or null to clear
}
```

**Response** (200):
```json
{
  "eventId": "uuid",
  "currentActiveTeamId": "uuid",
  "currentActiveTeam": {
    "id": "uuid",
    "name": "Team Alpha",
    "presentationOrder": 1
  },
  "updatedAt": "2026-01-20T11:35:00Z"
}
```

**Database Operations**:
```sql
-- Update event
UPDATE events 
SET current_active_team_id = $1, updated_at = NOW()
WHERE id = $2
RETURNING *

-- Update team status
UPDATE teams
SET status = CASE 
  WHEN id = $1 THEN 'active'
  WHEN status = 'active' THEN 'completed'
  ELSE status
END
WHERE event_id = $2

-- Log activity
INSERT INTO activity_log (event_id, user_id, title, description, activity_type)
VALUES ($1, $2, 'Team Activated', 'Team Alpha is now presenting', 'team_activated')
```

---

### **GET /events/{eventId}/judges-online**
**Purpose**: Get real-time judge online status  
**Auth**: Required (JWT) + Role: admin/moderator  
**Used by**: Event Detail Screen, Moderator Screen

**Response** (200):
```json
{
  "eventId": "uuid",
  "judges": [
    {
      "judgeId": "uuid",
      "judgeName": "Dr. Sarah Johnson",
      "isOnline": true,
      "lastActivity": "2026-01-20T11:37:22Z",
      "teamsJudged": 3,
      "teamsTotal": 24
    }
  ],
  "summary": {
    "judgesOnline": 6,
    "judgesTotal": 8
  }
}
```

**Database Operations**:
```sql
SELECT 
  u.id as judge_id, u.name as judge_name,
  js.last_activity,
  CASE 
    WHEN js.logged_out_at IS NULL AND js.last_activity > NOW() - INTERVAL '5 minutes'
    THEN true ELSE false
  END as is_online,
  COUNT(DISTINCT ss.team_id) FILTER (WHERE ss.submitted_at IS NOT NULL) as teams_judged,
  COUNT(DISTINCT t.id) as teams_total
FROM users u
LEFT JOIN judge_sessions js ON u.id = js.user_id AND js.event_id = $1
CROSS JOIN teams t
LEFT JOIN score_submissions ss ON u.id = ss.user_id AND ss.event_id = $1
WHERE u.role = 'judge' AND u.is_active = true AND t.event_id = $1
GROUP BY u.id, js.last_activity, js.logged_out_at
ORDER BY is_online DESC, u.name
```

---

## 🎨 9. Sponsor/Branding

### **GET /events/{eventId}/sponsor**
**Purpose**: Get sponsor/branding info for event  
**Auth**: Required (JWT)  
**Used by**: All event-related screens

**Response** (200):
```json
{
  "eventId": "uuid",
  "sponsor": {
    "id": "uuid",
    "name": "ExxonMobil",
    "logoUrl": "https://s3.../exxon-logo.png",
    "primaryColor": "#500000",
    "secondaryColor": "#3d0000",
    "textColor": "#FFFFFF",
    "createdAt": "2025-01-10T08:00:00Z"
  }
}
```

**Database Operations**:
```sql
SELECT * FROM sponsors WHERE event_id = $1
```

---

### **PUT /events/{eventId}/sponsor**
**Purpose**: Update sponsor/branding (admin only)  
**Auth**: Required (JWT) + Role: admin  
**Used by**: Event Manager Screen

**Request**:
```json
{
  "name": "ExxonMobil",
  "logoUrl": "https://s3.../exxon-logo-new.png",
  "primaryColor": "#600000",
  "secondaryColor": "#4d0000",
  "textColor": "#FFFFFF"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "name": "ExxonMobil",
  "logoUrl": "https://s3.../exxon-logo-new.png",
  "primaryColor": "#600000",
  "secondaryColor": "#4d0000",
  "textColor": "#FFFFFF"
}
```

**Database Operations**:
```sql
INSERT INTO sponsors (event_id, name, logo_url, primary_color, secondary_color, text_color)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (event_id)
DO UPDATE SET 
  name = $2, logo_url = $3, primary_color = $4, 
  secondary_color = $5, text_color = $6
RETURNING *
```

---

## 📡 10. Real-Time Features

### **WebSocket /ws/events/{eventId}**
**Purpose**: Real-time updates for event changes  
**Auth**: Required (JWT via query param or header)  
**Used by**: All event-related screens (optional enhancement)

**Messages Received** (from server):
```json
// Judge came online
{
  "type": "judge_online",
  "judgeId": "uuid",
  "judgeName": "Dr. Smith",
  "timestamp": "2026-01-20T11:40:00Z"
}

// Judge went offline
{
  "type": "judge_offline",
  "judgeId": "uuid",
  "timestamp": "2026-01-20T11:45:00Z"
}

// Team score submitted
{
  "type": "score_submitted",
  "teamId": "uuid",
  "judgeId": "uuid",
  "judgeName": "Dr. Smith",
  "score": 85,
  "timestamp": "2026-01-20T11:50:00Z"
}

// Moderator changed active team
{
  "type": "active_team_changed",
  "teamId": "uuid",
  "teamName": "Team Beta",
  "presentationOrder": 2,
  "timestamp": "2026-01-20T11:55:00Z"
}

// Judging phase changed
{
  "type": "judging_phase_changed",
  "judgingPhase": "ended",
  "timestamp": "2026-01-20T18:00:00Z"
}
```

**Implementation Note**: WebSocket support is optional for MVP. Can be added later for real-time leaderboard updates and judge online status.

---

## 📊 API Endpoints Summary

### **Total Endpoints**: 35+

### **Breakdown by Category**:
- Authentication & Sessions: 4
- User Management: 5
- Events Management: 5
- Teams Management: 5
- Judging & Scoring: 4
- Leaderboard & Analytics: 3
- Admin Operations: 3
- Moderator Controls: 3
- Sponsor/Branding: 2
- Real-Time Features: 1 (WebSocket, optional)

---

## 🔒 Authorization Matrix

| Endpoint | Judge | Moderator | Admin |
|----------|-------|-----------|-------|
| `POST /auth/cas-callback` | ✅ | ✅ | ✅ |
| `GET /auth/me` | ✅ | ✅ | ✅ |
| `GET /events` | ✅ | ✅ | ✅ |
| `GET /events/{id}` | ✅ | ✅ | ✅ |
| `POST /events` | ❌ | ❌ | ✅ |
| `PATCH /events/{id}` | ❌ | ✅ | ✅ |
| `GET /teams/{id}` | ✅ | ✅ | ✅ |
| `POST /teams` | ❌ | ❌ | ✅ |
| `POST /scores` | ✅ | ✅ | ✅ |
| `GET /scores/team/{teamId}` | ✅ | ✅ | ✅ |
| `GET /scores/judge/{judgeId}/history` | ✅ (own) | ✅ | ✅ |
| `GET /admin/users` | ❌ | ❌ | ✅ |
| `POST /admin/users` | ❌ | ❌ | ✅ |
| `PATCH /events/{id}/active-team` | ❌ | ✅ | ✅ |
| `PATCH /events/{id}/judging-phase` | ❌ | ✅ | ✅ |

---

## 🎯 Implementation Priority

### **Phase 1 - MVP (Week 1-2)**:
1. `POST /auth/cas-callback` - Authentication
2. `GET /auth/me` - User profile
3. `GET /events` - Dashboard
4. `GET /events/{id}` - Event details
5. `GET /events/{id}/teams` - Team list
6. `GET /teams/{id}` - Team details
7. `GET /rubric` - Scoring criteria
8. `POST /scores` - Submit scores
9. `GET /events/{id}/leaderboard` - Rankings

### **Phase 2 - Admin Features (Week 2-3)**:
10. `POST /events` - Create events
11. `POST /teams` - Create teams
12. `GET /admin/users` - User management
13. `POST /admin/users` - Create users
14. `PATCH /events/{id}` - Edit events
15. `PATCH /teams/{id}` - Edit teams

### **Phase 3 - Moderator Controls (Week 3)**:
16. `PATCH /events/{id}/judging-phase` - Control judging
17. `PATCH /events/{id}/active-team` - Set active team
18. `GET /events/{id}/judges-online` - Judge status
19. `PATCH /auth/session/heartbeat` - Online tracking

### **Phase 4 - Analytics & Polish (Week 4)**:
20. `GET /admin/activity` - Activity log
21. `GET /admin/events-recap` - Historical data
22. `GET /events/{id}/judge-stats` - Judge statistics
23. `GET /scores/judge/{judgeId}/history` - Judge history

---

## 📝 Notes for Implementation

### **Database Connection Pooling**:
- All endpoints share single connection pool
- Pool size: 1 per Lambda instance (important!)
- Connection reuse across warm invocations

### **Error Handling**:
- All endpoints return consistent error format
- Use HTTP status codes properly (400, 401, 403, 404, 500)
- Never expose internal error details to client

### **Rate Limiting**:
- API Gateway throttling: 1000 req/sec
- Per-user limits via authorizer
- Burst limit: 2000 requests

### **Pagination**:
- Default limit: 50
- Max limit: 100
- Always return `pagination` object with totals

### **Date/Time Format**:
- Always use ISO 8601 format
- Always use UTC timezone
- Example: `2026-01-20T11:40:00Z`

### **Response Times (Target)**:
- Simple queries (GET user, GET rubric): < 100ms
- List queries (GET events, GET teams): < 300ms
- Complex aggregations (leaderboard): < 500ms
- Write operations (POST scores): < 200ms

---

**Ready for implementation!** This specification covers all screens and features based on your database schema and component analysis.
