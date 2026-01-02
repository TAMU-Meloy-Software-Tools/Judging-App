"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/authentication/login-screen"
import { DashboardScreen } from "@/components/dashboard/dashboard-screen"
import { EventDetailScreen } from "@/components/events/event-detail-screen"
import { TeamDetailScreen } from "@/components/judging/team-detail-screen"
import { LeaderboardScreen } from "@/components/events/leaderboard-screen"
import { AdminScreen } from "@/components/management/admin-screen"
import { EventCreationScreen } from "@/components/management/event-creation-screen"
import { EventManagerScreen } from "@/components/management/event-manager-screen"
import { InsightsScreen } from "@/components/management/insights-screen"
import { ModeratorScreen } from "@/components/management/moderator-screen"
import { SettingsScreen } from "@/components/settings/settings-screen"

export type Screen = "login" | "dashboard" | "event-detail" | "team-detail" | "leaderboard" | "admin" | "settings" | "event-creation" | "event-manager" | "insights" | "moderator"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [managingEventId, setManagingEventId] = useState<string | null>(null)
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null)

  const handleLogin = (admin = false) => {
    setIsAdmin(true) // Always set as admin for now
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
    } else if (currentScreen === "leaderboard") {
      setCurrentScreen("event-detail")
    } else if (currentScreen === "moderator") {
      setCurrentScreen("event-detail")
    } else if (currentScreen === "event-creation") {
      setCurrentScreen("admin")
    } else if (currentScreen === "event-manager") {
      // Return to the screen we came from (either admin or event-detail)
      if (previousScreen && (previousScreen === "event-detail" || previousScreen === "admin")) {
        setCurrentScreen(previousScreen)
        setPreviousScreen(null)
      } else {
        setCurrentScreen("admin")
      }
    } else if (currentScreen === "insights") {
      setCurrentScreen("admin")
    } else if (
      currentScreen === "event-detail" ||
      currentScreen === "admin" ||
      currentScreen === "settings"
    ) {
      setCurrentScreen("dashboard")
    }
  }

  const handleCreateEvent = () => {
    setCurrentScreen("event-creation")
  }

  const handleEventCreated = (eventId?: string) => {
    // After creating event, go to event manager to configure it
    if (eventId) {
      setManagingEventId(eventId)
      setCurrentScreen("event-manager")
    } else {
      // Fallback if no eventId provided
      setCurrentScreen("admin")
    }
  }

  const handleManageEvent = (eventId: string) => {
    setManagingEventId(eventId)
    setPreviousScreen(currentScreen) // Remember where we came from
    setCurrentScreen("event-manager")
  }

  const handleEventManagerSave = () => {
    // Return to the screen we came from (either admin or event-detail)
    if (previousScreen && (previousScreen === "event-detail" || previousScreen === "admin")) {
      setCurrentScreen(previousScreen)
      setPreviousScreen(null)
    } else {
      setCurrentScreen("admin")
    }
  }

  const handleLogout = () => {
    setCurrentScreen("login")
    setIsAdmin(false)
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
          onManageEvent={handleManageEvent}
          onOpenModerator={() => setCurrentScreen("moderator")}
          isAdmin={isAdmin}
        />
      )}
      {currentScreen === "team-detail" && selectedTeamId && (
        <TeamDetailScreen teamId={selectedTeamId} onBack={handleBack} />
      )}
      {currentScreen === "leaderboard" && selectedEventId && (
        <LeaderboardScreen eventId={selectedEventId} onBack={handleBack} />
      )}
      {currentScreen === "moderator" && selectedEventId && (
        <ModeratorScreen eventId={selectedEventId} onBack={handleBack} />
      )}
      {currentScreen === "admin" && <AdminScreen onBack={handleBack} onCreateEvent={handleCreateEvent} onManageEvent={handleManageEvent} />}
      {currentScreen === "event-creation" && <EventCreationScreen onBack={handleBack} onCreateEvent={handleEventCreated} />}
      {currentScreen === "event-manager" && managingEventId && (
        <EventManagerScreen eventId={managingEventId} onBack={handleBack} onSave={handleEventManagerSave} />
      )}
      {currentScreen === "insights" && <InsightsScreen onBack={handleBack} />}
      {currentScreen === "settings" && <SettingsScreen onBack={handleBack} onLogout={handleLogout} />}
    </main>
  )
}
