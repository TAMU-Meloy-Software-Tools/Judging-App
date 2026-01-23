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
    // if (payload.role !== 'moderator' && payload.role !== 'admin') {
    //   return errorResponse('Forbidden', 403);
    // }

    const result = await query(`
      SELECT id, netid, email, first_name, last_name
      FROM users
      WHERE role = 'judge'
      ORDER BY last_name, first_name
    `);

    return successResponse({ judges: result });
  } catch (error: any) {
    console.error('List judges error:', error);
    return errorResponse('Failed to list judges', 500, error);
  }
};
