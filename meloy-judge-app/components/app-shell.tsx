"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/authentication/login-screen"
import { DashboardScreen } from "@/components/dashboard/dashboard-screen"
import { EventDetailScreen } from "@/components/events/event-detail-screen"
import { TeamDetailScreen } from "@/components/judging/team-detail-screen"
import { JudgeSelectionScreen } from "@/components/judging/judge-selection-screen"
import { LeaderboardScreen } from "@/components/events/leaderboard-screen"
import { AdminScreen } from "@/components/management/admin/admin-screen"
import { EventCreationScreen } from "@/components/management/event-creation-screen"
import { EventManagerScreen } from "@/components/management/event-manager-screen"
import { InsightsScreen } from "@/components/management/insights-screen"
import { ModeratorScreen } from "@/components/management/moderator-screen"
import { getCurrentUser } from "@/lib/api"

export type Screen = "login" | "dashboard" | "judge-selection" | "event-detail" | "team-detail" | "leaderboard" | "admin" | "event-creation" | "event-manager" | "insights" | "moderator"

interface AppShellProps {
    initialScreen?: Screen
}

export function AppShell({ initialScreen = "login" }: AppShellProps) {
    const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen)
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [managingEventId, setManagingEventId] = useState<string | null>(null)
    const [previousScreen, setPreviousScreen] = useState<Screen | null>(null)
    const [judgeId, setJudgeId] = useState<string | null>(null)
    const [judgeName, setJudgeName] = useState<string | null>(null)
    const [userName, setUserName] = useState<string | null>(null)

    // Fetch logged-in user's actual name and role on mount and when screen changes
    useEffect(() => {
        async function fetchUser() {
            if (currentScreen !== "login") {
                try {
                    const userData = await getCurrentUser()
                    console.log('User data fetched:', userData.user)
                    setUserName(userData.user.name || 'User')
                    setUserRole(userData.user.role || 'judge')
                    setIsAdmin(userData.user.role === 'admin')
                } catch (err) {
                    console.error('Failed to fetch user:', err)
                }
            }
        }
        fetchUser()
    }, [currentScreen])

    const handleLogin = (admin = false) => {
        setIsAdmin(admin)
        setCurrentScreen("dashboard")
    }

    const handleSelectEvent = (eventId: string) => {
        console.log('handleSelectEvent called:', { eventId, userRole, isAdmin })
        setSelectedEventId(eventId)
        // If judge role, show judge selection screen first
        // Use userRole from database, not isAdmin from login
        if (userRole === 'judge') {
            console.log('Navigating to judge-selection screen')
            setCurrentScreen("judge-selection")
        } else {
            console.log('Navigating to event-detail screen')
            setCurrentScreen("event-detail")
        }
    }

    const handleSelectJudge = (selectedJudgeId: string, selectedJudgeName: string) => {
        setJudgeId(selectedJudgeId)
        setJudgeName(selectedJudgeName)
        setCurrentScreen("event-detail")
    }

    const handleSelectTeam = (teamId: string) => {
        setSelectedTeamId(teamId)
        setCurrentScreen("team-detail")
    }

    const handleBack = () => {
        if (currentScreen === "judge-selection") {
            setCurrentScreen("dashboard")
        } else if (currentScreen === "team-detail") {
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
            currentScreen === "admin"
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
            {currentScreen === "judge-selection" && selectedEventId && (
                <JudgeSelectionScreen
                    eventId={selectedEventId}
                    eventName="Aggies Invent Spring 2025"
                    onSelectJudge={handleSelectJudge}
                    onBack={handleBack}
                />
            )}
            {currentScreen === "event-detail" && selectedEventId && (
                <EventDetailScreen
                    eventId={selectedEventId}
                    judgeId={judgeId}
                    onSelectTeam={handleSelectTeam}
                    onBack={handleBack}
                    onNavigate={setCurrentScreen}
                    onManageEvent={handleManageEvent}
                    onOpenModerator={() => setCurrentScreen("moderator")}
                    isAdmin={isAdmin}
                    judgeName={isAdmin ? userName : judgeName}
                />
            )}
            {currentScreen === "team-detail" && selectedTeamId && (
                <TeamDetailScreen teamId={selectedTeamId} judgeId={judgeId} onBack={handleBack} judgeName={isAdmin ? userName : judgeName} isAdmin={isAdmin} />
            )}
            {currentScreen === "leaderboard" && selectedEventId && (
                <LeaderboardScreen eventId={selectedEventId} judgeId={judgeId} onBack={handleBack} judgeName={isAdmin ? userName : judgeName} isAdmin={isAdmin} />
            )}
            {currentScreen === "moderator" && selectedEventId && (
                <ModeratorScreen eventId={selectedEventId} onBack={handleBack} userName={userName} />
            )}
            {currentScreen === "admin" && <AdminScreen onBack={handleBack} onCreateEvent={handleCreateEvent} onManageEvent={handleManageEvent} />}
            {currentScreen === "event-creation" && <EventCreationScreen onBack={handleBack} onCreateEvent={handleEventCreated} />}
            {currentScreen === "event-manager" && managingEventId && (
                <EventManagerScreen eventId={managingEventId} onBack={handleBack} onSave={handleEventManagerSave} />
            )}
            {currentScreen === "insights" && <InsightsScreen onBack={handleBack} />}
        </main>
    )
}
