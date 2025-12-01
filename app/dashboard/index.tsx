import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ScanBarcode, History, Shield, HelpCircle } from 'lucide-react-native';
import SubscriptionBanner from '../../components/SubscriptionBanner';
import { useSubscription } from '../../hooks/useSubscription';
import * as SecureStore from 'expo-secure-store';

export default function DashboardScreen() {
  const router = useRouter();
  const { subscription } = useSubscription();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    try {
      const userData = await SecureStore.getItemAsync('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAdmin(user.role === 'admin');
      }
    } catch (error) {
      console.error('[Dashboard] Error verificando rol:', error);
    }
  };

  // 1. Función para ir a búsqueda general (cuando tocas la barra)
  const handleSearch = () => {
    router.push({
      pathname: '/search',
      params: { q: '' } // Envía búsqueda vacía
    });
  };

  const handleScanner = () => {
    router.push('/scanner');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <View className="flex-row items-center gap-3">
            <Text className="text-white text-xl font-bold">Hola, George</Text>
          </View>
          <View className="flex-row items-center gap-3">
            {isAdmin && (
              <TouchableOpacity
                onPress={() => router.push('/admin')}
                className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30"
                activeOpacity={0.8}
              >
                <Shield size={20} color="#a855f7" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => router.push('/help')}
              className="bg-slate-800 p-2 rounded-lg border border-slate-700"
              activeOpacity={0.8}
            >
              <HelpCircle size={20} color="#06b6d4" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/history')}
              className="bg-slate-800 p-2 rounded-lg border border-slate-700"
              activeOpacity={0.8}
            >
              <History size={20} color="#06b6d4" />
            </TouchableOpacity>
            <View 
              className={`px-3 py-1 rounded-full border ${
                subscription?.plan === 'pro' 
                  ? 'bg-purple-500/20 border-purple-500/30' 
                  : subscription?.plan === 'premium'
                  ? 'bg-cyan-500/20 border-cyan-500/30'
                  : subscription?.plan === 'plus'
                  ? 'bg-amber-500/20 border-amber-500/30'
                  : 'bg-slate-500/20 border-slate-500/30'
              }`}
            >
              <Text 
                className={`text-xs font-bold ${
                  subscription?.plan === 'pro' 
                    ? 'text-purple-300' 
                    : subscription?.plan === 'premium'
                    ? 'text-cyan-300'
                    : subscription?.plan === 'plus'
                    ? 'text-amber-300'
                    : 'text-slate-300'
                }`}
              >
                {subscription?.plan?.toUpperCase() || 'FREE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Banner */}
        <SubscriptionBanner />

        {/* Tarjeta de Búsqueda (Hero) */}
        <View className="mx-6 mt-4 p-6 rounded-2xl bg-slate-800 border border-slate-700">
          <Text className="text-slate-400 mb-4 text-base">¿Qué reparamos hoy?</Text>
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-slate-900/50 h-12 rounded-xl flex-row items-center px-4 border border-slate-700"
            activeOpacity={0.7}
          >
            <Search size={20} color="#94a3b8" />
            <Text className="text-slate-500 ml-3 text-base">Buscar por VIN o Marca...</Text>
          </TouchableOpacity>
        </View>

        {/* Búsqueda Rápida - Espacio Publicitario */}
        <View className="mx-6 mt-8 mb-6">
          <Text className="text-white font-bold text-lg mb-2 text-center">Búsqueda Rápida</Text>
          <Text className="text-slate-400 text-sm mb-6 text-center">
            Accede a más de 30,000 diagramas técnicos automotrices
          </Text>
          
          {/* Espacio publicitario - Ocupa todo el espacio */}
          <View className="bg-slate-800/30 rounded-xl p-12 border border-slate-700/30 items-center justify-center mb-6" style={{ minHeight: 200 }}>
            <Text className="text-slate-500 text-sm text-center" style={{ textAlign: 'center' }}>Espacio Publicitario Disponible</Text>
          </View>
        </View>

        {/* Link a Acerca de */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            onPress={() => router.push('/about')}
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
            activeOpacity={0.8}
          >
            <Text className="text-slate-400 text-center text-sm">
              Acerca de TecniFlux
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Botón Flotante de Escáner (FAB) */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          onPress={handleScanner}
          className="w-16 h-16 bg-cyan-500 rounded-full items-center justify-center shadow-lg"
          style={{
            shadowColor: '#06b6d4',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
          }}
          activeOpacity={0.8}
        >
          <ScanBarcode size={28} color="#0f172a" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}