import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotasStore } from '@/store/notasStore';
import { useTheme } from '@/constants/theme';
import { Nota } from '@/types';

export default function NotasScreen() {
  const { notas, isLoading, fetchNotas } = useNotasStore();
  const router = useRouter();
  const { colors, typography } = useTheme();
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchNotas();
  }, []);

  const notasFiltradas = notas.filter((n) => {
    const q = busqueda.toLowerCase();
    return (
      n.titulo.toLowerCase().includes(q) ||
      n.contenido.toLowerCase().includes(q) ||
      n.bloques?.some((b) => b.contenido.toLowerCase().includes(q)) ||
      n.checklist?.some((i) => i.texto.toLowerCase().includes(q))
    );
  });

  const renderNota = ({ item }: { item: Nota }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/notas/${item.id}`)}
    >
      <Text style={[styles.titulo, { color: colors.text.primary, fontSize: typography.sizes.lg }]} numberOfLines={1}>
        {item.titulo || 'Sin título'}
      </Text>
      {item.tieneChecklist ? (
        <Text style={[styles.meta, { color: colors.text.secondary, fontSize: typography.sizes.sm }]}>
          {item.checklist.filter((i) => i.completado).length}/{item.checklist.length} completados
        </Text>
      ) : (
        <Text style={[styles.contenido, { color: colors.text.secondary, fontSize: typography.sizes.sm }]} numberOfLines={2}>
          {item.bloques?.find((b) => b.tipo === 'texto' && b.contenido.trim())?.contenido || 'Nota vacía'}
        </Text>
      )}
      <Text style={[styles.fecha, { color: colors.text.muted, fontSize: typography.sizes.xs }]}>
        {new Date(item.updated_at).toLocaleDateString('es-ES')}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && notas.length === 0) {
    return (
      <View style={[styles.centrado, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.contenedor, { backgroundColor: colors.background }]}>
      <Text style={[styles.encabezado, { color: colors.text.primary, fontSize: typography.sizes.xxl }]}>
        Notas
      </Text>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar notas..."
          placeholderTextColor="#555"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderNota}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.text.primary, fontSize: typography.sizes.lg }]}>
              {busqueda.length > 0 ? 'Sin resultados' : 'No tienes notas todavía'}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.secondary, fontSize: typography.sizes.sm }]}>
              {busqueda.length > 0 ? 'Prueba con otras palabras' : 'Pulsa + para crear la primera'}
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/notas/nueva-nota')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  encabezado: {
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#242424',
    borderRadius: 10,
    padding: 16,
    gap: 6,
  },
  titulo: {
    fontWeight: '600',
  },
  contenido: {
    lineHeight: 20,
  },
  meta: {
    fontWeight: '500',
  },
  fecha: {
    marginTop: 4,
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