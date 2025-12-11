import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Check, Zap, Crown, Sparkles, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SubscriptionPlan } from '../types/subscription';

interface PricingCardProps {
  plan: SubscriptionPlan;
  onSelect: (planId: string) => void;
  loading?: boolean;
  isCurrentPlan?: boolean;
}

export default function PricingCard({ plan, onSelect, loading = false, isCurrentPlan = false }: PricingCardProps) {
  const getIcon = () => {
    switch (plan.id) {
      case 'free':
        return <Sparkles size={48} color="#94a3b8" />;
      case 'plus':
        return <TrendingUp size={48} color="#fbbf24" />;
      case 'premium':
        return <Zap size={48} color="#06b6d4" />;
      case 'pro':
        return <Crown size={48} color="rgb(168, 85, 247)" />;
    }
  };

  const getPlanConfig = () => {
    switch (plan.id) {
      case 'free':
        return {
          borderColor: 'border-slate-600',
          headerGradient: ['rgba(30, 41, 59, 0.5)', 'rgba(15, 23, 42, 0.5)'], // bg-slate-800/50 con gradient sutil
          overlayGradient: ['rgba(30, 41, 59, 0.3)', 'rgba(15, 23, 42, 0.3)'], // gradient overlay
          iconColor: '#94a3b8', // slate-400
          buttonColor: 'bg-slate-600',
          checkColor: '#10b981',
        };
      case 'plus':
        return {
          borderColor: 'border-amber-500/50',
          headerGradient: ['rgba(245, 158, 11, 0.2)', 'rgba(249, 115, 22, 0.2)'], // from-amber-500/20 to-orange-500/20
          overlayGradient: null,
          iconColor: '#fbbf24', // amber-400
          buttonColor: 'bg-amber-500',
          checkColor: '#10b981',
        };
      case 'premium':
        return {
          borderColor: 'border-cyan-500/50',
          headerGradient: ['rgba(6, 182, 212, 0.2)', 'rgba(59, 130, 246, 0.2)'], // from-cyan-500/20 to-blue-500/20
          overlayGradient: null,
          iconColor: '#22d3ee', // cyan-400
          buttonColor: 'bg-cyan-500',
          checkColor: '#10b981',
        };
      case 'pro':
        return {
          borderColor: 'border-purple-500/50',
          headerGradient: ['rgba(168, 85, 247, 0.2)', 'rgba(236, 72, 153, 0.2)'], // from-purple-500/20 to-pink-500/20
          overlayGradient: null,
          iconColor: 'rgb(168, 85, 247)', // purple-400
          buttonColor: 'bg-purple-500',
          checkColor: '#10b981',
        };
    }
  };

  const config = getPlanConfig();
  const searchLimitText = plan.searchLimit === 'unlimited' 
    ? 'Ilimitado' 
    : `${plan.searchLimit} búsquedas/mes`;

  return (
    <View className={`h-[620px] rounded-2xl border-2 ${config.borderColor} overflow-hidden bg-slate-900/50`}>
      {/* Header con gradient */}
      <View className="px-6 py-8 relative">
        {config.overlayGradient ? (
          <>
            <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }} className="absolute inset-0" />
            <LinearGradient
              colors={config.overlayGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />
          </>
        ) : (
          <LinearGradient
            colors={config.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
        )}
        {plan.highlighted && (
          <View className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full z-10">
            <Text className="text-white text-xs font-bold">POPULAR</Text>
          </View>
        )}

        {plan.badge && (
          <View className="absolute top-4 left-4 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 z-10">
            <Text className="text-purple-300 text-xs font-bold">{plan.badge}</Text>
          </View>
        )}

        <View className="items-center mt-4 relative z-10">
          {getIcon()}
          <Text className="text-white text-3xl font-bold mt-4">{plan.name}</Text>
          <View className="flex-row items-baseline mt-2">
            <Text className="text-white text-5xl font-bold">${plan.price}</Text>
            <Text className="text-slate-300 text-xl ml-2">/mes</Text>
          </View>
          <Text className="text-slate-300 text-base mt-2">{searchLimitText}</Text>
        </View>
      </View>

      {/* Features con ScrollView y altura fija */}
      <ScrollView
        className="flex-1 px-6 py-6 bg-slate-900/50"
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 320 }}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        {plan.features.map((feature, index) => (
          <View key={index} className="flex-row items-start mb-4">
            <View className="mt-0.5">
              <Check size={20} color={config.checkColor} />
            </View>
            <Text className="text-slate-300 text-base ml-3 flex-1 leading-6">
              {feature}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Espaciador */}
      <View className="h-4" />

      {/* Botón SIEMPRE visible en bottom - FUERA del ScrollView */}
      <View className="px-6 pb-6">
        {isCurrentPlan ? (
          <View className="bg-green-500/20 py-4 rounded-xl border border-green-500/30">
            <Text className="text-green-400 text-center font-bold text-lg">Plan Actual</Text>
          </View>
        ) : plan.id === 'free' ? (
          <View className="bg-slate-700 py-4 rounded-xl">
            <Text className="text-slate-400 text-center font-bold text-lg">Plan Gratuito</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => onSelect(plan.id)}
            disabled={loading}
            className={`${config.buttonColor} rounded-xl py-4 ${loading ? 'opacity-50' : ''}`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold text-lg">
              {loading ? 'Procesando...' : 'Seleccionar Plan'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
