import { useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
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

    console.log('[Pricing] 🎯 Usuario seleccionó plan:', planId);
    setLoading(true);

    try {
      console.log('[Pricing] 🚀 Iniciando creación de checkout session para plan:', planId);
      
      // Crear sesión de pago en Stripe
      const checkoutData = await subscriptionAPI.createCheckoutSession(planId);
      console.log('[Pricing] ✅ Checkout session creada exitosamente');
      console.log('[Pricing] 📦 Datos recibidos:', {
        sessionId: checkoutData.sessionId,
        url: checkoutData.url,
        urlLength: checkoutData.url?.length,
        urlStartsWith: checkoutData.url?.substring(0, 30),
      });
      
      // Validar que tenemos una URL válida
      if (!checkoutData.url) {
        console.error('[Pricing] ❌ No se recibió URL de checkout');
        throw new Error('No se recibió URL de checkout del servidor');
      }
      
      if (!checkoutData.url.startsWith('http://') && !checkoutData.url.startsWith('https://')) {
        console.error('[Pricing] ❌ URL de checkout inválida:', checkoutData.url);
        throw new Error('URL de checkout inválida');
      }
      
      console.log('[Pricing] ✅ URL validada, navegando a checkout screen');
      console.log('[Pricing] 📍 URL completa:', checkoutData.url);
      
      // Abrir WebView de Stripe
      router.push({
        pathname: '/checkout',
        params: { 
          url: checkoutData.url,
          planId: planId,
        },
      });
      
      console.log('[Pricing] ✅ Navegación a checkout iniciada');
      setLoading(false);
    } catch (error: any) {
      console.error('[Pricing] ❌ Error completo al crear checkout:', error);
      console.error('[Pricing] ❌ Error message:', error.message);
      console.error('[Pricing] ❌ Error stack:', error.stack);
      
      const errorMessage = error.message || error.response?.data?.message || 'No se pudo iniciar el proceso de pago. Intenta de nuevo.';
      
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('[Pricing] Usuario cerró alerta de error');
            },
          },
        ]
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
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.flex1}>
          <View style={styles.checkoutHeader}>
            <TouchableOpacity
              onPress={() => {
                setCheckoutUrl(null);
                setLoading(false);
              }}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.checkoutHeaderText}>Completa tu pago</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Planes de Suscripción</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Elige el plan que mejor se adapte a tus necesidades
          </Text>
        </View>

        {/* Pricing Cards */}
        <View style={styles.cardsContainer}>
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text style={styles.loadingText}>Procesando...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  flex1: {
    flex: 1,
  },
  checkoutHeader: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    marginRight: 16,
  },
  checkoutHeaderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  description: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 16,
  },
  cardsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
  },
});
