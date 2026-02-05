/**
 * Scores and Rubric API endpoints
 */

import { get, post } from './client';
import type { ScoreSubmission, RubricResponse } from '../types/api';

/**
 * Get rubric criteria
 * Note: Rubric is global, not per-event
 */
export async function getRubric(): Promise<RubricResponse> {
    return get<RubricResponse>('/rubric/rubric');
}

/**
 * Submit scores for a team
 * IMPORTANT: Must include judgeId (judge profile ID, not user ID)
 * @param data - Score submission data including judgeId
 */
export async function submitScore(
    data: ScoreSubmission
): Promise<{ message: string }> {
    return post<{ message: string }>('/scores', data);
}

/**
 * Submit judge heartbeat to maintain online status
 * @param eventId - The event ID
 * @param judgeId - The judge profile ID (not user ID)
 */
export async function submitHeartbeat(
    eventId: string,
    judgeId: string
): Promise<{ lastActivity: string }> {
    return post<{ lastActivity: string }>('/judge/heartbeat', { eventId, judgeId });
}
