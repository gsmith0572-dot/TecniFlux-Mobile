import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ScanBarcode, History, Shield, FileText, Car, Calendar } from 'lucide-react-native';
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

        {/* Búsqueda Rápida - Stats */}
        <View className="mx-6 mt-8 mb-6">
          <Text className="text-white font-bold text-lg mb-2">Búsqueda Rápida</Text>
          <Text className="text-slate-400 text-sm mb-6">
            Accede a más de 17,000 diagramas técnicos automotrices
          </Text>
          
          {/* Stats Cards */}
          <View className="flex-row justify-between gap-3 mb-6">
            {/* Card 1: Diagramas */}
            <View className="flex-1 bg-slate-800 rounded-xl p-4 border border-slate-700/50 items-center">
              <FileText size={24} color="#06b6d4" className="mb-2" />
              <Text className="text-white font-bold text-lg">17,865+</Text>
              <Text className="text-slate-400 text-xs text-center mt-1">Diagramas</Text>
            </View>
            
            {/* Card 2: Marcas */}
            <View className="flex-1 bg-slate-800 rounded-xl p-4 border border-slate-700/50 items-center">
              <Car size={24} color="#06b6d4" className="mb-2" />
              <Text className="text-white font-bold text-lg">41</Text>
              <Text className="text-slate-400 text-xs text-center mt-1">Marcas</Text>
            </View>
            
            {/* Card 3: Años */}
            <View className="flex-1 bg-slate-800 rounded-xl p-4 border border-slate-700/50 items-center">
              <Calendar size={24} color="#06b6d4" className="mb-2" />
              <Text className="text-white font-bold text-lg">1972-2026</Text>
              <Text className="text-slate-400 text-xs text-center mt-1">Años</Text>
            </View>
          </View>
          
          {/* Espacio publicitario */}
          <View className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/30 items-center justify-center mb-24">
            <Text className="text-slate-500 text-xs">Espacio publicitario disponible</Text>
          </View>
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