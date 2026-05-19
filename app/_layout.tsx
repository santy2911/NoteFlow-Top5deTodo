import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { useRankingsStore } from '../store/rankingsStore';

export default function RootLayout() {
  const fetchRankings = useRankingsStore((s) => s.fetchRankings);

  useEffect(() => {
    fetchRankings();
  }, []);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}