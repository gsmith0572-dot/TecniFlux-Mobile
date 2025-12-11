const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configuración para production: resetCache en true
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  config.resetCache = true;
}

module.exports = withNativeWind(config, { input: './global.css' });
