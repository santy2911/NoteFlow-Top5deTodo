import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRankingsStore } from '../../../store/rankingsStore';
import RankingCard from '../../../components/RankingCard';
import { useTheme } from '../../../constants/theme';
import { Ranking } from '../../../types/index';

const List = FlashList as any;

export default function Rankings() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { rankings, toggleFavorite } = useRankingsStore();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = new Set(rankings.map((r) => r.category));
    return Array.from(unique);
  }, [rankings]);

  const filtered = useMemo(() => {
    return rankings.filter((r) => {
      const matchSearch =
        search === '' ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase()) ||
        r.items.some((item) => item.text.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = activeCategory === null || r.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [rankings, search, activeCategory]);

  const renderItem = ({ item }: { item: Ranking }) => (
    <RankingCard
      ranking={item}
      onPress={() => router.push(`/rankings/${item.id}`)}
      onToggleFavorite={() => toggleFavorite(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text.primary, fontSize: typography.sizes.xxl }]}>
        Mis Rankings
      </Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar rankings..."
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

      {categories.length > 0 && (
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
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.text.primary, fontSize: typography.sizes.lg }]}>
              {search || activeCategory ? 'Sin resultados' : 'No tienes rankings todavía'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.secondary, fontSize: typography.sizes.sm }]}>
              {search || activeCategory ? 'Prueba con otros filtros' : 'Pulsa + para crear el primero'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/rankings/nuevo-ranking')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  header: {
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
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
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontWeight: '600', marginBottom: 8 },
  emptySubtext: {},
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#534AB7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});