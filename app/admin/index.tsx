import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, DollarSign, TrendingUp, BarChart3, UserPlus, Calculator, Receipt, History } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { adminAPI } from '../services/api';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  monthlyRevenue: number;
  topDiagrams: Array<{ query: string; count: number }>;
  recentUsers: Array<{ username: string; email: string; createdAt: string }>;
  monthlyGrowth: Array<{ month: string; count: number }>;
}

interface Subscription {
  plan: string;
  price: number;
  status: string;
}

interface GrossRevenueHistory {
  date: string;
  paidUsers: number;
  totalSubscriptions: number;
  fixedCosts: number;
  taxes: number;
  grossAfterCosts: number;
}

export default function AdminScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<GrossRevenueHistory[]>([]);

  useEffect(() => {
    checkAdminAccess();
    fetchAdminStats();
    fetchSubscriptions();
    loadRevenueHistory();
  }, []);

  const loadRevenueHistory = () => {
    // Cargar historial desde SecureStore o API
    try {
      // Mock data para desarrollo - en producción esto vendría del backend
      const mockHistory: GrossRevenueHistory[] = [
        {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          paidUsers: 10,
          totalSubscriptions: 119.90,
          fixedCosts: 89,
          taxes: 6.18,
          grossAfterCosts: 24.72,
        },
        {
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          paidUsers: 8,
          totalSubscriptions: 95.92,
          fixedCosts: 89,
          taxes: 1.38,
          grossAfterCosts: 5.54,
        },
        {
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          paidUsers: 15,
          totalSubscriptions: 179.85,
          fixedCosts: 89,
          taxes: 18.17,
          grossAfterCosts: 72.68,
        },
      ];
      setRevenueHistory(mockHistory);
    } catch (error) {
      console.error('[Admin] Error cargando historial:', error);
    }
  };

  const checkAdminAccess = async () => {
    try {
      const userData = await SecureStore.getItemAsync('userData');
      if (!userData) {
        router.replace('/dashboard');
        return;
      }

      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        Alert.alert('Acceso Denegado', 'Solo administradores pueden acceder a esta sección');
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('[Admin] Error verificando acceso:', error);
      router.replace('/dashboard');
    }
  };

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsData = await adminAPI.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('[Admin] Error obteniendo stats:', error);
      setError(error.response?.data?.message || 'Error al cargar estadísticas');
      
      // Mock data para desarrollo si el endpoint no existe
      setStats({
        totalUsers: 1250,
        activeUsers: 890,
        monthlyRevenue: 12450.50,
        topDiagrams: [
          { query: 'Toyota Corolla 2020', count: 234 },
          { query: 'Honda Civic 2019', count: 189 },
          { query: 'Ford F-150 2021', count: 156 },
          { query: 'Chevrolet Silverado', count: 142 },
          { query: 'BMW 3 Series', count: 128 },
          { query: 'Mercedes C-Class', count: 115 },
          { query: 'Nissan Altima', count: 98 },
          { query: 'Audi A4', count: 87 },
          { query: 'Volkswagen Jetta', count: 76 },
          { query: 'Hyundai Elantra', count: 65 },
        ],
        recentUsers: [
          { username: 'user123', email: 'user123@example.com', createdAt: new Date().toISOString() },
          { username: 'john_doe', email: 'john@example.com', createdAt: new Date(Date.now() - 86400000).toISOString() },
          { username: 'jane_smith', email: 'jane@example.com', createdAt: new Date(Date.now() - 172800000).toISOString() },
          { username: 'mike_wilson', email: 'mike@example.com', createdAt: new Date(Date.now() - 259200000).toISOString() },
          { username: 'sarah_brown', email: 'sarah@example.com', createdAt: new Date(Date.now() - 345600000).toISOString() },
        ],
        monthlyGrowth: [
          { month: 'Ene', count: 120 },
          { month: 'Feb', count: 145 },
          { month: 'Mar', count: 168 },
          { month: 'Abr', count: 192 },
          { month: 'May', count: 210 },
          { month: 'Jun', count: 235 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const subscriptionsData = await adminAPI.getSubscriptions();
      // Filtrar solo suscripciones activas y pagas (no free)
      const paidSubscriptions = subscriptionsData.filter((sub: Subscription) => 
        sub.status === 'active' && sub.plan !== 'free'
      );
      setSubscriptions(paidSubscriptions);
    } catch (error: any) {
      console.error('[Admin] Error obteniendo suscripciones:', error);
      // Mock data para desarrollo
      setSubscriptions([
        { plan: 'plus', price: 5.99, status: 'active' },
        { plan: 'premium', price: 9.99, status: 'active' },
        { plan: 'pro', price: 19.99, status: 'active' },
        { plan: 'plus', price: 5.99, status: 'active' },
        { plan: 'premium', price: 9.99, status: 'active' },
        { plan: 'pro', price: 19.99, status: 'active' },
        { plan: 'plus', price: 5.99, status: 'active' },
        { plan: 'premium', price: 9.99, status: 'active' },
        { plan: 'pro', price: 19.99, status: 'active' },
        { plan: 'plus', price: 5.99, status: 'active' },
        { plan: 'premium', price: 9.99, status: 'active' },
        { plan: 'pro', price: 19.99, status: 'active' },
      ]);
    }
  };

  const calculateGrossRevenue = () => {
    const FIXED_COSTS = 89;
    const TAX_RATE = 0.20; // 20%
    
    // Sumar todas las suscripciones pagas
    const totalSubscriptions = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
    
    // Restar costos fijos
    const afterFixedCosts = totalSubscriptions - FIXED_COSTS;
    
    // Restar taxes (20% del resultado después de costos fijos)
    const taxes = afterFixedCosts * TAX_RATE;
    const grossAfterCosts = afterFixedCosts - taxes;
    
    return {
      paidUsers: subscriptions.length,
      totalSubscriptions,
      fixedCosts: FIXED_COSTS,
      afterFixedCosts,
      taxes,
      grossAfterCosts,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={fetchAdminStats}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Gross Revenue Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calculator size={20} color="#10b981" />
            <Text style={styles.sectionTitle}>Gross Revenue</Text>
          </View>
          <View style={styles.card}>
            {(() => {
              const revenue = calculateGrossRevenue();
              return (
                <>
                  <View>
                    <View style={styles.revenueRow}>
                      <Text style={styles.revenueLabel} numberOfLines={1}>Usuarios Pagos</Text>
                      <Text style={styles.revenueValue}>{revenue.paidUsers}</Text>
                    </View>
                    <View style={styles.revenueRow}>
                      <Text style={styles.revenueLabel} numberOfLines={1}>Total Suscripciones</Text>
                      <Text style={styles.revenueValue} numberOfLines={1}>{formatCurrency(revenue.totalSubscriptions)}</Text>
                    </View>
                    <View style={styles.revenueRow}>
                      <Text style={styles.revenueLabel} numberOfLines={1}>Costos Fijos</Text>
                      <Text style={[styles.revenueValue, styles.negativeValue]} numberOfLines={1}>-{formatCurrency(revenue.fixedCosts)}</Text>
                    </View>
                    <View style={styles.revenueRow}>
                      <Text style={styles.revenueLabel} numberOfLines={2}>Subtotal</Text>
                      <Text style={styles.revenueValue} numberOfLines={1}>{formatCurrency(revenue.afterFixedCosts)}</Text>
                    </View>
                    <View style={styles.revenueRow}>
                      <Text style={styles.revenueLabel} numberOfLines={1}>Taxes (20%)</Text>
                      <Text style={[styles.revenueValue, styles.negativeValue]} numberOfLines={1}>-{formatCurrency(revenue.taxes)}</Text>
                    </View>
                    <View style={styles.revenueDivider}>
                      <View style={styles.grossRow}>
                        <View style={styles.grossLabelContainer}>
                          <Receipt size={18} color="#10b981" />
                          <Text style={styles.grossLabel} numberOfLines={1}>Gross After Costs</Text>
                        </View>
                        <Text style={styles.grossValue} numberOfLines={1}>{formatCurrency(revenue.grossAfterCosts)}</Text>
                      </View>
                    </View>
                  </View>
                </>
              );
            })()}
          </View>
        </View>

        {/* Gross Revenue History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <History size={20} color="#10b981" />
            <Text style={styles.sectionTitle}>Historial Gross Revenue</Text>
          </View>
          <View style={styles.card}>
            {revenueHistory.length > 0 ? (
              revenueHistory.map((entry, index) => (
                <View
                  key={index}
                  style={[styles.historyRow, index < revenueHistory.length - 1 && styles.historyRowBorder]}
                >
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                    <Text style={styles.historyUsers}>{entry.paidUsers} usuarios</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyGross}>{formatCurrency(entry.grossAfterCosts)}</Text>
                    <Text style={styles.historyTotal}>{formatCurrency(entry.totalSubscriptions)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No hay historial disponible</Text>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            {/* Total Users */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Users size={24} color="#06b6d4" />
                <Text style={styles.statLabel}>Total Usuarios</Text>
              </View>
              <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
            </View>

            {/* Active Users */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <UserPlus size={24} color="#10b981" />
                <Text style={styles.statLabel}>Usuarios Activos</Text>
              </View>
              <Text style={styles.statValue}>{stats?.activeUsers || 0}</Text>
            </View>

            {/* Monthly Revenue */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <DollarSign size={24} color="#f59e0b" />
                <Text style={styles.statLabel}>Revenue Mensual</Text>
              </View>
              <Text style={styles.statValueSmall}>
                {formatCurrency(stats?.monthlyRevenue || 0)}
              </Text>
            </View>

            {/* Growth */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <TrendingUp size={24} color="#a855f7" />
                <Text style={styles.statLabel}>Crecimiento</Text>
              </View>
              <Text style={styles.statValueSmall}>
                +{stats?.monthlyGrowth?.[stats.monthlyGrowth.length - 1]?.count || 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Top Diagrams */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={20} color="#06b6d4" />
            <Text style={styles.sectionTitle}>Diagramas Más Consultados</Text>
          </View>
          <View style={styles.card}>
            {stats?.topDiagrams?.slice(0, 10).map((diagram, index) => (
              <View
                key={index}
                style={[styles.diagramRow, index < (stats?.topDiagrams?.length || 0) - 1 && styles.diagramRowBorder]}
              >
                <View style={styles.diagramLeft}>
                  <Text style={styles.diagramText} numberOfLines={1}>
                    {index + 1}. {diagram.query}
                  </Text>
                </View>
                <View style={styles.diagramBadge}>
                  <Text style={styles.diagramCount}>{diagram.count}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleStandalone}>Usuarios Recientes</Text>
          <View style={styles.card}>
            {stats?.recentUsers?.slice(0, 5).map((user, index) => (
              <View
                key={index}
                style={[styles.userRow, index < (stats?.recentUsers?.length || 0) - 1 && styles.userRowBorder]}
              >
                <View style={styles.userLeft}>
                  <Text style={styles.userName}>{user.username}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <Text style={styles.userDate}>{formatDate(user.createdAt)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Growth Chart (Simple) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleStandalone}>Crecimiento Mensual</Text>
          <View style={styles.card}>
            <View style={styles.chartContainer}>
              {stats?.monthlyGrowth?.map((month, index) => {
                const maxCount = Math.max(...(stats.monthlyGrowth?.map(m => m.count) || [1]));
                const height = (month.count / maxCount) * 100;
                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.chartBarContainer}>
                      <LinearGradient
                        colors={['#06b6d4', '#22d3ee']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        style={[styles.chartBarGradient, { height: `${height}%`, minHeight: 8 }]}
                      />
                    </View>
                    <Text style={styles.chartMonth}>{month.month}</Text>
                    <Text style={styles.chartValue}>{month.count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Refresh Button */}
        <View style={styles.refreshSection}>
          <TouchableOpacity
            onPress={() => {
              fetchAdminStats();
              fetchSubscriptions();
            }}
            style={styles.refreshButton}
            disabled={loading}
          >
            <Text style={styles.refreshButtonText}>
              {loading ? 'Actualizando...' : 'Actualizar Estadísticas'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#06b6d4', // cyan-500
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate-700
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionTitleStandalone: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155', // slate-700
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  revenueLabel: {
    color: '#94a3b8',
    fontSize: 12,
    flex: 1,
  },
  revenueValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  negativeValue: {
    color: '#f87171', // red-400
  },
  revenueDivider: {
    borderTopWidth: 1,
    borderTopColor: '#334155', // slate-700
    paddingTop: 12,
    marginTop: 8,
  },
  grossRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grossLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  grossLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  grossValue: {
    color: '#4ade80', // green-400
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate-700
  },
  historyLeft: {
    flex: 1,
    marginRight: 8,
  },
  historyDate: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyUsers: {
    color: '#94a3b8',
    fontSize: 12,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyGross: {
    color: '#4ade80', // green-400
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyTotal: {
    color: '#64748b',
    fontSize: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155', // slate-700
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginLeft: 8,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statValueSmall: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  diagramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  diagramRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate-700
  },
  diagramLeft: {
    flex: 1,
  },
  diagramText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  diagramBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  diagramCount: {
    color: '#67e8f9', // cyan-300
    fontSize: 14,
    fontWeight: 'bold',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  userRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate-700
  },
  userLeft: {
    flex: 1,
  },
  userName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 14,
  },
  userDate: {
    color: '#64748b',
    fontSize: 12,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 128,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  chartBarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarGradient: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartMonth: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 8,
  },
  chartValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  refreshSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  refreshButton: {
    backgroundColor: '#06b6d4', // cyan-500
    paddingVertical: 16,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
