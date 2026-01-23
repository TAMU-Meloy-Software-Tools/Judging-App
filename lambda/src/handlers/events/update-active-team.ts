import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { transaction } from '../../db/connection';
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
    const { teamId } = body;

    if (!eventId) {
      return errorResponse('Event ID required', 400);
    }

    await transaction(async (client) => {
      // Update event's current active team
      await client.query(`
        UPDATE events 
        SET current_active_team_id = $1
        WHERE id = $2
      `, [teamId || null, eventId]);

      // Update team statuses
      if (teamId) {
        await client.query(`
          UPDATE teams 
          SET status = CASE 
            WHEN id = $1 THEN 'active'
            ELSE 'waiting'
          END
          WHERE event_id = $2
        `, [teamId, eventId]);

        // Log activity (user_id is NULL for system actions during testing)
        await client.query(`
          INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone)
          VALUES ($1, NULL, 'Team Activated', (SELECT name FROM teams WHERE id = $2), 'team_activated', 'Users', 'primary')
        `, [eventId, teamId]);
      }
    });

    return successResponse({ message: 'Active team updated' });
  } catch (error: any) {
    console.error('Update active team error:', error);
    return errorResponse('Failed to update active team', 500, error);
  }
};
