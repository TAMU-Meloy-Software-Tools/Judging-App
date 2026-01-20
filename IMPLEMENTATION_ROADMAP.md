# Meloy Judge Portal - Implementation Roadmap

**Project**: Judging application with Amplify UI + Lambda API + RDS  
**Target Architecture**: Static Next.js frontend → API Gateway → Lambda (VPC) → RDS  
**Last Updated**: January 20, 2026

---

## 🎯 Project Overview

Build a judging application where:
- Frontend is hosted on AWS Amplify (static Next.js export)
- Backend is serverless (Lambda + API Gateway)
- Database is RDS PostgreSQL (currently public, will migrate to private)
- Authentication uses **Texas A&M NetID CAS** (Single Sign-On)

---

## 📅 Development Timeline

### **Phase 1: Backend API Development (Week 1-2)**
**Status**: Not Started  
**Goal**: Build and test Lambda functions locally

```
┌─────────────────────────────────────────────┐
│  Local Development Environment              │
│  ┌─────────────┐      ┌─────────────────┐  │
│  │   Lambda    │─────▶│  Public RDS     │  │
│  │  Functions  │      │  (PostgreSQL)   │  │
│  │   (Local)   │      └─────────────────┘  │
│  └─────────────┘                            │
└─────────────────────────────────────────────┘
```

**Deliverables**:
- [ ] Lambda project structure with TypeScript
- [ ] Database connection pooling layer
- [ ] Query management (organized by domain: users, events, teams, scores)
- [ ] All API handlers implemented
- [ ] Unit tests for critical paths
- [ ] Local testing with Postman/Bruno

**Testing**: Use curl/Postman - no frontend changes yet

---

### **Phase 2: Backend Deployment to AWS (Week 2-3)**
**Status**: Not Started  
**Goal**: Deploy Lambda + API Gateway, test in cloud environment

```
Internet
   │
   ▼
┌──────────────────┐      ┌──────────────┐      ┌──────────┐
│  API Gateway     │─────▶│   Lambda     │─────▶│ Public   │
│  (HTTP API)      │      │  (in VPC)    │      │   RDS    │
└──────────────────┘      └──────────────┘      └──────────┘
                                │
                                ▼
                          ┌──────────────┐
                          │   Secrets    │
                          │   Manager    │
                          └──────────────┘
```

**Deliverables**:
- [ ] AWS SAM or Serverless Framework configuration
- [ ] API Gateway routes configured
- [ ] Lambda functions deployed to VPC
- [ ] Secrets Manager setup for RDS credentials
- [ ] CloudWatch logging configured
- [ ] Public API URL available for testing

**Testing**: Test deployed endpoints with same tools

---

### **Phase 3: Frontend Migration (Week 3-4)**
**Status**: Not Started  
**Goal**: Convert Next.js to static export and integrate with API

**Changes Required**:

#### 3A: Configure API Base URL
```typescript
// meloy-judge-app/.env.local (development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

// meloy-judge-app/.env.production
NEXT_PUBLIC_API_BASE_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

#### 3B: Convert Server Components → Client Components
All components must use client-side data fetching via API calls.

#### 3C: Enable Static Export
```javascript
// next.config.mjs
export default {
  output: 'export',
  images: { unoptimized: true },
}
```

#### 3D: Deploy to Amplify
- Push to GitHub
- Amplify auto-builds on commit

**Deliverables**:
- [ ] All Server Components converted to Client Components
- [ ] API client wrapper created
- [ ] Auth token management implemented
- [ ] Static export working locally
- [ ] Deployed to Amplify hosting

---

### **Phase 4: Security Hardening (Week 4-5)**
**Status**: Not Started  
**Goal**: Make RDS private, add RDS Proxy, final security review

**Migration Steps**:
1. Create RDS Proxy
2. Test Lambda → RDS Proxy → RDS (while RDS still public)
3. Switch RDS to private
4. Update Lambda security groups
5. Remove public access completely

**Deliverables**:
- [ ] RDS Proxy configured
- [ ] Lambda updated to use proxy endpoint
- [ ] RDS `publicly_accessible = false`
- [ ] Security group rules locked down
- [ ] Bastion host or Systems Manager Session Manager for dev access

---

## 🔐 Authentication Architecture: TAMU NetID CAS

### **CAS (Central Authentication Service) Flow**

Texas A&M uses CAS for Single Sign-On. The flow is:

```
1. User visits app → Redirected to CAS login
   https://cas.tamu.edu/cas/login?service=https://your-app.amplify.app/auth/callback

