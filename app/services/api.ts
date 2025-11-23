import axios from 'axios';

// Configuración de Axios con baseURL
const api = axios.create({
  baseURL: 'https://tecniflux-production.up.railway.app', // <--- ¡CON COMILLAS!
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });
      
      return response.data;
    } catch (error: any) {
      // Si hay respuesta del servidor, usar su mensaje
      if (error.response) {
        throw new Error(error.response.data?.message || 'Error al iniciar sesión');
      }
      // Si no hay conexión o timeout
      if (error.request) {
        throw new Error('No se pudo conectar con el servidor');
      }
      // Error general
      throw new Error('Error desconocido al iniciar sesión');
    }
  },
};

export default api;