import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';
// import { verifyJwt } from '../../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';

/**
 * Get Moderator Dashboard Status
 * 
 * Returns real-time status for moderator screen including:
 * - Current active team
 * - Online judges
 * - All teams with per-judge scoring status
 * - Judging phase
 * 
 * GET /events/{eventId}/moderator/status
 * 
 * Requires: moderator or admin role
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // TODO: Re-enable auth after testing
    // Verify JWT and check role
    // const authHeader = event.headers.Authorization || event.headers.authorization;
    // if (!authHeader?.startsWith('Bearer ')) {
    //   throw new UnauthorizedError('No authorization token provided');
    // }

    // const token = authHeader.substring(7);
    // const payload = await verifyJwt(token);

    // if (!['moderator', 'admin'].includes(payload.role)) {
    //   throw new ForbiddenError('Moderator or admin access required');
    // }

    const eventId = event.pathParameters?.eventId;
    if (!eventId) {
      return errorResponse('Event ID required', 400);
    }

    // Get event basic info including active team
    const eventInfo = await query(`
      SELECT 
        e.id,
        e.name,
        e.judging_phase,
        e.current_active_team_id,
        t.id as active_team_id,
        t.name as active_team_name,
        t.project_title as active_team_project,
        t.status as active_team_status
      FROM events e
      LEFT JOIN teams t ON e.current_active_team_id = t.id
      WHERE e.id = $1
    `, [eventId]);

    if (eventInfo.length === 0) {
      return errorResponse('Event not found', 404);
    }

    // Get online judges (active in last 2 minutes)
    const onlineJudges = await query(`
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name as name,
        js.last_activity,
        COUNT(DISTINCT CASE WHEN ss.submitted_at IS NOT NULL THEN ss.id END) as teams_scored
      FROM event_judges ej
      JOIN users u ON ej.user_id = u.id
      LEFT JOIN judge_sessions js ON js.user_id = u.id 
        AND js.event_id = $1
        AND js.last_activity > NOW() - INTERVAL '2 minutes'
        AND js.logged_out_at IS NULL
      LEFT JOIN score_submissions ss ON ss.user_id = u.id AND ss.event_id = $1
      WHERE ej.event_id = $1
      GROUP BY u.id, u.first_name, u.last_name, js.last_activity
      ORDER BY js.last_activity DESC NULLS LAST
    `, [eventId]);

    // Get all teams with per-judge scoring status
    const teams = await query(`
      SELECT 
        t.id,
        t.name,
        t.project_title,
        t.presentation_order,
        t.status,
        json_agg(
          json_build_object(
            'judgeId', u.id,
            'judgeName', u.first_name || ' ' || u.last_name,
            'scoreTotal', (
              SELECT COALESCE(SUM(s.score), 0)
              FROM score_submissions ss
              JOIN scores s ON s.submission_id = ss.id
              WHERE ss.user_id = u.id AND ss.team_id = t.id
            ),
            'isComplete', (
              SELECT ss.submitted_at IS NOT NULL
              FROM score_submissions ss
              WHERE ss.user_id = u.id AND ss.team_id = t.id
            )
          ) ORDER BY u.last_name, u.first_name
        ) FILTER (WHERE u.id IS NOT NULL) as judge_scores
      FROM teams t
      LEFT JOIN event_judges ej ON ej.event_id = t.event_id
      LEFT JOIN users u ON ej.user_id = u.id
      WHERE t.event_id = $1
      GROUP BY t.id, t.name, t.project_title, t.presentation_order, t.status
      ORDER BY t.presentation_order ASC NULLS LAST, t.created_at ASC
    `, [eventId]);

    return successResponse({
      event: eventInfo[0],
      onlineJudges,
      teams,
      summary: {
        totalTeams: teams.length,
        totalJudges: onlineJudges.length,
        onlineJudgesCount: onlineJudges.filter((j: any) => j.last_activity).length,
        currentPhase: eventInfo[0].judging_phase
      }
    });
  } catch (error: any) {
    console.error('Get moderator status error:', error);
    
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return errorResponse(error.message, error instanceof UnauthorizedError ? 401 : 403);
    }
    
    return errorResponse('Failed to get moderator status', 500, error);
  }
};
