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
    // if (payload.role !== 'moderator' && payload.role !== 'admin') {
    //   return errorResponse('Forbidden', 403);
    // }

    const eventId = event.pathParameters?.eventId;
    if (!eventId) {
      return errorResponse('Event ID required', 400);
    }

    const result = await query(`
      SELECT t.*, COUNT(tm.id) as member_count
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.event_id = $1 AND t.status = 'pending'
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [eventId]);

    return successResponse({ teams: result });
  } catch (error: any) {
    console.error('Pending teams error:', error);
    return errorResponse('Failed to get pending teams', 500, error);
  }
};
