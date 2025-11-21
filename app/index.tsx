import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';

export default function Index() {
  // Por ahora redirige a login, luego puedes agregar lógica de autenticación
  return <Redirect href="/login" />;
}

