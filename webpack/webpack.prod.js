'use strict';

const PackageJSON = require('../package.json');
const Path = require('path');
const Webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {

  context: Path.resolve(__dirname, '../'),

  devtool: 'hidden-source-map',

  entry: [Path.resolve(__dirname, '../src/index.js')],

  mode: 'production',

  module: {
    rules: [
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
        test: /\.s[ac]ss$/,
        use: [
          { loader: 'style-loader'},
          { loader: 'css-loader'},
          { loader: 'postcss-loader'},
          { loader: 'sass-loader'}
        ]
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader'},
          { loader: 'css-loader'},
          { loader: 'postcss-loader'}
        ]
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

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            inline: false,
          }
        }
      })
    ]
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
