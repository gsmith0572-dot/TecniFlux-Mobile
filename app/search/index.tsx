import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function SearchScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">Búsqueda</Text>
      <StatusBar style="auto" />
    </View>
  );
}

