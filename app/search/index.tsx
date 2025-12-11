import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, LogOut, ChevronDown, AlertCircle, ArrowLeft } from 'lucide-react-native';
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
      style={styles.diagramCard}
    >
      <View style={styles.diagramRow}>
        <View style={styles.diagramIconContainer}>
          <FileText size={28} color="#06b6d4" />
        </View>
        <View style={styles.diagramContent}>
          <Text style={styles.diagramTitle}>
            {item.make} {item.model}
          </Text>
          {item.year && (
            <Text style={styles.diagramYear}>
              Año: {item.year}
            </Text>
          )}
          {item.system && (
            <Text style={styles.diagramSystem}>
              Sistema: {item.system}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getWarningStyle = () => {
    if (remainingSearches === 0) {
      return { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)' };
    } else if (remainingSearches !== null && remainingSearches <= (subscription?.plan === 'free' ? 1 : 5)) {
      return { backgroundColor: 'rgba(234, 179, 8, 0.2)', borderColor: 'rgba(234, 179, 8, 0.3)' };
    }
    return { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.3)' };
  };

  const getWarningTextColor = () => {
    if (remainingSearches === 0) {
      return '#ef4444';
    } else if (remainingSearches !== null && remainingSearches <= (subscription?.plan === 'free' ? 1 : 5)) {
      return '#eab308';
    }
    return '#3b82f6';
  };

  const getWarningIconColor = () => {
    if (remainingSearches === 0) {
      return '#ef4444';
    } else if (remainingSearches !== null && remainingSearches <= (subscription?.plan === 'free' ? 1 : 5)) {
      return '#eab308';
    }
    return '#3b82f6';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>TecniFlux</Text>
        
        <TouchableOpacity 
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <LogOut size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            onPress={() => {
              setShowMakeDropdown(!showMakeDropdown);
              setShowYearDropdown(false);
            }}
            style={styles.dropdown}
          >
            <Text style={[styles.dropdownText, !selectedMake && styles.dropdownPlaceholder]}>
              {selectedMake || "Selecciona una marca"}
            </Text>
            <ChevronDown size={22} color="#06b6d4" />
          </TouchableOpacity>

          {showMakeDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView>
                {VEHICLE_MAKES.map((make) => (
                  <TouchableOpacity
                    key={make}
                    onPress={() => {
                      setSelectedMake(make);
                      setShowMakeDropdown(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownItemText}>{make}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            onPress={() => {
              setShowYearDropdown(!showYearDropdown);
              setShowMakeDropdown(false);
            }}
            style={styles.dropdown}
          >
            <Text style={[styles.dropdownText, !selectedYear && styles.dropdownPlaceholder]}>
              {selectedYear || "Todos los años"}
            </Text>
            <ChevronDown size={22} color="#06b6d4" />
          </TouchableOpacity>

          {showYearDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedYear('');
                    setShowYearDropdown(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownItemTextAlt}>Todos los años</Text>
                </TouchableOpacity>
                {YEARS.map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => {
                      setSelectedYear(year);
                      setShowYearDropdown(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownItemText}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Search limit warning para planes con límite */}
        {!hasUnlimited && remainingSearches !== null && (
          <View style={[styles.warningContainer, getWarningStyle()]}>
            <AlertCircle size={20} color={getWarningIconColor()} />
            <Text style={[styles.warningText, { color: getWarningTextColor() }]}>
              {remainingSearches > 0 
                ? `${remainingSearches} búsqueda${remainingSearches !== 1 ? 's' : ''} restante${remainingSearches !== 1 ? 's' : ''} este mes`
                : 'Límite mensual alcanzado'
              }
            </Text>
            {remainingSearches === 0 && (
              <TouchableOpacity onPress={() => router.push('/pricing')}>
                <Text style={styles.upgradeText}>UPGRADE</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading || !selectedMake || (!hasUnlimited && remainingSearches !== null && remainingSearches <= 0)}
          style={[
            styles.searchButton,
            (!selectedMake || loading || (!hasUnlimited && remainingSearches !== null && remainingSearches <= 0)) && styles.searchButtonDisabled
          ]}
          activeOpacity={0.8}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Buscando...' : 'Buscar Diagramas'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        {diagrams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCard}>
              <FileText size={72} color="#475569" />
              <Text style={styles.emptyText}>
                Busca diagramas técnicos
              </Text>
              <Text style={styles.emptySubtext}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 9999,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 12,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dropdownText: {
    color: '#ffffff',
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: '#64748b',
  },
  dropdownList: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 240,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  dropdownItemText: {
    color: '#ffffff',
    fontSize: 16,
  },
  dropdownItemTextAlt: {
    color: '#94a3b8',
    fontSize: 16,
  },
  warningContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  upgradeText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchButton: {
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#06b6d4',
  },
  searchButtonDisabled: {
    backgroundColor: '#334155',
  },
  searchButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  diagramCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  diagramRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  diagramIconContainer: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    marginRight: 16,
  },
  diagramContent: {
    flex: 1,
  },
  diagramTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  diagramYear: {
    color: '#06b6d4',
    fontSize: 14,
    marginTop: 4,
  },
  diagramSystem: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
});
