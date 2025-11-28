import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Esperar a que el componente esté montado antes de navegar
    setMounted(true);
    
    // Usar setTimeout para asegurar que el Root Layout esté completamente montado
    const timer = setTimeout(() => {
      console.log('[Index] Redirigiendo a /login');
      router.replace('/login');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Mostrar un loading mientras se monta el layout
  if (!mounted) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return null;
}
