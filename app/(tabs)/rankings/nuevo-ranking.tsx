import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { z } from 'zod';
import { useRankingsStore } from '../../../store/rankingsStore';

const esquemaRanking = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  category: z.string().min(1, 'La categoría no puede estar vacía'),
  items: z
    .array(z.string())
    .length(5)
    .refine(
      (items) => items.some((item) => item.trim().length > 0),
      'Añade al menos un item'
    ),
});

export default function NuevoRanking() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rankings, addRanking, updateRanking } = useRankingsStore();

  const rankingExistente = id ? rankings.find((r) => r.id === id) : null;
  const esEdicion = !!rankingExistente;

  const [titulo, setTitulo] = useState(rankingExistente?.title ?? '');
  const [categoria, setCategoria] = useState(rankingExistente?.category ?? '');
  const [items, setItems] = useState<string[]>(
    rankingExistente ? rankingExistente.items.map((i) => i.text) : ['', '', '', '', '']
  );
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
      if (esEdicion) {
        await updateRanking(id, {
          title: titulo.trim(),
          category: categoria.trim(),
        });
      } else {
        await addRanking({
          title: titulo.trim(),
          category: categoria.trim(),
          items: items.map((text, index) => ({
            position: index + 1,
            title: text.trim(),
          })),
        });
      }
      router.back();
    } catch {
      setErrores({ general: 'Error al guardar el ranking' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>{esEdicion ? 'Editar ranking' : 'Nuevo ranking'}</Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={[styles.input, errores.title ? styles.inputError : null]}
          placeholder="Ej: Películas favoritas, Mejores canciones..."
          placeholderTextColor="#666"
          value={titulo}
          onChangeText={setTitulo}
        />
        {errores.title ? <Text style={styles.error}>{errores.title}</Text> : null}

        <Text style={styles.label}>Categoría</Text>
        <TextInput
          style={[styles.input, errores.category ? styles.inputError : null]}
          placeholder="Ej: Música, Películas, Comida..."
          placeholderTextColor="#666"
          value={categoria}
          onChangeText={setCategoria}
        />
        {errores.category ? <Text style={styles.error}>{errores.category}</Text> : null}

        <Text style={styles.label}>Top 5</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
            <TextInput
              style={styles.itemInput}
              placeholder={`Posición ${index + 1}`}
              placeholderTextColor="#666"
              value={item}
              onChangeText={(valor) => actualizarItem(index, valor)}
            />
          </View>
        ))}
        {errores.items ? <Text style={styles.error}>{errores.items}</Text> : null}
        {errores.general ? <Text style={styles.error}>{errores.general}</Text> : null}

        <View style={styles.botonesRow}>
          <TouchableOpacity style={styles.botonCancelar} onPress={() => router.back()}>
            <Text style={styles.botonCancelarText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonGuardar} onPress={guardar}>
            <Text style={styles.botonGuardarText}>
              {esEdicion ? 'Guardar cambios' : 'Crear ranking'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 28,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#242424',
    color: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: {
    borderColor: '#E85D75',
  },
  error: {
    color: '#E85D75',
    fontSize: 12,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#534AB7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemInput: {
    flex: 1,
    backgroundColor: '#242424',
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  botonesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  botonCancelar: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
  },
  botonCancelarText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '600',
  },
  botonGuardar: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#534AB7',
    alignItems: 'center',
  },
  botonGuardarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});