# Meloy Judging Portal - Lambda API Backend

Backend API for the Meloy Judging Portal built with AWS Lambda, API Gateway, and RDS PostgreSQL.

## 🏗️ Architecture

```
Frontend (Amplify) → API Gateway → Lambda → RDS (PostgreSQL)
                                      ↓
                                Secrets Manager
```

## 📋 Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS SAM CLI installed
- PostgreSQL client (for local testing)
- Access to AWS account with RDS instance

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd lambda
npm install
```

### 2. Set Up Environment Variables

Create `.env` file for local testing:

```bash
# AWS Configuration
AWS_REGION=us-east-1
RDS_SECRET_ARN=arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:meloyjudge/rds/credentials
JWT_SECRET_ARN=arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:meloyjudge/jwt/secret
CAS_SERVICE_URL=http://localhost:3000/auth/callback

# Local Development
NODE_ENV=development
```

### 3. Build TypeScript

```bash
npm run build
```

### 4. Test Locally with SAM

```bash
# Start local API
sam local start-api

# API will be available at http://127.0.0.1:3000
```

### 5. Test Endpoints

```bash
# Test CAS callback (mock)
curl "http://127.0.0.1:3000/auth/cas-callback?ticket=ST-12345"

# Test with auth token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://127.0.0.1:3000/auth/me
```

## 📦 Project Structure

```
lambda/
├── src/
│   ├── db/
│   │   ├── connection.ts          # Database pool management
│   │   └── queries/
│   │       ├── users.ts          # User queries
│   │       └── index.ts          # Export all queries
│   ├── handlers/
│   │   └── auth/
│   │       └── cas-callback.ts   # CAS authentication handler
│   ├── utils/
│   │   ├── jwt.ts               # JWT token management
│   │   ├── secrets.ts           # Secrets Manager client
│   │   ├── validation.ts        # Request validation
│   │   ├── errors.ts            # Custom error classes
│   │   └── response.ts          # API response helpers
│   └── types/
│       └── index.ts             # TypeScript types
├── dist/                        # Compiled JavaScript (gitignored)
├── package.json
├── tsconfig.json
├── template.yaml               # AWS SAM template
└── README.md
```

## 🔧 Development Workflow

### Build and Watch

```bash
# Build once
npm run build

# Watch for changes
npm run watch
```

### Running Tests

```bash
npm test
```

### Code Style

TypeScript with strict mode enabled. Run build to check for type errors:

```bash
npm run build
```

## 🌐 Deployment

### Deploy to AWS

```bash
# Build
npm run build

# Deploy with SAM
sam build
sam deploy --guided

# Follow prompts to configure:
# - Stack name: meloy-judge-api
# - AWS Region: us-east-1
# - RDS Secret ARN
# - JWT Secret ARN
# - CAS Service URL
```

### Update Existing Deployment

```bash
npm run build
sam build
sam deploy
```

## 📝 API Endpoints

See [API_ENDPOINTS_SPECIFICATION.md](../API_ENDPOINTS_SPECIFICATION.md) for full documentation.

### Implemented (MVP - Phase 1)

- `GET /auth/cas-callback` - CAS authentication callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout user
- `GET /events` - List events
- `GET /events/{id}` - Get event details

### Coming Soon

- Team management endpoints
- Scoring endpoints
- Leaderboard endpoints
- Admin endpoints

## 🔒 Security

### Secrets Management

All sensitive data stored in AWS Secrets Manager:

**RDS Credentials** (`meloyjudge/rds/credentials`):
```json
{
  "host": "meloyjudgeportal-db.xxx.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "username": "judgetoolmaster",
  "password": "YOUR_PASSWORD",
  "dbname": "judging_app"
}
```

**JWT Secret** (`meloyjudge/jwt/secret`):
```json
{
  "jwtSecret": "YOUR_RANDOM_SECRET_KEY"
}
```

### Create Secrets

```bash
# RDS credentials
aws secretsmanager create-secret \
  --name meloyjudge/rds/credentials \
  --secret-string '{
    "host":"meloyjudgeportal-db.xxx.us-east-1.rds.amazonaws.com",
    "port":5432,
    "username":"judgetoolmaster",
    "password":"YOUR_PASSWORD",
    "dbname":"judging_app"
  }'

# JWT secret (generate random key)
aws secretsmanager create-secret \
  --name meloyjudge/jwt/secret \
  --secret-string '{"jwtSecret":"'$(openssl rand -base64 32)'"}'
```

## 🔍 Debugging

### View Lambda Logs

```bash
# View logs in CloudWatch
sam logs -n CasCallbackFunction --tail

# Or use AWS CLI
aws logs tail /aws/lambda/meloy-judge-api-CasCallbackFunction --follow
```

### Local Debugging

```bash
# Run with debug logging
DEBUG=* sam local start-api
```

## 📊 Monitoring

Key metrics to monitor in CloudWatch:
- Lambda invocation count
- Lambda duration
- Lambda errors
- API Gateway 4xx/5xx errors
- RDS connection count

## 🚨 Troubleshooting

### "Cannot connect to database"
- Check RDS security group allows Lambda
- Verify RDS is in same VPC as Lambda
- Confirm Secrets Manager has correct credentials

### "Token expired"
- Tokens expire after 8 hours
- Frontend should refresh on 401 responses

### "CAS validation failed"
- Verify CAS_SERVICE_URL matches frontend callback URL
- Check TAMU CAS server is accessible
- Ensure ticket is one-time use (not replayed)

## 📚 Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [TAMU CAS Documentation](https://it.tamu.edu/services/identity-access/)
- [PostgreSQL Node Driver](https://node-postgres.com/)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run `npm run build` to check types
4. Test locally with SAM
5. Deploy to dev environment
6. Submit PR

---

**Questions?** Check the [IMPLEMENTATION_ROADMAP.md](../IMPLEMENTATION_ROADMAP.md) for full project overview.
