const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const babelPluginObjectSpread = require('@babel/plugin-proposal-object-rest-spread');

const buildPath = path.join(__dirname, 'build');
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const plugins = [
  new CleanWebpackPlugin([buildPath], {
    root: process.cwd(),
  }),
  new webpack.LoaderOptionsPlugin({
    minimize: isProd,
    debug: !isProd,
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(nodeEnv),
  }),
];

module.exports = {
  target: 'node',
  devtool: 'cheap-module-source-map',
  context: path.join(__dirname, '.'),
  entry: {
    js: './src/handler.js',
  },
  output: {
    path: buildPath,
    filename: 'handler.js',
    library: 'handler',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.json$/,
        loaders: [{ loader: 'json-loader', options: { loaderType: 'preLoader' } }],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [babelPluginObjectSpread],
            presets: [['@babel/preset-env', {
              targets: {
                node: '6.10',
                esmodules: true,
              },
            }]],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      path.resolve('.'),
      'node_modules',
    ],
  },
  plugins,
};
