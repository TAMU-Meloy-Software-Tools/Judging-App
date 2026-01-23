import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';
import { verifyJwt } from '../../utils/jwt';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }

    await verifyJwt(token);
    const teamId = event.pathParameters?.teamId;
    const body = JSON.parse(event.body || '{}');
    const { name, email } = body;

    if (!teamId || !name) {
      return errorResponse('Team ID and member name required', 400);
    }

    const result = await query(`
      INSERT INTO team_members (team_id, name, email)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [teamId, name, email || null]);

    return successResponse({ member: result[0] });
  } catch (error: any) {
    console.error('Add member error:', error);
    return errorResponse('Failed to add team member', 500, error);
  }
};
