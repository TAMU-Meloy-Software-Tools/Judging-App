"use client"

import Image from "next/image"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Megaphone, BadgeDollarSign, Presentation, Sparkles, Save } from "lucide-react"

interface TeamDetailScreenProps {
  teamId: string
  onBack: () => void
}

const mockTeam = {
  id: "1",
  name: "Team Alpha",
  projectTitle: "Smart Campus Navigation System",
  members: ["John Doe", "Jane Smith", "Bob Johnson"],
  tableNumber: "A-12",
  description:
    "An innovative mobile application that helps students navigate the Texas A&M campus using AR technology and real-time crowd data to find the fastest routes to classes.",
}

const gradingCriteria = [
  {
    id: "communication",
    name: "Effective Communication",
    description: "Was the problem urgent, the solution convincing, and the impact tangible?",
    maxScore: 25,
    icon: Megaphone,
    question:
      "Could you comfortably restate their problem, solution, and impact in one sentence after the presentation?",
  },
  {
    id: "funding",
    name: "Would Fund/Buy Solution",
    description: "Consider technical feasibility, commercial viability, and novelty of the approach.",
    maxScore: 25,
    icon: BadgeDollarSign,
    question:
      "Would you feel confident recommending budget or resources to advance this solution given what you heard?",
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Evaluate the demo assets, storytelling, and overall delivery.",
    maxScore: 25,
    icon: Presentation,
    question: "Did the video, prototype, and slides collectively keep you engaged and build trust in the idea?",
  },
  {
    id: "overall",
    name: "Overall",
    description: "Reflect on the pitch strength, Q&A performance, and your gut confidence.",
    maxScore: 25,
    icon: Sparkles,
    question: "Do you leave the table feeling inspired to see this team advance to the next stage?",
  },
] satisfies Array<{
  id: string
  name: string
  description: string
  maxScore: number
  icon: typeof Megaphone
  question: string
}>

export function TeamDetailScreen({ teamId, onBack }: TeamDetailScreenProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    gradingCriteria.reduce(
      (acc, criteria) => ({
        ...acc,
        [criteria.id]: 0,
      }),
      {},
    ),
  )
  const [reflections, setReflections] = useState<Record<string, string>>({})
  const [comments, setComments] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const maxTotalScore = gradingCriteria.reduce((sum, criteria) => sum + criteria.maxScore, 0)

  const handleScoreChange = (criteriaId: string, value: number[]) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: value[0],
    }))
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    onBack()
  }

  const handleReflectionChange = (criteriaId: string, value: string) => {
    setReflections((prev) => ({
      ...prev,
      [criteriaId]: value,
    }))
  }

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
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Team review</p>
                  <h1 className="text-[2.25rem] font-semibold text-white sm:text-[2.75rem]">{mockTeam.name}</h1>
                  <p className="text-base text-white/80">Table {mockTeam.tableNumber}</p>
                </div>
              </div>
            </div>
            <Badge className="flex flex-col items-start gap-2 rounded-full border border-white/40 bg-white/20 px-6 py-4 text-lg font-semibold text-white sm:flex-row sm:items-center sm:gap-4">
              <span>Total Score {totalScore}/{maxTotalScore}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70 sm:text-[0.7rem]">Team {teamId}</span>
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 rounded-[32px] border border-white/25 bg-white/10 px-7 py-5 text-white/90">
            <div className="space-y-1.5">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-white/60">Project</p>
              <p className="text-xl font-semibold text-white">{mockTeam.projectTitle}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-white/60">Team</p>
              <div className="flex items-center gap-2 text-base text-white/85">
                <Users className="h-5 w-5" />
                <span>{mockTeam.members.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-6 py-12 md:px-8 md:py-16">
        <section className="space-y-9">
          <div>
            <h2 className="text-[2rem] font-semibold text-slate-900">Judging Rubric</h2>
            <p className="mt-3 text-lg text-slate-500">
              Score each pillar out of 25 points. The guiding question under every slider helps you validate the score with
              the official rubric.
            </p>
          </div>

          <div className="space-y-7">
            {gradingCriteria.map((criteria) => {
              const Icon = criteria.icon
              const score = scores[criteria.id]

              return (
                <Card key={criteria.id} className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-md transition-all hover:-translate-y-[2px] hover:shadow-xl">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-rose-400 to-orange-300 opacity-60" />
                  <CardHeader className="flex flex-col gap-5 p-7 pb-5">
                    <div className="flex flex-wrap items-start justify-between gap-5">
                      <div className="flex flex-1 items-start gap-4">
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                          <Icon className="h-8 w-8 text-primary" />
                        </span>
                        <div className="space-y-1.5">
                          <CardTitle className="text-[1.5rem] font-semibold text-slate-900">{criteria.name}</CardTitle>
                          <CardDescription className="text-lg text-slate-600">{criteria.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className="rounded-full bg-primary/10 px-5 py-3 text-lg font-semibold text-primary shadow-sm">
                        {score}/{criteria.maxScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 px-7 pb-7">
                    <div className="space-y-4">
                      <Slider
                        value={[score]}
                        onValueChange={(value) => handleScoreChange(criteria.id, value)}
                        max={criteria.maxScore}
                        step={1}
                        className="w-full py-4 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-thumb]]:size-6 sm:[&_[data-slot=slider-track]]:h-2.5 sm:[&_[data-slot=slider-thumb]]:size-8"
                        aria-label={`${criteria.name} score`}
                      />
                      <div className="flex justify-between text-base font-semibold text-slate-500">
                        <span className="text-slate-400">0</span>
                        <span className="text-slate-600">{criteria.maxScore}</span>
                      </div>
                    </div>
                    <div className="space-y-3 rounded-[22px] border border-slate-200/70 bg-slate-50/70 px-5 py-4">
                      <p className="text-base font-semibold text-slate-600">{criteria.question}</p>
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

        <Card className="mt-12 overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-rose-400 to-orange-300 opacity-70" />
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-[1.75rem] font-semibold text-slate-900">Additional Comments</CardTitle>
            <CardDescription className="mt-2 text-lg text-slate-600">
              Share any observations, coaching advice, or highlights for the organizing team.
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
            onClick={onBack}
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
            {isSaving ? "Saving..." : "Submit Grades"}
          </Button>
        </div>
      </main>
    </div>
  )
}
