import { useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as SecureStore from 'expo-secure-store';
import { subscriptionAPI } from '../services/api';

export default function CheckoutScreen() {
  const { url, planId } = useLocalSearchParams<{ url: string; planId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Logs de debugging al montar el componente
  console.log('[Checkout] 🚀 CheckoutScreen montado');
  console.log('[Checkout] 📦 Parámetros recibidos:', { url, planId });
  console.log('[Checkout] 🔍 URL type:', typeof url);
  console.log('[Checkout] 🔍 URL length:', url?.length);
  console.log('[Checkout] 🔍 URL preview:', url?.substring(0, 50));

  const handleNavigationChange = (navState: any) => {
    const currentUrl = navState.url;
    console.log('[Checkout] Navigation change:', currentUrl);

    // Si Stripe redirige a success
    if (currentUrl.includes('success') || currentUrl.includes('checkout/success') || currentUrl.includes('tecniflux://success') || currentUrl.includes('subscription-success')) {
      setLoading(false);
      // Extraer session_id de la URL
      const sessionIdMatch = currentUrl.match(/[?&]session_id=([^&]+)/);
      const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;
      handlePaymentSuccess(sessionId);
      return;
    }

    // Si Stripe redirige a cancel
    if (currentUrl.includes('cancel') || currentUrl.includes('checkout/cancel') || currentUrl.includes('tecniflux://cancel')) {
      setLoading(false);
      handlePaymentCancel();
      return;
    }
  };

  const handlePaymentSuccess = async (sessionId: string | null) => {
    try {
      console.log('[Checkout] 💳 Pago exitoso detectado, session_id:', sessionId);
      
      // Limpiar cache para forzar actualización
      await SecureStore.deleteItemAsync('userSubscription');
      
      // PRIMERO: Intentar verificar el pago usando el session_id (si el backend lo soporta)
      if (sessionId) {
        console.log('[Checkout] 🔍 Intentando verificar pago con session_id...');
        try {
          const verifiedSubscription = await subscriptionAPI.verifyPayment(sessionId);
          if (verifiedSubscription && verifiedSubscription.plan !== 'free') {
            console.log('[Checkout] ✅ Suscripción actualizada mediante verificación de pago:', verifiedSubscription);
            Alert.alert(
              '¡Pago Exitoso!',
              `Tu suscripción ha sido activada correctamente. Plan: ${verifiedSubscription.plan.toUpperCase()}`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    router.replace('/dashboard');
                  },
                },
              ]
            );
            return;
          }
        } catch (verifyError) {
          console.log('[Checkout] ⚠️ Verificación directa no disponible, continuando con polling...', verifyError);
        }
      }
      
      // SEGUNDO: Esperar un poco para que el backend procese el webhook de Stripe
      console.log('[Checkout] ⏳ Esperando 5 segundos para que el backend procese el webhook de Stripe...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // TERCERO: Hacer polling más agresivo (máximo 60 segundos)
      const maxAttempts = 20; // Aumentado a 20 intentos
      const delayMs = 3000; // 3 segundos entre intentos
      let subscription = null;
      let attempts = 0;
      
      console.log('[Checkout] 🔄 Iniciando polling para verificar actualización de suscripción...');
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`[Checkout] 🔍 Intento ${attempts}/${maxAttempts}: Verificando suscripción...`);
        
        try {
          // Forzar actualización desde backend (ignorando cache)
          subscription = await subscriptionAPI.forceRefresh();
          
          console.log(`[Checkout] 📦 Suscripción actual: plan="${subscription.plan}", status="${subscription.status}"`);
          
          // Si la suscripción ya no es 'free', el pago fue procesado
          if (subscription.plan !== 'free' && subscription.status === 'active') {
            console.log(`[Checkout] ✅ Suscripción actualizada correctamente a plan: ${subscription.plan}`);
            break;
          }
          
          // Si aún es 'free', esperar y reintentar
          if (attempts < maxAttempts) {
            console.log(`[Checkout] ⏳ Suscripción aún en 'free', esperando ${delayMs}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        } catch (error) {
          console.error(`[Checkout] ❌ Error en intento ${attempts}:`, error);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      }
      
      if (!subscription || subscription.plan === 'free') {
        console.warn('[Checkout] ⚠️ No se pudo verificar la actualización de suscripción después de múltiples intentos');
        console.warn('[Checkout] ⚠️ PROBLEMA: El backend NO está actualizando la suscripción después del pago');
        console.warn('[Checkout] ⚠️ El pago fue capturado por Stripe pero el webhook del backend no está funcionando');
        Alert.alert(
          'Pago Procesado',
          `Tu pago fue capturado exitosamente por Stripe (session_id: ${sessionId?.substring(0, 20)}...). Sin embargo, el sistema no ha actualizado tu suscripción automáticamente. Por favor contacta al soporte con este session_id para que actualicen tu cuenta manualmente.`,
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/dashboard');
              },
            },
          ]
        );
        return;
      }
      
      console.log('[Checkout] ✅ Subscription actualizada correctamente:', subscription);
      
      Alert.alert(
        '¡Pago Exitoso!',
        `Tu suscripción ha sido activada correctamente. Plan: ${subscription.plan.toUpperCase()}`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/dashboard');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[Checkout] ❌ Error al actualizar subscription:', error);
      Alert.alert(
        'Pago Exitoso',
        'Tu pago fue procesado. La suscripción se actualizará en breve. Si no ves el cambio, recarga la app o contacta al soporte.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/dashboard');
            },
          },
        ]
      );
    }
  };

  const handlePaymentCancel = () => {
    Alert.alert(
      'Pago Cancelado',
      'No se realizó ningún cargo. Puedes intentar nuevamente cuando lo desees.',
      [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  // Validar URL antes de renderizar
  if (!url) {
    console.error('[Checkout] ❌ ERROR: No se proporcionó URL de checkout');
    console.error('[Checkout] ❌ Parámetros completos:', { url, planId });
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-400 text-center mb-4">
            Error: No se proporcionó URL de checkout
          </Text>
          <Text className="text-gray-400 text-center mb-4 text-xs">
            Por favor, intenta seleccionar el plan nuevamente
          </Text>
          <Text
            className="text-cyan-400 text-center underline"
            onPress={() => router.back()}
          >
            Volver
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Validar que la URL sea válida
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error('[Checkout] ❌ ERROR: URL inválida (no comienza con http/https):', url);
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-400 text-center mb-4">
            Error: URL de checkout inválida
          </Text>
          <Text className="text-gray-400 text-center mb-4 text-xs">
            {url.substring(0, 100)}
          </Text>
          <Text
            className="text-cyan-400 text-center underline"
            onPress={() => router.back()}
          >
            Volver
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('[Checkout] ✅ URL validada correctamente');
  console.log('[Checkout] 🌐 Abriendo WebView con URL:', url);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {loading && (
        <View className="absolute top-0 left-0 right-0 bg-slate-800 px-6 py-4 z-10">
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#06b6d4" />
            <Text className="text-white ml-3">Cargando checkout de Stripe...</Text>
          </View>
        </View>
      )}

      <WebView
        source={{ uri: url }}
        onNavigationStateChange={(navState) => {
          console.log('[Checkout] 🔄 Navigation state changed');
          console.log('[Checkout] 🔄 URL:', navState.url);
          console.log('[Checkout] 🔄 Loading:', navState.loading);
          console.log('[Checkout] 🔄 Can go back:', navState.canGoBack);
          handleNavigationChange(navState);
        }}
        onShouldStartLoadWithRequest={(request) => {
          console.log('[Checkout] 🤔 Should start load with request:', request.url);
          console.log('[Checkout] 🤔 Navigation type:', request.navigationType);
          handleNavigationChange({ url: request.url });
          return true;
        }}
        onLoadStart={() => {
          console.log('[Checkout] 📥 Load started');
          setLoading(true);
        }}
        onLoadEnd={() => {
          console.log('[Checkout] ✅ Load ended');
          setLoading(false);
        }}
        onLoadProgress={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('[Checkout] 📊 Load progress:', Math.round(nativeEvent.progress * 100) + '%');
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          const errorUrl = nativeEvent.url;
          console.error('[Checkout] WebView error:', nativeEvent);
          
          // Si el error es por una redirección a localhost (como subscription-success),
          // no es realmente un error, es la redirección de Stripe
          if (errorUrl && (errorUrl.includes('success') || errorUrl.includes('subscription-success'))) {
            console.log('[Checkout] ⚠️ Error de WebView pero detectada URL de éxito, procesando...');
            const sessionIdMatch = errorUrl.match(/[?&]session_id=([^&]+)/);
            const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;
            handlePaymentSuccess(sessionId);
            return;
          }
          
          setLoading(false);
          Alert.alert(
            'Error',
            'Hubo un problema al cargar la página de pago. Por favor intenta nuevamente.',
            [
              {
                text: 'Volver',
                onPress: () => router.back(),
              },
            ]
          );
        }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
}

