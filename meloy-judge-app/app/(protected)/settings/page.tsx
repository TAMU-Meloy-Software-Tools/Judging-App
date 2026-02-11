'use client';

import { SettingsScreen } from '@/components/settings/settings-screen';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return <SettingsScreen onBack={handleBack} onLogout={handleLogout} />;
}
