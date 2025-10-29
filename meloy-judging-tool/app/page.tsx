"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/login-screen"
import { DashboardScreen } from "@/components/dashboard-screen"
import { EventDetailScreen } from "@/components/event-detail-screen"
import { TeamDetailScreen } from "@/components/team-detail-screen"
import { LeaderboardScreen } from "@/components/leaderboard-screen"
import { AdminScreen } from "@/components/admin-screen"
import { SettingsScreen } from "@/components/settings-screen"

export type Screen = "login" | "dashboard" | "event-detail" | "team-detail" | "leaderboard" | "admin" | "settings"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const handleLogin = (admin = false) => {
    setIsAdmin(admin)
    setCurrentScreen("dashboard")
  }

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId)
    setCurrentScreen("event-detail")
  }

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId)
    setCurrentScreen("team-detail")
  }

  const handleBack = () => {
    if (currentScreen === "team-detail") {
      setCurrentScreen("event-detail")
    } else if (
      currentScreen === "event-detail" ||
      currentScreen === "leaderboard" ||
      currentScreen === "admin" ||
      currentScreen === "settings"
    ) {
      setCurrentScreen("dashboard")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {currentScreen === "login" && <LoginScreen onLogin={handleLogin} />}
      {currentScreen === "dashboard" && (
        <DashboardScreen onSelectEvent={handleSelectEvent} onNavigate={setCurrentScreen} isAdmin={isAdmin} />
      )}
      {currentScreen === "event-detail" && selectedEventId && (
        <EventDetailScreen
          eventId={selectedEventId}
          onSelectTeam={handleSelectTeam}
          onBack={handleBack}
          onNavigate={setCurrentScreen}
        />
      )}
      {currentScreen === "team-detail" && selectedTeamId && (
        <TeamDetailScreen teamId={selectedTeamId} onBack={handleBack} />
      )}
      {currentScreen === "leaderboard" && selectedEventId && (
        <LeaderboardScreen eventId={selectedEventId} onBack={handleBack} />
      )}
      {currentScreen === "admin" && <AdminScreen onBack={handleBack} />}
      {currentScreen === "settings" && <SettingsScreen onBack={handleBack} />}
    </main>
  )
}
