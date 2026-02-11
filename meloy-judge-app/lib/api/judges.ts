/**
 * Judge Profiles API endpoints
 * 
 * Judge profiles are named judges within an event.
 * Multiple profiles can share one user account per event.
 */

import { get, post, del } from './client';

export interface JudgeProfile {
    id: string;
    event_id: string;
    user_id: string;
    name: string;
    assigned_at: string;
}

/**
 * Get all judge profiles for an event
 */
export async function getEventJudgeProfiles(
    eventId: string
): Promise<{ profiles: JudgeProfile[] }> {
    return get<{ profiles: JudgeProfile[] }>(`/events/${eventId}/judge-profiles`);
}

/**
 * Create a new judge profile for an event
 * Links to the event's dedicated judge user account
 */
export async function createJudgeProfile(
    eventId: string,
    data: {
        name: string;
        user_id: string; // The shared judge account for this event
    }
): Promise<{ profile: JudgeProfile }> {
    return post<{ profile: JudgeProfile }>(`/events/${eventId}/judge-profiles`, data);
}

/**
 * Delete a judge profile
 */
export async function deleteJudgeProfile(
    profileId: string
): Promise<void> {
    return del<void>(`/judge-profiles/${profileId}`);
}
