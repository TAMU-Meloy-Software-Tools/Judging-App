"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Screen } from "@/app/page"
import { Calendar, MapPin, Users, Settings, Shield, ChevronRight, User, Loader2 } from "lucide-react"
import { getEvents, getCurrentUser } from "@/lib/api"
import type { Event } from "@/lib/types/api"

interface DashboardScreenProps {
  onSelectEvent: (eventId: string) => void
  onNavigate: (screen: Screen) => void
  isAdmin: boolean
}

export function DashboardScreen({ onSelectEvent, onNavigate, isAdmin }: DashboardScreenProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [eventsData, userData] = await Promise.all([
          getEvents(),
          getCurrentUser()
        ])
        setEvents(eventsData.events)
        setUser({
          name: userData.user.name || 'User',
          role: userData.user.role
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helper function to format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', options)
    }

    const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endFormatted = end.toLocaleDateString('en-US', options)
    return `${startMonth} - ${endFormatted}`
  }

  // Map event type to logo
  const getEventLogo = (eventType: string) => {
    if (eventType.includes('problems-worth-solving')) {
      return '/pws.png'
    }
    return '/aggiesinvent.png'
  }


  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative z-30 overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <div className="flex h-16 lg:h-20 w-auto shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 px-3 py-2 shadow-md backdrop-blur-md">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-semibold text-white leading-tight">My Events</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* User Profile */}
              <div className="flex items-center gap-3 rounded-full border-2 border-white/30 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white leading-tight">
                    {user?.name || 'Loading...'}
                  </span>
                  <span className="text-xs text-white/70 capitalize">
                    {user?.role || '...'}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <Button
                  variant="secondary"
                  onClick={() => onNavigate("admin")}
                  className="h-11 rounded-full bg-white px-5 lg:px-6 text-base font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white/90"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Admin
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => onNavigate("settings")}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                aria-label="Open settings"
              >
                <Settings className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
        <div className="absolute inset-0 -z-10 rounded-[36px] bg-linear-to-b from-white via-slate-50 to-primary/10 shadow-[0_24px_80px_rgba(148,163,184,0.25)]" />

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg text-slate-600">Loading events...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex min-h-[400px] items-center justify-center">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">Error: {error}</p>
                <Button
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-slate-600">No events found</p>
            </div>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event, index) => (
              <Card
                key={event.id}
                className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 ring-1 ring-primary/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:ring-primary/25 hover:shadow-2xl p-0"
                onClick={() => onSelectEvent(event.id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Sponsor gradient section at top */}
                <div
                  className="relative h-32 overflow-hidden rounded-t-[28px]"
                  style={{
                    background: event.event_type.includes("problems-worth-solving")
                      ? "linear-gradient(to bottom, #500000, #3d0000)"
                      : "linear-gradient(to bottom, #b91c1c, #7f1d1d)"
                  }}
                >
                  {/* Subtle texture overlay */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L2BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

                  {/* Status badge - top right with glassy design */}
                  <div className={`absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full border-2 backdrop-blur-xl px-3 py-1.5 shadow-xl ${event.status === "active"
                    ? "border-white/70 bg-white/70"
                    : "border-white/60 bg-white/60"
                    }`}>
                    {event.status === "active" && (
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <span className={`text-xs font-semibold uppercase tracking-wide ${event.status === "active"
                      ? "text-emerald-700"
                      : "text-slate-700"
                      }`}>
                      {event.status}
                    </span>
                  </div>

                  {/* White glass sponsor container - left side */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-xl border-2 border-white/80 shadow-xl px-4 py-3">
                    <Image
                      src={event.event_type.includes("problems-worth-solving") ? "/TAMUlogo.png" : "/ExxonLogo.png"}
                      alt={event.event_type.includes("problems-worth-solving") ? "Texas A&M University" : "ExxonMobil"}
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
                    {formatDateRange(event.start_date, event.end_date)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative px-6 pb-4 pt-1">
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
                        Teams
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between rounded-xl bg-primary px-6 py-3 text-white transition-all duration-300 group-hover:bg-primary/90">
                      <span className="text-sm font-semibold uppercase tracking-[0.24em]">View Event</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Event logo moved to bottom */}
                  <div className="mt-3 flex justify-center">
                    <div className="flex h-20 min-h-20 w-full items-center justify-center rounded-xl border border-slate-200/70 bg-slate-50/70 px-6 py-3 shadow-sm">
                      <Image
                        src={getEventLogo(event.event_type)}
                        alt={event.name}
                        width={180}
                        height={64}
                        className={`w-auto max-w-full object-contain ${event.event_type.includes("problems-worth-solving") ? "h-16" : "h-14"
                          }`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
