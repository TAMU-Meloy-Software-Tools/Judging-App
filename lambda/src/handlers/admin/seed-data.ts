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
        INSERT INTO users (netid, email, first_name, last_name, role) VALUES
        ('admin001', 'admin@tamu.edu', 'John', 'Admin', 'admin'),
        ('mod001', 'moderator@tamu.edu', 'Jane', 'Moderator', 'moderator'),
        ('judge001', 'judge1@tamu.edu', 'Mike', 'Judge', 'judge'),
        ('judge002', 'judge2@tamu.edu', 'Sarah', 'Smith', 'judge'),
        ('part001', 'participant1@tamu.edu', 'Bob', 'Builder', 'participant'),
        ('part002', 'participant2@tamu.edu', 'Alice', 'Developer', 'participant'),
        ('part003', 'participant3@tamu.edu', 'Charlie', 'Coder', 'participant')
      `);

      // Insert sponsor
      await client.query(`
        INSERT INTO sponsors (name, logo_url, website_url, tier, primary_color, secondary_color, text_color) VALUES
        ('TAMU Engineering', 'https://example.com/tamu-logo.png', 'https://engineering.tamu.edu', 'platinum', '#500000', '#FFFFFF', '#FFFFFF')
      `);

      // Insert test events
      await client.query(`
        INSERT INTO events (name, description, event_type, status, location, start_date, end_date, registration_deadline, max_team_size, min_team_size, max_teams, sponsor_id, judging_phase)
        VALUES
        (
          'Spring 2026 Hackathon',
          'Annual spring coding competition focusing on web development and AI',
          'hackathon',
          'active',
          'Zachry Engineering Center',
          '2026-03-15 09:00:00',
          '2026-03-15 18:00:00',
          '2026-03-10 23:59:59',
          4,
          2,
          20,
          (SELECT id FROM sponsors WHERE name = 'TAMU Engineering'),
          'in-progress'
        ),
        (
          'Summer Design Challenge',
          'UI/UX design competition for mobile applications',
          'design_competition',
          'upcoming',
          'Memorial Student Center',
          '2026-06-20 10:00:00',
          '2026-06-20 17:00:00',
          '2026-06-15 23:59:59',
          3,
          1,
          15,
          NULL,
          'not-started'
        )
      `);

      // Get event and user IDs
      const hackathon = await client.query(`SELECT id FROM events WHERE name = 'Spring 2026 Hackathon'`);
      const hackathonId = hackathon.rows[0]?.id;

      // Insert rubric criteria (4 default scoring categories)
      await client.query(`
        INSERT INTO rubric_criteria (name, short_name, description, max_score, display_order, icon_name, guiding_question) VALUES
        ('Effective Communication', 'Communication', 'Was the problem urgent, the solution convincing, and the impact tangible?', 25, 1, 'Megaphone', 'Notes on clarity and messaging...'),
        ('Would Fund/Buy Solution', 'Funding', 'Consider technical feasibility, commercial viability, and novelty of the approach.', 25, 2, 'BadgeDollarSign', 'Thoughts on feasibility and potential...'),
        ('Presentation Quality', 'Presentation', 'Evaluate the demo assets, storytelling, and overall delivery.', 25, 3, 'Presentation', 'Observations on delivery and engagement...'),
        ('Team Cohesion', 'Cohesion', 'Reflect on the pitch strength, Q&A performance, and your gut confidence.', 25, 4, 'Sparkles', 'General impressions and final thoughts...')
      `);

      if (hackathonId) {
        const adminId = (await client.query(`SELECT id FROM users WHERE netid = 'admin001'`)).rows[0]?.id;
        const judge1Id = (await client.query(`SELECT id FROM users WHERE netid = 'judge001'`)).rows[0]?.id;

        // Insert teams with project titles and presentation order
        const teamResult = await client.query(`
          INSERT INTO teams (event_id, name, project_title, description, status, presentation_order) VALUES
          ($1, 'Code Warriors', 'AI-Powered Task Manager', 'Building an intelligent task prioritization system', 'active', 1),
          ($1, 'Debug Squad', 'CollabCode Platform', 'Creating a real-time collaborative coding environment', 'completed', 2),
          ($1, 'IoT Innovators', 'Smart Campus Solution', 'Developing IoT sensors for energy monitoring', 'waiting', 3)
          RETURNING id
        `, [hackathonId]);

        if (teamResult.rows.length > 0) {
          const team1Id = teamResult.rows[0].id;
          const team2Id = teamResult.rows[1]?.id;

          // Add team members (non-registered participants with name/email only)
          await client.query(`
            INSERT INTO team_members (team_id, name, email) VALUES
            ($1, 'Bob Builder', 'bob.builder@tamu.edu'),
            ($1, 'Alice Developer', 'alice.dev@tamu.edu')
          `, [team1Id]);

          if (team2Id) {
            await client.query(`
              INSERT INTO team_members (team_id, name, email) VALUES
              ($1, 'Charlie Coder', 'charlie.code@tamu.edu'),
              ($1, 'Diana Designer', 'diana.design@tamu.edu')
            `, [team2Id]);
          }

          // Add judges to event
          if (adminId && judge1Id) {
            await client.query(`
              INSERT INTO event_judges (event_id, user_id, assigned_by) VALUES
              ($1, $2, $3)
            `, [hackathonId, judge1Id, adminId]);

            // Create judge session (simulating active judge)
            await client.query(`
              INSERT INTO judge_sessions (event_id, user_id, logged_in_at, last_activity) VALUES
              ($1, $2, NOW() - INTERVAL '2 hours', NOW())
            `, [hackathonId, judge1Id]);
          }

          // Add score submission and scores for completed team
          if (judge1Id && team2Id) {
            const submissionResult = await client.query(`
              INSERT INTO score_submissions (user_id, event_id, team_id, started_at, submitted_at, time_spent_seconds) VALUES
              ($1, $2, $3, NOW() - INTERVAL '25 minutes', NOW(), 1500)
              RETURNING id
            `, [judge1Id, hackathonId, team2Id]);

            if (submissionResult.rows.length > 0) {
              const submissionId = submissionResult.rows[0].id;
              
              // Get rubric criteria IDs
              const criteria = await client.query(`SELECT id, short_name FROM rubric_criteria ORDER BY display_order`);
              
              if (criteria.rows.length === 4) {
                // Add scores for all 4 criteria
                await client.query(`
                  INSERT INTO scores (submission_id, user_id, team_id, rubric_criteria_id, score, reflection) VALUES
                  ($1, $2, $3, $4, 22, 'Clear explanation of problem and solution. Good use of visuals.'),
                  ($1, $2, $3, $5, 21, 'Strong technical feasibility. Market potential needs more research.'),
                  ($1, $2, $3, $6, 23, 'Excellent demo with live coding. Very engaging presentation.'),
                  ($1, $2, $3, $7, 21, 'Team worked well together. Good Q&A responses.')
                `, [submissionId, judge1Id, team2Id, criteria.rows[0].id, criteria.rows[1].id, criteria.rows[2].id, criteria.rows[3].id]);

                // Add overall judge comment
                await client.query(`
                  INSERT INTO judge_comments (submission_id, user_id, team_id, comments) VALUES
                  ($1, $2, $3, 'Impressive project with strong technical implementation. The team showed great collaboration and communication skills. Consider expanding on the business model for next round.')
                `, [submissionId, judge1Id, team2Id]);
              }
            }
          }

          // Add activity log entries
          await client.query(`
            INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone) VALUES
            ($1, $2, 'Event Started', 'Spring 2026 Hackathon judging phase has begun', 'event_started', 'Calendar', 'primary'),
            ($1, $2, 'Judge Assigned', 'Mike Judge added to judging panel', 'judge_assigned', 'UsersRound', 'success'),
            ($1, $2, 'Team Activated', 'Code Warriors is now presenting to judges', 'team_activated', 'Users', 'primary')
          `, [hackathonId, adminId]);
        }
      }
    });

    console.log('✅ Test data seeded successfully');

    return successResponse({
      message: 'Test data seeded successfully',
      summary: {
        users: 7,
        sponsors: 1,
        events: 2,
        rubric_criteria: 4,
        teams: 3,
        team_members: 4,
        judges: 1,
        judge_sessions: 1,
        score_submissions: 1,
        scores: 4,
        judge_comments: 1,
        activity_log: 3
      }
    });
  } catch (error: any) {
    console.error('Seed data error:', error);
    return errorResponse('Failed to seed test data', 500, error);
  }
};
