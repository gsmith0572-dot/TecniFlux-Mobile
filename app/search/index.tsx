import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Search as SearchIcon, ArrowLeft, FileText, AlertCircle } from 'lucide-react-native';
// ✅ RUTA CORREGIDA: Solo sube un nivel (../) para encontrar la carpeta 'services'
import api from '../services/api'; 

interface Diagram {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: string;
  system: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q: string }>();
  
  const [query, setQuery] = useState(q || '');
  const [results, setResults] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (q) {
      handleSearch(q);
    }
  }, [q]);

  const handleSearch = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setHasSearched(true);
    setQuery(text);

    try {
      // Nota: El backend todavía no tiene datos, esto debe devolver 404/Empty.
      const response = await api.get('/api/diagrams/search', {
        params: { q: text }
      });
      setResults(response.data.diagrams); // Asumiendo que devuelve un objeto con un array 'diagrams'
    } catch (err) {
      console.error("Error buscando:", err);
      // El 404 no es un error de conexión, sino de ruta o datos.
      setError('No se pudo encontrar la ruta de búsqueda (Error 404).'); 
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Diagram }) => (
    <TouchableOpacity 
      className="bg-slate-800 p-4 rounded-xl mb-3 border border-slate-700 flex-row items-center"
      activeOpacity={0.7}
    >
      <View className="bg-slate-700 p-3 rounded-lg mr-4">
        <FileText size={24} color="#38bdf8" />
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-base" numberOfLines={1}>{item.title}</Text>
        <Text className="text-slate-400 text-sm mt-1">
          {item.brand} • {item.model} • {item.year}
        </Text>
        <View className="bg-slate-700/50 self-start px-2 py-0.5 rounded mt-2">
          <Text className="text-slate-300 text-xs font-medium">{item.system}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      <View className="px-4 py-2 flex-row items-center border-b border-slate-800 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-slate-800 rounded-xl px-4 h-12 border border-slate-700">
          <SearchIcon size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-white text-base"
            placeholder="Buscar diagrama..."
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoFocus={!q}
          />
        </View>
      </View>
      <View className="flex-1 px-4 pt-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#06b6d4" />
            <Text className="text-slate-400 mt-4">Buscando en la nube...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center opacity-70">
            <AlertCircle size={48} color="#ef4444" />
            <Text className="text-red-400 mt-4 text-center">{error}</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              hasSearched ? (
                <View className="items-center mt-20 opacity-50">
                  <FileText size={64} color="#475569" />
                  <Text className="text-slate-400 mt-4 text-center">
                    No encontramos diagramas para "{query}"
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}