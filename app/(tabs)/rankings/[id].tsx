import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRankingsStore } from '../../../store/rankingsStore';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../constants/theme';

const COLOR_FALLBACK = '#534AB7';

function getCategoryColor(category: string): string {
  const key = category.toLowerCase() as keyof typeof colors.categories;
  return colors.categories[key] ?? COLOR_FALLBACK;
}

export default function DetalleRanking() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
            router.back();
          },
        },
      ]
    );
  };

  const copiar = async () => {
    const texto = `${ranking.title}\n${(ranking.items ?? [])
      .map((item) => `${item.position}. ${item.name}`)
      .join('\n')}`;
    await Clipboard.setStringAsync(texto);
    Alert.alert('Copiado', 'El ranking se ha copiado al portapapeles');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={styles.volverText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={[styles.barraColor, { backgroundColor: color }]} />

        <ScrollView contentContainerStyle={styles.cardContent}>
          <Text style={styles.titulo}>{ranking.title}</Text>
          <View style={[styles.badge, { backgroundColor: color + '33' }]}>
            <Text style={[styles.badgeText, { color }]}>
              {ranking.category}
            </Text>
          </View>

          <View style={styles.items}>
            {(ranking.items ?? []).map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={[styles.numeroBadge, { backgroundColor: color }]}>
                  <Text style={styles.numeroText}>{item.position}</Text>
                </View>
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.acciones}>
          <TouchableOpacity style={styles.boton} onPress={copiar}>
            <Ionicons name="copy-outline" size={22} color="#fff" />
            <Text style={styles.botonText}>Copiar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.boton}
            onPress={() => router.push(`/(tabs)/rankings/nuevo-ranking?id=${id}`)}
          >
            <Ionicons name="pencil-outline" size={22} color="#fff" />
            <Text style={styles.botonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.boton, styles.botonEliminar]} onPress={eliminar}>
            <Ionicons name="trash-outline" size={22} color="#e11d48" />
            <Text style={[styles.botonText, { color: '#e11d48' }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  volver: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 56,
    marginBottom: 16,
    gap: 6,
  },
  volverText: { color: '#fff', fontSize: 16 },
  card: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    overflow: 'hidden',
  },
  barraColor: { height: 6, width: '100%' },
  cardContent: { padding: 20, paddingBottom: 12 },
  titulo: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  items: { gap: 10 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    padding: 14,
    gap: 14,
  },
  numeroBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  itemText: { color: '#fff', fontSize: 16 },
  acciones: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4a',
  },
  boton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f1a',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
  },
  botonEliminar: { borderWidth: 1, borderColor: '#e11d48' },
  botonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  errorText: { color: '#fff', textAlign: 'center', marginTop: 100 },
});