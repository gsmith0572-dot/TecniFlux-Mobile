import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Esperar un momento para que el router esté listo
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const token = await SecureStore.getItemAsync('userToken');
        
        if (token) {
          // Hay token, verificar si es válido
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              const now = Math.floor(Date.now() / 1000);
              
              if (payload.exp && payload.exp < now) {
                // Token expirado - ir a login
                await SecureStore.deleteItemAsync('userToken');
                await SecureStore.deleteItemAsync('userData');
                await SecureStore.deleteItemAsync('userSubscription');
                router.replace('/login');
              } else {
                // Token válido - ir a dashboard
                router.replace('/dashboard');
              }
            } else {
              // Token inválido - ir a login
              router.replace('/login');
            }
          } catch (error) {
            // Error al verificar token - ir a login
            router.replace('/login');
          }
        } else {
          // No hay token - SIEMPRE ir a login
          router.replace('/login');
        }
      } catch (error) {
        console.error('[Index] Error:', error);
        router.replace('/login');
      } finally {
        setIsReady(true);
      }
    };

    checkAuthAndRedirect();
  }, []);

  // Mostrar loading mientras se verifica
  if (!isReady) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return null;
}
