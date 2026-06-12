import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput as RNTextInput,
  Text as RNText,
  ScrollView,
} from 'react-native';
import { Text, Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function RegistroScreen() {
  const { colors } = useTheme();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [verPassword, setVerPassword] = useState(false);

  function getFuerzaPassword(): { nivel: number; texto: string; color: string } {
    if (password.length === 0) return { nivel: 0, texto: '', color: 'transparent' };
    if (password.length < 6) return { nivel: 1, texto: 'Débil', color: colors.danger };
    if (password.length < 10) return { nivel: 2, texto: 'Media', color: colors.gold };
    return { nivel: 3, texto: 'Fuerte', color: '#10b981' };
  }

  async function handleRegistro() {
    if (!nombre || !email || !password) {
      setError('Rellena todos los campos');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      setCargando(true);
      setError('');
      const auth = getAuth();
      const credencial = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credencial.user.uid;

      const db = getFirestore();
      await setDoc(doc(db, 'usuarios', uid), {
        nombre,
        email,
        avatarUrl: null,
        creadoEn: serverTimestamp(),
      });

      router.replace('/(tabs)/rankings');
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError('Ese correo ya está registrado');
      } else {
        setError('Error al crear la cuenta');
      }
    } finally {
      setCargando(false);
    }
  }

  const fuerza = getFuerzaPassword();

  return (
    <KeyboardAvoidingView
      style={[styles.contenedor, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.formulario}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
          <RNText style={styles.logoEmoji}>✨</RNText>
        </View>

        <Text variant="headlineMedium" style={[styles.titulo, { color: colors.text.primary }]}>
          Crear cuenta
        </Text>
        <Text style={[styles.subtitulo, { color: colors.text.secondary }]}>
          Empieza a crear tus rankings
        </Text>

        <RNTextInput
          placeholder="Nombre"
          placeholderTextColor={colors.text.muted}
          value={nombre}
          onChangeText={setNombre}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary }]}
        />

        <RNTextInput
          placeholder="Correo electrónico"
          placeholderTextColor={colors.text.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text.primary }]}
        />

        <View style={[styles.inputWrap, { backgroundColor: colors.surface }]}>
          <RNTextInput
            placeholder="Contraseña"
            placeholderTextColor={colors.text.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!verPassword}
            style={[styles.inputInner, { color: colors.text.primary }]}
          />
          <TouchableOpacity onPress={() => setVerPassword(!verPassword)} style={styles.eyeBtn}>
            <Ionicons
              name={verPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.text.muted}
            />
          </TouchableOpacity>
        </View>

        {password.length > 0 && (
          <View style={styles.fuerzaWrap}>
            <View style={styles.fuerzaBars}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.fuerzaBar,
                    { backgroundColor: fuerza.nivel >= i ? fuerza.color : colors.border },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.fuerzaTexto, { color: fuerza.color }]}>
              {fuerza.texto}
            </Text>
          </View>
        )}

        <HelperText type="error" visible={!!error} style={{ color: colors.danger }}>
          {error}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleRegistro}
          loading={cargando}
          disabled={cargando}
          style={styles.boton}
          buttonColor={colors.primary}
          labelStyle={{ fontSize: 16, fontWeight: '600' }}
          contentStyle={{ paddingVertical: 8 }}
        >
          Registrarse
        </Button>

        <TouchableOpacity style={styles.linkWrap} onPress={() => router.back()}>
          <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
            ¿Ya tienes cuenta?{' '}
            <Text style={{ color: colors.primary, fontSize: 13 }}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
  },
  formulario: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
},
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoEmoji: {
    fontSize: 32,
  },
  titulo: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 15,
    marginBottom: 36,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 14,
  },
  inputWrap: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  inputInner: {
    flex: 1,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 4,
  },
  fuerzaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    marginTop: 2,
  },
  fuerzaBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  fuerzaBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  fuerzaTexto: {
    fontSize: 11,
    minWidth: 36,
    textAlign: 'right',
  },
  boton: {
    marginTop: 10,
    borderRadius: 30,
  },
  linkWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
});