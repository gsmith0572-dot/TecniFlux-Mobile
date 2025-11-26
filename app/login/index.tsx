import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Zap, Mail, Lock } from 'lucide-react-native';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validar que los campos no estén vacíos
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      console.log('[handleLogin] Iniciando proceso de login...');
      const userData = await authAPI.login(username.trim(), password);
      
      console.log('[handleLogin] Login exitoso, datos recibidos:', {
        hasUser: !!userData.user,
        hasToken: !!userData.token,
        user: userData.user,
      });
      
      // Verificar que el token se guardó antes de navegar
      const savedToken = await SecureStore.getItemAsync('userToken');
      console.log('[handleLogin] Token verificado antes de navegar:', savedToken ? '✅ Token existe' : '❌ NO HAY TOKEN');
      
      if (!savedToken) {
        console.error('[handleLogin] ⚠️ ADVERTENCIA: Navegando sin token guardado');
      }
      
      // Login exitoso - navegar al dashboard
      console.log('[handleLogin] Navegando a /dashboard...');
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('[handleLogin] Error en login:', error);
      // Mostrar error al usuario
      Alert.alert('Error', error.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-slate-900 px-8">
      <StatusBar style="light" />
      
      {/* Encabezado - Branding */}
      <View className="items-center mb-12">
        <Zap size={64} color="#22d3ee" />
        <Text className="text-4xl font-bold text-white mt-4">TecniFlux</Text>
        <Text className="text-slate-400 mt-2 text-base">Tu taller inteligente</Text>
      </View>

      {/* Formulario */}
      <View>
        {/* Input Username/Email */}
        <View className="mb-4">
          <View className="flex-row items-center bg-slate-800 border border-slate-700 rounded-xl h-14 px-4">
            <Mail size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 text-white ml-3 text-base"
              placeholder="Usuario o Email"
              placeholderTextColor="#64748b"
              value={username}
              onChangeText={setUsername}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
        </View>

        {/* Input Contraseña */}
        <View className="mb-6">
          <View className="flex-row items-center bg-slate-800 border border-slate-700 rounded-xl h-14 px-4">
            <Lock size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 text-white ml-3 text-base"
              placeholder="Contraseña"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>
        </View>

        {/* Botón CTA */}
        <TouchableOpacity
          onPress={handleLogin}
          className="bg-cyan-500 rounded-xl h-14 items-center justify-center shadow-lg"
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0f172a" size="small" />
          ) : (
            <Text className="text-slate-900 font-bold text-lg">Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="flex-row justify-center mt-8">
        <Text className="text-slate-400 text-sm">
          ¿No tienes cuenta?{' '}
          <Text className="text-cyan-400 font-semibold">Regístrate</Text>
        </Text>
      </View>
    </View>
  );
}
