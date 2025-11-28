import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, Clock, Trash2 } from 'lucide-react-native';
import { getSearchHistory, clearHistory } from '../../utils/searchHistory';
import { SearchHistoryItem } from '../../types/subscription';

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const items = await getSearchHistory();
      setHistory(items);
    } catch (error) {
      console.error('[History] Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDiagram = (item: SearchHistoryItem) => {
    const url = item.driveUrl || (item.fileId ? `https://drive.google.com/file/d/${item.fileId}/preview` : null);
    if (url) {
      router.push(`/pdf-viewer/${encodeURIComponent(url)}`);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch (error) {
      console.error('[History] Error clearing history:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <TouchableOpacity
      onPress={() => handleOpenDiagram(item)}
      activeOpacity={0.7}
      className="bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700"
    >
      <View className="flex-row items-start">
        <View className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-500/30 mr-4">
          <FileText size={24} color="#06b6d4" />
        </View>
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">
            {item.make} {item.model}
          </Text>
          {item.year && (
            <Text className="text-cyan-400 text-sm mt-1">
              Año: {item.year}
            </Text>
          )}
          {item.system && (
            <Text className="text-slate-400 text-sm mt-1">
              Sistema: {item.system}
            </Text>
          )}
          <View className="flex-row items-center mt-2">
            <Clock size={14} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1">
              {formatDate(item.date)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#06b6d4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">Historial</Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity
              onPress={handleClearHistory}
              className="bg-red-500/20 p-2 rounded-lg border border-red-500/30"
              activeOpacity={0.8}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {history.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6 py-20">
            <View className="bg-slate-800/50 p-8 rounded-2xl items-center">
              <Clock size={72} color="#475569" />
              <Text className="text-slate-400 text-lg mt-4 text-center">
                No hay historial aún
              </Text>
              <Text className="text-slate-500 text-sm mt-2 text-center">
                Los diagramas que consultes aparecerán aquí
              </Text>
            </View>
          </View>
        ) : (
          <View className="px-6 pb-8">
            <Text className="text-slate-400 text-sm mb-4">
              Últimos {history.length} diagramas consultados
            </Text>
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

