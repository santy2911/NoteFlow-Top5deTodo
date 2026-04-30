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
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { useRankingsStore } from '../../../store/rankingsStore';
import { Ranking, RankingItem } from '../../../types';

const rankingSchema = z.object({
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

const CATEGORY_COLORS: Record<string, string> = {
  música: '#534AB7',
  peliculas: '#E85D75',
  películas: '#E85D75',
  comida: '#F59E42',
};

function getCategoryColor(category: string): string {
  const key = category.toLowerCase().trim();
  return CATEGORY_COLORS[key] ?? '#6B7280';
}

export default function NuevoRanking() {
  const router = useRouter();
  const addRanking = useRankingsStore((state) => state.addRanking);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [items, setItems] = useState<string[]>(['', '', '', '', '']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };

  const handleGuardar = () => {
    const result = rankingSchema.safeParse({ title, category, items });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0]?.toString() ?? 'items';
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const rankingItems: [RankingItem, RankingItem, RankingItem, RankingItem, RankingItem] = items.map(
      (text, index) => ({
        id: `${Date.now()}-${index}`,
        text: text.trim(),
        position: index + 1,
      })
    ) as [RankingItem, RankingItem, RankingItem, RankingItem, RankingItem];

    const newRanking: Ranking = {
      id: Date.now().toString(),
      title: title.trim(),
      category: category.trim(),
      categoryColor: getCategoryColor(category),
      isFavorite: false,
      items: rankingItems,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addRanking(newRanking);
    router.back();
  };

  const handleCancelar = () => {
    router.back();
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
        <Text style={styles.titulo}>Nuevo ranking</Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={[styles.input, errors.title ? styles.inputError : null]}
          placeholder="Ej: Mejores álbumes de los 90"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />
        {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}

        <Text style={styles.label}>Categoría</Text>
        <TextInput
          style={[styles.input, errors.category ? styles.inputError : null]}
          placeholder="Ej: Música, Películas, Comida..."
          placeholderTextColor="#666"
          value={category}
          onChangeText={setCategory}
        />
        {errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}

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
              onChangeText={(value) => updateItem(index, value)}
            />
          </View>
        ))}
        {errors.items ? <Text style={styles.error}>{errors.items}</Text> : null}

        <View style={styles.botonesRow}>
          <TouchableOpacity style={styles.botonCancelar} onPress={handleCancelar}>
            <Text style={styles.botonCancelarText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
            <Text style={styles.botonGuardarText}>Crear ranking</Text>
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