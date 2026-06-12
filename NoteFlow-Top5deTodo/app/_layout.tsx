import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useRankingsStore } from '../store/rankingsStore';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { router } from 'expo-router';

export default function RootLayout() {
  const fetchRankings = useRankingsStore((s) => s.fetchRankings);
  const [usuario, setUsuario] = useState<FirebaseAuthTypes.User | null | undefined>(undefined);

  useEffect(() => {
    const auth = getAuth();
    const unsuscribir = onAuthStateChanged(auth, (u) => {
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
      router.replace('/(tabs)/notas');
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