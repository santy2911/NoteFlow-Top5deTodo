import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';
import { useRankingsStore } from '../../../store/rankingsStore';
import { palette, medalColors, medalEmojis } from '../../../constants/theme';

const esquemaRanking = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  category: z.string().min(1, 'La categoría no puede estar vacía'),
  items: z.array(z.string()).length(5).refine((items) => items.some((item) => item.trim().length > 0), 'Añade al menos un item'),
});

const CATEGORIAS_SUGERIDAS = ['Videojuegos', 'Películas', 'Música', 'Comida', 'Series', 'Deportes', 'Libros', 'Viajes'];

export default function NuevoRanking() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rankings, addRanking, updateRanking } = useRankingsStore();
  const scrollRef = useRef<ScrollView>(null);
  const tituloRef = useRef<TextInput>(null);
  const categoriaRef = useRef<TextInput>(null);
  const itemRefs = useRef<(TextInput | null)[]>([null, null, null, null, null]);
  const rankingExistente = id ? rankings.find((r) => r.id === id) : null;
  const esEdicion = !!rankingExistente;
  const [titulo, setTitulo] = useState(rankingExistente?.title ?? '');
  const [categoria, setCategoria] = useState(rankingExistente?.category ?? '');
  const [items, setItems] = useState<string[]>(rankingExistente ? (rankingExistente.items ?? []).map((i) => i.name) : ['', '', '', '', '']);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const actualizarItem = (index: number, valor: string) => {
    const copia = [...items];
    copia[index] = valor;
    setItems(copia);
  };

  const guardar = async () => {
    const result = esquemaRanking.safeParse({ title: titulo, category: categoria, items });
    if (!result.success) {
      const nuevosErrores: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const campo = err.path[0]?.toString() ?? 'items';
        nuevosErrores[campo] = err.message;
      });
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});
    try {
      const data = {
        title: titulo.trim(),
        category: categoria.trim(),
        items: items.map((text, index) => ({ position: index + 1, name: text.trim() })),
      };
      if (esEdicion) await updateRanking(id, data);
      else await addRanking(data);
      router.back();
    } catch {
      setErrores({ general: 'Error al guardar el ranking' });
    }
  };

  return (
    <View style={styles.flex}>
      <View style={styles.cabecera}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={palette.purpleLight} />
          <Text style={styles.volverText}>Volver</Text>
        </TouchableOpacity>
        <View style={styles.cabeceraDerechaTitulo}>
          <Text style={styles.cabeceraEmoji}>🏆</Text>
          <Text style={styles.cabeceraTitulo}>{esEdicion ? 'Editar ranking' : 'Nuevo ranking'}</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>TÍTULO</Text>
        <TextInput
          ref={tituloRef}
          style={[styles.input, errores.title ? styles.inputError : null]}
          placeholder="Ej: Películas favoritas, Mejores canciones..."
          placeholderTextColor={palette.textMuted}
          value={titulo}
          onChangeText={setTitulo}
          returnKeyType="next"
          onSubmitEditing={() => categoriaRef.current?.focus()}
          blurOnSubmit={false}
        />
        {errores.title ? <Text style={styles.error}>{errores.title}</Text> : null}

        <Text style={styles.label}>CATEGORÍA</Text>
        <TextInput
          ref={categoriaRef}
          style={[styles.input, errores.category ? styles.inputError : null]}
          placeholder="Ej: Música, Películas, Comida..."
          placeholderTextColor={palette.textMuted}
          value={categoria}
          onChangeText={setCategoria}
          returnKeyType="next"
          onSubmitEditing={() => itemRefs.current[0]?.focus()}
          blurOnSubmit={false}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sugerenciasContent} style={styles.sugerencias}>
          {CATEGORIAS_SUGERIDAS.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.pillCategoria, categoria === cat && styles.pillCategoriaActiva]} onPress={() => setCategoria(cat)}>
              <Text style={[styles.pillCategoriaText, categoria === cat && styles.pillCategoriaTextActiva]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errores.category ? <Text style={styles.error}>{errores.category}</Text> : null}

        <Text style={styles.label}>TOP 5</Text>
        {items.map((item, index) => {
          const medalColor = medalColors[index];
          const rowStyle = index < 3 ? { borderColor: medalColor + 'aa', backgroundColor: medalColor + '12' } : null;
          const badgeStyle = index < 3 ? { borderColor: medalColor, backgroundColor: medalColor + '24' } : styles.badgeNormal;
          return (
            <View key={index} style={[styles.itemRow, rowStyle]}>
              <View style={[styles.badge, badgeStyle]}>
                {index < 3 ? <Text style={styles.badgeEmoji}>{medalEmojis[index]}</Text> : <Text style={styles.badgeNumero}>{index + 1}</Text>}
              </View>
              <TextInput
                ref={(el) => { itemRefs.current[index] = el; }}
                style={styles.itemInput}
                placeholder={`Posición ${index + 1}`}
                placeholderTextColor={palette.textMuted}
                value={item}
                onChangeText={(valor) => actualizarItem(index, valor)}
                returnKeyType={index < 4 ? 'next' : 'done'}
                onSubmitEditing={() => {
                  if (index < 4) itemRefs.current[index + 1]?.focus();
                }}
                blurOnSubmit={index === 4}
              />
            </View>
          );
        })}
        {errores.items ? <Text style={styles.error}>{errores.items}</Text> : null}
        {errores.general ? <Text style={styles.error}>{errores.general}</Text> : null}

        <View style={styles.botonesRow}>
          <TouchableOpacity style={styles.botonCancelar} onPress={() => router.back()}>
            <Text style={styles.botonCancelarText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonGuardar} onPress={guardar}>
            <Text style={styles.botonGuardarText}>{esEdicion ? 'Guardar cambios' : 'Crear ranking'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: palette.background },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14 },
  botonVolver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8b3ff540',
    backgroundColor: palette.surface,
  },
  volverText: { fontWeight: '700', color: palette.text, fontSize: 14 },
  cabeceraDerechaTitulo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  cabeceraEmoji: { fontSize: 24 },
  cabeceraTitulo: { color: palette.text, fontSize: 24, fontWeight: '800' },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8, marginTop: 16, color: palette.textMuted },
  input: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1, backgroundColor: palette.surface, color: palette.text, borderColor: palette.border },
  inputError: { borderColor: palette.danger },
  sugerencias: { marginTop: 8, maxHeight: 34, flexGrow: 0 },
  sugerenciasContent: { gap: 6, alignItems: 'center' },
  pillCategoria: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 22,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    height: 32,
    justifyContent: 'center',
  },
  pillCategoriaActiva: { backgroundColor: palette.purple, borderColor: palette.purple },
  pillCategoriaText: { color: palette.textSoft, fontSize: 14, fontWeight: '700' },
  pillCategoriaTextActiva: { color: '#fff' },
  error: { color: palette.danger, fontSize: 12, marginTop: 4 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  badge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  badgeNormal: { backgroundColor: palette.surface, borderColor: palette.border },
  badgeEmoji: { fontSize: 22 },
  badgeNumero: { fontWeight: '800', fontSize: 18, color: palette.textSoft },
  itemInput: { flex: 1, paddingVertical: 9, paddingHorizontal: 4, fontSize: 16, color: palette.text },
  botonesRow: { flexDirection: 'row', gap: 14, marginTop: 24 },
  botonCancelar: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center', borderColor: palette.border, backgroundColor: palette.surface },
  botonCancelarText: { fontSize: 15, fontWeight: '700', color: palette.textSoft },
  botonGuardar: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: palette.purple, alignItems: 'center' },
  botonGuardarText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