2. User enters NetID credentials on TAMU's server
   (Your app never sees the password)

3. CAS redirects back with ticket
   https://your-app.amplify.app/auth/callback?ticket=ST-123456-xyz

4. Your API validates ticket with CAS
   GET https://cas.tamu.edu/cas/serviceValidate?ticket=ST-123456-xyz&service=...

5. CAS returns XML with user info
   <cas:user>abc123</cas:user>  (NetID)
   <cas:attribute name="email">abc123@tamu.edu</cas:attribute>

6. Your API:
   - Checks if user exists in database
   - If yes: issue JWT token for session management
   - If no: reject or auto-register (based on role requirements)

7. Return JWT to frontend
   Frontend stores JWT and uses for subsequent API calls
```

### **Implementation Changes**

#### Backend Handlers

```typescript
// handlers/auth/cas-callback.ts
// Validates CAS ticket and issues JWT

export const handler: APIGatewayProxyHandler = async (event) => {
  const ticket = event.queryStringParameters?.ticket;
  const service = process.env.CAS_SERVICE_URL; // Your callback URL
  
  // 1. Validate ticket with TAMU CAS
  const casResponse = await fetch(
    `https://cas.tamu.edu/cas/serviceValidate?ticket=${ticket}&service=${service}`
  );
  const casXml = await casResponse.text();
  
  // 2. Parse XML to get NetID
  const netId = extractNetIdFromCasXml(casXml);
  if (!netId) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid CAS ticket' }) };
  }
  
  // 3. Look up user in database
  const user = await userQueries.findByNetId(netId);
  if (!user || !user.is_active) {
    return { statusCode: 403, body: JSON.stringify({ error: 'User not authorized' }) };
  }
  
  // 4. Generate JWT for session management
  const token = jwt.sign(
    { userId: user.id, netId: user.netid, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
  );
  
  // 5. Update last_login
  await userQueries.updateLastLogin(user.id);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      token,
      user: { id: user.id, netId: user.netid, name: user.name, role: user.role }
    }),
  };
};
```

#### Database Schema Update

```sql
-- Add netid column to users table
ALTER TABLE users ADD COLUMN netid VARCHAR(20) UNIQUE;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- For CAS users, password_hash will be NULL
-- For potential admin backdoor accounts, keep password_hash
```

#### Frontend Flow

```typescript
// components/authentication/login-screen.tsx
'use client'

export function LoginScreen() {
  const handleCasLogin = () => {
    // Redirect to TAMU CAS
    const serviceUrl = encodeURIComponent(
      `${window.location.origin}/auth/callback`
    );
    window.location.href = `https://cas.tamu.edu/cas/login?service=${serviceUrl}`;
  };
  
  return (
    <button onClick={handleCasLogin}>
      Login with TAMU NetID
    </button>
  );
}

// app/auth/callback/page.tsx
'use client'

