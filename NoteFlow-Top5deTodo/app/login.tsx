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
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { useTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [verPassword, setVerPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError('Rellena todos los campos');
      return;
    }
    try {
      setCargando(true);
      setError('');
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)/rankings');
    } catch (e: any) {
      setError('Correo o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  }

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
          <RNText style={styles.logoEmoji}>🏆</RNText>
        </View>

        <Text variant="headlineMedium" style={[styles.titulo, { color: colors.text.primary }]}>
          Bienvenido de nuevo
        </Text>
        <Text style={[styles.subtitulo, { color: colors.text.secondary }]}>
          Accede a tus rankings
        </Text>

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

        <TouchableOpacity style={styles.olvidaste}>
          <Text style={{ color: colors.primary, fontSize: 13 }}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <HelperText type="error" visible={!!error} style={{ color: colors.danger }}>
          {error}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={cargando}
          disabled={cargando}
          style={styles.boton}
          buttonColor={colors.primary}
          labelStyle={{ fontSize: 16, fontWeight: '600' }}
          contentStyle={{ paddingVertical: 8 }}
        >
          Entrar
        </Button>

        <TouchableOpacity style={styles.linkWrap} onPress={() => router.push('/registro')}>
          <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
            ¿No tienes cuenta?{' '}
            <Text style={{ color: colors.primary, fontSize: 13 }}>Regístrate</Text>
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
  olvidaste: {
    alignSelf: 'flex-end',
    marginBottom: 6,
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