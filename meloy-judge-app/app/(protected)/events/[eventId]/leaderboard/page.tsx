'use client';

import { LeaderboardScreen } from '@/components/events/leaderboard-screen';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { getCurrentUser } from '@/lib/api';
import { getJudgeProfile } from '@/lib/judge-context';

export default function LeaderboardPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const { user: auth0User } = useUser();
  
  const [userRole, setUserRole] = useState<string>('judge');
  const [userName, setUserName] = useState<string>('User');
  const [judgeId, setJudgeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUserRole(userData.user.role);
        
        // If user is a judge, get their selected profile
        if (userData.user.role === 'judge') {
          const savedProfile = getJudgeProfile();
          if (savedProfile && savedProfile.event_id === eventId) {
            setJudgeId(savedProfile.id);
            setUserName(savedProfile.name);
          } else {
            // No profile selected, use user name as fallback
            setUserName(userData.user.name || auth0User?.name || auth0User?.email?.split('@')[0] || 'User');
          }
        } else {
          // Admin/moderator - use their actual name
          setUserName(userData.user.name || auth0User?.name || auth0User?.email?.split('@')[0] || 'User');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUserName(auth0User?.name || auth0User?.email?.split('@')[0] || 'User');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [auth0User, eventId]);

  const handleBack = () => {
    router.push(`/events/${eventId}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <LeaderboardScreen
      eventId={eventId}
      judgeId={judgeId}
      onBack={handleBack}
      judgeName={userName}
      isAdmin={userRole === 'admin' || userRole === 'moderator'}
    />
  );
}
