module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      "react-native-reanimated/plugin" // IMPORTANTE: Debe ser el último
    ],
  };
};
