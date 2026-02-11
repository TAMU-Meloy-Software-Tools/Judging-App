"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, User, Loader2 } from "lucide-react"
import { getJudgeProfiles, startJudgeSession } from "@/lib/api/auth"
import { getEvent } from "@/lib/api/events"
import { setJudgeProfile } from "@/lib/judge-context"
import type { JudgeProfile, Event } from "@/lib/types/api"

interface JudgeSelectionScreenProps {
  eventId: string
  eventName: string
  onSelectJudge: (judgeId: string, judgeName: string) => void
  onBack: () => void
}

export function JudgeSelectionScreen({ eventId, eventName, onSelectJudge, onBack }: JudgeSelectionScreenProps) {
  const [judges, setJudges] = useState<JudgeProfile[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selecting, setSelecting] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [profilesResponse, eventData] = await Promise.all([
          getJudgeProfiles(eventId),
          getEvent(eventId)
        ])
        setJudges(profilesResponse.profiles)
        setEvent(eventData.event)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [eventId])

  // Get sponsor data with fallback logic
  const getSponsorData = () => {
    if (!event) return null
    
    const isPWSEvent = event.event_type?.includes("problems-worth-solving") ?? false
    
    return event.sponsor_id && event.sponsor ? {
      name: event.sponsor.name ?? "Sponsor",
      logo: event.sponsor.logo_url ?? (isPWSEvent ? "/TAMUlogo.png" : "/ExxonLogo.png"),
      primaryColor: event.sponsor.primary_color ?? (isPWSEvent ? "#500000" : "#b91c1c"),
      secondaryColor: event.sponsor.secondary_color ?? (isPWSEvent ? "#3d0000" : "#7f1d1d")
    } : {
      name: isPWSEvent ? "Meloy Program" : "ExxonMobil",
      logo: isPWSEvent ? "/TAMUlogo.png" : "/ExxonLogo.png",
      primaryColor: isPWSEvent ? "#500000" : "#b91c1c",
      secondaryColor: isPWSEvent ? "#3d0000" : "#7f1d1d"
    }
  }

  const sponsor = getSponsorData()

  const handleSelectJudge = async (profile: JudgeProfile) => {
    try {
      setSelecting(profile.id)
      
      // Store the judge profile in localStorage
      setJudgeProfile(profile)
      
      // Start the judge session
      await startJudgeSession(profile.id, eventId)
      
      // Call the parent callback
      onSelectJudge(profile.id, profile.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start judge session')
      setSelecting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-primary/5">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-slate-600">Loading judge profiles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-primary/5">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 lg:px-8">
          {/* Main Header Row - Always one line */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Side: Back Button + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-12 w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <ArrowLeft className="h-6 w-6 lg:h-7 lg:w-7" />
              </Button>
              <div className="flex h-14 sm:h-16 lg:h-20 xl:h-20 w-auto shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 px-2 sm:px-3 py-2 shadow-md backdrop-blur-md">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-10 sm:h-12 lg:h-14 xl:h-16 w-auto object-contain" />
              </div>
            </div>

            {/* Center: Event Title (hidden on mobile, shown on larger screens) */}
            <div className="hidden md:flex flex-col items-center flex-1 min-w-0 px-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Select Judge Profile</p>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-white leading-tight text-center truncate w-full">{eventName}</h1>
            </div>

            {/* Right Side: Sponsor Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="relative overflow-hidden rounded-xl lg:rounded-2xl border-2 border-red-950 shadow-xl">
                <div
                  className="relative rounded-[10px] lg:rounded-[14px] p-2 sm:p-3"
                  style={sponsor ? {
                    background: `linear-gradient(to bottom, ${sponsor.primaryColor}, ${sponsor.secondaryColor})`
                  } : undefined}
                >
                  <div className="relative flex shrink-0 items-center justify-center rounded-lg py-2 px-4 sm:py-3 sm:px-5 shadow-xl backdrop-blur-xl bg-white/70 border-2 border-white/80">
                    <Image
                      src={sponsor?.logo ?? "/TAMUlogo.png"}
                      alt={sponsor?.name ?? "Sponsor"}
                      width={100}
                      height={50}
                      className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Event Title - Centered Below */}
          <div className="md:hidden mt-3 flex flex-col items-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Select Judge Profile</p>
            <h1 className="text-lg font-semibold text-white leading-tight">{eventName}</h1>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-6 py-8 lg:py-10 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Choose Your Judge Profile</h2>
          <p className="text-base text-slate-600 mt-2">
            Select which judge profile you'll be using for this event. Your name will be displayed throughout the judging process.
          </p>
        </div>

        {judges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600">No judge profiles found for this event.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {judges.map((judge) => (
              <Card
                key={judge.id}
                className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-200/70 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => !selecting && handleSelectJudge(judge)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 transition-all group-hover:from-primary/30 group-hover:to-primary/20">
                    {selecting === judge.id ? (
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    ) : (
                      <User className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{judge.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
