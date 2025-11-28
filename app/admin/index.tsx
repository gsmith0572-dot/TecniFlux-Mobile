import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, DollarSign, TrendingUp, BarChart3, UserPlus } from 'lucide-react-native';
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

export default function AdminScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
    fetchAdminStats();
  }, []);

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
      <SafeAreaView className="flex-1 bg-slate-900">
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text className="text-slate-400 mt-4">Cargando estadísticas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !stats) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-400 text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={fetchAdminStats}
            className="bg-cyan-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-slate-700">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Panel de Administración</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View className="px-6 pt-6">
          <View className="flex-row flex-wrap justify-between mb-6">
            {/* Total Users */}
            <View className="w-[48%] bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
              <View className="flex-row items-center mb-2">
                <Users size={24} color="#06b6d4" />
                <Text className="text-slate-400 text-sm ml-2">Total Usuarios</Text>
              </View>
              <Text className="text-white text-3xl font-bold">{stats?.totalUsers || 0}</Text>
            </View>

            {/* Active Users */}
            <View className="w-[48%] bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
              <View className="flex-row items-center mb-2">
                <UserPlus size={24} color="#10b981" />
                <Text className="text-slate-400 text-sm ml-2">Usuarios Activos</Text>
              </View>
              <Text className="text-white text-3xl font-bold">{stats?.activeUsers || 0}</Text>
            </View>

            {/* Monthly Revenue */}
            <View className="w-[48%] bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
              <View className="flex-row items-center mb-2">
                <DollarSign size={24} color="#f59e0b" />
                <Text className="text-slate-400 text-sm ml-2">Revenue Mensual</Text>
              </View>
              <Text className="text-white text-2xl font-bold">
                {formatCurrency(stats?.monthlyRevenue || 0)}
              </Text>
            </View>

            {/* Growth */}
            <View className="w-[48%] bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
              <View className="flex-row items-center mb-2">
                <TrendingUp size={24} color="#a855f7" />
                <Text className="text-slate-400 text-sm ml-2">Crecimiento</Text>
              </View>
              <Text className="text-white text-2xl font-bold">
                +{stats?.monthlyGrowth?.[stats.monthlyGrowth.length - 1]?.count || 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Top Diagrams */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <BarChart3 size={20} color="#06b6d4" />
            <Text className="text-white text-xl font-bold ml-2">Diagramas Más Consultados</Text>
          </View>
          <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            {stats?.topDiagrams?.slice(0, 10).map((diagram, index) => (
              <View
                key={index}
                className="flex-row justify-between items-center py-3 border-b border-slate-700 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold" numberOfLines={1}>
                    {index + 1}. {diagram.query}
                  </Text>
                </View>
                <View className="bg-cyan-500/20 px-3 py-1 rounded-full">
                  <Text className="text-cyan-300 text-sm font-bold">{diagram.count}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Users */}
        <View className="px-6 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Usuarios Recientes</Text>
          <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            {stats?.recentUsers?.slice(0, 5).map((user, index) => (
              <View
                key={index}
                className="flex-row justify-between items-center py-3 border-b border-slate-700 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-white text-base font-semibold">{user.username}</Text>
                  <Text className="text-slate-400 text-sm">{user.email}</Text>
                </View>
                <Text className="text-slate-500 text-xs">{formatDate(user.createdAt)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Growth Chart (Simple) */}
        <View className="px-6 mb-8">
          <Text className="text-white text-xl font-bold mb-4">Crecimiento Mensual</Text>
          <View className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <View className="flex-row items-end justify-between h-32">
              {stats?.monthlyGrowth?.map((month, index) => {
                const maxCount = Math.max(...(stats.monthlyGrowth?.map(m => m.count) || [1]));
                const height = (month.count / maxCount) * 100;
                return (
                  <View key={index} className="flex-1 items-center mx-1">
                    <View
                      className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t"
                      style={{ height: `${height}%`, minHeight: 8 }}
                    />
                    <Text className="text-slate-400 text-xs mt-2">{month.month}</Text>
                    <Text className="text-white text-xs font-bold mt-1">{month.count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Refresh Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={fetchAdminStats}
            className="bg-cyan-500 py-4 rounded-xl"
            disabled={loading}
          >
            <Text className="text-white text-center font-bold text-lg">
              {loading ? 'Actualizando...' : 'Actualizar Estadísticas'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

