"use client"

import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Screen } from "@/app/page"
import { ArrowLeft, BarChart3, Users, CheckCircle2, Clock, Circle, MapPin, CalendarDays, Sparkles } from "lucide-react"

interface EventDetailScreenProps {
  eventId: string
  onSelectTeam: (teamId: string) => void
  onBack: () => void
  onNavigate: (screen: Screen) => void
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

export function EventDetailScreen({ eventId, onSelectTeam, onBack, onNavigate }: EventDetailScreenProps) {
  const gradedCount = mockTeams.filter((t) => t.status === "graded").length
  const totalCount = mockTeams.length
  const inProgressCount = mockTeams.filter((t) => t.status === "in-progress").length
  const notGradedCount = totalCount - gradedCount - inProgressCount
  const completionPercent = Math.round((gradedCount / totalCount) * 100)

  const statusCopy: Record<typeof mockTeams[number]["status"], { label: string; tone: string }> = {
    graded: { label: "Graded", tone: "text-emerald-600" },
    "in-progress": { label: "In Progress", tone: "text-amber-500" },
    "not-graded": { label: "Not Graded", tone: "text-slate-500" },
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-auto items-center justify-center rounded-xl border border-white/25 bg-white/15 p-2 shadow-md backdrop-blur-md">
                  <Image src="/apptitle.png" alt="Meloy Program Judging Portal" width={120} height={50} className="object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Event spotlight</p>
                  <h1 className="text-3xl font-semibold text-white sm:text-[2.25rem]">Aggies Invent Spring 2025</h1>
                </div>
              </div>
            </div>
            <Button
              onClick={() => onNavigate("leaderboard")}
              className="h-11 rounded-full bg-white px-6 text-base font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white/95"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              View Leaderboard
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/25 bg-white/10 px-6 py-4 text-white/90">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-white" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Dates</p>
                  <p className="text-lg font-semibold text-white">March 15–17, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-white" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Venue</p>
                  <p className="text-lg font-semibold text-white">Zachry Engineering Center</p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm font-medium text-white">
              Event ID - {eventId}
            </Badge>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-lg backdrop-blur-sm">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/5 to-transparent" />
            <CardContent className="relative flex flex-col gap-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Teams graded</p>
              <p className="text-4xl font-semibold text-slate-900">{gradedCount}</p>
              <span className="text-sm text-slate-500">{completionPercent}% complete</span>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
            <CardContent className="flex flex-col gap-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">In progress</p>
              <p className="text-4xl font-semibold text-slate-900">{inProgressCount}</p>
              <span className="text-sm text-slate-500">Teams currently being scored</span>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
            <CardContent className="flex flex-col gap-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Awaiting judging</p>
              <p className="text-4xl font-semibold text-slate-900">{notGradedCount}</p>
              <span className="text-sm text-slate-500">Queued for judge review</span>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/90 via-primary/80 to-[#3d0000] text-white shadow-xl">
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
            <CardContent className="relative flex flex-col gap-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Momentum</p>
              <p className="text-lg font-semibold text-white">Stay synced with judges and mentors.</p>
              <Button
                variant="secondary"
                className="w-fit rounded-full border border-white/40 bg-white/20 px-5 py-2 text-sm font-semibold text-white hover:bg-white/30"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Share update
              </Button>
            </CardContent>
          </Card>
        </section>

        <div className="mt-14 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">Team roster</h2>
              <p className="text-sm text-slate-500">
                Tracking {gradedCount} graded, {inProgressCount} in progress, {notGradedCount} awaiting review
              </p>
            </div>
            <Badge className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              {gradedCount}/{totalCount} complete
            </Badge>
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
