'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthErrorScreen } from '@/components/authentication/auth-error-screen';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  return <AuthErrorScreen error={error} errorDescription={errorDescription} />;
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
