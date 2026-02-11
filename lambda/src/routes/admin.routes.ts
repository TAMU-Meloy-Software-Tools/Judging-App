import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { query, transaction } from '../db/connection';

const router = Router();

// ==================== ADMIN UTILITIES ====================

/**
 * Run Auth Provider Migration
 * Adds support for Auth0, NetID, and other OAuth providers
 */
router.post('/migrate-auth-providers', async (_req, res) => {
    try {
        console.log('🔧 Starting auth provider migration...');

        await transaction(async (client) => {
            // Check if columns already exist
            const checkColumns = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                    AND column_name IN ('auth_provider', 'auth_provider_id', 'auth_metadata')
            `);

            if (checkColumns.rows.length === 3) {
                console.log('⚠️  Auth provider columns already exist, skipping migration');
                return;
            }

            console.log('Adding auth provider columns...');
            
            // Add new columns
            await client.query(`
                ALTER TABLE users
                    ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'local' 
                        CHECK (auth_provider IN ('local', 'auth0', 'netid')),
                    ADD COLUMN IF NOT EXISTS auth_provider_id VARCHAR(255),
                    ADD COLUMN IF NOT EXISTS auth_metadata JSONB
            `);

            // Make password_hash nullable (not needed for OAuth providers)
            await client.query(`
                ALTER TABLE users
                    ALTER COLUMN password_hash DROP NOT NULL
            `);

            // Create index for fast lookups by auth provider
            await client.query(`
                CREATE INDEX IF NOT EXISTS idx_users_auth_provider 
                    ON users(auth_provider, auth_provider_id)
            `);

            // Update existing users to 'local' provider if not already set
            await client.query(`
                UPDATE users 
                SET auth_provider = 'local' 
                WHERE auth_provider IS NULL
            `);

            // Create a unique constraint to prevent duplicate auth provider accounts
            await client.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_provider_unique 
                    ON users(auth_provider, auth_provider_id) 
                    WHERE auth_provider_id IS NOT NULL
            `);

            console.log('✅ Auth provider migration completed successfully!');
        });

        res.json({ 
            message: 'Auth provider migration completed successfully',
            changes: [
                'Added auth_provider column (local, auth0, netid)',
                'Added auth_provider_id column',
                'Added auth_metadata JSONB column',
                'Made password_hash nullable',
                'Created indexes for performance',
                'Added unique constraint for auth providers'
            ]
        });
    } catch (error: any) {
        console.error('❌ Auth provider migration error:', error);
        res.status(500).json({ 
            error: 'Failed to run auth provider migration',
            details: error.message
        });
    }
});

/**
 * Add judge_user_id column to events table
 * Allows each event to have a dedicated judge account
 */
