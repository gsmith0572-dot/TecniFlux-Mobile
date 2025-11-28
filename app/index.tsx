import { Redirect } from 'expo-router';

export default function Index() {
  // SIEMPRE mostrar login primero - SIN EXCEPCIONES
  return <Redirect href="/login" />;
}
