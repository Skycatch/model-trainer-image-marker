'use strict';

const PackageJSON = require('../package.json');
const Path = require('path');
const Webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

require('es6-promise').polyfill();

module.exports = {

  context: Path.resolve(__dirname, '../'),

  entry: [Path.resolve(__dirname, '../src/index.js')],

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheIdentifier: Path.resolve(__dirname, '../.babelrc')
          }
        }]
      },
      {
        test: /\.json$/,
        loaders: ['json-loader']
      },
      {
        test: /\.scss$/,
        loader:  ExtractTextPlugin.extract({
          fallback:'style-loader',
          use:['css-loader','sass-loader', 'autoprefixer-loader?browsers=last 4 versions']
        })
      },
      {
        test: /\.css$/,
        loader:  'style-loader!css-loader!autoprefixer-loader?browsers=last 4 versions'
      },
      {
        test: /\.(png|jpg|jpeg|gif|woff)$/,
        loader: 'url-loader?limit=8192'
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  output: {
    library: PackageJSON.name,
    libraryTarget: 'umd',
    path: Path.resolve(__dirname, '../dist'),
    filename: 'bundle.js'
  },

  plugins: [
    // Specify the resulting CSS filename
    new ExtractTextPlugin('bundle.css'),
    // Breaks the require references in src
    new Webpack.optimize.UglifyJsPlugin({minimize: true}),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessorOptions: { discardComments: { removeAll: true } }
    })
  ],

  resolve: {
    extensions: ['*', '.js', '.css', '.scss', '.html'],
    alias: {
      // Put any vendor aliases here
      normalize: Path.join(__dirname, '/node_modules/normalize.css/normalize.css')
    }
  },

  stats: {
    colors: true,
    reasons: true
  },

  target: 'web'
};
