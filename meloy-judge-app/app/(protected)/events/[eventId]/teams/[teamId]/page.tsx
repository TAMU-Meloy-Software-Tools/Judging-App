'use client';

import { TeamDetailScreen } from '@/components/judging/team-detail-screen';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getJudgeProfile } from '@/lib/judge-context';

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const teamId = params.teamId as string;
  
  const [judgeId, setJudgeId] = useState<string | null>(null);
  const [judgeName, setJudgeName] = useState<string>('Judge');
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log('[TeamDetailPage] Checking for judge profile...');
    
    // Get the selected judge profile from localStorage
    const savedProfile = getJudgeProfile();
    console.log('[TeamDetailPage] Saved profile:', savedProfile);
    console.log('[TeamDetailPage] Current eventId:', eventId);
    
    if (savedProfile) {
      console.log('[TeamDetailPage] Profile event_id:', savedProfile.event_id);
      console.log('[TeamDetailPage] Match:', savedProfile.event_id === eventId);
    }
    
    if (savedProfile && savedProfile.event_id === eventId) {
      console.log('[TeamDetailPage] Using saved profile:', savedProfile.name);
      setJudgeId(savedProfile.id);
      setJudgeName(savedProfile.name);
      setLoading(false);
    } else {
      // No profile selected, redirect back to event detail to select one
      console.log('[TeamDetailPage] No valid profile found, redirecting to event detail');
      setRedirecting(true);
      router.replace(`/events/${eventId}`);
    }
  }, [eventId, router]);

  const handleBack = () => {
    router.push(`/events/${eventId}`);
  };

  const handleSubmitScores = async () => {
    // Scores are submitted within the component
    // After submission, navigate back to event detail
    router.push(`/events/${eventId}`);
  };

  if (loading || redirecting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">{redirecting ? 'Redirecting...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!judgeId) {
    return null; // Will redirect
  }

  return (
    <TeamDetailScreen
      eventId={eventId}
      teamId={teamId}
      judgeId={judgeId}
      judgeName={judgeName}
      onBack={handleBack}
      onSubmitScores={handleSubmitScores}
    />
  );
}
