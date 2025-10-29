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
      <header className="border-b bg-primary backdrop-blur-sm shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 shadow-md">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Aggies Invent</h1>
              <p className="text-base text-white/80">Judge Portal</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Button
                variant="secondary"
                onClick={() => onNavigate("admin")}
                className="shadow-sm bg-white text-primary hover:bg-white/90 h-12 px-6 text-base"
              >
                <Shield className="mr-2 h-5 w-5" />
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("settings")}
              className="text-white hover:bg-white/20 h-12 w-12"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h2 className="mb-3 text-4xl font-bold text-foreground">My Events</h2>
          <p className="text-lg text-muted-foreground">View and manage your assigned judging competitions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockEvents.map((event) => (
            <Card
              key={event.id}
              className="group cursor-pointer border-2 transition-all hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl"
              onClick={() => onSelectEvent(event.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                    {event.name}
                  </CardTitle>
                  <Badge
                    variant={event.status === "active" ? "default" : "secondary"}
                    className={`text-base px-3 py-1 ${event.status === "active" ? "bg-success text-success-foreground shadow-sm" : ""}`}
                  >
                    {event.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 text-base mt-2">
                  <Calendar className="h-5 w-5" />
                  {event.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-base">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <span className="flex-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
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
