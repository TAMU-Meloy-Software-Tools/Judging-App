'use client';

import { DashboardScreen } from '@/components/dashboard/dashboard-screen';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('judge');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUserRole(userData.user.role);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleSelectEvent = (eventId: string) => {
    router.push(`/events/${eventId}?from=dashboard`);
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'settings') {
      router.push('/settings');
    } else if (screen === 'admin') {
      router.push('/admin');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <DashboardScreen 
      onSelectEvent={handleSelectEvent} 
      onNavigate={handleNavigate}
      isAdmin={userRole === 'admin' || userRole === 'moderator'}
    />
  );
}
