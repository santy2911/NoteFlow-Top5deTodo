import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRankingsStore } from '../../store/rankingsStore';
import RankingCard from '../../components/RankingCard';
import { Ranking } from '../../types/index';

const List = FlashList as any;

export default function Favoritos() {
  const router = useRouter();
  const rankings = useRankingsStore((s) => s.rankings);
  const toggleFavorite = useRankingsStore((s) => s.toggleFavorite);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const favoritos = useMemo(() => rankings.filter((r) => r.isFavorite), [rankings]);

  const categories = useMemo(() => {
    const unique = new Set(favoritos.map((r) => r.category));
    return Array.from(unique);
  }, [favoritos]);

  const filtered = useMemo(() => {
    return favoritos.filter((r) => {
      const matchSearch =
        search === '' ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === null || r.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [favoritos, search, activeCategory]);

  const renderItem = ({ item }: { item: Ranking }) => (
    <RankingCard
      ranking={item}
      onPress={() => router.push(`/(tabs)/rankings/${item.id}`)}
      onToggleFavorite={() => toggleFavorite(item.id)}
    />
  );

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
        <>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar en favoritos..."
              placeholderTextColor="#555"
              value={search}
              onChangeText={setSearch}
            />
            {search !== '' && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {categories.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillsScroll}
              contentContainerStyle={styles.pillsContent}
            >
              <TouchableOpacity
                style={[styles.pill, activeCategory === null && styles.pillActive]}
                onPress={() => setActiveCategory(null)}
              >
                <Text style={[styles.pillText, activeCategory === null && styles.pillTextActive]}>
                  Todas
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pill, activeCategory === cat && styles.pillActive]}
                  onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
                >
                  <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <List
            data={filtered}
            renderItem={renderItem}
            estimatedItemSize={160}
            keyExtractor={(item: Ranking) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>Sin resultados</Text>
                <Text style={styles.noResultsSub}>Prueba con otros filtros</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A', paddingTop: 60 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 12, paddingHorizontal: 16 },
  list: { paddingBottom: 32 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242424',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  pillsScroll: {
    marginBottom: 12,
    maxHeight: 36,
    flexGrow: 0,
  },
  pillsContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#242424',
    height: 32,
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: '#534AB7' },
  pillText: { color: '#888', fontSize: 13, fontWeight: '500' },
  pillTextActive: { color: '#fff' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  emptySubtitle: { color: '#888', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  noResults: { alignItems: 'center', paddingTop: 60 },
  noResultsText: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  noResultsSub: { color: '#888', fontSize: 14 },
});