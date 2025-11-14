"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Users,
  Clock,
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Timer,
  Target,
  Sparkles,
} from "lucide-react"

interface InsightsScreenProps {
  onBack: () => void
}

type EventStatus = "completed" | "active" | "upcoming"

interface EventInsight {
  id: string
  name: string
  date: string
  status: EventStatus
  totalTeams: number
  totalJudges: number
  avgJudgingTime: number
  completionRate: number
  avgScore: number
  topScore: number
  judgeUtilization: number
}

const mockEventInsights: EventInsight[] = [
  {
    id: "1",
    name: "Aggies Invent Spring 2025",
    date: "March 15-17, 2025",
    status: "active",
    totalTeams: 24,
    totalJudges: 8,
    avgJudgingTime: 18,
    completionRate: 67,
    avgScore: 78.5,
    topScore: 94.2,
    judgeUtilization: 85,
  },
  {
    id: "2",
    name: "Aggies Invent Fall 2024",
    date: "October 20-22, 2024",
    status: "completed",
    totalTeams: 18,
    totalJudges: 6,
    avgJudgingTime: 22,
    completionRate: 100,
    avgScore: 82.3,
    topScore: 95.8,
    judgeUtilization: 90,
  },
  {
    id: "3",
    name: "Problems Worth Solving Summer 2024",
    date: "July 10-12, 2024",
    status: "completed",
    totalTeams: 20,
    totalJudges: 7,
    avgJudgingTime: 20,
    completionRate: 100,
    avgScore: 76.8,
    topScore: 92.4,
    judgeUtilization: 88,
  },
  {
    id: "4",
    name: "Aggies Invent Spring 2024",
    date: "March 18-20, 2024",
    status: "completed",
    totalTeams: 22,
    totalJudges: 7,
    avgJudgingTime: 25,
    completionRate: 100,
    avgScore: 80.1,
    topScore: 93.6,
    judgeUtilization: 82,
  },
]

interface TeamBreakdown {
  teamName: string
  projectTitle: string
  tableNumber: string
  judges: string[]
  scores: {
    innovation: number
    feasibility: number
    impact: number
    presentation: number
  }
  totalScore: number
  rank: number
  judgingTime: number
}

const mockTeamBreakdowns: Record<string, TeamBreakdown[]> = {
  "2": [
    {
      teamName: "Team Phoenix",
      projectTitle: "Smart Campus Navigation System",
      tableNumber: "A-12",
      judges: ["Dr. Sarah Johnson", "Prof. Michael Chen"],
      scores: { innovation: 92, feasibility: 88, impact: 90, presentation: 95 },
      totalScore: 91.25,
      rank: 1,
      judgingTime: 20,
    },
    {
      teamName: "Team Nova",
      projectTitle: "Sustainable Energy Monitor",
      tableNumber: "B-05",
      judges: ["Dr. Emily Rodriguez", "Prof. John Davis"],
      scores: { innovation: 88, feasibility: 90, impact: 85, presentation: 87 },
      totalScore: 87.5,
      rank: 2,
      judgingTime: 22,
    },
    {
      teamName: "Team Aurora",
      projectTitle: "AI Study Assistant",
      tableNumber: "C-18",
      judges: ["Dr. Sarah Johnson", "Dr. Emily Rodriguez"],
      scores: { innovation: 85, feasibility: 82, impact: 88, presentation: 84 },
      totalScore: 84.75,
      rank: 3,
      judgingTime: 24,
    },
  ],
}

