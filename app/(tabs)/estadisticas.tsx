import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRankingsStore } from '../../store/rankingsStore';

export default function Estadisticas() {
  const rankings = useRankingsStore((s) => s.rankings);

  // Métricas
  const totalRankings = rankings.length;
  const totalFavoritos = rankings.filter((r) => r.isFavorite).length;
  const totalItems = rankings.length * 5;
  const categorias = [...new Set(rankings.map((r) => r.category))];
  const totalCategorias = categorias.length;

  // Rankings por categoría para el gráfico
  const porCategoria = categorias.map((cat) => ({
    name: cat,
    count: rankings.filter((r) => r.category === cat).length,
    color: rankings.find((r) => r.category === cat)?.categoryColor ?? '#534AB7',
  }));
  const maxCount = Math.max(...porCategoria.map((c) => c.count), 1);

  // Ítem más repetido
  const allItems = rankings.flatMap((r) => r.items.map((i) => i.text));
  const frecuencia: Record<string, number> = {};
  allItems.forEach((text) => {
    frecuencia[text] = (frecuencia[text] ?? 0) + 1;
  });
  const topItem = Object.entries(frecuencia).sort((a, b) => b[1] - a[1])[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Estadísticas</Text>

      {/* Metric cards */}
      <View style={styles.grid}>
        <MetricCard label="Rankings totales" value={totalRankings} />
        <MetricCard label="Favoritos" value={totalFavoritos} />
        <MetricCard label="Ítems totales" value={totalItems} />
        <MetricCard label="Categorías" value={totalCategorias} />
      </View>

      {/* Gráfico por categoría */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rankings por categoría</Text>
        {porCategoria.length === 0 ? (
          <Text style={styles.empty}>Sin datos aún</Text>
        ) : (
          porCategoria.map((cat) => (
            <View key={cat.name} style={styles.barRow}>
              <Text style={styles.barLabel}>{cat.name}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(cat.count / maxCount) * 100}%`,
                      backgroundColor: cat.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barCount}>{cat.count}</Text>
            </View>
          ))
        )}
      </View>

      {/* Ítem más repetido */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ítem más repetido</Text>
        {topItem ? (
          <>
            <Text style={styles.topItemText}>{topItem[0]}</Text>
            <Text style={styles.topItemSub}>
              Aparece en {topItem[1]} {topItem[1] === 1 ? 'ranking' : 'rankings'}
            </Text>
          </>
        ) : (
          <Text style={styles.empty}>Sin datos aún</Text>
        )}
      </View>
    </ScrollView>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#242424',
    borderRadius: 12,
    padding: 16,
    width: '47%',
  },
  metricValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  metricLabel: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#242424',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    color: '#ccc',
    fontSize: 13,
    width: 80,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barCount: {
    color: '#888',
    fontSize: 13,
    width: 16,
    textAlign: 'right',
  },
  topItemText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  topItemSub: {
    color: '#888',
    fontSize: 13,
  },
  empty: {
    color: '#555',
    fontSize: 14,
  },
});