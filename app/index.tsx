import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      // 1. Si NO hay token → ir a login
      if (!token) {
        console.log('[Index] ❌ No hay token → redirigiendo a /login');
        router.replace('/login');
        setLoading(false);
        return;
      }
      
      // 2. Si HAY token → verificar que sea válido (no expirado)
      try {
        // Decodificar JWT para verificar expiración
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Token inválido: formato incorrecto');
        }
        
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        // Verificar si el token expiró
        if (payload.exp && payload.exp < now) {
          console.log('[Index] ⚠️ Token expirado → limpiando datos y redirigiendo a /login');
          // Token expirado → borrar todos los datos y ir a login
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userData');
          await SecureStore.deleteItemAsync('userSubscription');
          router.replace('/login');
          setLoading(false);
          return;
        }
        
        // 3. Token válido → ir a dashboard
        console.log('[Index] ✅ Token válido → redirigiendo a /dashboard');
        router.replace('/dashboard');
        setLoading(false);
        
      } catch (error) {
        console.error('[Index] ❌ Error verificando token:', error);
        // Si hay error al decodificar el token, tratarlo como inválido
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        await SecureStore.deleteItemAsync('userSubscription');
        router.replace('/login');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('[Index] ❌ Error checking auth:', error);
      router.replace('/login');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return null;
}