export function InsightsScreen({ onBack }: InsightsScreenProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventInsight | null>(null)

  const handleExportCSV = (eventId: string, eventName: string) => {
    const breakdown = mockTeamBreakdowns[eventId]
    if (!breakdown) {
      alert("No data available for this event")
      return
    }

    // Generate CSV content
    const headers = [
      "Rank",
      "Team Name",
      "Project Title",
      "Table Number",
      "Judges",
      "Innovation Score",
      "Feasibility Score",
      "Impact Score",
      "Presentation Score",
      "Total Score",
      "Judging Time (min)",
    ]
    const csvContent = [
      headers.join(","),
      ...breakdown.map((team) =>
        [
          team.rank,
          `"${team.teamName}"`,
          `"${team.projectTitle}"`,
          team.tableNumber,
          `"${team.judges.join("; ")}"`,
          team.scores.innovation,
          team.scores.feasibility,
          team.scores.impact,
          team.scores.presentation,
          team.totalScore,
          team.judgingTime,
        ].join(",")
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${eventName.replace(/\s+/g, "_")}_Results.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const completedEvents = mockEventInsights.filter((e) => e.status === "completed")
  const avgCompletionRate = completedEvents.reduce((acc, e) => acc + e.completionRate, 0) / completedEvents.length
  const avgJudgingTime = completedEvents.reduce((acc, e) => acc + e.avgJudgingTime, 0) / completedEvents.length
  const totalEventsManaged = mockEventInsights.length
  const avgJudgeUtilization = completedEvents.reduce((acc, e) => acc + e.judgeUtilization, 0) / completedEvents.length

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "completed":
        return "bg-slate-200 text-slate-700 border-slate-300"
      case "upcoming":
        return "bg-sky-100 text-sky-700 border-sky-200"
    }
  }

  const getMetricTrend = (current: number, previous: number) => {
    const diff = current - previous
    const isPositive = diff > 0
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "text-emerald-600" : "text-red-600",
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-16 lg:h-20 w-auto items-center justify-center rounded-xl border border-white/25 bg-white/15 px-3 py-2 shadow-md backdrop-blur-md">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">Event Insights</h1>
                <p className="text-sm text-white/90">Analytics and performance metrics across all events</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
        {/* Overview Metrics */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/10 to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Total Events</p>
                <p className="mt-0.5 text-3xl font-semibold text-slate-900">{totalEventsManaged}</p>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-200/60 via-emerald-100/40 to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Avg Completion</p>
                <p className="mt-0.5 text-3xl font-semibold text-slate-900">{avgCompletionRate.toFixed(0)}%</p>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-linear-to-br from-sky-200/60 via-sky-100/40 to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <Timer className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Avg Judge Time</p>
                <p className="mt-0.5 text-3xl font-semibold text-slate-900">{avgJudgingTime.toFixed(0)}m</p>
              </div>
            </div>
          </Card>

          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute inset-0 bg-linear-to-br from-amber-200/60 via-amber-100/40 to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <Target className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Judge Usage</p>
                <p className="mt-0.5 text-3xl font-semibold text-slate-900">{avgJudgeUtilization.toFixed(0)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Event History */}
        <Card className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 bg-linear-to-br from-slate-50 to-white p-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
              <BarChart3 className="h-6 w-6 text-primary" />
              Event History & Analytics
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              Review past events and export detailed judging breakdowns
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {mockEventInsights.map((event, index) => {
                const prevEvent = mockEventInsights[index + 1]
                const scoreTrend = prevEvent ? getMetricTrend(event.avgScore, prevEvent.avgScore) : null
                const timeTrend = prevEvent ? getMetricTrend(prevEvent.avgJudgingTime, event.avgJudgingTime) : null

                return (
                  <div
                    key={event.id}
                    className="group transition-colors hover:bg-slate-50/70 p-6"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-semibold text-slate-900">{event.name}</h3>
                              <Badge className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusBadge(event.status)}`}>
                                {event.status}
                              </Badge>
                            </div>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="h-4 w-4" />
                              {event.date}
                            </p>
                          </div>
                          {event.status === "completed" && (
                            <Button
                              onClick={() => handleExportCSV(event.id, event.name)}
                              className="h-11 rounded-xl bg-primary px-6 text-base font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                            >
                              <Download className="mr-2 h-5 w-5" />
                              Export CSV
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-6 gap-4">
                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              <Users className="h-3.5 w-3.5" />
                              Teams
                            </div>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{event.totalTeams}</p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              <Award className="h-3.5 w-3.5" />
                              Judges
                            </div>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{event.totalJudges}</p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Complete
                            </div>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{event.completionRate}%</p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              <Clock className="h-3.5 w-3.5" />
                              Avg Time
                            </div>
                            <div className="mt-2 flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-slate-900">{event.avgJudgingTime}m</p>
                              {timeTrend && (
                                <div className={`flex items-center gap-1 text-xs font-semibold ${timeTrend.color}`}>
                                  <timeTrend.icon className="h-3 w-3" />
                                  {timeTrend.value}m
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              <BarChart3 className="h-3.5 w-3.5" />
                              Avg Score
                            </div>
                            <div className="mt-2 flex items-baseline gap-2">
                              <p className="text-2xl font-semibold text-slate-900">{event.avgScore}</p>
                              {scoreTrend && (
                                <div className={`flex items-center gap-1 text-xs font-semibold ${scoreTrend.color}`}>
                                  <scoreTrend.icon className="h-3 w-3" />
                                  {scoreTrend.value}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              <Sparkles className="h-3.5 w-3.5" />
                              Top Score
                            </div>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{event.topScore}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Insights & Recommendations */}
        <Card className="mt-8 overflow-hidden rounded-[28px] border-none bg-linear-to-br from-primary/95 via-primary/90 to-[#3d0000] text-white shadow-2xl">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10 bg-white/10 blur-2xl" />
          <CardHeader className="relative p-8 pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
              <Sparkles className="h-6 w-6" />
              Key Insights & Recommendations
            </CardTitle>
            <CardDescription className="text-base text-white/80">
              Data-driven suggestions to improve future events
            </CardDescription>
          </CardHeader>
          <CardContent className="relative p-8 pt-4">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Judge Utilization Improving</h4>
                    <p className="mt-1 text-sm text-white/80">
                      Your judge utilization rate has increased to {avgJudgeUtilization.toFixed(0)}%. Consider maintaining current judge-to-team ratios for optimal efficiency.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Judging Time Optimization</h4>
                    <p className="mt-1 text-sm text-white/80">
                      Average judging time is {avgJudgingTime.toFixed(0)} minutes per team. Consider 20-minute slots to balance thoroughness with efficiency.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Completion Rate Excellence</h4>
                    <p className="mt-1 text-sm text-white/80">
                      Maintaining {avgCompletionRate.toFixed(0)}% completion rate across events. Excellent coordination between judges and teams!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
