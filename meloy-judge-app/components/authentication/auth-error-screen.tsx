'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { XCircle, ArrowLeft } from 'lucide-react';

interface AuthErrorScreenProps {
  error?: string | null;
  errorDescription?: string | null;
}

export function AuthErrorScreen({ error, errorDescription }: AuthErrorScreenProps) {
  const getErrorMessage = () => {
    if (error === 'access_denied') {
      return {
        title: 'Access Denied',
        message: 'Authorization was declined. Please authorize the application to continue.',
      };
    }
    
    return {
      title: 'Authentication Failed',
      message: errorDescription || 'Something went wrong during sign in.',
    };
  };

  const { title, message } = getErrorMessage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary to-[#3d0000] p-6">
      <Card className="relative w-full max-w-md overflow-hidden rounded-[28px] border-2 border-white/40 bg-white/95 shadow-2xl backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50 opacity-95" />
        <div className="absolute -top-32 -right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-[#3d0000]/20 blur-3xl" />

        <div className="relative">
          <CardHeader className="px-10 pt-12 pb-6 text-center">
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
          </CardHeader>
          
          <CardContent className="relative px-10 pb-12">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Error Icon with animated pulse */}
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100 ring-4 ring-red-100">
                  <XCircle className="h-10 w-10 text-red-600" strokeWidth={2} />
                </div>
              </div>

              {/* Error Content */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {title}
                </h1>
                <p className="text-sm text-slate-600 max-w-sm">
                  {message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex w-full flex-col gap-3 pt-2">
                <Link
                  href="/api/auth/login?returnTo=/dashboard"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#000000] px-6 py-3.5 text-base font-medium text-white shadow-md transition-all duration-200 hover:bg-[#1a1a1a] hover:shadow-lg"
                >
                  Try Again
                </Link>

                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
