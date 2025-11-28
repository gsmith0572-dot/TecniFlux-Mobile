import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Trash2 } from 'lucide-react-native';

export default function DebugScreen() {
  const router = useRouter();

  const handleClearAllData = async () => {
    try {
      // Borrar todos los datos del SecureStore
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      await SecureStore.deleteItemAsync('userSubscription');
      await SecureStore.deleteItemAsync('searchCount');
      await SecureStore.deleteItemAsync('searchResetDate');
      await SecureStore.deleteItemAsync('searchHistory');

      // Mostrar alert de confirmación
      Alert.alert('Datos borrados', 'Todos los datos han sido eliminados correctamente.', [
        {
          text: 'OK',
          onPress: () => {
            // Redirigir a login
            router.replace('/login');
          },
        },
      ]);
    } catch (error) {
      console.error('[Debug] Error al borrar datos:', error);
      Alert.alert('Error', 'Hubo un problema al borrar los datos.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-sm">
          <View className="items-center mb-8">
            <View className="mb-4">
              <Trash2 size={64} color="#ef4444" />
            </View>
            <Text className="text-white text-3xl font-bold mb-2">Debug Panel</Text>
            <Text className="text-slate-400 text-center">
              Esta acción eliminará todos los datos almacenados
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleClearAllData}
            className="bg-red-600 rounded-xl py-5 px-6 active:bg-red-700"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-bold text-lg">
              Borrar todos los datos
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

