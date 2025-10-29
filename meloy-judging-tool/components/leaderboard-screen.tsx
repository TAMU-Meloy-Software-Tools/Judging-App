"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react"

interface LeaderboardScreenProps {
  eventId: string
  onBack: () => void
}

const mockLeaderboard = [
  {
    rank: 1,
    teamName: "Team Epsilon",
    projectTitle: "Food Waste Reduction Platform",
    totalScore: 92,
    breakdown: {
      innovation: 19,
      technical: 18,
      impact: 19,
      presentation: 18,
      teamwork: 18,
    },
  },
  {
    rank: 2,
    teamName: "Team Beta",
    projectTitle: "Sustainable Energy Monitor",
    totalScore: 87,
    breakdown: {
      innovation: 17,
      technical: 18,
      impact: 17,
      presentation: 18,
      teamwork: 17,
    },
  },
  {
    rank: 3,
    teamName: "Team Alpha",
    projectTitle: "Smart Campus Navigation System",
    totalScore: 85,
    breakdown: {
      innovation: 18,
      technical: 17,
      impact: 16,
      presentation: 17,
      teamwork: 17,
    },
  },
  {
    rank: 4,
    teamName: "Team Gamma",
    projectTitle: "AI-Powered Study Assistant",
    totalScore: 82,
    breakdown: {
      innovation: 16,
      technical: 17,
      impact: 16,
      presentation: 17,
      teamwork: 16,
    },
  },
  {
    rank: 5,
    teamName: "Team Delta",
    projectTitle: "Campus Safety Alert System",
    totalScore: 78,
    breakdown: {
      innovation: 15,
      technical: 16,
      impact: 16,
      presentation: 15,
      teamwork: 16,
    },
  },
]

const criteriaLabels = {
  innovation: "Innovation",
  technical: "Technical",
  impact: "Impact",
  presentation: "Presentation",
  teamwork: "Teamwork",
}

export function LeaderboardScreen({ eventId, onBack }: LeaderboardScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
                <p className="text-sm text-muted-foreground">Aggies Invent Spring 2025</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold text-foreground">Team Rankings</h2>
          <p className="text-muted-foreground">Live scores and rankings for all teams</p>
        </div>

        <div className="space-y-4">
          {mockLeaderboard.map((team) => (
            <Card key={team.rank} className="overflow-hidden border-2 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-bold shadow-md ${
                        team.rank === 1
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white"
                          : team.rank === 2
                            ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                            : team.rank === 3
                              ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white"
                              : "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground"
                      }`}
                    >
                      {team.rank === 1 ? (
                        <Trophy className="h-7 w-7" />
                      ) : team.rank === 2 ? (
                        <Medal className="h-7 w-7" />
                      ) : team.rank === 3 ? (
                        <Award className="h-7 w-7" />
                      ) : (
                        `#${team.rank}`
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{team.teamName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{team.projectTitle}</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xl font-bold px-5 py-2 shadow-md ${
                      team.rank === 1
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                        : team.rank <= 3
                          ? "bg-gradient-to-r from-primary/30 to-primary/20 text-primary"
                          : ""
                    }`}
                  >
                    {team.totalScore}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(team.breakdown).map(([key, score]) => (
                    <div key={key} className="text-center">
                      <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                        {criteriaLabels[key as keyof typeof criteriaLabels]}
                      </div>
                      <Badge
                        variant="outline"
                        className={`w-full justify-center font-bold ${
                          score >= 18 ? "border-success/50 bg-success/10 text-success" : ""
                        }`}
                      >
                        {score}/20
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockLeaderboard.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">No scores yet</p>
              <p className="text-sm text-muted-foreground">Teams will appear here once they have been graded</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
