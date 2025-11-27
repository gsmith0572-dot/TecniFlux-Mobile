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
          onPress={() => {
            console.log('[PDF Viewer] 🔴 Volviendo desde pantalla de error');
            router.navigate('/search');
          }}
          className="mt-6 bg-cyan-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="bg-slate-800 pt-12 pb-4 px-4 flex-row items-center justify-between">
        <Text className="text-white text-xl font-bold">Diagrama PDF</Text>
        
        {/* Botón X - MÁS GRANDE Y ROJO */}
        <View style={{ 
          width: 60, 
          height: 60, 
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'absolute',
          right: 10,
          top: 40
        }}>
          <TouchableOpacity 
            onPress={() => {
              console.log('[PDF Viewer] 🔴 TOQUE DETECTADO EN X');
              console.log('[PDF Viewer] Intentando cerrar viewer');
              router.navigate('/search');
            }}
            activeOpacity={0.6}
            style={{ 
              width: 50,
              height: 50,
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#ffffff'
            }}
          >
            <X size={28} color="#ffffff" strokeWidth={3} />
          </TouchableOpacity>
        </View>
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