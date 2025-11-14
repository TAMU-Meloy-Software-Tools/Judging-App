"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Award,
  Palette,
  Upload,
  Plus,
  X,
  Users,
  Mail,
  Sparkles,
  Save,
  Building2,
} from "lucide-react"

interface EventCreationScreenProps {
  onBack: () => void
  onCreateEvent: (eventId?: string) => void
}

type EventType = "aggies-invent" | "problems-worth-solving"

interface Judge {
  id: string
  name: string
  email: string
}

interface TeamMember {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
  members: TeamMember[]
}

export function EventCreationScreen({ onBack, onCreateEvent }: EventCreationScreenProps) {
  const [eventName, setEventName] = useState("")
  const [eventType, setEventType] = useState<EventType>("aggies-invent")
  const [sponsorName, setSponsorName] = useState("")
  const [sponsorLogo, setSponsorLogo] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState("#500000")
  const [secondaryColor, setSecondaryColor] = useState("#FFFFFF")
  const [eventDuration, setEventDuration] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventDescription, setEventDescription] = useState("")

  const [judges, setJudges] = useState<Judge[]>([])
  const [newJudgeName, setNewJudgeName] = useState("")
  const [newJudgeEmail, setNewJudgeEmail] = useState("")

  const [teams, setTeams] = useState<Team[]>([])
  const [newTeamName, setNewTeamName] = useState("")
  const [newMemberName, setNewMemberName] = useState("")
  const [tempMembers, setTempMembers] = useState<TeamMember[]>([])

  const eventTypes = [
    { value: "aggies-invent", label: "Aggies Invent", logo: "/aggiesinvent.png" },
    { value: "problems-worth-solving", label: "Problems Worth Solving", logo: "/pws.png" },
  ]

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSponsorLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addJudge = () => {
    if (newJudgeName && newJudgeEmail) {
      setJudges([...judges, { id: Date.now().toString(), name: newJudgeName, email: newJudgeEmail }])
      setNewJudgeName("")
      setNewJudgeEmail("")
    }
  }

  const removeJudge = (id: string) => {
    setJudges(judges.filter((judge) => judge.id !== id))
  }

  const addMemberToTemp = () => {
    if (newMemberName) {
      setTempMembers([...tempMembers, { id: Date.now().toString(), name: newMemberName }])
      setNewMemberName("")
    }
  }

  const removeMemberFromTemp = (id: string) => {
    setTempMembers(tempMembers.filter((member) => member.id !== id))
  }

  const addTeam = () => {
    if (newTeamName && tempMembers.length > 0) {
      setTeams([...teams, { id: Date.now().toString(), name: newTeamName, members: [...tempMembers] }])
      setNewTeamName("")
      setTempMembers([])
    }
  }

  const removeTeam = (id: string) => {
    setTeams(teams.filter((team) => team.id !== id))
  }

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log({
      eventName,
      eventType,
      sponsorName,
      sponsorLogo,
      primaryColor,
      secondaryColor,
      eventDuration,
      eventLocation,
      eventDescription,
      judges,
      teams,
    })
    // Generate a temporary event ID (in production, this would come from backend)
    const newEventId = Date.now().toString()
    onCreateEvent(newEventId)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-16 lg:h-20 w-auto items-center justify-center rounded-xl border border-white/25 bg-white/15 px-3 py-2 shadow-md backdrop-blur-md">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">
                  Launch New Event
                </h1>
                <p className="text-sm text-white/85">Configure the foundation for your next judging cohort.</p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white sm:flex">
              <Sparkles className="h-3.5 w-3.5" />
              Draft Mode
            </Badge>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
        <div className="space-y-10">
          {/* Event Details Section */}
          <Card className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-70" />
            <CardHeader className="p-8 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                <Calendar className="h-6 w-6 text-primary" />
                Event Details
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Capture the core attributes that define your event experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8 pt-0">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event-name" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Event Name
                  </Label>
                  <Input
                    id="event-name"
                    placeholder="e.g., Aggies Invent Spring 2025"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-inner focus-visible:border-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Event Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {eventTypes.map((type) => {
                      return (
                        <button
                          key={type.value}
                          onClick={() => setEventType(type.value as EventType)}
                          className={`flex items-center justify-center rounded-xl border-2 p-6 transition-all ${
                            eventType === type.value
                              ? "border-primary/50 bg-primary/10 shadow-md"
                              : "border-slate-200 bg-white hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          <Image
                            src={type.logo}
                            alt={type.label}
                            width={180}
                            height={60}
                            className="object-contain"
                            style={{
                              filter: eventType === type.value 
                                ? "none"
                                : "grayscale(100%) opacity(0.5)",
                            }}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event-duration" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Event Duration
                  </Label>
                  <Input
                    id="event-duration"
                    type="text"
                    placeholder="e.g., March 15-17, 2025"
                    value={eventDuration}
                    onChange={(e) => setEventDuration(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-inner focus-visible:border-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-location" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Event Location
                  </Label>
                  <Input
                    id="event-location"
                    placeholder="e.g., Zachry Engineering Center"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-inner focus-visible:border-primary/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Event Description
                </Label>
                <Textarea
                  id="event-description"
                  placeholder="Provide a brief overview of what this event is about..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={4}
                  className="rounded-xl border-slate-200 bg-white px-4 text-base shadow-inner focus-visible:border-primary/60"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sponsor Branding Section */}
          <Card className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-70" />
            <CardHeader className="p-8 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                <Building2 className="h-6 w-6 text-primary" />
                Title Sponsor
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Customize the event identity with sponsor branding and color themes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8 pt-0">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sponsor-name" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Sponsor Name
                  </Label>
                  <Input
                    id="sponsor-name"
                    placeholder="e.g., Texas A&M Engineering"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-inner focus-visible:border-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sponsor-logo" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Sponsor Logo
                  </Label>
                  <div className="flex items-center gap-4">
                    {sponsorLogo ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-inner">
                        <Image src={sponsorLogo} alt="Sponsor logo" fill className="object-contain p-2" />
                        <button
                          onClick={() => setSponsorLogo(null)}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-lg hover:bg-destructive/90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                    <Label
                      htmlFor="sponsor-logo"
                      className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Upload className="h-4 w-4" />
                      {sponsorLogo ? "Replace Logo" : "Upload Logo"}
                      <Input
                        id="sponsor-logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary-color" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Palette className="mr-2 inline h-4 w-4" />
                    Primary Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-12 w-20 cursor-pointer rounded-xl border-slate-200 p-1 shadow-inner"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-12 flex-1 rounded-xl border-slate-200 bg-white px-4 text-lg shadow-inner focus-visible:border-primary/60"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <Palette className="mr-2 inline h-4 w-4" />
                    Secondary Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-12 w-20 cursor-pointer rounded-xl border-slate-200 p-1 shadow-inner"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-12 flex-1 rounded-xl border-slate-200 bg-white px-4 text-lg shadow-inner focus-visible:border-primary/60"
                    />
                  </div>
                </div>
              </div>

              {/* Live Gradient Preview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Live Preview</p>
                <div
                  className="flex h-32 items-center justify-center rounded-xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  {sponsorLogo && (
                    <div className="rounded-lg bg-white/95 p-4 shadow-xl backdrop-blur-sm">
                      <Image src={sponsorLogo} alt="Preview" width={120} height={60} className="object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Judge Creation Section */}
          <Card className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-70" />
            <CardHeader className="p-8 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                <Users className="h-6 w-6 text-primary" />
                Judge Creation
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Add judges who will evaluate teams during this event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8 pt-0">
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="judge-name" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Judge Name
                  </Label>
                  <Input
                    id="judge-name"
                    placeholder="e.g., Dr. Sarah Johnson"
                    value={newJudgeName}
                    onChange={(e) => setNewJudgeName(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-inner focus-visible:border-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="judge-email" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Email Address
                  </Label>
                  <Input
                    id="judge-email"
                    type="email"
                    placeholder="judge@example.com"
                    value={newJudgeEmail}
                    onChange={(e) => setNewJudgeEmail(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-inner focus-visible:border-primary/60"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addJudge}
                    className="h-12 rounded-xl bg-primary px-6 text-base font-semibold shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add
                  </Button>
                </div>
              </div>

              {judges.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Added Judges ({judges.length})
                  </p>
                  <div className="space-y-3">
                    {judges.map((judge) => (
                      <div
                        key={judge.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/70 px-5 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-slate-900">{judge.name}</p>
                            <p className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="h-3 w-3" />
                              {judge.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeJudge(judge.id)}
                          className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 py-12 text-center">
                  <Users className="mb-4 h-12 w-12 text-slate-300" />
                  <p className="text-base font-semibold text-slate-600">No judges added yet</p>
                  <p className="text-sm text-slate-500">Add judges using the form above</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Creation Section */}
          <Card className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-70" />
            <CardHeader className="p-8 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                <Award className="h-6 w-6 text-primary" />
                Team Creation
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                Register teams and their members who will compete in this event.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8 pt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Team Name
                  </Label>
                  <Input
                    id="team-name"
                    placeholder="e.g., Team Alpha"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-inner focus-visible:border-primary/60"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-6">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Team Members</p>
                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <Input
                      placeholder="Enter member name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addMemberToTemp()
                        }
                      }}
                      className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-inner focus-visible:border-primary/60"
                    />
                    <Button
                      onClick={addMemberToTemp}
                      variant="outline"
                      className="h-12 rounded-xl border-slate-200 px-6 text-base font-semibold"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Add Member
                    </Button>
                  </div>

                  {tempMembers.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tempMembers.map((member) => (
                        <Badge
                          key={member.id}
                          className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
                        >
                          {member.name}
                          <button
                            onClick={() => removeMemberFromTemp(member.id)}
                            className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>

                <Button
                  onClick={addTeam}
                  disabled={!newTeamName || tempMembers.length === 0}
                  className="h-12 w-full rounded-xl bg-primary px-6 text-base font-semibold shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Team
                </Button>
              </div>

              {teams.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Added Teams ({teams.length})
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-70" />
                        <div className="p-5">
                          <div className="mb-3 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Award className="h-5 w-5 text-primary" />
                              </div>
                              <h4 className="text-lg font-semibold text-slate-900">{team.name}</h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTeam(team.id)}
                              className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {team.members.map((member) => (
                              <Badge
                                key={member.id}
                                variant="secondary"
                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                              >
                                {member.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 py-12 text-center">
                  <Award className="mb-4 h-12 w-12 text-slate-300" />
                  <p className="text-base font-semibold text-slate-600">No teams added yet</p>
                  <p className="text-sm text-slate-500">Create your first team above</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={onBack}
              className="h-14 flex-1 rounded-2xl border-2 border-slate-300 text-lg font-semibold text-slate-600 hover:border-primary/40 hover:bg-primary/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="h-14 flex-1 rounded-2xl bg-primary text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
            >
              <Save className="mr-2 h-6 w-6" />
              Create Event
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
