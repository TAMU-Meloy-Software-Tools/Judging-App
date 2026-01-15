"use client"

import { useState } from "react"
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
} from "lucide-react"

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

const mockJudges: Judge[] = [
  { id: "1", name: "Dr. Smith", isOnline: true },
  { id: "2", name: "Prof. Johnson", isOnline: true },
  { id: "3", name: "Ms. Williams", isOnline: true },
  { id: "4", name: "Dr. Brown", isOnline: true },
]

const mockTeams: Team[] = [
  {
    id: "1",
    name: "Team Alpha",
    projectTitle: "Smart Campus Navigation",
    status: "completed",
    order: 1,
    scores: [
      { judgeId: "1", judgeName: "Dr. Smith", score: 83 },
      { judgeId: "2", judgeName: "Prof. Johnson", score: 85 },
      { judgeId: "3", judgeName: "Ms. Williams", score: 86 },
      { judgeId: "4", judgeName: "Dr. Brown", score: 86 },
    ],
  },
  {
    id: "2",
    name: "Team Beta",
    projectTitle: "Sustainable Energy Monitor",
    status: "active",
    order: 2,
    scores: [
      { judgeId: "1", judgeName: "Dr. Smith", score: 86 },
      { judgeId: "2", judgeName: "Prof. Johnson", score: 89 },
      { judgeId: "3", judgeName: "Ms. Williams", score: null },
      { judgeId: "4", judgeName: "Dr. Brown", score: null },
    ],
  },
  {
    id: "3",
    name: "Team Gamma",
    projectTitle: "AI Study Assistant",
    status: "waiting",
    order: 3,
    scores: [
      { judgeId: "1", judgeName: "Dr. Smith", score: null },
      { judgeId: "2", judgeName: "Prof. Johnson", score: null },
      { judgeId: "3", judgeName: "Ms. Williams", score: null },
      { judgeId: "4", judgeName: "Dr. Brown", score: null },
    ],
  },
  {
    id: "4",
    name: "Team Delta",
    projectTitle: "Campus Safety Alerts",
    status: "waiting",
    order: 4,
    scores: [
      { judgeId: "1", judgeName: "Dr. Smith", score: null },
      { judgeId: "2", judgeName: "Prof. Johnson", score: null },
      { judgeId: "3", judgeName: "Ms. Williams", score: null },
      { judgeId: "4", judgeName: "Dr. Brown", score: null },
    ],
  },
  {
    id: "5",
    name: "Team Epsilon",
    projectTitle: "Food Waste Platform",
    status: "waiting",
    order: 5,
    scores: [
      { judgeId: "1", judgeName: "Dr. Smith", score: null },
      { judgeId: "2", judgeName: "Prof. Johnson", score: null },
      { judgeId: "3", judgeName: "Ms. Williams", score: null },
      { judgeId: "4", judgeName: "Dr. Brown", score: null },
    ],
  },
]

