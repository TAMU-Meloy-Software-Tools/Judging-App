/**
 * Admin and User Management API endpoints
 */

import { get, post, put, patch } from './client';
import type { UsersResponse, User, ActivityResponse } from '../types/api';

/**
 * Get all users (admin only)
 */
export async function getUsers(): Promise<UsersResponse> {
    return get<UsersResponse>('/users');
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
    userId: string,
    role: string
): Promise<{ user: User }> {
    return put<{ user: User }>(`/users/${userId}/role`, { role });
}

/**
 * Get activity log (admin only)
 */
export async function getActivity(limit = 50): Promise<ActivityResponse> {
    return get<ActivityResponse>(`/admin/activity?limit=${limit}`);
}

/**
 * Initialize/reset database schema (admin only)
 * WARNING: This drops all tables and recreates them
 */
export async function initSchema(): Promise<{ message: string; version: string }> {
    return post<{ message: string; version: string }>('/admin/init-schema');
}

/**
 * Seed test data (admin only)
 * Creates sample events, teams, judge profiles, and scores
 */
export async function seedData(): Promise<{ message: string }> {
    return post<{ message: string }>('/admin/seed-data');
}

// ==================== MODERATOR ENDPOINTS ====================

/**
 * Get team scoring matrix for moderator view
 */
export async function getTeamScores(eventId: string): Promise<{
    teams: Array<{
        id: string;
        name: string;
        projectTitle: string;
        status: string;
        order: number;
        scores: Array<{
            judgeId: string;
            judgeName: string;
            score: number | null;
        }>;
    }>;
    judges: Array<{
        id: string;
        name: string;
        isOnline: boolean;
    }>;
}> {
    return get(`/events/${eventId}/teams/scores`);
}

/**
 * Update team status (moderator/admin only)
 */
export async function updateTeamStatus(
    teamId: string,
    status: 'waiting' | 'active' | 'completed'
): Promise<{ team: any }> {
    return patch(`/teams/${teamId}/status`, { status });
}

/**
 * Update event judging phase (moderator/admin only)
 */
export async function updateEventPhase(
    eventId: string,
    judging_phase: 'not-started' | 'in-progress' | 'ended'
): Promise<{ event: any }> {
    return patch(`/events/${eventId}/phase`, { judging_phase });
}
