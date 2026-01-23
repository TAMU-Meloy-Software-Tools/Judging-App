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
    const judgeId = event.pathParameters?.judgeId;

    if (!eventId || !judgeId) {
      return errorResponse('Event ID and judge ID required', 400);
    }

    await query(`
      DELETE FROM event_judges 
      WHERE event_id = $1 AND user_id = $2
    `, [eventId, judgeId]);

    return successResponse({ message: 'Judge removed successfully' });
  } catch (error: any) {
    console.error('Remove judge error:', error);
    return errorResponse('Failed to remove judge', 500, error);
  }
};
