import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { query, queryOne } from '../../db/connection';
import { Event } from '../../types';
import { successResponse, errorResponse } from '../../utils/response';
import { NotFoundError } from '../../utils/errors';

/**
 * GET /events/{id}
 * 
 * Get detailed information about a specific event including:
 * - Event details
 * - Sponsor info
 * - Team roster with member count
 * - Judge online status
 * - Statistics
 */

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    console.log('Get event detail:', JSON.stringify(event, null, 2));

    const eventId = event.pathParameters?.id;
    if (!eventId) {
      return errorResponse('Event ID is required', 400);
    }

    // Fetch event with sponsor
    const eventData = await queryOne<Event & { sponsor: any }>(
      `SELECT 
        e.*,
        json_build_object(
          'name', s.name,
          'logo_url', s.logo_url,
          'website_url', s.website_url,
          'tier', s.tier,
          'primary_color', s.primary_color,
          'secondary_color', s.secondary_color,
          'text_color', s.text_color
        ) as sponsor
      FROM events e
      LEFT JOIN sponsors s ON e.sponsor_id = s.id
      WHERE e.id = $1`,
      [eventId]
    );

    if (!eventData) {
      throw new NotFoundError('Event not found');
    }

    // Fetch teams with member count
    const teams = await query(
      `SELECT 
        t.id,
        t.name,
        t.description,
        t.status,
        t.project_url,
        COUNT(tm.id) as member_count
      FROM teams t
      LEFT JOIN team_members tm ON tm.team_id = t.id
      WHERE t.event_id = $1
      GROUP BY t.id, t.name, t.description, t.status, t.project_url
      ORDER BY t.created_at ASC`,
      [eventId]
    );

    // Fetch submission stats
    const submissionStats = await queryOne<{ 
      total_submissions: string;
      completed_submissions: string;
    }>(
      `SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN ss.submitted_at IS NOT NULL THEN 1 END) as completed_submissions
      FROM score_submissions ss
      JOIN teams t ON ss.team_id = t.id
      WHERE t.event_id = $1`,
      [eventId]
    );

    console.log(`Event ${eventId} found with ${teams.length} teams`);

    return successResponse({
      event: {
        id: eventData.id,
        name: eventData.name,
        eventType: eventData.event_type,
        startDate: eventData.start_date,
        endDate: eventData.end_date,
        location: eventData.location,
        description: eventData.description,
        status: eventData.status,
        registrationDeadline: eventData.registration_deadline,
        maxTeamSize: eventData.max_team_size,
        minTeamSize: eventData.min_team_size,
        maxTeams: eventData.max_teams,
        sponsor: eventData.sponsor,
        createdAt: eventData.created_at,
      },
      teams: teams.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        status: t.status,
        projectUrl: t.project_url,
        memberCount: parseInt(t.member_count, 10),
      })),
      stats: {
        totalTeams: teams.length,
        totalSubmissions: parseInt(submissionStats?.total_submissions || '0', 10),
        completedSubmissions: parseInt(submissionStats?.completed_submissions || '0', 10),
      },
    });
  } catch (error) {
    console.error('Get event detail error:', error);

    if (error instanceof NotFoundError) {
      return errorResponse(error.message, error.statusCode);
    }

    return errorResponse('Failed to fetch event details', 500, error);
  }
}
