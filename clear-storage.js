import * as SecureStore from 'expo-secure-store';

async function clearAuth() {
  await SecureStore.deleteItemAsync('authToken');
  console.log('✅ Token borrado');
}

clearAuth();