export default function CasCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket');
    
    if (ticket) {
      // Send ticket to your API for validation
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/cas-callback?ticket=${ticket}`)
        .then(res => res.json())
        .then(({ token, user }) => {
          localStorage.setItem('auth_token', token);
          router.push('/dashboard');
        })
        .catch(err => {
          router.push('/?error=auth_failed');
        });
    }
  }, []);
  
  return <div>Authenticating...</div>;
}
```

### **Security Considerations for CAS**

| Aspect | Implementation | Security Benefit |
|--------|----------------|------------------|
| **Ticket Validation** | Always validate with CAS server | Prevents ticket forgery |
| **Service URL** | Hardcode in environment variable | Prevents redirect attacks |
| **HTTPS Only** | Enforce TLS for callback URL | Prevents ticket interception |
| **Single-Use Tickets** | CAS tickets are one-time use | Prevents replay attacks |
| **User Whitelist** | Check database before issuing JWT | Only authorized users can access |
| **Role Verification** | Validate role on every protected endpoint | Prevent privilege escalation |

---

## 🗄️ Query Management Strategy

### **Project Structure**

```
lambda/
├── src/
│   ├── db/
│   │   ├── connection.ts              # Connection pool (reused across invocations)
│   │   ├── queries/
│   │   │   ├── users.ts               # All user-related queries
│   │   │   ├── events.ts              # Event CRUD
│   │   │   ├── teams.ts               # Team management
│   │   │   ├── scores.ts              # Scoring logic
│   │   │   ├── rubric.ts              # Rubric criteria
│   │   │   ├── sessions.ts            # Judge session tracking
│   │   │   └── index.ts               # Export all
│   ├── handlers/
│   │   ├── auth/
│   │   │   ├── cas-callback.ts        # CAS ticket validation
│   │   │   ├── logout.ts              # Clear session
│   │   │   └── authorizer.ts          # JWT validation for API Gateway
│   │   ├── events/
│   │   │   ├── list.ts                # GET /events
│   │   │   ├── create.ts              # POST /events
│   │   │   ├── detail.ts              # GET /events/{id}
│   │   │   ├── update.ts              # PATCH /events/{id}
│   │   │   └── leaderboard.ts         # GET /events/{id}/leaderboard
│   │   ├── teams/
│   │   │   ├── list.ts                # GET /events/{eventId}/teams
│   │   │   ├── create.ts              # POST /teams
│   │   │   ├── detail.ts              # GET /teams/{id}
│   │   │   └── scores.ts              # GET /teams/{id}/scores
│   │   ├── scores/
│   │   │   ├── submit.ts              # POST /scores (judge submits score)
│   │   │   └── history.ts             # GET /scores/judge/{judgeId}
│   │   └── rubric/
│   │       └── criteria.ts            # GET /rubric (returns scoring criteria)
│   ├── utils/
│   │   ├── validation.ts              # Input validation helpers
│   │   ├── errors.ts                  # Custom error classes
│   │   └── cas.ts                     # CAS integration utilities
│   └── types/
│       └── index.ts                   # TypeScript interfaces
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
└── template.yaml                      # AWS SAM template
```

### **Connection Pooling Pattern**

```typescript
// db/connection.ts
import { Pool } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let pool: Pool | null = null;
let credentials: any = null;

async function getCredentials() {
  if (credentials) return credentials;
  
  const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: 'meloyjudge/rds/credentials' })
  );
  
  credentials = JSON.parse(response.SecretString!);
  return credentials;
}

export async function getDbPool(): Promise<Pool> {
  if (pool) return pool;
  
  const creds = await getCredentials();
  
  pool = new Pool({
    host: creds.host,
    port: creds.port,
    user: creds.username,
    password: creds.password,
    database: creds.dbname,
    max: 1,  // IMPORTANT: Lambda should use max 1 connection per container
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  
  // Handle connection errors
  pool.on('error', (err) => {
    console.error('Unexpected database error', err);
    pool = null;  // Force reconnection on next invocation
  });
  
  return pool;
}
```

**Why `max: 1`?**
- Each Lambda container handles one request at a time
- Multiple connections per container waste resources
- RDS Proxy will handle connection pooling across Lambdas

### **Query Organization Pattern**

```typescript
// db/queries/events.ts
import { getDbPool } from '../connection';

export async function listEvents(status?: string) {
  const pool = await getDbPool();
  
  const query = status 
    ? 'SELECT * FROM events WHERE status = $1 ORDER BY start_date DESC'
    : 'SELECT * FROM events ORDER BY start_date DESC';
    
  const params = status ? [status] : [];
  const result = await pool.query(query, params);
  return result.rows;
}

export async function getEventById(eventId: string) {
  const pool = await getDbPool();
  const result = await pool.query(
    'SELECT * FROM events WHERE id = $1',
    [eventId]
  );
  return result.rows[0] || null;
}

export async function createEvent(eventData: any, userId: string) {
  const pool = await getDbPool();
  
  // Use parameterized queries to prevent SQL injection
  const result = await pool.query(
    `INSERT INTO events 
     (name, event_type, start_date, end_date, location, description, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      eventData.name,
      eventData.eventType,
      eventData.startDate,
      eventData.endDate,
      eventData.location,
      eventData.description,
      userId
    ]
  );
  
  return result.rows[0];
}

