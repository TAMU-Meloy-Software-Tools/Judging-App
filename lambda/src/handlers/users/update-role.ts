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

    const userId = event.pathParameters?.userId;
    const body = JSON.parse(event.body || '{}');
    const { role } = body;

    if (!userId || !role) {
      return errorResponse('User ID and role required', 400);
    }

    if (!['participant', 'judge', 'moderator', 'admin'].includes(role)) {
      return errorResponse('Invalid role', 400);
    }

    await query(`
      UPDATE users 
      SET role = $1
      WHERE id = $2
    `, [role, userId]);

    return successResponse({ message: 'Role updated successfully' });
  } catch (error: any) {
    console.error('Update role error:', error);
    return errorResponse('Failed to update role', 500, error);
  }
};