export function ModeratorScreen({ eventId, onBack }: ModeratorScreenProps) {
  const [teams, setTeams] = useState(mockTeams)
  const [eventStatus, setEventStatus] = useState<"not-started" | "in-progress" | "ended">("in-progress")

  // Mock sponsor data - replace with real data later
  const sponsor = { 
    name: "ExxonMobil", 
    logo: "/ExxonLogo.png",
    color: "#500000"
  }

  const teamsCompleted = teams.filter((t) => t.status === "completed").length
  const teamsActive = teams.filter((t) => t.status === "active").length
  const teamsWaiting = teams.filter((t) => t.status === "waiting").length
  const completionPercent = Math.round((teamsCompleted / teams.length) * 100)

  const handleStatusChange = (teamId: string, newStatus: TeamStatus) => {
    setTeams(teams.map(team => team.id === teamId ? { ...team, status: newStatus } : team))
  }

  const handleEndJudging = () => {
    setEventStatus("ended")
    // This would trigger the final summary view for judges
  }

  const getTeamTotal = (team: Team) => {
    return team.scores.reduce((sum, score) => sum + (score.score || 0), 0)
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-slate-50 via-white to-primary/5">
      <div className="w-full bg-linear-to-b from-primary to-[#3d0000]">
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
                <p className="text-sm text-white/85">Aggies Invent Spring 2025 - Live Control</p>
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
                <div className="flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/70 backdrop-blur-xl px-4 py-2 shadow-xl">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-700">Judging in Progress</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-4 gap-4">
            <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/10 to-transparent" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Total Teams</p>
                  <p className="mt-0.5 text-3xl font-semibold text-slate-900">{teams.length}</p>
                </div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-sky-200/60 via-sky-100/40 to-transparent" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80">
                  <Clock className="h-6 w-6 text-sky-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Active</p>
                  <p className="mt-0.5 text-3xl font-semibold text-slate-900">{teamsActive}</p>
                </div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-200/60 via-emerald-100/40 to-transparent" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Completed</p>
                  <p className="mt-0.5 text-3xl font-semibold text-slate-900">{teamsCompleted}</p>
                </div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-linear-to-br from-amber-200/60 via-amber-100/40 to-transparent" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80">
                  <BarChart3 className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Progress</p>
                  <p className="mt-0.5 text-3xl font-semibold text-slate-900">{completionPercent}%</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Card className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-60" />
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
                          {/* Maroon gradient top stripe */}
                          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-600 to-primary" />
                          
                          <div className="flex items-start gap-4">
                            {/* Order badge with maroon gradient */}
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-[#3d0000] font-bold text-white shadow-md">
                              <span className="text-2xl">{team.order}</span>
                              <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                                isCompleted 
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
                                  className={`h-9 flex-1 rounded-xl text-xs font-bold shadow-sm transition-all ${
                                    isWaiting
                                      ? "bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-amber-200" 
                                      : "border-2 border-primary/20 text-slate-700 hover:bg-primary/5 hover:border-primary/30"
                                  }`}
                                >
                                  Waiting
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isActive ? "default" : "outline"}
                                  onClick={() => handleStatusChange(team.id, "active")}
                                  className={`h-9 flex-1 rounded-xl text-xs font-bold shadow-sm transition-all ${
                                    isActive
                                      ? "bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white border-0 shadow-sky-200" 
                                      : "border-2 border-primary/20 text-slate-700 hover:bg-primary/5 hover:border-primary/30"
                                  }`}
                                >
                                  <Play className="h-3.5 w-3.5 mr-1" />
                                  Active
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isCompleted ? "default" : "outline"}
                                  onClick={() => handleStatusChange(team.id, "completed")}
                                  className={`h-9 flex-1 rounded-xl text-xs font-bold shadow-sm transition-all ${
                                    isCompleted
                                      ? "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-emerald-200" 
                                      : "border-2 border-primary/20 text-slate-700 hover:bg-primary/5 hover:border-primary/30"
                                  }`}
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
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-60" />
                <CardHeader className="p-6 pb-4">
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
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="overflow-x-auto">
                    <div className="rounded-xl border border-primary/20 bg-white overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="grid grid-cols-7 gap-px bg-white">
                            <th className="bg-linear-to-br from-primary to-[#3d0000] px-3 py-3 text-left">
                              <p className="text-xs font-semibold text-white">Team</p>
                            </th>
                            {mockJudges.map((judge) => (
                              <th key={judge.id} className="bg-linear-to-br from-primary to-[#3d0000] px-2 py-3">
                                <p className="text-xs font-semibold text-white text-center truncate">{judge.name}</p>
                                <div className="mt-1 flex justify-center">
                                  <div className={`h-2 w-2 rounded-full ${judge.isOnline ? "bg-emerald-400" : "bg-slate-300"}`} />
                                </div>
                              </th>
                            ))}
                            <th className="bg-linear-to-br from-primary to-[#3d0000] px-2 py-3">
                              <p className="text-xs font-semibold text-white text-center">Total</p>
                            </th>
                            <th className="bg-linear-to-br from-primary to-[#3d0000] px-2 py-3">
                              <p className="text-xs font-semibold text-white text-center">%</p>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {teams.sort((a, b) => getTeamTotal(b) - getTeamTotal(a)).map((team, index) => {
                            const total = getTeamTotal(team)
                            const percentage = Math.round((total / 400) * 100)
                            return (
                              <tr key={team.id} className="grid grid-cols-7 gap-px bg-primary/10 hover:bg-primary/15 transition-all duration-500 ease-in-out">
                                <td className="bg-white px-3 py-4 border-l-4 border-primary/40 transition-all duration-500">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={`h-6 w-6 rounded-lg p-0 flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                                        team.status === "completed"
                                          ? "bg-emerald-500 text-white"
                                          : team.status === "active"
                                            ? "bg-sky-500 text-white"
                                            : "bg-amber-500 text-white"
                                      }`}
                                    >
                                      {index + 1}
                                    </Badge>
                                    <p className="font-medium text-slate-900 text-sm">{team.name}</p>
                                  </div>
                                </td>
                                {team.scores.map((score) => (
                                  <td key={score.judgeId} className="bg-white px-2 py-4 transition-all duration-500">
                                    <div className="flex flex-col items-center transition-all duration-500">
                                      {score.score !== null ? (
                                        <>
                                          <span className="text-base font-bold text-slate-900">{score.score}</span>
                                          <span className="text-xs text-slate-500">/100</span>
                                          <div className="mt-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full rounded-full bg-linear-to-r from-primary to-[#3d0000] transition-all" 
                                              style={{ width: `${score.score}%` }} 
                                            />
                                          </div>
                                        </>
                                      ) : (
                                        <span className="inline-flex h-8 w-12 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400">
                                          —
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                ))}
                                <td className="bg-white px-2 py-4 transition-all duration-500">
                                  <div className="text-center transition-all duration-500">
                                    <span className="text-lg font-bold text-slate-900">{total}</span>
                                    <br />
                                    <span className="text-xs text-slate-500">/400</span>
                                  </div>
                                </td>
                                <td className="bg-white px-2 py-4 transition-all duration-500">
                                  <div className="text-center transition-all duration-500">
                                    <span className="text-base font-semibold text-primary">{percentage}%</span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-60" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Event Control</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {eventStatus === "ended" 
                          ? "Judging has ended. Summary available to judges."
                          : `${teamsCompleted}/${teams.length} teams completed`
                        }
                      </p>
                    </div>
                    <Button
                      onClick={handleEndJudging}
                      disabled={eventStatus === "ended" || teamsCompleted < teams.length}
                      className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <StopCircle className="mr-2 h-5 w-5" />
                      End Judging
                    </Button>
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
