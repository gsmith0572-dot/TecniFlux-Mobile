import * as SecureStore from 'expo-secure-store';
import { SearchHistoryItem } from '../types/subscription';

const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_HISTORY_ITEMS = 3;

/**
 * Obtiene el historial de búsquedas
 */
export const getSearchHistory = async (): Promise<SearchHistoryItem[]> => {
  try {
    const historyStr = await SecureStore.getItemAsync(SEARCH_HISTORY_KEY);
    if (!historyStr) return [];
    
    const history = JSON.parse(historyStr) as SearchHistoryItem[];
    // Ordenar por fecha (más reciente primero) y limitar a MAX_HISTORY_ITEMS
    return history
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, MAX_HISTORY_ITEMS);
  } catch (error) {
    console.error('[searchHistory] Error al obtener historial:', error);
    return [];
  }
};

/**
 * Agrega una búsqueda al historial
 */
export const addToHistory = async (item: Omit<SearchHistoryItem, 'id' | 'date'>): Promise<void> => {
  try {
    const currentHistory = await getSearchHistory();
    
    const newItem: SearchHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
    };

    // Eliminar duplicados basados en fileId
    const filteredHistory = currentHistory.filter(
      (h) => h.fileId !== newItem.fileId
    );

    // Agregar nuevo item al inicio y limitar a MAX_HISTORY_ITEMS
    const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

    await SecureStore.setItemAsync(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    console.log('[searchHistory] Búsqueda agregada al historial:', newItem.id);
  } catch (error) {
    console.error('[searchHistory] Error al agregar al historial:', error);
  }
};

/**
 * Limpia todo el historial
 */
export const clearHistory = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(SEARCH_HISTORY_KEY);
    console.log('[searchHistory] Historial limpiado');
  } catch (error) {
    console.error('[searchHistory] Error al limpiar historial:', error);
  }
};

