import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

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
      const credencial = await auth().createUserWithEmailAndPassword(email, password);
      const uid = credencial.user.uid;

      await firestore().collection('usuarios').doc(uid).set({
        nombre,
        email,
        avatarUrl: null,
        creadoEn: firestore.FieldValue.serverTimestamp(),
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

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formulario}>
        <Text variant="headlineMedium" style={styles.titulo}>
          Crear cuenta
        </Text>

        <TextInput
          label="Nombre"
          value={nombre}
          onChangeText={setNombre}
          mode="outlined"
          style={styles.input}
        />

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
          onPress={handleRegistro}
          loading={cargando}
          disabled={cargando}
          style={styles.boton}
        >
          Registrarse
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.boton}
        >
          ¿Ya tienes cuenta? Inicia sesión
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