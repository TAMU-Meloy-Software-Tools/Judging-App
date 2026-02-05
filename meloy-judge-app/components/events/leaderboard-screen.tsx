"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { JudgeProgressScreen } from "./judge-progress-screen"
import { FinalLeaderboardScreen } from "./final-leaderboard-screen"
import { getEvent } from "@/lib/api"
import type { Event } from "@/lib/types/api"

interface LeaderboardScreenProps {
  eventId: string
  onBack: () => void
  judgeName: string | null
}

/**
 * Leaderboard Screen Wrapper
 * 
 * Automatically detects judging phase from event data:
 * - "in-progress" or "not-started" → Judge Progress Screen
 * - "ended" → Final Leaderboard Screen
 * Dev toggle available to manually override
 */
export function LeaderboardScreen({ eventId, onBack, judgeName }: LeaderboardScreenProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [manualOverride, setManualOverride] = useState<boolean | null>(null)

  const isDev = process.env.NODE_ENV === 'development'

  // Fetch event data to check judging phase
  useEffect(() => {
    async function fetchEvent() {
      try {
        const { event: eventData } = await getEvent(eventId)
        setEvent(eventData)
      } catch (err) {
        console.error('Failed to fetch event:', err)
      }
    }
    fetchEvent()
  }, [eventId])

  // Determine which screen to show
  // Manual override takes precedence in dev mode
  const isPostJudging = manualOverride !== null
    ? manualOverride
    : event?.judging_phase === 'ended'

  return (
    <div className="relative">
      {/* Dev-only toggle */}
      {isDev && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-full border-2 border-slate-300 bg-white px-5 py-3 shadow-2xl">
          <Label htmlFor="view-toggle" className="text-sm font-semibold text-slate-700">
            {isPostJudging ? "Final Leaderboard" : "Judge Progress"}
            {manualOverride === null && event && " (Auto)"}
          </Label>
          <Switch
            id="view-toggle"
            checked={isPostJudging}
            onCheckedChange={setManualOverride}
          />
        </div>
      )}

      {/* Conditionally render the appropriate screen */}
      {isPostJudging ? (
        <FinalLeaderboardScreen eventId={eventId} onBack={onBack} judgeName={judgeName} />
      ) : (
        <JudgeProgressScreen eventId={eventId} onBack={onBack} judgeName={judgeName} />
      )}
    </div>
  )
}
