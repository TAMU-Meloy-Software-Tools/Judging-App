"use client"

import Image from "next/image"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Trophy, Medal, Award, BarChart3, MessageSquare, TrendingUp, Users, Clock, Megaphone, BadgeDollarSign, Presentation, Sparkles } from "lucide-react"

interface LeaderboardScreenProps {
  eventId: string
  onBack: () => void
}

const rubricOrder = [
  { 
    key: "communication", 
    label: "Effective Communication", 
    short: "Communication", 
    maxScore: 25,
    icon: Megaphone,
    description: "Problem clarity and solution impact"
  },
  { 
    key: "funding", 
    label: "Would Fund/Buy Solution", 
    short: "Fund/Buy", 
    maxScore: 25,
    icon: BadgeDollarSign,
    description: "Feasibility and commercial viability"
  },
  { 
    key: "presentation", 
    label: "Presentation Quality", 
    short: "Presentation", 
    maxScore: 25,
    icon: Presentation,
    description: "Delivery and demo effectiveness"
  },
  { 
    key: "cohesion", 
    label: "Team Cohesion", 
    short: "Cohesion", 
    maxScore: 25,
    icon: Sparkles,
    description: "Overall team synergy and confidence"
  },
] as const

// Mock data for "During Judging" mode - Judge's own scoring overview
const mockJudgeScores = [
  {
    teamName: "Team Alpha",
    projectTitle: "Smart Campus Navigation System",
    totalScore: 85,
    judgedAt: "2025-01-15 10:30 AM",
    breakdown: {
      communication: 22,
      funding: 21,
      presentation: 21,
      cohesion: 21,
    },
    reflections: {
      communication: "Clear explanation of campus navigation challenges. AR integration was well-demonstrated.",
      funding: "Strong market potential but needs more detail on monetization strategy.",
      presentation: "Good use of slides and demo. Could improve Q&A responses.",
      cohesion: "Team worked well together, complementary skill sets evident.",
    },
    comments: "Strong technical implementation, clear communication of problem and solution. Consider expanding on the business model for next round.",
  },
  {
    teamName: "Team Beta",
    projectTitle: "Sustainable Energy Monitor",
    totalScore: 88,
    judgedAt: "2025-01-15 11:15 AM",
    breakdown: {
      communication: 22,
      funding: 22,
      presentation: 22,
      cohesion: 22,
    },
    reflections: {
      communication: "Excellent articulation of energy waste problems and data-driven impact metrics.",
      funding: "Very convincing ROI calculations. Spoke to real customer pain points.",
      presentation: "Outstanding demo with live data visualization. Professional delivery.",
      cohesion: "Seamless handoffs between presenters. Well-rehearsed.",
    },
    comments: "Excellent presentation with strong business case and technical feasibility. One of the top teams.",
  },
  {
    teamName: "Team Gamma",
    projectTitle: "AI-Powered Study Assistant",
    totalScore: 82,
    judgedAt: "2025-01-15 1:45 PM",
    breakdown: {
      communication: 21,
      funding: 20,
      presentation: 20,
      cohesion: 21,
    },
    reflections: {
      communication: "Good concept explanation but could simplify the technical jargon.",
      funding: "Need more concrete evidence of demand. Market size estimates felt optimistic.",
      presentation: "Demo had technical issues. Backup plan would have helped.",
      cohesion: "Team was prepared but seemed nervous during technical difficulties.",
    },
    comments: "Good concept, needs more work on feasibility demonstration and backup planning for demos.",
  },
]

