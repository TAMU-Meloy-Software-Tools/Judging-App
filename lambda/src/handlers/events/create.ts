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
    // if (payload.role !== 'admin') {
    //   return errorResponse('Forbidden', 403);
    // }

    const body = JSON.parse(event.body || '{}');
    const { name, description, eventType, location, startDate, endDate, registrationDeadline,
            maxTeamSize, minTeamSize, maxTeams, sponsorId } = body;

    if (!name || !eventType || !startDate || !endDate) {
      return errorResponse('Name, eventType, startDate, and endDate required', 400);
    }

    const result = await query(`
      INSERT INTO events (name, description, event_type, status, location, start_date, end_date, 
                         registration_deadline, max_team_size, min_team_size, max_teams, sponsor_id)
      VALUES ($1, $2, $3, 'upcoming', $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [name, description || null, eventType, location || null, startDate, endDate, 
        registrationDeadline || null, maxTeamSize || 4, minTeamSize || 1, maxTeams || null, sponsorId || null]);

    return successResponse({ event: result[0] });
  } catch (error: any) {
    console.error('Create event error:', error);
    return errorResponse('Failed to create event', 500, error);
  }
};
