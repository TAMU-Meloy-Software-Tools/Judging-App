"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, MessageSquare, TrendingUp, Users, Clock, Megaphone, BadgeDollarSign, Presentation, Sparkles, User, Loader2 } from "lucide-react"
import { getEvent, getMyProgress } from "@/lib/api"
import type { Event } from "@/lib/types/api"

interface JudgeProgressScreenProps {
    eventId: string
    onBack: () => void
    judgeName: string | null
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

export function JudgeProgressScreen({ eventId, onBack, judgeName }: JudgeProgressScreenProps) {
    const [event, setEvent] = useState<Event | null>(null)
    const [judgeScores, setJudgeScores] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                setError(null)
                const [eventData, progressData] = await Promise.all([
                    getEvent(eventId),
                    getMyProgress(eventId)
                ])
                setEvent(eventData.event)
                // API now returns array directly, not wrapped in object
                setJudgeScores(Array.isArray(progressData) ? progressData : [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load judge progress data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [eventId])

    // Sponsor data from RDS or fallback
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

    // Loading state
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-primary/5">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-slate-600">Loading your progress...</p>
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

    // Safe calculations after loading/error checks
    const totalTeamsJudged = judgeScores?.length ?? 0
    const averageScore = totalTeamsJudged > 0
        ? Math.round(judgeScores.reduce((sum, team) => sum + (team.totalScore || 0), 0) / totalTeamsJudged)
        : 0
    const highestScore = totalTeamsJudged > 0
        ? Math.max(...judgeScores.map(team => team.totalScore || 0))
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
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
            <header className="relative z-30 overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 lg:gap-6">
                        <div className="flex items-center gap-4 lg:gap-5">
                            <Button
                                variant="ghost"
                                onClick={onBack}
                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                                aria-label="Back to dashboard"
                            >
                                <ArrowLeft className="h-7 w-7" />
                            </Button>
                            <div className="flex h-16 lg:h-20 w-auto items-center justify-center rounded-2xl border border-white/25 bg-white/15 px-3 py-2 shadow-md backdrop-blur-md">
                                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">My Progress</p>
                                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">{event.name}</h1>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 rounded-full border-2 border-white/30 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white leading-tight">{judgeName || "Judge"}</span>
                                <span className="text-xs text-white/70">Judge</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <div className="space-y-6">
                    {/* Sponsor Card */}
                    <div className="relative overflow-hidden rounded-3xl border-2 border-red-950 shadow-xl">
                        <div className="relative rounded-[22px] py-4 px-5 lg:py-5 lg:px-6 bg-linear-to-b from-red-600 to-red-950">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
                            <div className="relative flex items-center justify-between">
                                <div className="group relative flex items-center gap-5 lg:gap-6">
                                    <div className="relative flex shrink-0 items-center justify-center rounded-2xl py-3 px-6 lg:py-4 lg:px-8 shadow-xl backdrop-blur-xl bg-white/70 border-2 border-white/80">
                                        <Image
                                            src={sponsor.logo}
                                            alt={sponsor.name}
                                            width={120}
                                            height={60}
                                            className="relative h-14 lg:h-16 w-auto max-w-45 lg:max-w-55 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.12em] text-white/80">Presented by</p>
                                        <p className="text-xl lg:text-2xl font-semibold text-white leading-tight">{sponsor.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/70 backdrop-blur-xl px-4 py-2 shadow-xl">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm font-semibold text-emerald-700">Judging in Progress</span>
                                </div>
                            </div>
                        </div>
                    </div>

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

                    {judgeScores.length > 0 ? (
                        <div className="space-y-6">
                            {judgeScores.map((team, index) => (
                                <Card key={index} className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl">
                                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-60" />

                                    <CardHeader className="flex flex-col gap-5 p-7 pb-5">
                                        <div className="flex flex-wrap items-start justify-between gap-5">
                                            <div className="flex flex-1 items-start gap-4">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-[#3d0000] text-white font-bold text-2xl shadow-lg">
                                                    {index + 1}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <CardTitle className="text-[1.5rem] font-semibold text-slate-900">{team.teamName || 'Team ' + (index + 1)}</CardTitle>
                                                    <CardDescription className="text-lg text-slate-600">{team.projectTitle || 'No description'}</CardDescription>
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{team.judgedAt || 'Recently judged'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge className="rounded-full bg-primary/10 px-5 py-3 text-lg font-semibold text-primary shadow-sm">
                                                {team.totalScore || 0}/100
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-6 px-7 pb-7">
                                        {/* Score Breakdown Grid */}
                                        <div className="grid gap-5 md:grid-cols-2">
                                            {rubricOrder.map((category) => {
                                                const score = team.breakdown?.[category.key] || 0
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
            </main>
        </div>
    )
}
