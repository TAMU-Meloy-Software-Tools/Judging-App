"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface LoginScreenProps {
  onLogin: (isAdmin?: boolean) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAuth0Login = () => {
    setIsLoading(true)
    window.location.href = '/api/auth/login?returnTo=/dashboard'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary to-[#3d0000] p-6">
      <Card className="relative w-full max-w-md overflow-hidden rounded-[28px] border-2 border-white/40 bg-white/95 shadow-2xl backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50 opacity-95" />
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-[#3d0000]/20 blur-3xl" />

        <div className="relative">
          <CardHeader className="px-10 pt-12 pb-8 text-center">
            <Image
              src="/meloyprogram.png"
              alt="Meloy Program Judging Portal"
              width={280}
              height={120}
              className="mx-auto object-contain"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(10%) sepia(90%) saturate(5000%) hue-rotate(340deg) brightness(60%) contrast(110%)",
              }}
            />
            <h1 className="mt-6 text-2xl font-bold text-slate-800">
              Howdy!
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to access Meloy Judge Portal
            </p>
          </CardHeader>
          
          <CardContent className="relative px-10 pb-12">
            <button
              onClick={handleAuth0Login}
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-lg bg-[#000000] px-6 py-3.5 text-white shadow-md transition-all duration-200 hover:bg-[#1a1a1a] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#000000]"
            >
              <div className="relative flex items-center justify-center gap-3">
                {/* Auth0 Logo with white filter */}
                <Image
                  src="/auth0-icon.png"
                  alt="Auth0"
                  width={20}
                  height={20}
                  className="flex-shrink-0 brightness-0 invert"
                />
                
                <span className="text-base font-medium">
                  {isLoading ? 'Redirecting...' : 'Continue with Auth0'}
                </span>
              </div>
            </button>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
