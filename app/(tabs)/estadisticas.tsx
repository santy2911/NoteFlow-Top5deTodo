import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Avatar, Button } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useRankingsStore } from '../../store/rankingsStore';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface PerfilUsuario {
  nombre: string;
  email: string;
  avatarUrl: string | null;
}

const METRICAS = [
  { key: 'rankings', label: 'Rankings totales', emoji: '🏆', bg: '#2a1f00', border: '#f59e0b' },
  { key: 'favoritos', label: 'Favoritos', emoji: '⭐', bg: '#2a0018', border: '#ec4899' },
  { key: 'items', label: 'Ítems totales', emoji: '📋', bg: '#00202a', border: '#06b6d4' },
  { key: 'categorias', label: 'Categorías', emoji: '🏷️', bg: '#1a0a2a', border: '#a855f7' },
];

export default function Estadisticas() {
  const rankings = useRankingsStore((s) => s.rankings);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    const usuario = getAuth().currentUser;
    if (!usuario) return;

    const db = getFirestore();
    getDoc(doc(db, 'usuarios', usuario.uid)).then((snap) => {
      if (snap.exists()) {
        setPerfil(snap.data() as PerfilUsuario);
      }
    });
  }, []);

  async function cambiarFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (resultado.canceled) return;

    try {
      setSubiendoFoto(true);
      const uri = resultado.assets[0].uri;
      const fileName = uri.split('/').pop() ?? 'avatar.jpg';

      const res = await fetch(`${API_URL}/avatar?fileName=${fileName}`);
      const { signedUrl, publicUrl } = await res.json();

      const imagen = await fetch(uri);
      const blob = await imagen.blob();

      await fetch(signedUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'image/jpeg' },
      });

      const usuario = getAuth().currentUser;
      if (!usuario) return;

      const db = getFirestore();
      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        avatarUrl: publicUrl,
      });

      setPerfil((prev) => prev ? { ...prev, avatarUrl: publicUrl } : prev);
    } catch (e) {
      Alert.alert('Error', 'No se pudo subir la foto');
    } finally {
      setSubiendoFoto(false);
    }
  }

  function confirmarCerrarSesion() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await getAuth().signOut();
            router.replace('/login');
          },
        },
      ]
    );
  }

  const totalRankings = rankings.length;
  const totalFavoritos = rankings.filter((r) => r.is_favorite).length;
  const totalItems = rankings.length * 5;
  const categorias = [...new Set(rankings.map((r) => r.category))];

  const valoresMetricas: Record<string, number> = {
    rankings: totalRankings,
    favoritos: totalFavoritos,
    items: totalItems,
    categorias: categorias.length,
  };

  const porCategoria = categorias.map((cat) => ({
    nombre: cat,
    cantidad: rankings.filter((r) => r.category === cat).length,
  }));
  const maxCantidad = Math.max(...porCategoria.map((c) => c.cantidad), 1);

  const COLORES_CATEGORIA = ['#7c3aed', '#f59e0b', '#ec4899', '#10b981', '#3b82f6', '#e11d48'];

  const todosLosItems = rankings.flatMap((r) => (r.items ?? []).map((i) => i.name));
  const frecuencia: Record<string, number> = {};
  todosLosItems.forEach((name) => {
    frecuencia[name] = (frecuencia[name] ?? 0) + 1;
  });
  const itemTop = Object.entries(frecuencia).sort((a, b) => b[1] - a[1])[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.perfilSeccion}>
        <TouchableOpacity onPress={cambiarFoto} disabled={subiendoFoto}>
          {perfil?.avatarUrl ? (
            <Avatar.Image size={90} source={{ uri: perfil.avatarUrl }} />
          ) : (
            <Avatar.Icon size={90} icon="account" style={styles.avatarIcon} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={cambiarFoto} disabled={subiendoFoto}>
          <Text style={styles.cambiarFotoTexto}>
            {subiendoFoto ? 'Subiendo...' : 'Cambiar foto'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.perfilNombre}>{perfil?.nombre ?? '...'}</Text>
        <Text style={styles.perfilEmail}>{perfil?.email ?? '...'}</Text>
      </View>

      <Text style={styles.titulo}>Estadísticas</Text>

      <View style={styles.grid}>
        {METRICAS.map((m) => (
          <View key={m.key} style={[styles.tarjeta, { backgroundColor: m.bg, borderColor: m.border + '40' }]}>
            <Text style={styles.tarjetaEmoji}>{m.emoji}</Text>
            <Text style={styles.tarjetaValor}>{valoresMetricas[m.key]}</Text>
            <Text style={styles.tarjetaLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Rankings por categoría</Text>
        <Text style={styles.cardSubtitulo}>Distribución de tus top 5</Text>
        {porCategoria.length === 0 ? (
          <Text style={styles.vacio}>Sin datos aún</Text>
        ) : (
          porCategoria.map((cat, idx) => {
            const color = COLORES_CATEGORIA[idx % COLORES_CATEGORIA.length];
            return (
              <View key={cat.nombre} style={styles.barraFila}>
                <Text style={styles.barraLabel} numberOfLines={1}>{cat.nombre}</Text>
                <View style={styles.barraTrack}>
                  <View
                    style={[
                      styles.barraRelleno,
                      {
                        width: `${(cat.cantidad / maxCantidad) * 100}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barraCantidad, { color }]}>{cat.cantidad}</Text>
              </View>
            );
          })
        )}
      </View>

      {itemTop && (
        <View style={styles.cardItemTop}>
          <Text style={styles.itemTopEtiqueta}>🏅 ÍTEM MÁS REPETIDO</Text>
          <Text style={styles.itemTopTexto}>{itemTop[0]}</Text>
          <Text style={styles.itemTopSub}>
            Aparece en {itemTop[1]} {itemTop[1] === 1 ? 'ranking' : 'rankings'}
          </Text>
        </View>
      )}

      <Button
        mode="outlined"
        onPress={confirmarCerrarSesion}
        icon="logout"
        textColor="#ff4444"
        style={styles.botonCerrarSesion}
      >
        Cerrar sesión
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  perfilSeccion: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatarIcon: {
    backgroundColor: '#16162a',
  },
  cambiarFotoTexto: {
    color: '#534AB7',
    fontSize: 13,
    marginTop: 4,
  },
  perfilNombre: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  perfilEmail: {
    color: '#9090b0',
    fontSize: 14,
  },
  titulo: {
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
  tarjeta: {
    borderRadius: 14,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    gap: 4,
  },
  tarjetaEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  tarjetaValor: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  tarjetaLabel: {
    color: '#9090b0',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#16162a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252540',
    gap: 10,
  },
  cardTitulo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitulo: {
    color: '#9090b0',
    fontSize: 12,
    marginTop: -6,
  },
  barraFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barraLabel: {
    color: '#ccc',
    fontSize: 13,
    width: 90,
  },
  barraTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#252540',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    borderRadius: 4,
  },
  barraCantidad: {
    fontSize: 13,
    fontWeight: '600',
    width: 18,
    textAlign: 'right',
  },
  cardItemTop: {
    backgroundColor: '#16162a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f59e0b40',
    gap: 4,
  },
  itemTopEtiqueta: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  itemTopTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  itemTopSub: {
    color: '#9090b0',
    fontSize: 13,
  },
  vacio: {
    color: '#55556a',
    fontSize: 14,
  },
  botonCerrarSesion: {
    borderColor: '#ff4444',
    marginTop: 8,
  },
});