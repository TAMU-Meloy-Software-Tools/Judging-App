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

    const eventId = event.pathParameters?.eventId;
    const body = JSON.parse(event.body || '{}');

    if (!eventId) {
      return errorResponse('Event ID required', 400);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = ['name', 'description', 'eventType', 'status', 'location', 
                           'startDate', 'endDate', 'registrationDeadline', 'maxTeamSize', 
                           'minTeamSize', 'maxTeams', 'sponsorId'];
    
    const fieldMap: any = {
      name: 'name', description: 'description', eventType: 'event_type', 
      status: 'status', location: 'location', startDate: 'start_date', 
      endDate: 'end_date', registrationDeadline: 'registration_deadline',
      maxTeamSize: 'max_team_size', minTeamSize: 'min_team_size',
      maxTeams: 'max_teams', sponsorId: 'sponsor_id'
    };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${fieldMap[field]} = $${paramCount++}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    updates.push(`updated_at = NOW()`);
    values.push(eventId);

    const result = await query(`
      UPDATE events 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.length === 0) {
      return errorResponse('Event not found', 404);
    }

    return successResponse({ event: result[0] });
  } catch (error: any) {
    console.error('Update event error:', error);
    return errorResponse('Failed to update event', 500, error);
  }
};
