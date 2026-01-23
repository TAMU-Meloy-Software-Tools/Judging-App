import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';

/**
 * Get Assigned Judges for Event
 * 
 * Returns list of judges assigned to an event for judge selection screen.
 * Each event has specific judge accounts assigned on a per-event basis.
 * 
 * GET /events/{eventId}/judges/assigned
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const eventId = event.pathParameters?.eventId;
    if (!eventId) {
      return errorResponse('Event ID required', 400);
    }

    const result = await query(`
      SELECT 
        u.id,
        u.netid,
        u.email,
        u.first_name,
        u.last_name,
        ej.assigned_at
      FROM event_judges ej
      JOIN users u ON ej.user_id = u.id
      WHERE ej.event_id = $1
        AND u.role = 'judge'
        AND u.is_active = true
      ORDER BY u.last_name ASC, u.first_name ASC
    `, [eventId]);

    return successResponse({ judges: result });
  } catch (error: any) {
    console.error('Get assigned judges error:', error);
    return errorResponse('Failed to get assigned judges', 500, error);
  }
};
