import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { X, FileText } from 'lucide-react-native';

export default function PDFViewerScreen() {
  const { url } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const pdfUrl = Array.isArray(url) ? url[0] : url || '';

  const INJECTED_JAVASCRIPT = `
    (function() {
      // Habilitar zoom en el viewport
      const meta = document.createElement('meta');
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=10.0, minimum-scale=0.5, user-scalable=yes');
      meta.setAttribute('name', 'viewport');
      
      // Remover viewport existente si existe
      const existingViewport = document.querySelector('meta[name="viewport"]');
      if (existingViewport) {
        existingViewport.remove();
      }
      
      document.getElementsByTagName('head')[0].appendChild(meta);
      
      // Habilitar zoom en el body
      document.body.style.touchAction = 'pan-x pan-y pinch-zoom';
      document.body.style.webkitUserSelect = 'text';
      document.body.style.userSelect = 'text';
      
      // Habilitar zoom en todos los elementos
      const style = document.createElement('style');
      style.textContent = '* { touch-action: pan-x pan-y pinch-zoom !important; -webkit-user-select: text !important; user-select: text !important; }';
      document.head.appendChild(style);
      
      // Ocultar botón negro cuadrado con flecha (botón de compartir/abrir externamente)
      const hideShareButton = setInterval(() => {
        // Buscar y ocultar botones de compartir/abrir
        const shareButtons = document.querySelectorAll('[aria-label*="Abrir"], [aria-label*="Open"], [aria-label*="Share"], button[title*="Abrir"], button[title*="Open"], .ndfHFb, .ndfHFb-c4YZDc, [data-tooltip*="Abrir"], [data-tooltip*="Open"]');
        shareButtons.forEach(btn => {
          if (btn) {
            btn.style.display = 'none';
            btn.style.visibility = 'hidden';
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
          }
        });
        
        // Buscar elementos con ícono de flecha diagonal
        const arrowButtons = document.querySelectorAll('svg[viewBox*="24"], svg[viewBox*="20"]');
        arrowButtons.forEach(svg => {
          const parent = svg.closest('button, div[role="button"], a');
          if (parent && (parent.getAttribute('aria-label')?.includes('Abrir') || parent.getAttribute('aria-label')?.includes('Open') || parent.getAttribute('title')?.includes('Abrir') || parent.getAttribute('title')?.includes('Open'))) {
            parent.style.display = 'none';
            parent.style.visibility = 'hidden';
            parent.style.opacity = '0';
            parent.style.pointerEvents = 'none';
          }
        });
      }, 500);
      
      // Limpiar intervalo después de 10 segundos
      setTimeout(() => clearInterval(hideShareButton), 10000);
      
      true;
    })();
  `;

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
        
        {/* Botón X - Reducido */}
        <View style={{ 
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'absolute',
          right: 12,
          top: 48
        }}>
          <TouchableOpacity 
            onPress={() => {
              console.log('[PDF Viewer] 🔴 TOQUE DETECTADO EN X');
              console.log('[PDF Viewer] Intentando cerrar viewer');
              router.navigate('/search');
            }}
            activeOpacity={0.6}
            style={{ 
              width: 36,
              height: 36,
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: '#ffffff'
            }}
          >
            <X size={18} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <GestureHandlerRootView style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          source={{ uri: pdfUrl }}
          onLoadStart={() => {
            console.log('[WebView] Iniciando carga del PDF desde Google Drive');
          }}
          onLoadEnd={() => {
            console.log('[WebView] PDF cargado completamente');
            setLoading(false);
            // Inyectar JavaScript después de que la página cargue para habilitar zoom
            setTimeout(() => {
              if (webViewRef.current) {
                console.log('[WebView] Inyectando JavaScript para zoom');
                webViewRef.current.injectJavaScript(INJECTED_JAVASCRIPT);
              }
            }, 1000);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('[WebView] Error cargando PDF:', nativeEvent);
            setError(true);
            setLoading(false);
          }}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          startInLoadingState={true}
          scalesPageToFit={false}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
          bounces={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          injectedJavaScript={INJECTED_JAVASCRIPT}
          injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
          onMessage={() => {}}
          style={{ flex: 1, backgroundColor: '#0f172a' }}
          allowsBackForwardNavigationGestures={true}
        />
      </GestureHandlerRootView>

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