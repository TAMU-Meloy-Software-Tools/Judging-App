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
    const body = JSON.parse(event.body || '{}');
    const { judgeId } = body;

    if (!eventId || !judgeId) {
      return errorResponse('Event ID and judge ID required', 400);
    }

    // assigned_by is NULL for testing (no authenticated user)
    await query(`
      INSERT INTO event_judges (event_id, user_id, assigned_by)
      VALUES ($1, $2, NULL)
      ON CONFLICT (event_id, user_id) DO NOTHING
    `, [eventId, judgeId]);

    return successResponse({ message: 'Judge assigned successfully' });
  } catch (error: any) {
    console.error('Assign judge error:', error);
    return errorResponse('Failed to assign judge', 500, error);
  }
};
