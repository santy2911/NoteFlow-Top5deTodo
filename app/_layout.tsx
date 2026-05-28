import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useRankingsStore } from '../store/rankingsStore';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { router } from 'expo-router';

export default function RootLayout() {
  const fetchRankings = useRankingsStore((s) => s.fetchRankings);
  const [usuario, setUsuario] = useState<FirebaseAuthTypes.User | null | undefined>(undefined);

  useEffect(() => {
    const unsuscribir = auth().onAuthStateChanged((u) => {
      setUsuario(u);
    });
    return unsuscribir;
  }, []);

  useEffect(() => {
    if (usuario === undefined) return;
    if (usuario === null) {
      router.replace('/login');
    } else {
      fetchRankings();
      router.replace('/(tabs)/rankings');
    }
  }, [usuario]);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}