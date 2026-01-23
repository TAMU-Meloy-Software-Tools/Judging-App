# Deployment Guide

## Important: RDS Secret Configuration

**CRITICAL**: This RDS instance uses AWS-managed passwords. Always use the AWS-managed secret ARN:

```
arn:aws:secretsmanager:us-east-1:271669412379:secret:rds!db-672e4afe-9d1d-4c2b-b211-8a96c0e8bbb4-WcgwQf
```

Current Lambda secret: `meloyjudge/rds/credentials` - must be kept in sync with AWS-managed secret.

## Deployment Steps

```bash
# 1. Clean build (ensures TypeScript compilation)
rm -rf .aws-sam dist node_modules
npm install

# 2. Build Lambda functions
sam build

# 3. Deploy to AWS
sam deploy

# 4. Verify deployment
curl https://o90rhtv5i4.execute-api.us-east-1.amazonaws.com/prod/health
```

## Database Management

```bash
# Initialize schema (drops all tables)
curl -X POST https://o90rhtv5i4.execute-api.us-east-1.amazonaws.com/prod/admin/init-schema

# Seed test data
curl -X POST https://o90rhtv5i4.execute-api.us-east-1.amazonaws.com/prod/admin/seed-data
```

## Database Password

Real password: `HoZI7wt1j7>FDu|H8poOUQ|_iC|f` (from AWS-managed secret)

Database: `judging_app`
User: `judgetoolmaster`
Host: `meloyjudgeportal-db.cwlcycaiaeos.us-east-1.rds.amazonaws.com`
