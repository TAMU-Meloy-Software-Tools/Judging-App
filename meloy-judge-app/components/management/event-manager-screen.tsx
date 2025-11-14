"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Clock,
  Edit,
  Trash2,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

interface EventManagerScreenProps {
  eventId: string
  onBack: () => void
  onSave: () => void
}

type EventType = "aggies-invent" | "problems-worth-solving"

interface Judge {
  id: string
  name: string
  email: string
  teamsAssigned: number
}

interface TeamMember {
  id: string
  name: string
  email: string
}

interface Team {
  id: string
  name: string
  members: TeamMember[]
  tableNumber: string
  judgeAssigned: string | null
}

export function EventManagerScreen({ eventId, onBack, onSave }: EventManagerScreenProps) {
  // Event Details State
  const [eventName, setEventName] = useState("Aggies Invent Spring 2025")
  const [eventType, setEventType] = useState<EventType>("aggies-invent")
  const [eventDuration, setEventDuration] = useState("March 15-17, 2025")
  const [eventLocation, setEventLocation] = useState("Zachry Engineering Center")
  const [eventDescription, setEventDescription] = useState(
    "A 48-hour invention competition where students collaborate to solve real-world challenges."
  )

  // Sponsor State
  const [sponsorName, setSponsorName] = useState("Texas A&M Engineering")
  const [sponsorLogo, setSponsorLogo] = useState<string | null>("/TAMUlogo.png")
  const [primaryColor, setPrimaryColor] = useState("#500000")
  const [secondaryColor, setSecondaryColor] = useState("#FFFFFF")

  // Judges State
  const [judges, setJudges] = useState<Judge[]>([
    { id: "1", name: "Dr. Sarah Johnson", email: "sjohnson@tamu.edu", teamsAssigned: 3 },
    { id: "2", name: "Prof. Michael Chen", email: "mchen@tamu.edu", teamsAssigned: 3 },
    { id: "3", name: "Dr. Emily Rodriguez", email: "erodriguez@tamu.edu", teamsAssigned: 2 },
  ])
  const [newJudgeName, setNewJudgeName] = useState("")
  const [newJudgeEmail, setNewJudgeEmail] = useState("")

  // Teams State
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "1",
      name: "Team Alpha",
      members: [
        { id: "1", name: "John Doe", email: "john@tamu.edu" },
        { id: "2", name: "Jane Smith", email: "jane@tamu.edu" },
      ],
      tableNumber: "A-12",
      judgeAssigned: "1",
    },
    {
      id: "2",
      name: "Team Beta",
      members: [
        { id: "3", name: "Bob Wilson", email: "bob@tamu.edu" },
        { id: "4", name: "Alice Brown", email: "alice@tamu.edu" },
      ],
      tableNumber: "A-13",
      judgeAssigned: "1",
    },
  ])
  const [newTeamName, setNewTeamName] = useState("")
  const [newTableNumber, setNewTableNumber] = useState("")
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [tempMembers, setTempMembers] = useState<TeamMember[]>([])
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)

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
      setJudges([...judges, { id: Date.now().toString(), name: newJudgeName, email: newJudgeEmail, teamsAssigned: 0 }])
      setNewJudgeName("")
      setNewJudgeEmail("")
    }
  }

  const removeJudge = (id: string) => {
    setJudges(judges.filter((judge) => judge.id !== id))
    // Unassign teams from this judge
    setTeams(teams.map((team) => (team.judgeAssigned === id ? { ...team, judgeAssigned: null } : team)))
  }

  const addMemberToTemp = () => {
    if (newMemberName && newMemberEmail) {
      setTempMembers([...tempMembers, { id: Date.now().toString(), name: newMemberName, email: newMemberEmail }])
      setNewMemberName("")
      setNewMemberEmail("")
    }
  }

  const removeMemberFromTemp = (id: string) => {
    setTempMembers(tempMembers.filter((member) => member.id !== id))
  }

  const addTeam = () => {
    if (newTeamName && tempMembers.length > 0) {
      setTeams([
        ...teams,
        {
          id: Date.now().toString(),
          name: newTeamName,
          members: tempMembers,
          tableNumber: newTableNumber,
          judgeAssigned: null,
        },
      ])
      setNewTeamName("")
      setNewTableNumber("")
      setTempMembers([])
    }
  }

  const removeTeam = (id: string) => {
    setTeams(teams.filter((team) => team.id !== id))
  }

  const assignJudgeToTeam = (teamId: string, judgeId: string) => {
    setTeams(teams.map((team) => (team.id === teamId ? { ...team, judgeAssigned: judgeId } : team)))
  }

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving event changes...")
    onSave()
  }

  const getJudgeName = (judgeId: string | null) => {
    if (!judgeId) return "Unassigned"
    return judges.find((j) => j.id === judgeId)?.name || "Unknown"
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl overflow-hidden">
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
                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">Event Manager</h1>
                <p className="text-sm text-white/90">Manage all aspects of your event in one place</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              className="h-11 rounded-xl bg-white px-5 lg:px-6 text-base font-semibold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Save className="mr-2 h-5 w-5" />
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
        {/* Event Status Banner */}
        <Card className="mb-8 overflow-hidden rounded-[28px] border-none bg-linear-to-br from-primary/95 via-primary/90 to-[#3d0000] text-white shadow-2xl">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10 bg-white/10 blur-2xl" />
          <CardHeader className="relative p-8 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-3 w-fit rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white">
                  Currently Managing
                </Badge>
                <CardTitle className="text-3xl font-semibold">{eventName}</CardTitle>
                <CardDescription className="mt-2 text-base text-white/80">{eventDescription}</CardDescription>
              </div>
              <Badge className="shrink-0 rounded-full border border-emerald-200/30 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative flex flex-wrap gap-6 p-8 pt-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
              <Calendar className="h-5 w-5" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Event Date</p>
                <p className="text-lg font-semibold">{eventDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
              <MapPin className="h-5 w-5" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Location</p>
                <p className="text-lg font-semibold">{eventLocation}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
              <Users className="h-5 w-5" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Teams</p>
                <p className="text-lg font-semibold">{teams.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4">
              <Award className="h-5 w-5" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Judges</p>
                <p className="text-lg font-semibold">{judges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid h-16 w-full grid-cols-4 rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-lg backdrop-blur">
            <TabsTrigger
              value="details"
              className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <Edit className="mr-2 h-5 w-5" />
              Details
            </TabsTrigger>
            <TabsTrigger
              value="sponsor"
              className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <Building2 className="mr-2 h-5 w-5" />
              Sponsor
            </TabsTrigger>
            <TabsTrigger
              value="judges"
              className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <Award className="mr-2 h-5 w-5" />
              Judges
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <Users className="mr-2 h-5 w-5" />
              Teams
            </TabsTrigger>
          </TabsList>

          <div className="mt-10 space-y-8">
            {/* Event Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-sm">
                <CardHeader className="border-b border-slate-100 bg-linear-to-br from-slate-50 to-white p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                    <Edit className="h-6 w-6 text-primary" />
                    Event Information
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600">
                    Update the core details of your event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="space-y-3">
                    <Label htmlFor="event-name" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                      Event Name
                    </Label>
                    <Input
                      id="event-name"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">Event Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {eventTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setEventType(type.value as EventType)}
                          className={`group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                            eventType === type.value
                              ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/30"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <Image
                              src={type.logo}
                              alt={type.label}
                              width={200}
                              height={80}
                              className={`object-contain transition-all duration-300 ${
                                eventType === type.value ? "grayscale-0" : "grayscale group-hover:grayscale-0"
                              }`}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="event-duration" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                        <Clock className="mr-2 inline h-4 w-4" />
                        Event Duration
                      </Label>
                      <Input
                        id="event-duration"
                        value={eventDuration}
                        onChange={(e) => setEventDuration(e.target.value)}
                        placeholder="e.g., March 15-17, 2025"
                        className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="event-location" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                        <MapPin className="mr-2 inline h-4 w-4" />
                        Location
                      </Label>
                      <Input
                        id="event-location"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="e.g., Zachry Engineering Center"
                        className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="event-description" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                      Description
                    </Label>
                    <Textarea
                      id="event-description"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      placeholder="Describe your event..."
                      className="min-h-[120px] rounded-xl border-slate-200 px-4 py-3 text-lg shadow-inner"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sponsor Tab */}
            <TabsContent value="sponsor" className="space-y-6">
              <Card className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-sm">
                <CardHeader className="border-b border-slate-100 bg-linear-to-br from-slate-50 to-white p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                    <Building2 className="h-6 w-6 text-primary" />
                    Title Sponsor
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600">
                    Manage sponsor branding and appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="space-y-3">
                    <Label htmlFor="sponsor-name" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                      Sponsor Name
                    </Label>
                    <Input
                      id="sponsor-name"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                      <Upload className="mr-2 inline h-4 w-4" />
                      Sponsor Logo
                    </Label>
                    <div className="flex items-center gap-6">
                      {sponsorLogo && (
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 p-4 shadow-inner">
                          <Image src={sponsorLogo} alt="Sponsor Logo" width={96} height={96} className="h-full w-full object-contain" />
                        </div>
                      )}
                      <Label
                        htmlFor="logo-upload"
                        className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-4 transition-all hover:border-primary/40 hover:bg-primary/5"
                      >
                        <Upload className="h-5 w-5 text-primary" />
                        <span className="text-base font-semibold text-slate-700">
                          {sponsorLogo ? "Change Logo" : "Upload Logo"}
                        </span>
                        <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </Label>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="primary-color" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
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
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="h-12 flex-1 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="secondary-color" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
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
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="h-12 flex-1 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Live Preview</p>
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
            </TabsContent>

            {/* Judges Tab */}
            <TabsContent value="judges" className="space-y-6">
              <Card className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-sm">
                <CardHeader className="border-b border-slate-100 bg-linear-to-br from-slate-50 to-white p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                    <UserPlus className="h-6 w-6 text-primary" />
                    Add New Judge
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600">Invite judges to evaluate team projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="judge-name" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                        Judge Name
                      </Label>
                      <Input
                        id="judge-name"
                        value={newJudgeName}
                        onChange={(e) => setNewJudgeName(e.target.value)}
                        placeholder="e.g., Dr. Jane Smith"
                        className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="judge-email" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                        Email Address
                      </Label>
                      <Input
                        id="judge-email"
                        type="email"
                        value={newJudgeEmail}
                        onChange={(e) => setNewJudgeEmail(e.target.value)}
                        placeholder="jsmith@example.com"
                        className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={addJudge}
                    className="h-12 w-full rounded-xl bg-primary text-base font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl md:w-auto md:px-8"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Judge
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-slate-800">
                  Current Judges <span className="text-primary">({judges.length})</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {judges.map((judge) => (
                    <Card
                      key={judge.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl font-semibold text-slate-800 transition-colors group-hover:text-primary">
                              {judge.name}
                            </CardTitle>
                            <CardDescription className="mt-2 flex items-center gap-2 text-base text-slate-600">
                              <Mail className="h-4 w-4" />
                              {judge.email}
                            </CardDescription>
                            <div className="mt-3 flex items-center gap-2">
                              <Badge className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                {judge.teamsAssigned} teams assigned
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeJudge(judge.id)}
                            className="h-10 w-10 shrink-0 rounded-xl p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="space-y-6">
              <Card className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-sm">
                <CardHeader className="border-b border-slate-100 bg-linear-to-br from-slate-50 to-white p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                    <Plus className="h-6 w-6 text-primary" />
                    Add New Team
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600">Register teams competing in this event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="team-name" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                        Team Name
                      </Label>
                      <Input
                        id="team-name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="e.g., Team Phoenix"
                        className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="table-number" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                        Table Number
                      </Label>
                      <Input
                        id="table-number"
                        value={newTableNumber}
                        onChange={(e) => setNewTableNumber(e.target.value)}
                        placeholder="e.g., A-15"
                        className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">Team Members</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="Member name"
                        className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                      />
                      <Input
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="Member email"
                        className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                      />
                    </div>
                    <Button
                      onClick={addMemberToTemp}
                      variant="outline"
                      className="h-11 rounded-xl border-slate-200 px-5 text-base font-semibold"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>

                    {tempMembers.length > 0 && (
                      <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Team Members</p>
                        {tempMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <div>
                              <p className="font-semibold text-slate-800">{member.name}</p>
                              <p className="text-sm text-slate-600">{member.email}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMemberFromTemp(member.id)}
                              className="h-8 w-8 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={addTeam}
                    disabled={!newTeamName || tempMembers.length === 0}
                    className="h-12 w-full rounded-xl bg-primary text-base font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 md:w-auto md:px-8"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Team
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-slate-800">
                  Registered Teams <span className="text-primary">({teams.length})</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {teams.map((team) => (
                    <Card
                      key={team.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl font-semibold text-slate-800 transition-colors group-hover:text-primary">
                                {team.name}
                              </CardTitle>
                              {team.tableNumber && (
                                <Badge className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                  {team.tableNumber}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Members</p>
                              <div className="space-y-1">
                                {team.members.map((member) => (
                                  <p key={member.id} className="text-sm text-slate-600">
                                    • {member.name}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Assigned Judge</p>
                              <p className="mt-1 text-sm text-slate-700">{getJudgeName(team.judgeAssigned)}</p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTeam(team.id)}
                            className="h-10 w-10 shrink-0 rounded-xl p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
