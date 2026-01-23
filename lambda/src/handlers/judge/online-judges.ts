import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const eventId = event.pathParameters?.eventId;
    if (!eventId) {
      return errorResponse('Event ID required', 400);
    }

    // Judges are "online" if last_activity within 2 minutes and not logged_out
    const result = await query(`
      SELECT 
        u.id, u.first_name, u.last_name, u.email,
        js.last_activity,
        COUNT(DISTINCT ss.id) FILTER (WHERE ss.submitted_at IS NOT NULL) as teams_scored
      FROM event_judges ej
      JOIN users u ON ej.user_id = u.id
      LEFT JOIN judge_sessions js ON js.user_id = u.id AND js.event_id = $1
        AND js.last_activity > NOW() - INTERVAL '2 minutes'
        AND js.logged_out_at IS NULL
      LEFT JOIN score_submissions ss ON ss.user_id = u.id AND ss.event_id = $1
      WHERE ej.event_id = $1
      GROUP BY u.id, js.last_activity
      ORDER BY js.last_activity DESC NULLS LAST, u.last_name
    `, [eventId]);

    return successResponse({ judges: result });
  } catch (error: any) {
    console.error('Online judges error:', error);
    return errorResponse('Failed to get online judges', 500, error);
  }
};
