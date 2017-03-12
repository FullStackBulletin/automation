

import fs from 'fs';
import path from 'path';
import BabiliPlugin from 'babili-webpack-plugin';
import webpack from 'webpack';
import CleanWebpackPlugin from 'clean-webpack-plugin';

const babelPlugins = JSON.parse(fs.readFileSync(path.join(__dirname, '.babelrc'), 'utf8')).plugins;
// removes "transform-es2015-modules-commonjs" plugin (modules are managed by webpack)
babelPlugins.splice(babelPlugins.indexOf('transform-es2015-modules-commonjs'), 1);

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

// if prod compress
// if (isProd) {
//   plugins.push(new BabiliPlugin({
//     sourceMap: isProd,
//     comments: !isProd,
//   }));
// }

module.exports = {
  target: 'node',
  devtool: isProd ? 'cheap-module-source-map' : 'cheap-module-eval-source-map',
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
    loaders: [
      {
        test: /\.json$/,
        loaders: [{ loader: 'json-loader', options: { loaderType: 'preLoader' } }],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [{
          loader: 'babel-loader',
          query: { plugins: babelPlugins, cacheDirectory: '.babel_cache' },
        }],
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
