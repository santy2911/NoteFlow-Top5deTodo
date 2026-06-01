import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Avatar, Button } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { useRankingsStore } from '../../store/rankingsStore';
import { useTheme } from '../../constants/theme';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const COLOR_ACENTO = '#534AB7';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface PerfilUsuario {
  nombre: string;
  email: string;
  avatarUrl: string | null;
}

export default function Estadisticas() {
  const { colors } = useTheme();
  const rankings = useRankingsStore((s) => s.rankings);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    const usuario = auth().currentUser;
    if (!usuario) return;

    firestore()
      .collection('usuarios')
      .doc(usuario.uid)
      .get()
      .then((doc) => {
        if (doc.exists()) {
          setPerfil(doc.data() as PerfilUsuario);
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

      const usuario = auth().currentUser;
      if (!usuario) return;

      await firestore().collection('usuarios').doc(usuario.uid).update({
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
            await auth().signOut();
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

function TarjetaMetrica({ label, valor }: { label: string; valor: number }) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.tarjetaValor}>{valor}</Text>
      <Text style={styles.tarjetaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A'
   },
  content: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16
   },
  perfilSeccion: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
   },
  avatarIcon: {
    backgroundColor: '#333'
   },
  cambiarFotoTexto: {
    color: '#534AB7',
    fontSize: 13, 
    marginTop: 4
   },
  perfilNombre: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold'
   },
  perfilEmail: {
     color: '#888',
     fontSize: 14
   },
  titulo: {
     color: '#fff',
     fontSize: 28,
     fontWeight: 'bold', 
     marginBottom: 4 
   },
  grid: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     gap: 12 
   },
  tarjeta: {
     backgroundColor: '#242424',
     borderRadius: 12,
     padding: 16,
     width: '47%' 
   },
  tarjetaValor: {
     color: '#fff',
     fontSize: 32,
     fontWeight: 'bold'
   },
  tarjetaLabel: {
     color: '#888',
     fontSize: 13,
     marginTop: 4 
   },
  card: {
     backgroundColor: '#242424',
     borderRadius: 12,
     padding: 16,
     gap: 12 
   },
  cardTitulo: {
     color: '#fff',
     fontSize: 16,
     fontWeight: '600'
   },
  barraFila: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8
   },
  barraLabel: {
     color: '#ccc',
     fontSize: 13,
     width: 80
   },
  barraTrack: {
     flex: 1,
     height: 8,
     backgroundColor: '#333',
     borderRadius: 4,
     overflow: 'hidden'
   },
  barraRelleno: {
     height: '100%',
     borderRadius: 4
   },
  barraCantidad: {
     color: '#888',
     fontSize: 13,
     width: 16,
     textAlign: 'right'
   },
  itemTopTexto: {
     color: '#fff',
     fontSize: 18,
     fontWeight: '600'
   },
  itemTopSub: {
     color: '#888',
     fontSize: 13
   },
  vacio: {
     color: '#555',
     fontSize: 14
   },
  botonCerrarSesion: {
     borderColor: '#ff4444',
     marginTop: 8
   },
});