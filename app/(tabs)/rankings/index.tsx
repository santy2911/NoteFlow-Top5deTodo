import React, { useState, useMemo } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRankingsStore } from '../../../store/rankingsStore';
import RankingCard from '../../../components/RankingCard';
import SwipeableActions from '../../../components/SwipeableActions';
import { Ranking } from '../../../types/index';
import { palette } from '../../../constants/theme';

const Lista = FlashList as any;

export default function Rankings() {
  const router = useRouter();
  const { rankings, toggleFavorite, togglePinned, deleteRanking } = useRankingsStore();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const categorias = useMemo(() => Array.from(new Set(rankings.map((r) => r.category))), [rankings]);
  const filtrados = useMemo(() => rankings.filter((r) => {
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      q === '' ||
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.items ?? []).some((item) => item.name.toLowerCase().includes(q));
    const coincideCategoria = categoriaActiva === null || r.category === categoriaActiva;
    return coincideBusqueda && coincideCategoria;
  }), [rankings, busqueda, categoriaActiva]);

  const confirmarEliminar = (ranking: Ranking) => {
    Alert.alert('Eliminar ranking', `¿Seguro que quieres eliminar "${ranking.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteRanking(ranking.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.cabecera}>
        <View style={styles.cabeceraIzquierda}>
          <Text style={styles.header}>Mis Rankings</Text>
          <Text style={styles.subHeader}>
            {rankings.length === 0
              ? 'Sin rankings todavía'
              : `${rankings.length} ${rankings.length === 1 ? 'ranking creado' : 'rankings creados'}`}
          </Text>
        </View>
        <View style={styles.copaCirculo}>
          <Ionicons name="trophy" size={18} color={palette.gold} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={palette.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar rankings..."
          placeholderTextColor={palette.textMuted}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda !== '' && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color={palette.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {categorias.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll} contentContainerStyle={styles.pillsContent}>
          <TouchableOpacity style={[styles.pill, categoriaActiva === null && styles.pillActive]} onPress={() => setCategoriaActiva(null)}>
            <Text style={[styles.pillText, categoriaActiva === null && styles.pillTextActive]}>Todas</Text>
          </TouchableOpacity>
          {categorias.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.pill, categoriaActiva === cat && styles.pillActive]} onPress={() => setCategoriaActiva(categoriaActiva === cat ? null : cat)}>
              <Text style={[styles.pillText, categoriaActiva === cat && styles.pillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Lista
        data={filtrados}
        renderItem={({ item }: { item: Ranking }) => (
          <SwipeableActions pinned={item.is_pinned} onTogglePinned={() => togglePinned(item.id)} onDelete={() => confirmarEliminar(item)}>
            <RankingCard ranking={item} onPress={() => router.push(`/rankings/${item.id}`)} onToggleFavorite={() => toggleFavorite(item.id)} style={styles.cardSwipe} />
          </SwipeableActions>
        )}
        estimatedItemSize={160}
        keyExtractor={(item: Ranking) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={48} color={palette.borderSoft} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>{busqueda || categoriaActiva ? 'Sin resultados' : 'No tienes rankings todavía'}</Text>
            <Text style={styles.emptySubtext}>{busqueda || categoriaActiva ? 'Prueba con otros filtros' : 'Pulsa + para crear el primero'}</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(tabs)/rankings/nuevo-ranking')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  cabecera: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  cabeceraIzquierda: { flex: 1 },
  header: { color: palette.text, fontSize: 28, fontWeight: '800', marginBottom: 2 },
  subHeader: { color: palette.textSoft, fontSize: 13 },
  copaCirculo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f59e0b22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: palette.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: palette.text },
  pillsScroll: { marginBottom: 12, maxHeight: 36, flexGrow: 0 },
  pillsContent: { paddingHorizontal: 20, gap: 6, alignItems: 'center' },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    height: 32,
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: palette.purple, borderColor: palette.purple },
  pillText: { color: palette.textSoft, fontSize: 13, fontWeight: '700' },
  pillTextActive: { color: '#fff' },
  cardSwipe: { marginHorizontal: 0, marginBottom: 0 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: palette.text, fontSize: 17, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { color: palette.textSoft, fontSize: 13 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.purple,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: palette.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
  },
});