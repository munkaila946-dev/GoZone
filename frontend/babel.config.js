module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@screens': './src/screens',
            '@theme': './src/theme',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@services': './src/services',
            '@utils': './src/utils',
          },
        },
      ],
    ],
  };
};
