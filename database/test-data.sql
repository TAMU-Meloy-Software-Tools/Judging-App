-- ============================================================================
-- TEST DATA FOR MELOY JUDGING APP
-- Matches schema.sql - Uses judge profiles (event_judges) for scoring
-- ============================================================================

-- Clear existing data (in reverse dependency order)
TRUNCATE TABLE scores CASCADE;
TRUNCATE TABLE judge_comments CASCADE;
TRUNCATE TABLE score_submissions CASCADE;
TRUNCATE TABLE judge_sessions CASCADE;
TRUNCATE TABLE team_members CASCADE;
TRUNCATE TABLE teams CASCADE;
TRUNCATE TABLE event_judges CASCADE;
TRUNCATE TABLE sponsors CASCADE;
TRUNCATE TABLE events CASCADE;
TRUNCATE TABLE activity_log CASCADE;
TRUNCATE TABLE users CASCADE;

-- ============================================================================
-- USERS
-- One admin, one moderator, and ONE shared judge account per event
-- ============================================================================

INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES
-- Admin account
('00000000-0000-0000-0000-000000000001', 'admin@tamu.edu', '$2b$10$placeholder', 'Admin User', 'admin', true),
-- Moderator account  
('00000000-0000-0000-0000-000000000002', 'moderator@tamu.edu', '$2b$10$placeholder', 'Event Moderator', 'moderator', true),
-- Shared judge account for Spring Hackathon (all judge profiles use this login)
('00000000-0000-0000-0000-000000000003', 'judges-hackathon@tamu.edu', '$2b$10$placeholder', 'Hackathon Judges', 'judge', true),
-- Shared judge account for Design Challenge
('00000000-0000-0000-0000-000000000004', 'judges-design@tamu.edu', '$2b$10$placeholder', 'Design Challenge Judges', 'judge', true);

-- ============================================================================
-- SPONSORS
-- ============================================================================

INSERT INTO sponsors (id, name, logo_url, primary_color, secondary_color, text_color) VALUES
('00000000-0000-0000-0000-000000000010', 'ExxonMobil', '/ExxonLogo.png', '#b91c1c', '#7f1d1d', '#FFFFFF'),
('00000000-0000-0000-0000-000000000011', 'Texas A&M Engineering', '/TAMUlogo.png', '#500000', '#3d0000', '#FFFFFF');

-- ============================================================================
-- EVENTS
-- ============================================================================

INSERT INTO events (id, name, event_type, duration, start_date, end_date, location, description, status, judging_phase, sponsor_id, created_by) VALUES
(
  '00000000-0000-0000-0000-000000000100',
  'Spring 2026 Aggies Invent',
  'aggies-invent',
  '48 hours',
  '2026-03-15 09:00:00',
  '2026-03-17 17:00:00',
  'Zachry Engineering Center',
  'Annual spring innovation competition focusing on real-world engineering challenges',
  'active',
  'in-progress',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001'
),
(
  '00000000-0000-0000-0000-000000000101',
  'Problems Worth Solving 2026',
  'problems-worth-solving',
  '24 hours',
  '2026-06-20 10:00:00',
  '2026-06-21 10:00:00',
  'Memorial Student Center',
  'Individual student competition for solving community problems',
  'upcoming',
  'not-started',
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001'
);

-- ============================================================================
-- JUDGE PROFILES (event_judges)
-- Multiple profiles per event, all sharing one login account
-- ============================================================================

-- Judge profiles for Spring Hackathon (all use judges-hackathon@tamu.edu login)
INSERT INTO event_judges (id, event_id, user_id, name) VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000003', 'Dr. Sarah Chen'),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000003', 'Prof. Michael Roberts'),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000003', 'Dr. Emily Watson'),
('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000003', 'Mr. James Miller');

-- Judge profiles for Design Challenge (all use judges-design@tamu.edu login)
INSERT INTO event_judges (id, event_id, user_id, name) VALUES
('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000004', 'Prof. Amanda Lee'),
('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000004', 'Dr. Robert Kim'),
('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000004', 'Ms. Jennifer Park');

-- ============================================================================
-- TEAMS
-- ============================================================================

INSERT INTO teams (id, event_id, name, project_title, description, presentation_order, status) VALUES
-- Teams for Spring Hackathon
('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000100', 'Code Warriors', 'AI Task Manager', 'Building an AI-powered task manager for students', 1, 'completed'),
('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000100', 'Debug Squad', 'CollabCode', 'Creating a collaborative coding platform', 2, 'completed'),
('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000100', 'Innovation Hub', 'SmartCampus', 'IoT solution for campus resource management', 3, 'active'),
('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000100', 'Tech Pioneers', 'EcoTrack', 'Sustainability tracking mobile app', 4, 'waiting'),
('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000100', 'Data Miners', 'HealthPredict', 'Predictive health analytics platform', 5, 'waiting'),
-- Teams for Design Challenge
('00000000-0000-0000-0000-000000000311', '00000000-0000-0000-0000-000000000101', 'Design Wizards', 'AccessUI', 'Accessible UI design toolkit', 1, 'waiting'),
('00000000-0000-0000-0000-000000000312', '00000000-0000-0000-0000-000000000101', 'UX Masters', 'MobileFirst', 'Mobile-first design system', 2, 'waiting');

