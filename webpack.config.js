const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const isHot = path.basename(require.main.filename) === 'webpack-dev-server.js';

const config = {
  entry: { main: './src/index.js' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js',
  },
  devServer: {
    port: 9002,
  },
  plugins: [
    new CleanWebpackPlugin('dist', {}),
    new HtmlWebpackPlugin({
      template: './src/html/index.pug',
    }),
    new CopyWebpackPlugin([{ from: './src/static' }]),
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
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
};

module.exports = (env, argv) =>
  // if (argv.mode === 'development') {}
  // if (argv.mode === 'production') {}
  config;
