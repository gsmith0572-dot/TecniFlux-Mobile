import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Dimensions, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Car, Calendar, Settings, Eye, AlertCircle, X } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

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
  const [showPDF, setShowPDF] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Función para extraer fileId de URL de Google Drive
  const getFileIdFromUrl = (url: string): string | null => {
    // Intentar extraer de diferentes formatos de URL de Google Drive
    // Formato 1: https://drive.google.com/file/d/[ID]/view
    // Formato 2: https://drive.google.com/uc?export=download&id=[ID]
    // Formato 3: https://drive.google.com/open?id=[ID]
    
    const patterns = [
      /\/file\/d\/([-\w]{25,})/,
      /[?&]id=([-\w]{25,})/,
      /\/d\/([-\w]{25,})/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Si no coincide con ningún patrón, intentar extraer cualquier ID largo
    const fallbackMatch = url.match(/([-\w]{25,})/);
    return fallbackMatch ? fallbackMatch[0] : null;
  };

  const handleOpenPDF = () => {
    if (!diagram?.directUrl) {
      console.warn('[handleOpenPDF] ⚠️ No hay directUrl disponible');
      return;
    }
    
    console.log('[handleOpenPDF] Abriendo visor PDF con Google Drive Viewer');
    console.log('[handleOpenPDF] URL original:', diagram.directUrl);
    
    // Extraer fileId de la URL
    const pdfUrl = decodeURIComponent(diagram.directUrl);
    const fileId = getFileIdFromUrl(pdfUrl);
    
    if (!fileId) {
      console.error('[handleOpenPDF] ❌ No se pudo extraer fileId de la URL');
      setPdfError(true);
      setPdfLoading(false);
      return;
    }
    
    console.log('[handleOpenPDF] FileId extraído:', fileId);
    
    // Usar viewer embebido de Google Drive con formato /preview
    const viewerUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    
    console.log('[handleOpenPDF] URL del viewer:', viewerUrl);
    
    setPdfUrl(viewerUrl);
    setPdfLoading(true);
    setPdfError(false);
    setShowPDF(true);
    
    // Timeout de 30 segundos
    const timeout = setTimeout(() => {
      if (pdfLoading) {
        console.warn('[handleOpenPDF] ⚠️ Timeout: PDF no cargó en 30 segundos');
        setPdfLoading(false);
        setPdfError(true);
      }
    }, 30000);
    
    setLoadTimeout(timeout);
  };

  // Limpiar timeout cuando se cierra el modal
  useEffect(() => {
    if (!showPDF && loadTimeout) {
      clearTimeout(loadTimeout);
      setLoadTimeout(null);
    }
    return () => {
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
    };
  }, [showPDF, loadTimeout]);

  // BackHandler para botón físico de Android
  useEffect(() => {
    if (!showPDF) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('[PDF Viewer] BackHandler - cerrando viewer');
      handleClosePDF();
      return true;
    });

    return () => backHandler.remove();
  }, [showPDF]);

  // Función para cerrar el PDF viewer
  const handleClosePDF = () => {
    console.log('[PDF Viewer] 🔴 handleClosePDF - Cerrando viewer');
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      setLoadTimeout(null);
    }
    setShowPDF(false);
    setPdfUrl(null);
    router.back();
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
          disabled={!diagram.directUrl}
          className="bg-cyan-500 rounded-xl p-4 flex-row items-center justify-center mb-6"
          activeOpacity={0.8}
          style={{
            opacity: !diagram.directUrl ? 0.6 : 1,
          }}
        >
          <Eye size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-3">Ver Diagrama PDF</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal con visor PDF integrado */}
      <Modal
        visible={showPDF}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleClosePDF}
      >
        <SafeAreaView className="flex-1 bg-slate-900">
          <StatusBar style="light" />
          
          {/* Header del modal */}
          <View className="px-4 py-3 flex-row items-center justify-between border-b border-slate-800 bg-slate-900">
            <Text className="text-white text-lg font-bold flex-1">Diagrama PDF</Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('[PDF Viewer] 🔴 Botón X presionado - Cerrando viewer');
                if (loadTimeout) {
                  clearTimeout(loadTimeout);
                  setLoadTimeout(null);
                }
                setShowPDF(false);
                setPdfUrl(null);
                router.back();
              }}
              className="p-2"
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              activeOpacity={0.7}
            >
              <X size={28} color="#ffffff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Visor PDF */}
          <View className="flex-1 bg-slate-900">
            {pdfLoading && (
              <View className="absolute inset-0 items-center justify-center bg-slate-900 z-10">
                <FileText size={64} color="#06b6d4" />
                <ActivityIndicator size="large" color="#06b6d4" className="mt-6" />
                <Text className="text-white text-xl font-bold mt-4">
                  Preparando tu diagrama
                </Text>
                <Text className="text-slate-400 mt-2 text-center px-8">
                  Estamos cargando el manual técnico del vehículo
                </Text>
              </View>
            )}
            
            {pdfError ? (
              <View className="flex-1 justify-center items-center px-4">
                <AlertCircle size={64} color="#ef4444" />
                <Text className="text-red-400 mt-4 text-center text-lg font-semibold">
                  No pudimos cargar el diagrama. Verifica tu conexión.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    console.log('[PDF Viewer] Reintentando carga');
                    setPdfError(false);
                    setPdfLoading(true);
                    // Reiniciar timeout
                    if (loadTimeout) {
                      clearTimeout(loadTimeout);
                    }
                    const timeout = setTimeout(() => {
                      if (pdfLoading) {
                        setPdfLoading(false);
                        setPdfError(true);
                      }
                    }, 30000);
                    setLoadTimeout(timeout);
                  }}
                  className="mt-6 bg-cyan-500 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-semibold">Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : pdfUrl ? (
              <WebView
                source={{ uri: pdfUrl }}
                style={{ flex: 1, backgroundColor: '#0f172a' }}
                onLoadStart={() => {
                  console.log('[WebView] Iniciando carga del PDF desde Google Drive');
                  setPdfLoading(true);
                  setPdfError(false);
                }}
                onLoadEnd={() => {
                  console.log('[WebView] PDF cargado completamente');
                  setPdfLoading(false);
                  if (loadTimeout) {
                    clearTimeout(loadTimeout);
                    setLoadTimeout(null);
                  }
                }}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('[WebView] Error:', nativeEvent);
                  setPdfError(true);
                  setPdfLoading(false);
                  if (loadTimeout) {
                    clearTimeout(loadTimeout);
                    setLoadTimeout(null);
                  }
                }}
                // BLOQUEAR URLs de descarga y /view que permite descargar
                onShouldStartLoadWithRequest={(request) => {
                  const url = request.url;
                  console.log('[WebView] Request URL:', url);
                  
                  // URLs especiales que siempre se permiten
                  if (url === 'about:blank' || url.startsWith('about:') || url.startsWith('data:') || url.startsWith('blob:')) {
                    console.log('[WebView] ✅ Permitida URL especial:', url);
                    return true;
                  }
                  
                  // BLOQUEAR /view específicamente PRIMERO (abre página con descarga)
                  // Solo permitir /preview, NO /view
                  if (url.includes('/view') && !url.includes('/preview')) {
                    console.log('[WebView] 🚫 BLOQUEADO - URL /view (permite descarga):', url);
                    return false;
                  }
                  
                  // BLOQUEAR URLs de descarga
                  const blockedPatterns = [
                    '/uc?export=download',
                    '/uc?id=',
                    'usercontent.google.com/download',
                    '/export=download',
                    'download=true'
                  ];
                  
                  const isBlocked = blockedPatterns.some(pattern => url.includes(pattern));
                  if (isBlocked) {
                    console.log('[WebView] 🚫 BLOQUEADO - Intento de descarga:', url);
                    return false;
                  }
                  
                  // PERMITIR solo URLs necesarias para /preview
                  const allowedPatterns = [
                    'drive.google.com/file/d/',  // Solo si tiene /preview
                    'drive.google.com/auth',
                    'clients6.google.com',
                    'accounts.google.com',
                    'ssl.gstatic.com',
                    'fonts.googleapis.com',
                    'googleusercontent.com',
                    'gstatic.com',
                    'googleapis.com',
                    'googletagmanager.com',
                    'doubleclick.net',
                    'google-analytics.com',
                    'googleadservices.com'
                  ];
                  
                  const isAllowed = allowedPatterns.some(pattern => url.includes(pattern));
                  
                  if (isAllowed) {
                    // Solo permitir si es /preview, no /view
                    if (url.includes('/preview')) {
                      console.log('[WebView] ✅ Permitida URL /preview:', url);
                      return true;
                    } else if (url.includes('drive.google.com/file/d/')) {
                      // Si contiene file/d/ pero no tiene /preview ni /view, podría ser navegación interna
                      console.log('[WebView] ✅ Permitida URL de Google Drive (navegación interna):', url);
                      return true;
                    } else {
                      console.log('[WebView] ✅ Permitida URL de Google (recursos):', url);
                      return true;
                    }
                  }
                  
                  // Por defecto, bloquear
                  console.log('[WebView] 🚫 BLOQUEADO por defecto:', url);
                  return false;
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={[
                  'https://drive.google.com',
                  'https://*.googleusercontent.com',
                  'https://*.gstatic.com',
                  'https://*.google.com'
                ]}
                mixedContentMode="always"
                scalesPageToFit={true}
                bounces={false}
                scrollEnabled={true}
              />
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}



