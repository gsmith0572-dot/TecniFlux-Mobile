import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { UserSubscription, CheckoutSession } from '../../types/subscription';

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
    // Endpoints públicos que NO deben tener token
    const publicEndpoints = ['/auth/register', '/auth/login'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    // Si es un endpoint público, NO agregar token
    if (isPublicEndpoint) {
      console.log('[API Interceptor] 🔓 Endpoint público, sin token:', config.url);
      return config;
    }
    
    // Para endpoints privados, agregar token si existe
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
    
    // Borrar caché de subscription para forzar actualización desde backend
    await SecureStore.deleteItemAsync('userSubscription');
    console.log('[authAPI.login] ✅ Caché de subscription borrado');
    
    return response;
  },

  register: async (username: string, email: string, password: string) => {
    // Limpiar y validar datos antes de enviar
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    
    console.log('[authAPI.register] Registrando nuevo usuario:', cleanUsername);
    console.log('[authAPI.register] Email:', cleanEmail);
    console.log('[authAPI.register] Datos a enviar:', {
      username: cleanUsername,
      email: cleanEmail,
      password: '***' // No loggear password
    });
    
    try {
      const response = await api.post('/auth/register', {
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword
      });
      
      console.log('[authAPI.register] 📦 Respuesta exitosa:', JSON.stringify(response.data, null, 2));
    
    // Verificar token en respuesta
    const tokenFields = ['token', 'accessToken', 'access_token', 'jwt', 'authToken'];
    let actualToken = null;
    
    for (const field of tokenFields) {
      if (response.data[field]) {
        actualToken = response.data[field];
        console.log(`[authAPI.register] ✅ Token encontrado en campo: "${field}"`);
        break;
      }
    }
    
    // Si no hay token en la respuesta, hacer login automático para obtenerlo
    if (!actualToken) {
      console.log('[authAPI.register] ⚠️ No se recibió token en registro, haciendo login automático...');
      try {
        // Hacer login automático con las credenciales del usuario
        const loginResponse = await api.post('/auth/login', {
          username: cleanUsername,
          password: cleanPassword
        });
        
        console.log('[authAPI.register] 📦 Respuesta de login:', JSON.stringify(loginResponse.data, null, 2));
        
        // Buscar token en la respuesta de login
        for (const field of tokenFields) {
          if (loginResponse.data[field]) {
            actualToken = loginResponse.data[field];
            console.log(`[authAPI.register] ✅ Token obtenido del login en campo: "${field}"`);
            break;
          }
        }
        
        if (!actualToken) {
          console.error('[authAPI.register] ❌ NO SE ENCONTRÓ TOKEN después del login automático');
          throw new Error('No se pudo obtener token después del registro');
        }
        
        // Guardar datos del usuario desde la respuesta de registro
        if (response.data.id || response.data.username) {
          const userData = {
            id: response.data.id,
            username: response.data.username?.trim() || cleanUsername,
            email: response.data.email || cleanEmail,
            role: response.data.role || 'tecnico'
          };
          await SecureStore.setItemAsync('userData', JSON.stringify(userData));
          console.log('[authAPI.register] ✅ Datos de usuario guardados desde registro');
        }
      } catch (loginError: any) {
        console.error('[authAPI.register] ❌ Error en login automático:', loginError);
        const loginErrorMessage = loginError.response?.data?.message || loginError.message || 'Error desconocido';
        throw new Error(`Cuenta creada pero no se pudo iniciar sesión: ${loginErrorMessage}`);
      }
    } else {
      // Si hay token, guardar datos del usuario normalmente
      if (response.data.user) {
        await SecureStore.setItemAsync('userData', JSON.stringify(response.data.user));
      } else if (response.data.id || response.data.username) {
        const userData = {
          id: response.data.id,
          username: response.data.username?.trim() || cleanUsername,
          email: response.data.email || cleanEmail,
          role: response.data.role || 'tecnico'
        };
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      }
    }
    
    // Guardar token
    await SecureStore.setItemAsync('userToken', actualToken);
    console.log('[authAPI.register] ✅ Token guardado correctamente');
    
    // Borrar caché de subscription para forzar actualización
    await SecureStore.deleteItemAsync('userSubscription');
    console.log('[authAPI.register] ✅ Caché de subscription borrado');
    
    return response;
    } catch (error: any) {
      console.error('[authAPI.register] ❌ Error completo:', error);
      console.error('[authAPI.register] ❌ Error response:', error.response?.data);
      console.error('[authAPI.register] ❌ Error status:', error.response?.status);
      console.error('[authAPI.register] ❌ Error message:', error.message);
      
      // Extraer mensaje de error del servidor
      let errorMessage = 'No se pudo crear la cuenta. Intenta de nuevo.';
      
      if (error.response?.data) {
        // Intentar obtener el mensaje de error del servidor
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.errors) {
          // Si hay múltiples errores de validación
          const errors = error.response.data.errors;
          if (Array.isArray(errors)) {
            errorMessage = errors.join(', ');
          } else if (typeof errors === 'object') {
            errorMessage = Object.values(errors).join(', ');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
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

export const subscriptionAPI = {
  getStatus: async (): Promise<UserSubscription> => {
    console.log('[subscriptionAPI] Verificando estado de suscripción');
    try {
      // Intentar obtener desde SecureStore primero
      const cachedSubscription = await SecureStore.getItemAsync('userSubscription');
      if (cachedSubscription) {
        const parsed = JSON.parse(cachedSubscription);
        console.log('[subscriptionAPI] ✅ Suscripción desde cache:', parsed);
        return parsed;
      }

      // Intentar obtener del backend
      const response = await api.get('/user/subscription');
      console.log('[subscriptionAPI] ✅ Estado de suscripción desde backend:', response.data);
      
      const subscription = {
        plan: response.data.plan || 'free',
        status: response.data.status || 'active',
        currentPeriodEnd: response.data.currentPeriodEnd || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        cancelAtPeriodEnd: response.data.cancelAtPeriodEnd || false,
      };

      // Guardar en SecureStore
      await SecureStore.setItemAsync('userSubscription', JSON.stringify(subscription));
      
      return subscription;
    } catch (error: any) {
      console.error('[subscriptionAPI] ❌ Error al obtener estado:', error);
      
      // Si el endpoint no existe o hay error, usar mock con plan FREE
      const mockSubscription = {
        plan: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        cancelAtPeriodEnd: false,
      };
      
      // Guardar mock en SecureStore
      await SecureStore.setItemAsync('userSubscription', JSON.stringify(mockSubscription));
      console.log('[subscriptionAPI] ✅ Usando plan FREE por defecto');
      
      return mockSubscription;
    }
  },

  // Función para forzar actualización desde el backend, ignorando cache
  forceRefresh: async (): Promise<UserSubscription> => {
    console.log('[subscriptionAPI] 🔄 Forzando actualización desde backend (ignorando cache)');
    try {
      // Limpiar cache primero
      await SecureStore.deleteItemAsync('userSubscription');

      // Obtener del backend
      const response = await api.get('/user/subscription');
      console.log('[subscriptionAPI] ✅ Estado de suscripción desde backend (force refresh):', response.data);
      
      const subscription = {
        plan: response.data.plan || 'free',
        status: response.data.status || 'active',
        currentPeriodEnd: response.data.currentPeriodEnd || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        cancelAtPeriodEnd: response.data.cancelAtPeriodEnd || false,
      };

      // Guardar en SecureStore
      await SecureStore.setItemAsync('userSubscription', JSON.stringify(subscription));
      
      return subscription;
    } catch (error: any) {
      console.error('[subscriptionAPI] ❌ Error al forzar actualización:', error);
      throw error;
    }
  },

  getSubscriptionStatus: async (): Promise<UserSubscription> => {
    // Mantener compatibilidad con código existente
    return subscriptionAPI.getStatus();
  },

  createCheckoutSession: async (planId: string): Promise<CheckoutSession> => {
    console.log('[subscriptionAPI] Creando checkout session para plan:', planId);
    try {
      const response = await api.post('/create-subscription', { planId });
      console.log('[subscriptionAPI] ✅ Checkout session creada:', response.data);
      
      return {
        sessionId: response.data.sessionId || response.data.id,
        url: response.data.url || response.data.checkoutUrl,
      };
    } catch (error: any) {
      console.error('[subscriptionAPI] ❌ Error al crear checkout:', error);
      throw error;
    }
  },

  createCheckout: async (planId: string): Promise<CheckoutSession> => {
    // Mantener compatibilidad con código existente
    return subscriptionAPI.createCheckoutSession(planId);
  },

  cancelSubscription: async (): Promise<void> => {
    console.log('[subscriptionAPI] Cancelando suscripción');
    const response = await api.post('/subscription/cancel');
    console.log('[subscriptionAPI] ✅ Suscripción cancelada:', response.data);
  },
};

export const adminAPI = {
  getStats: async () => {
    console.log('[adminAPI] Obteniendo estadísticas de administración');
    try {
      const response = await api.get('/admin/stats');
      console.log('[adminAPI] ✅ Estadísticas obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[adminAPI] ❌ Error al obtener estadísticas:', error);
      throw error;
    }
  },

  getSubscriptions: async () => {
    console.log('[adminAPI] Obteniendo todas las suscripciones');
    try {
      const response = await api.get('/admin/subscriptions');
      console.log('[adminAPI] ✅ Suscripciones obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[adminAPI] ❌ Error al obtener suscripciones:', error);
      throw error;
    }
  },
};

export default api;