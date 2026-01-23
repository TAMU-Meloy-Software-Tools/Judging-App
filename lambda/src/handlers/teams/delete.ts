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

    const payload = await verifyJwt(token);
    if (payload.role !== 'admin' && payload.role !== 'moderator') {
      return errorResponse('Forbidden', 403);
    }

    const teamId = event.pathParameters?.teamId;
    if (!teamId) {
      return errorResponse('Team ID required', 400);
    }

    await query(`DELETE FROM teams WHERE id = $1`, [teamId]);

    return successResponse({ message: 'Team deleted successfully' });
  } catch (error: any) {
    console.error('Delete team error:', error);
    return errorResponse('Failed to delete team', 500, error);
  }
};