export async function updateEvent(eventId: string, updates: any) {
  const pool = await getDbPool();
  
  // Build dynamic UPDATE query based on provided fields
  const fields = Object.keys(updates);
  const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
  const values = [eventId, ...Object.values(updates)];
  
  const result = await pool.query(
    `UPDATE events SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1 
     RETURNING *`,
    values
  );
  
  return result.rows[0];
}
```

---

## 🔒 Security Architecture

### **Multi-Layer Security Approach**

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Transport Security                                 │
│ • API Gateway enforces HTTPS (TLS 1.2+)                    │
│ • No HTTP endpoints exposed                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: CORS Protection                                    │
│ • Whitelist only Amplify domain                            │
│ • No wildcard origins in production                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Rate Limiting                                      │
│ • API Gateway throttling (1000 req/sec per user)           │
│ • Burst limit: 2000 requests                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Authentication (CAS + JWT)                         │
│ • CAS validates NetID credentials                           │
│ • JWT tokens for session management (8hr expiry)            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Authorization (Role-Based)                         │
│ • Every protected endpoint checks user role                 │
│ • Admin-only routes reject non-admin users                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: Input Validation                                   │
│ • Validate all inputs against schemas                       │
│ • Parameterized queries prevent SQL injection               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 7: Database Security                                  │
│ • RDS credentials in Secrets Manager (no hardcoding)        │
│ • Will migrate to private RDS + RDS Proxy                   │
│ • Least privilege IAM roles                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 8: Audit Logging                                      │
│ • All API calls logged to CloudWatch                        │
│ • activity_log table tracks user actions                    │
│ • Failed auth attempts monitored                            │
└─────────────────────────────────────────────────────────────┘
```

### **Security Best Practices (Cost-Effective)**

#### 1. **Secrets Management** (Cost: ~$0.40/month)
```typescript
// ✅ CORRECT: Use Secrets Manager
const creds = await secretsManager.getSecretValue({ 
  SecretId: 'meloyjudge/rds/credentials' 
});

// ❌ WRONG: Hardcoded credentials
const password = 'nAIX_$*>48]<XsV[>$Usn5Xu4<E*';
```

**Enable Secrets Rotation**:
- Automatic rotation every 30-90 days
- Lambda rotator function (AWS provides template)
- Zero downtime credential updates

#### 2. **SQL Injection Prevention** (Cost: $0)
```typescript
// ✅ CORRECT: Parameterized queries
pool.query('SELECT * FROM users WHERE email = $1', [userEmail]);

// ❌ WRONG: String concatenation
pool.query(`SELECT * FROM users WHERE email = '${userEmail}'`);
```

#### 3. **Input Validation** (Cost: $0)
```typescript
// utils/validation.ts
import Joi from 'joi';

export const eventSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  eventType: Joi.string().valid('aggies-invent', 'problems-worth-solving').required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  location: Joi.string().max(255).required(),
});

// In handler
export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  
  const { error, value } = eventSchema.validate(body);
  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.details[0].message }),
    };
  }
  
  // Proceed with validated data
  const newEvent = await eventQueries.createEvent(value, userId);
  return { statusCode: 201, body: JSON.stringify(newEvent) };
};
```

#### 4. **Role-Based Access Control** (Cost: $0)
```typescript
// utils/authorization.ts
export function requireRole(allowedRoles: string[]) {
  return (event: APIGatewayProxyEvent) => {
    const userRole = event.requestContext.authorizer?.lambda?.role;
    
    if (!allowedRoles.includes(userRole)) {
      throw new Error('Forbidden');
    }
  };
}

// In handler
export const handler: APIGatewayProxyHandler = async (event) => {
  requireRole(['admin', 'moderator'])(event);
  
  // Only admins/moderators reach here
  const newEvent = await eventQueries.createEvent(eventData, userId);
  return { statusCode: 201, body: JSON.stringify(newEvent) };
};
```

#### 5. **API Gateway Security** (Cost: Included)
```yaml
# template.yaml
Resources:
  MyHttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowOrigins:
          - 'https://your-app.amplifyapp.com'  # Only your domain
        AllowMethods:
          - GET
          - POST
          - PUT
          - PATCH
          - DELETE
        AllowHeaders:
          - Content-Type
          - Authorization
        MaxAge: 300
      ThrottleSettings:
        RateLimit: 1000
        BurstLimit: 2000
```

