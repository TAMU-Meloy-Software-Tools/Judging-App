import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { transaction } from '../../db/connection';
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

    // await verifyJwt(token);
    const eventId = event.pathParameters?.eventId;
    const body = JSON.parse(event.body || '{}');
    const { name, projectTitle, description, projectUrl, members } = body;

    if (!eventId || !name) {
      return errorResponse('Event ID and team name required', 400);
    }

    const result = await transaction(async (client) => {
      // Create team
      const teamResult = await client.query(`
        INSERT INTO teams (event_id, name, project_title, description, project_url, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING *
      `, [eventId, name, projectTitle || null, description || null, projectUrl || null]);

      const teamId = teamResult.rows[0].id;

      // Add members if provided
      if (Array.isArray(members) && members.length > 0) {
        for (const member of members) {
          await client.query(`
            INSERT INTO team_members (team_id, name, email)
            VALUES ($1, $2, $3)
          `, [teamId, member.name, member.email || null]);
        }
      }

      return teamResult.rows[0];
    });

    return successResponse({ team: result });
  } catch (error: any) {
    console.error('Create team error:', error);
    return errorResponse('Failed to create team', 500, error);
  }
};
