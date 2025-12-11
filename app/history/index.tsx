import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
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
      style={styles.historyCard}
    >
      <View style={styles.historyRow}>
        <View style={styles.historyIconContainer}>
          <FileText size={24} color="#06b6d4" />
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyTitle}>
            {item.make} {item.model}
          </Text>
          {item.year && (
            <Text style={styles.historyYear}>
              Año: {item.year}
            </Text>
          )}
          {item.system && (
            <Text style={styles.historySystem}>
              Sistema: {item.system}
            </Text>
          )}
          <View style={styles.historyDateRow}>
            <Clock size={14} color="#64748b" />
            <Text style={styles.historyDate}>
              {formatDate(item.date)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#06b6d4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Historial</Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity
              onPress={handleClearHistory}
              style={styles.clearButton}
              activeOpacity={0.8}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCard}>
              <Clock size={72} color="#475569" />
              <Text style={styles.emptyText}>
                No hay historial aún
              </Text>
              <Text style={styles.emptySubtext}>
                Los diagramas que consultes aparecerán aquí
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Text style={styles.contentSubtitle}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  flex1: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  contentSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  historyIconContainer: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyYear: {
    color: '#06b6d4',
    fontSize: 14,
    marginTop: 4,
  },
  historySystem: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  historyDate: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 4,
  },
});
