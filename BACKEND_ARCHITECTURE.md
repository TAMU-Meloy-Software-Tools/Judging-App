# Meloy Judging Portal - Backend Architecture Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Structure](#api-structure)
4. [Authentication & Authorization](#authentication--authorization)
5. [Judge Profile System](#judge-profile-system)
6. [Key API Endpoints](#key-api-endpoints)
7. [Data Flow Examples](#data-flow-examples)
8. [Deployment](#deployment)

---

## Architecture Overview

### Technology Stack
- **Runtime**: AWS Lambda (Node.js 18.x)
- **Web Framework**: Express.js 5.x
- **Database**: PostgreSQL (Amazon RDS)
- **API Gateway**: AWS HTTP API (API Gateway V2)
- **Deployment**: AWS SAM (Serverless Application Model)
- **Language**: TypeScript

### Express Monolith Pattern
The backend uses a **single Lambda function** with Express.js routing, not individual Lambda handlers per endpoint. This provides:
- Traditional web framework routing patterns
- Shared middleware and connection pooling
- Easier local development and testing
- Centralized error handling

**Entry Point**: `lambda/src/app.ts` → Exports `handler` wrapped by `serverless-http`

**API Gateway Configuration**:
```
/{proxy+} → Lambda Function → Express Router → Route Handlers
```

All requests go through:
1. API Gateway stage: `/prod`
2. Lambda handler via `serverless-http`
3. Express middleware stack
4. Route-specific handlers

---

## Database Schema

### Core Tables

#### 1. **users** - User Accounts
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- name (VARCHAR) - Full name
- role (ENUM: 'admin', 'moderator', 'judge')
- created_at, updated_at (TIMESTAMP)
```
**Purpose**: Stores shared login accounts. For judge accounts, multiple judge profiles can use one login.

#### 2. **events** - Competition Events
```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- event_type (VARCHAR) - e.g., 'hackathon', 'pitch_competition'
- status (VARCHAR) - 'upcoming', 'active', 'completed'
- judging_phase (VARCHAR) - 'not_started', 'in_progress', 'completed'
- location, start_date, end_date
- max_team_size (INTEGER)
- active_team_id (UUID, FK → teams) - For moderated presentations
- created_at, updated_at (TIMESTAMP)
```
**Purpose**: Central event management with status tracking.

#### 3. **event_judges** - Judge Profiles (KEY CONCEPT)
```sql
- id (UUID, PK) - This is the "judge profile ID"
- event_id (UUID, FK → events)
- user_id (UUID, FK → users) - The shared login account
- name (VARCHAR) - Judge profile name (e.g., "Dr. Smith")
- assigned_at (TIMESTAMP)
- UNIQUE(event_id, name)
```
**Purpose**: Creates named judge profiles within an event. Multiple profiles can share one user account. This is what scores are tied to, NOT the user account directly.

#### 4. **teams** - Competition Teams
```sql
- id (UUID, PK)
- event_id (UUID, FK → events)
- name (VARCHAR)
- project_name (VARCHAR)
- description (TEXT)
- status (VARCHAR) - 'pending', 'active'
- table_number (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

#### 5. **team_members** - Team Composition
```sql
- id (UUID, PK)
- team_id (UUID, FK → teams)
- name (VARCHAR)
- email (VARCHAR)
- role (VARCHAR) - 'leader', 'member'
```

#### 6. **rubric_criteria** - Scoring Criteria
```sql
- id (UUID, PK)
- event_id (UUID, FK → events)
- name (VARCHAR) - e.g., "Innovation"
- description (TEXT)
- max_score (INTEGER) - Maximum points for this criterion
- weight (DECIMAL) - Weighting in final score
- display_order (INTEGER)
```

#### 7. **score_submissions** - Judge Scoring Sessions
```sql
- id (UUID, PK)
- judge_id (UUID, FK → event_judges) ⚠️ NOT user_id!
- team_id (UUID, FK → teams)
- event_id (UUID, FK → events)
- submitted_at (TIMESTAMP)
- time_spent_seconds (INTEGER)
- UNIQUE(judge_id, team_id) - One submission per judge profile per team
```
**Purpose**: Tracks that a judge profile has scored a team. Contains no actual scores.

#### 8. **scores** - Individual Criterion Scores
```sql
- id (UUID, PK)
- submission_id (UUID, FK → score_submissions)
- judge_id (UUID, FK → event_judges) ⚠️ NOT user_id!
- team_id (UUID, FK → teams)
- criterion_id (UUID, FK → rubric_criteria)
- score (DECIMAL) - The actual score given
- created_at (TIMESTAMP)
```
**Purpose**: Individual scores for each rubric criterion.

#### 9. **judge_comments** - Written Feedback
```sql
- id (UUID, PK)
- submission_id (UUID, FK → score_submissions)
- judge_id (UUID, FK → event_judges) ⚠️ NOT user_id!
- team_id (UUID, FK → teams)
- comment_text (TEXT)
- created_at (TIMESTAMP)
```

#### 10. **judge_sessions** - Online Status Tracking
```sql
- id (UUID, PK)
- judge_id (UUID, FK → event_judges) ⚠️ NOT user_id!
- event_id (UUID, FK → events)
- logged_in_at (TIMESTAMP)
- last_active_at (TIMESTAMP)
- logged_out_at (TIMESTAMP, nullable)
```
**Purpose**: Tracks which judge profiles are currently active/online.

#### 11. **activity_log** - Audit Trail
```sql
- id (UUID, PK)
- user_id (UUID, FK → users, nullable)
- action (VARCHAR) - e.g., 'login', 'score_submitted'
- entity_type (VARCHAR) - e.g., 'team', 'event'
- entity_id (UUID)
- details (JSONB)
- created_at (TIMESTAMP)
```

### Database Views

#### **judge_online_status**
```sql
SELECT 
    ej.id as judge_id,
    ej.event_id,
    ej.name as judge_name,
    u.name as user_name,
    js.last_active_at,
    CASE WHEN js.logged_out_at IS NULL 
         AND js.last_active_at > NOW() - INTERVAL '5 minutes'
         THEN true ELSE false END as is_online
FROM event_judges ej
JOIN users u ON ej.user_id = u.id
LEFT JOIN judge_sessions js ON ej.id = js.judge_id
```

#### **team_scoring_progress**
```sql
SELECT 
    t.id as team_id,
    t.event_id,
    COUNT(DISTINCT ss.judge_id) as judges_scored,
    COUNT(DISTINCT ej.id) as total_judges,
    ROUND(AVG(s.score), 2) as average_score
FROM teams t
LEFT JOIN score_submissions ss ON t.id = ss.team_id
LEFT JOIN scores s ON ss.id = s.submission_id
LEFT JOIN event_judges ej ON t.event_id = ej.event_id
GROUP BY t.id, t.event_id
```

---

## API Structure

### Directory Organization
```
lambda/src/
├── app.ts                    # Express app & Lambda handler
├── routes/                   # API route definitions
│   ├── index.ts             # Route exports
│   ├── auth.routes.ts       # /auth endpoints
│   ├── events.routes.ts     # /events endpoints
│   ├── teams.routes.ts      # /teams endpoints
│   ├── scores.routes.ts     # /scores endpoints
│   ├── judging.routes.ts    # /judge endpoints
│   ├── users.routes.ts      # /users endpoints
│   └── admin.routes.ts      # /admin endpoints
├── middleware/              # Express middleware
│   ├── auth.ts             # JWT authentication
│   ├── logging.ts          # Request logging
│   └── index.ts
├── db/
│   ├── connection.ts       # PostgreSQL connection pool
│   └── queries/            # Reusable query functions
├── utils/
│   ├── jwt.ts             # JWT token operations
│   ├── secrets.ts         # AWS Secrets Manager
│   ├── validation.ts      # Input validation
│   └── errors.ts          # Custom error classes
└── types/
    └── index.ts           # TypeScript type definitions
```

### Route Registration (app.ts)
```typescript
app.use('/auth', authRoutes);        // Authentication
app.use('/events', eventsRoutes);    // Event management
app.use('/teams', teamsRoutes);      // Team management
app.use('/scores', scoresRoutes);    // Score submission
app.use('/judge', judgingRoutes);    // Judge operations
app.use('/users', usersRoutes);      // User management
app.use('/admin', adminRoutes);      // Admin utilities
```

---

## Authentication & Authorization

### Development Mode (DEV_MODE=true)
- **Bypasses JWT authentication**
- Injects mock admin user:
  ```typescript
  {
    id: '00000000-0000-0000-0000-000000000001',
    netId: 'testuser',
    role: 'admin'
  }
  ```
- ⚠️ **MUST be disabled in production**

### Production Mode
1. **JWT Token Generation**: User logs in → JWT issued with user ID, netId, role
2. **Token Validation**: `authenticate` middleware validates JWT on protected routes
3. **Role-Based Access**: `requireRole(['admin', 'moderator'])` restricts endpoints

### Middleware Chain
```typescript
// Example protected endpoint
router.post('/events', 
  authenticate,                    // Validates JWT
  requireRole(['admin', 'moderator']), // Checks role
  async (req: AuthRequest, res) => {
    const userId = req.user!.id;  // User from JWT
    // ... handler logic
  }
);
```

---

## Judge Profile System

### Key Concept: Judge Profiles vs. User Accounts

**Problem Solved**: Multiple devices/judges at an event need to share one login but maintain separate scoring identities.

**Solution**: The `event_judges` table creates "judge profiles" that reference a shared user account.

### How It Works

1. **Setup Phase** (Admin/Moderator):
   ```sql
   -- Create shared judge account
   INSERT INTO users (email, password_hash, name, role)
   VALUES ('judges@event.com', '...', 'Event Judges', 'judge');
   
   -- Create judge profiles for the event
   INSERT INTO event_judges (event_id, user_id, name)
   VALUES 
     ('event-uuid', 'user-uuid', 'Dr. Smith'),
     ('event-uuid', 'user-uuid', 'Prof. Chen'),
     ('event-uuid', 'user-uuid', 'Ms. Johnson');
   ```

2. **Login Phase**:
   - User logs in with shared account → JWT issued with `user_id`
   - Frontend calls `POST /judge/profiles/:eventId` → Returns list of judge profiles
   - Judge selects their profile (e.g., "Dr. Smith")
   - Frontend calls `POST /judge/session/start` with `judgeId`
   - Session created in `judge_sessions` table

3. **Scoring Phase**:
   - All scoring requests include `judgeId` in request body
   - Backend validates: `judgeId` belongs to authenticated `user_id`
   - Scores written to database with `judge_id` (from event_judges), NOT `user_id`

4. **Data Integrity**:
   - `score_submissions.judge_id → event_judges.id`
   - `scores.judge_id → event_judges.id`
   - `judge_comments.judge_id → event_judges.id`
   - `judge_sessions.judge_id → event_judges.id`

### Example Flow
```
Device 1: judges@event.com → "Dr. Smith" profile → Scores Team A
Device 2: judges@event.com → "Prof. Chen" profile → Scores Team A
Device 3: judges@event.com → "Ms. Johnson" profile → Scores Team A

Database:
score_submissions: 
  - (judge_id: dr-smith-profile-id, team_id: team-a-id)
  - (judge_id: prof-chen-profile-id, team_id: team-a-id)
  - (judge_id: ms-johnson-profile-id, team_id: team-a-id)

Result: 3 distinct scores, all tied to separate judge profiles!
```

---

## Key API Endpoints

### Authentication (`/auth`)
- `GET /auth/me` - Get current authenticated user
- `POST /auth/logout` - End judge session (requires `judgeId`)

### Events (`/events`)
- `GET /events` - List all events (with filters)
- `GET /events/:eventId` - Get event details
- `POST /events` - Create new event (admin/moderator)
- `PATCH /events/:eventId` - Update event (admin/moderator)
- `GET /events/:eventId/teams` - Get teams for event (with optional `judgeId` filter)
- `GET /events/:eventId/leaderboard` - Live leaderboard with rankings
- `GET /events/:eventId/teams/scores` - Moderator scoring table view
- `GET /events/:eventId/judges/online` - Online judge status
- `GET /events/:eventId/insights` - Event analytics

### Teams (`/teams`)
- `GET /teams/:teamId` - Get team details
- `POST /teams` - Create team (admin/moderator)
- `PATCH /teams/:teamId` - Update team (admin/moderator)
- `POST /teams/:teamId/members` - Add team member
- `DELETE /teams/:teamId/members/:memberId` - Remove member

### Scores (`/scores`)
- `POST /scores` - Submit scores for a team
  ```json
  {
    "eventId": "uuid",
    "teamId": "uuid",
    "judgeId": "uuid",  // ← Judge profile ID
    "scores": [
      { "criterionId": "uuid", "score": 8.5 }
    ],
    "overallComments": "Great innovation!",
    "timeSpentSeconds": 300
  }
  ```

### Judge Operations (`/judge`)
- `POST /judge/heartbeat` - Update last_active_at (requires `judgeId`)
- `POST /judge/profiles/:eventId` - Get judge profiles for authenticated user
- `POST /judge/session/start` - Start new judge session with profile
- `GET /judge/:eventId/my-progress` - Get scoring progress (requires `judgeId` query param)

### Admin Utilities (`/admin`)
- `POST /admin/init-schema` - Initialize/reset database schema
- `POST /admin/seed-data` - Seed test data
- `GET /admin/test` - Health check for admin routes

---

## Data Flow Examples

### Example 1: Judge Scoring a Team

```
1. Frontend Request:
   POST /scores
   Headers: { Authorization: "Bearer <jwt-token>" }
   Body: {
     eventId: "event-123",
     teamId: "team-456",
     judgeId: "judge-profile-789",  // Dr. Smith's profile ID
     scores: [
       { criterionId: "innovation", score: 9 },
       { criterionId: "execution", score: 8 }
     ],
     overallComments: "Excellent work!",
     timeSpentSeconds: 420
   }

2. Backend Processing:
   a. Authenticate middleware validates JWT → extracts user_id
   b. Validate judgeId belongs to user_id:
      SELECT * FROM event_judges 
      WHERE id = 'judge-profile-789' 
        AND user_id = <user_id_from_jwt>
   c. Insert score_submission:
      INSERT INTO score_submissions 
        (judge_id, team_id, event_id, time_spent_seconds)
      VALUES ('judge-profile-789', 'team-456', 'event-123', 420)
   d. Insert individual scores:
      INSERT INTO scores (submission_id, judge_id, team_id, criterion_id, score)
      VALUES 
        (submission_id, 'judge-profile-789', 'team-456', 'innovation', 9),
        (submission_id, 'judge-profile-789', 'team-456', 'execution', 8)
   e. Insert comments:
      INSERT INTO judge_comments 
        (submission_id, judge_id, team_id, comment_text)
      VALUES (submission_id, 'judge-profile-789', 'team-456', 'Excellent work!')

3. Response:
   { "message": "Scores submitted successfully" }
```

### Example 2: Leaderboard Calculation

```
1. Frontend Request:
   GET /events/event-123/leaderboard

2. Backend Query:
   SELECT 
     t.id,
     t.name as team_name,
     t.project_name,
     COUNT(DISTINCT ss.judge_id) as judges_scored,
     COUNT(DISTINCT rc.id) as total_criteria,
     SUM(s.score * rc.weight) as weighted_score,
     AVG(s.score) as average_score
   FROM teams t
   LEFT JOIN score_submissions ss ON t.id = ss.team_id
   LEFT JOIN scores s ON ss.id = s.submission_id
   LEFT JOIN rubric_criteria rc ON s.criterion_id = rc.id
   WHERE t.event_id = 'event-123'
   GROUP BY t.id
   ORDER BY weighted_score DESC NULLS LAST

3. Response:
   {
     "teams": [
       {
         "id": "team-456",
         "name": "Innovators",
         "projectName": "AI Assistant",
         "judgesScored": 3,
         "totalJudges": 5,
         "weightedScore": 87.5,
         "averageScore": 8.5,
         "rank": 1
       },
       // ... more teams
     ]
   }
```

### Example 3: Moderator Live Scoring View

```
1. Frontend Request:
   GET /events/event-123/teams/scores

2. Backend Processing:
   a. Get all judge profiles for event:
      SELECT ej.id, ej.name, js.last_active_at
      FROM event_judges ej
      LEFT JOIN judge_sessions js ON ej.id = js.judge_id
      WHERE ej.event_id = 'event-123'
   
   b. Get all teams with scoring status:
      SELECT 
        t.id, 
        t.name,
        COUNT(DISTINCT ss.judge_id) as scored_count
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id
      WHERE t.event_id = 'event-123'
      GROUP BY t.id

3. Response:
   {
     "judges": [
       { "id": "prof-1", "name": "Dr. Smith", "isOnline": true },
       { "id": "prof-2", "name": "Prof. Chen", "isOnline": false }
     ],
     "teams": [
       {
         "id": "team-1",
         "name": "Innovators",
         "judgesScored": 2,
         "scoredBy": ["prof-1", "prof-2"]
       }
     ]
   }
```

---

## Deployment

### Build & Deploy Process

**Important**: Always run the full build chain to avoid stale artifacts:

```bash
# From lambda/ directory
npm run build    # Compile TypeScript → dist/
sam build        # Package for Lambda → .aws-sam/build/
sam deploy       # Deploy to AWS
```

Or combined:
```bash
npm run build && sam build && sam deploy
```

### Why This Matters
- SAM doesn't automatically recompile TypeScript
- Running only `sam build` may package old JavaScript files
- Always rebuild TypeScript first to ensure latest code is deployed

### Deployment Architecture

```
┌─────────────────┐
│   API Gateway   │
│   /prod/{...}   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│    Lambda Function          │
│  meloy-judge-api            │
│                             │
│  ┌─────────────────────┐   │
│  │  Express.js App     │   │
│  │  - Middleware       │   │
│  │  - Routes           │   │
│  │  - Error Handlers   │   │
│  └─────────────────────┘   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│    Amazon RDS (PostgreSQL)  │
│  - VPC Private Subnets      │
│  - Security Groups          │
└─────────────────────────────┘
```

### Environment Variables (via SAM template)
- `RDS_SECRET_ARN` - Secrets Manager ARN for DB credentials
- `JWT_SECRET_ARN` - Secrets Manager ARN for JWT signing key
- `CAS_SERVICE_URL` - CAS authentication callback URL
- `NODE_ENV` - 'production'
- `DEV_MODE` - 'true' for testing, 'false' for production

### Database Connection
- Connection pooling via `pg.Pool`
- Credentials fetched from AWS Secrets Manager on cold start
- Pool configuration:
  - Max connections: 10
  - Idle timeout: 30s
  - Connection timeout: 5s

### Lambda Configuration
- **Runtime**: nodejs18.x
- **Memory**: 512 MB
- **Timeout**: 30 seconds
- **VPC**: Attached to private subnets with RDS security group access
- **Handler**: `dist/app.handler`

---

## Best Practices & Notes

### 1. Always Use Judge Profile IDs
❌ **WRONG**: `WHERE user_id = <user-id>`  
✅ **CORRECT**: `WHERE judge_id = <judge-profile-id>`

For any scoring-related queries, always use `judge_id` from `event_judges`, not `user_id` from `users`.

### 2. Validate Judge Profile Ownership
Always verify the judge profile belongs to the authenticated user:
```typescript
const validation = await query(
  `SELECT id FROM event_judges 
   WHERE id = $1 AND user_id = $2 AND event_id = $3`,
  [judgeId, req.user!.id, eventId]
);
if (!validation.rows.length) {
  return res.status(403).json({ error: 'Invalid judge profile' });
}
```

### 3. Transaction Management
Use transactions for multi-table operations (scores + comments + submissions):
```typescript
await transaction(async (client) => {
  await client.query('INSERT INTO score_submissions ...');
  await client.query('INSERT INTO scores ...');
  await client.query('INSERT INTO judge_comments ...');
});
```

### 4. Connection Pool Management
- Don't manually close connections in route handlers
- Let the pool manage connection lifecycle
- Use `query()` helper function from `db/connection.ts`

### 5. Testing Database Changes
1. Deploy schema: `POST /admin/init-schema`
2. Seed data: `POST /admin/seed-data`
3. Test endpoints with Postman/curl
4. Check CloudWatch logs for errors

---

## Common Queries

### Get All Scores for a Team
```sql
SELECT 
  ej.name as judge_name,
  rc.name as criterion_name,
  s.score,
  jc.comment_text
FROM scores s
JOIN event_judges ej ON s.judge_id = ej.id
JOIN rubric_criteria rc ON s.criterion_id = rc.id
LEFT JOIN judge_comments jc ON s.submission_id = jc.submission_id
WHERE s.team_id = 'team-id'
ORDER BY ej.name, rc.display_order;
```

### Get Judge's Scoring Progress
```sql
SELECT 
  t.id,
  t.name,
  CASE WHEN ss.id IS NOT NULL THEN true ELSE false END as has_scored
FROM teams t
LEFT JOIN score_submissions ss 
  ON t.id = ss.team_id 
  AND ss.judge_id = 'judge-profile-id'
WHERE t.event_id = 'event-id'
ORDER BY t.name;
```

### Get Online Judges
```sql
SELECT 
  ej.id,
  ej.name,
  js.last_active_at
FROM event_judges ej
JOIN judge_sessions js ON ej.id = js.judge_id
WHERE ej.event_id = 'event-id'
  AND js.logged_out_at IS NULL
  AND js.last_active_at > NOW() - INTERVAL '5 minutes';
```

---

## Troubleshooting

### Issue: "Endpoint not found"
- Check route is registered in `app.ts`
- Verify route file exports default router
- Ensure `npm run build` was run before deployment

### Issue: Stale code deployed
- Delete `dist/` and `.aws-sam/` folders
- Run full build: `npm run build && sam build && sam deploy`

### Issue: Database connection errors
- Check Lambda has VPC access to RDS
- Verify security group rules
- Confirm Secrets Manager ARN is correct

### Issue: JWT authentication failing
- Check `DEV_MODE` environment variable
- Verify JWT secret in Secrets Manager
- Inspect token expiration

---

**Last Updated**: February 5, 2026  
**Version**: 1.1 (Judge Profile Architecture)
