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
    // if (payload.role !== 'admin' && payload.role !== 'moderator') {
    //   return errorResponse('Forbidden', 403);
    // }

    const eventId = event.queryStringParameters?.eventId;
    const limit = parseInt(event.queryStringParameters?.limit || '50');

    let sql = `
      SELECT al.*, u.first_name, u.last_name, e.name as event_name
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN events e ON al.event_id = e.id
    `;

    const params: any[] = [];
    if (eventId) {
      sql += ` WHERE al.event_id = $1`;
      params.push(eventId);
    }

    sql += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);

    return successResponse({ activity: result });
  } catch (error: any) {
    console.error('Get activity error:', error);
    return errorResponse('Failed to get activity', 500, error);
  }
};
