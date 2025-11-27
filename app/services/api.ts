import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://tecniflux-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar el token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    
    if (token) {
      console.log('[API Interceptor] 🔑 Token COMPLETO:', token);
      console.log('[API Interceptor] 📏 Token length:', token.length);
      console.log('[API Interceptor] 🎯 Primeros 50 chars:', token.substring(0, 50));
      console.log('[API Interceptor] 🎯 Últimos 50 chars:', token.substring(token.length - 50));
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Interceptor] ✅ Header agregado');
    } else {
      console.warn('[API Interceptor] ⚠️ No se encontró token');
    }
    
    console.log('[API Interceptor] URL:', config.url);
    return config;
  },
  (error) => {
    console.error('[API Interceptor] ❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Response interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API Interceptor] 🚫 Error 401 - Token rechazado');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username: string, password: string) => {
    console.log('[authAPI.login] Iniciando login para:', username);
    
    const response = await api.post('/auth/login', { 
      username, 
      password 
    });
    
    console.log('[authAPI.login] 📦 Respuesta RAW completa:', JSON.stringify(response.data, null, 2));
    
    // CRÍTICO: Verificar qué campo tiene el token
    const tokenFields = ['token', 'accessToken', 'access_token', 'jwt', 'authToken'];
    let actualToken = null;
    
    for (const field of tokenFields) {
      if (response.data[field]) {
        actualToken = response.data[field];
        console.log(`[authAPI.login] ✅ Token encontrado en campo: "${field}"`);
        console.log(`[authAPI.login] 📏 Token length: ${actualToken.length}`);
        console.log(`[authAPI.login] 🔑 Token completo: ${actualToken}`);
        break;
      }
    }
    
    if (!actualToken) {
      console.error('[authAPI.login] ❌ NO SE ENCONTRÓ TOKEN en ningún campo');
      console.error('[authAPI.login] Campos disponibles:', Object.keys(response.data));
      throw new Error('No se recibió token del servidor');
    }
    
    // Guardar el token completo
    console.log('[authAPI.login] Guardando token en SecureStore...');
    await SecureStore.setItemAsync('userToken', actualToken);
    
    // Verificar que se guardó correctamente
    const savedToken = await SecureStore.getItemAsync('userToken');
    console.log('[authAPI.login] ✅ Token guardado correctamente');
    console.log('[authAPI.login] 🔍 Verificación - Token guardado length:', savedToken?.length);
    console.log('[authAPI.login] 🔍 ¿Coincide?:', savedToken === actualToken ? 'SÍ' : 'NO');
    
    // Guardar datos del usuario
    if (response.data.user) {
      await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
      console.log('[authAPI.login] ✅ Datos de usuario guardados');
    }
    
    return response;
  },
  
  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
  }
};

export const diagramAPI = {
  search: async (query: string) => {
    console.log('[diagramAPI.search] 🔍 Buscando:', query);
    const response = await api.post('/diagrams/search', { query });
    return response;
  }
};

export default api;