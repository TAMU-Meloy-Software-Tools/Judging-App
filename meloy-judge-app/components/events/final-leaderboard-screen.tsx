"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Medal, Award, BarChart3, Users, TrendingUp, User, Loader2 } from "lucide-react"
import { getEvent, getEventLeaderboard } from "@/lib/api"
import type { Event, LeaderboardEntry } from "@/lib/types/api"

interface FinalLeaderboardScreenProps {
    eventId: string
    onBack: () => void
    judgeName: string | null
    isAdmin?: boolean
}

export function FinalLeaderboardScreen({ eventId, onBack, judgeName, isAdmin = false }: FinalLeaderboardScreenProps) {
    const [event, setEvent] = useState<Event | null>(null)
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                setError(null)
                const [eventData, leaderboardData] = await Promise.all([
                    getEvent(eventId),
                    getEventLeaderboard(eventId)
                ])
                setEvent(eventData.event)
                setLeaderboard(leaderboardData.leaderboard)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load leaderboard data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [eventId])

    // Get sponsor data with fallback logic
    const getSponsorData = () => {
        const isPWSEvent = event?.event_type?.includes("problems-worth-solving") ?? false
        
        return event?.sponsor_id && event.sponsor ? {
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
    }

    const sponsor = getSponsorData()

    // Loading state
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-primary/5">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-slate-600">Loading leaderboard...</p>
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

    const sortedTeams = [...leaderboard].sort((a, b) => a.rank - b.rank)
    const totalTeams = sortedTeams.length
    const averageScore = totalTeams > 0
        ? (sortedTeams.reduce((sum, team) => sum + (team.avg_score || 0), 0) / totalTeams).toFixed(1)
        : '0'

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
            id: "average-score",
            label: "Average Score",
            value: `${averageScore} pts`,
            icon: BarChart3,
            iconColor: "text-primary",
            bgColor: "from-primary/25 via-primary/10 to-transparent",
        },
    ]

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
            <header className="relative overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 lg:px-8">
                    {/* Main Header Row */}
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        {/* Left: Back + Logo */}
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
                            <Button
                                variant="ghost"
                                onClick={onBack}
                                className="flex h-12 w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                                aria-label="Back to dashboard"
                            >
                                <ArrowLeft className="h-6 w-6 lg:h-7 lg:w-7" />
                            </Button>
                            <div className="flex h-14 sm:h-16 lg:h-20 xl:h-20 w-auto shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 px-2 sm:px-3 py-2 shadow-md backdrop-blur-md">
                                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-10 sm:h-12 lg:h-14 xl:h-16 w-auto object-contain" />
                            </div>
                        </div>

                        {/* Center: Title (hidden on mobile) */}
                        <div className="hidden md:flex flex-col items-center flex-1 min-w-0 px-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60 mb-1">Final Standings</p>
                            <h1 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-white leading-tight text-center truncate w-full">{event.name}</h1>
                        </div>

                        {/* Right: User Profile */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <div className="flex items-center gap-2 sm:gap-3 rounded-full border-2 border-white/30 bg-white/10 px-2.5 sm:px-4 py-1.5 sm:py-2 shadow-lg backdrop-blur-sm">
                                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm font-semibold text-white leading-tight">{judgeName || "User"}</span>
                                    <span className="text-[10px] sm:text-xs text-white/70">{isAdmin ? "Admin" : "Judge"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Title Row */}
                    <div className="md:hidden text-center mt-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">Final Standings</p>
                        <h1 className="text-lg font-semibold text-white leading-tight truncate">{event.name}</h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <div className="space-y-6">
                    {/* Sponsor Card */}
                    {sponsor && (
                        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-red-950 shadow-xl">
                            <div
                                className="relative rounded-[14px] sm:rounded-[22px]"
                                style={{
                                    background: `linear-gradient(to bottom, ${sponsor.primaryColor}, ${sponsor.secondaryColor})`
                                }}
                            >
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 rounded-[14px] sm:rounded-[22px]" />
                                {/* Sponsor content */}
                                <div className="relative flex items-center justify-center py-3 px-4 sm:py-4 sm:px-5 lg:py-5 lg:px-6">
                                    <div className="group flex items-center gap-3 sm:gap-4 lg:gap-5">
                                        <div className="relative flex shrink-0 items-center justify-center rounded-xl lg:rounded-2xl py-2 px-4 sm:py-3 sm:px-5 lg:py-3 lg:px-6 xl:py-4 xl:px-8 shadow-xl backdrop-blur-xl bg-white/70 border-2 border-white/80">
                                            <Image src={sponsor.logo} alt={sponsor.name} width={120} height={60} className="relative h-8 sm:h-10 lg:h-14 xl:h-16 w-auto max-w-[100px] sm:max-w-[130px] lg:max-w-[180px] object-contain" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em] text-white/70">Presented by</p>
                                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-white leading-tight">{sponsor.name}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Status strip */}
                                <div className="relative border-t border-white/10">
                                    <div className="absolute inset-0 bg-black/15 backdrop-blur-sm" />
                                    <div className="relative flex items-center justify-center gap-2.5 py-2 sm:py-2.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
                                        </span>
                                        <span className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.15em] text-white/80">Judging Complete</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 gap-4">
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
                        <h2 className="text-[1.9rem] font-semibold text-slate-900">Final Rankings</h2>
                        <p className="mt-2 text-base text-slate-500">
                            Official rankings based on judge scores
                        </p>
                    </div>

                    {/* Team Rankings */}
                    <div className="space-y-6">
                        {sortedTeams.map((team) => (
                            <Card
                                key={team.rank}
                                className="relative overflow-hidden rounded-[28px] border-2 border-primary/25 bg-white/95 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl hover:border-primary/40"
                            >

                                <CardHeader className="flex flex-col gap-4 p-7 pb-5">
                                    <div className="flex flex-wrap items-start justify-between gap-5">
                                        <div className="flex flex-1 items-start gap-4">
                                            <div
                                                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white font-bold text-2xl shadow-lg ${team.rank === 1
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
                                                <CardTitle className="text-[1.5rem] font-semibold text-slate-900">{team.team_name}</CardTitle>
                                                <CardDescription className="text-lg text-slate-600">
                                                    Average Score: {team.avg_score?.toFixed(1) || 'N/A'}
                                                </CardDescription>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5">
                                                        Judged by {team.judges_scored} judge{team.judges_scored !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <Badge className={`rounded-full px-5 py-3 text-lg font-semibold shadow-sm ${team.rank === 1
                                                    ? "bg-primary text-white"
                                                    : team.rank <= 3
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-slate-100 text-slate-700"
                                                }`}>
                                                {team.total_score || team.avg_score?.toFixed(0) || '0'}
                                            </Badge>
                                            <p className="text-sm text-slate-500">Total Score</p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-5 px-7 pb-7">
                                    {/* Score bar visualization */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-slate-600">Score Progress</span>
                                            <span className="text-sm text-slate-500">{((team.avg_score || 0) / 100 * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full rounded-full bg-linear-to-r from-primary to-[#3d0000] transition-all"
                                                style={{ width: `${((team.avg_score || 0) / 100 * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Performance indicator */}
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm text-slate-600">
                                            {team.rank <= 3 ? 'Top Performer' : 'Strong Performance'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {sortedTeams.length === 0 && (
                        <Card className="rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
                            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <Trophy className="h-16 w-16 text-slate-300" />
                                <CardTitle className="text-xl font-semibold text-slate-700">No Rankings Yet</CardTitle>
                                <CardDescription className="text-base text-slate-500">
                                    Rankings will appear after judging is complete.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}
