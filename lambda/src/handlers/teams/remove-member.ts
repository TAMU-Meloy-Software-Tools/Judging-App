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
    const memberId = event.pathParameters?.memberId;

    if (!memberId) {
      return errorResponse('Member ID required', 400);
    }

    await query(`DELETE FROM team_members WHERE id = $1`, [memberId]);

    return successResponse({ message: 'Member removed successfully' });
  } catch (error: any) {
    console.error('Remove member error:', error);
    return errorResponse('Failed to remove member', 500, error);
  }
};
