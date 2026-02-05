/**
 * Authentication API endpoints
 */

import { get, post } from './client';
import type { User, JudgeProfilesResponse, SessionStartResponse } from '../types/api';

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<{ user: User }> {
    return get<{ user: User }>('/auth/me');
}

/**
 * Logout current user and end judge session
 * @param judgeId - Optional judge profile ID if user is a judge
 */
export async function logout(judgeId?: string): Promise<{ message: string }> {
    return post<{ message: string }>('/auth/logout', judgeId ? { judgeId } : undefined);
}

/**
 * CAS callback handler (for future use)
 */
export async function casCallback(ticket: string): Promise<any> {
    return get<any>(`/auth/cas-callback?ticket=${ticket}`);
}

/**
 * Get judge profiles for current user for a specific event
 * Called after login to let user select which judge profile to use
 */
export async function getJudgeProfiles(eventId: string): Promise<JudgeProfilesResponse> {
    return get<JudgeProfilesResponse>(`/judge/profiles/${eventId}`);
}

/**
 * Start a judge session with a selected profile
 * @param judgeId - The judge profile ID to start session with
 * @param eventId - The event ID
 */
export async function startJudgeSession(
    judgeId: string,
    eventId: string
): Promise<SessionStartResponse> {
    return post<SessionStartResponse>('/judge/session/start', { judgeId, eventId });
}
