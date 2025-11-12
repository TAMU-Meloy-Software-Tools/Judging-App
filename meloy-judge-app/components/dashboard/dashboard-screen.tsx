"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Screen } from "@/app/page"
import { Calendar, MapPin, Users, Settings, Shield, ChevronRight } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <header className="relative overflow-hidden border-b bg-gradient-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-35" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10">
          <div className="flex flex-1 flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-auto items-center justify-center rounded-2xl border border-white/25 bg-white/15 px-3 py-2 shadow-md backdrop-blur-md">
                <Image src="/apptitle.png" alt="Meloy Program Judging Portal" width={140} height={60} className="object-contain" />
              </div>
              <div>
                <h1 className="text-[2.25rem] font-semibold text-white sm:text-[2.75rem]">My Events</h1>
                <p className="text-base text-white/80">Organize judging blocks, revisit past cohorts, and monitor standings.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 md:flex-none">
            {isAdmin && (
              <Button
                variant="secondary"
                onClick={() => onNavigate("admin")}
                className="h-12 rounded-full bg-white px-6 text-base font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white/90"
              >
                <Shield className="mr-2 h-5 w-5" />
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => onNavigate("settings")}
              className="flex h-12 w-12 items-center justify-center rounded-full text-white hover:bg-white/20"
              aria-label="Open settings"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-12 md:px-8 md:py-16">
        <div className="absolute inset-0 -z-10 rounded-[36px] bg-gradient-to-b from-white via-slate-50 to-primary/10 shadow-[0_24px_80px_rgba(148,163,184,0.25)]" />

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {mockEvents.map((event, index) => (
            <Card
              key={event.id}
              className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 ring-1 ring-primary/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:ring-primary/25 hover:shadow-2xl"
              onClick={() => onSelectEvent(event.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/50" />

              <CardHeader className="relative px-6 pb-4 pt-7">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <CardTitle className="text-[1.3rem] font-semibold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-primary line-clamp-2">
                    {event.name}
                  </CardTitle>
                  <Badge
                    variant={event.status === "active" ? "default" : "secondary"}
                    className={`shrink-0 text-xs font-semibold px-3 py-1 uppercase tracking-wide ${
                      event.status === "active"
                        ? "bg-emerald-500/90 text-white shadow-sm shadow-emerald-500/30"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {event.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-3 text-base font-medium text-slate-600">
                  <Calendar className="h-5 w-5 text-primary" />
                  {event.date}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative px-6 pb-7 pt-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="flex-1 text-base font-medium text-slate-700 leading-tight">
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="flex-1 text-base font-medium text-slate-700">
                      {event.teamsCount} Teams
                    </span>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between rounded-xl bg-primary px-6 py-3 text-white transition-all duration-300 group-hover:bg-primary/90">
                    <span className="text-sm font-semibold uppercase tracking-[0.24em]">View Event</span>
                    <ChevronRight className="h-5 w-5" />
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
