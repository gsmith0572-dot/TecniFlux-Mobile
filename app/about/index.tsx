import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink } from 'lucide-react-native';
import { Image } from 'expo-image';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4"
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#cbd5e1" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Acerca de TecniFlux</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          <View className="items-center mb-6">
            <Image
              source={{ uri: 'https://drive.google.com/uc?export=download&id=1IIk35wVni5Z95p52lFPUO8mTYE3flIcT' }}
              style={{ width: 120, height: 120 }}
              contentFit="contain"
            />
          </View>

          {/* Versión */}
          <View className="items-center mb-6">
            <Text className="text-white text-xl font-bold mb-2">TecniFlux v1.0.0</Text>
            <Text className="text-slate-300 text-base text-center">
              Más de 30,000 diagramas técnicos automotrices
            </Text>
          </View>

          {/* Desarrollado por */}
          <View className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
            <Text className="text-slate-400 text-sm mb-3">Desarrollado por</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://klickifyagency.com')}
              className="flex-row items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-bold mr-2">Klickify Agency ™</Text>
              <ExternalLink size={18} color="#06b6d4" />
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <View className="items-center mb-6">
            <Text className="text-slate-500 text-xs text-center">
              © 2025 Klickify Agency. Todos los derechos reservados.
            </Text>
          </View>

          {/* Links Legales */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push('/terms')}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700"
              activeOpacity={0.8}
            >
              <Text className="text-slate-300 text-center font-semibold">
                Términos de Servicio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/privacy')}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700"
              activeOpacity={0.8}
            >
              <Text className="text-slate-300 text-center font-semibold">
                Política de Privacidad
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

