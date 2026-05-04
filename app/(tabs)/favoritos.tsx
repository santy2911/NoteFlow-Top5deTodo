import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRankingsStore } from '../../store/rankingsStore';
import RankingCard from '../../components/RankingCard';

export default function Favoritos() {
  const router = useRouter();
  const rankings = useRankingsStore((s) => s.rankings);
  const toggleFavorite = useRankingsStore((s) => s.toggleFavorite);
  const favoritos = rankings.filter((r) => r.isFavorite);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoritos</Text>

      {favoritos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
          <Text style={styles.emptySubtitle}>
            Marca un ranking con la estrella para verlo aquí
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {favoritos.map((r) => (
            <RankingCard
              key={r.id}
              ranking={r}
              onPress={() => router.push(`/(tabs)/rankings/${r.id}`)}
              onToggleFavorite={() => toggleFavorite(r.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingTop: 60,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  list: {
    paddingBottom: 32,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});