import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="event/[eventId]" />
      <Stack.Screen name="team/[teamId]" />
      <Stack.Screen name="leaderboard" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
