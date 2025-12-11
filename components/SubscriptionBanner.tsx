import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, AlertCircle, Sparkles } from 'lucide-react-native';
import { useSubscription } from '../hooks/useSubscription';

const getPlanColor = (plan: string) => {
  switch (plan) {
    case 'free':
      return {
        backgroundColor: 'rgba(100, 116, 139, 0.2)',
        borderColor: 'rgba(100, 116, 139, 0.3)',
        textColor: '#cbd5e1',
        badgeBackground: 'rgba(100, 116, 139, 0.3)',
        badgeTextColor: '#e2e8f0',
      };
    case 'plus':
      return {
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        textColor: '#fcd34d',
        badgeBackground: 'rgba(245, 158, 11, 0.3)',
        badgeTextColor: '#fef3c7',
      };
    case 'premium':
      return {
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        borderColor: 'rgba(6, 182, 212, 0.3)',
        textColor: '#67e8f9',
        badgeBackground: 'rgba(6, 182, 212, 0.3)',
        badgeTextColor: '#cffafe',
      };
    case 'pro':
      return {
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: 'rgba(168, 85, 247, 0.3)',
        textColor: '#c084fc',
        badgeBackground: 'rgba(168, 85, 247, 0.3)',
        badgeTextColor: '#e9d5ff',
      };
    default:
      return {
        backgroundColor: 'rgba(100, 116, 139, 0.2)',
        borderColor: 'rgba(100, 116, 139, 0.3)',
        textColor: '#cbd5e1',
        badgeBackground: 'rgba(100, 116, 139, 0.3)',
        badgeTextColor: '#e2e8f0',
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
        style={styles.inactiveBanner}
        activeOpacity={0.8}
      >
        <View style={styles.inactiveContent}>
          <AlertCircle size={20} color="#eab308" />
          <Text style={styles.inactiveText}>
            {!subscription ? 'Activa tu suscripción' : 'Tu suscripción ha expirado'}
          </Text>
        </View>
        <Text style={styles.inactiveButtonText}>VER PLANES →</Text>
      </TouchableOpacity>
    );
  }

  const colors = getPlanColor(subscription.plan);
  const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);

  const getSparkleColor = () => {
    if (subscription.plan === 'pro') return '#a855f7';
    if (subscription.plan === 'premium') return '#06b6d4';
    if (subscription.plan === 'plus') return '#f59e0b';
    return '#94a3b8';
  };

  return (
    <TouchableOpacity
      onPress={() => router.push('/subscription')}
      style={[styles.activeBanner, { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor }]}
      activeOpacity={0.8}
    >
      <View style={styles.activeContent}>
        <View style={[styles.badge, { backgroundColor: colors.badgeBackground }]}>
          <Text style={[styles.badgeText, { color: colors.badgeTextColor }]}>
            {subscription.plan.toUpperCase()}
          </Text>
        </View>
        <View style={styles.textContainer}>
          {hasUnlimited ? (
            <View style={styles.unlimitedRow}>
              <Sparkles size={16} color={getSparkleColor()} />
              <Text style={[styles.planText, { color: colors.textColor }]}>
                Búsquedas ilimitadas ✨
              </Text>
            </View>
          ) : remainingSearches !== null ? (
            <Text style={[styles.planText, { color: colors.textColor }]}>
              {remainingSearches} búsqueda{remainingSearches !== 1 ? 's' : ''} restante{remainingSearches !== 1 ? 's' : ''} este mes
            </Text>
          ) : (
            <Text style={[styles.planText, { color: colors.textColor }]}>
              Plan {planName} activo
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => router.push('/pricing')}
        style={styles.planesButton}
        activeOpacity={0.8}
      >
        <Text style={styles.planesButtonText}>PLANES →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inactiveBanner: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inactiveContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inactiveText: {
    color: '#facc15',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  inactiveButtonText: {
    color: '#facc15',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeBanner: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  unlimitedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  planesButton: {
    marginLeft: 8,
  },
  planesButtonText: {
    color: '#ffffff', // blanco
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#06b6d4', // cyan-500
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
