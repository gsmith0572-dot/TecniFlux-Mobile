import { useState, useEffect } from 'react';
import { subscriptionAPI } from '../app/services/api';
import { UserSubscription, PlanType } from '../types/subscription';
import * as SecureStore from 'expo-secure-store';
import { canSearch, getResetDate } from '../utils/searchCounter';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingSearches, setRemainingSearches] = useState<number | null>(null);
  const [resetDate, setResetDate] = useState<Date | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        setSubscription({
          plan: 'free',
          status: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        });
        setLoading(false);
        return;
      }

      const status = await subscriptionAPI.getSubscriptionStatus();
      setSubscription(status);

      // Actualizar contador de búsquedas restantes
      const searchInfo = await canSearch(status.plan);
      setRemainingSearches(searchInfo.remaining);

      // Obtener fecha de reset
      const reset = await getResetDate();
      setResetDate(reset);
    } catch (err: any) {
      console.error('[useSubscription] Error:', err);
      setError(err.message || 'Error al obtener suscripción');
      // En caso de error, asumir plan free
      setSubscription({
        plan: 'free',
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isActive = subscription?.status === 'active';
  const isPremium = subscription?.plan === 'premium';
  const isPro = subscription?.plan === 'pro';
  const isPlus = subscription?.plan === 'plus';
  const isFree = subscription?.plan === 'free' || !subscription;
  const hasUnlimited = subscription?.plan === 'premium' || subscription?.plan === 'pro';

  const getDaysRemaining = (): number | null => {
    if (!subscription?.currentPeriodEnd) return null;
    const endDate = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return {
    subscription,
    loading,
    error,
    isActive,
    isPremium,
    isPro,
    isPlus,
    isFree,
    hasUnlimited,
    remainingSearches,
    resetDate,
    daysRemaining: getDaysRemaining(),
    refetch: fetchSubscription,
  };
};

