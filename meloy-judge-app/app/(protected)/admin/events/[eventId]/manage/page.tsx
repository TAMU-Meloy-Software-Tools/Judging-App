'use client';

import { EventManagerScreen } from '@/components/management/event-manager-screen';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { getCurrentUser } from '@/lib/api';

export default function EventManagePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const { user: auth0User } = useUser();
  
  const [userId, setUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('judge');
  const [userName, setUserName] = useState<string>('User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUserId(userData.user.id);
        setUserRole(userData.user.role);
        setUserName(userData.user.name || auth0User?.name || auth0User?.email?.split('@')[0] || 'User');
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUserName(auth0User?.name || auth0User?.email?.split('@')[0] || 'User');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [auth0User]);

  const handleBack = () => {
    router.push(`/events/${eventId}`);
  };

  const handleSave = () => {
    // After saving, go back to event detail
    router.push(`/events/${eventId}`);
  };

  // Only allow admin access
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (userRole !== 'admin') {
    router.push(`/events/${eventId}`);
    return null;
  }

  return (
    <EventManagerScreen
      eventId={eventId}
      userId={userId}
      onBack={handleBack}
      onSave={handleSave}
      userName={userName}
      userRole={userRole}
    />
  );
}
