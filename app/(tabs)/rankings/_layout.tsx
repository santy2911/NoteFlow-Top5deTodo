import { Stack } from 'expo-router';

export default function LayoutRankings() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="nuevo-ranking"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  );
}