#### 6. **Least Privilege IAM** (Cost: $0)
```yaml
# Lambda execution role
LambdaExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole
    Policies:
      - PolicyName: SecretsManagerAccess
        PolicyDocument:
          Statement:
            - Effect: Allow
              Action:
                - secretsmanager:GetSecretValue
              Resource: !Ref RDSCredentialsSecret  # Specific secret only
      - PolicyName: CloudWatchLogs
        PolicyDocument:
          Statement:
            - Effect: Allow
              Action:
                - logs:CreateLogGroup
                - logs:CreateLogStream
                - logs:PutLogEvents
              Resource: !Sub 'arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/*'
```

#### 7. **Database Connection Security** (Cost: $0)
```typescript
// Enforce SSL connections (important when RDS is public)
const pool = new Pool({
  host: creds.host,
  port: creds.port,
  user: creds.username,
  password: creds.password,
  database: creds.dbname,
  ssl: {
    rejectUnauthorized: true,  // Verify RDS certificate
    ca: fs.readFileSync('/opt/rds-ca-bundle.pem'),  // AWS RDS CA bundle
  },
});
```

#### 8. **Audit Logging** (Cost: CloudWatch Logs ~$0.50/GB)
```typescript
// Log all important actions
async function logActivity(userId: string, action: string, details: any) {
  await pool.query(
    `INSERT INTO activity_log (user_id, action, details, ip_address)
     VALUES ($1, $2, $3, $4)`,
    [userId, action, JSON.stringify(details), ipAddress]
  );
  
  // Also log to CloudWatch
  console.log(JSON.stringify({
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  }));
}

// In handlers
await logActivity(userId, 'EVENT_CREATED', { eventId: newEvent.id });
await logActivity(userId, 'SCORE_SUBMITTED', { teamId, score });
```

#### 9. **Error Handling (No Information Leakage)** (Cost: $0)
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

// In handlers
try {
  const user = await userQueries.findByNetId(netId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
} catch (error) {
  console.error('Error details:', error);  // Log full error
  
  // Return sanitized error to client
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({ error: error.message }),
    };
  }
  
  // Never expose internal errors to client
  return {
    statusCode: 500,
    body: JSON.stringify({ error: 'Internal server error' }),
  };
}
```

---

## 💰 Cost Optimization Strategies

### **Current Monthly Cost Estimate**

| Service | Usage | Cost | Notes |
|---------|-------|------|-------|
| **Amplify Hosting** | 10GB storage, 100GB bandwidth | $1-2 | Static hosting is cheap |
| **API Gateway** | 1M requests/month | $3.50 | HTTP API cheaper than REST |
| **Lambda** | 1M requests, 512MB, 500ms avg | $0.83 | Generous free tier |
| **RDS db.t3.micro** | Single-AZ, 20GB storage | $15-20 | Can scale up later |
| **Secrets Manager** | 1 secret | $0.40 | Minimal API calls |
| **CloudWatch Logs** | 2GB logs/month | $1 | Basic monitoring |
| **Data Transfer** | 10GB out | $0.90 | First GB free |
| **Total (Public RDS)** | | **~$23/month** | Current architecture |

### **Future Cost (Private RDS with Proxy)**

| Service | Additional Cost | Notes |
|---------|----------------|-------|
| **RDS Proxy** | $10.80 | ~$0.015/hour |
| **NAT Gateway** | $32-35 | Can avoid with VPC Endpoints |
| **VPC Endpoints** | $7-10 | Cheaper than NAT for AWS services |
| **Total (Private RDS)** | **~$40-50/month** | Production-ready |

### **Cost Optimization Tactics**

#### 1. **Use HTTP API (not REST API)** - Save 70%
- REST API: $3.50/million requests
- HTTP API: $1.00/million requests
- **Savings**: $2.50/million

#### 2. **Avoid NAT Gateway with VPC Endpoints** - Save $25/month
```yaml
# Instead of NAT Gateway for Secrets Manager access
VPCEndpointSecretsManager:
  Type: AWS::EC2::VPCEndpoint
  Properties:
    VpcId: !Ref VPC
    ServiceName: !Sub 'com.amazonaws.${AWS::Region}.secretsmanager'
    VpcEndpointType: Interface
    PrivateDnsEnabled: true
    SubnetIds:
      - !Ref PrivateSubnet1
      - !Ref PrivateSubnet2
