import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRankingsStore } from '../../store/rankingsStore';
import RankingCard from '../../components/RankingCard';
import { Ranking } from '../../types/index';

const Lista = FlashList as any;

export default function Favoritos() {
  const router = useRouter();
  const rankings = useRankingsStore((s) => s.rankings);
  const toggleFavorite = useRankingsStore((s) => s.toggleFavorite);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

  const favoritos = useMemo(() => rankings.filter((r) => r.isFavorite), [rankings]);

  const categorias = useMemo(() => {
    const unicas = new Set(favoritos.map((r) => r.category));
    return Array.from(unicas);
  }, [favoritos]);

  const filtrados = useMemo(() => {
    return favoritos.filter((r) => {
      const coincideBusqueda =
        busqueda === '' ||
        r.title.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.category.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.items.some((item) => item.text.toLowerCase().includes(busqueda.toLowerCase()));
      const coincideCategoria = categoriaActiva === null || r.category === categoriaActiva;
      return coincideBusqueda && coincideCategoria;
    });
  }, [favoritos, busqueda, categoriaActiva]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Favoritos</Text>

      {favoritos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyTitulo}>Sin favoritos aún</Text>
          <Text style={styles.emptySubtitulo}>
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
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {busqueda !== '' && (
              <TouchableOpacity onPress={() => setBusqueda('')}>
                <Ionicons name="close-circle" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {categorias.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pillsScroll}
              contentContainerStyle={styles.pillsContent}
            >
              <TouchableOpacity
                style={[styles.pill, categoriaActiva === null && styles.pillActive]}
                onPress={() => setCategoriaActiva(null)}
              >
                <Text style={[styles.pillText, categoriaActiva === null && styles.pillTextActive]}>
                  Todas
                </Text>
              </TouchableOpacity>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pill, categoriaActiva === cat && styles.pillActive]}
                  onPress={() => setCategoriaActiva(categoriaActiva === cat ? null : cat)}
                >
                  <Text style={[styles.pillText, categoriaActiva === cat && styles.pillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Lista
            data={filtrados}
            renderItem={({ item }: { item: Ranking }) => (
              <RankingCard
                ranking={item}
                onPress={() => router.push(`/(tabs)/rankings/${item.id}`)}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            )}
            estimatedItemSize={160}
            keyExtractor={(item: Ranking) => item.id}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <View style={styles.sinResultados}>
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
  container: { flex: 1, backgroundColor: '#1A1A1A', paddingTop: 60 },
  titulo: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 12, paddingHorizontal: 16 },
  lista: { paddingBottom: 32 },
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
  emptyTitulo: { color: '#fff', fontSize: 18, fontWeight: '600' },
  emptySubtitulo: { color: '#888', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  sinResultados: { alignItems: 'center', paddingTop: 60 },
  sinResultadosText: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  sinResultadosSub: { color: '#888', fontSize: 14 },
});