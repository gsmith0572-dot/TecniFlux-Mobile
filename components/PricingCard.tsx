import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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
      default:
        return <Sparkles size={48} color="#94a3b8" />;
    }
  };

  const getPlanConfig = () => {
    switch (plan.id) {
      case 'free':
        return {
          borderColor: '#475569',
          headerGradient: ['rgba(30, 41, 59, 0.5)', 'rgba(15, 23, 42, 0.5)'],
          overlayGradient: ['rgba(30, 41, 59, 0.3)', 'rgba(15, 23, 42, 0.3)'],
          iconColor: '#94a3b8',
          buttonColor: '#475569',
          checkColor: '#22c55e',
        };
      case 'plus':
        return {
          borderColor: 'rgba(245, 158, 11, 0.5)',
          headerGradient: ['rgba(245, 158, 11, 0.2)', 'rgba(249, 115, 22, 0.2)'],
          overlayGradient: null,
          iconColor: '#fbbf24',
          buttonColor: '#f59e0b',
          checkColor: '#22c55e',
        };
      case 'premium':
        return {
          borderColor: 'rgba(6, 182, 212, 0.5)',
          headerGradient: ['rgba(6, 182, 212, 0.2)', 'rgba(59, 130, 246, 0.2)'],
          overlayGradient: null,
          iconColor: '#22d3ee',
          buttonColor: '#06b6d4',
          checkColor: '#22c55e',
        };
      case 'pro':
        return {
          borderColor: 'rgba(168, 85, 247, 0.5)',
          headerGradient: ['rgba(168, 85, 247, 0.2)', 'rgba(236, 72, 153, 0.2)'],
          overlayGradient: null,
          iconColor: 'rgb(168, 85, 247)',
          buttonColor: '#a855f7',
          checkColor: '#22c55e',
        };
      default:
        // Fallback a configuración 'free' para valores inesperados
        return {
          borderColor: '#475569',
          headerGradient: ['rgba(30, 41, 59, 0.5)', 'rgba(15, 23, 42, 0.5)'],
          overlayGradient: ['rgba(30, 41, 59, 0.3)', 'rgba(15, 23, 42, 0.3)'],
          iconColor: '#94a3b8',
          buttonColor: '#475569',
          checkColor: '#22c55e',
        };
    }
  };

  const config = getPlanConfig();
  const searchLimitText = plan.searchLimit === 'unlimited' 
    ? 'Ilimitado' 
    : `${plan.searchLimit} búsquedas/mes`;

  return (
    <View style={[styles.card, { borderColor: config.borderColor }]}>
      {/* Header con gradient */}
      <View style={styles.header}>
        {config.overlayGradient ? (
          <>
            <View style={[styles.overlay, { backgroundColor: 'rgba(30, 41, 59, 0.5)' }]} />
            <LinearGradient
              colors={config.overlayGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            />
          </>
        ) : (
          <LinearGradient
            colors={config.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        )}
        {plan.highlighted && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
        )}

        {plan.badge && (
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{plan.badge}</Text>
          </View>
        )}

        <View style={styles.headerContent}>
          {getIcon()}
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${plan.price}</Text>
            <Text style={styles.priceUnit}>/mes</Text>
          </View>
          <Text style={styles.searchLimit}>{searchLimitText}</Text>
        </View>
      </View>

      {/* Features con ScrollView y altura fija */}
      <ScrollView
        style={styles.featuresContainer}
        contentContainerStyle={styles.featuresContent}
        showsVerticalScrollIndicator={false}
      >
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={styles.checkContainer}>
              <Check size={20} color={config.checkColor} />
            </View>
            <Text style={styles.featureText}>
              {feature}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Espaciador */}
      <View style={styles.spacer} />

      {/* Botón SIEMPRE visible en bottom - FUERA del ScrollView */}
      <View style={styles.buttonContainer}>
        {isCurrentPlan ? (
          <View style={styles.currentPlanButton}>
            <Text style={styles.currentPlanText}>Plan Actual</Text>
          </View>
        ) : plan.id === 'free' ? (
          <View style={styles.freePlanButton}>
            <Text style={styles.freePlanText}>Plan Gratuito</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => onSelect(plan.id)}
            disabled={loading}
            style={[styles.selectButton, { backgroundColor: config.buttonColor }, loading && styles.selectButtonDisabled]}
            activeOpacity={0.8}
          >
            <Text style={styles.selectButtonText}>
              {loading ? 'Procesando...' : 'Seleccionar Plan'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 620,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#1e293b', // slate-800
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    zIndex: 10,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    zIndex: 10,
  },
  planBadgeText: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 16,
    position: 'relative',
    zIndex: 10,
  },
  planName: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  price: {
    color: '#06b6d4', // cyan-500
    fontSize: 48,
    fontWeight: 'bold',
  },
  priceUnit: {
    color: '#cbd5e1',
    fontSize: 20,
    marginLeft: 8,
  },
  searchLimit: {
    color: '#cbd5e1',
    fontSize: 16,
    marginTop: 8,
  },
  featuresContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#1e293b', // slate-800
    maxHeight: 320,
  },
  featuresContent: {
    paddingBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkContainer: {
    marginTop: 2,
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    lineHeight: 24,
  },
  spacer: {
    height: 16,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  currentPlanButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  currentPlanText: {
    color: '#4ade80',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  freePlanButton: {
    backgroundColor: '#334155',
    paddingVertical: 16,
    borderRadius: 12,
  },
  freePlanText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  selectButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
