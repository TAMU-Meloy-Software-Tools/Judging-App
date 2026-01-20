-- ============================================================================
-- MELOY JUDGING APP - DATABASE SCHEMA
-- PostgreSQL Schema for AWS RDS
-- Version: 1.0
-- Last Updated: January 17, 2026
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE 1: USERS & AUTHENTICATION
-- Stores all user accounts (judges, admins, moderators)
-- ============================================================================

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
);

COMMENT ON TABLE users IS 'All user accounts with authentication credentials';
COMMENT ON COLUMN users.role IS 'User role: judge (scores teams), admin (full access), moderator (controls event flow)';
COMMENT ON COLUMN users.is_active IS 'Soft disable for users without deletion';

-- ============================================================================
-- TABLE 2: EVENTS
-- Competition events with moderator control
-- ============================================================================

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
    
    -- Moderator control fields
    judging_phase VARCHAR(20) DEFAULT 'not-started' CHECK (judging_phase IN ('not-started', 'in-progress', 'ended')),
    current_active_team_id UUID, -- Which team is currently being judged (set by moderator)
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE events IS 'Competition events (Aggies Invent, Problems Worth Solving)';
COMMENT ON COLUMN events.event_type IS 'aggies-invent = team-based, problems-worth-solving = individual students';
COMMENT ON COLUMN events.judging_phase IS 'Controlled by moderator: not-started → in-progress → ended';
COMMENT ON COLUMN events.current_active_team_id IS 'Team currently presenting (moderator activates one team at a time)';

-- ============================================================================
-- TABLE 3: SPONSORS
-- Event sponsors with branding configuration
-- ============================================================================

CREATE TABLE sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#500000',
    secondary_color VARCHAR(7) DEFAULT '#FFFFFF',
    text_color VARCHAR(7) DEFAULT '#FFFFFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id)
);

COMMENT ON TABLE sponsors IS 'Sponsor branding per event (logo, colors)';
COMMENT ON COLUMN sponsors.logo_url IS 'S3 URL or base64-encoded image data';
COMMENT ON COLUMN sponsors.primary_color IS 'Hex color for gradients and banners';

-- ============================================================================
-- TABLE 4: JUDGE SESSIONS
-- Tracks judge login sessions and online status
-- ============================================================================

CREATE TABLE judge_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logged_out_at TIMESTAMP,
    UNIQUE(event_id, user_id, logged_in_at)
);

COMMENT ON TABLE judge_sessions IS 'Judge login sessions for tracking online status';
COMMENT ON COLUMN judge_sessions.last_activity IS 'Updated on each API call; judge is "online" if < 5 min ago';
COMMENT ON COLUMN judge_sessions.logged_out_at IS 'NULL = still logged in, NOT NULL = session ended';

-- ============================================================================
-- TABLE 5: TEAMS
-- Participating teams or individual students
-- ============================================================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    project_title VARCHAR(255),
    description TEXT,
    presentation_order INTEGER NOT NULL, -- Order set by admin/moderator
    
    -- Status controlled by moderator
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, name),
    UNIQUE(event_id, presentation_order)
);

COMMENT ON TABLE teams IS 'Teams (Aggies Invent) or individual students (PWS)';
COMMENT ON COLUMN teams.presentation_order IS 'Moderator sets presentation sequence (1, 2, 3, ...)';
COMMENT ON COLUMN teams.status IS 'waiting = not yet presented, active = currently presenting, completed = finished';

-- Add FK constraint for events.current_active_team_id (after teams table exists)
ALTER TABLE events ADD CONSTRAINT fk_current_active_team 
    FOREIGN KEY (current_active_team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- ============================================================================
-- TABLE 6: TEAM MEMBERS
-- Individual students on a team
-- ============================================================================

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE team_members IS 'Students on a team (for PWS events, only 1 member per team)';

-- ============================================================================
-- TABLE 7: RUBRIC CRITERIA
-- Scoring categories (global, locked once event starts)
-- ============================================================================

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
);

