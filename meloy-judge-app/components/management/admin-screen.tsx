"use client"

import { useState } from "react"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  Calendar,
  Users,
  UsersRound,
  Plus,
  Edit,
  Trash2,
  Mail,
  FileUp,
  Shield,
  BarChart3,
  Sparkles,
  Clock,
  Trophy,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdminScreenProps {
  onBack: () => void
}

const mockJudges = [
  { id: "1", name: "Dr. Sarah Johnson", email: "sjohnson@tamu.edu", eventsAssigned: 2, status: "active" },
  { id: "2", name: "Prof. Michael Chen", email: "mchen@tamu.edu", eventsAssigned: 1, status: "active" },
  { id: "3", name: "Dr. Emily Rodriguez", email: "erodriguez@tamu.edu", eventsAssigned: 3, status: "active" },
]

const mockEvents = [
  { id: "1", name: "Aggies Invent Spring 2025", teams: 24, judges: 8, status: "active", date: "Mar 21, 2025" },
  { id: "2", name: "Aggies Invent Fall 2024", teams: 18, judges: 6, status: "completed", date: "Oct 14, 2024" },
]

type ActivityItem = {
  id: string
  title: string
  description: string
  time: string
  icon: LucideIcon
  tone: string
}

const recentActivity: ActivityItem[] = [
  {
    id: "1",
    title: "Event timeline published",
    description: "Aggies Invent Spring 2025 schedule locked and shared with judges.",
    time: "Today - 9:41 AM",
    icon: Calendar,
    tone: "text-emerald-500",
  },
  {
    id: "2",
    title: "Judge assignments balanced",
    description: "Average of 3.1 teams per judge after latest assignments.",
    time: "Yesterday - 6:18 PM",
    icon: UsersRound,
    tone: "text-sky-500",
  },
  {
    id: "3",
    title: "Insights exported",
    description: "Summary CSV shared with directors for closing ceremony.",
    time: "Mon - 2:03 PM",
    icon: BarChart3,
    tone: "text-purple-500",
  },
]

const bestPractices = [
  "Require multi-factor auth for all admin roles",
  "Rotate judge access every event cycle",
  "Archive scoring data after 120 days",
]

const teamSpotlight = {
  team: "Project Helios",
  event: "Aggies Invent Spring 2025",
  summary: "AI-powered campus energy optimizer delivering 27% efficiency gains.",
  category: "Sustainability",
  score: "92.4",
}

