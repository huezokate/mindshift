const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

const config = getDefaultConfig(__dirname);

module.exports = withStorybook(config, {
  // WITH_STORYBOOK=false strips storybook modules from release bundles.
  enabled: process.env.WITH_STORYBOOK !== 'false',
  configPath: path.resolve(__dirname, './.rnstorybook'),
});
