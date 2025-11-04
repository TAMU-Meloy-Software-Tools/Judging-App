"use client"

import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Medal, Award, Sparkles } from "lucide-react"

interface LeaderboardScreenProps {
  eventId: string
  onBack: () => void
}

const rubricOrder = [
  { key: "communication", label: "Effective Communication" },
  { key: "funding", label: "Would Fund/Buy", short: "Fund/Buy" },
  { key: "presentation", label: "Presentation" },
  { key: "overall", label: "Overall" },
] as const

const mockLeaderboard = [
  {
    rank: 1,
    teamName: "Team Epsilon",
    projectTitle: "Food Waste Reduction Platform",
    totalScore: 92,
    breakdown: {
      communication: 24,
      funding: 23,
      presentation: 23,
      overall: 22,
    },
  },
  {
    rank: 2,
    teamName: "Team Beta",
    projectTitle: "Sustainable Energy Monitor",
    totalScore: 88,
    breakdown: {
      communication: 22,
      funding: 22,
      presentation: 22,
      overall: 22,
    },
  },
  {
    rank: 3,
    teamName: "Team Alpha",
    projectTitle: "Smart Campus Navigation System",
    totalScore: 85,
    breakdown: {
      communication: 22,
      funding: 21,
      presentation: 21,
      overall: 21,
    },
  },
  {
    rank: 4,
    teamName: "Team Gamma",
    projectTitle: "AI-Powered Study Assistant",
    totalScore: 82,
    breakdown: {
      communication: 21,
      funding: 20,
      presentation: 20,
      overall: 21,
    },
  },
  {
    rank: 5,
    teamName: "Team Delta",
    projectTitle: "Campus Safety Alert System",
    totalScore: 78,
    breakdown: {
      communication: 20,
      funding: 19,
      presentation: 19,
      overall: 20,
    },
  },
]

