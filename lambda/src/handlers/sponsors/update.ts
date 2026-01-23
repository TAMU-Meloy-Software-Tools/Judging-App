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

    const sponsorId = event.pathParameters?.sponsorId;
    const body = JSON.parse(event.body || '{}');

    if (!sponsorId) {
      return errorResponse('Sponsor ID required', 400);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (body.name) {
      updates.push(`name = $${paramCount++}`);
      values.push(body.name);
    }
    if (body.logoUrl !== undefined) {
      updates.push(`logo_url = $${paramCount++}`);
      values.push(body.logoUrl);
    }
    if (body.websiteUrl !== undefined) {
      updates.push(`website_url = $${paramCount++}`);
      values.push(body.websiteUrl);
    }
    if (body.tier !== undefined) {
      updates.push(`tier = $${paramCount++}`);
      values.push(body.tier);
    }
    if (body.primaryColor) {
      updates.push(`primary_color = $${paramCount++}`);
      values.push(body.primaryColor);
    }
    if (body.secondaryColor) {
      updates.push(`secondary_color = $${paramCount++}`);
      values.push(body.secondaryColor);
    }
    if (body.textColor) {
      updates.push(`text_color = $${paramCount++}`);
      values.push(body.textColor);
    }

    if (updates.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    values.push(sponsorId);

    const result = await query(`
      UPDATE sponsors 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.length === 0) {
      return errorResponse('Sponsor not found', 404);
    }

    return successResponse({ sponsor: result[0] });
  } catch (error: any) {
    console.error('Update sponsor error:', error);
    return errorResponse('Failed to update sponsor', 500, error);
  }
};
