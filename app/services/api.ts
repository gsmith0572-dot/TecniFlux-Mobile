import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'https://tecniflux-production.up.railway.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para incluir token en todas las requests
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    console.log('[API Interceptor] Token leído:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
    console.log('[API Interceptor] URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Interceptor] Header Authorization agregado');
    } else {
      console.warn('[API Interceptor] ⚠️ No se encontró token en SecureStore');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicio de autenticación
export const authAPI = {
  /**
   * Inicia sesión con username y password
   * @param username - Usuario o email
   * @param password - Contraseña
   * @returns Datos del usuario si es exitoso
   * @throws Error si las credenciales son inválidas
   */
  login: async (username: string, password: string) => {
    try {
      console.log('[authAPI.login] Iniciando login para:', username);
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });
      
      console.log('[authAPI.login] Respuesta recibida:', {
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        tokenPreview: response.data.token ? `${response.data.token.substring(0, 20)}...` : 'NO TOKEN',
        user: response.data.user,
      });
      
      // Guardar token si el backend lo devuelve
      if (response.data.token) {
        console.log('[authAPI.login] Guardando token en SecureStore...');
        await SecureStore.setItemAsync('userToken', response.data.token);
        
        // Verificar que se guardó correctamente
        const savedToken = await SecureStore.getItemAsync('userToken');
        if (savedToken === response.data.token) {
          console.log('[authAPI.login] ✅ Token guardado correctamente');
        } else {
          console.error('[authAPI.login] ❌ ERROR: Token no se guardó correctamente');
        }
      } else {
        console.warn('[authAPI.login] ⚠️ No se recibió token en la respuesta');
      }
      
      // Guardar info del usuario
      if (response.data.user) {
        await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
        console.log('[authAPI.login] ✅ Datos de usuario guardados');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('[authAPI.login] ❌ Error en login:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Error al iniciar sesión');
      }
      if (error.request) {
        throw new Error('No se pudo conectar con el servidor');
      }
      throw new Error('Error desconocido al iniciar sesión');
    }
  },
  
  /**
   * Cierra sesión y limpia el token guardado
   */
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },
  
  /**
   * Obtiene el usuario guardado localmente
   */
  getCurrentUser: async () => {
    try {
      const userData = await SecureStore.getItemAsync('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },
  
  /**
   * Verifica si hay una sesión activa
   */
  isAuthenticated: async () => {
    const token = await SecureStore.getItemAsync('userToken');
    return !!token;
  },
};

export default api;
