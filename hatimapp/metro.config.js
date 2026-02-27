const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver for @ alias
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname),
  },
  sourceExts: [...(config.resolver.sourceExts || []), 'ts', 'tsx'],
};

module.exports = config;
