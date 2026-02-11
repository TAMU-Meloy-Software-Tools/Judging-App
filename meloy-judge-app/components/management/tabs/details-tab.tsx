"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TabsContent } from "@/components/ui/tabs"
import { Clock, MapPin, Edit, Save } from "lucide-react"

type EventType = "aggies-invent" | "problems-worth-solving"

interface DetailsTabProps {
  eventName: string
  setEventName: (value: string) => void
  eventType: EventType
  startDate: string
  setStartDate: (value: string) => void
  endDate: string
  setEndDate: (value: string) => void
  eventLocation: string
  setEventLocation: (value: string) => void
  eventDescription: string
  setEventDescription: (value: string) => void
  saving: boolean
  onSave: () => Promise<void>
}

const eventTypes = [
  { value: "aggies-invent", label: "Aggies Invent", logo: "/aggiesinvent.png" },
  { value: "problems-worth-solving", label: "Problems Worth Solving", logo: "/pws.png" },
]

export function DetailsTab({
  eventName,
  setEventName,
  eventType,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  eventLocation,
  setEventLocation,
  eventDescription,
  setEventDescription,
  saving,
  onSave,
}: DetailsTabProps) {
  return (
    <TabsContent value="details" className="space-y-6">
      <Card className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-b from-white to-slate-50 shadow-2xl p-0">
        <CardHeader className="relative overflow-hidden border-b-2 border-slate-100 bg-gradient-to-b from-primary to-[#3d0000] p-8 m-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Edit className="h-6 w-6 text-white" />
              </div>
              Event Information
            </CardTitle>
            <CardDescription className="text-base text-white/80 mt-2">
              Update the core details of your event
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="space-y-3">
            <Label htmlFor="event-name" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
              Event Name
            </Label>
            <Input
              id="event-name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="h-14 rounded-2xl border-2 border-slate-200 px-5 text-lg shadow-inner focus:border-primary/40 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">Event Type</Label>
            <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 p-6 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <div className="relative flex items-center justify-center">
                <div className="flex items-center justify-center rounded-2xl border-2 border-primary/10 bg-white p-6 shadow-md">
                  <Image
                    src={eventTypes.find(t => t.value === eventType)?.logo || ""}
                    alt={eventTypes.find(t => t.value === eventType)?.label || ""}
                    width={200}
                    height={100}
                    className="h-20 w-auto max-w-[280px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="start-date" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-14 rounded-2xl border-2 border-slate-200 px-5 text-lg shadow-inner focus:border-primary/40 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="end-date" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-14 rounded-2xl border-2 border-slate-200 px-5 text-lg shadow-inner focus:border-primary/40 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="event-location" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </Label>
            <Input
              id="event-location"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="e.g., Zachry Engineering Center"
              className="h-14 rounded-2xl border-2 border-slate-200 px-5 text-lg shadow-inner focus:border-primary/40 transition-colors"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="event-description" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
              Description
            </Label>
            <Textarea
              id="event-description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Describe your event..."
              className="min-h-32 rounded-2xl border-2 border-slate-200 px-5 py-4 text-lg shadow-inner focus:border-primary/40 transition-colors resize-none"
            />
          </div>
          
          <div className="flex justify-end pt-6 border-t-2 border-slate-100">
            <Button
              onClick={onSave}
              disabled={saving}
              className="h-14 rounded-2xl bg-gradient-to-b from-primary to-[#3d0000] px-10 text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Save className="mr-2 h-5 w-5" />
              {saving ? 'Saving...' : 'Save Details'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
