import { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useSubscription } from '../../hooks/useSubscription';
import { subscriptionAPI } from '../services/api';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { subscription, daysRemaining, isActive, isFree, loading, refetch } = useSubscription();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Suscripción',
      '¿Estás seguro de que deseas cancelar tu suscripción? Podrás seguir usando el servicio hasta el final del período actual.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await subscriptionAPI.cancelSubscription();
              await refetch();
              Alert.alert('Suscripción cancelada', 'Tu suscripción se cancelará al final del período actual.');
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo cancelar la suscripción. Intenta de nuevo.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = () => {
    if (isActive) return '#10b981';
    if (subscription?.status === 'expired') return '#ef4444';
    return '#f59e0b';
  };

  const getStatusText = () => {
    if (isFree) return 'Plan Gratis';
    if (isActive) return 'Activa';
    if (subscription?.status === 'expired') return 'Expirada';
    if (subscription?.status === 'cancelled') return 'Cancelada';
    return 'Inactiva';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text className="text-slate-400 mt-4">Cargando...</Text>
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
          <Text className="text-white text-2xl font-bold">Mi Suscripción</Text>
        </View>

        {/* Status Card */}
        <View className="mx-6 mb-6 bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-slate-400 text-sm mb-1">Plan Actual</Text>
              <Text className="text-white text-2xl font-bold capitalize">
                {subscription?.plan || 'Free'}
              </Text>
            </View>
            <View
              className="px-4 py-2 rounded-full flex-row items-center"
              style={{ backgroundColor: getStatusColor() + '20' }}
            >
              {isActive ? (
                <CheckCircle size={20} color={getStatusColor()} />
              ) : (
                <AlertCircle size={20} color={getStatusColor()} />
              )}
              <Text
                className="ml-2 font-bold text-sm capitalize"
                style={{ color: getStatusColor() }}
              >
                {getStatusText()}
              </Text>
            </View>
          </View>

          {subscription?.currentPeriodEnd && (
            <View className="flex-row items-center mt-4 pt-4 border-t border-slate-700">
              <Calendar size={20} color="#06b6d4" />
              <View className="ml-3 flex-1">
                <Text className="text-slate-400 text-sm">Renovación</Text>
                <Text className="text-white font-semibold">
                  {formatDate(subscription.currentPeriodEnd)}
                </Text>
                {daysRemaining !== null && (
                  <Text className="text-cyan-400 text-sm mt-1">
                    {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Expirada'}
                  </Text>
                )}
              </View>
            </View>
          )}

          {subscription?.cancelAtPeriodEnd && (
            <View className="mt-4 bg-orange-500/20 border border-orange-500/30 rounded-xl p-3">
              <Text className="text-orange-400 text-sm text-center">
                ⚠️ Tu suscripción se cancelará al final del período actual
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {isFree ? (
          <View className="mx-6 mb-6">
            <TouchableOpacity
              onPress={() => router.push('/pricing')}
              className="bg-cyan-500 py-4 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-bold text-lg">
                Ver Planes Disponibles
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mx-6 mb-6">
            {!isActive && (
              <TouchableOpacity
                onPress={() => router.push('/pricing')}
                className="bg-cyan-500 py-4 rounded-xl mb-3"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-bold text-lg">
                  Renovar Suscripción
                </Text>
              </TouchableOpacity>
            )}

            {isActive && !subscription?.cancelAtPeriodEnd && (
              <TouchableOpacity
                onPress={handleCancel}
                disabled={cancelling}
                className="bg-red-500/20 border border-red-500/30 py-4 rounded-xl"
                activeOpacity={0.8}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <View className="flex-row items-center justify-center">
                    <X size={20} color="#ef4444" />
                    <Text className="text-red-400 text-center font-bold text-lg ml-2">
                      Cancelar Suscripción
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Plan Features */}
        <View className="mx-6 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Beneficios de tu Plan</Text>
          <View className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            {subscription?.plan === 'free' && (
              <>
                <Text className="text-slate-300 mb-2">✓ 5 búsquedas por día</Text>
                <Text className="text-slate-300 mb-2">✓ Acceso limitado a diagramas básicos</Text>
                <Text className="text-slate-300">✓ Anuncios incluidos</Text>
              </>
            )}
            {subscription?.plan === 'premium' && (
              <>
                <Text className="text-slate-300 mb-2">✓ Búsquedas ilimitadas</Text>
                <Text className="text-slate-300 mb-2">✓ Acceso completo a todos los diagramas</Text>
                <Text className="text-slate-300 mb-2">✓ Sin anuncios</Text>
                <Text className="text-slate-300">✓ Soporte por email</Text>
              </>
            )}
            {subscription?.plan === 'pro' && (
              <>
                <Text className="text-slate-300 mb-2">✓ Todo de Premium +</Text>
                <Text className="text-slate-300 mb-2">✓ Descarga de PDFs</Text>
                <Text className="text-slate-300 mb-2">✓ Soporte prioritario</Text>
                <Text className="text-slate-300 mb-2">✓ Historial ilimitado</Text>
                <Text className="text-slate-300">✓ Acceso anticipado a nuevas funciones</Text>
              </>
            )}
          </View>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          onPress={refetch}
          className="mx-6 mb-8 flex-row items-center justify-center py-3"
          activeOpacity={0.8}
        >
          <RefreshCw size={20} color="#06b6d4" />
          <Text className="text-cyan-400 ml-2 font-semibold">Actualizar Estado</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

