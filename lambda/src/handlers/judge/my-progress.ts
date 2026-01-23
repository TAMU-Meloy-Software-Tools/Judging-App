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
    const eventId = event.pathParameters?.eventId;
    const mockUserId = '00000000-0000-0000-0000-000000000000'; // Mock user ID for testing

    if (!eventId) {
      return errorResponse('Event ID required', 400);
    }

    const result = await query(`
      SELECT 
        t.id, t.name, t.project_title,
        CASE 
          WHEN ss.submitted_at IS NOT NULL THEN 'completed'
          WHEN ss.started_at IS NOT NULL THEN 'in-progress'
          ELSE 'not-started'
        END as status,
        ss.started_at, ss.submitted_at,
        (SELECT SUM(score) FROM scores WHERE submission_id = ss.id) as total_score
      FROM teams t
      LEFT JOIN score_submissions ss ON t.id = ss.team_id AND ss.user_id = $1
      WHERE t.event_id = $2
      ORDER BY t.presentation_order, t.name
    `, [mockUserId, eventId]);

    return successResponse({ teams: result });
  } catch (error: any) {
    console.error('Judge progress error:', error);
    return errorResponse('Failed to get judge progress', 500, error);
  }
};
