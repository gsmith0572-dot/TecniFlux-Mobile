import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Car, Calendar, Settings, ExternalLink, AlertCircle } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import api from '../services/api';

interface DiagramDetail {
  id: number;
  fileName: string;
  make: string;
  model: string;
  year: string;
  system: string;
  directUrl: string;
}

export default function DiagramDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [diagram, setDiagram] = useState<DiagramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDiagram();
    }
  }, [id]);

  const fetchDiagram = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[fetchDiagram] Obteniendo diagrama ID:', id);
      const response = await api.get(`/api/diagrams/${id}`);
      
      console.log('[fetchDiagram] Respuesta completa:', JSON.stringify(response.data, null, 2));
      console.log('[fetchDiagram] response.data.diagram:', response.data.diagram);
      
      // El backend devuelve { diagram: {...} }
      if (response.data.diagram) {
        console.log('[fetchDiagram] ✅ Diagrama encontrado:', {
          id: response.data.diagram.id,
          make: response.data.diagram.make,
          model: response.data.diagram.model,
          year: response.data.diagram.year,
          hasDirectUrl: !!response.data.diagram.directUrl,
        });
        setDiagram(response.data.diagram);
      } else {
        console.error('[fetchDiagram] ❌ No se encontró diagram en response.data');
        setError('Formato de respuesta inválido');
      }
    } catch (err: any) {
      console.error('[fetchDiagram] ❌ Error obteniendo diagrama:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        err.response?.status === 404
          ? 'Diagrama no encontrado'
          : err.response?.data?.message || 'Error al cargar el diagrama'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPDF = async () => {
    if (!diagram?.directUrl) {
      console.warn('[handleOpenPDF] ⚠️ No hay directUrl disponible');
      return;
    }
    
    try {
      console.log('[handleOpenPDF] Abriendo PDF:', diagram.directUrl);
      setOpening(true);
      await WebBrowser.openBrowserAsync(diagram.directUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#06b6d4',
        toolbarColor: '#0f172a',
      });
      console.log('[handleOpenPDF] ✅ PDF abierto correctamente');
    } catch (err) {
      console.error('[handleOpenPDF] ❌ Error abriendo PDF:', err);
      setError('No se pudo abrir el PDF');
    } finally {
      setOpening(false);
    }
  };

  const getSystemLabel = (system: string) => {
    const systems: Record<string, string> = {
      MOTOR: 'Motor',
      TRANS: 'Transmisión',
      ELECTRIC: 'Eléctrico',
      BRAKE: 'Frenos',
      SUSPENSION: 'Suspensión',
      CLIMATE: 'Clima',
      BODY: 'Carrocería',
    };
    return systems[system] || system;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <StatusBar style="light" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text className="text-slate-400 mt-4">Cargando diagrama...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !diagram) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900">
        <StatusBar style="light" />
        <View className="px-4 py-2 flex-row items-center border-b border-slate-800 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Diagrama</Text>
        </View>
        <View className="flex-1 justify-center items-center px-4">
          <AlertCircle size={64} color="#ef4444" />
          <Text className="text-red-400 mt-4 text-center text-lg font-semibold">
            {error || 'Diagrama no encontrado'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-slate-800 px-6 py-3 rounded-xl border border-slate-700"
          >
            <Text className="text-white font-semibold">Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="px-4 py-2 flex-row items-center border-b border-slate-800 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold flex-1">Diagrama</Text>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Icono principal */}
        <View className="items-center mb-6 mt-4">
          <View className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <FileText size={64} color="#06b6d4" />
          </View>
        </View>

        {/* Título */}
        <Text className="text-white text-2xl font-bold text-center mb-6" numberOfLines={2}>
          {diagram.fileName}
        </Text>

        {/* Información del vehículo */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
          <View className="flex-row items-center mb-3">
            <Car size={20} color="#06b6d4" />
            <Text className="text-slate-400 text-sm font-semibold ml-2 uppercase tracking-wide">
              Información del Vehículo
            </Text>
          </View>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Text className="text-slate-400 text-sm flex-1">Marca:</Text>
              <Text className="text-white font-semibold">{diagram.make || 'N/A'}</Text>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-slate-400 text-sm flex-1">Modelo:</Text>
              <Text className="text-white font-semibold">{diagram.model || 'N/A'}</Text>
            </View>
            
            <View className="flex-row items-center">
              <Calendar size={16} color="#64748b" />
              <Text className="text-slate-400 text-sm flex-1 ml-2">Año:</Text>
              <Text className="text-white font-semibold">{diagram.year || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Sistema */}
        <View className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <View className="flex-row items-center">
            <Settings size={20} color="#06b6d4" />
            <Text className="text-slate-400 text-sm font-semibold ml-2 uppercase tracking-wide">
              Sistema
            </Text>
          </View>
          <View className="mt-3">
            <View className="bg-cyan-500/20 self-start px-4 py-2 rounded-lg border border-cyan-500/30">
              <Text className="text-cyan-400 font-bold text-base">
                {getSystemLabel(diagram.system)}
              </Text>
            </View>
          </View>
        </View>

        {/* Botón Ver Diagrama */}
        <TouchableOpacity
          onPress={handleOpenPDF}
          disabled={opening || !diagram.directUrl}
          className="bg-cyan-500 rounded-xl p-4 flex-row items-center justify-center mb-6"
          activeOpacity={0.8}
          style={{
            opacity: (opening || !diagram.directUrl) ? 0.6 : 1,
          }}
        >
          {opening ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-bold text-lg ml-3">Abriendo...</Text>
            </>
          ) : (
            <>
              <ExternalLink size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-3">Ver Diagrama PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}



