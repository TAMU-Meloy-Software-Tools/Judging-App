"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Clock, Users, UsersRound, Calendar, MapPin, ChevronRight, BarChart3 } from "lucide-react"
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
        <h3 className="text-3xl font-semibold text-slate-800"></h3>
        <Button 
          onClick={onCreateEvent}
          className="h-14 rounded-2xl bg-primary px-8 text-lg font-semibold shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
          <Plus className="mr-2 h-6 w-6" />
          Create New Event
        </Button>
      </div>

      <Card className="rounded-3xl border border-slate-200/80 bg-white/90 shadow-lg p-6">
        <div className="overflow-x-auto py-2 pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="flex gap-7 w-max">
            {events.map((event, index) => (
              <Card
                key={event.id}
                onClick={() => onManageEvent(event.id)}
                className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 ring-1 ring-primary/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:ring-primary/25 hover:shadow-2xl p-0 w-95 shrink-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
              {/* Sponsor gradient section at top */}
              <div className="relative h-32 bg-linear-to-b from-primary to-[#3d0000] overflow-hidden rounded-t-[28px]">
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
                
                {/* Status badge - top right with glassy design */}
                <div className={`absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full border-2 backdrop-blur-xl px-3 py-1.5 shadow-xl ${
                  event.status === "active"
                    ? "border-white/70 bg-white/70"
                    : "border-white/60 bg-white/60"
                }`}>
                  {event.status === "active" && (
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <span className={`text-xs font-semibold uppercase tracking-wide ${
                    event.status === "active"
                      ? "text-emerald-700"
                      : "text-slate-700"
                  }`}>
                    {event.status}
                  </span>
                </div>

                {/* White glass sponsor container - left side */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-xl border-2 border-white/80 shadow-xl px-4 py-3">
                  <Image
                    src="/TAMUlogo.png"
                    alt="Meloy Program"
                    width={80}
                    height={40}
                    className="h-10 w-auto max-w-30 object-contain"
                  />
                </div>
              </div>

              <CardHeader className="relative px-6 pb-3 pt-4">
                <CardTitle className="text-[1.3rem] font-semibold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-primary line-clamp-2 mb-3">
                  {event.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-3 text-base font-medium text-slate-600">
                  <Calendar className="h-5 w-5 text-primary" />
                  {event.date}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative px-6 pb-4 pt-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="flex-1 text-base font-medium text-slate-700">
                      {event.teams} Teams
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                      <UsersRound className="h-5 w-5" />
                    </div>
                    <span className="flex-1 text-base font-medium text-slate-700">
                      {event.judges} Judges
                    </span>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <button
                    onClick={() => onManageEvent(event.id)}
                    className="w-full flex items-center justify-between rounded-xl bg-primary px-6 py-3 text-white transition-all duration-300 hover:bg-primary/90"
                  >
                    <span className="text-sm font-semibold uppercase tracking-[0.24em]">Manage Event</span>
                    <Edit className="h-5 w-5" />
                  </button>
                </div>

                {/* Event logo moved to bottom */}
                <div className="mt-3 flex justify-center">
                  <div className="flex h-20 min-h-20 w-full items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/70 px-6 py-3 shadow-sm">
                    <Image
                      src="/aggiesinvent.png"
                      alt={event.name}
                      width={180}
                      height={64}
                      className="h-14 w-auto max-w-full object-contain"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </Card>

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
                <div key={item.id} className="min-w-85 shrink-0">
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