export function LeaderboardScreen({ eventId, onBack }: LeaderboardScreenProps) {
  const teams = [...mockLeaderboard].sort((a, b) => a.rank - b.rank)
  const gradedTeams = teams.length
  const highestScore = teams[0]?.totalScore ?? 0
  const averageScore =
    gradedTeams > 0 ? Math.round(teams.reduce((acc, team) => acc + team.totalScore, 0) / gradedTeams) : 0

  const topThree = teams.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <header className="relative overflow-hidden border-b bg-gradient-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-7">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-14 w-14 items-center justify-center rounded-full text-white hover:bg-white/20"
                aria-label="Back to event"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-auto items-center justify-center rounded-2xl border border-white/25 bg-white/15 px-3 py-2 shadow-md backdrop-blur-md">
                  <Image src="/apptitle.png" alt="Meloy Program Judging Portal" width={128} height={52} className="object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Live standings</p>
                  <h1 className="text-[2.25rem] font-semibold text-white sm:text-[2.75rem]">Leaderboard</h1>
                  <p className="text-base text-white/80">Event {eventId}</p>
                </div>
              </div>
            </div>
            <Badge className="flex items-center gap-3 rounded-full border border-white/40 bg-white/20 px-6 py-4 text-lg font-semibold text-white">
              <Trophy className="h-5 w-5" />
              Aggies Invent Spring 2025
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
              <CardContent className="relative flex flex-col gap-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Teams scored</p>
                <p className="text-4xl font-semibold text-slate-900">{gradedTeams}</p>
                <span className="text-base text-slate-500">Active on leaderboard</span>
              </CardContent>
            </Card>
            <Card className="rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
              <CardContent className="flex flex-col gap-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Top score</p>
                <p className="text-4xl font-semibold text-slate-900">{highestScore}</p>
                <span className="text-base text-slate-500">Highest total out of 100</span>
              </CardContent>
            </Card>
            <Card className="rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
              <CardContent className="flex flex-col gap-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Average score</p>
                <p className="text-4xl font-semibold text-slate-900">{averageScore}</p>
                <span className="text-base text-slate-500">Mean total across teams</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-16">
        {gradedTeams > 0 ? (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-[1.9rem] font-semibold text-slate-900">Spotlight Podium</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {topThree.map((team) => (
                  <Card
                    key={team.rank}
                    className={`relative overflow-hidden rounded-[28px] border ${
                      team.rank === 1
                        ? "border-yellow-300 bg-gradient-to-br from-yellow-200 via-white to-yellow-100"
                        : team.rank === 2
                          ? "border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-100"
                          : "border-orange-300 bg-gradient-to-br from-orange-200 via-white to-orange-100"
                    } shadow-lg`}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-rose-400 to-orange-300 opacity-60" />
                    <CardHeader className="flex flex-col gap-3 p-6 pb-4">
                      <div className="flex items-center justify-between">
                        <Badge className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700">
                          #{team.rank}
                        </Badge>
                        <Badge className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700">
                          {team.totalScore} pts
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-semibold text-slate-900">{team.teamName}</CardTitle>
                      <CardDescription className="text-base text-slate-600">{team.projectTitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="space-y-2">
                        {rubricOrder.map((criterion) => {
                          const score = team.breakdown[criterion.key]
                          const percent = (score / 25) * 100

                          return (
                            <div key={criterion.key} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                                <span>{criterion.short ?? criterion.label}</span>
                                <span>{score}/25</span>
                              </div>
                              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${Math.min(100, percent)}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mt-12 space-y-6">
              <div>
                <h3 className="text-[1.9rem] font-semibold text-slate-900">All Teams</h3>
                <p className="mt-2 text-base text-slate-500">Scores update in real time as judges submit grades.</p>
              </div>

              <div className="space-y-6">
                {teams.map((team) => (
                  <Card
                    key={team.rank}
                    className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-md transition-all hover:-translate-y-[2px] hover:shadow-xl"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-rose-400 to-orange-300 opacity-60" />
                    <CardHeader className="flex flex-col gap-4 p-7 pb-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white ${
                              team.rank === 1
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
                                : team.rank === 2
                                  ? "bg-gradient-to-br from-slate-300 to-slate-400"
                                  : team.rank === 3
                                    ? "bg-gradient-to-br from-orange-400 to-orange-500"
                                    : "bg-gradient-to-br from-slate-500 to-slate-600"
                            }`}
                          >
                            {team.rank === 1 ? (
                              <Trophy className="h-8 w-8" />
                            ) : team.rank === 2 ? (
                              <Medal className="h-7 w-7" />
                            ) : team.rank === 3 ? (
                              <Award className="h-7 w-7" />
                            ) : (
                              `#${team.rank}`
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-[1.5rem] font-semibold text-slate-900">{team.teamName}</CardTitle>
                            <CardDescription className="mt-1 text-base text-slate-600">{team.projectTitle}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          className={`rounded-full px-5 py-3 text-lg font-semibold ${
                            team.rank === 1
                              ? "bg-primary text-white"
                              : team.rank <= 3
                                ? "bg-primary/10 text-primary"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {team.totalScore} pts
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-7 pb-7">
                      <div className="grid gap-4 md:grid-cols-2">
                        {rubricOrder.map((criterion) => {
                          const score = team.breakdown[criterion.key]
                          const percent = (score / 25) * 100

                          return (
                            <div
                              key={criterion.key}
                              className="rounded-[20px] border border-slate-200/70 bg-slate-50/70 px-4 py-3 text-sm text-slate-600"
                            >
                              <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                                <span>{criterion.label}</span>
                                <span>{score}/25</span>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${Math.min(100, percent)}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        ) : (
          <Card className="rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Trophy className="h-16 w-16 text-slate-300" />
              <CardTitle className="text-xl font-semibold text-slate-700">No scores yet</CardTitle>
              <CardDescription className="text-base text-slate-500">
                Teams will appear here once judges start submitting their rubric scores.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
