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
    // For testing: use first judge from database
    const judgeResult = await query(`SELECT id FROM users WHERE role = 'judge' LIMIT 1`);
    const userId = judgeResult && judgeResult.length > 0 ? judgeResult[0].id : null;

    if (!userId) {
      return errorResponse('No judge users found in database', 500);
    }

    const body = JSON.parse(event.body || '{}');
    const { eventId } = body;

    if (!eventId) {
      return errorResponse('eventId required', 400);
    }

    // Update last_activity for the most recent active session
    const result = await query(`
      UPDATE judge_sessions
      SET last_activity = NOW()
      WHERE event_id = $1 
        AND user_id = $2 
        AND logged_out_at IS NULL
        AND logged_in_at = (
          SELECT MAX(logged_in_at)
          FROM judge_sessions
          WHERE event_id = $1 AND user_id = $2 AND logged_out_at IS NULL
        )
      RETURNING id
    `, [eventId, userId]);

    // If no active session found, create a new one
    if (!result || result.length === 0) {
      await query(`
        INSERT INTO judge_sessions (event_id, user_id, logged_in_at, last_activity)
        VALUES ($1, $2, NOW(), NOW())
      `, [eventId, userId]);
    }

    return successResponse({ message: 'Heartbeat recorded' });
  } catch (error: any) {
    console.error('Heartbeat error:', error);
    return errorResponse('Failed to record heartbeat', 500, error);
  }
};
