'use client';

import { AdminScreen } from '@/components/management/admin/admin-screen';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleCreateEvent = () => {
    router.push('/admin/events/create');
  };

  const handleManageEvent = (eventId: string) => {
    router.push(`/admin/events/${eventId}/manage`);
  };

  return (
    <AdminScreen
      onBack={handleBack}
      onCreateEvent={handleCreateEvent}
      onManageEvent={handleManageEvent}
    />
  );
}
