"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Screen } from "@/app/page"
import { ArrowLeft, BarChart3, Users, CheckCircle2, Clock, Circle } from "lucide-react"

interface EventDetailScreenProps {
  eventId: string
  onSelectTeam: (teamId: string) => void
  onBack: () => void
  onNavigate: (screen: Screen) => void
}

const mockTeams = [
  {
    id: "1",
    name: "Team Alpha",
    projectTitle: "Smart Campus Navigation System",
    members: ["John Doe", "Jane Smith", "Bob Johnson"],
    status: "not-graded",
    tableNumber: "A-12",
  },
  {
    id: "2",
    name: "Team Beta",
    projectTitle: "Sustainable Energy Monitor",
    members: ["Alice Williams", "Charlie Brown", "Diana Prince"],
    status: "graded",
    tableNumber: "B-05",
    score: 87,
  },
  {
    id: "3",
    name: "Team Gamma",
    projectTitle: "AI-Powered Study Assistant",
    members: ["Eve Davis", "Frank Miller", "Grace Lee"],
    status: "in-progress",
    tableNumber: "C-18",
  },
  {
    id: "4",
    name: "Team Delta",
    projectTitle: "Campus Safety Alert System",
    members: ["Henry Wilson", "Ivy Chen", "Jack Taylor"],
    status: "not-graded",
    tableNumber: "A-07",
  },
  {
    id: "5",
    name: "Team Epsilon",
    projectTitle: "Food Waste Reduction Platform",
    members: ["Kate Anderson", "Leo Martinez", "Maya Patel"],
    status: "graded",
    tableNumber: "B-14",
    score: 92,
  },
]

export function EventDetailScreen({ eventId, onSelectTeam, onBack, onNavigate }: EventDetailScreenProps) {
  const gradedCount = mockTeams.filter((t) => t.status === "graded").length
  const totalCount = mockTeams.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Aggies Invent Spring 2025</h1>
              <p className="text-sm text-muted-foreground">March 15-17, 2025 • Zachry Engineering Center</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => onNavigate("leaderboard")} className="shadow-sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Leaderboard
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-foreground">Teams</h2>
            <p className="text-muted-foreground">
              Graded {gradedCount} of {totalCount} teams
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-primary/20 to-primary/10 text-base px-4 py-1.5 shadow-sm"
            >
              {gradedCount}/{totalCount} Complete
            </Badge>
          </div>
        </div>

        <div className="grid gap-4">
          {mockTeams.map((team) => (
            <Card
              key={team.id}
              className="group cursor-pointer border-2 transition-all hover:scale-[1.01] hover:border-primary/30 hover:shadow-xl"
              onClick={() => onSelectTeam(team.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{team.name}</CardTitle>
                      <Badge
                        variant={
                          team.status === "graded" ? "default" : team.status === "in-progress" ? "secondary" : "outline"
                        }
                        className={
                          team.status === "graded"
                            ? "bg-success text-success-foreground shadow-sm"
                            : team.status === "in-progress"
                              ? "bg-warning text-warning-foreground shadow-sm"
                              : ""
                        }
                      >
                        {team.status === "graded" ? (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        ) : team.status === "in-progress" ? (
                          <Clock className="mr-1 h-3 w-3" />
                        ) : (
                          <Circle className="mr-1 h-3 w-3" />
                        )}
                        {team.status === "graded"
                          ? "Graded"
                          : team.status === "in-progress"
                            ? "In Progress"
                            : "Not Graded"}
                      </Badge>
                      {team.status === "graded" && team.score && (
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-bold shadow-sm"
                        >
                          Score: {team.score}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base font-medium">{team.projectTitle}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-4 border-primary/30">
                    Table {team.tableNumber}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span>{team.members.join(", ")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