```

**Cost**: $7.20/month vs. $32/month for NAT Gateway

#### 3. **Right-Size Lambda** - Save on execution time
```yaml
# Start small, scale up if needed
MemorySize: 512  # Don't over-provision
Timeout: 10      # Long enough for DB queries, not excessive
```

**Tip**: Monitor CloudWatch metrics, increase only if hitting limits

#### 4. **Use Reserved Instances for RDS** - Save 40%
- On-Demand db.t3.micro: $0.017/hour = $12.50/month
- 1-year Reserved: $0.010/hour = $7.50/month
- **Savings**: $5/month (40% discount)

**Only commit if project is long-term**

#### 5. **Optimize CloudWatch Logs** - Save on retention
```yaml
LogGroup:
  Type: AWS::Logs::LogGroup
  Properties:
    LogGroupName: /aws/lambda/meloy-judge
    RetentionInDays: 7  # Not 30+ unless required
```

**Cost**: $0.50/GB/month * 0.5GB = $0.25 vs. $1+

#### 6. **Use S3 for Large Files** - Don't store in RDS
- Sponsor logos, team photos → S3
- Reference S3 URLs in database
- **Benefit**: RDS storage is expensive ($0.115/GB vs. S3 $0.023/GB)

#### 7. **Schedule RDS for Events Only** (Advanced)
If app is only used during competitions:
- Stop RDS when not in use (saves ~$12/month)
- **Warning**: Manual process, 7-day max stop

---

## 📊 API Endpoints Reference

### **Authentication**
| Method | Endpoint | Handler | Auth Required | Role |
|--------|----------|---------|---------------|------|
| GET | `/auth/login` | Redirect to CAS | No | - |
| GET | `/auth/cas-callback` | Validate ticket | No | - |
| POST | `/auth/logout` | Clear session | Yes | All |
| GET | `/auth/me` | Get current user | Yes | All |

### **Events**
| Method | Endpoint | Handler | Auth Required | Role |
|--------|----------|---------|---------------|------|
| GET | `/events` | List events | Yes | All |
| POST | `/events` | Create event | Yes | Admin |
| GET | `/events/{id}` | Event details | Yes | All |
| PATCH | `/events/{id}` | Update event | Yes | Admin/Moderator |
| GET | `/events/{id}/leaderboard` | Real-time rankings | Yes | All |
| PATCH | `/events/{id}/active-team` | Set current team | Yes | Moderator |

### **Teams**
| Method | Endpoint | Handler | Auth Required | Role |
|--------|----------|---------|---------------|------|
| GET | `/events/{eventId}/teams` | List teams | Yes | All |
| POST | `/teams` | Register team | Yes | Admin |
| GET | `/teams/{id}` | Team details | Yes | All |
| GET | `/teams/{id}/scores` | Team's scores | Yes | All |
| PATCH | `/teams/{id}` | Update team | Yes | Admin |

### **Scoring**
| Method | Endpoint | Handler | Auth Required | Role |
|--------|----------|---------|---------------|------|
| GET | `/rubric` | Get criteria | Yes | All |
| POST | `/scores` | Submit score | Yes | Judge |
| GET | `/scores/judge/{judgeId}` | Judge's history | Yes | Judge/Admin |
| GET | `/scores/team/{teamId}` | All scores for team | Yes | All |

### **Admin**
| Method | Endpoint | Handler | Auth Required | Role |
|--------|----------|---------|---------------|------|
| GET | `/admin/users` | List users | Yes | Admin |
| POST | `/admin/users` | Create user | Yes | Admin |
| PATCH | `/admin/users/{id}` | Update user | Yes | Admin |
| GET | `/admin/activity-log` | Audit trail | Yes | Admin |

---

## 🧪 Testing Strategy

### **Phase 1: Unit Tests**
```typescript
// tests/unit/queries/events.test.ts
import { listEvents, createEvent } from '../../../src/db/queries/events';

