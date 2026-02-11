'use client';

import { ModeratorScreen } from '@/components/management/moderator-screen';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { getCurrentUser } from '@/lib/api';

export default function ModeratorPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const { user: auth0User } = useUser();
  
  const [userRole, setUserRole] = useState<string>('judge');
  const [userName, setUserName] = useState<string>('User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
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

  // Only allow admin/moderator access
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (userRole !== 'admin' && userRole !== 'moderator') {
    router.push(`/events/${eventId}`);
    return null;
  }

  return (
    <ModeratorScreen
      eventId={eventId}
      onBack={handleBack}
      userName={userName}
    />
  );
}
