import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';

export const handler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const result = await query(`
      SELECT * FROM rubric_criteria
      ORDER BY display_order ASC
    `);

    return successResponse({ criteria: result });
  } catch (error: any) {
    console.error('Get rubric error:', error);
    return errorResponse('Failed to get rubric', 500, error);
  }
};
