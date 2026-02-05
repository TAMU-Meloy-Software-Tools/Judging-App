import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { transaction } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';

export const handler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Seeding database with test data...');

    await transaction(async (client) => {
      // Insert test users
      await client.query(`
        INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES
        ('00000000-0000-0000-0000-000000000001', 'admin@tamu.edu', '$2b$10$placeholder', 'Admin User', 'admin', true),
        ('00000000-0000-0000-0000-000000000002', 'moderator@tamu.edu', '$2b$10$placeholder', 'Event Moderator', 'moderator', true),
        ('00000000-0000-0000-0000-000000000003', 'judges-hackathon@tamu.edu', '$2b$10$placeholder', 'Hackathon Judges', 'judge', true)
        ON CONFLICT (id) DO NOTHING
      `);

      // Insert sponsors
      await client.query(`
        INSERT INTO sponsors (id, name, logo_url, primary_color, secondary_color, text_color) VALUES
        ('00000000-0000-0000-0000-000000000010', 'ExxonMobil', '/ExxonLogo.png', '#b91c1c', '#7f1d1d', '#FFFFFF')
        ON CONFLICT (id) DO NOTHING
      `);

      // Insert test event
      await client.query(`
        INSERT INTO events (id, name, event_type, duration, start_date, end_date, location, description, status, judging_phase, sponsor_id, created_by)
        VALUES (
          '00000000-0000-0000-0000-000000000100',
          'Spring 2026 Aggies Invent',
          'aggies-invent',
          '48 hours',
          '2026-03-15 09:00:00',
          '2026-03-17 17:00:00',
          'Zachry Engineering Center',
          'Annual spring innovation competition',
          'active',
          'in-progress',
          '00000000-0000-0000-0000-000000000010',
          '00000000-0000-0000-0000-000000000001'
        )
        ON CONFLICT (id) DO NOTHING
      `);

      // Insert judge profiles
      // For testing in DEV_MODE, we assign profiles to the admin user (id: 000...001)
      // In production, these would be assigned to dedicated judge accounts
      console.log('Inserting judge profiles...');
      const judgeResult = await client.query(`
        INSERT INTO event_judges (id, event_id, user_id, name) VALUES
        ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Dr. Sarah Chen'),
        ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Prof. Michael Roberts'),
        ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Dr. Emily Watson'),
        ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Mr. James Miller')
        RETURNING id, name
      `);
      console.log('Inserted judge profiles:', judgeResult.rows);

      // Insert rubric criteria
      await client.query(`
        INSERT INTO rubric_criteria (name, short_name, description, max_score, display_order, icon_name, guiding_question) VALUES
        ('Effective Communication', 'Communication', 'Was the problem urgent, the solution convincing, and the impact tangible?', 25, 1, 'Megaphone', 'Notes on clarity and messaging...'),
        ('Would Fund/Buy Solution', 'Funding', 'Consider technical feasibility, commercial viability, and novelty of the approach.', 25, 2, 'BadgeDollarSign', 'Thoughts on feasibility and potential...'),
        ('Presentation Quality', 'Presentation', 'Evaluate the demo assets, storytelling, and overall delivery.', 25, 3, 'Presentation', 'Observations on delivery and engagement...'),
        ('Team Cohesion', 'Cohesion', 'Reflect on the pitch strength, Q&A performance, and your gut confidence.', 25, 4, 'Sparkles', 'General impressions and final thoughts...')
        ON CONFLICT (display_order) DO NOTHING
      `);

      // Insert teams
      await client.query(`
        INSERT INTO teams (id, event_id, name, project_title, description, presentation_order, status) VALUES
        ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000100', 'Code Warriors', 'AI Task Manager', 'Building an AI-powered task manager for students', 1, 'completed'),
        ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000100', 'Debug Squad', 'CollabCode', 'Creating a collaborative coding platform', 2, 'completed'),
        ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000100', 'Innovation Hub', 'SmartCampus', 'IoT solution for campus resource management', 3, 'active')
        ON CONFLICT (id) DO NOTHING
      `);

      // Insert team members
      await client.query(`
        INSERT INTO team_members (team_id, name, email) VALUES
        ('00000000-0000-0000-0000-000000000301', 'Alice Johnson', 'alice@tamu.edu'),
        ('00000000-0000-0000-0000-000000000301', 'Bob Smith', 'bob@tamu.edu'),
        ('00000000-0000-0000-0000-000000000302', 'David Lee', 'david@tamu.edu'),
        ('00000000-0000-0000-0000-000000000302', 'Eva Martinez', 'eva@tamu.edu'),
        ('00000000-0000-0000-0000-000000000303', 'Frank Wilson', 'frank@tamu.edu')
      `);

      // Get rubric criteria IDs
      const criteria = await client.query('SELECT id FROM rubric_criteria ORDER BY display_order');
      const [comm_id, fund_id, pres_id, cohe_id] = criteria.rows.map(r => r.id);

      // Insert score submissions and scores for Code Warriors (fully scored)
      const sub1 = await client.query(`
        INSERT INTO score_submissions (id, judge_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
        VALUES ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000301', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', 900)
        RETURNING id
      `);
      const sub1_id = sub1.rows[0].id;

      await client.query(`
        INSERT INTO scores (submission_id, judge_id, team_id, rubric_criteria_id, score, reflection) VALUES
        ($1, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', $2, 22, 'Excellent problem articulation'),
        ($1, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', $3, 24, 'Very viable business model'),
        ($1, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', $4, 21, 'Good demo'),
        ($1, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', $5, 23, 'Strong team dynamics')
      `, [sub1_id, comm_id, fund_id, pres_id, cohe_id]);

      await client.query(`
        INSERT INTO judge_comments (submission_id, judge_id, team_id, comments)
        VALUES ($1, '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000301', 'Outstanding project with real market potential.')
      `, [sub1_id]);

      // Judge sessions
      await client.query(`
        INSERT INTO judge_sessions (event_id, judge_id, logged_in_at, last_activity, logged_out_at) VALUES
        ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000201', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 minutes', NULL),
        ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000202', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 minute', NULL)
      `);

      // Activity log
      await client.query(`
        INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone) VALUES
        ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Event Created', 'Spring 2026 Aggies Invent was created', 'event_created', 'Calendar', 'primary'),
        ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Judge Profiles Added', '4 judge profiles created for the event', 'judge_added', 'UserPlus', 'success')
      `);
    });

    console.log('✅ Test data seeded successfully');

    return successResponse({
      message: 'Test data seeded successfully with judge profile architecture',
      summary: {
        users: 3,
        sponsors: 1,
        events: 1,
        judge_profiles: 4,
        teams: 3,
        team_members: 5,
        rubric_criteria: 4,
        score_submissions: 1,
        scores: 4,
        judge_comments: 1,
        judge_sessions: 2,
        activity_log: 2
      }
    });
  } catch (error: any) {
    console.error('Seed data error:', error);
    return errorResponse('Failed to seed test data', 500, error);
  }
};
