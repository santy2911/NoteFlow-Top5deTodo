import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotasStore } from '@/store/notasStore';
import { useTheme } from '@/constants/theme';
import { Nota } from '@/types';
import SwipeableActions from '@/components/SwipeableActions';

export default function NotasScreen() {
  const { notas, isLoading, fetchNotas, togglePinned, eliminarNota } = useNotasStore();
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

  const confirmarEliminar = (nota: Nota) => {
    Alert.alert('Eliminar nota', `Seguro que quieres eliminar "${nota.titulo || 'Sin titulo'}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => eliminarNota(nota.id),
      },
    ]);
  };

  const renderNota = ({ item }: { item: Nota }) => (
    <SwipeableActions
      pinned={item.is_pinned}
      onTogglePinned={() => togglePinned(item.id)}
      onDelete={() => confirmarEliminar(item)}
    >
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/notas/${item.id}`)}>
        <View style={styles.tituloFila}>
          <Text style={[styles.titulo, { color: colors.text.primary, fontSize: typography.sizes.lg }]} numberOfLines={1}>
            {item.titulo || 'Sin titulo'}
          </Text>
          {item.is_pinned && <Ionicons name="pin" size={16} color="#A78BFA" />}
        </View>

        {item.tieneChecklist ? (
          <Text style={[styles.meta, { color: colors.text.secondary, fontSize: typography.sizes.sm }]}>
            {item.checklist.filter((i) => i.completado).length}/{item.checklist.length} completados
          </Text>
        ) : (
          <Text style={[styles.contenido, { color: colors.text.secondary, fontSize: typography.sizes.sm }]} numberOfLines={2}>
            {item.bloques?.find((b) => b.tipo === 'texto' && b.contenido.trim())?.contenido || 'Nota vacia'}
          </Text>
        )}

        <Text style={[styles.fecha, { color: colors.text.muted, fontSize: typography.sizes.xs }]}>
          {new Date(item.updated_at).toLocaleDateString('es-ES')}
        </Text>
      </TouchableOpacity>
    </SwipeableActions>
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
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.text.primary, fontSize: typography.sizes.lg }]}>
              {busqueda.length > 0 ? 'Sin resultados' : 'No tienes notas todavia'}
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
  tituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    fontWeight: '600',
    flex: 1,
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