// Mock data for "Post Judging" mode - All judges' scores for all teams
const mockAllJudgesData = [
  {
    teamName: "Team Epsilon",
    projectTitle: "Food Waste Reduction Platform",
    rank: 1,
    averageScore: 92,
    judges: [
      { name: "Dr. Smith", score: 95, breakdown: { communication: 24, funding: 24, presentation: 24, cohesion: 23 } },
      { name: "Prof. Johnson", score: 91, breakdown: { communication: 23, funding: 23, presentation: 23, cohesion: 22 } },
      { name: "Ms. Williams", score: 90, breakdown: { communication: 23, funding: 22, presentation: 23, cohesion: 22 } },
      { name: "Dr. Brown", score: 92, breakdown: { communication: 24, funding: 23, presentation: 23, cohesion: 22 } },
    ],
    strengthAreas: ["Communication", "Funding Potential"],
  },
  {
    teamName: "Team Beta",
    projectTitle: "Sustainable Energy Monitor",
    rank: 2,
    averageScore: 88,
    judges: [
      { name: "Dr. Smith", score: 86, breakdown: { communication: 22, funding: 21, presentation: 22, cohesion: 21 } },
      { name: "Prof. Johnson", score: 89, breakdown: { communication: 23, funding: 22, presentation: 22, cohesion: 22 } },
      { name: "Ms. Williams", score: 88, breakdown: { communication: 22, funding: 22, presentation: 22, cohesion: 22 } },
      { name: "Dr. Brown", score: 89, breakdown: { communication: 23, funding: 22, presentation: 22, cohesion: 22 } },
    ],
    strengthAreas: ["Presentation", "Communication"],
  },
  {
    teamName: "Team Alpha",
    projectTitle: "Smart Campus Navigation System",
    rank: 3,
    averageScore: 85,
    judges: [
      { name: "Dr. Smith", score: 83, breakdown: { communication: 21, funding: 20, presentation: 21, cohesion: 21 } },
      { name: "Prof. Johnson", score: 85, breakdown: { communication: 22, funding: 21, presentation: 21, cohesion: 21 } },
      { name: "Ms. Williams", score: 86, breakdown: { communication: 22, funding: 21, presentation: 22, cohesion: 21 } },
      { name: "Dr. Brown", score: 86, breakdown: { communication: 22, funding: 22, presentation: 21, cohesion: 21 } },
    ],
    strengthAreas: ["Communication", "Cohesion"],
  },
  {
    teamName: "Team Gamma",
    projectTitle: "AI-Powered Study Assistant",
    rank: 4,
    averageScore: 82,
    judges: [
      { name: "Dr. Smith", score: 80, breakdown: { communication: 20, funding: 20, presentation: 20, cohesion: 20 } },
      { name: "Prof. Johnson", score: 82, breakdown: { communication: 21, funding: 20, presentation: 20, cohesion: 21 } },
      { name: "Ms. Williams", score: 83, breakdown: { communication: 21, funding: 21, presentation: 20, cohesion: 21 } },
      { name: "Dr. Brown", score: 83, breakdown: { communication: 21, funding: 21, presentation: 21, cohesion: 20 } },
    ],
    strengthAreas: ["Communication"],
  },
  {
    teamName: "Team Delta",
    projectTitle: "Campus Safety Alert System",
    rank: 5,
    averageScore: 78,
    judges: [
      { name: "Dr. Smith", score: 76, breakdown: { communication: 19, funding: 19, presentation: 19, cohesion: 19 } },
      { name: "Prof. Johnson", score: 78, breakdown: { communication: 20, funding: 19, presentation: 19, cohesion: 20 } },
      { name: "Ms. Williams", score: 79, breakdown: { communication: 20, funding: 20, presentation: 19, cohesion: 20 } },
      { name: "Dr. Brown", score: 79, breakdown: { communication: 20, funding: 20, presentation: 20, cohesion: 19 } },
    ],
    strengthAreas: ["Communication"],
  },
]

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
      cohesion: 22,
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
      cohesion: 22,
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
      cohesion: 21,
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
      cohesion: 21,
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
      cohesion: 20,
    },
  },
]

export function LeaderboardScreen({ eventId, onBack }: LeaderboardScreenProps) {
  const [isPostJudging, setIsPostJudging] = useState(false)

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 lg:gap-6 mb-4">
            <div className="flex items-center gap-4 lg:gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <ArrowLeft className="h-7 w-7" />
              </Button>
              <div className="flex h-16 lg:h-20 w-auto items-center justify-center rounded-xl border border-white/25 bg-white/15 px-3 py-2 shadow-md backdrop-blur-md">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">Summary</h1>
                <p className="text-sm text-white/85">{isPostJudging ? "Final event analytics" : "Your scoring history"}</p>
              </div>
            </div>

            {/* Toggle between modes */}
            <div className="flex items-center gap-3 rounded-xl border border-white/25 bg-white/15 px-4 py-3 backdrop-blur-md shadow-lg">
              <Label htmlFor="mode-toggle" className="text-sm font-medium text-white cursor-pointer">
                {isPostJudging ? "Post Judging" : "During Judging"}
              </Label>
              <Switch
                id="mode-toggle"
                checked={isPostJudging}
                onCheckedChange={setIsPostJudging}
                className="data-[state=checked]:bg-white/30"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
        {isPostJudging ? (
          /* POST JUDGING MODE - Full Event Summary */
          <PostJudgingView />
        ) : (
          /* DURING JUDGING MODE - Judge's Own Scoring Overview */
          <DuringJudgingView />
        )}
      </main>
    </div>
  )
}