router.post('/migrate-judge-account', async (_req, res) => {
    try {
        console.log('🔧 Starting judge account migration...');

        await transaction(async (client) => {
            // Check if column already exists
            const checkColumn = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'events' 
                    AND column_name = 'judge_user_id'
            `);

            if (checkColumn.rows.length > 0) {
                console.log('⚠️  judge_user_id column already exists, skipping migration');
                return;
            }

            console.log('Adding judge_user_id column to events table...');
            
            await client.query(`
                ALTER TABLE events 
                ADD COLUMN judge_user_id UUID REFERENCES users(id) ON DELETE SET NULL
            `);

            console.log('✅ Judge account migration completed successfully!');
        });

        res.json({ 
            message: 'Judge account migration completed successfully',
            changes: [
                'Added judge_user_id column to events table',
                'Each event can now have a dedicated judge account'
            ]
        });
    } catch (error: any) {
        console.error('❌ Judge account migration error:', error);
        res.status(500).json({ 
            error: 'Failed to run judge account migration',
            details: error.message
        });
    }
});

/**
 * Set judge account for LANL Aggies Invent event
 * Sets abhivur@gmail.com as the judge account
 */
router.post('/set-lanl-judge-account', async (_req, res) => {
    try {
        console.log('🔧 Setting judge account for LANL Aggies Invent...');

        await transaction(async (client) => {
            // Find the user with email abhivur@gmail.com
            const user = await client.query(
                'SELECT id, email, name, role FROM users WHERE email = $1',
                ['abhivur@gmail.com']
            );

            if (user.rows.length === 0) {
                throw new Error('User abhivur@gmail.com not found');
            }

            const userId = user.rows[0].id;
            console.log(`Found user: ${user.rows[0].name} (${user.rows[0].email}), role: ${user.rows[0].role}`);

            // Find the LANL Aggies Invent event (or Spring 2026 Aggies Invent)
            const event = await client.query(
                `SELECT id, name FROM events 
                 WHERE name ILIKE '%aggies%invent%' 
                 ORDER BY created_at DESC 
                 LIMIT 1`
            );

            if (event.rows.length === 0) {
                throw new Error('Aggies Invent event not found');
            }

            const eventId = event.rows[0].id;
            const eventName = event.rows[0].name;
            console.log(`Found event: ${eventName}`);

            // Update the event to set the judge account
            await client.query(
                'UPDATE events SET judge_user_id = $1 WHERE id = $2',
                [userId, eventId]
            );

            console.log(`✅ Set ${user.rows[0].email} as judge account for ${eventName}`);
        });

        res.json({ 
            message: 'Judge account set successfully',
            details: 'abhivur@gmail.com is now the judge account for LANL Aggies Invent'
        });
    } catch (error: any) {
        console.error('❌ Set judge account error:', error);
        res.status(500).json({ 
            error: 'Failed to set judge account',
            details: error.message
        });
    }
});

/**
 * Test endpoint to verify admin routes work
 */
router.get('/test', async (_req, res) => {
    res.json({ message: 'Admin routes are working!', timestamp: new Date().toISOString() });
});

/**
 * Initialize database schema
 * WARNING: Admin endpoint - drops all tables and recreates them
 */
router.post('/init-schema', async (_req, res) => {
    try {
        console.log('🔧 Starting schema initialization...');

        await transaction(async (client) => {
            // Drop all tables
            console.log('Dropping existing tables...');
            await client.query('DROP TABLE IF EXISTS activity_log CASCADE');
            await client.query('DROP TABLE IF EXISTS judge_comments CASCADE');
            await client.query('DROP TABLE IF EXISTS scores CASCADE');
            await client.query('DROP TABLE IF EXISTS score_submissions CASCADE');
            await client.query('DROP TABLE IF EXISTS judge_sessions CASCADE');
            await client.query('DROP TABLE IF EXISTS team_members CASCADE');
            await client.query('DROP TABLE IF EXISTS teams CASCADE');
            await client.query('DROP TABLE IF EXISTS event_judges CASCADE');
            await client.query('DROP TABLE IF EXISTS sponsors CASCADE');
            await client.query('DROP TABLE IF EXISTS events CASCADE');
            await client.query('DROP TABLE IF EXISTS rubric_criteria CASCADE');
            await client.query('DROP TABLE IF EXISTS password_reset_tokens CASCADE');
            await client.query('DROP TABLE IF EXISTS users CASCADE');
            await client.query('DROP TABLE IF EXISTS schema_version CASCADE');

            console.log('Enabling extensions...');
            await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
            await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

            console.log('Creating users table...');
            await client.query(`
                CREATE TABLE users (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    role VARCHAR(20) NOT NULL DEFAULT 'judge' CHECK (role IN ('judge', 'admin', 'moderator')),
                    is_active BOOLEAN DEFAULT true,
                    last_login TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Creating sponsors table...');
            await client.query(`
                CREATE TABLE sponsors (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name VARCHAR(255) NOT NULL,
                    logo_url TEXT,
                    primary_color VARCHAR(7) DEFAULT '#500000',
                    secondary_color VARCHAR(7) DEFAULT '#FFFFFF',
                    text_color VARCHAR(7) DEFAULT '#FFFFFF',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Creating events table...');
            await client.query(`
                CREATE TABLE events (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name VARCHAR(255) NOT NULL,
                    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('aggies-invent', 'problems-worth-solving')),
                    duration VARCHAR(100),
                    start_date TIMESTAMP,
                    end_date TIMESTAMP,
                    location VARCHAR(255),
                    description TEXT,
                    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
                    judging_phase VARCHAR(20) DEFAULT 'not-started' CHECK (judging_phase IN ('not-started', 'in-progress', 'ended')),
                    current_active_team_id UUID,
                    sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
                    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Creating teams table...');
            await client.query(`
                CREATE TABLE teams (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL,
                    project_title VARCHAR(255),
                    description TEXT,
                    presentation_order INTEGER,
                    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
                    project_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(event_id, name),
                    UNIQUE(event_id, presentation_order)
                )
            `);

            console.log('Adding FK constraint for current_active_team_id...');
            await client.query(`
                ALTER TABLE events ADD CONSTRAINT fk_current_active_team 
                FOREIGN KEY (current_active_team_id) REFERENCES teams(id) ON DELETE SET NULL
            `);

            console.log('Creating team_members table...');
            await client.query(`
                CREATE TABLE team_members (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Creating event_judges table (judge profiles)...');
            await client.query(`
                CREATE TABLE event_judges (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL,
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(event_id, name)
                )
            `);

            console.log('Creating judge_sessions table...');
            await client.query(`
                CREATE TABLE judge_sessions (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                    judge_id UUID REFERENCES event_judges(id) ON DELETE CASCADE,
                    logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    logged_out_at TIMESTAMP,
                    UNIQUE(event_id, judge_id, logged_in_at)
                )
            `);

            console.log('Creating rubric_criteria table...');
            await client.query(`
                CREATE TABLE rubric_criteria (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name VARCHAR(255) NOT NULL,
                    short_name VARCHAR(50),
                    description TEXT,
                    max_score INTEGER NOT NULL DEFAULT 25,
                    display_order INTEGER NOT NULL,
                    icon_name VARCHAR(50),
                    guiding_question TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(display_order)
                )
            `);

            console.log('Creating score_submissions table...');
            await client.query(`
                CREATE TABLE score_submissions (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    judge_id UUID REFERENCES event_judges(id) ON DELETE CASCADE,
                    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    submitted_at TIMESTAMP,
                    time_spent_seconds INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(judge_id, team_id)
                )
            `);

            console.log('Creating scores table...');
            await client.query(`
                CREATE TABLE scores (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    submission_id UUID REFERENCES score_submissions(id) ON DELETE CASCADE,
                    judge_id UUID REFERENCES event_judges(id) ON DELETE CASCADE,
                    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
                    rubric_criteria_id UUID REFERENCES rubric_criteria(id) ON DELETE CASCADE,
                    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 25),
                    reflection TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(judge_id, team_id, rubric_criteria_id)
                )
            `);

            console.log('Creating judge_comments table...');
            await client.query(`
                CREATE TABLE judge_comments (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    submission_id UUID REFERENCES score_submissions(id) ON DELETE CASCADE,
                    judge_id UUID REFERENCES event_judges(id) ON DELETE CASCADE,
                    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
                    comments TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(judge_id, team_id)
                )
            `);

            console.log('Creating activity_log table...');
            await client.query(`
                CREATE TABLE activity_log (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    activity_type VARCHAR(50),
                    icon_name VARCHAR(50),
                    tone VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Creating password_reset_tokens table...');
            await client.query(`
                CREATE TABLE password_reset_tokens (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    token VARCHAR(255) UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    used_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Creating indexes...');
            await client.query('CREATE INDEX idx_users_email ON users(email)');
            await client.query('CREATE INDEX idx_users_role ON users(role)');
            await client.query('CREATE INDEX idx_events_status ON events(status)');
            await client.query('CREATE INDEX idx_events_judging_phase ON events(judging_phase)');
            await client.query('CREATE INDEX idx_teams_event ON teams(event_id)');
            await client.query('CREATE INDEX idx_teams_status ON teams(status)');
            await client.query('CREATE INDEX idx_teams_presentation_order ON teams(event_id, presentation_order)');
            await client.query('CREATE INDEX idx_team_members_team ON team_members(team_id)');
            await client.query('CREATE INDEX idx_judge_sessions_event_judge ON judge_sessions(event_id, judge_id)');
            await client.query('CREATE INDEX idx_rubric_criteria_order ON rubric_criteria(display_order)');
            await client.query('CREATE INDEX idx_score_submissions_judge_team ON score_submissions(judge_id, team_id)');
            await client.query('CREATE INDEX idx_score_submissions_event ON score_submissions(event_id)');
            await client.query('CREATE INDEX idx_scores_submission ON scores(submission_id)');
            await client.query('CREATE INDEX idx_scores_judge_team ON scores(judge_id, team_id)');
            await client.query('CREATE INDEX idx_scores_team ON scores(team_id)');
            await client.query('CREATE INDEX idx_judge_comments_submission ON judge_comments(submission_id)');
            await client.query('CREATE INDEX idx_judge_comments_judge_team ON judge_comments(judge_id, team_id)');
            await client.query('CREATE INDEX idx_activity_log_event ON activity_log(event_id)');
            await client.query('CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC)');

            console.log('Inserting default rubric criteria...');
            await client.query(`
                INSERT INTO rubric_criteria (name, short_name, description, max_score, display_order, icon_name, guiding_question) VALUES
                ('Effective Communication', 'Communication', 'Was the problem urgent, the solution convincing, and the impact tangible?', 25, 1, 'Megaphone', 'Notes on clarity and messaging...'),
                ('Would Fund/Buy Solution', 'Funding', 'Consider technical feasibility, commercial viability, and novelty of the approach.', 25, 2, 'BadgeDollarSign', 'Thoughts on feasibility and potential...'),
                ('Presentation Quality', 'Presentation', 'Evaluate the demo assets, storytelling, and overall delivery.', 25, 3, 'Presentation', 'Observations on delivery and engagement...'),
                ('Team Cohesion', 'Cohesion', 'Reflect on the pitch strength, Q&A performance, and your gut confidence.', 25, 4, 'Sparkles', 'General impressions and final thoughts...')
            `);

            console.log('Creating schema_version table...');
            await client.query(`
                CREATE TABLE schema_version (
                    version VARCHAR(10) PRIMARY KEY,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            await client.query("INSERT INTO schema_version (version) VALUES ('1.1')");
        });

        console.log('✅ Schema initialized successfully!');
        res.json({ 
            message: 'Schema initialized successfully with judge profile architecture',
            version: '1.1'
        });
    } catch (error: any) {
        console.error('❌ Init schema error:', error);
        res.status(500).json({ 
            error: 'Failed to initialize schema',
            details: error.message
        });
    }
});

/**
 * Seed test data
 * WARNING: Admin endpoint - populates database with test data
 */
router.post('/seed-data', async (_req, res) => {
    try {
        console.log('🌱 Starting test data seed...');

        await transaction(async (client) => {
            // Insert users
            console.log('Inserting users...');
            await client.query(`
                INSERT INTO users (id, email, password_hash, name, role) VALUES
                ('00000000-0000-0000-0000-000000000001', 'admin@tamu.edu', '$2b$10$placeholder', 'Admin User', 'admin'),
                ('00000000-0000-0000-0000-000000000002', 'moderator@tamu.edu', '$2b$10$placeholder', 'Event Moderator', 'moderator'),
                ('00000000-0000-0000-0000-000000000003', 'judges-hackathon@tamu.edu', '$2b$10$placeholder', 'Hackathon Judges', 'judge')
            `);

            // Insert sponsors
            console.log('Inserting sponsors...');
            await client.query(`
                INSERT INTO sponsors (id, name, logo_url, primary_color, secondary_color, text_color) VALUES
                ('00000000-0000-0000-0000-000000000010', 'ExxonMobil', '/ExxonLogo.png', '#b91c1c', '#7f1d1d', '#FFFFFF')
            `);

            // Insert event
            console.log('Inserting event...');
            await client.query(`
                INSERT INTO events (id, name, event_type, duration, start_date, end_date, location, description, status, judging_phase, sponsor_id, created_by) VALUES
                ('00000000-0000-0000-0000-000000000100', 'Spring 2026 Aggies Invent', 'aggies-invent', '48 hours',
                 '2026-03-15 09:00:00', '2026-03-17 17:00:00', 'Zachry Engineering Center',
                 'Annual spring innovation competition', 'active', 'in-progress',
                 '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001')
            `);

            // Insert judge profiles
            // For testing in DEV_MODE, assign to admin user (id: 000...001)
            console.log('Inserting judge profiles...');
            await client.query(`
                INSERT INTO event_judges (id, event_id, user_id, name) VALUES
                ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Dr. Sarah Chen'),
                ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Prof. Michael Roberts'),
                ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Dr. Emily Watson'),
                ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Mr. James Miller')
            `);

            // Insert teams
            console.log('Inserting teams...');
            await client.query(`
                INSERT INTO teams (id, event_id, name, project_title, description, presentation_order, status) VALUES
                ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000100', 'Code Warriors', 'AI Task Manager', 'AI-powered task manager for students', 1, 'completed'),
                ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000100', 'Debug Squad', 'CollabCode', 'Collaborative coding platform', 2, 'completed'),
                ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000100', 'Innovation Hub', 'SmartCampus', 'IoT campus solution', 3, 'active'),
                ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000100', 'Tech Pioneers', 'EcoTrack', 'Sustainability tracking app', 4, 'waiting'),
                ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000100', 'Data Miners', 'HealthPredict', 'Predictive health analytics', 5, 'waiting')
            `);

            // Insert team members
            console.log('Inserting team members...');
            await client.query(`
                INSERT INTO team_members (team_id, name, email) VALUES
                ('00000000-0000-0000-0000-000000000301', 'Alice Johnson', 'alice@tamu.edu'),
                ('00000000-0000-0000-0000-000000000301', 'Bob Smith', 'bob@tamu.edu'),
                ('00000000-0000-0000-0000-000000000302', 'David Lee', 'david@tamu.edu'),
                ('00000000-0000-0000-0000-000000000302', 'Eva Martinez', 'eva@tamu.edu'),
                ('00000000-0000-0000-0000-000000000303', 'Frank Wilson', 'frank@tamu.edu')
            `);

            // Get criteria IDs
            const criteria = await client.query('SELECT id FROM rubric_criteria ORDER BY display_order');
            const [comm_id, fund_id, pres_id, cohe_id] = criteria.rows.map((r: any) => r.id);

            // Insert score submissions and scores
            console.log('Inserting score submissions and scores...');
            const sub1 = await client.query(`
                INSERT INTO score_submissions (id, judge_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
                VALUES ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', 
                        '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000301',
                        NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', 900)
                RETURNING id
            `);
            const sub1_id = sub1.rows[0].id;

            await client.query(`
                INSERT INTO scores (submission_id, judge_id, team_id, rubric_criteria_id, score, reflection) VALUES
                ($1, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', $2, 22, 'Excellent articulation'),
                ($1, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', $3, 24, 'Very viable'),
                ($1, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', $4, 21, 'Good demo'),
                ($1, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', $5, 23, 'Strong team')
            `, [sub1_id, comm_id, fund_id, pres_id, cohe_id]);

            await client.query(`
                INSERT INTO judge_comments (submission_id, judge_id, team_id, comments)
                VALUES ($1, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', 'Outstanding project!')
            `, [sub1_id]);

            // Add more scores for Code Warriors from other judges...
            const sub2 = await client.query(`
                INSERT INTO score_submissions (judge_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
                VALUES ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000100', 
                        '00000000-0000-0000-0000-000000000301', NOW() - INTERVAL '1 hour 30 minutes', 
                        NOW() - INTERVAL '1 hour', 1800)
                RETURNING id
            `);

            await client.query(`
                INSERT INTO scores (submission_id, judge_id, team_id, rubric_criteria_id, score) VALUES
                ($1, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000301', $2, 20),
                ($1, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000301', $3, 22),
                ($1, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000301', $4, 23),
                ($1, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000301', $5, 21)
            `, [sub2.rows[0].id, comm_id, fund_id, pres_id, cohe_id]);

            // Judge sessions
            console.log('Inserting judge sessions...');
            await client.query(`
                INSERT INTO judge_sessions (event_id, judge_id, logged_in_at, last_activity) VALUES
                ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000201', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 minutes'),
                ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000202', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 minute')
            `);

            // Activity log
            console.log('Inserting activity log...');
            await client.query(`
                INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone) VALUES
                ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Event Created', 'Spring 2026 Aggies Invent was created', 'event_created', 'Calendar', 'primary')
            `);
        });

        console.log('✅ Test data seeded successfully!');
        res.json({ message: 'Test data seeded successfully' });
    } catch (error: any) {
        console.error('❌ Seed data error:', error);
        res.status(500).json({ 
            error: 'Failed to seed data',
            details: error.message
        });
    }
});

/**
 * Get activity logs
 * Admin only - view system activity
 */
router.get('/activity', authenticate, requireRole(['admin']), async (_req, res) => {
    try {
        const activity = await query(`
            SELECT 
                al.id,
                al.event_id,
                e.name as event_name,
                al.user_id,
                u.name as user_name,
                al.title,
                al.description,
                al.activity_type,
                al.icon_name,
                al.tone,
                al.created_at as timestamp
            FROM activity_log al
            LEFT JOIN users u ON al.user_id = u.id
            LEFT JOIN events e ON al.event_id = e.id
            ORDER BY al.created_at DESC
            LIMIT 100
        `);
        res.json({ activity });
    } catch (error) {
        console.error('Activity fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

export default router;


/**
 * Add photo_url column to teams table
 */
router.post('/migrate-team-photo', async (_req, res) => {
    try {
        console.log('🔧 Starting team photo migration...');

        await transaction(async (client) => {
            // Check if column already exists
            const checkColumn = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'teams' 
                    AND column_name = 'photo_url'
            `);

            if (checkColumn.rows.length > 0) {
                console.log('⚠️  photo_url column already exists, skipping migration');
                return;
            }

            console.log('Adding photo_url column to teams table...');
            
            await client.query(`
                ALTER TABLE teams ADD COLUMN photo_url TEXT
            `);

            await client.query(`
                COMMENT ON COLUMN teams.photo_url IS 'URL to team photo (uploaded by admin)'
            `);

            console.log('✅ Team photo migration completed successfully!');
        });

        res.json({ 
            message: 'Team photo migration completed successfully',
            changes: [
                'Added photo_url column to teams table',
                'Teams can now have photos uploaded by admins'
            ]
        });
    } catch (error: any) {
        console.error('❌ Team photo migration error:', error);
        res.status(500).json({ 
            error: 'Failed to run team photo migration',
            details: error.message
        });
    }
});

/**
 * Sync judge profile user_ids with event judge accounts
 * Updates all judge profiles to use their event's dedicated judge account user_id
 */
router.post('/sync-judge-profile-users', authenticate, requireRole(['admin']), async (_req, res): Promise<void> => {
    try {
        console.log('🔧 Starting judge profile user_id sync...');

        const result = await transaction(async (client) => {
            // Get count of profiles that need updating
            const beforeCount = await client.query(`
                SELECT COUNT(*) as count
                FROM event_judges ej
                JOIN events e ON ej.event_id = e.id
                WHERE e.judge_user_id IS NOT NULL 
                AND ej.user_id != e.judge_user_id
            `);

            const profilesToUpdate = parseInt(beforeCount.rows[0].count);
            console.log(`Found ${profilesToUpdate} judge profiles that need user_id updates`);

            if (profilesToUpdate === 0) {
                console.log('⚠️  All judge profiles already have correct user_ids');
                return { profilesUpdated: 0, alreadySynced: true };
            }

            // Update all judge profiles to use their event's judge_user_id
            const updateResult = await client.query(`
                UPDATE event_judges 
                SET user_id = (
                    SELECT judge_user_id 
                    FROM events 
                    WHERE events.id = event_judges.event_id
                )
                WHERE EXISTS (
                    SELECT 1 
                    FROM events 
                    WHERE events.id = event_judges.event_id 
                    AND events.judge_user_id IS NOT NULL
                )
            `);

            console.log(`✅ Updated ${updateResult.rowCount} judge profiles with correct user_ids`);
            return { profilesUpdated: updateResult.rowCount, alreadySynced: false };
        });

        if (result.alreadySynced) {
            res.json({ 
                message: 'All judge profiles already synced',
                profilesUpdated: 0
            });
            return;
        }

        res.json({ 
            message: 'Judge profile user_ids synced successfully',
            profilesUpdated: result.profilesUpdated,
            details: 'All judge profiles now use their event\'s dedicated judge account user_id'
        });
    } catch (error: any) {
        console.error('❌ Sync judge profile users error:', error);
        res.status(500).json({ 
            error: 'Failed to sync judge profile user_ids',
            details: error.message
        });
    }
});

