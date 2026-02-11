-- Check if auth provider columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND column_name IN ('auth_provider', 'auth_provider_id', 'auth_metadata')
ORDER BY column_name;

-- Check if any Auth0 users exist
SELECT COUNT(*) as auth0_user_count 
FROM users 
WHERE auth_provider = 'auth0';
