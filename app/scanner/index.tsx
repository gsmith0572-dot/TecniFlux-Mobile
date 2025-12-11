import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { AppState, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { ScanBarcode, X } from 'lucide-react-native';

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
        setScanned(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (data && !qrLock.current) {
      qrLock.current = true;
      setScanned(true);
      // Aquí iría la navegación real, por ahora un log
      console.log("VIN ESCANEADO:", data);
      setTimeout(() => {
        router.replace(`/search?vin=${data}`);
      }, 500);
    }
  };

  if (!permission) {
    return <View style={styles.blackContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <ScanBarcode size={64} color="#06b6d4" />
        <Text style={styles.permissionTitle}>
          Necesitamos tu Cámara
        </Text>
        <Text style={styles.permissionText}>
          Para escanear el código VIN del vehículo necesitamos acceso a la cámara.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {Platform.OS === 'android' && <StatusBar hidden />}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "pdf417", "code128", "code39"] }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Escáner VIN</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <X color="#ffffff" size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.scannerContent}>
            <Text style={styles.scannerInstruction}>Apunta al código de barras</Text>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <Text style={styles.scannerSupport}>Soporta Código 39, 128 y PDF417</Text>
          </View>
          <View style={styles.bottomOverlay} />
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  blackContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    textAlign: 'center',
  },
  permissionText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#06b6d4', // cyan-500
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  permissionButtonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  cancelButton: {
    marginTop: 24,
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)', // slate-800/80
    padding: 8,
    borderRadius: 9999,
  },
  scannerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerInstruction: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
    marginBottom: 32,
    fontSize: 18,
  },
  scannerFrame: {
    width: 288, // w-72 = 18rem = 288px
    height: 192, // h-48 = 12rem = 192px
    borderWidth: 2,
    borderColor: '#22d3ee', // cyan-400
    borderRadius: 12,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
  },
  cornerTopLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopColor: '#22d3ee', // cyan-400
    borderLeftColor: '#22d3ee', // cyan-400
  },
  cornerTopRight: {
    top: -1,
    right: -1,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopColor: '#22d3ee', // cyan-400
    borderRightColor: '#22d3ee', // cyan-400
  },
  cornerBottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomColor: '#22d3ee', // cyan-400
    borderLeftColor: '#22d3ee', // cyan-400
  },
  cornerBottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomColor: '#22d3ee', // cyan-400
    borderRightColor: '#22d3ee', // cyan-400
  },
  scannerSupport: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 16,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  bottomOverlay: {
    height: 128,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
