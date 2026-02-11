import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../db/connection';
import { Event } from '../../types';
import { successResponse, errorResponse } from '../../utils/response';

/**
 * GET /events
 * 
 * List events with role-based filtering:
 * - Judges: Only see events they're assigned to via event_judges table
 * - Admins/Moderators: See all events
 * 
 * Query params:
 * - status: 'upcoming' | 'active' | 'completed'
 * - type: 'aggies-invent' | 'problems-worth-solving'
 */

interface EventWithSponsor extends Event {
  sponsor?: {
    name: string;
    logo_url?: string;
    website_url?: string;
    tier?: string;
  };
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    console.log('List events event:', JSON.stringify(event, null, 2));

    const status = event.queryStringParameters?.status;
    const eventType = event.queryStringParameters?.type;

    // Get user info from auth middleware
    const userId = event.requestContext?.authorizer?.userId;
    const userRole = event.requestContext?.authorizer?.role;

    console.log('User context:', { userId, userRole });

    // Build dynamic query with filters
    const conditions: string[] = ['1=1']; // Always true starting condition
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`e.status = $${paramIndex++}`);
      params.push(status);
    }

    if (eventType) {
      conditions.push(`e.event_type = $${paramIndex++}`);
      params.push(eventType);
    }

    // CRITICAL: Judges should only see events where they are the dedicated judge account
    if (userRole === 'judge' && userId) {
      conditions.push(`e.judge_user_id = $${paramIndex++}`);
      params.push(userId);
      console.log('Filtering events for judge account:', userId);
    } else {
      console.log('Showing all events for role:', userRole);
    }

    // Fetch events with sponsor info (LEFT JOIN in case no sponsor)
    const events = await query<EventWithSponsor>(
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
        ) as sponsor,
        (SELECT COUNT(*) FROM teams WHERE event_id = e.id) as teams_count,
        (SELECT COUNT(*) FROM event_judges WHERE event_id = e.id) as judges_count
      FROM events e
      LEFT JOIN sponsors s ON e.sponsor_id = s.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY e.start_date DESC NULLS LAST, e.created_at DESC`,
      params
    );

    console.log(`Found ${events.length} events for user ${userId} (role: ${userRole})`);

    return successResponse({
      events: events.map(e => ({
        id: e.id,
        name: e.name,
        eventType: e.event_type,
        startDate: e.start_date,
        endDate: e.end_date,
        location: e.location,
        description: e.description,
        status: e.status,
        registrationDeadline: e.registration_deadline,
        maxTeamSize: e.max_team_size,
        minTeamSize: e.min_team_size,
        maxTeams: e.max_teams,
        sponsor: e.sponsor,
        teamsCount: (e as any).teams_count,
        judgesCount: (e as any).judges_count,
        createdAt: e.created_at,
      })),
      total: events.length,
    });
  } catch (error) {
    console.error('List events error:', error);
    return errorResponse('Failed to fetch events', 500, error);
  }
}
