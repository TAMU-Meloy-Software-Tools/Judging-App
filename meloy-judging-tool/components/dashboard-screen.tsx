"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Screen } from "@/app/page"
import { Calendar, MapPin, Users, Settings, Shield, TrendingUp } from "lucide-react"

interface DashboardScreenProps {
  onSelectEvent: (eventId: string) => void
  onNavigate: (screen: Screen) => void
  isAdmin: boolean
}

const mockEvents = [
  {
    id: "1",
    name: "Aggies Invent Spring 2025",
    date: "March 15-17, 2025",
    location: "Zachry Engineering Center",
    status: "active",
    teamsCount: 24,
  },
  {
    id: "2",
    name: "Aggies Invent Fall 2024",
    date: "October 20-22, 2024",
    location: "Memorial Student Center",
    status: "completed",
    teamsCount: 18,
  },
  {
    id: "3",
    name: "Aggies Invent Summer 2024",
    date: "July 10-12, 2024",
    location: "Engineering Innovation Center",
    status: "completed",
    teamsCount: 20,
  },
]

export function DashboardScreen({ onSelectEvent, onNavigate, isAdmin }: DashboardScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Aggies Invent</h1>
              <p className="text-sm text-muted-foreground">Judge Portal</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => onNavigate("admin")} className="shadow-sm">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => onNavigate("settings")}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold text-foreground">My Events</h2>
          <p className="text-muted-foreground">View and manage your assigned judging competitions</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockEvents.map((event) => (
            <Card
              key={event.id}
              className="group cursor-pointer border-2 transition-all hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl"
              onClick={() => onSelectEvent(event.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {event.name}
                  </CardTitle>
                  <Badge
                    variant={event.status === "active" ? "default" : "secondary"}
                    className={event.status === "active" ? "bg-success text-success-foreground shadow-sm" : ""}
                  >
                    {event.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {event.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span className="flex-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <span className="flex-1">{event.teamsCount} Teams</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
