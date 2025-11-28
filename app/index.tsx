import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // SIEMPRE redirigir a login primero
    console.log('[Index] Redirigiendo a /login');
    router.replace('/login');
  }, []);

  return null;
}
