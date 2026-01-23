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

    // const payload = await verifyJwt(token);
    const userId = '00000000-0000-0000-0000-000000000000'; // Mock user ID for testing

    const body = JSON.parse(event.body || '{}');
    const { eventId, teamId, scores, overallComments, timeSpentSeconds } = body;

    if (!eventId || !teamId || !Array.isArray(scores)) {
      return errorResponse('eventId, teamId, and scores array required', 400);
    }

    await transaction(async (client) => {
      // Create or update score submission
      const submissionResult = await client.query(`
        INSERT INTO score_submissions (user_id, event_id, team_id, started_at, submitted_at, time_spent_seconds)
        VALUES ($1, $2, $3, NOW(), NOW(), $4)
        ON CONFLICT (user_id, team_id) 
        DO UPDATE SET submitted_at = NOW(), time_spent_seconds = $4
        RETURNING id
      `, [userId, eventId, teamId, timeSpentSeconds || 0]);

      const submissionId = submissionResult.rows[0].id;

      // Delete existing scores for this submission
      await client.query(`DELETE FROM scores WHERE submission_id = $1`, [submissionId]);

      // Insert new scores
      for (const score of scores) {
        await client.query(`
          INSERT INTO scores (submission_id, user_id, team_id, rubric_criteria_id, score, reflection)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [submissionId, userId, teamId, score.criteriaId, score.score, score.reflection || null]);
      }

      // Insert or update overall comment
      if (overallComments) {
        await client.query(`
          INSERT INTO judge_comments (submission_id, user_id, team_id, comments)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id, team_id)
          DO UPDATE SET comments = $4, updated_at = NOW()
        `, [submissionId, userId, teamId, overallComments]);
      }

      // Log activity
      await client.query(`
        INSERT INTO activity_log (event_id, user_id, title, description, activity_type, icon_name, tone)
        VALUES ($1, $2, 'Scores Submitted', $3, 'score_submitted', 'CheckCircle', 'success')
      `, [eventId, userId, `Judge submitted scores for team`]);
    });

    return successResponse({ message: 'Scores submitted successfully' });
  } catch (error: any) {
    console.error('Submit scores error:', error);
    return errorResponse('Failed to submit scores', 500, error);
  }
};
