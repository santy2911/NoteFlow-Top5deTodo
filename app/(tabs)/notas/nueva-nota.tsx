import { useState, useRef } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNotasStore } from '@/store/notasStore';
import { palette, useTheme } from '@/constants/theme';
import { Bloque } from '@/types';
import { nanoid } from 'nanoid/non-secure';

export default function NuevaNota() {
  const router = useRouter();
  const { agregarNota } = useNotasStore();
  const { colors, typography, spacing } = useTheme();

  const [titulo, setTitulo] = useState('');
  const [bloques, setBloques] = useState<Bloque[]>([
    { id: nanoid(), tipo: 'texto', contenido: '', subrayado: false, esChecklist: false },
  ]);
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [menuImagenVisible, setMenuImagenVisible] = useState(false);
  const [bloqueActivoId, setBloqueActivoId] = useState<string | null>(null);

  const inputsRef = useRef<Record<string, TextInput | null>>({});

  const totalCaracteres = bloques.reduce((acc, b) => acc + b.contenido.length, 0) + titulo.length;

  const actualizarBloque = (bloqueId: string, cambios: Partial<Bloque>) => {
    setBloques((prev) =>
      prev.map((b) => (b.id === bloqueId ? { ...b, ...cambios } : b))
    );
  };

  const toggleSubrayado = () => {
    if (!bloqueActivoId) return;
    const bloque = bloques.find((b) => b.id === bloqueActivoId);
    if (!bloque) return;
    actualizarBloque(bloqueActivoId, { subrayado: !bloque.subrayado });
  };

  const enfocarBloque = (bloqueId: string) => {
    setBloqueActivoId(bloqueId);
    setTimeout(() => inputsRef.current[bloqueId]?.focus(), 50);
  };

  const insertarBloqueDespues = (bloqueId: string, nuevo: Bloque, contenidoActual?: string) => {
    setBloques((prev) => {
      const idx = prev.findIndex((b) => b.id === bloqueId);
      if (idx === -1) return prev;
      const copia = [...prev];
      if (contenidoActual !== undefined) {
        copia[idx] = { ...copia[idx], contenido: contenidoActual };
      }
      copia.splice(idx + 1, 0, nuevo);
      return copia;
    });
    enfocarBloque(nuevo.id);
  };

  const toggleChecklist = () => {
    if (!bloqueActivoId) return;
    const bloque = bloques.find((b) => b.id === bloqueActivoId);
    if (!bloque) return;
    if (!bloque.esChecklist) {
      actualizarBloque(bloqueActivoId, { esChecklist: true, completado: false });
      enfocarBloque(bloqueActivoId);
    } else {
      actualizarBloque(bloqueActivoId, { esChecklist: false, completado: false });
      enfocarBloque(bloqueActivoId);
    }
  };

  const crearBloqueAlPulsarEnter = (bloqueId: string, contenidoActual?: string, contenidoNuevo = '') => {
    const bloque = bloques.find((b) => b.id === bloqueId);
    if (!bloque) return;
    const nuevo: Bloque = {
      id: nanoid(),
      tipo: 'texto',
      contenido: contenidoNuevo,
      subrayado: bloque.subrayado ?? false,
      esChecklist: bloque.esChecklist ?? false,
      completado: bloque.esChecklist ? false : undefined,
    };
    insertarBloqueDespues(bloqueId, nuevo, contenidoActual);
  };

  const cambiarContenidoBloque = (bloqueId: string, texto: string) => {
    const saltoLineaIndex = texto.indexOf('\n');
    if (saltoLineaIndex === -1) {
      actualizarBloque(bloqueId, { contenido: texto });
      return;
    }
    const contenidoActual = texto.slice(0, saltoLineaIndex);
    const contenidoNuevo = texto.slice(saltoLineaIndex + 1);
    crearBloqueAlPulsarEnter(bloqueId, contenidoActual, contenidoNuevo);
  };

  const volverANotas = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/notas');
    }
  };

  const eliminarBloque = (bloqueId: string) => {
    setBloques((prev) => {
      if (prev.length === 1) return [{ id: nanoid(), tipo: 'texto', contenido: '', subrayado: false, esChecklist: false }];
      return prev.filter((b) => b.id !== bloqueId);
    });
  };


  const borrarBloqueVacio = (bloqueId: string) => {
    const index = bloques.findIndex((b) => b.id === bloqueId);
    if (index <= 0) return;
    const bloque = bloques[index];
    if (bloque.contenido.length > 0) return;
    const anterior = bloques[index - 1];
    setBloques((prev) => prev.filter((b) => b.id !== bloqueId));
    setBloqueActivoId(anterior.id);
    setTimeout(() => inputsRef.current[anterior.id]?.focus(), 50);
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
      const bloquesParaGuardar = bloques.map((b) => ({
        ...b,
        tipo: b.esChecklist ? 'checklist' : 'texto' as 'texto' | 'checklist',
      }));
      await agregarNota({
        titulo: titulo.trim(),
        contenido: '',
        tiene_checklist: bloques.some((b) => b.esChecklist),
        imagen_uri: imagenUri,
        checklist: [],
        bloques: bloquesParaGuardar,
      });
      volverANotas();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la nota.');
    } finally {
      setGuardando(false);
    }
  };

  const bloqueActivo = bloques.find((b) => b.id === bloqueActivoId);

  return (
    <KeyboardAvoidingView
      style={[styles.contenedor, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.cabecera}>
        <TouchableOpacity style={styles.botonVolver} onPress={volverANotas}>
          <Ionicons name="arrow-back" size={18} color={palette.purpleLight} />
          <Text style={styles.textoVolver}>
            Volver
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={guardar}
          disabled={guardando}
          style={styles.botonGuardar}
        >
          <Ionicons name="save-outline" size={15} color="#fff" />
          <Text style={styles.textoGuardar}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 16 }}>
        <TextInput
          placeholder="Título de la nota..."
          placeholderTextColor={colors.text.muted}
          value={titulo}
          onChangeText={setTitulo}
          style={[
            styles.inputTitulo,
            { color: colors.text.primary, fontSize: typography.sizes.xxl, borderBottomColor: colors.border },
          ]}
        />

        {bloques.map((bloque) => (
          <View key={bloque.id} style={styles.filaBloque}>
            {bloque.esChecklist && (
              <TouchableOpacity
                onPress={() => actualizarBloque(bloque.id, { completado: !bloque.completado })}
              >
                <Ionicons
                  name={bloque.completado ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={bloque.completado ? colors.primary : colors.text.secondary}
                />
              </TouchableOpacity>
            )}
            <TextInput
              ref={(r) => { inputsRef.current[bloque.id] = r; }}
              placeholder="Escribe algo..."
              placeholderTextColor={colors.text.muted}
              value={bloque.contenido}
              onChangeText={(t) => cambiarContenidoBloque(bloque.id, t)}
              onFocus={() => setBloqueActivoId(bloque.id)}
              onKeyPress={(e) => {
                if (e.nativeEvent.key === 'Backspace') borrarBloqueVacio(bloque.id);
              }}
              blurOnSubmit={false}
              returnKeyType="default"
              multiline
              style={[
                bloque.esChecklist ? styles.inputItem : styles.inputTexto,
                {
                  color: bloque.completado ? colors.text.muted : colors.text.primary,
                  fontSize: typography.sizes.md,
                  textDecorationLine: bloque.completado
                    ? 'line-through'
                    : bloque.subrayado
                    ? 'underline'
                    : 'none',
                },
              ]}
            />
            {bloque.esChecklist && (
              <TouchableOpacity onPress={() => eliminarBloque(bloque.id)}>
                <Ionicons name="close" size={20} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {imagenUri && (
          <View style={{ marginTop: 12 }}>
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

      <View style={styles.contadorFila}>
        <Text style={[styles.contadorTexto, { color: colors.text.muted, fontSize: typography.sizes.xs }]}>
          {totalCaracteres} caracteres
        </Text>
      </View>

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
          onPress={toggleSubrayado}
          style={[styles.botonBarra, bloqueActivo?.subrayado && { backgroundColor: colors.border, borderRadius: 8 }]}
        >
          <Text style={[
            styles.textoSubrayado,
            { color: bloqueActivo?.subrayado ? colors.primary : colors.text.secondary, fontSize: typography.sizes.lg },
          ]}>
            S
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleChecklist}
          style={[styles.botonBarra, bloqueActivo?.esChecklist && { backgroundColor: colors.border, borderRadius: 8 }]}
        >
          <Ionicons
            name="checkbox-outline"
            size={24}
            color={bloqueActivo?.esChecklist ? colors.primary : colors.text.secondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMenuImagenVisible((prev) => !prev)}
          style={[styles.botonBarra, menuImagenVisible && { backgroundColor: colors.border, borderRadius: 8 }]}
        >
          <Ionicons
            name="image-outline"
            size={24}
            color={menuImagenVisible ? colors.primary : colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
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
  textoVolver: {
    color: palette.text,
    fontWeight: '700',
    fontSize: 14,
  },
  botonGuardar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: palette.purple,
  },
  textoGuardar: { color: '#fff', fontWeight: '600', fontSize: 13 },
  inputTitulo: {
    fontWeight: '700',
    paddingTop: 12,
    paddingBottom: 12,
    lineHeight: 32,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  inputTexto: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    textAlignVertical: 'top',
    lineHeight: 24,
    paddingVertical: 4,
    minHeight: 36,
  },
  filaBloque: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  inputItem: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    textAlignVertical: 'top',
    lineHeight: 22,
    paddingVertical: 2,
    minHeight: 36,
  },
  imagen: { width: '100%', height: 200, borderRadius: 10 },
  quitarImagen: { position: 'absolute', top: 8, right: 8, borderRadius: 999, padding: 4 },
  contadorFila: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  contadorTexto: {},
  barraEdicion: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  botonBarra: { padding: 8 },
  textoSubrayado: { fontWeight: '700', textDecorationLine: 'underline' },
  menuImagen: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  opcionMenu: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  textoOpcion: { fontWeight: '500' },
  separador: { height: 1 },
});