/* DURING JUDGING VIEW COMPONENT */
function DuringJudgingView() {
  const totalTeamsJudged = mockJudgeScores.length
  const averageScore = totalTeamsJudged > 0 
    ? Math.round(mockJudgeScores.reduce((sum, team) => sum + team.totalScore, 0) / totalTeamsJudged)
    : 0
  const highestScore = totalTeamsJudged > 0
    ? Math.max(...mockJudgeScores.map(team => team.totalScore))
    : 0

  const metrics = [
    {
      id: "teams-judged",
      label: "Teams Judged",
      value: totalTeamsJudged.toString(),
      icon: Users,
      iconColor: "text-primary",
      bgColor: "from-primary/25 via-primary/10 to-transparent",
    },
    {
      id: "avg-score",
      label: "Average Score",
      value: averageScore.toString(),
      icon: BarChart3,
      iconColor: "text-sky-500",
      bgColor: "from-sky-200/60 via-sky-100/40 to-transparent",
    },
    {
      id: "highest-score",
      label: "Highest Score",
      value: highestScore.toString(),
      icon: TrendingUp,
      iconColor: "text-emerald-500",
      bgColor: "from-emerald-200/60 via-emerald-100/40 to-transparent",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`absolute inset-0 bg-linear-to-br ${metric.bgColor}`} />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Section Header */}
      <div className="pt-2">
        <h2 className="text-[1.9rem] font-semibold text-slate-900">Your Scoring History</h2>
        <p className="mt-2 text-base text-slate-500">
          Review all teams you've evaluated with detailed rubric breakdowns and your reflections.
        </p>
      </div>

      {mockJudgeScores.length > 0 ? (
        <div className="space-y-6">
          {mockJudgeScores.map((team, index) => (
            <Card key={index} className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-60" />
              
              <CardHeader className="flex flex-col gap-5 p-7 pb-5">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-[#3d0000] text-white font-bold text-2xl shadow-lg">
                      {index + 1}
                    </div>
                    <div className="space-y-1.5">
                      <CardTitle className="text-[1.5rem] font-semibold text-slate-900">{team.teamName}</CardTitle>
                      <CardDescription className="text-lg text-slate-600">{team.projectTitle}</CardDescription>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>{team.judgedAt}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="rounded-full bg-primary/10 px-5 py-3 text-lg font-semibold text-primary shadow-sm">
                    {team.totalScore}/100
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-7 pb-7">
                {/* Score Breakdown Grid */}
                <div className="grid gap-5 md:grid-cols-2">
                  {rubricOrder.map((category) => {
                    const score = team.breakdown[category.key as keyof typeof team.breakdown]
                    const percentage = (score / category.maxScore) * 100
                    const Icon = category.icon

                    return (
                      <div key={category.key} className="space-y-4 rounded-[22px] border border-slate-200/70 bg-slate-50/70 px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </span>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="text-base font-semibold text-slate-900">{category.label}</p>
                              <p className="text-sm text-slate-600">{category.description}</p>
                            </div>
                          </div>
                          <Badge className="shrink-0 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
                            {score}/{category.maxScore}
                          </Badge>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div 
                            className="h-full rounded-full bg-primary transition-all" 
                            style={{ width: `${percentage}%` }} 
                          />
                        </div>
                        
                        {/* Individual reflection for this category */}
                        {team.reflections && team.reflections[category.key] && (
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">Your Notes</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{team.reflections[category.key]}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Additional Comments Section */}
                {team.comments && (
                  <div className="rounded-[22px] border-2 border-slate-200/70 bg-white px-5 py-4">
                    <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Additional Comments
                    </h3>
                    <p className="text-base text-slate-700 leading-relaxed">{team.comments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <MessageSquare className="h-16 w-16 text-slate-300" />
            <CardTitle className="text-xl font-semibold text-slate-700">No Teams Judged Yet</CardTitle>
            <CardDescription className="text-base text-slate-500">
              Teams will appear here as you submit your scores.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* POST JUDGING VIEW COMPONENT */
function PostJudgingView() {
  const sortedTeams = [...mockAllJudgesData].sort((a, b) => a.rank - b.rank)
  const totalTeams = sortedTeams.length
  const avgScore = Math.round(sortedTeams.reduce((sum, team) => sum + team.averageScore, 0) / totalTeams)
  const topScore = sortedTeams[0]?.averageScore || 0

  const metrics = [
    {
      id: "total-teams",
      label: "Total Teams",
      value: totalTeams.toString(),
      icon: Users,
      iconColor: "text-primary",
      bgColor: "from-primary/25 via-primary/10 to-transparent",
    },
    {
      id: "avg-score",
      label: "Average Score",
      value: avgScore.toString(),
      icon: BarChart3,
      iconColor: "text-sky-500",
      bgColor: "from-sky-200/60 via-sky-100/40 to-transparent",
    },
    {
      id: "top-score",
      label: "Top Score",
      value: topScore.toString(),
      icon: Trophy,
      iconColor: "text-amber-500",
      bgColor: "from-amber-200/60 via-amber-100/40 to-transparent",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`absolute inset-0 bg-linear-to-br ${metric.bgColor}`} />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Section Header */}
      <div className="pt-2">
        <h2 className="text-[1.9rem] font-semibold text-slate-900">Final Event Rankings</h2>
        <p className="mt-2 text-base text-slate-500">
          Complete breakdown of all teams with judge-by-judge analysis and scoring details.
        </p>
      </div>

      {sortedTeams.map((team) => (
        <Card key={team.rank} className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-60" />
          
          <CardHeader className="flex flex-col gap-5 p-7 pb-5">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex flex-1 items-start gap-4">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white font-bold text-2xl shadow-lg ${
                    team.rank === 1
                      ? "bg-linear-to-br from-yellow-400 to-yellow-500"
                      : team.rank === 2
                      ? "bg-linear-to-br from-slate-300 to-slate-400"
                      : team.rank === 3
                      ? "bg-linear-to-br from-orange-400 to-orange-500"
                      : "bg-linear-to-br from-slate-500 to-slate-600"
                  }`}
                >
                  {team.rank === 1 ? <Trophy className="h-8 w-8" /> : team.rank === 2 ? <Medal className="h-7 w-7" /> : team.rank === 3 ? <Award className="h-7 w-7" /> : `#${team.rank}`}
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-[1.5rem] font-semibold text-slate-900">{team.teamName}</CardTitle>
                  <CardDescription className="text-lg text-slate-600">{team.projectTitle}</CardDescription>
                </div>
              </div>
              <Badge className={`shrink-0 rounded-full px-5 py-3 text-lg font-semibold shadow-sm ${
                team.rank === 1
                  ? "bg-primary text-white"
                  : team.rank <= 3
                  ? "bg-primary/10 text-primary"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {team.averageScore} pts
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-7 pb-7">
            {/* Category Performance Across All Judges */}
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-slate-700">
                <BarChart3 className="h-5 w-5 text-primary" />
                Average Category Performance
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {rubricOrder.map((category) => {
                  const avgScore =
                    team.judges.reduce((sum, judge) => sum + judge.breakdown[category.key as keyof typeof judge.breakdown], 0) /
                    team.judges.length
                  const percentage = (avgScore / category.maxScore) * 100

                  return (
                    <div key={category.key} className="rounded-[20px] border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-600 mb-2">
                        <span>{category.label}</span>
                        <span>{avgScore.toFixed(1)}/{category.maxScore}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div 
                          className="h-full rounded-full bg-primary transition-all" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Strength Areas */}
            <div className="rounded-[22px] border-2 border-emerald-200 bg-emerald-50/70 p-4">
              <h4 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Key Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {team.strengthAreas.map((area, idx) => (
                  <Badge key={idx} className="bg-emerald-600 text-white rounded-full px-3 py-1.5 text-sm">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Individual Judge Scores */}
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-slate-700">
                <Users className="h-5 w-5 text-primary" />
                Individual Judge Scores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {team.judges.map((judge, idx) => (
                  <div key={idx} className="rounded-[20px] border border-slate-200/70 bg-slate-50/70 p-4 text-center">
                    <p className="text-sm font-semibold text-slate-900 mb-2 truncate">{judge.name}</p>
                    <p className="text-3xl font-bold text-primary">{judge.score}</p>
                    <p className="text-xs text-slate-500 mt-1">out of 100</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Judge Breakdown - Expandable */}
            <details className="group rounded-[20px] border border-slate-200/70 bg-slate-50/50">
              <summary className="cursor-pointer p-4 text-sm font-semibold text-primary hover:text-primary/80 flex items-center justify-between list-none">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Detailed Category Scores by Judge
                </span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 pt-2 space-y-3">
                {team.judges.map((judge, idx) => (
                  <div key={idx} className="rounded-[18px] border border-slate-200/70 bg-white p-5">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center justify-between">
                      <span>{judge.name}</span>
                      <Badge className="bg-primary/10 text-primary">{judge.score} pts</Badge>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {rubricOrder.map((category) => {
                        const score = judge.breakdown[category.key as keyof typeof judge.breakdown]
                        const percentage = (score / category.maxScore) * 100
                        return (
                          <div key={category.key} className="space-y-2">
                            <div className="text-center">
                              <div className="text-xs text-slate-600 mb-1">{category.short}</div>
                              <div className="text-lg font-bold text-slate-900">{score}/{category.maxScore}</div>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-primary transition-all" 
                                style={{ width: `${percentage}%` }} 
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
