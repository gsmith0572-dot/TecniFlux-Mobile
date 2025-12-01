import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4"
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#cbd5e1" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Términos de Servicio</Text>
      </View>

      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-slate-300 text-lg text-center">
          Términos de Servicio - En construcción
        </Text>
      </View>
    </SafeAreaView>
  );
}

