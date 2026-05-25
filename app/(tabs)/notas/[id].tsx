import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNotasStore } from '@/store/notasStore';
import { useTheme } from '@/constants/theme';
import { Bloque } from '@/types';
import { nanoid } from 'nanoid/non-secure';

export default function DetalleNota() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notas, actualizarNota, eliminarNota } = useNotasStore();
  const { colors, typography, spacing } = useTheme();

  const nota = notas.find((n) => n.id === id);

  const normalizarBloques = (bloques: Bloque[]): Bloque[] => {
    const resultado: Bloque[] = [];
    for (const bloque of bloques) {
      if (bloque.tipo === 'texto') {
        const lineas = bloque.contenido.split('\n');
        for (const linea of lineas) {
          resultado.push({ id: nanoid(), tipo: 'texto', contenido: linea, subrayado: bloque.subrayado ?? false });
        }
      } else {
        resultado.push(bloque);
      }
    }
    return resultado.length ? resultado : [{ id: nanoid(), tipo: 'texto', contenido: '', subrayado: false }];
  };

  const [titulo, setTitulo] = useState(nota?.titulo ?? '');
  const [bloques, setBloques] = useState<Bloque[]>(
    nota?.bloques?.length ? normalizarBloques(nota.bloques) : [{ id: nanoid(), tipo: 'texto', contenido: '', subrayado: false }]
  );
  const [imagenUri, setImagenUri] = useState<string | null>(nota?.imagenUri ?? null);
  const [guardando, setGuardando] = useState(false);
  const [menuImagenVisible, setMenuImagenVisible] = useState(false);
  const [bloqueActivoId, setBloqueActivoId] = useState<string | null>(null);
  const [modoChecklist, setModoChecklist] = useState(false);

  const inputsRef = useRef<Record<string, TextInput | null>>({});

  useEffect(() => {
    if (!nota) volverANotas();
  }, [nota]);

  const actualizarBloque = (bloqueId: string, cambios: Partial<Bloque>) => {
    setBloques((prev) =>
      prev.map((b) => (b.id === bloqueId ? { ...b, ...cambios } : b))
    );
  };

  const volverANotas = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/notas');
    }
  };

  const insertarBloqueDespuesDeActivo = (nuevo: Bloque) => {
    setBloques((prev) => {
      if (!bloqueActivoId) return [...prev, nuevo];
      const idx = prev.findIndex((b) => b.id === bloqueActivoId);
      const copia = [...prev];
      copia.splice(idx + 1, 0, nuevo);
      return copia;
    });
    setBloqueActivoId(nuevo.id);
    setTimeout(() => inputsRef.current[nuevo.id]?.focus(), 100);
  };

  const onEnterTexto = (bloqueId: string) => {
    const bloque = bloques.find((b) => b.id === bloqueId);
    const nuevo: Bloque = {
      id: nanoid(),
      tipo: 'texto',
      contenido: '',
      subrayado: bloque?.subrayado ?? false,
    };
    setBloques((prev) => {
      const idx = prev.findIndex((b) => b.id === bloqueId);
      const copia = [...prev];
      copia.splice(idx + 1, 0, nuevo);
      return copia;
    });
    setBloqueActivoId(nuevo.id);
    setTimeout(() => inputsRef.current[nuevo.id]?.focus(), 100);
  };

  const onEnterChecklist = (bloqueId: string) => {
    if (modoChecklist) {
      const nuevo: Bloque = { id: nanoid(), tipo: 'checklist', contenido: '', completado: false };
      setBloques((prev) => {
        const idx = prev.findIndex((b) => b.id === bloqueId);
        const copia = [...prev];
        copia.splice(idx + 1, 0, nuevo);
        return copia;
      });
      setBloqueActivoId(nuevo.id);
      setTimeout(() => inputsRef.current[nuevo.id]?.focus(), 100);
    } else {
      const nuevo: Bloque = { id: nanoid(), tipo: 'texto', contenido: '', subrayado: false };
      setBloques((prev) => {
        const idx = prev.findIndex((b) => b.id === bloqueId);
        const copia = [...prev];
        copia.splice(idx + 1, 0, nuevo);
        return copia;
      });
      setBloqueActivoId(nuevo.id);
      setTimeout(() => inputsRef.current[nuevo.id]?.focus(), 100);
    }
  };

  const toggleSubrayado = () => {
    if (!bloqueActivoId) return;
    const bloque = bloques.find((b) => b.id === bloqueActivoId);
    if (!bloque) return;
    actualizarBloque(bloqueActivoId, { subrayado: !bloque.subrayado });
  };

  const toggleModoChecklist = () => {
    const nuevoModo = !modoChecklist;
    setModoChecklist(nuevoModo);
    if (nuevoModo) {
      const nuevo: Bloque = { id: nanoid(), tipo: 'checklist', contenido: '', completado: false };
      insertarBloqueDespuesDeActivo(nuevo);
    }
  };

  const eliminarBloque = (bloqueId: string) => {
    setBloques((prev) => {
      if (prev.length === 1) return [{ id: nanoid(), tipo: 'texto', contenido: '', subrayado: false }];
      return prev.filter((b) => b.id !== bloqueId);
    });
  };

  const abrirGaleria = async () => {
    setMenuImagenVisible(false);
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!resultado.canceled) setImagenUri(resultado.assets[0].uri);
  };

  const abrirCamara = async () => {
    setMenuImagenVisible(false);
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu cámara.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!resultado.canceled) setImagenUri(resultado.assets[0].uri);
  };

  const guardar = async () => {
    const hayContenido = bloques.some((b) => b.contenido.trim());
    if (!titulo.trim() && !hayContenido) return;
    setGuardando(true);
    try {
      await actualizarNota(id, {
        titulo: titulo.trim(),
        contenido: '',
        tiene_checklist: bloques.some((b) => b.tipo === 'checklist'),
        imagen_uri: imagenUri,
        checklist: [],
        bloques,
      });
      volverANotas();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la nota.');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = () => {
    Alert.alert('Eliminar nota', '¿Seguro que quieres eliminar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarNota(id);
            volverANotas();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la nota.');
          }
        },
      },
    ]);
  };

  if (!nota) {
    return (
      <View style={[styles.centrado, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.contenedor, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.cabecera, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={volverANotas}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.accionesCabecera}>
          <TouchableOpacity onPress={confirmarEliminar} style={styles.botonEliminar}>
            <Ionicons name="trash-outline" size={22} color="#e11d48" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={guardar}
            disabled={guardando}
            style={[styles.botonGuardar, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.textoGuardar, { fontSize: typography.sizes.sm }]}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
        <TextInput
          placeholder="Título"
          placeholderTextColor={colors.text.muted}
          value={titulo}
          onChangeText={setTitulo}
          style={[
            styles.inputTitulo,
            { color: colors.text.primary, fontSize: typography.sizes.xl, borderBottomColor: colors.border },
          ]}
        />

        {bloques.map((bloque) => (
          <View key={bloque.id}>
            {bloque.tipo === 'texto' ? (
              <TextInput
                ref={(r) => { inputsRef.current[bloque.id] = r; }}
                placeholder="Escribe algo..."
                placeholderTextColor={colors.text.muted}
                value={bloque.contenido}
                onChangeText={(t) => actualizarBloque(bloque.id, { contenido: t })}
                onFocus={() => setBloqueActivoId(bloque.id)}
                onSubmitEditing={() => onEnterTexto(bloque.id)}
                blurOnSubmit={false}
                style={[
                  styles.inputTexto,
                  {
                    color: colors.text.primary,
                    fontSize: typography.sizes.md,
                    textDecorationLine: bloque.subrayado ? 'underline' : 'none',
                  },
                ]}
              />
            ) : (
              <View style={styles.filaChecklist}>
                <TouchableOpacity
                  onPress={() => actualizarBloque(bloque.id, { completado: !bloque.completado })}
                >
                  <Ionicons
                    name={bloque.completado ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={bloque.completado ? colors.primary : colors.text.secondary}
                  />
                </TouchableOpacity>
                <TextInput
                  ref={(r) => { inputsRef.current[bloque.id] = r; }}
                  placeholder=""
                  placeholderTextColor={colors.text.muted}
                  value={bloque.contenido}
                  onChangeText={(t) => actualizarBloque(bloque.id, { contenido: t })}
                  onFocus={() => setBloqueActivoId(bloque.id)}
                  onSubmitEditing={() => onEnterChecklist(bloque.id)}
                  blurOnSubmit={false}
                  style={[
                    styles.inputItem,
                    {
                      color: bloque.completado ? colors.text.muted : colors.text.primary,
                      fontSize: typography.sizes.md,
                      textDecorationLine: bloque.completado ? 'line-through' : bloque.subrayado ? 'underline' : 'none',
                    },
                  ]}
                />
                <TouchableOpacity onPress={() => eliminarBloque(bloque.id)}>
                  <Ionicons name="close" size={20} color={colors.text.muted} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {imagenUri && (
          <View>
            <Image source={{ uri: imagenUri }} style={styles.imagen} resizeMode="cover" />
            <TouchableOpacity
              onPress={() => setImagenUri(null)}
              style={[styles.quitarImagen, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="close" size={16} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {menuImagenVisible && (
        <View style={[styles.menuImagen, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity onPress={abrirCamara} style={styles.opcionMenu}>
            <Ionicons name="camera-outline" size={20} color={colors.text.primary} />
            <Text style={[styles.textoOpcion, { color: colors.text.primary, fontSize: typography.sizes.md }]}>
              Tomar foto
            </Text>
          </TouchableOpacity>
          <View style={[styles.separador, { backgroundColor: colors.border }]} />
          <TouchableOpacity onPress={abrirGaleria} style={styles.opcionMenu}>
            <Ionicons name="images-outline" size={20} color={colors.text.primary} />
            <Text style={[styles.textoOpcion, { color: colors.text.primary, fontSize: typography.sizes.md }]}>
              Subir foto
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.barraEdicion, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setMenuImagenVisible((prev) => !prev)}
          style={styles.botonBarra}
        >
          <Ionicons name="image-outline" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSubrayado} style={styles.botonBarra}>
          <Text style={[
            styles.textoSubrayado,
            {
              color: bloqueActivoId && bloques.find((b) => b.id === bloqueActivoId)?.subrayado
                ? colors.primary
                : colors.text.secondary,
              fontSize: typography.sizes.lg,
            },
          ]}>
            S
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleModoChecklist} style={styles.botonBarra}>
          <Ionicons
            name="checkbox-outline"
            size={24}
            color={modoChecklist ? colors.primary : colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  accionesCabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botonEliminar: { padding: 4 },
  botonGuardar: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  textoGuardar: { color: '#fff', fontWeight: '600' },
  inputTitulo: { fontWeight: '700', borderBottomWidth: 1, paddingBottom: 8 },
  inputTexto: { textAlignVertical: 'top', lineHeight: 24, paddingVertical: 4 },
  filaChecklist: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 },
  inputItem: { flex: 1 },
  imagen: { width: '100%', height: 200, borderRadius: 10, marginTop: 8 },
  quitarImagen: { position: 'absolute', top: 16, right: 8, borderRadius: 999, padding: 4 },
  barraEdicion: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  botonBarra: { padding: 6 },
  textoSubrayado: { fontWeight: '700', textDecorationLine: 'underline' },
  menuImagen: {
    position: 'absolute',
    bottom: 56,
    left: 16,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  opcionMenu: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  textoOpcion: { fontWeight: '500' },
  separador: { height: 1 },
});
