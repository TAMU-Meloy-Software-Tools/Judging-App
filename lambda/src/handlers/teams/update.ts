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

    if (!teamId) {
      return errorResponse('Team ID required', 400);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (body.name) {
      updates.push(`name = $${paramCount++}`);
      values.push(body.name);
    }
    if (body.projectTitle !== undefined) {
      updates.push(`project_title = $${paramCount++}`);
      values.push(body.projectTitle);
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(body.description);
    }
    if (body.projectUrl !== undefined) {
      updates.push(`project_url = $${paramCount++}`);
      values.push(body.projectUrl);
    }
    if (body.status) {
      updates.push(`status = $${paramCount++}`);
      values.push(body.status);
    }
    if (body.presentationOrder !== undefined) {
      updates.push(`presentation_order = $${paramCount++}`);
      values.push(body.presentationOrder);
    }

    if (updates.length === 0) {
      return errorResponse('No fields to update', 400);
    }

    updates.push(`updated_at = NOW()`);
    values.push(teamId);

    const result = await query(`
      UPDATE teams 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.length === 0) {
      return errorResponse('Team not found', 404);
    }

    return successResponse({ team: result[0] });
  } catch (error: any) {
    console.error('Update team error:', error);
    return errorResponse('Failed to update team', 500, error);
  }
};
