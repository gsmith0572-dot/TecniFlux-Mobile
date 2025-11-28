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

  const handleNavigationChange = (navState: any) => {
    const currentUrl = navState.url;
    console.log('[Checkout] Navigation change:', currentUrl);

    // Si Stripe redirige a success
    if (currentUrl.includes('success') || currentUrl.includes('checkout/success') || currentUrl.includes('tecniflux://success')) {
      setLoading(false);
      handlePaymentSuccess();
      return;
    }

    // Si Stripe redirige a cancel
    if (currentUrl.includes('cancel') || currentUrl.includes('checkout/cancel') || currentUrl.includes('tecniflux://cancel')) {
      setLoading(false);
      handlePaymentCancel();
      return;
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Limpiar cache para forzar actualización
      await SecureStore.deleteItemAsync('userSubscription');
      
      // Refrescar subscription desde el backend
      const subscription = await subscriptionAPI.getStatus();
      
      // Guardar en SecureStore
      await SecureStore.setItemAsync('userSubscription', JSON.stringify(subscription));
      
      console.log('[Checkout] ✅ Subscription actualizada:', subscription);
      
      Alert.alert(
        '¡Pago Exitoso!',
        'Tu suscripción ha sido activada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/dashboard');
            },
          },
        ]
      );
    } catch (error) {
      console.error('[Checkout] Error al actualizar subscription:', error);
      Alert.alert(
        'Pago Exitoso',
        'Tu suscripción ha sido activada. Refrescando datos...',
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

  if (!url) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-400 text-center mb-4">
            Error: No se proporcionó URL de checkout
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
        onNavigationStateChange={handleNavigationChange}
        onShouldStartLoadWithRequest={(request) => {
          console.log('[Checkout] Should start load:', request.url);
          handleNavigationChange({ url: request.url });
          return true;
        }}
        onLoadStart={() => {
          console.log('[Checkout] Load started');
          setLoading(true);
        }}
        onLoadEnd={() => {
          console.log('[Checkout] Load ended');
          setLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[Checkout] WebView error:', nativeEvent);
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

