-- Migration: Add support for multiple authentication providers (Auth0, NetID, etc.)
-- Purpose: Enable seamless transition between auth providers without breaking existing data
-- Date: 2026-02-06

-- Add new columns to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'local' CHECK (auth_provider IN ('local', 'auth0', 'netid')),
    ADD COLUMN IF NOT EXISTS auth_provider_id VARCHAR(255), -- Store Auth0 sub, NetID UIN, etc.
    ADD COLUMN IF NOT EXISTS auth_metadata JSONB; -- Store additional auth provider data

-- Make password_hash nullable (not needed for OAuth providers)
ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;

-- Create index for fast lookups by auth provider
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider, auth_provider_id);

-- Update existing users to 'local' provider if not already set
UPDATE users 
SET auth_provider = 'local' 
WHERE auth_provider IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: local (password), auth0, netid';
COMMENT ON COLUMN users.auth_provider_id IS 'Unique identifier from auth provider (Auth0 sub, NetID UIN, etc.)';
COMMENT ON COLUMN users.auth_metadata IS 'Additional metadata from auth provider (profile pic, org, etc.)';

-- Create a unique constraint to prevent duplicate auth provider accounts
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_provider_unique 
    ON users(auth_provider, auth_provider_id) 
    WHERE auth_provider_id IS NOT NULL;
