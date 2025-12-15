import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { UserSubscription, CheckoutSession, PlanType } from '../../types/subscription';

const API_URL = 'https://tecniflux-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar el token
// Request interceptor para agregar el token
api.interceptors.request.use(
  async (config) => {
    const publicEndpoints = ['/auth/register', '/auth/login', 'register', 'login'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    console.log('[API Interceptor] Endpoint:', config.url, 'Es público:', isPublicEndpoint);

    if (isPublicEndpoint) {
      delete config.headers.Authorization;
      return config;
    }

    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
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
    console.log('[authAPI.logout] 🚪 Iniciando logout...');
    
    // Lista de todas las claves que deben eliminarse
    const keysToDelete = [
      'userToken',
      'userData',
      'userSubscription',
      'searchHistory',
      'searchCount',
      'searchResetDate',
      // Limpiar también posibles variantes
      'authToken',
      'token',
    ];

    // Eliminar todas las claves de SecureStore
    // En Android, SecureStore puede tener problemas de sincronización,
    // así que eliminamos cada una individualmente y verificamos
    for (const key of keysToDelete) {
      try {
        await SecureStore.deleteItemAsync(key);
        // Verificar que se eliminó correctamente (especialmente importante en Android)
        const verify = await SecureStore.getItemAsync(key);
        if (verify !== null) {
          console.warn(`[authAPI.logout] ⚠️ La clave ${key} aún existe después de eliminar, reintentando...`);
          // Reintentar una vez más
          await SecureStore.deleteItemAsync(key);
          const verifyAgain = await SecureStore.getItemAsync(key);
          if (verifyAgain !== null) {
            console.error(`[authAPI.logout] ❌ No se pudo eliminar ${key} después de 2 intentos`);
          } else {
            console.log(`[authAPI.logout] ✅ ${key} eliminado correctamente (segundo intento)`);
          }
        } else {
          console.log(`[authAPI.logout] ✅ ${key} eliminado correctamente`);
        }
      } catch (error) {
        console.error(`[authAPI.logout] ❌ Error al eliminar ${key}:`, error);
        // Continuar con las demás claves aunque una falle
      }
    }

    // CRÍTICO: Limpiar headers de axios explícitamente
    // Esto asegura que no se use un token en memoria
    delete api.defaults.headers.common['Authorization'];
    console.log('[authAPI.logout] ✅ Headers de axios limpiados');

    // Verificar que no quede token en SecureStore
    const remainingToken = await SecureStore.getItemAsync('userToken');
    if (remainingToken !== null) {
      console.error('[authAPI.logout] ❌ ADVERTENCIA: Token aún existe después del logout');
      // Forzar eliminación una vez más
      try {
        await SecureStore.deleteItemAsync('userToken');
      } catch (error) {
        console.error('[authAPI.logout] ❌ Error crítico al forzar eliminación del token:', error);
      }
    } else {
      console.log('[authAPI.logout] ✅ Verificación: Token eliminado correctamente');
    }

    console.log('[authAPI.logout] ✅ Logout completado');
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
      const mockSubscription: UserSubscription = {
        plan: 'free' as PlanType,
        status: 'active' as 'active' | 'expired' | 'cancelled' | null,
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
    console.log('[subscriptionAPI] 🚀 Iniciando creación de checkout session para plan:', planId);
    console.log('[subscriptionAPI] 📡 Endpoint: POST /create-subscription');
    console.log('[subscriptionAPI] 📦 Payload:', { planId });
    
    try {
      const response = await api.post('/create-subscription', { planId });
      
      console.log('[subscriptionAPI] 📥 Respuesta completa del backend:', JSON.stringify(response.data, null, 2));
      console.log('[subscriptionAPI] 📥 Status:', response.status);
      console.log('[subscriptionAPI] 📥 Headers:', response.headers);
      
      // Verificar que la respuesta tenga los datos necesarios
      if (!response.data) {
        console.error('[subscriptionAPI] ❌ Respuesta vacía del backend');
        throw new Error('El servidor no devolvió datos de checkout');
      }
      
      // Extraer URL y sessionId de diferentes posibles campos
      const sessionId = response.data.sessionId || response.data.id || response.data.session_id;
      const url = response.data.url || response.data.checkoutUrl || response.data.checkout_url;
      
      console.log('[subscriptionAPI] 🔍 sessionId extraído:', sessionId);
      console.log('[subscriptionAPI] 🔍 URL extraída:', url);
      
      // Validar que tenemos una URL
      if (!url) {
        console.error('[subscriptionAPI] ❌ No se encontró URL en la respuesta');
        console.error('[subscriptionAPI] ❌ Campos disponibles en response.data:', Object.keys(response.data));
        throw new Error('No se recibió URL de checkout del servidor');
      }
      
      // Validar que la URL sea válida
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.error('[subscriptionAPI] ❌ URL inválida (no comienza con http/https):', url);
        throw new Error('URL de checkout inválida');
      }
      
      console.log('[subscriptionAPI] ✅ Checkout session creada exitosamente');
      console.log('[subscriptionAPI] ✅ sessionId:', sessionId);
      console.log('[subscriptionAPI] ✅ URL:', url);
      
      return {
        sessionId: sessionId || '',
        url: url,
      };
    } catch (error: any) {
      console.error('[subscriptionAPI] ❌ Error al crear checkout session');
      console.error('[subscriptionAPI] ❌ Error completo:', error);
      console.error('[subscriptionAPI] ❌ Error message:', error.message);
      console.error('[subscriptionAPI] ❌ Error response:', error.response?.data);
      console.error('[subscriptionAPI] ❌ Error status:', error.response?.status);
      console.error('[subscriptionAPI] ❌ Error headers:', error.response?.headers);
      
      // Proporcionar mensaje de error más descriptivo
      let errorMessage = 'No se pudo crear la sesión de pago. Intenta de nuevo.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Por favor intenta más tarde.';
      }
      
      throw new Error(errorMessage);
    }
  },

  createCheckout: async (planId: string): Promise<CheckoutSession> => {
    // Mantener compatibilidad con código existente
    return subscriptionAPI.createCheckoutSession(planId);
  },

  // Función para verificar y actualizar suscripción usando session_id de Stripe
  verifyPayment: async (sessionId: string): Promise<UserSubscription | null> => {
    console.log('[subscriptionAPI] 🔍 Verificando pago con session_id:', sessionId);
    try {
      // Intentar llamar a un endpoint que verifique el session_id y actualice la suscripción
      const response = await api.post('/subscription/verify-payment', { sessionId });
      console.log('[subscriptionAPI] ✅ Verificación de pago exitosa:', response.data);
      
      if (response.data.subscription) {
        const subscription: UserSubscription = {
          plan: (response.data.subscription.plan || 'free') as PlanType,
          status: (response.data.subscription.status || 'active') as 'active' | 'expired' | 'cancelled' | null,
          currentPeriodEnd: response.data.subscription.currentPeriodEnd || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          cancelAtPeriodEnd: response.data.subscription.cancelAtPeriodEnd || false,
        };
        
        // Limpiar cache y guardar nueva suscripción
        await SecureStore.deleteItemAsync('userSubscription');
        await SecureStore.setItemAsync('userSubscription', JSON.stringify(subscription));
        
        return subscription;
      }
      
      return null;
    } catch (error: any) {
      console.error('[subscriptionAPI] ❌ Error al verificar pago:', error);
      // Si el endpoint no existe, retornar null y el código seguirá con polling normal
      return null;
    }
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