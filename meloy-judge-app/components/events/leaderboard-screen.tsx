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
    totalScore: 368, // Sum of all judge scores (out of 400)
    averageScore: 92,
    judgeOrder: 3, // Order in which this team was judged (for timeline)
    judges: [
      { name: "Dr. Smith", score: 95, order: 1, breakdown: { communication: 24, funding: 24, presentation: 24, cohesion: 23 } },
      { name: "Prof. Johnson", score: 91, order: 2, breakdown: { communication: 23, funding: 23, presentation: 23, cohesion: 22 } },
      { name: "Ms. Williams", score: 90, order: 3, breakdown: { communication: 23, funding: 22, presentation: 23, cohesion: 22 } },
      { name: "Dr. Brown", score: 92, order: 4, breakdown: { communication: 24, funding: 23, presentation: 23, cohesion: 22 } },
    ],
    scoreVariance: 2.1, // Standard deviation of judge scores
    strengthAreas: ["Communication", "Funding Potential"],
    categoryConsensus: { communication: "high", funding: "high", presentation: "high", cohesion: "medium" }, // Agreement level
  },
  {
    teamName: "Team Beta",
    projectTitle: "Sustainable Energy Monitor",
    rank: 2,
    totalScore: 352,
    averageScore: 88,
    judgeOrder: 2,
    judges: [
      { name: "Dr. Smith", score: 86, order: 1, breakdown: { communication: 22, funding: 21, presentation: 22, cohesion: 21 } },
      { name: "Prof. Johnson", score: 89, order: 2, breakdown: { communication: 23, funding: 22, presentation: 22, cohesion: 22 } },
      { name: "Ms. Williams", score: 88, order: 3, breakdown: { communication: 22, funding: 22, presentation: 22, cohesion: 22 } },
      { name: "Dr. Brown", score: 89, order: 4, breakdown: { communication: 23, funding: 22, presentation: 22, cohesion: 22 } },
    ],
    scoreVariance: 1.3,
    strengthAreas: ["Presentation", "Communication"],
    categoryConsensus: { communication: "high", funding: "high", presentation: "high", cohesion: "high" },
  },
  {
    teamName: "Team Alpha",
    projectTitle: "Smart Campus Navigation System",
    rank: 3,
    totalScore: 340,
    averageScore: 85,
    judgeOrder: 1,
    judges: [
      { name: "Dr. Smith", score: 83, order: 1, breakdown: { communication: 21, funding: 20, presentation: 21, cohesion: 21 } },
      { name: "Prof. Johnson", score: 85, order: 2, breakdown: { communication: 22, funding: 21, presentation: 21, cohesion: 21 } },
      { name: "Ms. Williams", score: 86, order: 3, breakdown: { communication: 22, funding: 21, presentation: 22, cohesion: 21 } },
      { name: "Dr. Brown", score: 86, order: 4, breakdown: { communication: 22, funding: 22, presentation: 21, cohesion: 21 } },
    ],
    scoreVariance: 1.4,
    strengthAreas: ["Communication", "Cohesion"],
    categoryConsensus: { communication: "high", funding: "high", presentation: "high", cohesion: "high" },
  },
  {
    teamName: "Team Gamma",
    projectTitle: "AI-Powered Study Assistant",
    rank: 4,
    totalScore: 328,
    averageScore: 82,
    judgeOrder: 4,
    judges: [
      { name: "Dr. Smith", score: 80, order: 1, breakdown: { communication: 20, funding: 20, presentation: 20, cohesion: 20 } },
      { name: "Prof. Johnson", score: 82, order: 2, breakdown: { communication: 21, funding: 20, presentation: 20, cohesion: 21 } },
      { name: "Ms. Williams", score: 83, order: 3, breakdown: { communication: 21, funding: 21, presentation: 20, cohesion: 21 } },
      { name: "Dr. Brown", score: 83, order: 4, breakdown: { communication: 21, funding: 21, presentation: 21, cohesion: 20 } },
    ],
    scoreVariance: 1.3,
    strengthAreas: ["Communication"],
    categoryConsensus: { communication: "medium", funding: "medium", presentation: "high", cohesion: "medium" },
  },
  {
    teamName: "Team Delta",
    projectTitle: "Campus Safety Alert System",
    rank: 5,
    totalScore: 312,
    averageScore: 78,
    judgeOrder: 5,
    judges: [
      { name: "Dr. Smith", score: 76, order: 1, breakdown: { communication: 19, funding: 19, presentation: 19, cohesion: 19 } },
      { name: "Prof. Johnson", score: 78, order: 2, breakdown: { communication: 20, funding: 19, presentation: 19, cohesion: 20 } },
      { name: "Ms. Williams", score: 79, order: 3, breakdown: { communication: 20, funding: 20, presentation: 19, cohesion: 20 } },
      { name: "Dr. Brown", score: 79, order: 4, breakdown: { communication: 20, funding: 20, presentation: 20, cohesion: 19 } },
    ],
    scoreVariance: 1.4,
    strengthAreas: ["Communication"],
    categoryConsensus: { communication: "high", funding: "high", presentation: "high", cohesion: "medium" },
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
  const [isPostJudging, setIsPostJudging] = useState(true) // Default to Post Judging view

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
  const [compareMode, setCompareMode] = useState(false)
  const [selectedTeams, setSelectedTeams] = useState<number[]>([])
  
  const sortedTeams = [...mockAllJudgesData].sort((a, b) => a.rank - b.rank)
  const totalTeams = sortedTeams.length
  const maxPossibleScore = 400 // 4 judges × 100 points each
  
  // Calculate judge calibration (are scores trending up/down over time?)
  const judgeCalibration = sortedTeams
    .sort((a, b) => a.judgeOrder - b.judgeOrder)
    .map(team => ({
      teamName: team.teamName,
      order: team.judgeOrder,
      avgScore: team.averageScore,
      totalScore: team.totalScore,
    }))

  const toggleTeamSelection = (rank: number) => {
    if (selectedTeams.includes(rank)) {
      setSelectedTeams(selectedTeams.filter(r => r !== rank))
    } else if (selectedTeams.length < 3) {
      setSelectedTeams([...selectedTeams, rank])
    }
  }

  // Get close competitors (within 20 points)
  const closeCompetitors = sortedTeams.slice(0, 3).filter((team, idx, arr) => {
    if (idx === 0) return true
    return arr[idx - 1].totalScore - team.totalScore <= 20
  })

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
      id: "score-spread",
      label: "Score Spread",
      value: `${sortedTeams[0].totalScore - sortedTeams[sortedTeams.length - 1].totalScore} pts`,
      icon: BarChart3,
      iconColor: "text-sky-500",
      bgColor: "from-sky-200/60 via-sky-100/40 to-transparent",
    },
    {
      id: "close-race",
      label: "Close Race",
      value: closeCompetitors.length > 1 ? `Top ${closeCompetitors.length}` : "Clear Winner",
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

      {/* Score Progression Timeline */}
      <Card className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-md">
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-60" />
        <CardHeader className="p-7 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">Score Progression Timeline</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  See how scores evolved throughout the judging session
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <div className="space-y-4">
            {/* Timeline visualization */}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />
              {judgeCalibration.map((team, idx) => {
                const teamData = sortedTeams.find(t => t.teamName === team.teamName)
                const isTop3 = teamData ? teamData.rank <= 3 : false
                return (
                  <div key={idx} className="relative flex items-center gap-4 pb-6 last:pb-0">
                    <div className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-lg ${
                      isTop3 ? 'bg-linear-to-br from-primary to-[#3d0000]' : 'bg-linear-to-br from-slate-400 to-slate-600'
                    }`}>
                      <span className="text-lg font-bold text-white">{team.order}</span>
                    </div>
                    <div className="flex-1 rounded-xl border border-slate-200/70 bg-slate-50/70 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{team.teamName}</p>
                          <p className="text-sm text-slate-600">Judging Order #{team.order}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{team.totalScore}</p>
                          <p className="text-xs text-slate-500">out of {maxPossibleScore}</p>
                        </div>
                      </div>
                      {/* Score bar */}
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div 
                          className="h-full rounded-full bg-primary transition-all" 
                          style={{ width: `${(team.totalScore / maxPossibleScore) * 100}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Calibration insight */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
              <p className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Judging Pattern Insight
              </p>
              <p className="text-sm text-blue-800">
                Scores appear relatively consistent throughout the session. No significant calibration drift detected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Header with Compare Toggle */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-[1.9rem] font-semibold text-slate-900">Final Rankings</h2>
          <p className="mt-2 text-base text-slate-500">
            Total scores shown (sum of all judges, max {maxPossibleScore} pts) • Click teams to compare
          </p>
        </div>
        {selectedTeams.length >= 2 && (
          <Button
            onClick={() => setCompareMode(!compareMode)}
            className="h-11 rounded-xl bg-primary px-5 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
          >
            {compareMode ? "Exit" : "Compare"} Selected Teams
          </Button>
        )}
      </div>

      {/* Team Rankings with Selection */}
      {sortedTeams.map((team) => {
        const isSelected = selectedTeams.includes(team.rank)
        const isClose = closeCompetitors.some(t => t.teamName === team.teamName)
        
        return (
          <Card 
            key={team.rank} 
            className={`relative overflow-hidden rounded-[28px] border bg-white/95 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl cursor-pointer ${
              isSelected ? 'border-primary border-2 ring-2 ring-primary/20' : 'border-slate-200/80'
            } ${isClose && !isSelected ? 'border-amber-300' : ''}`}
            onClick={() => toggleTeamSelection(team.rank)}
          >
            <div className={`absolute inset-x-0 top-0 h-1 opacity-60 ${
              isSelected ? 'bg-primary' : 'bg-linear-to-r from-primary via-rose-400 to-orange-300'
            }`} />
            
            {isClose && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  Close Race
                </Badge>
              </div>
            )}
            
            <CardHeader className="flex flex-col gap-4 p-7 pb-5">
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
                  <div className="space-y-1.5 flex-1">
                    <CardTitle className="text-[1.5rem] font-semibold text-slate-900">{team.teamName}</CardTitle>
                    <CardDescription className="text-lg text-slate-600">{team.projectTitle}</CardDescription>
                    
                    {/* Consensus indicator */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        {Object.values(team.categoryConsensus).filter(c => c === 'high').length >= 3 ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">
                            High Consensus
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5">
                            Mixed Consensus
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">±{team.scoreVariance.toFixed(1)} variance</span>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge className={`rounded-full px-5 py-3 text-lg font-semibold shadow-sm ${
                    team.rank === 1
                      ? "bg-primary text-white"
                      : team.rank <= 3
                      ? "bg-primary/10 text-primary"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {team.totalScore}/{maxPossibleScore}
                  </Badge>
                  <p className="text-sm text-slate-500">Avg: {team.averageScore}/100</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 px-7 pb-7">
              {/* Compact Category Performance */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-slate-700">Category Breakdown</h3>
                <div className="grid grid-cols-4 gap-2">
                  {rubricOrder.map((category) => {
                    const avgScore =
                      team.judges.reduce((sum, judge) => sum + judge.breakdown[category.key as keyof typeof judge.breakdown], 0) /
                      team.judges.length
                    const maxScore = category.maxScore * team.judges.length // e.g., 25 * 4 = 100
                    const percentage = (avgScore / category.maxScore) * 100
                    const consensus = team.categoryConsensus[category.key as keyof typeof team.categoryConsensus]

                    return (
                      <div key={category.key} className="space-y-2">
                        <div className="text-center">
                          <p className="text-xs text-slate-600 mb-1">{category.short}</p>
                          <p className="text-base font-bold text-slate-900">
                            {Math.round(avgScore * team.judges.length)}/{maxScore}
                          </p>
                          {consensus === 'high' && (
                            <div className="flex justify-center mt-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="High agreement" />
                            </div>
                          )}
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
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

              {/* Judge Score Distribution */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-slate-700">Judge Scores</h3>
                <div className="flex items-center gap-2">
                  {team.judges.sort((a, b) => a.order - b.order).map((judge, idx) => (
                    <div key={idx} className="flex-1">
                      <div className="relative h-24 bg-slate-100 rounded-lg overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-primary to-primary/80 transition-all flex items-end justify-center pb-2"
                          style={{ height: `${(judge.score / 100) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-white">{judge.score}</span>
                        </div>
                      </div>
                      <p className="text-xs text-center text-slate-600 mt-2 truncate">{judge.name.split(' ')[1]}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <div className="flex flex-wrap gap-2">
                  {team.strengthAreas.map((area, idx) => (
                    <Badge key={idx} className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
