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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary to-[#3d0000] p-4">
      <Card className="w-full max-w-lg shadow-2xl rounded-2xl">
        <CardHeader className="text-center p-8">
          <div className="mx-auto">
            <Image
              src="/apptitle.png"
              alt="Meloy Program Judging Portal"
              width={280}
              height={134}
              className="object-contain"
              style={{ filter: 'brightness(0) saturate(100%) invert(10%) sepia(90%) saturate(5000%) hue-rotate(340deg) brightness(60%) contrast(110%)' }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11 bg-muted p-1 rounded-full">
              <TabsTrigger value="login" className="text-base rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300">Login</TabsTrigger>
              <TabsTrigger value="signup" className="text-base rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="judge@tamu.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base bg-input/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base bg-input/80"
                  />
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 ease-in-out hover:scale-105">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Login as Judge
                  </Button>
                </div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-border/80 hover:bg-muted/80 transition-all duration-300 ease-in-out hover:scale-105"
                  onClick={(e) => handleSubmit(e, true)}
                >
                  Login as Admin
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                  <Input id="signup-name" type="text" placeholder="John Doe" required className="h-12 text-base bg-input/80" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                  <Input id="signup-email" type="email" placeholder="judge@tamu.edu" required className="h-12 text-base bg-input/80" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <Input id="signup-password" type="password" required className="h-12 text-base bg-input/80" />
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 ease-in-out hover:scale-105">
                    Create Account
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}