"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Lightbulb, Code2, Target, Presentation, UsersRound, Save } from "lucide-react"

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
    id: "innovation",
    name: "Innovation & Creativity",
    description: "Originality of the idea and creative approach to problem-solving",
    maxScore: 20,
    icon: Lightbulb,
  },
  {
    id: "technical",
    name: "Technical Implementation",
    description: "Quality of execution, use of technology, and technical complexity",
    maxScore: 20,
    icon: Code2,
  },
  {
    id: "impact",
    name: "Impact & Feasibility",
    description: "Potential real-world impact and practicality of implementation",
    maxScore: 20,
    icon: Target,
  },
  {
    id: "presentation",
    name: "Presentation Quality",
    description: "Clarity of communication, demo quality, and team engagement",
    maxScore: 20,
    icon: Presentation,
  },
  {
    id: "teamwork",
    name: "Teamwork & Collaboration",
    description: "Evidence of effective collaboration and division of work",
    maxScore: 20,
    icon: UsersRound,
  },
]

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    onBack()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{mockTeam.name}</h1>
              <p className="text-sm text-muted-foreground">Table {mockTeam.tableNumber}</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xl px-5 py-2 shadow-lg"
          >
            {totalScore}/{maxTotalScore}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4">
        <Card className="mb-6 border-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">{mockTeam.projectTitle}</CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              {mockTeam.members.join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{mockTeam.description}</p>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Grading Criteria</h2>
          <div className="space-y-4">
            {gradingCriteria.map((criteria) => {
              const Icon = criteria.icon
              return (
                <Card key={criteria.id} className="border-2 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{criteria.name}</CardTitle>
                          <CardDescription>{criteria.description}</CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-4 text-lg px-4 py-1.5 font-bold border-2 ${
                          scores[criteria.id] >= criteria.maxScore * 0.8
                            ? "border-success/50 bg-success/10 text-success"
                            : scores[criteria.id] >= criteria.maxScore * 0.5
                              ? "border-primary/50 bg-primary/10 text-primary"
                              : "border-border"
                        }`}
                      >
                        {scores[criteria.id]}/{criteria.maxScore}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Slider
                        value={[scores[criteria.id]]}
                        onValueChange={(value) => handleScoreChange(criteria.id, value)}
                        max={criteria.maxScore}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground font-medium">
                        <span>0</span>
                        <span>{criteria.maxScore}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="mb-6 border-2 shadow-md">
          <CardHeader>
            <CardTitle>Additional Comments</CardTitle>
            <CardDescription>Provide feedback and notes for the team</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your comments here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={6}
              className="w-full"
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent border-2">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="flex-1 shadow-md">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Submit Grades"}
          </Button>
        </div>
      </main>
    </div>
  )
}
