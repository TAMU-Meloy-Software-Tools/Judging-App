"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, User, Loader2 } from "lucide-react"
import { getJudgeProfiles, startJudgeSession } from "@/lib/api/auth"
import { setJudgeProfile } from "@/lib/judge-context"
import type { JudgeProfile } from "@/lib/types/api"

interface JudgeSelectionScreenProps {
  eventId: string
  eventName: string
  onSelectJudge: (judgeId: string, judgeName: string) => void
  onBack: () => void
}

export function JudgeSelectionScreen({ eventId, eventName, onSelectJudge, onBack }: JudgeSelectionScreenProps) {
  const [judges, setJudges] = useState<JudgeProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selecting, setSelecting] = useState<string | null>(null)

  // Mock sponsor data - replace with real data later
  const sponsor = { 
    name: "ExxonMobil", 
    logo: "/ExxonLogo.png",
    color: "#500000"
  }

  useEffect(() => {
    async function fetchJudgeProfiles() {
      try {
        setLoading(true)
        const response = await getJudgeProfiles(eventId)
        setJudges(response.profiles)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load judge profiles')
      } finally {
        setLoading(false)
      }
    }
    fetchJudgeProfiles()
  }, [eventId])

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
      <header className="relative z-30 overflow-hidden bg-linear-to-b from-primary to-[#3d0000]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <ArrowLeft className="h-7 w-7" />
              </Button>
              <div className="flex h-16 lg:h-20 w-auto items-center justify-center rounded-xl border border-white/25 bg-white/15 px-3 py-2 backdrop-blur-md">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Select Judge Profile</p>
                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">{eventName}</h1>
              </div>
            </div>

            {/* Company/Sponsor Card */}
            <div className="flex items-center gap-3 rounded-2xl border-2 border-red-950 bg-linear-to-b from-red-600 to-red-950 px-4 py-3 shadow-xl">
              <div 
                className="relative flex shrink-0 items-center justify-center rounded-xl py-2 px-4 shadow-lg bg-white/70 backdrop-blur-xl border-2 border-white/80"
              >
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={80}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.12em] text-white/80">Presented by</p>
                <p className="text-sm font-semibold text-white">{sponsor.name}</p>
              </div>
            </div>
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
