"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Clock, Users, UsersRound, Calendar, UsersRound as UsersRoundIcon, BarChart3 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Event {
  id: string
  name: string
  teams: number
  judges: number
  status: string
  date: string
}

interface ActivityItem {
  id: string
  title: string
  description: string
  time: string
  icon: LucideIcon
  tone: string
}

interface AdminEventsTabProps {
  events: Event[]
  recentActivity: ActivityItem[]
  onCreateEvent: () => void
  onManageEvent: (eventId: string) => void
}

export function AdminEventsTab({ events, recentActivity, onCreateEvent, onManageEvent }: AdminEventsTabProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-3xl font-semibold text-slate-800">Your Events</h3>
        <Button 
          onClick={onCreateEvent}
          className="h-14 rounded-2xl bg-primary px-8 text-lg font-semibold shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <Plus className="mr-2 h-6 w-6" />
          Create New Event
        </Button>
      </div>

      <div>
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
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
                <Button 
                  onClick={() => onManageEvent(event.id)}
                  className="h-11 flex-1 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Manage Event
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Card className="rounded-3xl border border-slate-200/80 bg-white/90 shadow-lg">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-xl font-semibold text-slate-900">Recent Activity</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Track the most recent moves across events, judges, and scoring workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="relative flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {recentActivity.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.id} className="min-w-[340px] shrink-0">
                  <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 px-5 py-4 h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md ring-2 ring-primary/20`}>
                        <Icon className={`h-5 w-5 ${item.tone}`} />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <span className="mt-1 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {item.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
