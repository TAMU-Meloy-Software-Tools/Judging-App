'use client';

import { useSearchParams } from 'next/navigation';
import { AuthErrorScreen } from '@/components/authentication/auth-error-screen';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  return <AuthErrorScreen error={error} errorDescription={errorDescription} />;
}
