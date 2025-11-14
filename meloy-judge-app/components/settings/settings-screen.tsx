"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster, toast } from "sonner"
import { ArrowLeft, User, Lock, AlertTriangle, Save, Trash2, LogOut, Camera } from "lucide-react"

interface SettingsScreenProps {
  onBack: () => void
  onLogout: () => void
}

export function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
  const [name, setName] = useState("Dr. Sarah Johnson")
  const [email, setEmail] = useState("sjohnson@tamu.edu")

  const handleSaveChanges = () => {
    toast.success("Profile updated successfully!")
  }

  const handleUpdatePassword = () => {
    toast.success("Password updated successfully!")
  }

  const handleDeleteAccount = () => {
    toast.error("Account has been deleted.")
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <Toaster richColors position="top-center" />

      <header className="relative overflow-hidden border-b bg-linear-to-b from-primary to-[#3d0000] shadow-xl backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 lg:gap-6 mb-4">
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
                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">Settings Hub</h1>
                <p className="text-sm text-white/85">Tune your profile, credentials, and account controls.</p>
              </div>
            </div>
            <Button onClick={onLogout} className="h-11 rounded-xl bg-white px-5 text-base font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white/95">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/20 bg-white/10 px-6 py-4 text-white/90">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Signed in as</p>
              <p className="mt-1 text-2xl font-semibold text-white">{name}</p>
            </div>
            <Badge variant="secondary" className="rounded-full border border-white/40 bg-white/20 px-4 py-2 text-sm font-medium text-white">
              {email}
            </Badge>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid h-16 w-full grid-cols-3 rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-lg backdrop-blur">
            <TabsTrigger
              value="profile"
              className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/30 data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <User className="mr-2 h-5 w-5" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/30 data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <Lock className="mr-2 h-5 w-5" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/30 data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <AlertTriangle className="mr-2 h-5 w-5" />
              Account
            </TabsTrigger>
          </TabsList>

          <div className="mt-10 space-y-10">
            <TabsContent value="profile">
              <Card className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-linear-to-br from-white via-slate-50 to-slate-100 shadow-lg">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300" />
                <CardHeader className="relative px-8 pt-8 pb-6">
                  <CardTitle className="text-2xl font-semibold text-slate-900">Profile Information</CardTitle>
                  <CardDescription className="text-base text-slate-600">Update your personal details and profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-8 px-8 pb-8 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-col items-center gap-4 lg:w-72">
                    <div className="relative">
                      <Image
                        src="/placeholder-user.jpg"
                        alt="User profile picture"
                        width={160}
                        height={160}
                        className="h-40 w-40 rounded-full border-4 border-white object-cover shadow-2xl"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-3 right-3 h-11 w-11 rounded-full border-white/60 bg-white/80 text-slate-700 backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:bg-white"
                      >
                        <Camera className="h-5 w-5" />
                        <span className="sr-only">Change picture</span>
                      </Button>
                    </div>
                    <p className="text-center text-sm text-slate-500">
                      Use a square image for best results on tablets and large displays.
                    </p>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Full name
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner focus-visible:border-primary/60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Email address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner focus-visible:border-primary/60"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSaveChanges}
                      className="h-12 w-full rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <Save className="mr-2 h-5 w-5" />
                      Save changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-sky-400 to-blue-500" />
                <CardHeader className="relative px-8 pt-8 pb-6">
                  <CardTitle className="text-2xl font-semibold text-slate-900">Security</CardTitle>
                  <CardDescription className="text-base text-slate-600">Manage your password and security settings.</CardDescription>
                </CardHeader>
                <CardContent className="mx-auto grid max-w-3xl gap-6 px-8 pb-8">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Current password
                    </Label>
                    <Input id="current-password" type="password" className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner focus-visible:border-primary/60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      New password
                    </Label>
                    <Input id="new-password" type="password" className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner focus-visible:border-primary/60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Confirm new password
                    </Label>
                    <Input id="confirm-password" type="password" className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner focus-visible:border-primary/60" />
                  </div>
                  <Button
                    onClick={handleUpdatePassword}
                    className="h-12 w-full rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    Update password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card className="relative overflow-hidden rounded-3xl border border-destructive/40 bg-linear-to-br from-destructive/10 via-white to-white shadow-lg">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-red-400 via-destructive to-orange-300" />
                <CardHeader className="relative px-8 pt-8 pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                    Account management
                  </CardTitle>
                  <CardDescription className="text-base text-destructive/80">
                    Manage settings related to your account, including irreversible actions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mx-auto max-w-3xl px-8 pb-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-white/70 px-6 py-6">
                    <div>
                      <h3 className="text-lg font-semibold text-destructive">Delete this account</h3>
                      <p className="text-sm text-destructive/80">Once you delete your account, there is no going back.</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="h-11 rounded-xl px-6 text-base font-semibold shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
                          <Trash2 className="mr-2 h-5 w-5" />
                          Delete account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, delete account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