COMMENT ON TABLE rubric_criteria IS 'Scoring categories (Communication, Funding, Presentation, Cohesion)';
COMMENT ON COLUMN rubric_criteria.icon_name IS 'Lucide icon name for UI (e.g., Megaphone, BadgeDollarSign)';
COMMENT ON COLUMN rubric_criteria.guiding_question IS 'Placeholder text for judge reflection input';

-- ============================================================================
-- TABLE 8: SCORE SUBMISSIONS
-- Tracks judge progress per team (started, completed, time spent)
-- ============================================================================

CREATE TABLE score_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP, -- NULL = in progress, NOT NULL = completed
    time_spent_seconds INTEGER, -- Auto-calculated on submission
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, team_id)
);

COMMENT ON TABLE score_submissions IS 'Judge scoring progress (one per judge per team)';
COMMENT ON COLUMN score_submissions.submitted_at IS 'NULL = judge is still scoring, NOT NULL = judge submitted final scores';
COMMENT ON COLUMN score_submissions.time_spent_seconds IS 'Calculated as (submitted_at - started_at) for analytics';

-- ============================================================================
-- TABLE 9: SCORES
-- Individual rubric criteria scores
-- ============================================================================

CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES score_submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    rubric_criteria_id UUID REFERENCES rubric_criteria(id) ON DELETE CASCADE,
    
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 25),
    reflection TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, team_id, rubric_criteria_id)
);

COMMENT ON TABLE scores IS 'Individual scores per judge per team per criteria';
COMMENT ON COLUMN scores.reflection IS 'Judge notes/feedback for this specific criteria';

-- ============================================================================
-- TABLE 10: JUDGE COMMENTS
-- Overall feedback per team
-- ============================================================================

CREATE TABLE judge_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES score_submissions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    
    comments TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, team_id)
);

COMMENT ON TABLE judge_comments IS 'Overall comments from judge about the team (separate from per-criteria reflections)';

-- ============================================================================
-- TABLE 11: ACTIVITY LOG
-- Admin activity feed
-- ============================================================================

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
);

COMMENT ON TABLE activity_log IS 'Admin screen "Recent Activity" feed';
COMMENT ON COLUMN activity_log.activity_type IS 'event_created, judge_added, team_activated, scoring_completed, etc.';
COMMENT ON COLUMN activity_log.tone IS 'UI color tone: primary, success, warning, error';

-- ============================================================================
-- TABLE 12: PASSWORD RESET TOKENS
-- For forgot password flow
-- ============================================================================

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE password_reset_tokens IS 'Temporary tokens for password reset flow';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'NULL = unused, NOT NULL = already used (prevent reuse)';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Events
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_judging_phase ON events(judging_phase);
CREATE INDEX idx_events_created_by ON events(created_by);

-- Judge Sessions
CREATE INDEX idx_judge_sessions_event_user ON judge_sessions(event_id, user_id);
CREATE INDEX idx_judge_sessions_active ON judge_sessions(event_id, user_id, last_activity) 
    WHERE logged_out_at IS NULL;

-- Teams
CREATE INDEX idx_teams_event ON teams(event_id);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_presentation_order ON teams(event_id, presentation_order);

-- Team Members
CREATE INDEX idx_team_members_team ON team_members(team_id);

-- Rubric Criteria
CREATE INDEX idx_rubric_criteria_order ON rubric_criteria(display_order);

-- Score Submissions
CREATE INDEX idx_score_submissions_user_team ON score_submissions(user_id, team_id);
CREATE INDEX idx_score_submissions_event ON score_submissions(event_id);
CREATE INDEX idx_score_submissions_completed ON score_submissions(submitted_at) 
    WHERE submitted_at IS NOT NULL;

-- Scores
CREATE INDEX idx_scores_submission ON scores(submission_id);
CREATE INDEX idx_scores_user_team ON scores(user_id, team_id);
CREATE INDEX idx_scores_team ON scores(team_id);

-- Judge Comments
CREATE INDEX idx_judge_comments_submission ON judge_comments(submission_id);
CREATE INDEX idx_judge_comments_user_team ON judge_comments(user_id, team_id);

