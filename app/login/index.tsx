import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, Eye, EyeOff } from 'lucide-react-native';
import { authAPI } from '../services/api';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ELIMINADO checkExistingAuth - el index.tsx maneja la redirección inicial
  // El login SIEMPRE se muestra, y solo redirige después de un login exitoso

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);

    try {
      await authAPI.login(username, password);
      // Redirigir a dashboard (que verificará la suscripción)
      router.replace('/dashboard');
    } catch (error: any) {
      Alert.alert('Error de autenticación', 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-6">
      <View className="w-full max-w-sm">
        <View className="items-center mb-8">
          <View className="mb-4">
            <Zap size={80} color="#06b6d4" fill="#06b6d4" />
          </View>
          <Text className="text-white text-5xl font-bold mb-2">TecniFlux</Text>
          <Text className="text-slate-400 text-lg text-center">Diagramas Técnicos</Text>
          <Text className="text-slate-400 text-lg text-center">Automotrices</Text>
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

        <View className="mb-6">
          <Text className="text-slate-400 text-sm mb-2 ml-1">Contraseña</Text>
          <View className="relative">
            <TextInput
              className="bg-slate-800 text-white rounded-xl px-4 py-4 pr-12 border border-slate-700"
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-0 bottom-0 justify-center"
              activeOpacity={0.7}
            >
              {showPassword ? (
                <EyeOff size={20} color="#64748b" />
              ) : (
                <Eye size={20} color="#64748b" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`rounded-xl py-4 ${loading ? 'bg-slate-700' : 'bg-cyan-500'}`}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/register')}
          disabled={loading}
          className="mt-4"
          activeOpacity={0.8}
        >
          <Text className="text-cyan-400 text-center text-sm">
            ¿No tienes cuenta? <Text className="font-bold">Crear Cuenta</Text>
          </Text>
        </TouchableOpacity>

        <Text className="text-slate-500 text-center mt-8 text-sm">
          TecniFlux ™ 2026 - Acceso a más de 30,000 diagramas
        </Text>
      </View>
    </View>
  );
}
