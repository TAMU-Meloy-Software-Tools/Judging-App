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
    const { name, logoUrl, websiteUrl, tier, primaryColor, secondaryColor, textColor } = body;

    if (!name) {
      return errorResponse('Sponsor name required', 400);
    }

    const result = await query(`
      INSERT INTO sponsors (name, logo_url, website_url, tier, primary_color, secondary_color, text_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, logoUrl || null, websiteUrl || null, tier || null, 
        primaryColor || '#500000', secondaryColor || '#FFFFFF', textColor || '#FFFFFF']);

    return successResponse({ sponsor: result[0] });
  } catch (error: any) {
    console.error('Create sponsor error:', error);
    return errorResponse('Failed to create sponsor', 500, error);
  }
};
