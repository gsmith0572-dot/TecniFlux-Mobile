import { Redirect } from 'expo-router';

export default function Index() {
  // SIEMPRE redirigir a login primero - usando Redirect de expo-router
  return <Redirect href="/login" />;
}
