"use client"

import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Screen } from "@/app/page"
import { ArrowLeft, BarChart3, Users, CheckCircle2, Clock, Circle, MapPin, CalendarDays, Activity, Settings } from "lucide-react"

interface EventDetailScreenProps {
  eventId: string
  onSelectTeam: (teamId: string) => void
  onBack: () => void
  onNavigate: (screen: Screen) => void
  onManageEvent: (eventId: string) => void
  onOpenModerator: () => void
  isAdmin: boolean
}

const mockTeams = [
  {
    id: "1",
    name: "Team Alpha",
    projectTitle: "Smart Campus Navigation System",
    members: ["John Doe", "Jane Smith", "Bob Johnson"],
    status: "not-graded",
    tableNumber: "A-12",
  },
  {
    id: "2",
    name: "Team Beta",
    projectTitle: "Sustainable Energy Monitor",
    members: ["Alice Williams", "Charlie Brown", "Diana Prince"],
    status: "graded",
    tableNumber: "B-05",
    score: 87,
  },
  {
    id: "3",
    name: "Team Gamma",
    projectTitle: "AI-Powered Study Assistant",
    members: ["Eve Davis", "Frank Miller", "Grace Lee"],
    status: "in-progress",
    tableNumber: "C-18",
  },
  {
    id: "4",
    name: "Team Delta",
    projectTitle: "Campus Safety Alert System",
    members: ["Henry Wilson", "Ivy Chen", "Jack Taylor"],
    status: "not-graded",
    tableNumber: "A-07",
  },
  {
    id: "5",
    name: "Team Epsilon",
    projectTitle: "Food Waste Reduction Platform",
    members: ["Kate Anderson", "Leo Martinez", "Maya Patel"],
    status: "graded",
    tableNumber: "B-14",
    score: 92,
  },
]

export function EventDetailScreen({ eventId, onSelectTeam, onBack, onNavigate, onManageEvent, onOpenModerator, isAdmin }: EventDetailScreenProps) {
  const gradedCount = mockTeams.filter((t) => t.status === "graded").length
  const totalCount = mockTeams.length
  const inProgressCount = mockTeams.filter((t) => t.status === "in-progress").length
  const notGradedCount = totalCount - gradedCount - inProgressCount
  const completionPercent = Math.round((gradedCount / totalCount) * 100)

  // small display mapping for event & sponsor logos (replace with real data retrieval later)
  // show white version of event logos via CSS filter for high contrast in header
  const eventLogoSrc = eventId === "1" ? "/aggiesinvent.png" : "/pws.png"
  const sponsor = { 
    name: "ExxonMobil", 
    logo: "/ExxonLogo.png",
    color: "#500000" // Texas A&M maroon - replace with user-chosen sponsor color from event settings
  }

  const statusCopy: Record<typeof mockTeams[number]["status"], { label: string; tone: string }> = {
    graded: { label: "Graded", tone: "text-emerald-600" },
    "in-progress": { label: "In Progress", tone: "text-amber-500" },
    "not-graded": { label: "Not Graded", tone: "text-slate-500" },
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
  <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          {/* Main Header Row */}
          <div className="flex items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="flex h-16 lg:h-20 w-auto shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 px-3 py-2 shadow-md backdrop-blur-md">
                  <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Event spotlight</p>
                  <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">Aggies Invent Spring 2025</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
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
          {/* Inner container with red to dark red gradient - smaller radius to fit inside border */}
          <div className="relative rounded-[22px] py-4 px-5 lg:py-5 lg:px-6 bg-linear-to-b from-red-600 to-red-950">
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
                    style={{ backgroundColor: `${sponsor.color}10` }}
                  />
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name ?? "Sponsor logo"}
                    width={120}
                    height={60}
                    className="relative h-14 lg:h-16 w-auto max-w-[180px] lg:max-w-[220px] object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.12em] text-white/80">Presented by</p>
                  <p className="text-xl lg:text-2xl font-semibold text-white leading-tight max-w-[400px] lg:max-w-[420px] wrap-break-word drop-shadow-sm">{sponsor.name}</p>
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
                          <p className="text-sm lg:text-base font-semibold text-slate-900">Mar 15–17, 2025</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 lg:gap-3">
                        <MapPin className="h-5 w-5 text-slate-700" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-600">Venue</p>
                          <p className="text-sm lg:text-base font-semibold text-slate-900">Zachry Engineering Center</p>
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
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Teams graded</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{gradedCount}</p>
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
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Awaiting judging</p>
                <p className="mt-0.5 text-2xl font-semibold text-slate-900">{notGradedCount}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">Team roster</h2>
              <p className="text-sm text-slate-500">
                Tracking {gradedCount} graded, {inProgressCount} in progress, {notGradedCount} awaiting review
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {mockTeams.map((team) => (
              <Card
                key={team.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                onClick={() => onSelectTeam(team.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onSelectTeam(team.id)
                  }
                }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-70" />
                <CardHeader className="relative flex flex-col gap-3 p-6 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl font-semibold text-slate-900 transition-colors group-hover:text-primary">
                        {team.name}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base text-slate-600">{team.projectTitle}</CardDescription>
                    </div>
                    <Badge variant="outline" className="rounded-full border-primary/30 px-4 py-1 text-sm font-semibold text-primary">
                      Table {team.tableNumber}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm"
                    >
                      {team.status === "graded" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : team.status === "in-progress" ? (
                        <Clock className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-400" />
                      )}
                      <span className={statusCopy[team.status].tone}>{statusCopy[team.status].label}</span>
                    </Badge>
                    {team.status === "graded" && typeof team.score === "number" ? (
                      <Badge className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary shadow-sm">
                        Score {team.score}
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </span>
                    <span className="font-medium text-slate-700">{team.members.join(", ")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
