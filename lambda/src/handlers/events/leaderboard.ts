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

    const result = await query(`
      SELECT 
        t.id,
        t.name,
        t.project_title,
        t.description,
        0 as judges_scored,
        NULL::numeric as average_score,
        '[]'::json as criteria_breakdown
      FROM teams t
      WHERE t.event_id = $1
      ORDER BY t.name
    `, [eventId]);

    return successResponse({ leaderboard: result });
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return errorResponse('Failed to get leaderboard', 500, error);
  }
};
