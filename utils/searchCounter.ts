import * as SecureStore from 'expo-secure-store';
import { PlanType } from '../types/subscription';

const SEARCH_COUNT_KEY = 'searchCount';
const SEARCH_RESET_DATE_KEY = 'searchResetDate';

/**
 * Obtiene el primer día del próximo mes
 */
const getNextMonthFirstDay = (): Date => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
};

/**
 * Verifica y resetea el contador si es necesario (primer día del mes)
 */
export const resetCounterIfNeeded = async (): Promise<void> => {
  try {
    const today = new Date();
    const resetDateStr = await SecureStore.getItemAsync(SEARCH_RESET_DATE_KEY);
    
    if (!resetDateStr) {
      // Primera vez: inicializar con el primer día del próximo mes
      const nextMonth = getNextMonthFirstDay();
      await SecureStore.setItemAsync(SEARCH_RESET_DATE_KEY, nextMonth.toISOString());
      await SecureStore.setItemAsync(SEARCH_COUNT_KEY, '0');
      console.log('[searchCounter] Inicializado contador, reset el:', nextMonth.toISOString());
      return;
    }

    const resetDate = new Date(resetDateStr);
    const now = new Date();

    // Si hoy es el día de reset o ya pasó, resetear contador
    if (now >= resetDate) {
      const nextMonth = getNextMonthFirstDay();
      await SecureStore.setItemAsync(SEARCH_RESET_DATE_KEY, nextMonth.toISOString());
      await SecureStore.setItemAsync(SEARCH_COUNT_KEY, '0');
      console.log('[searchCounter] ✅ Contador reseteado. Próximo reset:', nextMonth.toISOString());
    }
  } catch (error) {
    console.error('[searchCounter] Error al resetear contador:', error);
  }
};

/**
 * Obtiene el contador actual de búsquedas
 */
export const getSearchCount = async (): Promise<number> => {
  try {
    await resetCounterIfNeeded();
    const countStr = await SecureStore.getItemAsync(SEARCH_COUNT_KEY);
    return countStr ? parseInt(countStr, 10) : 0;
  } catch (error) {
    console.error('[searchCounter] Error al obtener contador:', error);
    return 0;
  }
};

/**
 * Incrementa el contador de búsquedas
 */
export const incrementSearchCount = async (): Promise<number> => {
  try {
    await resetCounterIfNeeded();
    const currentCount = await getSearchCount();
    const newCount = currentCount + 1;
    await SecureStore.setItemAsync(SEARCH_COUNT_KEY, newCount.toString());
    console.log('[searchCounter] Contador incrementado:', newCount);
    return newCount;
  } catch (error) {
    console.error('[searchCounter] Error al incrementar contador:', error);
    return 0;
  }
};

/**
 * Verifica si el usuario puede hacer búsquedas según su plan
 */
export const canSearch = async (plan: PlanType): Promise<{ can: boolean; remaining: number | null; limit: number | 'unlimited' }> => {
  await resetCounterIfNeeded();
  
  if (plan === 'premium' || plan === 'pro') {
    return { can: true, remaining: null, limit: 'unlimited' };
  }

  const currentCount = await getSearchCount();
  
  if (plan === 'free') {
    const limit = 3;
    return {
      can: currentCount < limit,
      remaining: Math.max(0, limit - currentCount),
      limit,
    };
  }

  if (plan === 'plus') {
    const limit = 30;
    return {
      can: currentCount < limit,
      remaining: Math.max(0, limit - currentCount),
      limit,
    };
  }

  return { can: false, remaining: 0, limit: 0 };
};

/**
 * Obtiene la fecha de próximo reset del contador
 */
export const getResetDate = async (): Promise<Date | null> => {
  try {
    const resetDateStr = await SecureStore.getItemAsync(SEARCH_RESET_DATE_KEY);
    return resetDateStr ? new Date(resetDateStr) : null;
  } catch (error) {
    console.error('[searchCounter] Error al obtener fecha de reset:', error);
    return null;
  }
};

/**
 * Inicializa el contador para un nuevo usuario
 */
export const initializeSearchCounter = async (): Promise<void> => {
  try {
    const nextMonth = getNextMonthFirstDay();
    await SecureStore.setItemAsync(SEARCH_RESET_DATE_KEY, nextMonth.toISOString());
    await SecureStore.setItemAsync(SEARCH_COUNT_KEY, '0');
    console.log('[searchCounter] Contador inicializado para nuevo usuario');
  } catch (error) {
    console.error('[searchCounter] Error al inicializar contador:', error);
  }
};