export function AdminScreen({ onBack }: AdminScreenProps) {
  const [newEventName, setNewEventName] = useState("")
  const [newJudgeEmail, setNewJudgeEmail] = useState("")

  const activeEvents = mockEvents.filter((event) => event.status === "active").length
  const activeJudges = mockJudges.filter((judge) => judge.status === "active").length
  const totalTeams = mockEvents.reduce((acc, event) => acc + event.teams, 0)
  const averageJudgesPerEvent = (mockEvents.reduce((acc, event) => acc + event.judges, 0) / mockEvents.length).toFixed(1)

  const highlightMetrics = [
    {
      id: "events",
      label: "Active events",
      value: activeEvents.toString(),
      trend: "+12%",
      trendLabel: "vs last cohort",
      icon: Calendar,
      accent: "from-primary/15 via-primary/5 to-transparent",
    },
    {
      id: "judges",
      label: "Judges engaged",
      value: activeJudges.toString(),
      trend: "+4",
      trendLabel: "joined this month",
      icon: UsersRound,
      accent: "from-orange-200/60 via-white to-transparent",
    },
    {
      id: "teams",
      label: "Teams registered",
      value: totalTeams.toString(),
      trend: "+18%",
      trendLabel: "from 2024 season",
      icon: Users,
      accent: "from-sky-200/60 via-white to-transparent",
    },
    {
      id: "coverage",
      label: "Avg judges / event",
      value: averageJudgesPerEvent,
      trend: "100%",
      trendLabel: "schedule coverage",
      icon: BarChart3,
      accent: "from-emerald-200/60 via-white to-transparent",
    },
  ]

  const upcomingEvent = mockEvents[0]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative border-b bg-linear-to-b from-primary to-[#3d0000] backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-white hover:bg-white/20 h-11 w-11 p-2 flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-auto items-center justify-center rounded-xl bg-white/15 backdrop-blur-md shadow-md p-2 border border-white/25">
                  <Image src="/apptitle.png" alt="Meloy Program Judging Portal" width={130} height={60} className="object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-white sm:text-[2.25rem] md:text-[2.5rem]">Admin Control Center</h1>
                  <p className="text-sm text-white/90">Orchestrate events, coach judges, and spotlight standout teams.</p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Live Cohort 2025
            </Badge>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlightMetrics.map((metric) => {
            const Icon = metric.icon

            return (
              <Card
                key={metric.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${metric.accent} opacity-70`} />
                <CardContent className="relative flex flex-col gap-6 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 shadow-inner">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                      {metric.trend} - {metric.trendLabel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-4xl font-semibold text-slate-900">{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)]">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid h-16 w-full grid-cols-3 rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-lg backdrop-blur">
                            <TabsTrigger
                value="events"
                className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Events
              </TabsTrigger>
              <TabsTrigger
                value="judges"
                className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
              >
                <UsersRound className="mr-2 h-5 w-5" />
                Judges
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Insights
              </TabsTrigger>
            </TabsList>

            <div className="mt-10 space-y-10">
              <TabsContent value="events" className="space-y-8">
                {upcomingEvent && (
                  <Card className="relative overflow-hidden rounded-3xl border-none bg-linear-to-br from-primary/95 via-primary/90 to-[#3d0000] text-white shadow-2xl">
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10 bg-white/10 blur-2xl" />
                    <CardHeader className="relative p-8 pb-6">
                      <Badge className="w-fit rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white">
                        Next Spotlight Event
                      </Badge>
                      <CardTitle className="mt-4 text-3xl font-semibold">{upcomingEvent.name}</CardTitle>
                      <CardDescription className="text-base text-white/80">
                        Finalize agendas, publish expectations, and keep mentors aligned ahead of demo day.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative flex flex-wrap gap-6 p-8 pt-4">
                      <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
                        <Calendar className="h-5 w-5" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Event date</p>
                          <p className="text-lg font-semibold">{upcomingEvent.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
                        <Users className="h-5 w-5" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Teams locked in</p>
                          <p className="text-lg font-semibold">{upcomingEvent.teams}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
                        <UsersRound className="h-5 w-5" />
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Judges assigned</p>
                          <p className="text-lg font-semibold">{upcomingEvent.judges}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="rounded-3xl border border-dashed border-slate-300/70 bg-white/85 backdrop-blur-sm shadow-lg">
                  <CardHeader className="p-8 pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                      <Sparkles className="h-6 w-6 text-primary" />
                      Launch New Event Journey
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      Capture the working title and send a kickoff announcement to your core team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="flex flex-col gap-4 lg:flex-row">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="event-name" className="text-base font-medium text-slate-700">
                          Event name
                        </Label>
                        <Input
                          id="event-name"
                          placeholder="e.g., Aggies Invent Summer 2025"
                          value={newEventName}
                          onChange={(e) => setNewEventName(e.target.value)}
                          className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-inner focus-visible:border-primary/60"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button className="h-12 rounded-xl bg-primary px-6 text-base font-semibold shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
                          <Plus className="mr-2 h-5 w-5" />
                          Draft event
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-3xl font-semibold text-slate-800">Program timeline</h3>
                    <Button variant="ghost" className="h-10 rounded-full border border-transparent px-4 text-sm font-semibold text-primary hover:border-primary/20 hover:bg-primary/10">
                      View archive
                    </Button>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {mockEvents.map((event) => (
                      <Card
                        key={event.id}
                        className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-70" />
                        <CardHeader className="px-6 pb-4 pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <CardTitle className="text-2xl font-semibold text-slate-800 group-hover:text-primary transition-colors">
                                {event.name}
                              </CardTitle>
                              <CardDescription className="mt-3 flex flex-col gap-2 text-base text-slate-600">
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  {event.date}
                                </span>
                                <span className="flex items-center gap-4 text-sm text-slate-500">
                                  <span className="flex items-center gap-2">
                                    <Users className="h-4 w-4" /> {event.teams} teams
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <UsersRound className="h-4 w-4" /> {event.judges} judges
                                  </span>
                                </span>
                              </CardDescription>
                            </div>
                            <Badge
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm ${
                                event.status === "active"
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-200 text-slate-700 border border-slate-300"
                              }`}
                            >
                              {event.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardFooter className="flex flex-wrap gap-3 border-t border-slate-100/80 p-6">
                          <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-5 text-sm font-semibold">
                            <Edit className="mr-2 h-4 w-4" />
                            Build agenda
                          </Button>
                          <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-5 text-sm font-semibold">
                            <Users className="mr-2 h-4 w-4" />
                            Manage teams
                          </Button>
                          <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-5 text-sm font-semibold">
                            <UsersRound className="mr-2 h-4 w-4" />
                            Assign judges
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="judges" className="space-y-8">
                <Card className="overflow-hidden rounded-3xl border-none bg-linear-to-br from-[#2b295f] via-[#513b8a] to-[#7c2d7c] text-white shadow-2xl">
                  <CardHeader className="p-8 pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
                      <Mail className="h-6 w-6" />
                      Invite a Judge Mentor
                    </CardTitle>
                    <CardDescription className="text-base text-white/80">
                      Share a curated welcome kit and onboarding checklist in a single tap.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="judge-email" className="text-base font-semibold uppercase tracking-[0.2em] text-white/70">
                          Email address
                        </Label>
                        <Input
                          id="judge-email"
                          type="email"
                          placeholder="judge@example.com"
                          value={newJudgeEmail}
                          onChange={(e) => setNewJudgeEmail(e.target.value)}
                          className="h-12 rounded-xl border-white/30 bg-white/10 px-4 text-base text-white placeholder:text-white/60"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button className="h-12 rounded-xl bg-white px-6 text-base font-semibold text-[#513b8a] shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
                          <Mail className="mr-2 h-5 w-5" />
                          Send invite
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="mb-6 text-3xl font-semibold text-slate-800">Judge roster</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {mockJudges.map((judge) => (
                      <Card
                        key={judge.id}
                        className="group rounded-3xl border border-slate-200/80 bg-white/90 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                      >
                        <CardHeader className="p-6 pb-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <CardTitle className="text-2xl font-semibold text-slate-800 group-hover:text-primary transition-colors">
                                {judge.name}
                              </CardTitle>
                              <CardDescription className="mt-2 text-base text-slate-600">{judge.email}</CardDescription>
                            </div>
                            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                              {judge.eventsAssigned} events
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-0">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-primary" />
                              {judge.status === "active" ? "Active access" : "Inactive"}
                            </span>
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              Mentoring {judge.eventsAssigned * 3} teams
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-wrap gap-3 border-t border-slate-100/80 p-6">
                          <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-5 text-sm font-semibold">
                            View activity
                          </Button>
                          <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-5 text-sm font-semibold">
                            <Edit className="mr-2 h-4 w-4" />
                            Reassign
                          </Button>
                          <Button variant="destructive" className="h-11 rounded-xl px-5 text-sm font-semibold">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="teams" className="space-y-8">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="rounded-3xl border border-slate-200/70 bg-linear-to-br from-white via-slate-50 to-slate-100 shadow-lg">
                    <CardHeader className="p-8 pb-6">
                      <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                        <Plus className="h-6 w-6 text-primary" />
                        Add a single team
                      </CardTitle>
                      <CardDescription className="text-base text-slate-600">
                        Capture their project identity so judges see context instantly.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="team-name" className="text-base font-medium text-slate-700">
                          Team name
                        </Label>
                        <Input id="team-name" placeholder="e.g., Team Alpha" className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-title" className="text-base font-medium text-slate-700">
                          Project title
                        </Label>
                        <Input id="project-title" placeholder="e.g., Smart Campus Navigation" className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="table-number" className="text-base font-medium text-slate-700">
                          Table number
                        </Label>
                        <Input id="table-number" placeholder="e.g., A-12" className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner" />
                      </div>
                      <Button className="w-full h-12 rounded-xl bg-primary text-base font-semibold shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
                        <Plus className="mr-2 h-5 w-5" />
                        Add team
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
                    <CardHeader className="p-8 pb-6">
                      <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                        <FileUp className="h-6 w-6 text-primary" />
                        Import multiple teams (CSV)
                      </CardTitle>
                      <CardDescription className="text-base text-slate-600">
                        Download the template, paste roster data, and upload when you are ready.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-2">
                      <div className="flex w-full items-center justify-center">
                        <Label
                          htmlFor="csv-upload"
                          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-14 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                          <FileUp className="mb-4 h-11 w-11 text-primary" />
                          <p className="text-base font-semibold text-slate-700">Drag & drop or click to upload</p>
                          <p className="mt-1 text-sm text-slate-500">CSV file - Max 2MB</p>
                          <Input id="csv-upload" type="file" accept=".csv" className="hidden" />
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="overflow-hidden rounded-3xl border-none bg-linear-to-br from-amber-200 via-rose-100 to-white shadow-xl">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                      <Trophy className="h-6 w-6 text-amber-500" />
                      Team spotlight
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      Celebrate progress and keep the showcase energy high for the upcoming demo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-2">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div>
                        <Badge className="mb-3 w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
                          {teamSpotlight.event}
                        </Badge>
                        <h4 className="text-3xl font-semibold text-slate-900">{teamSpotlight.team}</h4>
                        <p className="mt-2 text-base text-slate-600">{teamSpotlight.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                          <span className="rounded-full bg-white/70 px-3 py-1 font-semibold text-amber-600">
                            {teamSpotlight.category}
                          </span>
                          <span className="rounded-full bg-white/70 px-3 py-1 font-semibold text-amber-600">
                            Score {teamSpotlight.score}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" className="h-12 rounded-xl border-white/60 bg-white/80 px-6 text-base font-semibold text-amber-600 hover:bg-white">
                        View story deck
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className="space-y-6">
            <Card className="rounded-3xl border border-slate-200/80 bg-white/90 shadow-lg">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xl font-semibold text-slate-900">Operational snapshot</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Track the most recent moves across events, judges, and scoring workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="relative pl-6">
                  <span className="absolute left-2 top-1 h-[calc(100%-12px)] w-px bg-slate-200" aria-hidden />
                  {recentActivity.map((item) => {
                    const Icon = item.icon

                    return (
                      <div key={item.id} className="relative pb-6 last:pb-0">
                        <span className="absolute -left-[11px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-primary/20">
                          <Icon className={`h-3.5 w-3.5 ${item.tone}`} />
                        </span>
                        <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                          <span className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-slate-100/80 p-5">
                <Button variant="ghost" className="h-11 rounded-full px-4 text-sm font-semibold text-primary hover:bg-primary/10">
                  View full activity log
                </Button>
              </CardFooter>
            </Card>

            <Card className="rounded-3xl border-none bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Shield className="h-5 w-5" />
                  Roles & security
                </CardTitle>
                <CardDescription className="text-sm text-white/70">
                  Keep the judging portal compliant and audit-ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {bestPractices.map((item, index) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-sm text-white/80">{item}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-white/10 p-6">
                <Button variant="secondary" className="h-11 rounded-xl bg-white text-slate-900 hover:bg-white/90">
                  Review access matrix
                </Button>
                <Button variant="ghost" className="h-11 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20">
                  Download judge onboarding kit
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
