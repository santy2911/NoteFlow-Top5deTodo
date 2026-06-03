import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRankingsStore } from '../../../store/rankingsStore';
import * as Haptics from 'expo-haptics';
import { colors, palette } from '../../../constants/theme';

const COLOR_FALLBACK = '#534AB7';

function getCategoryColor(category: string): string {
  const key = category.toLowerCase() as keyof typeof colors.categories;
  return colors.categories[key] ?? COLOR_FALLBACK;
}

const MEDAL_COLORS = ['#f59e0b', '#94a3b8', '#cd7c3a'];
const MEDAL_EMOJIS = ['🏅', '🥈', '🥉'];

export default function DetalleRanking() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const router = useRouter();
  const { rankings, deleteRanking } = useRankingsStore();

  const ranking = rankings.find((r) => r.id === id);

  if (!ranking) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ranking no encontrado</Text>
      </View>
    );
  }

  const color = getCategoryColor(ranking.category);
  const items = ranking.items ?? [];
  const top3 = items.slice(0, 3);

  const volver = () => {
    if (from === 'favoritos') {
      router.replace('/(tabs)/favoritos');
      return;
    }
    router.back();
  };

  const eliminar = () => {
    Alert.alert(
      'Eliminar ranking',
      `¿Seguro que quieres eliminar "${ranking.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteRanking(id);
            volver();
          },
        },
      ]
    );
  };

  const copiar = async () => {
    const texto = `${ranking.title}\n${items
      .map((item) => `${item.position}. ${item.name}`)
      .join('\n')}`;
    await Clipboard.setStringAsync(texto);
    Alert.alert('Copiado', 'El ranking se ha copiado al portapapeles');
  };

  return (
    <View style={styles.container}>
      <View style={styles.cabecera}>
        <TouchableOpacity style={styles.botonVolver} onPress={volver}>
          <Ionicons name="arrow-back" size={18} color={palette.purpleLight} />
          <Text style={styles.volverText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {top3.length > 0 && (
          <View style={[styles.podioContenedor, { borderTopColor: color, borderTopWidth: 3 }]}>
            <Text style={styles.titulo}>{ranking.title}</Text>
            <View style={[styles.badge, { backgroundColor: color + '33' }]}>
              <Text style={[styles.badgeText, { color }]}>{ranking.category}</Text>
            </View>
            <View style={styles.podio}>
              {top3[1] && (
                <View style={styles.podioItem}>
                  <View style={[styles.podioMedalla, { backgroundColor: MEDAL_COLORS[1] }]}>
                    <Text style={styles.podioEmoji}>{MEDAL_EMOJIS[1]}</Text>
                  </View>
                  <Text style={styles.podioNombre} numberOfLines={2}>{top3[1].name}</Text>
                  <Text style={styles.podioPosicion}>#2</Text>
                </View>
              )}
              {top3[0] && (
                <View style={[styles.podioItem, styles.podioPrimero]}>
                  <View style={[styles.podioMedallaGrande, { backgroundColor: MEDAL_COLORS[0] }]}>
                    <Text style={styles.podioEmojiGrande}>{MEDAL_EMOJIS[0]}</Text>
                  </View>
                  <Text style={styles.podioNombre} numberOfLines={2}>{top3[0].name}</Text>
                  <Text style={styles.podioPosicion}>#1</Text>
                </View>
              )}
              {top3[2] && (
                <View style={styles.podioItem}>
                  <View style={[styles.podioMedalla, { backgroundColor: MEDAL_COLORS[2] }]}>
                    <Text style={styles.podioEmoji}>{MEDAL_EMOJIS[2]}</Text>
                  </View>
                  <Text style={styles.podioNombre} numberOfLines={2}>{top3[2].name}</Text>
                  <Text style={styles.podioPosicion}>#3</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {items.length > 0 && (
          <View style={styles.listaCompleta}>
            <Text style={styles.listaLabel}>RANKING COMPLETO</Text>
            {items.map((item, index) => (
              <View
                key={item.id ?? `item-${index}`}
                style={[
                  styles.itemRow,
                  index === 0 && styles.itemTop1,
                  index === 1 && styles.itemTop2,
                  index === 2 && styles.itemTop3,
                ]}
              >
                {index < 3 ? (
                  <View style={[styles.medalBadge, { backgroundColor: MEDAL_COLORS[index] }]}>
                    <Text style={styles.itemEmoji}>{MEDAL_EMOJIS[index]}</Text>
                  </View>
                ) : (
                  <View style={styles.numeroBadge}>
                    <Text style={styles.numeroText}>{item.position}</Text>
                  </View>
                )}
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.acciones}>
        <TouchableOpacity style={styles.botonCopiar} onPress={copiar}>
          <Ionicons name="copy-outline" size={20} color="#9090b0" />
          <Text style={styles.botonCopiarText}>Copiar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonEditar}
          onPress={() => router.push(`/(tabs)/rankings/nuevo-ranking?id=${id}`)}
        >
          <Ionicons name="pencil-outline" size={20} color="#a855f7" />
          <Text style={styles.botonEditarText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonEliminar} onPress={eliminar}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={styles.botonEliminarText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  cabecera: {
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  botonVolver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8b3ff540',
    backgroundColor: palette.surface,
  },
  volverText: { fontWeight: '700', color: palette.text, fontSize: 14 },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#ffffff' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  podioContenedor: {
    backgroundColor: '#16162a',
    borderRadius: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopWidth: 3,
    borderColor: '#252540',
    padding: 20,
    marginBottom: 28,
  },
  podio: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
  },
  podioItem: { flex: 1, alignItems: 'center', gap: 8 },
  podioPrimero: { marginBottom: 20 },
  podioMedalla: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podioMedallaGrande: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podioEmoji: { fontSize: 30 },
  podioEmojiGrande: { fontSize: 38 },
  podioNombre: { fontSize: 12, fontWeight: '600', textAlign: 'center', color: '#ffffff' },
  podioPosicion: { fontSize: 11, fontWeight: '500', color: '#55556a' },
  listaCompleta: { gap: 8 },
  listaLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4, color: '#55556a' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    backgroundColor: '#16162a',
    borderWidth: 1,
    borderColor: '#252540',
  },
  medalBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: { fontSize: 25, textAlign: 'center' },
  itemTop1: {
    borderWidth: 1,
    borderColor: '#f59e0baa',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 6,
  },
  itemTop2: {
    borderWidth: 1,
    borderColor: '#a8b4c8aa',
    shadowColor: '#a8b4c8',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 5,
  },
  itemTop3: {
    borderWidth: 1,
    borderColor: '#cd7c3aaa',
    shadowColor: '#cd7c3a',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 5,
  },
  numeroBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252540',
  },
  numeroText: { fontWeight: 'bold', fontSize: 15, color: '#9090b0' },
  itemText: { fontSize: 16, fontWeight: '500', flex: 1, color: '#ffffff' },
  acciones: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#252540',
  },
  botonCopiar: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
    backgroundColor: '#16162a',
    borderWidth: 1,
    borderColor: '#252540',
  },
  botonCopiarText: { fontSize: 13, fontWeight: '600', color: '#9090b0' },
  botonEditar: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
    backgroundColor: '#1a0d2e',
    borderWidth: 1,
    borderColor: '#a855f740',
  },
  botonEditarText: { fontSize: 13, fontWeight: '600', color: '#a855f7' },
  botonEliminar: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  botonEliminarText: { fontSize: 13, fontWeight: '600', color: '#ef4444' },
  errorText: { textAlign: 'center', marginTop: 100, color: '#ffffff' },
});
