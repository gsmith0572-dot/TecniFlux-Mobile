import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Linking, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, Eye, EyeOff } from 'lucide-react-native';
import { authAPI } from '../services/api';
import * as SecureStore from 'expo-secure-store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_CONTENT_WIDTH = 384;

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ELIMINADO: No verificar token automáticamente
  // El login SIEMPRE se muestra primero
  // Solo redirige después de un login exitoso

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

  const contentStyle = {
    width: SCREEN_WIDTH > MAX_CONTENT_WIDTH ? MAX_CONTENT_WIDTH : SCREEN_WIDTH - 48, // 48 = padding horizontal * 2
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, contentStyle]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Zap size={80} color="#06b6d4" fill="#06b6d4" />
          </View>
          <Text style={styles.title}>TecniFlux</Text>
          <Text style={styles.subtitle}>Diagramas Técnicos</Text>
          <Text style={styles.subtitle}>Automotrices</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu usuario"
            placeholderTextColor="#64748b"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <View style={styles.passwordContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
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
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/register')}
          disabled={loading}
          style={styles.registerLink}
          activeOpacity={0.8}
        >
          <Text style={styles.registerText}>
            ¿No tienes cuenta? <Text style={styles.registerTextBold}>Crear Cuenta</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => Linking.openURL('https://klickifyagency.com')}
          style={styles.footerLink}
          activeOpacity={0.8}
        >
          <Text style={styles.footerText}>Powered by</Text>
          <Text style={styles.footerTextBold}>Klickify Agency ™</Text>
        </TouchableOpacity>

        <Text style={styles.copyright}>
          TecniFlux ™ 2026 - Acceso a más de 30,000 diagramas
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    // Width is set dynamically in component
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 18,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  passwordContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 48,
    borderWidth: 1,
    borderColor: '#334155',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#06b6d4',
  },
  loginButtonDisabled: {
    backgroundColor: '#334155',
  },
  loginButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerLink: {
    marginTop: 16,
  },
  registerText: {
    color: '#22d3ee',
    textAlign: 'center',
    fontSize: 14,
  },
  registerTextBold: {
    fontWeight: 'bold',
  },
  footerLink: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
  },
  footerTextBold: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  copyright: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});