describe('Event Queries', () => {
  it('should list all events', async () => {
    const events = await listEvents();
    expect(Array.isArray(events)).toBe(true);
  });
  
  it('should filter events by status', async () => {
    const activeEvents = await listEvents('active');
    expect(activeEvents.every(e => e.status === 'active')).toBe(true);
  });
});
```

### **Phase 2: Integration Tests**
```typescript
// tests/integration/handlers/events.test.ts
import { handler } from '../../../src/handlers/events/list';

describe('List Events Handler', () => {
  it('should return 401 without token', async () => {
    const event = { headers: {} };
    const response = await handler(event as any, {} as any, {} as any);
    expect(response.statusCode).toBe(401);
  });
  
  it('should return events with valid token', async () => {
    const token = generateTestToken({ role: 'judge' });
    const event = {
      headers: { Authorization: `Bearer ${token}` },
      requestContext: { authorizer: { lambda: { role: 'judge' } } },
    };
    const response = await handler(event as any, {} as any, {} as any);
    expect(response.statusCode).toBe(200);
  });
});
```

### **Phase 3: End-to-End Tests**
Use Postman collections or Bruno for API testing:
```json
{
  "name": "Create Event",
  "request": {
    "method": "POST",
    "url": "{{base_url}}/events",
    "headers": {
      "Authorization": "Bearer {{auth_token}}",
      "Content-Type": "application/json"
    },
    "body": {
      "name": "Spring 2026 Aggies Invent",
      "eventType": "aggies-invent",
      "startDate": "2026-03-15T09:00:00Z",
      "endDate": "2026-03-16T18:00:00Z",
      "location": "Zachry Engineering Center"
    }
  }
}
```

---

## 📝 Deployment Checklist

### **Pre-Deployment**
- [ ] All Lambda functions have unit tests
- [ ] Integration tests pass locally
- [ ] Environment variables documented
- [ ] Secrets Manager configured
- [ ] IAM roles follow least privilege
- [ ] Error handling implemented
- [ ] Input validation on all endpoints
- [ ] CORS configured correctly

### **Deployment**
- [ ] SAM/Serverless template validated
- [ ] Deploy to dev/staging first
- [ ] Test all endpoints in staging
- [ ] CloudWatch alarms configured
- [ ] API Gateway throttling enabled
- [ ] Lambda concurrency limits set

### **Post-Deployment**
- [ ] Frontend updated with API URL
- [ ] End-to-end testing from frontend
- [ ] Monitor CloudWatch logs
- [ ] Check RDS connection pool usage
- [ ] Verify CAS authentication flow
- [ ] Test role-based authorization

### **Security Audit**
- [ ] No hardcoded credentials
- [ ] Secrets rotation enabled
- [ ] SSL/TLS enforced everywhere
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] Error messages don't leak info
- [ ] Activity logging working
- [ ] CORS allows only Amplify domain

---

## 🚀 Future Enhancements

### **Post-MVP Features**
1. **Real-Time Updates**: WebSocket API for live leaderboard
2. **Analytics Dashboard**: Judge participation metrics, score distributions
3. **Email Notifications**: Score submissions, event reminders
4. **Mobile App**: React Native app with same API backend
5. **Multi-Event Support**: Judges can work multiple events simultaneously
6. **Score Export**: CSV/PDF reports for organizers
7. **Team Self-Registration**: QR code-based check-in

### **Infrastructure Improvements**
1. **CI/CD Pipeline**: GitHub Actions for automated testing/deployment
2. **Blue-Green Deployment**: Zero-downtime updates
3. **CloudFront CDN**: Faster frontend loading globally
4. **Aurora Serverless**: Auto-scaling database (if needed)
5. **DynamoDB for Sessions**: Faster session storage than RDS

---

## 📚 Resources

### **AWS Documentation**
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway Security](https://docs.aws.amazon.com/apigateway/latest/developerguide/security.html)
- [RDS Proxy](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html)
- [Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)

### **TAMU CAS**
- [CAS Protocol](https://apereo.github.io/cas/6.6.x/protocol/CAS-Protocol.html)
- [TAMU IT Documentation](https://it.tamu.edu/services/identity-access/)

### **Tools**
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- [Bruno API Client](https://www.usebruno.com/)
- [PostgreSQL Node Driver (pg)](https://node-postgres.com/)

---

## 🔄 Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-20 | 1.0 | Initial roadmap created |

---

**Questions or Blockers?** Update this document as the project evolves.
