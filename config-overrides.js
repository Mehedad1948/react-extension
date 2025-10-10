    const { override, addWebpackPlugin } = require('customize-cra');
    const CopyWebpackPlugin = require('copy-webpack-plugin');
    const path = require('path');

    module.exports = {
      webpack: function(config, env) {
        if (env === 'production') {
          // Change the output filenames to be static for extension consistency
          config.output.filename = 'static/js/[name].js';
          config.output.chunkFilename = 'static/js/[name].chunk.js';

          // Tell webpack about our multiple entry points
          config.entry = {
            main: path.resolve(__dirname, 'src/index.js'), // For the popup
            content: path.resolve(__dirname, 'src/content.js'), // For the content script
            background: path.resolve(__dirname, 'src/background.js') // For the background script
          };
          
          // Disable splitting code into multiple chunks for content/background scripts
          // as they need to be self-contained.
          config.optimization.splitChunks = {
            cacheGroups: {
              default: false,
            },
          };
          config.optimization.runtimeChunk = false;
        }

        // Add a plugin to copy the popup.html and manifest.json to the build folder
        return override(
          addWebpackPlugin(
            new CopyWebpackPlugin({
              patterns: [
                {
                  from: 'public/manifest.json',
                  to: 'manifest.json'
                },
                {
                  from: 'public/popup.html',
                  to: 'popup.html'
                },
                {
                  from: 'public/logo192.png',
                  to: 'logo192.png'
                }
              ]
            })
          )
        )(config, env);
      },
    };
