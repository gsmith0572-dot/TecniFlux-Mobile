import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { X, FileText } from 'lucide-react-native';

export default function PDFViewerScreen() {
  const { url } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pdfUrl = Array.isArray(url) ? url[0] : url || '';

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError(true);
      }
    }, 30000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const handleClose = () => {
    console.log('[PDF Viewer] 🔴 Botón X presionado - Intentando cerrar');
    
    // Método 1: Usar dismiss si existe
    if (router.dismiss) {
      console.log('[PDF Viewer] Usando router.dismiss()');
      router.dismiss();
      return;
    }
    
    // Método 2: Navigate directamente
    console.log('[PDF Viewer] Navegando a /search');
    router.navigate('/search');
  };

  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url.toLowerCase();
    
    console.log('[WebView] Request URL:', request.url);
    
    const blockedPatterns = [
      '/uc?export=download',
      '/uc?id=',
      'usercontent.google.com/download',
      '/export=download'
    ];
    
    for (const pattern of blockedPatterns) {
      if (url.includes(pattern)) {
        console.log('[WebView] 🚫 BLOQUEADO - Intento de descarga:', request.url);
        return false;
      }
    }
    
    if (url.includes('/view') && !url.includes('/preview')) {
      console.log('[WebView] 🚫 BLOQUEADO - URL /view (permite descarga):', request.url);
      return false;
    }
    
    const allowedPatterns = [
      'drive.google.com/file',
      'drive.google.com/auth',
      'clients6.google.com',
      'accounts.google.com',
      'ssl.gstatic.com',
      'fonts.googleapis.com',
      'about:blank',
      'data:',
      'blob:'
    ];
    
    for (const pattern of allowedPatterns) {
      if (url.includes(pattern)) {
        if (url === 'about:blank') {
          console.log('[WebView] ✅ Permitida URL especial: about:blank');
        } else if (url.includes('/preview')) {
          console.log('[WebView] ✅ Permitida URL /preview:', request.url);
        } else {
          console.log('[WebView] ✅ Permitida URL de Google (recursos):', request.url);
        }
        return true;
      }
    }
    
    console.log('[WebView] 🚫 BLOQUEADO por defecto:', request.url);
    return false;
  };

  if (error) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <FileText size={64} color="#ef4444" />
        <Text className="text-white text-xl font-bold mt-4">Error al cargar el PDF</Text>
        <Text className="text-slate-400 mt-2 text-center px-8">
          No pudimos cargar el diagrama. Verifica tu conexión.
        </Text>
        <TouchableOpacity
          onPress={handleClose}
          className="mt-6 bg-cyan-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      <View className="bg-slate-800 pt-12 pb-4 px-4 flex-row items-center justify-between">
        <Text className="text-white text-xl font-bold">Diagrama PDF</Text>
        <TouchableOpacity 
          onPress={handleClose}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          activeOpacity={0.6}
          style={{ 
            padding: 8,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 8
          }}
        >
          <X size={28} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <WebView
        source={{ uri: pdfUrl }}
        onLoadStart={() => {
          console.log('[WebView] Iniciando carga del PDF desde Google Drive');
        }}
        onLoadEnd={() => {
          console.log('[WebView] PDF cargado completamente');
          setLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[WebView] Error cargando PDF:', nativeEvent);
          setError(true);
          setLoading(false);
        }}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        startInLoadingState={true}
        scalesPageToFit={true}
        style={{ flex: 1, backgroundColor: '#0f172a' }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-slate-900">
          <FileText size={64} color="#06b6d4" className="mb-6" />
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text className="text-white text-xl font-bold mt-4">Preparando tu diagrama</Text>
          <Text className="text-slate-400 mt-2 text-center px-8">
            Estamos cargando el manual técnico del vehículo
          </Text>
        </View>
      )}
    </View>
  );
}