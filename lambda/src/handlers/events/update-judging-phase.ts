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
    //   return errorResponse('Forbidden: moderator role required', 403);
    // }

    const eventId = event.pathParameters?.eventId;
    const body = JSON.parse(event.body || '{}');
    const { judgingPhase } = body;

    if (!eventId || !judgingPhase) {
      return errorResponse('Event ID and judgingPhase required', 400);
    }

    if (!['not-started', 'in-progress', 'ended'].includes(judgingPhase)) {
      return errorResponse('Invalid judging phase', 400);
    }

    await query(`
      UPDATE events 
      SET judging_phase = $1
      WHERE id = $2
    `, [judgingPhase, eventId]);

    // Log activity (user_id is NULL for system actions during testing)
    await query(`
      INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone)
      VALUES ($1, NULL, 'Judging Phase Changed', $2, 'phase_changed', 'Settings', 'primary')
    `, [eventId, `Judging phase set to: ${judgingPhase}`]);

    return successResponse({ message: 'Judging phase updated', judgingPhase });
  } catch (error: any) {
    console.error('Update judging phase error:', error);
    return errorResponse('Failed to update judging phase', 500, error);
  }
};
