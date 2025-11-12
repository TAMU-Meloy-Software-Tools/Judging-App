"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2 } from "lucide-react"

interface LoginScreenProps {
  onLogin: (isAdmin?: boolean) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent, isAdmin = false) => {
    e.preventDefault()
    onLogin(isAdmin)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-primary to-[#3d0000] p-6">
      <Card className="relative w-full max-w-xl overflow-hidden rounded-[28px] border-2 border-white/40 bg-white/90 shadow-2xl backdrop-blur">
        <div className="absolute inset-0 bg-linear-to-br from-white via-white to-slate-100 opacity-90" />
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-[#3d0000]/20 blur-3xl" />

        <div className="relative">
          <CardHeader className="px-10 pt-12 pb-6 text-center">
            <Image
              src="/apptitle.png"
              alt="Meloy Program Judging Portal"
              width={260}
              height={120}
              className="mx-auto object-contain"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(10%) sepia(90%) saturate(5000%) hue-rotate(340deg) brightness(60%) contrast(110%)",
              }}
            />
          </CardHeader>
          <CardContent className="relative px-10 pb-10">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid h-12 w-full grid-cols-2 rounded-full border border-slate-200 bg-white/80 p-1 shadow-inner backdrop-blur">
                <TabsTrigger
                  value="login"
                  className="rounded-full text-base font-semibold text-slate-500 transition-all data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/15 data-[state=active]:to-primary/40 data-[state=active]:text-primary data-[state=active]:shadow"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-full text-base font-semibold text-slate-500 transition-all data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/15 data-[state=active]:to-primary/40 data-[state=active]:text-primary data-[state=active]:shadow"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-8">
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="judge@tamu.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl border-slate-200 bg-white/90 px-4 text-base shadow-inner focus-visible:border-primary/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl border-slate-200 bg-white/90 px-4 text-base shadow-inner focus-visible:border-primary/60"
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Login as Judge
                    </Button>
                  </div>
                  <div className="relative flex items-center justify-center py-2">
                    <span className="h-px w-full bg-slate-200" />
                    <span className="absolute bg-white px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Or
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex h-12 w-full items-center justify-center rounded-xl border-slate-200 text-base font-semibold text-slate-600 transition-transform hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    Login as Admin
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-8">
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Full name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      required
                      className="h-12 rounded-xl border-slate-200 bg-white/90 px-4 text-base shadow-inner focus-visible:border-primary/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="judge@tamu.edu"
                      required
                      className="h-12 rounded-xl border-slate-200 bg-white/90 px-4 text-base shadow-inner focus-visible:border-primary/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      className="h-12 rounded-xl border-slate-200 bg-white/90 px-4 text-base shadow-inner focus-visible:border-primary/60"
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-lg font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                    >
                      Create Account
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
