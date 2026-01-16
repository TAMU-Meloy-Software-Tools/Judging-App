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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  User,
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
  const [sponsorName, setSponsorName] = useState("Meloy Program")
  const [sponsorLogo, setSponsorLogo] = useState<string | null>("/TAMUlogo.png")
  const [primaryColor, setPrimaryColor] = useState("#500000")
  const [secondaryColor, setSecondaryColor] = useState("#FFFFFF")
  const [textColor, setTextColor] = useState("#FFFFFF")

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
      judgeAssigned: "1",
    },
    {
      id: "2",
      name: "Team Beta",
      members: [
        { id: "3", name: "Bob Wilson", email: "bob@tamu.edu" },
        { id: "4", name: "Alice Brown", email: "alice@tamu.edu" },
      ],
      judgeAssigned: "1",
    },
  ])
  const [newTeamName, setNewTeamName] = useState("")
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [tempMembers, setTempMembers] = useState<TeamMember[]>([])
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)

  // PWS Student State
  const [newStudentName, setNewStudentName] = useState("")
  const [newStudentEmail, setNewStudentEmail] = useState("")
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Determine if event is PWS (individual students) or team-based
  const isPWSEvent = eventType === "problems-worth-solving"
  const participantLabel = isPWSEvent ? "Student" : "Team"
  const participantsLabel = isPWSEvent ? "Students" : "Teams"

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
          judgeAssigned: null,
        },
      ])
      setNewTeamName("")
      setTempMembers([])
    }
  }

  // For PWS: Add individual student (creates a "team" with 1 member)
  const addStudent = () => {
    if (newStudentName && newStudentEmail) {
      setTeams([
        ...teams,
        {
          id: Date.now().toString(),
          name: newStudentName,
          members: [{ id: Date.now().toString(), name: newStudentName, email: newStudentEmail }],
          judgeAssigned: null,
        },
      ])
      setNewStudentName("")
      setNewStudentEmail("")
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

  const handleExitAttempt = () => {
    setShowExitDialog(true)
  }

  const confirmExit = () => {
    setShowExitDialog(false)
    onBack()
  }

  const handleDeleteEvent = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    console.log('Deleting event...')
    setShowDeleteDialog(false)
    onBack()
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative z-30 border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <Button
                variant="ghost"
                onClick={handleExitAttempt}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <ArrowLeft className="h-7 w-7" />
              </Button>
              <div className="flex h-16 lg:h-20 w-auto items-center justify-center rounded-xl border border-white/25 bg-white/15 px-3 py-2 shadow-md backdrop-blur-md">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">Event Manager</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* User Profile */}
              <div className="hidden sm:flex items-center gap-3 rounded-full border-2 border-white/30 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white leading-tight">Dr. Sarah Johnson</span>
                  <span className="text-xs text-white/70">Admin</span>
                </div>
              </div>
              
              <Button
                onClick={handleDeleteEvent}
                variant="ghost"
                className="h-11 rounded-xl border-2 border-white/30 bg-red-600/20 px-5 lg:px-6 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-600 hover:text-white hover:border-white/50"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Delete Event
              </Button>
              <Button
                onClick={handleSave}
                className="h-11 rounded-xl bg-white px-5 lg:px-6 text-base font-semibold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/95"
              >
                <Save className="mr-2 h-5 w-5" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
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
                    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-linear-to-br from-white to-primary/5 p-4 shadow-lg w-fit">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                      <div className="relative flex items-center justify-center">
                        <div className="flex items-center justify-center rounded-2xl border-2 border-primary/10 bg-white p-4 shadow-md">
                          <Image
                            src={eventTypes.find(t => t.value === eventType)?.logo || ""}
                            alt={eventTypes.find(t => t.value === eventType)?.label || ""}
                            width={200}
                            height={100}
                            className="h-16 w-auto max-w-[280px] object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hidden event type selector for reference
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
                  */}

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

                  <div className="grid gap-6 md:grid-cols-3">
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

                    <div className="space-y-3">
                      <Label htmlFor="text-color" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                        <Palette className="mr-2 inline h-4 w-4" />
                        Text Color
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="text-color"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="h-12 w-20 cursor-pointer rounded-xl border-slate-200 p-1 shadow-inner"
                        />
                        <Input
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="h-12 flex-1 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Live Preview</p>
                    <div className="relative overflow-hidden rounded-3xl border-2 border-red-950 shadow-xl">
                      <div 
                        className="relative rounded-[22px] py-4 px-5 lg:py-5 lg:px-6"
                        style={{
                          background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
                        
                        <div className="relative flex items-center justify-between">
                          <div className="group relative flex items-center gap-5 lg:gap-6">
                            <div className="relative flex shrink-0 items-center justify-center rounded-2xl py-3 px-6 lg:py-4 lg:px-8 shadow-xl backdrop-blur-xl bg-white/70 border-2 border-white/80">
                              {sponsorLogo ? (
                                <Image
                                  src={sponsorLogo}
                                  alt={sponsorName}
                                  width={120}
                                  height={60}
                                  className="relative h-14 lg:h-16 w-auto max-w-[180px] lg:max-w-[220px] object-contain"
                                />
                              ) : (
                                <div className="h-14 w-32 flex items-center justify-center text-slate-400 text-sm">No logo</div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.12em]" style={{ color: `${textColor}CC` }}>Presented by</p>
                              <p className="text-xl lg:text-2xl font-semibold leading-tight" style={{ color: textColor }}>{sponsorName || 'Sponsor Name'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/70 backdrop-blur-xl px-4 py-2 shadow-xl">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm font-semibold text-emerald-700">Judging in Progress</span>
                          </div>
                        </div>
                      </div>
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

            {/* Teams/Students Tab */}
            <TabsContent value="teams" className="space-y-6">
              <Card className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-sm">
                <CardHeader className="border-b border-slate-100 bg-linear-to-br from-slate-50 to-white p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                    {isPWSEvent ? <User className="h-6 w-6 text-primary" /> : <Award className="h-6 w-6 text-primary" />}
                    Add New {participantLabel}
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600">
                    {isPWSEvent ? "Register an individual student for this event." : "Create a new team for this event."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  {isPWSEvent ? (
                    /* PWS Student Form */
                    <>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="student-name" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                            Student Name
                          </Label>
                          <Input
                            id="student-name"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            placeholder="e.g., John Smith"
                            className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="student-email" className="text-base font-semibold uppercase tracking-[0.15em] text-slate-700">
                            Student Email
                          </Label>
                          <Input
                            id="student-email"
                            value={newStudentEmail}
                            onChange={(e) => setNewStudentEmail(e.target.value)}
                            placeholder="e.g., student@tamu.edu"
                            type="email"
                            className="h-12 rounded-xl border-slate-200 px-4 text-lg shadow-inner"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={addStudent}
                        disabled={!newStudentName || !newStudentEmail}
                        className="h-12 w-full rounded-xl bg-primary text-base font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 md:w-auto md:px-8"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Add Student
                      </Button>
                    </>
                  ) : (
                    /* Team Form */
                    <>
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
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-slate-800">
                  Registered {participantsLabel} <span className="text-primary">({teams.length})</span>
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
                            <CardTitle className="text-xl font-semibold text-slate-800 transition-colors group-hover:text-primary">
                              {team.name}
                            </CardTitle>
                            {!isPWSEvent && (
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
                            )}
                            {isPWSEvent && team.members.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Email</p>
                                <p className="text-sm text-slate-600">{team.members[0].email}</p>
                              </div>
                            )}
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

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="max-w-2xl rounded-3xl border-2 border-white/30 bg-white/90 backdrop-blur-xl shadow-2xl p-0">
          <AlertDialogHeader className="p-8 pb-4">
            <AlertDialogTitle className="text-3xl font-semibold text-slate-900">Leave Without Saving?</AlertDialogTitle>
            <AlertDialogDescription className="mt-4 text-xl text-slate-600 leading-relaxed">
              Any unsaved changes will be lost. Make sure to save your changes before leaving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 p-8 pt-4 sm:flex-row">
            <AlertDialogCancel className="h-16 flex-1 rounded-2xl border-2 border-slate-300 text-lg font-semibold text-slate-600 hover:border-primary/40 hover:bg-primary/5">
              Stay and Continue
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmExit}
              className="h-16 flex-1 rounded-2xl bg-primary text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
            >
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Event Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-2xl rounded-3xl border-2 border-red-200 bg-white/90 backdrop-blur-xl shadow-2xl p-0">
          <AlertDialogHeader className="p-8 pb-4">
            <AlertDialogTitle className="text-3xl font-semibold text-red-900">Delete Event?</AlertDialogTitle>
            <AlertDialogDescription className="mt-4 text-xl text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{eventName}</span>? This action cannot be undone and will remove all teams, judges, and scoring data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 p-8 pt-4 sm:flex-row">
            <AlertDialogCancel className="h-16 flex-1 rounded-2xl border-2 border-slate-300 text-lg font-semibold text-slate-600 hover:border-primary/40 hover:bg-primary/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="h-16 flex-1 rounded-2xl bg-red-600 text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-xl"
            >
              Yes, Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
