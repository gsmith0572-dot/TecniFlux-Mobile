import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Zap, ArrowLeft } from 'lucide-react-native';
import { authAPI, subscriptionAPI } from '../services/api';
import { initializeSearchCounter } from '../../utils/searchCounter';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(username, email, password);
      
      // Inicializar contador de búsquedas
      await initializeSearchCounter();
      
      // Crear subscription FREE automáticamente (el backend debería hacerlo, pero por si acaso)
      try {
        // El backend debería crear automáticamente la subscription FREE
        // Si no, intentamos crear una local
        console.log('[Register] Inicializando subscription FREE');
      } catch (subError) {
        console.error('[Register] Error al inicializar subscription:', subError);
        // No bloqueamos el registro si falla la subscription
      }
      
      Alert.alert('¡Éxito!', 'Tu cuenta ha sido creada correctamente', [
        {
          text: 'OK',
          onPress: () => router.replace('/dashboard'),
        },
      ]);
    } catch (error: any) {
      console.error('[Register] Error:', error);
      Alert.alert(
        'Error al registrar',
        error.response?.data?.message || 'No se pudo crear la cuenta. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Crear Cuenta</Text>
        </View>

        <View className="flex-1 justify-center items-center px-6 py-8">
          <View className="w-full max-w-sm">
            <View className="items-center mb-8">
              <View className="mb-4">
                <Zap size={80} color="#06b6d4" fill="#06b6d4" />
              </View>
              <Text className="text-white text-4xl font-bold mb-2">TecniFlux</Text>
              <Text className="text-slate-400 text-base text-center">
                Únete a nuestra comunidad
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-slate-400 text-sm mb-2 ml-1">Usuario</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-xl px-4 py-4 border border-slate-700"
                placeholder="Ingresa tu usuario"
                placeholderTextColor="#64748b"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-400 text-sm mb-2 ml-1">Email</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-xl px-4 py-4 border border-slate-700"
                placeholder="tu@email.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-400 text-sm mb-2 ml-1">Contraseña</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-xl px-4 py-4 border border-slate-700"
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View className="mb-6">
              <Text className="text-slate-400 text-sm mb-2 ml-1">Confirmar Contraseña</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-xl px-4 py-4 border border-slate-700"
                placeholder="Repite tu contraseña"
                placeholderTextColor="#64748b"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className={`rounded-xl py-4 ${loading ? 'bg-slate-700' : 'bg-cyan-500'}`}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center font-bold text-lg">
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/login')}
              className="mt-6"
              disabled={loading}
            >
              <Text className="text-cyan-400 text-center text-sm">
                ¿Ya tienes cuenta? <Text className="font-bold">Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>

            <Text className="text-slate-500 text-center mt-8 text-xs">
              Al crear una cuenta, aceptas nuestros términos y condiciones
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

