'use client';

import { EventCreationScreen } from '@/components/management/event-creation-screen';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/api';

export default function EventCreatePage() {
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

  const handleBack = () => {
    router.push('/admin');
  };

  const handleCreateEvent = () => {
    // After creating event, go back to admin screen
    router.push('/admin');
  };

  // Only allow admin access
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (userRole !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <EventCreationScreen
      onBack={handleBack}
      onCreateEvent={handleCreateEvent}
    />
  );
}
