"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, BarChart3, Download, ChevronLeft, ChevronRight } from "lucide-react"

interface Judge {
  name: string
  communication: number
  fundBuy: number
  presentation: number
  cohesion: number
}

interface Team {
  name: string
  judges: Judge[]
  avgTime: number
}

interface EventHistory {
  name: string
  date: string
  status: "completed"
  teams: Team[]
}

interface AdminEventsRecapTabProps {
  eventHistory: EventHistory[]
}

export function AdminEventsRecapTab({ eventHistory }: AdminEventsRecapTabProps) {
  const [selectedEventIndex, setSelectedEventIndex] = useState(0)
  const [timelineRange, setTimelineRange] = useState<"6months" | "1year" | "2years" | "all">("1year")

  const event = eventHistory[selectedEventIndex]

  return (
    <div className="space-y-8">
      {/* Timeline Range Selector */}
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Timeline Range:</span>
          <div className="flex gap-2">
            {[
              { value: "6months" as const, label: "6 Months" },
              { value: "1year" as const, label: "1 Year" },
              { value: "2years" as const, label: "2 Years" },
              { value: "all" as const, label: "All Time" },
            ].map((option) => (
              <Button
                key={option.value}
                onClick={() => setTimelineRange(option.value)}
                className={`h-9 rounded-xl px-4 text-sm font-semibold transition-all ${
                  timelineRange === option.value
                    ? "bg-primary text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200/80 bg-linear-to-b from-primary to-[#3d0000] shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative p-6">
          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Events Timeline</h4>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedEventIndex(Math.max(0, selectedEventIndex - 1))}
                disabled={selectedEventIndex === 0}
                className="h-10 w-10 rounded-xl border-2 border-white/30 bg-white/10 p-0 text-white shadow-md backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setSelectedEventIndex(Math.min(eventHistory.length - 1, selectedEventIndex + 1))}
                disabled={selectedEventIndex === eventHistory.length - 1}
                className="h-10 w-10 rounded-xl border-2 border-white/30 bg-white/10 p-0 text-white shadow-md backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:bg-white/10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Timeline Track */}
          <div className="relative overflow-x-auto pb-6 pt-4">
            <div className="flex items-center gap-4 px-4">
              {/* Timeline Line */}
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-linear-to-r from-white/20 via-white/40 to-white/20" />
            
              {/* Event Markers */}
              {eventHistory.map((evt, index) => (
                <div
                  key={index}
                  className="relative z-10 flex min-w-[200px] flex-col items-center gap-3"
                >
                  {/* Event Icon */}
                  <button
                    onClick={() => setSelectedEventIndex(index)}
                    className={`group flex h-16 w-16 items-center justify-center rounded-full border-4 shadow-xl transition-all duration-300 ${
                      selectedEventIndex === index
                        ? "border-white bg-white/90 scale-110 -translate-y-1"
                        : "border-white/60 bg-white/20 backdrop-blur-sm hover:scale-105 hover:-translate-y-0.5 hover:bg-white/30"
                    }`}
                  >
                    <Calendar className={`h-7 w-7 transition-colors ${
                      selectedEventIndex === index ? "text-primary" : "text-white/80 group-hover:text-white"
                    }`} />
                  </button>
                  
                  {/* Event Info */}
                  <div className="text-center">
                    <div className={`text-sm font-bold transition-colors ${
                      selectedEventIndex === index ? "text-white" : "text-white/80"
                    }`}>
                      {evt.name.split(" ").slice(0, 2).join(" ")}
                    </div>
                    <div className={`text-xs ${
                      selectedEventIndex === index ? "text-white/90" : "text-white/60"
                    }`}>
                      {evt.date}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {selectedEventIndex === index && (
                    <div className="absolute -bottom-2 h-2 w-2 animate-pulse rounded-full bg-white shadow-lg" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail View */}
      <Card className="relative overflow-hidden rounded-4xl border-2 border-slate-200/80 bg-white shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-primary via-rose-400 to-orange-300" />
        
        <CardHeader className="relative border-b border-slate-100 bg-linear-to-br from-slate-50/80 via-white to-slate-50/50 p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-rose-600 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {event.name}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2 text-base text-slate-600">
                    <Calendar className="h-4 w-4" />
                    {event.date}
                  </CardDescription>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="h-11 rounded-xl border-2 border-primary/30 bg-linear-to-br from-primary/10 to-primary/20 px-5 text-sm font-bold text-primary shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-b from-primary to-[#3d0000]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
              
              <div className="relative">
                {event.teams.map((team, teamIndex) => {
                  const totalCommunication = team.judges.reduce((sum, j) => sum + j.communication, 0)
                  const totalFundBuy = team.judges.reduce((sum, j) => sum + j.fundBuy, 0)
                  const totalPresentation = team.judges.reduce((sum, j) => sum + j.presentation, 0)
                  const totalCohesion = team.judges.reduce((sum, j) => sum + j.cohesion, 0)
                  const grandTotal = totalCommunication + totalFundBuy + totalPresentation + totalCohesion
                  const percentage = ((grandTotal / 400) * 100).toFixed(1)

                  return (
                    <div key={teamIndex} className={`${teamIndex !== 0 ? 'border-t-2 border-white/20' : ''}`}>
                      {/* Team Header */}
                      <div className="bg-white/10 px-8 py-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xl font-bold text-white">{team.name}</h4>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Total Score</div>
                              <div className="text-2xl font-bold text-white">{grandTotal}/400</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Percentage</div>
                              <div className="text-2xl font-bold text-emerald-300">{percentage}%</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Time</div>
                              <div className="text-2xl font-bold text-sky-300">{team.avgTime}m</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Judges Table */}
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-8 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white/80">
                              Judge
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white/80">
                              Communication
                              <div className="text-xs font-normal text-white/50">/25</div>
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white/80">
                              Fund/Buy
                              <div className="text-xs font-normal text-white/50">/25</div>
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white/80">
                              Presentation
                              <div className="text-xs font-normal text-white/50">/25</div>
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white/80">
                              Cohesion
                              <div className="text-xs font-normal text-white/50">/25</div>
                            </th>
                            <th className="px-8 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white/80">
                              Judge Total
                              <div className="text-xs font-normal text-white/50">/100</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {team.judges.map((judge, judgeIndex) => {
                            const judgeTotal = judge.communication + judge.fundBuy + judge.presentation + judge.cohesion
                            return (
                              <tr key={judgeIndex} className="transition-colors hover:bg-white/5">
                                <td className="px-8 py-4 text-base font-semibold text-white/90">
                                  {judge.name}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="text-lg font-bold text-white">{judge.communication}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="text-lg font-bold text-white">{judge.fundBuy}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="text-lg font-bold text-white">{judge.presentation}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="text-lg font-bold text-white">{judge.cohesion}</div>
                                </td>
                                <td className="px-8 py-4 text-center">
                                  <div className="text-xl font-bold text-amber-300">{judgeTotal}</div>
                                </td>
                              </tr>
                            )
                          })}
                          {/* Category Totals Row */}
                          <tr className="border-t-2 border-white/30 bg-white/10">
                            <td className="px-8 py-4 text-base font-bold uppercase tracking-wide text-white">
                              Category Total
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-xl font-bold text-white">{totalCommunication}</div>
                              <div className="text-xs text-white/60">/100</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-xl font-bold text-white">{totalFundBuy}</div>
                              <div className="text-xs text-white/60">/100</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-xl font-bold text-white">{totalPresentation}</div>
                              <div className="text-xs text-white/60">/100</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-xl font-bold text-white">{totalCohesion}</div>
                              <div className="text-xs text-white/60">/100</div>
                            </td>
                            <td className="px-8 py-4 text-center">
                              <div className="text-2xl font-bold text-emerald-300">{grandTotal}</div>
                              <div className="text-xs text-emerald-300/80">/400</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
