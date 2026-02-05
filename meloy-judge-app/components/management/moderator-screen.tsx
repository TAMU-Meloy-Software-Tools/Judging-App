"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  StopCircle,
  Users,
  BarChart3,
  User,
  Loader2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getEvent, getTeamScores, updateTeamStatus, updateEventPhase } from "@/lib/api"
import type { Event } from "@/lib/types/api"

interface ModeratorScreenProps {
  eventId: string
  onBack: () => void
}

type TeamStatus = "waiting" | "active" | "completed"

interface Judge {
  id: string
  name: string
  isOnline: boolean
}

interface TeamScore {
  judgeId: string
  judgeName: string
  score: number | null
}

interface Team {
  id: string
  name: string
  projectTitle: string
  status: TeamStatus
  order: number
  scores: TeamScore[]
}

export function ModeratorScreen({ eventId, onBack }: ModeratorScreenProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [judges, setJudges] = useState<Judge[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventStatus, setEventStatus] = useState<"not-started" | "in-progress" | "ended">("in-progress")
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch data from RDS with real-time updates
  useEffect(() => {
    async function fetchData() {
      try {
        // Only show loading spinner on initial load, not on background refreshes
        if (isInitialLoad) {
          setLoading(true)
        } else {
          setIsRefreshing(true)
        }
        setError(null)
        const [eventData, scoresData] = await Promise.all([
          getEvent(eventId),
          getTeamScores(eventId)
        ])
        setEvent(eventData.event)
        setTeams(scoresData.teams.map((t: any) => ({
          ...t,
          status: t.status as TeamStatus
        })))
        setJudges(scoresData.judges)
        const phase = eventData.event.judging_phase || 'in-progress'
        setEventStatus(phase as 'not-started' | 'in-progress' | 'ended')
        setLastUpdate(new Date())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load moderator data')
      } finally {
        if (isInitialLoad) {
          setLoading(false)
          setIsInitialLoad(false)
        }
        setIsRefreshing(false)
      }
    }
    fetchData()

    // Real-time auto-refresh every 5 seconds to keep scores and judge status up-to-date
    // Uses silent background updates with visual indicator
    const intervalId = setInterval(fetchData, 5000)

    // Cleanup on unmount
    return () => clearInterval(intervalId)
  }, [eventId, isInitialLoad])

  // Real sponsor data from RDS or fallback
  const isPWSEvent = event?.event_type?.includes("problems-worth-solving") ?? false
  const sponsor = event?.sponsor_id && event.sponsor ? {
    name: event.sponsor.name ?? "Sponsor",
    logo: event.sponsor.logo_url ?? (isPWSEvent ? "/TAMUlogo.png" : "/ExxonLogo.png"),
    color: event.sponsor.primary_color ?? (isPWSEvent ? "#500000" : "#b91c1c")
  } : {
    name: isPWSEvent ? "Meloy Program" : "ExxonMobil",
    logo: isPWSEvent ? "/TAMUlogo.png" : "/ExxonLogo.png",
    color: isPWSEvent ? "#500000" : "#b91c1c"
  }

  const teamsCompleted = teams.filter((t) => t.status === "completed").length
  const teamsActive = teams.filter((t) => t.status === "active").length
  const teamsWaiting = teams.filter((t) => t.status === "waiting").length
  const completionPercent = teams.length > 0 ? Math.round((teamsCompleted / teams.length) * 100) : 0

  // Check if all teams are completed
  const allTeamsCompleted = teams.length > 0 && teams.every(team => team.status === "completed")

  const handleStatusChange = async (teamId: string, newStatus: TeamStatus) => {
    try {
      await updateTeamStatus(teamId, newStatus)
      setTeams(teams.map(team => team.id === teamId ? { ...team, status: newStatus } : team))
    } catch (err) {
      console.error('Failed to update team status:', err)
      // Optionally show error to user
    }
  }

  const handleEndJudging = async () => {
    try {
      await updateEventPhase(eventId, 'ended')
      setEventStatus("ended")
    } catch (err) {
      console.error('Failed to end judging:', err)
      // Optionally show error to user
    }
  }

  const getTeamTotal = (team: Team) => {
    return team.scores.reduce((sum, score) => sum + (score.score || 0), 0)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-primary/5">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading moderator dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-primary/5">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || 'Event not found'}</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-slate-50 via-white to-primary/5">
      <div className="w-full z-30 relative bg-linear-to-b from-primary to-[#3d0000]">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <ArrowLeft className="h-7 w-7" />
              </Button>
              <div className="flex h-16 lg:h-20 w-auto items-center justify-center rounded-xl border border-white/25 bg-white/15 px-3 py-2 backdrop-blur-md">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">Event Moderator</h1>
                <p className="text-sm text-white/85">{event.name} - Live Control</p>
              </div>
            </div>

            {/* User Profile */}
            <div className="hidden sm:flex items-center gap-3 rounded-full border-2 border-white/30 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white leading-tight">Prof. Michael Chen</span>
                <span className="text-xs text-white/70">Moderator</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
          {/* Company/Sponsor Card with Event Phase */}
          <div className="relative mb-6 overflow-hidden rounded-3xl border-2 border-red-950 shadow-xl">
            <div className="relative rounded-[22px] py-4 px-5 lg:py-5 lg:px-6 bg-linear-to-b from-red-600 to-red-950">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

              <div className="relative flex items-center justify-between">
                {/* Sponsor block */}
                <div className="group relative flex items-center gap-5 lg:gap-6">
                  <div className="relative flex shrink-0 items-center justify-center rounded-2xl py-3 px-6 lg:py-4 lg:px-8 shadow-xl backdrop-blur-xl bg-white/70 border-2 border-white/80">
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      width={120}
                      height={60}
                      className="relative h-14 lg:h-16 w-auto max-w-[180px] lg:max-w-[220px] object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-white/80">Presented by</p>
                    <p className="text-xl lg:text-2xl font-semibold text-white leading-tight">{sponsor.name}</p>
                  </div>
                </div>

                {/* Event Phase Status */}
                {eventStatus === 'ended' ? (
                  <div className="flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/70 backdrop-blur-xl px-4 py-2 shadow-xl">
                    <div className="h-2 w-2 rounded-full bg-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">Judging Ended</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/70 backdrop-blur-xl px-4 py-2 shadow-xl">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-semibold text-emerald-700">Judging in Progress</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-3 lg:p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/10 to-transparent" />
              <div className="relative flex items-center gap-3 lg:gap-4">
                <div className="flex h-10 w-10 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl bg-white/80">
                  <Users className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-sm font-semibold uppercase tracking-[0.1em] lg:tracking-[0.15em] text-slate-500">Total Teams</p>
                  <p className="mt-0.5 text-xl lg:text-3xl font-semibold text-slate-900">{teams.length}</p>
                </div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-3 lg:p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/10 to-transparent" />
              <div className="relative flex items-center gap-3 lg:gap-4">
                <div className="flex h-10 w-10 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl bg-white/80">
                  <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-sm font-semibold uppercase tracking-[0.1em] lg:tracking-[0.15em] text-slate-500">Active</p>
                  <p className="mt-0.5 text-xl lg:text-3xl font-semibold text-slate-900">{teamsActive}</p>
                </div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-3 lg:p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/10 to-transparent" />
              <div className="relative flex items-center gap-3 lg:gap-4">
                <div className="flex h-10 w-10 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl bg-white/80">
                  <CheckCircle2 className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-sm font-semibold uppercase tracking-[0.1em] lg:tracking-[0.15em] text-slate-500">Completed</p>
                  <p className="mt-0.5 text-xl lg:text-3xl font-semibold text-slate-900">{teamsCompleted}</p>
                </div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-3 lg:p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/10 to-transparent" />
              <div className="relative flex items-center gap-3 lg:gap-4">
                <div className="flex h-10 w-10 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl bg-white/80">
                  <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-sm font-semibold uppercase tracking-[0.1em] lg:tracking-[0.15em] text-slate-500">Progress</p>
                  <p className="mt-0.5 text-xl lg:text-3xl font-semibold text-slate-900">{completionPercent}%</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Card className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95">

                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">Team Queue</CardTitle>
                      <CardDescription className="text-base text-slate-600">
                        Control judging flow and team status
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="space-y-3">
                    {teams.sort((a, b) => a.order - b.order).map((team) => {
                      const isCompleted = team.status === "completed"
                      const isActive = team.status === "active"
                      const isWaiting = team.status === "waiting"

                      return (
                        <div
                          key={team.id}
                          className="group relative overflow-hidden rounded-[20px] border-2 border-primary/20 bg-linear-to-br from-primary/5 to-white p-5 transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/30"
                        >

                          <div className="flex items-start gap-4">
                            {/* Order badge with maroon gradient */}
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-[#3d0000] font-bold text-white shadow-md">
                              <span className="text-2xl">{team.order}</span>
                              <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${isCompleted
                                ? "bg-emerald-400"
                                : isActive
                                  ? "bg-sky-400 animate-pulse"
                                  : "bg-amber-400"
                                }`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Team info */}
                              <div className="mb-3">
                                <h4 className="font-bold text-lg text-slate-900 mb-1">{team.name}</h4>
                                <p className="text-sm text-slate-600 font-medium">{team.projectTitle}</p>
                              </div>

                              {/* Status controls with maroon theme */}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={isWaiting ? "default" : "outline"}
                                  onClick={() => handleStatusChange(team.id, "waiting")}
                                  disabled={eventStatus === "ended"}
                                  className={`h-9 flex-1 rounded-xl text-xs font-bold shadow-sm transition-all ${isWaiting
                                    ? "bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-amber-200"
                                    : "border-2 border-primary/20 text-slate-700 hover:bg-primary/5 hover:border-primary/30"
                                    } ${eventStatus === "ended" ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  Waiting
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isActive ? "default" : "outline"}
                                  onClick={() => handleStatusChange(team.id, "active")}
                                  disabled={eventStatus === "ended"}
                                  className={`h-9 flex-1 rounded-xl text-xs font-bold shadow-sm transition-all ${isActive
                                    ? "bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white border-0 shadow-sky-200"
                                    : "border-2 border-primary/20 text-slate-700 hover:bg-primary/5 hover:border-primary/30"
                                    } ${eventStatus === "ended" ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  <Play className="h-3.5 w-3.5 mr-1" />
                                  Active
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isCompleted ? "default" : "outline"}
                                  onClick={() => handleStatusChange(team.id, "completed")}
                                  disabled={eventStatus === "ended"}
                                  className={`h-9 flex-1 rounded-xl text-xs font-bold shadow-sm transition-all ${isCompleted
                                    ? "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-emerald-200"
                                    : "border-2 border-primary/20 text-slate-700 hover:bg-primary/5 hover:border-primary/30"
                                    } ${eventStatus === "ended" ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  Complete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-7">
              <Card className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95">

                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-slate-900">Live Scoring</CardTitle>
                        <CardDescription className="text-base text-slate-600">
                          Real-time scores from all judges (max 400 points per team)
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${isRefreshing ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-xs text-slate-500">
                        {isRefreshing ? 'Updating...' : 'Live'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="overflow-x-auto -mx-2 px-2">
                    <div className="rounded-xl border border-primary/20 bg-white overflow-hidden min-w-[800px]">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-white border-b border-primary/20">
                              <th className="sticky left-0 z-10 bg-linear-to-br from-primary to-[#3d0000] px-3 py-3 text-left min-w-[140px] max-w-[200px] border-r border-white/20">
                                <p className="text-xs font-semibold text-white">Team</p>
                              </th>
                              {judges.map((judge) => (
                                <th key={judge.id} className="bg-linear-to-br from-primary to-[#3d0000] px-2 py-3 w-[90px] min-w-[90px] max-w-[90px] border-r border-white/20">
                                  <p className="text-xs font-semibold text-white text-center truncate px-1" title={judge.name}>
                                    {judge.name.split(' ').map(n => n[0]).join('.')}
                                  </p>
                                  <div className="mt-1 flex justify-center">
                                    <div className={`h-2 w-2 rounded-full transition-colors ${judge.isOnline ? "bg-emerald-400" : "bg-slate-300"}`} />
                                  </div>
                                </th>
                              ))}
                              <th className="sticky right-[60px] z-10 bg-linear-to-br from-primary to-[#3d0000] px-2 py-3 w-[70px] min-w-[70px] border-r border-white/20">
                                <p className="text-xs font-semibold text-white text-center">Total</p>
                              </th>
                              <th className="sticky right-0 z-10 bg-linear-to-br from-primary to-[#3d0000] px-2 py-3 w-[60px] min-w-[60px]">
                                <p className="text-xs font-semibold text-white text-center">%</p>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {teams.sort((a, b) => getTeamTotal(b) - getTeamTotal(a)).map((team, index) => {
                              const total = getTeamTotal(team)
                              const percentage = Math.round((total / 400) * 100)
                              return (
                                <tr key={team.id} className="bg-primary/5 hover:bg-primary/10 transition-all duration-300 border-b border-primary/10 last:border-0">
                                  <td className="sticky left-0 z-10 bg-white px-3 py-3 border-r border-primary/10 shadow-sm">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        className={`h-5 w-5 rounded-lg p-0 flex items-center justify-center text-xs font-bold shrink-0 ${team.status === "completed"
                                          ? "bg-emerald-500 text-white"
                                          : team.status === "active"
                                            ? "bg-sky-500 text-white"
                                            : "bg-amber-500 text-white"
                                          }`}
                                      >
                                        {index + 1}
                                      </Badge>
                                      <p className="font-medium text-slate-900 text-sm truncate" title={team.name}>{team.name}</p>
                                    </div>
                                  </td>
                                  {team.scores.map((score) => (
                                    <td key={score.judgeId} className="bg-white px-1.5 py-3 border-r border-primary/10 transition-all duration-500">
                                      <div className="flex flex-col items-center">
                                        {score.score !== null ? (
                                          <>
                                            <span className="text-sm font-bold text-slate-900">{score.score}</span>
                                            <div className="mt-1 h-1 w-full bg-slate-200 rounded-full overflow-hidden max-w-[50px]">
                                              <div
                                                className="h-full rounded-full bg-linear-to-r from-primary to-[#3d0000] transition-all duration-500"
                                                style={{ width: `${score.score}%` }}
                                              />
                                            </div>
                                          </>
                                        ) : (
                                          <span className="inline-flex h-7 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                                            —
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  ))}
                                  <td className="sticky right-[60px] z-10 bg-white px-2 py-3 border-r border-primary/10 shadow-sm transition-all duration-500">
                                    <div className="text-center">
                                      <span className="text-base font-bold text-slate-900">{total}</span>
                                    </div>
                                  </td>
                                  <td className="sticky right-0 z-10 bg-white px-2 py-3 shadow-sm transition-all duration-500">
                                    <div className="text-center">
                                      <span className="text-sm font-semibold text-primary">{percentage}%</span>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95">

                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Event Control</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {eventStatus === "ended"
                          ? "Judging has ended. Summary available to judges."
                          : allTeamsCompleted
                            ? "All teams completed. Ready to end judging."
                            : "Waiting for all teams to be marked as completed"
                        }
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={eventStatus === "ended" || !allTeamsCompleted}
                          className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <StopCircle className="mr-2 h-5 w-5" />
                          End Judging
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>End Judging?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to end the judging phase? This action cannot be undone and will finalize the event results.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleEndJudging}
                            className="bg-primary hover:bg-primary/90"
                          >
                            End Judging
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
