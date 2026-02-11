"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserPlus, Plus, Trash2, Mail, User, AlertCircle, Edit, Search, Check, Loader2 } from "lucide-react"
import type { JudgeProfile } from "@/lib/api/judges"
import type { User as UserType } from "@/lib/types/api"
import { getUsers } from "@/lib/api/admin"

interface JudgesTabProps {
  judgeProfiles: JudgeProfile[]
  judgeAccountEmail: string | null
  newJudgeName: string
  setNewJudgeName: (value: string) => void
  onAddJudge: () => Promise<void>
  onRemoveJudge: (profileId: string) => Promise<void>
  onUpdateJudgeAccount: (email: string) => Promise<void>
}

export function JudgesTab({
  judgeProfiles,
  judgeAccountEmail,
  newJudgeName,
  setNewJudgeName,
  onAddJudge,
  onRemoveJudge,
  onUpdateJudgeAccount,
}: JudgesTabProps) {
  const [isEditingAccount, setIsEditingAccount] = useState(false)
  const [savingAccount, setSavingAccount] = useState(false)
  const [judgeUsers, setJudgeUsers] = useState<UserType[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

  // Load judge users when dialog opens
  useEffect(() => {
    if (isEditingAccount) {
      loadJudgeUsers()
    }
  }, [isEditingAccount])

  const loadJudgeUsers = async () => {
    try {
      setLoadingUsers(true)
      const { users } = await getUsers()
      // Filter to only show users with 'judge' role
      const judges = users.filter(user => user.role === 'judge')
      setJudgeUsers(judges)
    } catch (error) {
      console.error('Failed to load judge users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleEditAccount = () => {
    setSelectedUser(null)
    setSearchQuery("")
    setIsEditingAccount(true)
  }

  const handleSaveAccount = async () => {
    if (!selectedUser) return
    
    try {
      setSavingAccount(true)
      await onUpdateJudgeAccount(selectedUser.email)
      setIsEditingAccount(false)
      setSelectedUser(null)
      setSearchQuery("")
    } catch (error) {
      console.error('Failed to update judge account:', error)
      alert('Failed to update judge account. Please try again.')
    } finally {
      setSavingAccount(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingAccount(false)
    setSelectedUser(null)
    setSearchQuery("")
  }

  // Filter users based on search query
  const filteredUsers = judgeUsers.filter(user => {
    const query = searchQuery.toLowerCase()
    return (
      user.email.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query)
    )
  })
  return (
    <TabsContent value="judges" className="space-y-6">
      {/* Judge Account Info Card */}
      <Card className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white shadow-2xl p-0">
        <CardHeader className="relative overflow-hidden border-b-2 border-primary/10 bg-gradient-to-b from-primary to-[#3d0000] p-8 m-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <User className="h-6 w-6 text-white" />
              </div>
              Dedicated Judge Account
            </CardTitle>
            <CardDescription className="text-base text-white/80 mt-2">
              All judge profiles for this event share one login account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {judgeAccountEmail ? (
            <div className="flex items-center gap-4 rounded-2xl border-2 border-primary/20 bg-white p-6 shadow-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Judge Account Email</p>
                <p className="text-xl font-semibold text-slate-900">{judgeAccountEmail}</p>
              </div>
              <Badge className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                Active
              </Badge>
              <Button
                onClick={handleEditAccount}
                variant="outline"
                className="h-10 rounded-xl px-4"
              >
                <Edit className="mr-2 h-4 w-4" />
                Change
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
                <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                <div className="flex-1">
                  <p className="text-base font-semibold text-amber-900">No Judge Account Set</p>
                  <p className="mt-2 text-sm text-amber-700">
                    Set up a dedicated judge account for this event. This account will be used to log in and access all judge profiles.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleEditAccount}
                className="h-12 rounded-xl bg-primary px-6 text-base font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <Plus className="mr-2 h-5 w-5" />
                Set Judge Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Judge Account Selection Dialog */}
      <Dialog open={isEditingAccount} onOpenChange={setIsEditingAccount}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-b from-white to-slate-50">
          {/* Header with gradient background */}
          <div className="relative overflow-hidden bg-gradient-to-b from-primary to-[#3d0000] px-8 py-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl font-bold text-white">Select Judge Account</DialogTitle>
              <DialogDescription className="text-base text-white/80 mt-2">
                Choose a user account with "judge" role to be the dedicated judge account for this event
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex flex-col gap-6 p-8 overflow-hidden">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 rounded-2xl border-2 border-slate-200 text-base shadow-inner focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto rounded-2xl border-2 border-slate-200 bg-white shadow-inner" style={{ maxHeight: '400px' }}>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-slate-600">Loading judge accounts...</p>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 mb-4">
                    <User className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-lg font-semibold text-slate-700 text-center mb-2">
                    {searchQuery ? 'No judge accounts match your search' : 'No judge accounts found'}
                  </p>
                  {!searchQuery && (
                    <p className="text-sm text-slate-500 text-center">
                      Create a user account with "judge" role first
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUser?.id === user.id
                    const isCurrent = judgeAccountEmail === user.email
                    
                    return (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full flex items-center gap-4 p-5 text-left transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-br from-primary/20 to-primary/10' 
                            : 'bg-slate-100'
                        }`}>
                          <User className={`h-7 w-7 ${isSelected ? 'text-primary' : 'text-slate-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${isSelected ? 'text-primary' : 'text-slate-900'}`}>
                            {user.name || 'Unnamed User'}
                          </p>
                          <p className="text-sm text-slate-600 truncate">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 border-2 border-emerald-200">
                              Current
                            </Badge>
                          )}
                          {isSelected && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-3 px-8 py-6 border-t-2 border-slate-100 bg-slate-50">
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              disabled={savingAccount}
              className="h-12 rounded-xl px-6 border-2 border-slate-200 font-semibold hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAccount}
              disabled={!selectedUser || savingAccount}
              className="h-12 rounded-xl bg-gradient-to-b from-primary to-[#3d0000] px-8 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {savingAccount ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Set as Judge Account'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Judge Profile Card */}
      <Card className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-b from-white to-slate-50 shadow-2xl p-0">
        <CardHeader className="relative overflow-hidden border-b-2 border-slate-100 bg-gradient-to-b from-primary to-[#3d0000] p-8 m-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          <div className="relative">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              Add New Judge Profile
            </CardTitle>
            <CardDescription className="text-base text-white/80 mt-2">
              Create judge profiles for this event (multiple profiles share the judge account above)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-3">
            <Label htmlFor="judge-name" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
              Judge Name
            </Label>
            <Input
              id="judge-name"
              value={newJudgeName}
              onChange={(e) => setNewJudgeName(e.target.value)}
              placeholder="e.g., Dr. Jane Smith"
              className="h-14 rounded-2xl border-2 border-slate-200 px-5 text-lg shadow-inner focus:border-primary/40 transition-colors"
              disabled={!judgeAccountEmail}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newJudgeName.trim() && judgeAccountEmail) {
                  onAddJudge()
                }
              }}
            />
            {!judgeAccountEmail && (
              <p className="text-sm text-amber-600 font-semibold">Set up a judge account first before adding profiles</p>
            )}
          </div>
          <Button
            onClick={onAddJudge}
            disabled={!newJudgeName.trim() || !judgeAccountEmail}
            className="h-14 w-full rounded-2xl bg-gradient-to-b from-primary to-[#3d0000] text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-50 disabled:hover:translate-y-0 md:w-auto md:px-10"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Judge Profile
          </Button>
        </CardContent>
      </Card>

      {/* Judge Profiles List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold text-slate-900">Judge Profiles</h3>
          <Badge className="rounded-full bg-primary/10 px-4 py-1.5 text-base font-bold text-primary border-2 border-primary/20">
            {judgeProfiles.length}
          </Badge>
        </div>
        {judgeProfiles.length === 0 ? (
          <Card className="rounded-3xl border-2 border-slate-200 bg-gradient-to-b from-white to-slate-50 p-12 text-center shadow-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                <User className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-600">No judge profiles yet</p>
              <p className="text-sm text-slate-500">Add your first judge profile above</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {judgeProfiles.map((profile) => (
              <Card
                key={profile.id}
                className="group overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-primary/40"
              >
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4 transition-all group-hover:from-primary/30 group-hover:to-primary/20">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900 transition-colors group-hover:text-primary mb-3">
                        {profile.name}
                      </CardTitle>
                      <Badge className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary border border-primary/20">
                        Judge Profile
                      </Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRemoveJudge(profile.id)}
                      className="h-11 w-11 shrink-0 rounded-2xl p-0 shadow-lg transition-all hover:-translate-y-0.5"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TabsContent>
  )
}
