import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRankingsStore } from '../../../store/rankingsStore';
import RankingCard from '../../../components/RankingCard';
import { useTheme } from '../../../constants/theme';
import { Ranking } from '../../../types/index';

export default function Rankings() {
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();
  const { rankings, toggleFavorite } = useRankingsStore();

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
      <FlashList
        data={rankings}
        renderItem={renderItem}
        // @ts-ignore
        estimatedItemSize={160}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.text.primary, fontSize: typography.sizes.lg }]}>
              No tienes rankings todavía
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.secondary, fontSize: typography.sizes.sm }]}>
              Pulsa + para crear el primero
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
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontWeight: '600',
    marginBottom: 8,
  },
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