import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRankingsStore } from '@/store/rankingsStore';
import { useNotasStore } from '@/store/notasStore';
import { palette } from '@/constants/theme';

const iconos = {
  notas: 'document-text',
  rankings: 'list',
  favoritos: 'star',
  estadisticas: 'person',
} as const;

type TabName = keyof typeof iconos;

function tabIcon(name: TabName) {
  return ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
    <View style={focused ? styles.iconoActivo : styles.icono}>
      <Ionicons name={iconos[name]} color={color} size={size} />
    </View>
  );
}

export default function TabsLayout() {
  const fetchRankings = useRankingsStore((s) => s.fetchRankings);
  const fetchNotas = useNotasStore((s) => s.fetchNotas);

  useEffect(() => {
    Promise.all([fetchRankings(), fetchNotas()]);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: palette.purple,
        tabBarInactiveTintColor: '#777783',
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen name="notas" options={{ title: 'Notas', tabBarIcon: tabIcon('notas') }} />
      <Tabs.Screen name="rankings" options={{ title: 'Rankings', tabBarIcon: tabIcon('rankings') }} />
      <Tabs.Screen name="favoritos" options={{ title: 'Favoritos', tabBarIcon: tabIcon('favoritos') }} />
      <Tabs.Screen name="estadisticas" options={{ title: 'Perfil', tabBarIcon: tabIcon('estadisticas') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: palette.surface,
    borderTopColor: '#8b8ba340',
    height: 74,
    paddingTop: 8,
    paddingBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  icono: {
    width: 42,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoActivo: {
    width: 42,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b3ff522',
    shadowColor: palette.purple,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
});