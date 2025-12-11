import { useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import PricingCard from '../../components/PricingCard';
import { subscriptionAPI } from '../services/api';
import { SubscriptionPlan } from '../../types/subscription';
import { useSubscription } from '../../hooks/useSubscription';

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    searchLimit: 3,
    maxUsers: 1,
    features: [
      '3 búsquedas mensuales',
      'Acceso a diagramas básicos',
      'Soporte por email',
    ],
    color: 'gray',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 5.99,
    searchLimit: 30,
    maxUsers: 1,
    features: [
      '30 búsquedas mensuales',
      'Acceso completo a diagramas',
      'Sin anuncios',
      'Soporte prioritario',
    ],
    color: 'amber',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    searchLimit: 'unlimited',
    maxUsers: 1,
    features: [
      'Búsquedas ilimitadas',
      'Acceso completo a diagramas',
      'Sin anuncios',
      'Soporte prioritario 24/7',
    ],
    highlighted: true,
    color: 'cyan',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    searchLimit: 'unlimited',
    maxUsers: 3,
    features: [
      'Búsquedas ilimitadas',
      'Hasta 3 usuarios en la cuenta',
      'Panel de administración',
      'Acceso completo a diagramas',
      'Soporte dedicado 24/7',
      'Reportes mensuales de uso',
    ],
    highlighted: true,
    color: 'purple',
    badge: 'Para Talleres',
  },
];

export default function PricingScreen() {
  const router = useRouter();
  const { subscription, refetch } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      Alert.alert('Plan Gratuito', 'Ya tienes el plan gratuito activo');
      return;
    }

    setLoading(true);

    try {
      console.log('[Pricing] Creando checkout session para plan:', planId);
      
      // Crear sesión de pago en Stripe
      const { sessionId, url } = await subscriptionAPI.createCheckoutSession(planId);
      console.log('[Pricing] ✅ Checkout session creada:', { sessionId, url });
      
      // Abrir WebView de Stripe
      router.push({
        pathname: '/checkout',
        params: { url, planId },
      });
      
      setLoading(false);
    } catch (error: any) {
      console.error('[Pricing] ❌ Error al crear checkout:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo iniciar el proceso de pago. Intenta de nuevo.'
      );
      setLoading(false);
    }
  };

  const handleCheckoutComplete = (url: string) => {
    console.log('[Pricing] Checkout navigation:', url);
    
    if (url.includes('success') || url.includes('checkout/success')) {
      setCheckoutUrl(null);
      setLoading(false);
      Alert.alert('¡Éxito!', 'Tu suscripción se ha activado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            refetch();
            router.push('/subscription');
          },
        },
      ]);
    } else if (url.includes('cancel') || url.includes('checkout/cancel')) {
      setCheckoutUrl(null);
      setLoading(false);
    }
  };

  if (checkoutUrl) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <StatusBar style="light" />
        <View className="flex-1">
          <View className="bg-slate-800 px-6 py-4 flex-row items-center border-b border-slate-700">
            <TouchableOpacity
              onPress={() => {
                setCheckoutUrl(null);
                setLoading(false);
              }}
              className="mr-4"
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">Completa tu pago</Text>
          </View>
          <WebView
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={(navState) => {
              handleCheckoutComplete(navState.url);
            }}
            onShouldStartLoadWithRequest={(request) => {
              handleCheckoutComplete(request.url);
              return true;
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Planes de Suscripción</Text>
        </View>

        {/* Description */}
        <View className="px-6 mb-6">
          <Text className="text-slate-400 text-center text-base">
            Elige el plan que mejor se adapte a tus necesidades
          </Text>
        </View>

        {/* Pricing Cards */}
        <View className="px-6 pb-8">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
              loading={loading}
              isCurrentPlan={subscription?.plan === plan.id && subscription?.status === 'active'}
            />
          ))}
        </View>

        {loading && (
          <View className="items-center pb-8">
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text className="text-slate-400 mt-4">Procesando...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

