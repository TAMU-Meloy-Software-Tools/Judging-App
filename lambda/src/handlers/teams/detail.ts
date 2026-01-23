import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { query } from '../../db/connection';
import { successResponse, errorResponse } from '../../utils/response';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const teamId = event.pathParameters?.teamId;
    if (!teamId) {
      return errorResponse('Team ID required', 400);
    }

    // Get team details
    const teamResult = await query(`
      SELECT t.*, e.name as event_name
      FROM teams t
      JOIN events e ON t.event_id = e.id
      WHERE t.id = $1
    `, [teamId]);

    if (teamResult.length === 0) {
      return errorResponse('Team not found', 404);
    }

    // Get team members
    const membersResult = await query(`
      SELECT * FROM team_members
      WHERE team_id = $1
      ORDER BY created_at
    `, [teamId]);

    // Get scores breakdown by judge and criteria
    const scoresResult = await query(`
      SELECT 
        u.first_name, u.last_name,
        rc.name as criteria_name, rc.short_name, rc.icon_name,
        s.score, s.reflection,
        ss.submitted_at,
        jc.comments as overall_comments
      FROM score_submissions ss
      JOIN users u ON ss.user_id = u.id
      JOIN scores s ON s.submission_id = ss.id
      JOIN rubric_criteria rc ON s.rubric_criteria_id = rc.id
      LEFT JOIN judge_comments jc ON jc.submission_id = ss.id
      WHERE ss.team_id = $1 AND ss.submitted_at IS NOT NULL
      ORDER BY u.last_name, rc.display_order
    `, [teamId]);

    return successResponse({
      team: teamResult[0],
      members: membersResult,
      scores: scoresResult
    });
  } catch (error: any) {
    console.error('Team detail error:', error);
    return errorResponse('Failed to get team details', 500, error);
  }
};
