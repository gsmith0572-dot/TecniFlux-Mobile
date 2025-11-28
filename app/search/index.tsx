import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, LogOut, ChevronDown, AlertCircle } from 'lucide-react-native';
import { diagramAPI } from '../services/api';
import * as SecureStore from 'expo-secure-store';
import { useSubscription } from '../../hooks/useSubscription';
import PaywallOverlay from '../../components/PaywallOverlay';
import { canSearch, incrementSearchCount, getSearchCount } from '../../utils/searchCounter';
import { addToHistory } from '../../utils/searchHistory';

interface Diagram {
  id: string;
  make?: string;
  model?: string;
  year?: string;
  system?: string;
  fileId?: string;
  driveUrl?: string;
}

const VEHICLE_MAKES = [
  'Acura', 'Alfa Romeo', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ferrari', 'Fiat', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Isuzu',
  'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Maserati',
  'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Peugeot', 'Porsche',
  'Ram', 'Renault', 'Rolls-Royce', 'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen',
  'Volvo'
];

const YEARS = Array.from({ length: 2026 - 1972 + 1 }, (_, i) => (2026 - i).toString());

export default function SearchScreen() {
  const router = useRouter();
  const { subscription, isPremium, isPro, isFree, isPlus, hasUnlimited } = useSubscription();
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [remainingSearches, setRemainingSearches] = useState<number | null>(null);

  // Verificar límite de búsquedas mensuales
  useEffect(() => {
    checkSearchLimit();
  }, [subscription]);

  const checkSearchLimit = async () => {
    if (!subscription?.plan) return;
    
    const searchInfo = await canSearch(subscription.plan);
    setRemainingSearches(searchInfo.remaining);
  };

  const handleSearch = async () => {
    if (!selectedMake.trim()) {
      Alert.alert('Atención', 'Por favor selecciona una marca para buscar');
      return;
    }

    // Verificar límite ANTES de hacer la búsqueda
    if (subscription?.plan) {
      const searchInfo = await canSearch(subscription.plan);
      
      if (!searchInfo.can) {
        const limitText = searchInfo.limit === 'unlimited' 
          ? 'ilimitadas' 
          : `${searchInfo.limit} búsquedas mensuales`;
        
        Alert.alert(
          'Límite alcanzado',
          `Has alcanzado el límite de ${limitText}. Upgrade a un plan superior para más búsquedas.`,
          [
            { text: 'Ver Planes', onPress: () => router.push('/pricing') },
            { text: 'OK', style: 'cancel' },
          ]
        );
        setShowPaywall(true);
        return;
      }
    }

    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      if (!token) {
        Alert.alert('Error', 'No se encontró token de autenticación');
        router.replace('/login');
        return;
      }

      const query = selectedYear ? `${selectedMake} ${selectedYear}` : selectedMake;
      const response = await diagramAPI.search(query);
      const results = Array.isArray(response.data) ? response.data : (response.data.diagrams || response.data.results || []);
      
      setDiagrams(results);

      // Incrementar contador y guardar en historial si hay resultados
      if (results.length > 0 && subscription?.plan) {
        // Incrementar contador
        await incrementSearchCount();
        await checkSearchLimit(); // Actualizar contador restante

        // Guardar primer resultado en historial
        const firstResult = results[0];
        if (firstResult.fileId || firstResult.driveUrl) {
          await addToHistory({
            make: firstResult.make || selectedMake,
            model: firstResult.model || '',
            year: firstResult.year || selectedYear || '',
            system: firstResult.system,
            fileId: firstResult.fileId || '',
            driveUrl: firstResult.driveUrl,
          });
        }
      }

      if (results.length === 0) {
        Alert.alert('Sin resultados', `No se encontraron diagramas para ${selectedMake}${selectedYear ? ` ${selectedYear}` : ''}`);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Sesión expirada', 'Por favor inicia sesión nuevamente');
        await SecureStore.deleteItemAsync('userToken');
        router.replace('/login');
      } else {
        Alert.alert('Error', 'No se pudo realizar la búsqueda.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDiagram = (diagram: Diagram) => {
    let url = diagram.driveUrl;
    
    if (!url && diagram.fileId) {
      url = `https://drive.google.com/file/d/${diagram.fileId}/preview`;
    }
    
    if (!url) {
      Alert.alert('Error', 'Este diagrama no tiene URL disponible');
      return;
    }

    router.push(`/pdf-viewer/${encodeURIComponent(url)}`);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    router.replace('/login');
  };

  const renderDiagram = ({ item }: { item: Diagram }) => (
    <TouchableOpacity
      onPress={() => handleOpenDiagram(item)}
      activeOpacity={0.7}
      className="bg-slate-800 rounded-xl p-5 mb-4 border border-slate-700"
    >
      <View className="flex-row items-start">
        <View className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-500/30 mr-4">
          <FileText size={28} color="#06b6d4" />
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
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-900">
      <View className="bg-slate-800 pt-14 pb-6 px-6 border-b border-slate-700">
        <View className="flex-row items-center justify-between">
          <View className="flex-1" />
          <Text className="text-white text-2xl font-bold">TecniFlux</Text>
          <View className="flex-1 items-end">
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500/20 p-2 rounded-lg border border-red-500/30"
            >
              <LogOut size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="px-6 py-6">
        <View className="mb-4">
          <Text className="text-slate-400 text-sm mb-2 ml-1">Marca del vehículo</Text>
          <TouchableOpacity
            onPress={() => {
              setShowMakeDropdown(!showMakeDropdown);
              setShowYearDropdown(false);
            }}
            className="bg-slate-800 rounded-xl px-4 py-4 flex-row items-center justify-between border border-slate-700"
          >
            <Text className={selectedMake ? "text-white text-base" : "text-slate-500 text-base"}>
              {selectedMake || "Selecciona una marca"}
            </Text>
            <ChevronDown size={22} color="#06b6d4" />
          </TouchableOpacity>

          {showMakeDropdown && (
            <View className="bg-slate-800 rounded-xl mt-2 border border-slate-700 max-h-60">
              <ScrollView>
                {VEHICLE_MAKES.map((make) => (
                  <TouchableOpacity
                    key={make}
                    onPress={() => {
                      setSelectedMake(make);
                      setShowMakeDropdown(false);
                    }}
                    className="px-4 py-3 border-b border-slate-700/50"
                  >
                    <Text className="text-white text-base">{make}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-slate-400 text-sm mb-2 ml-1">Año (opcional)</Text>
          <TouchableOpacity
            onPress={() => {
              setShowYearDropdown(!showYearDropdown);
              setShowMakeDropdown(false);
            }}
            className="bg-slate-800 rounded-xl px-4 py-4 flex-row items-center justify-between border border-slate-700"
          >
            <Text className={selectedYear ? "text-white text-base" : "text-slate-500 text-base"}>
              {selectedYear || "Todos los años"}
            </Text>
            <ChevronDown size={22} color="#06b6d4" />
          </TouchableOpacity>

          {showYearDropdown && (
            <View className="bg-slate-800 rounded-xl mt-2 border border-slate-700 max-h-60">
              <ScrollView>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedYear('');
                    setShowYearDropdown(false);
                  }}
                  className="px-4 py-3 border-b border-slate-700/50"
                >
                  <Text className="text-slate-400 text-base">Todos los años</Text>
                </TouchableOpacity>
                {YEARS.map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => {
                      setSelectedYear(year);
                      setShowYearDropdown(false);
                    }}
                    className="px-4 py-3 border-b border-slate-700/50"
                  >
                    <Text className="text-white text-base">{year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Search limit warning para planes con límite */}
        {!hasUnlimited && remainingSearches !== null && (
          <View className={`mb-4 border rounded-xl px-4 py-3 flex-row items-center ${
            remainingSearches === 0 
              ? 'bg-red-500/20 border-red-500/30' 
              : remainingSearches <= (subscription?.plan === 'free' ? 1 : 5)
              ? 'bg-yellow-500/20 border-yellow-500/30'
              : 'bg-blue-500/20 border-blue-500/30'
          }`}>
            <AlertCircle size={20} color={
              remainingSearches === 0 
                ? '#ef4444' 
                : remainingSearches <= (subscription?.plan === 'free' ? 1 : 5)
                ? '#eab308'
                : '#3b82f6'
            } />
            <Text className={`text-sm ml-2 flex-1 ${
              remainingSearches === 0 
                ? 'text-red-400' 
                : remainingSearches <= (subscription?.plan === 'free' ? 1 : 5)
                ? 'text-yellow-400'
                : 'text-blue-400'
            }`}>
              {remainingSearches > 0 
                ? `${remainingSearches} búsqueda${remainingSearches !== 1 ? 's' : ''} restante${remainingSearches !== 1 ? 's' : ''} este mes`
                : 'Límite mensual alcanzado'
              }
            </Text>
            {remainingSearches === 0 && (
              <TouchableOpacity onPress={() => router.push('/pricing')}>
                <Text className="text-red-400 text-sm font-bold">UPGRADE</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading || !selectedMake || (!hasUnlimited && remainingSearches !== null && remainingSearches <= 0)}
          className={`rounded-xl py-4 ${!selectedMake || loading || (!hasUnlimited && remainingSearches !== null && remainingSearches <= 0) ? 'bg-slate-700' : 'bg-cyan-500'}`}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? 'Buscando...' : 'Buscar Diagramas'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6">
        {diagrams.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <View className="bg-slate-800/50 p-8 rounded-2xl items-center">
              <FileText size={72} color="#475569" />
              <Text className="text-slate-400 text-lg mt-4 text-center">
                Busca diagramas técnicos
              </Text>
              <Text className="text-slate-500 text-sm mt-2 text-center">
                Selecciona una marca y opcionalmente un año
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={diagrams}
            renderItem={renderDiagram}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <PaywallOverlay 
        visible={showPaywall} 
        plan={subscription?.plan || 'free'}
        onClose={() => setShowPaywall(false)}
      />
    </View>
  );
}
