const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isHot = path.basename(require.main.filename) === 'webpack-dev-server.js';

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    entry: { main: './src/index.js' },
    output: {
      path: path.resolve(__dirname, isDev ? 'dist' : 'docs'),
      filename: '[name].[hash].js',
    },
    devServer: {
      port: 9002,
      contentBase: 'docs',
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['**/*', '!images', '!images/*'],
      }),
      new HtmlWebpackPlugin({
        template: './src/html/index.pug',
      }),
      new MiniCssExtractPlugin({
        filename: isHot ? '[name].css' : '[name].[contenthash].css',
        chunkFilename: '[id].css',
      }),
      new WebpackMd5Hash(),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.pug$/,
          use: ['pug-loader'],
        },
        {
          test: /\.(css|sass|scss)$/,
          use: [
            'css-hot-loader',
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { url: false },
            },
            'postcss-loader',
            'sass-loader',
          ],
        },
      ],
    },
  };
};
