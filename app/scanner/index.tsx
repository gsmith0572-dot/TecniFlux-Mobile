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
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center px-6">
        <ScanBarcode size={64} color="#2E8BFF" />
        <Text className="text-white text-2xl font-bold mt-6 text-center">
          Necesitamos tu Cámara
        </Text>
        <Text className="text-slate-400 text-center mt-2 mb-8">
          Para escanear el código VIN del vehículo necesitamos acceso a la cámara.
        </Text>
        <TouchableOpacity onPress={requestPermission} className="bg-cyan-500 py-4 px-8 rounded-xl w-full">
          <Text className="text-slate-900 font-bold text-center text-lg">Conceder Permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-slate-500 font-bold">Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      {Platform.OS === 'android' && <StatusBar hidden />}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr", "pdf417", "code128", "code39"] }}
      >
        <View className="flex-1 bg-black/60">
          <View className="flex-row justify-between items-center px-6 pt-12 pb-6 bg-black/40">
            <Text className="text-white font-bold text-lg">Escáner VIN</Text>
            <TouchableOpacity onPress={() => router.back()} className="bg-slate-800/80 p-2 rounded-full">
              <X color="#fff" size={24} />
            </TouchableOpacity>
          </View>
          <View className="flex-1 justify-center items-center">
            <Text className="text-white/80 font-bold mb-8 text-lg">Apunta al código de barras</Text>
            <View className="w-72 h-48 border-2 border-cyan-400 rounded-xl bg-transparent relative">
               <View className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-400 -mt-1 -ml-1" />
               <View className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-400 -mt-1 -mr-1" />
               <View className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-400 -mb-1 -ml-1" />
               <View className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-400 -mb-1 -mr-1" />
            </View>
            <Text className="text-slate-400 text-sm mt-4 px-10 text-center">Soporta Código 39, 128 y PDF417</Text>
          </View>
          <View className="h-32 bg-black/40" />
        </View>
      </CameraView>
    </SafeAreaView>
  );
}