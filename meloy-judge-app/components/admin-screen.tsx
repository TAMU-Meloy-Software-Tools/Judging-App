"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, UsersRound, Plus, Edit, Trash2, Mail, FileUp } from "lucide-react"

interface AdminScreenProps {
  onBack: () => void
}

const mockJudges = [
  { id: "1", name: "Dr. Sarah Johnson", email: "sjohnson@tamu.edu", eventsAssigned: 2, status: "active" },
  { id: "2", name: "Prof. Michael Chen", email: "mchen@tamu.edu", eventsAssigned: 1, status: "active" },
  { id: "3", name: "Dr. Emily Rodriguez", email: "erodriguez@tamu.edu", eventsAssigned: 3, status: "active" },
]

const mockEvents = [
  { id: "1", name: "Aggies Invent Spring 2025", teams: 24, judges: 8, status: "active" },
  { id: "2", name: "Aggies Invent Fall 2024", teams: 18, judges: 6, status: "completed" },
]

export function AdminScreen({ onBack }: AdminScreenProps) {
  const [newEventName, setNewEventName] = useState("")
  const [newJudgeEmail, setNewJudgeEmail] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-primary backdrop-blur-sm shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-white/80">Manage events, judges, and teams</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4">
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">
              <Calendar className="mr-2 h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="judges">
              <UsersRound className="mr-2 h-4 w-4" />
              Judges
            </TabsTrigger>
            <TabsTrigger value="teams">
              <Users className="mr-2 h-4 w-4" />
              Teams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <Card className="border-2 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Event
                </CardTitle>
                <CardDescription>Add a new competition event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="event-name">Event Name</Label>
                    <Input
                      id="event-name"
                      placeholder="Aggies Invent Spring 2025"
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button className="shadow-md">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Existing Events</h3>
              {mockEvents.map((event) => (
                <Card key={event.id} className="border-2 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{event.name}</CardTitle>
                        <CardDescription className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {event.teams} teams
                          </span>
                          <span className="flex items-center gap-1">
                            <UsersRound className="h-3.5 w-3.5" />
                            {event.judges} judges
                          </span>
                        </CardDescription>
                      </div>
                      <Badge
                        variant={event.status === "active" ? "default" : "secondary"}
                        className={event.status === "active" ? "bg-success text-success-foreground shadow-sm" : ""}
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="mr-1.5 h-3.5 w-3.5" />
                        Manage Teams
                      </Button>
                      <Button variant="outline" size="sm">
                        <UsersRound className="mr-1.5 h-3.5 w-3.5" />
                        Assign Judges
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="judges" className="space-y-4">
            <Card className="border-2 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Invite Judge
                </CardTitle>
                <CardDescription>Send an invitation to a new judge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="judge-email">Email Address</Label>
                    <Input
                      id="judge-email"
                      type="email"
                      placeholder="judge@tamu.edu"
                      value={newJudgeEmail}
                      onChange={(e) => setNewJudgeEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button className="shadow-md">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invite
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Active Judges</h3>
              {mockJudges.map((judge) => (
                <Card key={judge.id} className="border-2 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{judge.name}</CardTitle>
                        <CardDescription>{judge.email}</CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-sm"
                      >
                        {judge.eventsAssigned} events
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Activity
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Reassign
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive bg-transparent hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <Card className="border-2 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Team
                </CardTitle>
                <CardDescription>Register a new team for an event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input id="team-name" placeholder="Team Alpha" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-title">Project Title</Label>
                    <Input id="project-title" placeholder="Smart Campus Navigation System" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="table-number">Table Number</Label>
                    <Input id="table-number" placeholder="A-12" />
                  </div>
                  <Button className="w-full shadow-md">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Team
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Import Teams
                </CardTitle>
                <CardDescription>Upload a CSV file with team information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Input type="file" accept=".csv" />
                  <Button className="shadow-md">
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
