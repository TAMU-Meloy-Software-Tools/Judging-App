"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { getTeam } from "@/lib/api/teams"
import { getRubric, submitScore } from "@/lib/api/scores"
import type { Team, RubricCriteria, Event } from "@/lib/types/api"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Users, Megaphone, BadgeDollarSign, Presentation, Sparkles, Save, User, Loader2 } from "lucide-react"

interface TeamDetailScreenProps {
  eventId: string
  teamId: string
  judgeId: string | null
  judgeName: string | null
  onBack: () => void
  onSubmitScores: () => void
  isAdmin?: boolean
}

// Icon mapping for rubric criteria
const iconMap: Record<string, typeof Megaphone> = {
  communication: Megaphone,
  funding: BadgeDollarSign,
  presentation: Presentation,
  overall: Sparkles,
  cohesion: Sparkles,
}

export function TeamDetailScreen({ teamId, judgeId, onBack, judgeName, isAdmin = false }: TeamDetailScreenProps) {
  const [team, setTeam] = useState<Team | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [rubric, setRubric] = useState<RubricCriteria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [reflections, setReflections] = useState<Record<string, string>>({})
  const [comments, setComments] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        const [teamData, rubricData] = await Promise.all([
          getTeam(teamId),
          getRubric()
        ])
        
        setTeam(teamData.team)
        setRubric(rubricData.criteria)
        
        // Fetch event data to get sponsor info
        if (teamData.team.event_id) {
          const { getEvent } = await import('@/lib/api')
          const eventData = await getEvent(teamData.team.event_id)
          setEvent(eventData.event)
        }
        
        // Initialize scores with 0 for each criterion
        const initialScores = rubricData.criteria.reduce(
          (acc, criteria) => ({
            ...acc,
            [criteria.id]: 0,
          }),
          {},
        )
        setScores(initialScores)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [teamId])

  // Get sponsor data with fallback logic
  const getSponsorData = () => {
    if (!event) return null
    
    const isPWSEvent = event.event_type?.includes("problems-worth-solving") ?? false
    
    return event.sponsor_id && event.sponsor ? {
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

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const maxTotalScore = rubric.reduce((sum, criteria) => sum + criteria.max_score, 0)

  const handleScoreChange = (criteriaId: string, value: number[]) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: value[0],
    }))
  }

  const handleSubmit = async () => {
    // Show confirmation dialog first
    setShowSubmitDialog(true)
  }

  const confirmSubmit = async () => {
    // Close confirmation dialog
    setShowSubmitDialog(false)

    try {
      setIsSaving(true)
      
      if (!judgeId) {
        throw new Error('Judge profile not selected. Please select a judge profile first.')
      }
      
      // Submit scores to API
      await submitScore({
        eventId: team!.event_id,
        teamId: team!.id,
        judgeId: judgeId,
        scores: Object.entries(scores).map(([criteriaId, score]) => ({
          criteriaId,  // Must match backend expectation
          score,
          reflection: reflections[criteriaId] || undefined,  // Include reflection if provided
        })),
        overallComments: comments,
        timeSpentSeconds: 0, // TODO: Track actual time spent
      })
      setShowSuccessDialog(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit scores')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    onBack()
  }

  const handleReflectionChange = (criteriaId: string, value: string) => {
    setReflections((prev) => ({
      ...prev,
      [criteriaId]: value,
    }))
  }

  const handleExitAttempt = () => {
    setShowExitDialog(true)
  }

  const confirmExit = () => {
    setShowExitDialog(false)
    onBack()
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-primary/5">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading team details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !team) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-primary/5">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || 'Team not found'}</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 lg:px-8">
          {/* Main Header Row */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4">
            {/* Left: Back + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
              <Button
                variant="ghost"
                onClick={handleExitAttempt}
                className="flex h-12 w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                aria-label="Back to event"
              >
                <ArrowLeft className="h-6 w-6 lg:h-7 lg:w-7" />
              </Button>
              <div className="flex h-14 sm:h-16 lg:h-20 xl:h-20 w-auto shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 px-2 sm:px-3 py-2 shadow-md backdrop-blur-md">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-10 sm:h-12 lg:h-14 xl:h-16 w-auto object-contain" />
              </div>
            </div>

            {/* Center: Team Name (hidden on mobile) */}
            <div className="hidden md:flex flex-col items-center flex-1 min-w-0 px-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60 mb-1">Team Review</p>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-white leading-tight text-center truncate w-full">{team.name}</h1>
            </div>

            {/* Right: Score Badge + User Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Badge className="rounded-full border border-white/40 bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white">
                {totalScore}/{maxTotalScore}
              </Badge>
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
          <div className="md:hidden text-center mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">Team Review</p>
            <h1 className="text-lg font-semibold text-white leading-tight truncate">{team.name}</h1>
          </div>

          {/* Description Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 rounded-3xl border border-white/25 bg-white/10 px-5 sm:px-7 py-4 sm:py-5 text-white/90">
            <div className="space-y-1.5 min-w-0 flex-1">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-white/60">Description</p>
              <p className="text-base sm:text-xl font-semibold text-white">{team.description || 'No description available'}</p>
            </div>
            {team.project_url && (
              <div className="space-y-1.5 shrink-0">
                <p className="text-[0.7rem] uppercase tracking-[0.24em] text-white/60">Project URL</p>
                <a href={team.project_url} target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-white/85 hover:text-white underline">
                  View Project
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-6 py-5 lg:py-6 lg:px-8">
        {/* Sponsor Card with Status */}
        {sponsor && (
          <div className="relative mb-4 sm:mb-6 overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-red-950 shadow-xl">
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
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.15em] text-white/80">Judging in Progress</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="space-y-9">
          <div>
            <h2 className="text-[2rem] font-semibold text-slate-900">Judging Rubric</h2>
            <p className="mt-3 text-lg text-slate-500">
              Score each pillar out of 25 points. The guiding question under every slider helps you validate the score with
              the official rubric.
            </p>
          </div>

          <div className="space-y-7">
            {rubric.map((criteria) => {
              const Icon = iconMap[criteria.short_name.toLowerCase()] || Sparkles
              const score = scores[criteria.id] || 0

              return (
                <Card key={criteria.id} className="relative overflow-hidden rounded-[28px] border-2 border-primary/25 bg-white/95 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl hover:border-primary/40">
                  <CardHeader className="flex flex-col gap-5 p-7 pb-5">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div className="flex flex-1 items-start gap-4">
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/10">
                          <Icon className="h-8 w-8 text-primary" />
                        </span>
                        <div className="space-y-1.5">
                          <CardTitle className="text-[1.5rem] font-semibold text-slate-900">{criteria.name}</CardTitle>
                          <CardDescription className="text-lg text-slate-600">{criteria.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className="rounded-full bg-primary/10 px-5 py-3 text-lg font-semibold text-primary shadow-sm">
                        {score}/{criteria.max_score}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 px-7 pb-7">
                    <div className="space-y-4">
                      <Slider
                        value={[score]}
                        onValueChange={(value) => handleScoreChange(criteria.id, value)}
                        max={criteria.max_score}
                        step={1}
                        className="w-full py-4 **:data-[slot=slider-track]:h-2 **:data-[slot=slider-thumb]:size-6 sm:**:data-[slot=slider-track]:h-2.5 sm:**:data-[slot=slider-thumb]:size-8"
                        aria-label={`${criteria.name} score`}
                      />
                      <div className="flex justify-between text-base font-semibold text-slate-500">
                        <span className="text-slate-400">0</span>
                        <span className="text-slate-600">{criteria.max_score}</span>
                      </div>
                    </div>
                    <div className="space-y-3 rounded-[22px] border border-slate-200/70 bg-slate-50/70 px-5 py-4">
                      <p className="text-base font-semibold text-slate-600">{criteria.guiding_question}</p>
                      <Textarea
                        value={reflections[criteria.id] ?? ""}
                        onChange={(event) => handleReflectionChange(criteria.id, event.target.value)}
                        placeholder="Jot quick notes here..."
                        rows={3}
                        className="text-base"
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <Card className="mt-12 overflow-hidden rounded-[28px] border-2 border-primary/25 bg-white/95 shadow-lg">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-[1.75rem] font-semibold text-slate-900">Additional Comments</CardTitle>
            <CardDescription className="mt-2 text-lg text-slate-600">
              Share any observations or notes for yourself.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <Textarea
              placeholder="Enter your feedback..."
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              rows={6}
              className="text-lg"
            />
          </CardContent>
        </Card>

        <div className="mt-12 flex flex-col gap-5 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleExitAttempt}
            className="h-16 flex-1 rounded-2xl border-2 border-slate-300 text-lg font-semibold text-slate-600 hover:border-primary/40 hover:bg-primary/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="h-16 flex-1 rounded-2xl bg-primary text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl disabled:opacity-70"
          >
            <Save className="mr-2 h-6 w-6" />
            {isSaving ? "Saving..." : "Submit Scores"}
          </Button>
        </div>
      </main>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="max-w-2xl rounded-3xl border-2 border-white/30 bg-white/90 backdrop-blur-xl shadow-2xl p-0">
          <AlertDialogHeader className="p-8 pb-4">
            <AlertDialogTitle className="text-3xl font-semibold text-slate-900">Exit Without Saving?</AlertDialogTitle>
            <AlertDialogDescription className="mt-4 text-xl text-slate-600 leading-relaxed">
              Your progress will not be saved. To submit your scores, please use the Submit Scores button.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 p-8 pt-4 sm:flex-row">
            <AlertDialogCancel className="h-16 flex-1 rounded-2xl border-2 border-slate-300 text-lg font-semibold text-slate-600 hover:border-primary/40 hover:bg-primary/5">
              Stay and Continue
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExit}
              className="h-16 flex-1 rounded-2xl bg-primary text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
            >
              Exit Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-2xl rounded-3xl border-2 border-red-950/30 bg-white/80 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
          {/* Sponsor gradient section at top */}
          {sponsor && (
            <div
              className="relative h-40 overflow-hidden"
              style={{
                background: `linear-gradient(to bottom, ${sponsor.primaryColor}, ${sponsor.secondaryColor})`
              }}
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

              <div className="relative flex items-center justify-center h-full">
                <div className="flex shrink-0 items-center justify-center rounded-2xl py-4 px-8 shadow-xl backdrop-blur-xl bg-white/70 border-2 border-white/80">
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={140}
                    height={70}
                    className="h-16 w-auto max-w-[200px] object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Success message section */}
          <AlertDialogHeader className="p-10 pb-6 text-center flex flex-col items-center">
            <AlertDialogTitle className="text-4xl font-bold text-slate-900 mt-4 text-center">Scores Submitted!</AlertDialogTitle>
            <AlertDialogDescription className="mt-4 text-xl text-slate-600 leading-relaxed text-center">
              Your evaluation for {team.name} has been successfully saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-10 pt-4">
            <AlertDialogAction
              onClick={handleSuccessClose}
              className="h-16 w-full rounded-2xl bg-primary text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
            >
              Continue to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="max-w-2xl rounded-3xl border-2 border-slate-200 bg-white/90 backdrop-blur-xl shadow-2xl">
          <AlertDialogHeader className="p-10 pb-6">
            <AlertDialogTitle className="text-3xl font-bold text-slate-900">Submit Scores?</AlertDialogTitle>
            <AlertDialogDescription className="mt-4 text-xl text-slate-600 leading-relaxed">
              Are you sure you want to submit your evaluation for {team.name}? This will finalize your scores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-10 pt-0 flex gap-4">
            <AlertDialogCancel
              className="h-16 flex-1 rounded-2xl border-2 border-slate-300 bg-white text-lg font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              className="h-16 flex-1 rounded-2xl bg-primary text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
            >
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="max-w-2xl rounded-3xl border-2 border-slate-200 bg-white/90 backdrop-blur-xl shadow-2xl">
          <AlertDialogHeader className="p-10 pb-6">
            <AlertDialogTitle className="text-3xl font-bold text-slate-900">Submit Scores?</AlertDialogTitle>
            <AlertDialogDescription className="mt-4 text-xl text-slate-600 leading-relaxed">
              Are you sure you want to submit your evaluation for {team.name}? This will finalize your scores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-10 pt-0 flex gap-4">
            <AlertDialogCancel
              className="h-16 flex-1 rounded-2xl border-2 border-slate-300 bg-white text-lg font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              className="h-16 flex-1 rounded-2xl bg-primary text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
            >
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
