const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  webpack: function (config, env) {
    config.entry = {
      main: path.resolve(__dirname, './src/index.tsx'), // React popup
      content: path.resolve(__dirname, './src/content.tsx'),
      background: path.resolve(__dirname, './src/background.ts'),
      options: path.resolve(__dirname, './src/options/index.tsx'),
    };

    // --- OUTPUT CONFIG ---
    config.output = {
      ...config.output,
      filename: 'static/js/[name].js',
      chunkFilename: 'static/js/[name].chunk.js',
    };

    // --- DISABLE CODE SPLITTING (important for Chrome extensions) ---
    config.optimization.splitChunks = {
      cacheGroups: { default: false },
    };
    config.optimization.runtimeChunk = false;

    // --- FIX CSS FILE NAMING (remove hashes) ---
    const miniCssExtractPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin'
    );
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.filename = 'static/css/[name].css';
      miniCssExtractPlugin.options.chunkFilename = 'static/css/[name].chunk.css';
    }

    // --- FIX HTML OUTPUT (only inject popup’s script) ---
    const htmlWebpackPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'HtmlWebpackPlugin'
    );
    if (htmlWebpackPlugin) {
      htmlWebpackPlugin.userOptions.inject = true;
      htmlWebpackPlugin.userOptions.chunks = ['main'];
    }

    // --- COPY PUBLIC FILES (manifest, icons, etc.) ---
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

    return config;
  },
};
