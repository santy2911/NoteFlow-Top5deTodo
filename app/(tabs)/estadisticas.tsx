import { View, Text, StyleSheet } from 'react-native';

export default function Estadisticas() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Estadísticas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
});