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
import { palette } from '@/constants/theme';
import { Nota } from '@/types';
import SwipeableActions from '@/components/SwipeableActions';

const CARD_ACCENT_COLORS = [palette.purple, palette.pink, palette.gold, '#10b981', '#3b82f6', '#f97316'];

function getAccentColor(index: number) {
  return CARD_ACCENT_COLORS[index % CARD_ACCENT_COLORS.length];
}

export default function NotasScreen() {
  const { notas, isLoading, fetchNotas, togglePinned, eliminarNota } = useNotasStore();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');

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
    Alert.alert('Eliminar nota', `Seguro que quieres eliminar "${nota.titulo || 'Sin título'}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => eliminarNota(nota.id),
      },
    ]);
  };

  const renderNota = ({ item, index }: { item: Nota; index: number }) => {
    const accentColor = getAccentColor(index);
    return (
      <SwipeableActions
        pinned={item.is_pinned}
        onTogglePinned={() => togglePinned(item.id)}
        onDelete={() => confirmarEliminar(item)}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/notas/${item.id}`)}
          activeOpacity={0.82}
        >
          <View style={[styles.barraSuperior, { backgroundColor: accentColor }]} />
          <View style={styles.cardContenido}>
            <View style={styles.tituloFila}>
              <Text style={styles.titulo} numberOfLines={1}>{item.titulo || 'Sin título'}</Text>
              <Ionicons name={item.is_pinned ? 'pin' : 'document-text'} size={21} color={accentColor} />
            </View>
            {item.tieneChecklist ? (
              <Text style={styles.contenido}>
                {item.checklist.filter((i) => i.completado).length}/{item.checklist.length} completados
              </Text>
            ) : (
              <Text style={styles.contenido} numberOfLines={2}>
                {item.bloques?.find((b) => b.tipo === 'texto' && b.contenido.trim())?.contenido || 'Nota vacía'}
              </Text>
            )}
            <Text style={styles.fecha}>
              {new Date(item.updated_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </TouchableOpacity>
      </SwipeableActions>
    );
  };

  if (isLoading && notas.length === 0) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator color={palette.purple} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.cabecera}>
        <View>
          <Text style={styles.encabezado}>Notas</Text>
          <Text style={styles.subEncabezado}>
            {notas.length === 0
              ? 'Sin notas todavía'
              : `${notas.length} ${notas.length === 1 ? 'nota guardada' : 'notas guardadas'}`}
          </Text>
        </View>
        <View style={styles.iconoCabecera}>
          <Ionicons name="document-text" size={18} color={palette.purpleLight} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={palette.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar notas..."
          placeholderTextColor={palette.textMuted}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color={palette.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderNota}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={palette.borderSoft} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>{busqueda.length > 0 ? 'Sin resultados' : 'No tienes notas todavía'}</Text>
            <Text style={styles.emptySubtext}>{busqueda.length > 0 ? 'Prueba con otras palabras' : 'Pulsa + para crear la primera'}</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/notas/nueva-nota')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: palette.background },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.background },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  encabezado: { color: palette.text, fontSize: 28, fontWeight: '800', marginBottom: 2 },
  subEncabezado: { color: palette.textSoft, fontSize: 13 },
  iconoCabecera: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#8b3ff522',
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
  lista: { paddingBottom: 100, paddingTop: 4 },
  card: {
    backgroundColor: palette.card,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 86,
    borderWidth: 1,
    borderColor: '#2a2a4a55',
  },
  barraSuperior: { height: 4, width: '100%' },
  cardContenido: { flex: 1, paddingHorizontal: 14, paddingVertical: 13, gap: 5 },
  tituloFila: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titulo: { color: palette.text, fontSize: 16, fontWeight: '700', flex: 1 },
  contenido: { color: palette.textSoft, fontSize: 13, lineHeight: 20 },
  fecha: { color: palette.textMuted, fontSize: 11, marginTop: 2 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: palette.text, fontSize: 17, fontWeight: '600', marginBottom: 6 },
  emptySubtext: { color: palette.textSoft, fontSize: 13, textAlign: 'center' },
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
