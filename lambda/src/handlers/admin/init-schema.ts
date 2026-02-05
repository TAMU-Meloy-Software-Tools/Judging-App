import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { transaction } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';

export const handler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Initializing database schema...');

    await transaction(async (client) => {
      // Drop existing tables if they exist (CASCADE removes dependent objects)
      console.log('Dropping existing tables...');
      await client.query(`DROP TABLE IF EXISTS activity_log CASCADE`);
      await client.query(`DROP TABLE IF EXISTS judge_comments CASCADE`);
      await client.query(`DROP TABLE IF EXISTS scores CASCADE`);
      await client.query(`DROP TABLE IF EXISTS score_submissions CASCADE`);
      await client.query(`DROP TABLE IF EXISTS rubric_criteria CASCADE`);
      await client.query(`DROP TABLE IF EXISTS submissions CASCADE`);
      await client.query(`DROP TABLE IF EXISTS event_judges CASCADE`);
      await client.query(`DROP TABLE IF EXISTS team_members CASCADE`);
      await client.query(`DROP TABLE IF EXISTS teams CASCADE`);
      await client.query(`DROP TABLE IF EXISTS judge_sessions CASCADE`);
      await client.query(`DROP TABLE IF EXISTS events CASCADE`);
      await client.query(`DROP TABLE IF EXISTS sponsors CASCADE`);
      await client.query(`DROP TABLE IF EXISTS users CASCADE`);

      // Enable extensions
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'judge' 
            CHECK (role IN ('judge', 'admin', 'moderator')),
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create sponsors table
      await client.query(`
        CREATE TABLE IF NOT EXISTS sponsors (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) UNIQUE NOT NULL,
          logo_url TEXT,
          website_url TEXT,
          tier VARCHAR(50) CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),
          primary_color VARCHAR(7) DEFAULT '#500000',
          secondary_color VARCHAR(7) DEFAULT '#FFFFFF',
          text_color VARCHAR(7) DEFAULT '#FFFFFF',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create events table
      await client.query(`
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          event_type VARCHAR(50) NOT NULL 
            CHECK (event_type IN ('aggies-invent', 'problems-worth-solving', 'hackathon', 'design_competition', 'pitch_competition')),
          status VARCHAR(20) DEFAULT 'upcoming' 
            CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
          location VARCHAR(255),
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          registration_deadline TIMESTAMP,
          max_team_size INTEGER DEFAULT 4,
          min_team_size INTEGER DEFAULT 1,
          max_teams INTEGER,
          sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
          judging_phase VARCHAR(20) DEFAULT 'not-started' 
            CHECK (judging_phase IN ('not-started', 'in-progress', 'ended')),
          current_active_team_id UUID,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create teams table
      await client.query(`
        CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          project_title VARCHAR(255),
          description TEXT,
          presentation_order INTEGER,
          status VARCHAR(20) DEFAULT 'waiting' 
            CHECK (status IN ('waiting', 'active', 'completed', 'pending', 'approved', 'rejected')),
          project_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, name),
          UNIQUE(event_id, presentation_order)
        )
      `);

      // Create team_members table (for non-registered participants)
      await client.query(`
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Add FK constraint for current_active_team_id after teams table exists
      await client.query(`
        ALTER TABLE events ADD CONSTRAINT fk_current_active_team 
          FOREIGN KEY (current_active_team_id) REFERENCES teams(id) ON DELETE SET NULL
      `);

      // Create event_judges table (judge profiles) first
      await client.query(`
        CREATE TABLE IF NOT EXISTS event_judges (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(event_id, name)
        )
      `);

      // Create judge_sessions table (tracks judge profile login sessions and online status)
      await client.query(`
        CREATE TABLE IF NOT EXISTS judge_sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          judge_id UUID NOT NULL REFERENCES event_judges(id) ON DELETE CASCADE,
          logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          logged_out_at TIMESTAMP,
          UNIQUE(event_id, judge_id, logged_in_at)
        )
      `);

      // Create rubric_criteria table (scoring categories)
      await client.query(`
        CREATE TABLE IF NOT EXISTS rubric_criteria (
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

      // Create score_submissions table (tracks judge profile progress on each team)
      await client.query(`
        CREATE TABLE IF NOT EXISTS score_submissions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          judge_id UUID NOT NULL REFERENCES event_judges(id) ON DELETE CASCADE,
          event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          submitted_at TIMESTAMP,
          time_spent_seconds INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(judge_id, team_id)
        )
      `);

      // Create scores table (individual rubric category scores)
      await client.query(`
        CREATE TABLE IF NOT EXISTS scores (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          submission_id UUID NOT NULL REFERENCES score_submissions(id) ON DELETE CASCADE,
          judge_id UUID NOT NULL REFERENCES event_judges(id) ON DELETE CASCADE,
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          rubric_criteria_id UUID NOT NULL REFERENCES rubric_criteria(id) ON DELETE CASCADE,
          score INTEGER NOT NULL CHECK (score >= 0 AND score <= 25),
          reflection TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(judge_id, team_id, rubric_criteria_id)
        )
      `);

      // Create judge_comments table (overall feedback per team)
      await client.query(`
        CREATE TABLE IF NOT EXISTS judge_comments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          submission_id UUID NOT NULL REFERENCES score_submissions(id) ON DELETE CASCADE,
          judge_id UUID NOT NULL REFERENCES event_judges(id) ON DELETE CASCADE,
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          comments TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(judge_id, team_id)
        )
      `);

      // Create activity_log table (admin activity feed)
      await client.query(`
        CREATE TABLE IF NOT EXISTS activity_log (
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

      // Create indexes for performance
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_events_judging_phase ON events(judging_phase)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_teams_event_id ON teams(event_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_teams_presentation_order ON teams(event_id, presentation_order)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_judge_sessions_event_judge ON judge_sessions(event_id, judge_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_judge_sessions_active ON judge_sessions(event_id, judge_id, last_activity) WHERE logged_out_at IS NULL`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_rubric_criteria_order ON rubric_criteria(display_order)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_score_submissions_judge_team ON score_submissions(judge_id, team_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_score_submissions_event ON score_submissions(event_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_score_submissions_completed ON score_submissions(submitted_at) WHERE submitted_at IS NOT NULL`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_scores_submission ON scores(submission_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_scores_judge_team ON scores(judge_id, team_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_scores_team ON scores(team_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_judge_comments_submission ON judge_comments(submission_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_judge_comments_judge_team ON judge_comments(judge_id, team_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_activity_log_event ON activity_log(event_id)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC)`);
    });

    console.log('Database schema initialized successfully');

    return successResponse({
      message: 'Database schema initialized successfully',
      tables: [
        'users',
        'sponsors',
        'events',
        'teams',
        'team_members',
        'judge_sessions',
        'event_judges',
        'rubric_criteria',
        'score_submissions',
        'scores',
        'judge_comments',
        'activity_log'
      ]
    });
  } catch (error: any) {
    console.error('Schema initialization error:', error);
    return errorResponse('Failed to initialize schema', 500, error);
  }
};