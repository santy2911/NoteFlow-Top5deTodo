import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) {
      setError('Rellena todos los campos');
      return;
    }
    try {
      setCargando(true);
      setError('');
      await auth().signInWithEmailAndPassword(email, password);
      router.replace('/(tabs)/rankings');
    } catch (e: any) {
      setError('Correo o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formulario}>
        <Text variant="headlineMedium" style={styles.titulo}>
          Iniciar sesión
        </Text>

        <TextInput
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />

        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={cargando}
          disabled={cargando}
          style={styles.boton}
        >
          Entrar
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/registro')}
          style={styles.boton}
        >
          ¿No tienes cuenta? Regístrate
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  formulario: {
    paddingHorizontal: 24,
  },
  titulo: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  boton: {
    marginTop: 8,
  },
});