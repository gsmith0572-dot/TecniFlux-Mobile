import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ScanBarcode } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();

  // Marcas frecuentes (8 marcas para grid 2x4)
  const marcas = [
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'BMW',
    'Mercedes',
    'Nissan',
    'Audi',
  ];

  const handleSearch = () => {
    router.push('/search');
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
          <Text className="text-white text-xl font-bold">Hola, George</Text>
          <View className="bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
            <Text className="text-yellow-400 text-xs font-bold">PRO</Text>
          </View>
        </View>

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

        {/* Accesos Rápidos - Grid de Marcas */}
        <Text className="text-white font-bold text-lg mx-6 mt-8 mb-4">Marcas Frecuentes</Text>
        <View className="flex-row flex-wrap justify-between px-6 mb-24">
          {marcas.map((marca, index) => (
            <TouchableOpacity
              key={index}
              className="w-[22%] aspect-square bg-slate-800 rounded-xl items-center justify-center mb-3 border border-slate-700/50 p-1"
              activeOpacity={0.7}
            >
              <Text 
                className="text-white font-semibold text-xs text-center"
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                minimumFontScale={0.7}
              >
                {marca}
              </Text>
            </TouchableOpacity>
          ))}
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
