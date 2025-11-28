import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, AlertCircle, Sparkles } from 'lucide-react-native';
import { useSubscription } from '../hooks/useSubscription';

const getPlanColor = (plan: string) => {
  switch (plan) {
    case 'free':
      return {
        bg: 'bg-slate-500/20',
        border: 'border-slate-500/30',
        text: 'text-slate-300',
        badge: 'bg-slate-500/30',
        badgeText: 'text-slate-200',
      };
    case 'plus':
      return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
        text: 'text-amber-300',
        badge: 'bg-amber-500/30',
        badgeText: 'text-amber-200',
      };
    case 'premium':
      return {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/30',
        text: 'text-cyan-300',
        badge: 'bg-cyan-500/30',
        badgeText: 'text-cyan-200',
      };
    case 'pro':
      return {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/30',
        text: 'text-purple-300',
        badge: 'bg-purple-500/30',
        badgeText: 'text-purple-200',
      };
    default:
      return {
        bg: 'bg-slate-500/20',
        border: 'border-slate-500/30',
        text: 'text-slate-300',
        badge: 'bg-slate-500/30',
        badgeText: 'text-slate-200',
      };
  }
};

export default function SubscriptionBanner() {
  const router = useRouter();
  const { subscription, daysRemaining, isActive, isFree, hasUnlimited, remainingSearches } = useSubscription();

  if (!subscription || !isActive) {
    return (
      <TouchableOpacity
        onPress={() => router.push('/pricing')}
        className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl px-4 py-3 mx-6 mb-4 flex-row items-center justify-between"
        activeOpacity={0.8}
      >
        <View className="flex-row items-center flex-1">
          <AlertCircle size={20} color="#eab308" />
          <Text className="text-yellow-400 text-sm font-semibold ml-2 flex-1">
            {!subscription ? 'Activa tu suscripción' : 'Tu suscripción ha expirado'}
          </Text>
        </View>
        <Text className="text-yellow-400 text-sm font-bold">VER PLANES →</Text>
      </TouchableOpacity>
    );
  }

  const colors = getPlanColor(subscription.plan);
  const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);

  return (
    <TouchableOpacity
      onPress={() => router.push('/subscription')}
      className={`${colors.bg} ${colors.border} border rounded-xl px-4 py-3 mx-6 mb-4 flex-row items-center justify-between`}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center flex-1">
        <View className={`${colors.badge} px-2 py-1 rounded-full`}>
          <Text className={`${colors.badgeText} text-xs font-bold`}>
            {subscription.plan.toUpperCase()}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          {hasUnlimited ? (
            <View className="flex-row items-center">
              <Sparkles size={16} color={colors.text.replace('text-', '#').replace('-300', '')} />
              <Text className={`${colors.text} text-sm font-semibold ml-1`}>
                Búsquedas ilimitadas ✨
              </Text>
            </View>
          ) : remainingSearches !== null ? (
            <Text className={`${colors.text} text-sm font-semibold`}>
              {remainingSearches} búsqueda{remainingSearches !== 1 ? 's' : ''} restante{remainingSearches !== 1 ? 's' : ''} este mes
            </Text>
          ) : (
            <Text className={`${colors.text} text-sm font-semibold`}>
              Plan {planName} activo
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => router.push('/pricing')}
        className="ml-2"
        activeOpacity={0.8}
      >
        <Text className={`${colors.text} text-sm font-bold`}>MEJORAR →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