-- ============================================================================
-- TEAM MEMBERS
-- ============================================================================

INSERT INTO team_members (team_id, name, email) VALUES
-- Code Warriors
('00000000-0000-0000-0000-000000000301', 'Alice Johnson', 'alice@tamu.edu'),
('00000000-0000-0000-0000-000000000301', 'Bob Smith', 'bob@tamu.edu'),
('00000000-0000-0000-0000-000000000301', 'Carol Davis', 'carol@tamu.edu'),
-- Debug Squad
('00000000-0000-0000-0000-000000000302', 'David Lee', 'david@tamu.edu'),
('00000000-0000-0000-0000-000000000302', 'Eva Martinez', 'eva@tamu.edu'),
-- Innovation Hub
('00000000-0000-0000-0000-000000000303', 'Frank Wilson', 'frank@tamu.edu'),
('00000000-0000-0000-0000-000000000303', 'Grace Kim', 'grace@tamu.edu'),
('00000000-0000-0000-0000-000000000303', 'Henry Chen', 'henry@tamu.edu'),
-- Tech Pioneers
('00000000-0000-0000-0000-000000000304', 'Ivy Brown', 'ivy@tamu.edu'),
('00000000-0000-0000-0000-000000000304', 'Jack Taylor', 'jack@tamu.edu'),
-- Data Miners
('00000000-0000-0000-0000-000000000305', 'Karen White', 'karen@tamu.edu'),
('00000000-0000-0000-0000-000000000305', 'Leo Garcia', 'leo@tamu.edu');

-- ============================================================================
-- SCORE SUBMISSIONS & SCORES
-- Sample completed scores for testing the leaderboard
-- ============================================================================

-- Get rubric criteria IDs (these are seeded in schema.sql)
DO $$ 
DECLARE
  comm_id UUID;
  fund_id UUID;
  pres_id UUID;
  cohe_id UUID;
  sub1_id UUID;
  sub2_id UUID;
  sub3_id UUID;
  sub4_id UUID;
