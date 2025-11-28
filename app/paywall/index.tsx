import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Lock, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react-native';
import { useSubscription } from '../../hooks/useSubscription';
import PricingCard from '../../components/PricingCard';
import { SubscriptionPlan } from '../../types/subscription';

const PLANS: SubscriptionPlan[] = [
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    features: [
      'Búsquedas ilimitadas',
      'Acceso completo a todos los diagramas',
      'Sin anuncios',
      'Soporte por email',
    ],
    highlighted: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    interval: 'month',
    features: [
      'Todo de Premium +',
      'Descarga de PDFs',
      'Soporte prioritario',
      'Historial ilimitado',
      'Acceso anticipado a nuevas funciones',
    ],
    highlighted: true,
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { subscription, loading, isActive } = useSubscription();

  useEffect(() => {
    // Si la suscripción se activa mientras está en esta pantalla, redirigir
    if (!loading && isActive) {
      router.replace('/dashboard');
    }
  }, [isActive, loading]);

  const handleSelectPlan = async (planId: string) => {
    router.push(`/pricing?plan=${planId}`);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#06b6d4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="items-center px-6 pt-12 pb-8">
          <View className="bg-red-500/20 p-6 rounded-full mb-6">
            <Lock size={64} color="#ef4444" />
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-3">
            Acceso Premium Requerido
          </Text>
          <Text className="text-slate-400 text-center text-base max-w-sm">
            Para acceder a todos los diagramas técnicos y funciones avanzadas, necesitas una suscripción activa
          </Text>
        </View>

        {/* Plans */}
        <View className="px-6 pb-8">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
            />
          ))}
        </View>

        {/* Features Comparison */}
        <View className="px-6 pb-8">
          <Text className="text-white text-xl font-bold mb-4 text-center">
            ¿Qué obtienes con Premium?
          </Text>
          
          <View className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <View className="flex-row items-center mb-4">
              <Zap size={24} color="#06b6d4" />
              <Text className="text-white font-semibold ml-3 text-lg">Búsquedas Ilimitadas</Text>
            </View>
            <Text className="text-slate-400 text-sm mb-6 ml-9">
              Busca todos los diagramas que necesites sin límites diarios
            </Text>

            <View className="flex-row items-center mb-4">
              <Crown size={24} color="#a855f7" />
              <Text className="text-white font-semibold ml-3 text-lg">Acceso Completo</Text>
            </View>
            <Text className="text-slate-400 text-sm mb-6 ml-9">
              Más de 30,000 diagramas técnicos de todas las marcas
            </Text>

            <View className="flex-row items-center mb-4">
              <Sparkles size={24} color="#eab308" />
              <Text className="text-white font-semibold ml-3 text-lg">Sin Anuncios</Text>
            </View>
            <Text className="text-slate-400 text-sm ml-9">
              Experiencia sin interrupciones publicitarias
            </Text>
          </View>
        </View>

        {/* Free Plan Option */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={() => router.replace('/dashboard')}
            className="py-4"
            activeOpacity={0.8}
          >
            <Text className="text-slate-400 text-center">
              Continuar con plan gratuito (limitado)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

