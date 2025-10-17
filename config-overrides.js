// config-overrides.js

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  webpack: function(config, env) {
    const isEnvDevelopment = env === 'development';
    const isEnvProduction = env === 'production';

    

    // 1. Set Entry Points for Popup, Content Script, and Background Script
    config.entry = {
      main: path.resolve(__dirname, './src/index.js'),
      content: path.resolve(__dirname, './src/content.js'),
      background: path.resolve(__dirname, './src/background.js'),
    };

    // 2. Set Output File Names
    config.output = {
      ...config.output,
      filename: 'static/js/[name].js',
      chunkFilename: 'static/js/[name].chunk.js',
    };

    // 3. Disable Code Splitting
    config.optimization.splitChunks = {
      cacheGroups: {
        default: false,
      },
    };
    config.optimization.runtimeChunk = false;

    // 4. Remove CSS Content Hash
    const miniCssExtractPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
    );
    
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.filename = 'static/css/[name].css';
      miniCssExtractPlugin.options.chunkFilename = 'static/css/[name].chunk.css';
    }

    // 5. Modify HTML Plugin to use relative paths
    const htmlWebpackPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'HtmlWebpackPlugin'
    );
    
    if (htmlWebpackPlugin) {
      htmlWebpackPlugin.options.inject = true;
      htmlWebpackPlugin.options.chunks = ['main']; // Only inject main chunk
    }

    // 6. Ensure public/manifest.json is copied over
    const copyWebpackPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'CopyPlugin'
    );
    
    if (copyWebpackPlugin) {
      copyWebpackPlugin.patterns[0].transform = function (content, path) {
        if (path.endsWith('manifest.json')) {
          return content;
        }
        return content;
      };
    } else {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'public',
              globOptions: {
                ignore: ['**/index.html'],
              },
            },
          ],
        })
      );
    }

    return config;
  },
};
