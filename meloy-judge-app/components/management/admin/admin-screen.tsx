"use client"

import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  Calendar,
  Shield,
  BarChart3,
  Sparkles,
  Clock,
  UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminEventsTab } from "./admin-events-tab"
import { AdminAccountsTab } from "./admin-accounts-tab"
import { AdminEventsRecapTab } from "./admin-events-recap-tab"

interface AdminScreenProps {
  onBack: () => void
  onCreateEvent: () => void
  onManageEvent: (eventId: string) => void
}

const mockAccounts = [
  { id: "1", name: "Dr. Sarah Johnson", email: "sjohnson@tamu.edu", isJudge: true, isAdmin: false, isModerator: false },
  { id: "2", name: "Prof. Michael Chen", email: "mchen@tamu.edu", isJudge: true, isAdmin: true, isModerator: false },
  { id: "3", name: "Dr. Emily Rodriguez", email: "erodriguez@tamu.edu", isJudge: false, isAdmin: false, isModerator: true },
  { id: "4", name: "Dr. James Wilson", email: "jwilson@tamu.edu", isJudge: true, isAdmin: false, isModerator: true },
  { id: "5", name: "Prof. Lisa Anderson", email: "landerson@tamu.edu", isJudge: false, isAdmin: true, isModerator: false },
  { id: "6", name: "Dr. Robert Taylor", email: "rtaylor@tamu.edu", isJudge: true, isAdmin: false, isModerator: false },
  { id: "7", name: "Dr. Maria Garcia", email: "mgarcia@tamu.edu", isJudge: false, isAdmin: true, isModerator: true },
  { id: "8", name: "Prof. David Lee", email: "dlee@tamu.edu", isJudge: true, isAdmin: false, isModerator: false },
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

export function AdminScreen({ onBack, onCreateEvent, onManageEvent }: AdminScreenProps) {
  const totalEvents = mockEvents.length
  const totalJudges = mockAccounts.filter(account => account.isJudge).length

  const highlightMetrics = [
    {
      id: "total-events",
      label: "Total events",
      value: totalEvents.toString(),
      icon: Calendar,
      iconColor: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      id: "avg-judging-time",
      label: "Avg judging time",
      value: "21m",
      icon: Clock,
      iconColor: "text-sky-500",
      bgColor: "bg-sky-50",
    },
  ]

  // Event history data for the timeline
  const eventHistoryData = [
    {
      name: "Aggies Invent Fall 2024",
      date: "Oct 20-22, 2024",
      status: "completed" as const,
      teams: [
        { 
          name: "Team Alpha",
          judges: [
            { name: "Dr. Smith", communication: 22, fundBuy: 21, presentation: 21, cohesion: 21 },
            { name: "Prof. Johnson", communication: 21, fundBuy: 20, presentation: 22, cohesion: 21 },
            { name: "Dr. Williams", communication: 22, fundBuy: 22, presentation: 21, cohesion: 21 },
            { name: "Dr. Brown", communication: 22, fundBuy: 21, presentation: 21, cohesion: 21 },
          ],
          avgTime: 22
        },
        { 
          name: "Team Beta",
          judges: [
            { name: "Dr. Smith", communication: 23, fundBuy: 22, presentation: 22, cohesion: 21 },
            { name: "Prof. Johnson", communication: 22, fundBuy: 21, presentation: 22, cohesion: 21 },
            { name: "Dr. Williams", communication: 21, fundBuy: 21, presentation: 22, cohesion: 22 },
            { name: "Dr. Brown", communication: 22, fundBuy: 21, presentation: 22, cohesion: 21 },
          ],
          avgTime: 23
        },
        { 
          name: "Team Gamma",
          judges: [
            { name: "Dr. Smith", communication: 21, fundBuy: 20, presentation: 21, cohesion: 20 },
            { name: "Prof. Johnson", communication: 21, fundBuy: 21, presentation: 22, cohesion: 21 },
            { name: "Dr. Williams", communication: 22, fundBuy: 21, presentation: 21, cohesion: 21 },
            { name: "Dr. Brown", communication: 21, fundBuy: 20, presentation: 22, cohesion: 21 },
          ],
          avgTime: 21
        },
      ],
    },
    {
      name: "Problems Worth Solving Summer 2024",
      date: "Jul 10-12, 2024",
      status: "completed" as const,
      teams: [
        { 
          name: "Innovators",
          judges: [
            { name: "Dr. Smith", communication: 21, fundBuy: 20, presentation: 21, cohesion: 20 },
            { name: "Prof. Johnson", communication: 20, fundBuy: 20, presentation: 21, cohesion: 20 },
            { name: "Dr. Williams", communication: 21, fundBuy: 20, presentation: 20, cohesion: 21 },
            { name: "Dr. Brown", communication: 20, fundBuy: 20, presentation: 21, cohesion: 20 },
          ],
          avgTime: 20
        },
        { 
          name: "Pioneers",
          judges: [
            { name: "Dr. Smith", communication: 21, fundBuy: 21, presentation: 22, cohesion: 21 },
            { name: "Prof. Johnson", communication: 22, fundBuy: 21, presentation: 21, cohesion: 21 },
            { name: "Dr. Williams", communication: 21, fundBuy: 20, presentation: 22, cohesion: 21 },
            { name: "Dr. Brown", communication: 21, fundBuy: 21, presentation: 21, cohesion: 21 },
          ],
          avgTime: 19
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative border-b bg-linear-to-b from-primary to-[#3d0000] backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <ArrowLeft className="h-7 w-7" />
              </Button>
              <div className="flex h-16 lg:h-20 w-auto items-center justify-center rounded-xl bg-white/15 backdrop-blur-md shadow-md px-3 py-2 border border-white/25">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">Admin Control Center</h1>
                <p className="text-sm text-white/90">Orchestrate events, coach judges, and spotlight standout teams.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
        <div className="mb-8 grid grid-cols-2 gap-4">
          {highlightMetrics.map((metric) => {
            const Icon = metric.icon

            return (
              <div
                key={metric.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${metric.bgColor === 'bg-emerald-50' ? 'from-emerald-200/60 via-emerald-100/40 to-transparent' : metric.bgColor === 'bg-primary/5' ? 'from-primary/25 via-primary/10 to-transparent' : 'from-sky-200/60 via-sky-100/40 to-transparent'}`} />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                    <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">{metric.label}</p>
                    <p className="mt-0.5 text-3xl font-semibold text-slate-900">{metric.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-8">
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
                value="accounts"
                className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
              >
                <Shield className="mr-2 h-5 w-5" />
                Accounts
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Events Recap
              </TabsTrigger>
            </TabsList>

            <div className="mt-10 space-y-10">
              <TabsContent value="events" className="space-y-8">
                <AdminEventsTab 
                  events={mockEvents}
                  recentActivity={recentActivity}
                  onCreateEvent={onCreateEvent}
                  onManageEvent={onManageEvent}
                />
              </TabsContent>

              <TabsContent value="accounts" className="space-y-8">
                <AdminAccountsTab accounts={mockAccounts} />
              </TabsContent>

              <TabsContent value="insights" className="space-y-8">
                <AdminEventsRecapTab eventHistory={eventHistoryData} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
