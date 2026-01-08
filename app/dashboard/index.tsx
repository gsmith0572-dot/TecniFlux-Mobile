import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ScanBarcode, History, Shield, HelpCircle } from 'lucide-react-native';
import SubscriptionBanner from '../../components/SubscriptionBanner';
import { useSubscription } from '../../hooks/useSubscription';
import * as SecureStore from 'expo-secure-store';

export default function DashboardScreen() {
  const router = useRouter();
  const { subscription } = useSubscription();
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAdmin(user.role === 'admin');
        setUsername(user.username || 'Usuario');
      }
    } catch (error) {
      console.error('[Dashboard] Error cargando datos:', error);
    }
  };
  // 1. Función para ir a búsqueda general (cuando tocas la barra)
  const handleSearch = () => {
    router.push({
      pathname: '/search',
      params: { q: '' } // Envía búsqueda vacía
    });
  };

  const handleScanner = () => {
    router.push('/scanner');
  };

  const getPlanBadgeStyle = () => {
    if (subscription?.plan === 'pro') {
      return { backgroundColor: 'rgba(22, 163, 74, 0.3)', borderColor: 'rgba(34, 197, 94, 0.5)' }; // verde oscuro
    } else if (subscription?.plan === 'premium') {
      return { backgroundColor: 'rgba(6, 182, 212, 0.2)', borderColor: 'rgba(6, 182, 212, 0.3)' };
    } else if (subscription?.plan === 'plus') {
      return { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: 'rgba(245, 158, 11, 0.3)' };
    }
    return { backgroundColor: 'rgba(100, 116, 139, 0.2)', borderColor: 'rgba(100, 116, 139, 0.3)' };
  };

  const getPlanTextStyle = () => {
    if (subscription?.plan === 'pro') {
      return { color: '#4ade80' }; // green-400 (verde claro)
    } else if (subscription?.plan === 'premium') {
      return { color: '#67e8f9' }; // cyan-300
    } else if (subscription?.plan === 'plus') {
      return { color: '#fcd34d' }; // amber-300
    }
    return { color: '#cbd5e1' }; // slate-300
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {/* Línea 1: Saludo */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hola, {username}</Text>
          </View>
          
          {/* Línea 2: Badges e iconos */}
          <View style={styles.badgesRow}>
            {isAdmin && (
              <TouchableOpacity
                onPress={() => router.push('/admin')}
                style={styles.adminButton}
                activeOpacity={0.8}
              >
                <Shield size={20} color="#22d3ee" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => router.push('/help')}
              style={styles.iconButton}
              activeOpacity={0.8}
            >
              <HelpCircle size={20} color="#06b6d4" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/history')}
              style={styles.iconButton}
              activeOpacity={0.8}
            >
              <History size={20} color="#06b6d4" />
            </TouchableOpacity>
            <View style={[styles.planBadge, getPlanBadgeStyle()]}>
              <Text style={[styles.planText, getPlanTextStyle()]}>
                {subscription?.plan?.toUpperCase() || 'FREE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Banner */}
        <SubscriptionBanner />

        {/* Tarjeta de Búsqueda (Hero) */}
        <View style={styles.searchCard}>
          <Text style={styles.searchCardTitle}>¿Qué reparamos hoy?</Text>
          <TouchableOpacity
            onPress={handleSearch}
            style={styles.searchInput}
            activeOpacity={0.7}
          >
            <Search size={20} color="#94a3b8" />
            <Text style={styles.searchInputText}>Buscar por VIN o Marca...</Text>
          </TouchableOpacity>
        </View>

        {/* Búsqueda Rápida - Espacio Publicitario */}
        <View style={styles.quickSearchSection}>
          <Text style={styles.quickSearchTitle}>Búsqueda Rápida</Text>
          <Text style={styles.quickSearchSubtitle}>
            Accede a más de 30,000 diagramas técnicos automotrices
          </Text>
          
          {/* Espacio publicitario - Ocupa todo el espacio */}
          <View style={styles.adSpace}>
            <Text style={styles.adSpaceText}>Espacio Publicitario Disponible</Text>
          </View>
        </View>

        {/* Link a Acerca de */}
        <View style={styles.aboutSection}>
          <TouchableOpacity
            onPress={() => router.push('/about')}
            style={styles.aboutButton}
            activeOpacity={0.8}
          >
            <Text style={styles.aboutButtonText}>
              Acerca de TecniFlux
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Botón Flotante de Escáner (FAB) */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          onPress={handleScanner}
          style={styles.fab}
          activeOpacity={0.8}
        >
          <ScanBarcode size={28} color="#0f172a" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  greetingContainer: {
    marginBottom: 12,
  },
  greeting: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminButton: {
    backgroundColor: '#1e293b', // slate-800
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#06b6d4', // cyan-500
  },
  iconButton: {
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  planText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#cbd5e1', // slate-300 default
  },
  searchCard: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchCardTitle: {
    color: '#94a3b8',
    marginBottom: 16,
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInputText: {
    color: '#64748b',
    marginLeft: 12,
    fontSize: 16,
  },
  quickSearchSection: {
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 24,
  },
  quickSearchTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  quickSearchSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  adSpace: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 12,
    padding: 48,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    minHeight: 200,
  },
  adSpaceText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  aboutSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  aboutButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  aboutButtonText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 64,
    height: 64,
    backgroundColor: '#06b6d4',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});