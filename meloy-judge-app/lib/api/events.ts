/**
 * Events API endpoints
 */

import { get, post, put, patch, del } from './client';
import type {
    EventsResponse,
    Event,
    TeamsResponse,
    LeaderboardResponse,
    InsightsResponse,
    JudgesOnlineResponse,
    JudgeProgressResponse,
} from '../types/api';

/**
 * Get all events with optional filters
 */
export async function getEvents(filters?: {
    status?: string;
    type?: string;
}): Promise<EventsResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);

    const query = params.toString();
    return get<EventsResponse>(`/events${query ? `?${query}` : ''}`);
}

/**
 * Get a single event by ID
 */
export async function getEvent(id: string): Promise<{ event: Event }> {
    return get<{ event: Event }>(`/events/${id}`);
}

/**
 * Create a new event (admin only)
 */
export async function createEvent(data: Partial<Event>): Promise<{ event: Event }> {
    return post<{ event: Event }>('/events', data);
}

/**
 * Update an event (admin/moderator)
 */
export async function updateEvent(
    id: string,
    data: Partial<Event>
): Promise<{ event: Event }> {
    return put<{ event: Event }>(`/events/${id}`, data);
}

/**
 * Delete an event (admin only)
 */
export async function deleteEvent(id: string): Promise<void> {
    return del<void>(`/events/${id}`);
}

/**
 * Get all teams for an event
 * @param eventId - The event ID
 * @param options - Query options
 * @param options.activeOnly - If true, only returns teams with status='active' (for judges)
 * @param options.judgeId - Optional judge profile ID to filter has_scored status
 */
export async function getEventTeams(
    eventId: string,
    options?: { activeOnly?: boolean; judgeId?: string }
): Promise<TeamsResponse> {
    const params = new URLSearchParams();
    if (options?.activeOnly) params.append('activeOnly', 'true');
    if (options?.judgeId) params.append('judgeId', options.judgeId);
    
    const query = params.toString();
    return get<TeamsResponse>(`/events/${eventId}/teams${query ? `?${query}` : ''}`);
}

/**
 * Get leaderboard for an event
 */
export async function getEventLeaderboard(
    eventId: string
): Promise<LeaderboardResponse> {
    return get<LeaderboardResponse>(`/events/${eventId}/leaderboard`);
}

/**
 * Get insights for an event (admin only)
 */
export async function getEventInsights(
    eventId: string
): Promise<InsightsResponse> {
    return get<InsightsResponse>(`/events/${eventId}/insights`);
}

/**
 * Get online judges for an event
 */
export async function getOnlineJudges(
    eventId: string
): Promise<JudgesOnlineResponse> {
    return get<JudgesOnlineResponse>(`/events/${eventId}/judges/online`);
}

/**
 * Update active team (moderator)
 */
export async function updateActiveTeam(
    eventId: string,
    teamId: string | null
): Promise<{ event: Event }> {
    return put<{ event: Event }>(`/events/${eventId}/team-active`, {
        current_active_team_id: teamId,
    });
}

/**
 * Update judging phase (moderator)
 * Note: This wraps the main updateEventPhase function for backwards compatibility
 */
export async function updateJudgingPhase(
    eventId: string,
    phase: string
): Promise<{ event: Event }> {
    return patch<{ event: Event }>(`/events/${eventId}/phase`, {
        judging_phase: phase,
    });
}

/**
 * Get moderator status for an event
 */
export async function getModeratorStatus(eventId: string): Promise<any> {
    return get<any>(`/events/${eventId}/moderator/status`);
}

/**
 * Get judge's progress for an event
 * @param eventId - The event ID
 * @param judgeId - The judge profile ID
 */
export async function getMyProgress(
    eventId: string,
    judgeId: string
): Promise<any> {
    return get<any>(`/events/${eventId}/my-progress?judgeId=${judgeId}`);
}

/**
 * Update event's dedicated judge account (admin only)
 * @param eventId - The event ID
 * @param userEmail - Email of the user to set as judge account
 */
export async function updateJudgeAccount(
    eventId: string,
    userEmail: string
): Promise<{ event: Event }> {
    return put<{ event: Event }>(`/events/${eventId}/judge-account`, { userEmail });
}
