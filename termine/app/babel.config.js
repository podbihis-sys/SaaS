module.exports = function (api) {
  api.cache(true);
  return {
    // `babel-preset-expo` wires up the Reanimated worklet plugin itself when
    // Reanimated is installed. Adding it by hand here duplicates it and breaks
    // the build on versions that moved the plugin into `react-native-worklets`.
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
