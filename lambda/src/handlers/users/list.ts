import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';
// import { verifyJwt } from '../../utils/jwt';

export const handler = async (
  _event: APIGatewayProxyEvent
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

    const result = await query(`
      SELECT id, netid, email, first_name, last_name, role, is_active, last_login, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return successResponse({ users: result });
  } catch (error: any) {
    console.error('List users error:', error);
    return errorResponse('Failed to list users', 500, error);
  }
};
