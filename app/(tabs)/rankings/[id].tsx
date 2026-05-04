import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRankingsStore } from '../../../store/rankingsStore';

export default function RankingDetail() {
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

  const handleEliminar = () => {
    Alert.alert(
      'Eliminar ranking',
      `¿Seguro que quieres eliminar "${ranking.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteRanking(id);
            router.back();
          },
        },
      ]
    );
  };

  const handleCopiar = async () => {
    const texto = `${ranking.title}\n${ranking.items
      .map((item) => `${item.position}. ${item.text}`)
      .join('\n')}`;
    await Clipboard.setStringAsync(texto);
    Alert.alert('Copiado', 'El ranking se ha copiado al portapapeles');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.barraColor, { backgroundColor: ranking.categoryColor }]} />

      <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
        <Text style={styles.volverText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>{ranking.title}</Text>

      <View style={[styles.badge, { backgroundColor: ranking.categoryColor + '33' }]}>
        <Text style={[styles.badgeText, { color: ranking.categoryColor }]}>
          {ranking.category}
        </Text>
      </View>

      <View style={styles.items}>
        {ranking.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.numeroBadge}>
              <Text style={styles.numeroText}>{item.position}</Text>
            </View>
            <Text style={styles.itemText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity style={styles.boton} onPress={handleCopiar}>
          <Ionicons name="copy-outline" size={20} color="#fff" />
          <Text style={styles.botonText}>Copiar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push(`/(tabs)/rankings/nuevo-ranking?id=${id}`)}
        >
          <Ionicons name="pencil-outline" size={20} color="#fff" />
          <Text style={styles.botonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.boton, styles.botonEliminar]} onPress={handleEliminar}>
          <Ionicons name="trash-outline" size={20} color="#E85D75" />
          <Text style={[styles.botonText, { color: '#E85D75' }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
  },
  barraColor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  volver: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 52,
    marginBottom: 24,
    gap: 6,
  },
  volverText: {
    color: '#fff',
    fontSize: 16,
  },
  titulo: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 28,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  items: {
    gap: 12,
    marginBottom: 40,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242424',
    borderRadius: 12,
    padding: 14,
    gap: 14,
  },
  numeroBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#534AB7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
  },
  acciones: {
    flexDirection: 'row',
    gap: 12,
  },
  boton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  botonEliminar: {
    borderWidth: 1,
    borderColor: '#E85D75',
  },
  botonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 100,
  },
});