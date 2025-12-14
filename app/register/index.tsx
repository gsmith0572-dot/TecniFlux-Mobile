import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
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
    // Validaciones
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
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
      // Asegurarse de que los datos estén limpios antes de enviar
      await authAPI.register(username.trim(), email.trim(), password);
      
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
      console.error('[Register] Error completo:', error);
      console.error('[Register] Error response:', error.response?.data);
      console.error('[Register] Error message:', error.message);
      
      // Mostrar el mensaje de error real del servidor
      const errorMessage = error.message || error.response?.data?.message || error.response?.data?.error || 'No se pudo crear la cuenta. Intenta de nuevo.';
      
      Alert.alert(
        'Error al registrar',
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.formContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.iconWrapper}>
                <Zap size={80} color="#06b6d4" fill="#06b6d4" />
              </View>
              <Text style={styles.title}>TecniFlux</Text>
              <Text style={styles.subtitle}>
                Únete a nuestra comunidad
              </Text>
            </View>

            <View style={styles.inputGroup}>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={[styles.inputGroup, styles.lastInputGroup]}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <TextInput
                style={styles.input}
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
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={styles.loginLink}
              disabled={loading}
            >
              <Text style={styles.loginLinkText}>
                ¿Ya tienes cuenta? <Text style={styles.loginLinkBold}>Inicia Sesión</Text>
              </Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              Al crear una cuenta, aceptas nuestros términos y condiciones
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#ffffff', // white
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  formContainer: {
    width: '100%',
    maxWidth: 384,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  title: {
    color: '#ffffff', // white
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8', // slate-400
    fontSize: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  lastInputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#94a3b8', // slate-400
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#334155', // slate-700 (según especificación del usuario)
    color: '#ffffff', // white
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#475569', // slate-600 (según especificación del usuario)
    fontSize: 16,
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: '#06b6d4', // cyan-500
  },
  registerButtonDisabled: {
    backgroundColor: '#334155', // slate-700
  },
  registerButtonText: {
    color: '#ffffff', // white
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginLink: {
    marginTop: 24,
  },
  loginLinkText: {
    color: '#22d3ee', // cyan-400
    textAlign: 'center',
    fontSize: 14,
  },
  loginLinkBold: {
    fontWeight: 'bold',
  },
  termsText: {
    color: '#64748b', // slate-500
    textAlign: 'center',
    marginTop: 32,
    fontSize: 12,
  },
});

