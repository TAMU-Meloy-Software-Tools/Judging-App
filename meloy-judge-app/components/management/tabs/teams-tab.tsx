"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Mail,
  User,
  Loader2,
  Save,
  ImageIcon,
  ExternalLink,
} from "lucide-react"
import type { Team } from "@/lib/types/api"

interface TeamMember {
  id?: string
  name: string
  email: string
}

interface TeamsTabProps {
  eventId: string
  teams: Team[]
  onTeamsChange: () => void
}

export function TeamsTab({ eventId, teams, onTeamsChange }: TeamsTabProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [teamPhoto, setTeamPhoto] = useState<string | null>(null)
  const [projectUrl, setProjectUrl] = useState("")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ name: "", email: "" }])

  const resetForm = () => {
    setTeamName("")
    setTeamDescription("")
    setTeamPhoto(null)
    setProjectUrl("")
    setTeamMembers([{ name: "", email: "" }])
  }

  const handleCreateTeam = () => {
    resetForm()
    setIsCreating(true)
  }

  const handleEditTeam = async (team: Team) => {
    setTeamName(team.name)
    setTeamDescription(team.description || "")
    setTeamPhoto(team.photo_url || null)
    setProjectUrl(team.project_url || "")
    
    // Load team members
    try {
      const response = await fetch(`/api/proxy/teams/${team.id}`)
      const data = await response.json()
      if (data.members && data.members.length > 0) {
        setTeamMembers(data.members.map((m: any) => ({ id: m.id, name: m.name, email: m.email || "" })))
      } else {
        setTeamMembers([{ name: "", email: "" }])
      }
    } catch (error) {
      console.error('Failed to load team members:', error)
      setTeamMembers([{ name: "", email: "" }])
    }
    
    setEditingTeam(team)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTeamPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addMember = () => {
    setTeamMembers([...teamMembers, { name: "", email: "" }])
  }

  const removeMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index))
    }
  }

  const updateMember = (index: number, field: 'name' | 'email', value: string) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  const handleSave = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name')
      return
    }

    // Validate at least one member has a name
    const validMembers = teamMembers.filter(m => m.name.trim())
    if (validMembers.length === 0) {
      alert('Please add at least one team member')
      return
    }

    try {
      setSaving(true)

      if (editingTeam) {
        // Update existing team
        const updateData = {
          name: teamName,
          description: teamDescription,
          photo_url: teamPhoto,
          project_url: projectUrl,
        };
        
        console.log('Updating team with data:', updateData);
        
        const response = await fetch(`/api/proxy/teams/${editingTeam.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Update team error:', errorData)
          throw new Error(errorData.details || errorData.error || 'Failed to update team')
        }

        // Update team members
        // First, delete existing members
        if (editingTeam.id) {
          await fetch(`/api/proxy/teams/${editingTeam.id}/members`, {
            method: 'DELETE',
          })
        }

        // Then add new members
        for (const member of validMembers) {
          await fetch(`/api/proxy/teams/${editingTeam.id}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member),
          })
        }

        setEditingTeam(null)
      } else {
        // Create new team
        const response = await fetch(`/api/proxy/events/${eventId}/teams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: teamName,
            description: teamDescription,
            photo_url: teamPhoto,
            project_url: projectUrl,
          }),
        })

        if (!response.ok) throw new Error('Failed to create team')
        
        const { team } = await response.json()

        // Add team members
        for (const member of validMembers) {
          await fetch(`/api/proxy/teams/${team.id}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member),
          })
        }

        setIsCreating(false)
      }

      resetForm()
      onTeamsChange()
    } catch (error) {
      console.error('Failed to save team:', error)
      alert('Failed to save team. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/proxy/teams/${teamId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete team')

      onTeamsChange()
    } catch (error) {
      console.error('Failed to delete team:', error)
      alert('Failed to delete team. Please try again.')
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingTeam(null)
    resetForm()
  }

  return (
    <TabsContent value="teams" className="space-y-6">
      {/* Add Team Button */}
      <Card className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-b from-white to-slate-50 shadow-2xl p-0">
        <CardHeader className="relative overflow-hidden border-b-2 border-slate-100 bg-gradient-to-b from-primary to-[#3d0000] p-8 m-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              Teams Management
            </CardTitle>
            <CardDescription className="text-base text-white/80 mt-2">
              Create and manage teams for this event
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Button
            onClick={handleCreateTeam}
            className="h-14 w-full rounded-2xl bg-gradient-to-b from-primary to-[#3d0000] text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl md:w-auto md:px-10"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Team
          </Button>
        </CardContent>
      </Card>

      {/* Teams List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold text-slate-900">Teams</h3>
          <Badge className="rounded-full bg-primary/10 px-4 py-1.5 text-base font-bold text-primary border-2 border-primary/20">
            {teams.length}
          </Badge>
        </div>
        
        {teams.length === 0 ? (
          <Card className="rounded-3xl border-2 border-slate-200 bg-gradient-to-b from-white to-slate-50 p-12 text-center shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                <Users className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-600">No teams yet</p>
              <p className="text-sm text-slate-500">Create your first team to get started</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {teams.map((team) => {
              const truncatedDescription = team.description && team.description.length > 120 
                ? team.description.substring(0, 120) + '...' 
                : team.description;

              return (
                <Card
                  key={team.id}
                  className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-primary/25 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
                  style={{ background: 'linear-gradient(to bottom, #ffffff, #f1f5f9)' }}
                >
                  {/* Team Members Card - Top Right on Desktop/Tablet */}
                  {team.members && team.members.length > 0 && (
                    <div className="hidden md:block absolute top-6 right-6 z-10 w-48 sm:w-56">
                      <div 
                        className="rounded-2xl border-2 border-white/30 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4 shadow-lg"
                        style={{ background: 'linear-gradient(to bottom, #500000, #3d0000)' }}
                      >
                        <div className="flex items-center gap-2 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-white/30">
                          <Users className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-white" />
                          <span className="text-xs sm:text-sm font-bold text-white">Team Members</span>
                        </div>
                        <div className="flex flex-col gap-1.5 sm:gap-2">
                          {team.members.map((member: any) => (
                            <div key={member.id} className="flex items-center gap-2 text-xs sm:text-sm text-white">
                              <User className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-white/70" />
                              <span className="font-medium truncate">{member.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Desktop/Tablet: Photo pinned to Card edges */}
                  <div
                    className="hidden md:block absolute top-0 bottom-0 left-0 w-48 lg:w-56 xl:w-64 bg-slate-100 bg-cover bg-center"
                    style={team.photo_url ? { backgroundImage: `url(${team.photo_url})` } : undefined}
                  >
                    {!team.photo_url && (
                      <div className="flex items-center justify-center h-full">
                        <Image src="/meloyprogram.png" alt="Meloy logo placeholder" width={120} height={120} className="brightness-0 opacity-25" />
                      </div>
                    )}
                  </div>

                  <div className="hidden md:flex flex-col gap-3 min-w-0 p-6 ml-48 lg:ml-56 xl:ml-64 pr-64">
                    {/* Team Header */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold transition-colors text-[#500000] group-hover:text-[#3d0000]">
                        {team.name}
                      </h3>
                      <p className="mt-3 text-base text-[#500000]/90 leading-relaxed">
                        {truncatedDescription || 'No description'}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 mt-auto">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (team.project_url) {
                            window.open(team.project_url, '_blank');
                          }
                        }}
                        disabled={!team.project_url}
                        variant="outline"
                        className={`rounded-full border-2 border-white/30 px-5 py-2.5 text-base font-semibold shadow-lg backdrop-blur-sm transition-all ${
                          team.project_url 
                            ? 'text-white hover:opacity-90' 
                            : 'text-white/40 cursor-not-allowed opacity-50'
                        }`}
                        style={team.project_url ? { background: 'linear-gradient(to bottom, #500000, #3d0000)' } : { background: 'linear-gradient(to bottom, #500000, #3d0000)' }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Presentation
                      </Button>
                      <Button
                        onClick={() => handleEditTeam(team)}
                        variant="outline"
                        className="rounded-full border-2 border-white/30 px-5 py-2.5 text-base font-semibold shadow-lg backdrop-blur-sm transition-all text-white hover:opacity-90"
                        style={{ background: 'linear-gradient(to bottom, #500000, #3d0000)' }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(team.id)}
                        variant="outline"
                        className="rounded-full border-2 border-red-200 px-5 py-2.5 text-base font-semibold shadow-lg backdrop-blur-sm transition-all text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden relative flex flex-col items-center p-6 text-center">
                    {/* Team Photo */}
                    <div className="w-full mb-6">
                      {team.photo_url ? (
                        <img 
                          src={team.photo_url} 
                          alt={`${team.name} photo`}
                          className="w-full h-64 rounded-2xl object-cover border-2 border-slate-200 shadow-lg"
                        />
                      ) : (
                        <div className="flex w-full h-64 items-center justify-center rounded-2xl bg-slate-100 backdrop-blur-sm border-2 border-slate-200">
                          <Image src="/meloyprogram.png" alt="Meloy logo placeholder" width={120} height={120} className="brightness-0 opacity-25" />
                        </div>
                      )}
                    </div>

                    {/* Team Title */}
                    <h3 className="text-2xl font-bold text-[#500000] mb-3">
                      {team.name}
                    </h3>

                    {/* Team Description */}
                    <p className="text-base text-[#500000]/90 leading-relaxed mb-4">
                      {truncatedDescription || 'No description'}
                    </p>

                    {/* Team Members */}
                    {team.members && team.members.length > 0 && (
                      <div className="w-full mb-4">
                        <div 
                          className="rounded-2xl border-2 border-white/30 backdrop-blur-sm px-4 py-3 shadow-lg"
                          style={{ background: 'linear-gradient(to bottom, #500000, #3d0000)' }}
                        >
                          <div className="flex items-center justify-center gap-2 mb-3 pb-3 border-b border-white/30">
                            <Users className="h-4 w-4 text-white" />
                            <span className="text-sm font-bold text-white">Team Members</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {team.members.map((member: any) => (
                              <div key={member.id} className="flex items-center justify-center gap-2 text-sm text-white">
                                <User className="h-4 w-4 text-white/70" />
                                <span className="font-medium">{member.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col w-full gap-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (team.project_url) {
                            window.open(team.project_url, '_blank');
                          }
                        }}
                        disabled={!team.project_url}
                        variant="outline"
                        className={`w-full rounded-full border-2 border-white/30 px-5 py-2.5 text-base font-semibold shadow-lg backdrop-blur-sm transition-all ${
                          team.project_url 
                            ? 'text-white hover:opacity-90' 
                            : 'text-white/40 cursor-not-allowed opacity-50'
                        }`}
                        style={team.project_url ? { background: 'linear-gradient(to bottom, #500000, #3d0000)' } : { background: 'linear-gradient(to bottom, #500000, #3d0000)' }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Presentation
                      </Button>
                      <Button
                        onClick={() => handleEditTeam(team)}
                        variant="outline"
                        className="w-full rounded-full border-2 border-white/30 px-5 py-2.5 text-base font-semibold shadow-lg backdrop-blur-sm transition-all text-white hover:opacity-90"
                        style={{ background: 'linear-gradient(to bottom, #500000, #3d0000)' }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(team.id)}
                        variant="outline"
                        className="w-full rounded-full border-2 border-red-200 px-5 py-2.5 text-base font-semibold shadow-lg backdrop-blur-sm transition-all text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Team Dialog */}
      <Dialog open={isCreating || editingTeam !== null} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 flex flex-col rounded-3xl border-2 border-primary/20 bg-gradient-to-b from-white to-slate-50 overflow-hidden" showCloseButton={false}>
          {/* Header */}
          <div className="relative bg-gradient-to-b from-primary to-[#3d0000] px-8 py-6 shrink-0">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl font-bold text-white">
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </DialogTitle>
              <DialogDescription className="text-base text-white/80 mt-2">
                {editingTeam ? 'Update team information and members' : 'Add a new team to this event'}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Team Name */}
            <div className="space-y-3">
              <Label htmlFor="team-name" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
                Team Name
              </Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Team Alpha"
                className="h-14 rounded-2xl border-2 border-slate-200 px-5 text-lg shadow-inner focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Team Description */}
            <div className="space-y-3">
              <Label htmlFor="team-description" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
                Team Description
              </Label>
              <Textarea
                id="team-description"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Brief description of the team or project..."
                className="min-h-24 rounded-2xl border-2 border-slate-200 px-5 py-4 text-base shadow-inner focus:border-primary/40 transition-colors resize-none"
              />
            </div>

            {/* Team Photo */}
            <div className="space-y-3">
              <Label className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Team Photo
              </Label>
              <div className="flex items-center gap-6">
                {teamPhoto && (
                  <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 shadow-lg">
                    <Image src={teamPhoto} alt="Team Photo" fill className="object-cover" />
                  </div>
                )}
                <Label
                  htmlFor="photo-upload"
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-8 py-6 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
                >
                  <Upload className="h-6 w-6 text-primary" />
                  <span className="text-base font-bold text-slate-700">
                    {teamPhoto ? "Change Photo" : "Upload Photo"}
                  </span>
                  <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </Label>
              </div>
            </div>

            {/* Presentation Link */}
            <div className="space-y-3">
              <Label htmlFor="project-url" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
                Presentation Link
              </Label>
              <Input
                id="project-url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                className="h-14 rounded-2xl border-2 border-slate-200 px-5 text-base shadow-inner focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
                  Team Members
                </Label>
                <Button
                  onClick={addMember}
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl border-2 border-slate-200 font-semibold hover:border-primary/40 hover:bg-primary/5"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-slate-400" />
                        <Input
                          value={member.name}
                          onChange={(e) => updateMember(index, 'name', e.target.value)}
                          placeholder="Member name"
                          className="h-11 flex-1 rounded-xl border-2 border-slate-200 px-4 text-base shadow-inner focus:border-primary/40 transition-colors"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-slate-400" />
                        <Input
                          value={member.email}
                          onChange={(e) => updateMember(index, 'email', e.target.value)}
                          placeholder="Member email (optional)"
                          type="email"
                          className="h-11 flex-1 rounded-xl border-2 border-slate-200 px-4 text-base shadow-inner focus:border-primary/40 transition-colors"
                        />
                      </div>
                    </div>
                    {teamMembers.length > 1 && (
                      <Button
                        onClick={() => removeMember(index)}
                        variant="ghost"
                        size="sm"
                        className="h-11 w-11 shrink-0 rounded-xl p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-3 px-8 py-6 border-t-2 border-slate-100 bg-slate-50 shrink-0">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={saving}
              className="h-12 rounded-xl px-6 border-2 border-slate-200 font-semibold hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-12 rounded-xl bg-gradient-to-b from-primary to-[#3d0000] px-8 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  )
}
