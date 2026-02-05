"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Screen } from "@/app/page"
import { ArrowLeft, BarChart3, Users, CheckCircle2, Clock, Circle, MapPin, CalendarDays, Activity, Settings, User, Loader2 } from "lucide-react"
import { getEvent, getEventTeams } from "@/lib/api"
import type { Event, Team } from "@/lib/types/api"

interface EventDetailScreenProps {
  eventId: string
  onSelectTeam: (teamId: string) => void
  onBack: () => void
  onNavigate: (screen: Screen) => void
  onManageEvent: (eventId: string) => void
  onOpenModerator: () => void
  isAdmin: boolean
  judgeName: string | null
}

export function EventDetailScreen({ eventId, onSelectTeam, onBack, onNavigate, onManageEvent, onOpenModerator, isAdmin, judgeName }: EventDetailScreenProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [eventData, teamsData] = await Promise.all([
          getEvent(eventId),
          getEventTeams(eventId, true)  // activeOnly=true for judges
        ])
        setEvent(eventData.event)
        setTeams(teamsData.teams)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [eventId])

  // Determine event type and labels from RDS data
  const isPWSEvent = event?.event_type?.includes("problems-worth-solving") ?? false
  const participantLabel = isPWSEvent ? "Student" : "Team"
  const participantsLabel = isPWSEvent ? "Students" : "Teams"

  // Calculate team statistics from RDS data
  const totalCount = teams.length
  const scoredCount = teams.filter(t => t.has_current_user_scored).length
  const inProgressCount = 0 // Could track partially completed in future
  const notScoredCount = totalCount - scoredCount - inProgressCount

  // Get event logo based on event type
  const eventLogoSrc = isPWSEvent ? "/pws.png" : "/aggiesinvent.png"

  // Sponsor data from RDS or fallback
  const sponsor = event?.sponsor_id && event.sponsor ? {
    name: event.sponsor.name ?? "Sponsor",
    logo: event.sponsor.logo_url ?? (isPWSEvent ? "/TAMUlogo.png" : "/ExxonLogo.png"),
    primaryColor: event.sponsor.primary_color ?? (isPWSEvent ? "#500000" : "#b91c1c"),
    secondaryColor: event.sponsor.secondary_color ?? (isPWSEvent ? "#3d0000" : "#7f1d1d")
  } : {
    name: isPWSEvent ? "Meloy Program" : "ExxonMobil",
    logo: isPWSEvent ? "/TAMUlogo.png" : "/ExxonLogo.png",
    primaryColor: isPWSEvent ? "#500000" : "#b91c1c",
    secondaryColor: isPWSEvent ? "#3d0000" : "#7f1d1d"
  }

  // Format date range helper
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', options)
    }

    const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endFormatted = end.toLocaleDateString('en-US', options)
    return `${startMonth} – ${endFormatted}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-primary/5">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading event details...</p>
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          {/* Main Header Row */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <ArrowLeft className="h-7 w-7" />
              </Button>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="flex h-16 lg:h-20 w-auto shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 px-3 py-2 shadow-md backdrop-blur-md">
                  <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Event spotlight</p>
                  <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">{event.name}</h1>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-center lg:flex-nowrap lg:justify-end">
              {/* User Profile */}
              <div className="hidden sm:flex items-center gap-3 rounded-full border-2 border-white/30 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white leading-tight">{judgeName || "Admin"}</span>
                  <span className="text-xs text-white/70">Admin</span>
                </div>
              </div>

              <Button
                onClick={() => onNavigate("leaderboard")}
                className="h-11 rounded-full bg-white px-5 lg:px-6 text-base font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white/95"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Leaderboard
              </Button>
              {isAdmin && (
                <>
                  <Button
                    onClick={onOpenModerator}
                    className="h-11 rounded-full border-2 border-white/30 bg-white/10 px-5 lg:px-6 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <Activity className="mr-2 h-5 w-5" />
                    Moderator
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onManageEvent(eventId)}
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <Settings className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6">
        {/* Unified Event Info Banner - sponsor and event details in one cohesive card */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border-2 border-red-950 shadow-xl">
          {/* Inner container with sponsor gradient - smaller radius to fit inside border */}
          <div
            className="relative rounded-[22px] py-4 px-5 lg:py-5 lg:px-6"
            style={{
              background: `linear-gradient(to bottom, ${sponsor.primaryColor}, ${sponsor.secondaryColor})`
            }}
          >
            {/* Very subtle texture overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

            <div className="relative flex items-center gap-6 lg:gap-8">
              {/* Sponsor block with glass container showing sponsor color */}
              <div className="group relative flex items-center gap-5 lg:gap-6 cursor-pointer transition-transform hover:scale-[1.02]">
                {/* Dynamic glass container - adapts to logo aspect ratio */}
                <div
                  className="relative flex shrink-0 items-center justify-center rounded-2xl py-3 px-6 lg:py-4 lg:px-8 shadow-xl backdrop-blur-xl transition-all group-hover:shadow-2xl bg-white/70 border-2 border-white/80 min-h-20 lg:min-h-24"
                >
                  {/* Inner glow on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ backgroundColor: `${sponsor.primaryColor}10` }}
                  />
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name ?? "Sponsor logo"}
                    width={120}
                    height={60}
                    className="relative h-14 lg:h-16 w-auto max-w-45 lg:max-w-55 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.12em] text-white/80">Presented by</p>
                  <p className="text-xl lg:text-2xl font-semibold text-white leading-tight max-w-100 lg:max-w-105 wrap-break-word drop-shadow-sm">{sponsor.name}</p>
                </div>
              </div>

              {/* Event details card with status badge - enhanced glass aesthetic */}
              <div className="ml-auto flex items-center gap-3">
                {/* Event Status Badge - enhanced glass background */}
                <div className="flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/70 backdrop-blur-xl px-4 py-2 shadow-xl">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-700">Active</span>
                </div>

                {/* Event details - enhanced glass background */}
                <div className="flex items-center rounded-3xl border-2 border-white/70 bg-white/70 backdrop-blur-xl px-4 py-2 shadow-xl">
                  <div className="flex items-center gap-3">
                    <Image src={eventLogoSrc} alt="Event logo" width={64} height={64} className="w-16 h-16 lg:w-20 lg:h-20 object-contain" />

                    <div className="flex items-center gap-5 lg:gap-6">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <CalendarDays className="h-5 w-5 text-slate-700" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-600">Dates</p>
                          <p className="text-sm lg:text-base font-semibold text-slate-900">{formatDateRange(event.start_date, event.end_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 lg:gap-3">
                        <MapPin className="h-5 w-5 text-slate-700" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-600">Venue</p>
                          <p className="text-sm lg:text-base font-semibold text-slate-900">{event.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metric cards with visual connection to event info banner */}
        <section className="relative mb-4 grid grid-cols-3 gap-4">
          {/* Subtle connecting gradient fade from banner to metrics */}
          <div className="absolute -top-4 left-0 right-0 h-6 bg-linear-to-b from-slate-50/30 to-transparent pointer-events-none" />

          <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white/90 p-5 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-200/60 via-emerald-100/40 to-transparent" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{participantsLabel} scored</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{scoredCount}</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border-2 border-amber-200 bg-white/90 p-5 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-300">
            <div className="absolute inset-0 bg-linear-to-br from-amber-200/60 via-amber-100/40 to-transparent" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">In progress</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{inProgressCount}</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-white/90 p-5 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-400">
            <div className="absolute inset-0 bg-linear-to-br from-slate-200/60 via-slate-100/40 to-transparent" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <Circle className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Awaiting scoring</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{notScoredCount}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">{participantLabel} roster</h2>
              <p className="text-sm text-slate-500">
                Tracking {scoredCount} scored, {inProgressCount} in progress, {notScoredCount} awaiting review
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {teams.length > 0 ? teams.map((team) => {
              const isScored = team.has_current_user_scored ?? false;
              return (
                <Card
                  key={team.id}
                  className={`group relative overflow-hidden rounded-3xl border shadow-md transition-all ${isScored
                    ? 'border-emerald-200 bg-emerald-50/50 opacity-75 cursor-default'
                    : 'border-slate-200/70 bg-white/90 hover:-translate-y-1 hover:shadow-xl cursor-pointer'
                    }`}
                  onClick={() => !isScored && onSelectTeam(team.id)}
                  role="button"
                  tabIndex={isScored ? -1 : 0}
                  onKeyDown={(event) => {
                    if (!isScored && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault()
                      onSelectTeam(team.id)
                    }
                  }}
                >
                  <div className={`absolute inset-x-0 top-0 h-1 ${isScored
                    ? 'bg-emerald-500'
                    : 'bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-70'
                    }`} />
                  <CardHeader className="relative flex flex-col gap-3 p-6 pb-4">
                    <div>
                      <CardTitle className={`text-2xl font-semibold transition-colors ${isScored ? 'text-emerald-700' : 'text-slate-900 group-hover:text-primary'
                        }`}>
                        {team.name}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base text-slate-600">{team.description || 'No description'}</CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {isScored ? (
                        <Badge className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 shadow-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Scores Submitted</span>
                        </Badge>
                      ) : (
                        <Badge className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm">
                          <Circle className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">{team.status || 'Pending'}</span>
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              );
            }) : (
              <Card className="rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <Clock className="h-16 w-16 text-slate-300" />
                  <CardTitle className="text-xl font-semibold text-slate-700">No Active {participantsLabel}</CardTitle>
                  <CardDescription className="text-base text-slate-500 max-w-md">
                    The moderator will activate {participantsLabel.toLowerCase()} for judging when ready. Check back soon or contact the event moderator.
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}