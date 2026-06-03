import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRankingsStore } from '../../store/rankingsStore';
import RankingCard from '../../components/RankingCard';
import { Ranking } from '../../types/index';
import { palette } from '../../constants/theme';

const Lista = FlashList as any;

export default function Favoritos() {
  const router = useRouter();
  const rankings = useRankingsStore((s) => s.rankings);
  const toggleFavorite = useRankingsStore((s) => s.toggleFavorite);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const favoritos = useMemo(() => rankings.filter((r) => r.is_favorite), [rankings]);
  const categorias = useMemo(() => Array.from(new Set(favoritos.map((r) => r.category))), [favoritos]);
  const filtrados = useMemo(() => favoritos.filter((r) => {
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      q === '' ||
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.items.some((item) => item.name.toLowerCase().includes(q));
    const coincideCategoria = categoriaActiva === null || r.category === categoriaActiva;
    return coincideBusqueda && coincideCategoria;
  }), [favoritos, busqueda, categoriaActiva]);

  return (
    <View style={styles.container}>
      <View style={styles.cabecera}>
        <View style={styles.cabeceraIzquierda}>
          <Text style={styles.titulo}>Favoritos</Text>
          <Text style={styles.subTitulo}>
            {favoritos.length === 0
              ? 'Sin favoritos todavía'
              : `${favoritos.length} ${favoritos.length === 1 ? 'ranking guardado' : 'rankings guardados'}`}
          </Text>
        </View>
        <View style={styles.estrellaCirculo}>
          <Ionicons name="star" size={18} color={palette.gold} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={palette.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar favoritos..."
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

      {favoritos.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="star-outline" size={40} color={palette.gold} />
          </View>
          <Text style={styles.emptyTitulo}>Sin favoritos aún</Text>
          <Text style={styles.emptySubtitulo}>Marca un ranking con la estrella para verlo aquí</Text>
        </View>
      ) : (
        <>
          {categorias.length > 1 && (
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
              <RankingCard
                ranking={item}
                onPress={() => router.push({ pathname: '/(tabs)/rankings/[id]', params: { id: item.id, from: 'favoritos' } })}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            )}
            estimatedItemSize={160}
            keyExtractor={(item: Ranking) => item.id}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <View style={styles.sinResultados}>
                <Ionicons name="search-outline" size={40} color={palette.borderSoft} style={{ marginBottom: 12 }} />
                <Text style={styles.sinResultadosText}>Sin resultados</Text>
                <Text style={styles.sinResultadosSub}>Prueba con otros filtros</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background, paddingTop: 60 },
  cabecera: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  cabeceraIzquierda: { flex: 1 },
  titulo: { color: palette.text, fontSize: 28, fontWeight: '800', marginBottom: 2 },
  subTitulo: { color: palette.textSoft, fontSize: 13 },
  estrellaCirculo: {
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
  lista: { paddingBottom: 110, paddingTop: 0 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b22',
    borderWidth: 1,
    borderColor: '#f59e0b40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitulo: { color: palette.text, fontSize: 18, fontWeight: '600' },
  emptySubtitulo: { color: palette.textSoft, fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  sinResultados: { alignItems: 'center', paddingTop: 80 },
  sinResultadosText: { color: palette.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  sinResultadosSub: { color: palette.textSoft, fontSize: 14 },
});
