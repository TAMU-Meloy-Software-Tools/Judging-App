/**
 * Judge Profile Context Management
 * 
 * Utilities for managing the selected judge profile in the frontend.
 * Since multiple judge profiles can share one user account, we need to track
 * which profile the current device is using.
 */

import type { JudgeProfile } from './types/api';

const JUDGE_PROFILE_KEY = 'meloy_judge_profile';
const EVENT_ID_KEY = 'meloy_event_id';

/**
 * Store the selected judge profile in localStorage
 */
export function setJudgeProfile(profile: JudgeProfile): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(JUDGE_PROFILE_KEY, JSON.stringify(profile));
        localStorage.setItem(EVENT_ID_KEY, profile.event_id);
    }
}

/**
 * Get the stored judge profile from localStorage
 */
export function getJudgeProfile(): JudgeProfile | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(JUDGE_PROFILE_KEY);
    if (!stored) return null;
    
    try {
        return JSON.parse(stored) as JudgeProfile;
    } catch {
        return null;
    }
}

/**
 * Get the current event ID from stored judge profile
 */
export function getCurrentEventId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(EVENT_ID_KEY);
}

/**
 * Clear the stored judge profile (on logout or profile switch)
 */
export function clearJudgeProfile(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(JUDGE_PROFILE_KEY);
        localStorage.removeItem(EVENT_ID_KEY);
    }
}

/**
 * Check if a judge profile is currently selected
 */
export function hasJudgeProfile(): boolean {
    return getJudgeProfile() !== null;
}

/**
 * Get the judge profile ID (shorthand)
 */
export function getJudgeId(): string | null {
    const profile = getJudgeProfile();
    return profile?.id ?? null;
}

/**
 * Get the judge profile name (shorthand)
 */
export function getJudgeName(): string | null {
    const profile = getJudgeProfile();
    return profile?.name ?? null;
}