-- Activity Log
CREATE INDEX idx_activity_log_event ON activity_log(event_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- Password Reset Tokens
CREATE INDEX idx_password_reset_active ON password_reset_tokens(token, expires_at) 
    WHERE used_at IS NULL;

-- ============================================================================
-- TRIGGERS - Auto-update updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_score_submissions_updated_at BEFORE UPDATE ON score_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_judge_comments_updated_at BEFORE UPDATE ON judge_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGERS - Auto-calculate time_spent_seconds
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_time_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.submitted_at IS NOT NULL AND OLD.submitted_at IS NULL THEN
        NEW.time_spent_seconds = EXTRACT(EPOCH FROM (NEW.submitted_at - NEW.started_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calculate_time_spent BEFORE UPDATE ON score_submissions
    FOR EACH ROW EXECUTE FUNCTION calculate_time_spent();

-- ============================================================================
-- SEED DATA - Default Rubric Criteria
-- ============================================================================

INSERT INTO rubric_criteria (name, short_name, description, max_score, display_order, icon_name, guiding_question) VALUES
('Effective Communication', 'Communication', 'Was the problem urgent, the solution convincing, and the impact tangible?', 25, 1, 'Megaphone', 'Notes on clarity and messaging...'),
('Would Fund/Buy Solution', 'Funding', 'Consider technical feasibility, commercial viability, and novelty of the approach.', 25, 2, 'BadgeDollarSign', 'Thoughts on feasibility and potential...'),
('Presentation Quality', 'Presentation', 'Evaluate the demo assets, storytelling, and overall delivery.', 25, 3, 'Presentation', 'Observations on delivery and engagement...'),
('Team Cohesion', 'Cohesion', 'Reflect on the pitch strength, Q&A performance, and your gut confidence.', 25, 4, 'Sparkles', 'General impressions and final thoughts...');

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View: Judge online status for moderator screen
CREATE VIEW judge_online_status AS
SELECT 
    e.id as event_id,
    u.id as user_id,
    u.name as judge_name,
    js.last_activity,
    CASE 
        WHEN js.logged_out_at IS NULL AND js.last_activity > NOW() - INTERVAL '5 minutes' 
        THEN true 
        ELSE false 
    END as is_online
FROM users u
JOIN judge_sessions js ON u.id = js.user_id
JOIN events e ON js.event_id = e.id
WHERE u.role IN ('judge', 'admin', 'moderator')
  AND js.logged_out_at IS NULL;

COMMENT ON VIEW judge_online_status IS 'Real-time judge online status (online if last_activity < 5 min ago)';

-- View: Team scoring progress for event detail and moderator screens
CREATE VIEW team_scoring_progress AS
SELECT 
    t.id as team_id,
    t.event_id,
    t.name as team_name,
    t.project_title,
    t.status as moderator_status,
    t.presentation_order,
    COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL) as judges_completed,
    COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'judge' AND u.is_active = true) as total_judges,
    COALESCE(SUM(s.score), 0) as total_score,
    COALESCE(AVG(s.score), 0) as average_score,
    -- Derived status for UI
    CASE 
        WHEN t.status = 'waiting' THEN 'not-scored'
        WHEN COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL) = 0 THEN 'not-scored'
        WHEN COUNT(DISTINCT ss.user_id) FILTER (WHERE ss.submitted_at IS NOT NULL) < 
             COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'judge' AND u.is_active = true) THEN 'in-progress'
        ELSE 'scored'
    END as scoring_status
FROM teams t
CROSS JOIN users u
LEFT JOIN score_submissions ss ON t.id = ss.team_id AND ss.user_id = u.id
LEFT JOIN scores s ON t.id = s.team_id
WHERE u.role = 'judge' AND u.is_active = true
GROUP BY t.id, t.event_id, t.name, t.project_title, t.status, t.presentation_order;

COMMENT ON VIEW team_scoring_progress IS 'Team scoring status with judge completion counts';

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

-- Verify schema version
CREATE TABLE schema_version (
    version VARCHAR(10) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version) VALUES ('1.0');

COMMENT ON TABLE schema_version IS 'Schema version tracking for migrations';
