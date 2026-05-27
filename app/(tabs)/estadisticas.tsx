import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRankingsStore } from '../../store/rankingsStore';
import { useTheme } from '../../constants/theme';

const COLOR_ACENTO = '#534AB7';

export default function Estadisticas() {
  const { colors } = useTheme();
  const rankings = useRankingsStore((s) => s.rankings);

  const totalRankings = rankings.length;
  const totalFavoritos = rankings.filter((r) => r.is_favorite).length;
  const totalItems = rankings.length * 5;
  const categorias = [...new Set(rankings.map((r) => r.category))];

  const porCategoria = categorias.map((cat) => ({
    nombre: cat,
    cantidad: rankings.filter((r) => r.category === cat).length,
    color: COLOR_ACENTO,
  }));
  const maxCantidad = Math.max(...porCategoria.map((c) => c.cantidad), 1);

  const todosLosItems = rankings.flatMap((r) => r.items.map((i) => i.name));
  const frecuencia: Record<string, number> = {};
  todosLosItems.forEach((name) => {
    frecuencia[name] = (frecuencia[name] ?? 0) + 1;
  });
  const itemTop = Object.entries(frecuencia).sort((a, b) => b[1] - a[1])[0];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.titulo}>Estadísticas</Text>

      <View style={styles.grid}>
        <TarjetaMetrica label="Rankings totales" valor={totalRankings} />
        <TarjetaMetrica label="Favoritos" valor={totalFavoritos} />
        <TarjetaMetrica label="Ítems totales" valor={totalItems} />
        <TarjetaMetrica label="Categorías" valor={categorias.length} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Rankings por categoría</Text>
        {porCategoria.length === 0 ? (
          <Text style={styles.vacio}>Sin datos aún</Text>
        ) : (
          porCategoria.map((cat) => (
            <View key={cat.nombre} style={styles.barraFila}>
              <Text style={styles.barraLabel}>{cat.nombre}</Text>
              <View style={styles.barraTrack}>
                <View
                  style={[
                    styles.barraRelleno,
                    {
                      width: `${(cat.cantidad / maxCantidad) * 100}%`,
                      backgroundColor: cat.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barraCantidad}>{cat.cantidad}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Ítem más repetido</Text>
        {itemTop ? (
          <>
            <Text style={styles.itemTopTexto}>{itemTop[0]}</Text>
            <Text style={styles.itemTopSub}>
              Aparece en {itemTop[1]} {itemTop[1] === 1 ? 'ranking' : 'rankings'}
            </Text>
          </>
        ) : (
          <Text style={styles.vacio}>Sin datos aún</Text>
        )}
      </View>
    </ScrollView>
  );
}

function TarjetaMetrica({ label, valor }: { label: string; valor: number }) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.tarjetaValor}>{valor}</Text>
      <Text style={styles.tarjetaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A1A' },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 32, gap: 16 },
  titulo: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tarjeta: { backgroundColor: '#242424', borderRadius: 12, padding: 16, width: '47%' },
  tarjetaValor: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  tarjetaLabel: { color: '#888', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#242424', borderRadius: 12, padding: 16, gap: 12 },
  cardTitulo: { color: '#fff', fontSize: 16, fontWeight: '600' },
  barraFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barraLabel: { color: '#ccc', fontSize: 13, width: 80 },
  barraTrack: { flex: 1, height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  barraRelleno: { height: '100%', borderRadius: 4 },
  barraCantidad: { color: '#888', fontSize: 13, width: 16, textAlign: 'right' },
  itemTopTexto: { color: '#fff', fontSize: 18, fontWeight: '600' },
  itemTopSub: { color: '#888', fontSize: 13 },
  vacio: { color: '#555', fontSize: 14 },
});
