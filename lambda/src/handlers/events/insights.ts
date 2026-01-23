import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';
// import { verifyJwt } from '../../utils/jwt';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // TODO: Re-enable auth for production
    // const token = event.headers.authorization?.replace('Bearer ', '');
    // if (!token) {
    //   return errorResponse('Unauthorized', 401);
    // }

    // const payload = await verifyJwt(token);
    // if (payload.role !== 'admin') {
    //   return errorResponse('Forbidden', 403);
    // }

    const eventId = event.pathParameters?.eventId;
    if (!eventId) {
      return errorResponse('Event ID required', 400);
    }

    const result = await query(`
      SELECT 
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT CASE WHEN t.status = 'approved' THEN t.id END) as approved_teams,
        COUNT(DISTINCT ej.user_id) as total_judges,
        COUNT(DISTINCT ss.id) FILTER (WHERE ss.submitted_at IS NOT NULL) as completed_scores,
        COUNT(DISTINCT ss.team_id) as teams_with_scores,
        ROUND(AVG(
          (SELECT SUM(score) FROM scores WHERE submission_id = ss.id)
        ), 2) as average_total_score
      FROM events e
      LEFT JOIN teams t ON e.id = t.event_id
      LEFT JOIN event_judges ej ON e.id = ej.event_id
      LEFT JOIN score_submissions ss ON e.id = ss.event_id
      WHERE e.id = $1
    `, [eventId]);

    return successResponse({ insights: result[0] });
  } catch (error: any) {
    console.error('Get insights error:', error);
    return errorResponse('Failed to get insights', 500, error);
  }
};