BEGIN
  -- Get rubric criteria IDs by display_order
  SELECT id INTO comm_id FROM rubric_criteria WHERE display_order = 1;
  SELECT id INTO fund_id FROM rubric_criteria WHERE display_order = 2;
  SELECT id INTO pres_id FROM rubric_criteria WHERE display_order = 3;
  SELECT id INTO cohe_id FROM rubric_criteria WHERE display_order = 4;

  -- ============================================================================
  -- TEAM 1: Code Warriors - Fully scored by all 4 judges
  -- ============================================================================
  
  -- Dr. Sarah Chen scores Code Warriors
  INSERT INTO score_submissions (id, judge_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
  VALUES ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000301', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', 900)
  RETURNING id INTO sub1_id;
  
  INSERT INTO scores (submission_id, judge_id, team_id, rubric_criteria_id, score, reflection) VALUES
  (sub1_id, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', comm_id, 22, 'Excellent problem articulation'),
  (sub1_id, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', fund_id, 24, 'Very viable business model'),
  (sub1_id, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', pres_id, 21, 'Good demo, minor technical issues'),
  (sub1_id, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', cohe_id, 23, 'Strong team dynamics');
  
  INSERT INTO judge_comments (submission_id, judge_id, team_id, comments)
  VALUES (sub1_id, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', 'Outstanding project with real market potential. Recommend for top prize consideration.');

  -- Prof. Michael Roberts scores Code Warriors
  INSERT INTO score_submissions (id, judge_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
  VALUES ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000301', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 30 minutes', 1800)
  RETURNING id INTO sub2_id;
  
  INSERT INTO scores (submission_id, judge_id, team_id, rubric_criteria_id, score, reflection) VALUES
  (sub2_id, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000301', comm_id, 20, 'Clear messaging'),
  (sub2_id, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000301', fund_id, 22, 'Good potential'),
  (sub2_id, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000301', pres_id, 23, 'Engaging presentation'),
  (sub2_id, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000301', cohe_id, 21, 'Worked well together');

  -- Dr. Emily Watson scores Code Warriors
  INSERT INTO score_submissions (id, judge_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
  VALUES ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000301', NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 20 minutes', 1500)
  RETURNING id INTO sub3_id;
  
  INSERT INTO scores (submission_id, judge_id, team_id, rubric_criteria_id, score, reflection) VALUES
  (sub3_id, '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000301', comm_id, 23, 'Very persuasive'),
  (sub3_id, '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000301', fund_id, 21, 'Needs more market research'),
  (sub3_id, '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000301', pres_id, 24, 'Excellent demo'),
  (sub3_id, '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000301', cohe_id, 22, 'Good collaboration');

  -- Mr. James Miller scores Code Warriors
  INSERT INTO score_submissions (id, judge_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
  VALUES ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000301', NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour', 1800)
  RETURNING id INTO sub4_id;
  
  INSERT INTO scores (submission_id, judge_id, team_id, rubric_criteria_id, score, reflection) VALUES
  (sub4_id, '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000301', comm_id, 21, 'Good story'),
  (sub4_id, '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000301', fund_id, 23, 'Would invest'),
  (sub4_id, '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000301', pres_id, 22, 'Professional delivery'),
  (sub4_id, '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000301', cohe_id, 24, 'Exceptional teamwork');

  -- ============================================================================
  -- TEAM 2: Debug Squad - Scored by 3 judges (one pending)
  -- ============================================================================
  
  -- Dr. Sarah Chen scores Debug Squad
  INSERT INTO score_submissions (id, judge_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
  VALUES ('00000000-0000-0000-0000-000000000411', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000302', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes', 900)
  RETURNING id INTO sub1_id;
  
  INSERT INTO scores (submission_id, judge_id, team_id, rubric_criteria_id, score, reflection) VALUES
  (sub1_id, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000302', comm_id, 19, 'Good but could be clearer'),
  (sub1_id, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000302', fund_id, 20, 'Competitive market'),
  (sub1_id, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000302', pres_id, 21, 'Nice visuals'),
  (sub1_id, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000302', cohe_id, 20, 'Good teamwork');

  -- Prof. Michael Roberts scores Debug Squad
  INSERT INTO score_submissions (id, judge_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
  VALUES ('00000000-0000-0000-0000-000000000412', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000302', NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '30 minutes', 1200)
  RETURNING id INTO sub2_id;
  
  INSERT INTO scores (submission_id, judge_id, team_id, rubric_criteria_id, score, reflection) VALUES
  (sub2_id, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000302', comm_id, 18, 'Needs work on messaging'),
  (sub2_id, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000302', fund_id, 21, 'Interesting approach'),
  (sub2_id, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000302', pres_id, 19, 'Some technical difficulties'),
  (sub2_id, '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000302', cohe_id, 22, 'Strong collaboration');

  -- Dr. Emily Watson scores Debug Squad
  INSERT INTO score_submissions (id, judge_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
  VALUES ('00000000-0000-0000-0000-000000000413', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000302', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '20 minutes', 1200)
  RETURNING id INTO sub3_id;
  
  INSERT INTO scores (submission_id, judge_id, team_id, rubric_criteria_id, score, reflection) VALUES
  (sub3_id, '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000302', comm_id, 20, 'Clear problem statement'),
  (sub3_id, '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000302', fund_id, 19, 'Revenue model unclear'),
  (sub3_id, '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000302', pres_id, 22, 'Engaging speakers'),
  (sub3_id, '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000302', cohe_id, 21, 'Good synergy');

  -- Mr. James Miller has NOT scored Debug Squad yet (simulating in-progress judging)

END $$;

-- ============================================================================
-- JUDGE SESSIONS (for online status)
-- ============================================================================

INSERT INTO judge_sessions (event_id, judge_id, logged_in_at, last_activity, logged_out_at) VALUES
-- Active sessions for Spring Hackathon
('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000201', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 minutes', NULL),
('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000202', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 minute', NULL),
('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000203', NOW() - INTERVAL '2.5 hours', NOW() - INTERVAL '10 minutes', NULL),
('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000204', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', NULL);

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================

INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone) VALUES
('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Event Created', 'Spring 2026 Aggies Invent was created', 'event_created', 'Calendar', 'primary'),
('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Judge Profiles Added', '4 judge profiles created for the event', 'judge_added', 'UserPlus', 'success'),
('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000002', 'Judging Started', 'Judging phase set to in-progress', 'phase_changed', 'Play', 'primary'),
('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000003', 'Scores Submitted', 'Dr. Sarah Chen submitted scores for Code Warriors', 'scoring_completed', 'CheckCircle', 'success');

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- 
-- Users:
--   - 1 Admin (admin@tamu.edu)
--   - 1 Moderator (moderator@tamu.edu)
--   - 1 Shared Judge Account for Hackathon (judges-hackathon@tamu.edu)
--   - 1 Shared Judge Account for Design Challenge (judges-design@tamu.edu)
--
-- Events:
--   - Spring 2026 Aggies Invent (active, in-progress judging)
--   - Problems Worth Solving 2026 (upcoming, not-started)
--
-- Judge Profiles:
--   - 4 profiles for Hackathon: Dr. Sarah Chen, Prof. Michael Roberts, Dr. Emily Watson, Mr. James Miller
--   - 3 profiles for Design Challenge: Prof. Amanda Lee, Dr. Robert Kim, Ms. Jennifer Park
--
-- Teams:
--   - 5 teams for Hackathon (various statuses)
--   - 2 teams for Design Challenge (waiting)
--
-- Scores:
--   - Code Warriors: Fully scored by all 4 judges (total ~356/400)
--   - Debug Squad: Scored by 3/4 judges (Mr. James Miller pending)
--   - Other teams: Not yet scored
--
