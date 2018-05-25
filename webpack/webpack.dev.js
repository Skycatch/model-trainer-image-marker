'use strict';

const PackageJSON = require('../package.json');
const Path = require('path');
const Webpack = require('webpack');
const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {

  cache: true,

  context: Path.resolve(__dirname, '../'),

  // Create Sourcemaps for the bundle
  devtool: 'source-map', // less performant - most verbose
  // devtool: 'cheap-eval-source-map', // performant - traceable

  devServer: {
    before: () => {

      console.warn('\n[******** Beginning Webpack ********]');
    },
    contentBase: Path.resolve(__dirname, '../sandbox'),
    compress: true,
    historyApiFallback: true,
    hotOnly: false,
    hot: false, // hot module replacement. Depends on HotModuleReplacementPlugin
    https: false, // true for self-signed, object for cert authority
    inline: true,
    lazy: false, // the dev-server will only compile the bundle when it gets requested
    noInfo: false, // only errors & warns on hot reload
    open: false,
    overlay: true,
    progress: true,
    watchContentBase: true
    // If you have an application server
    // proxy: { '*': { target: 'http://localhost:8081' } }
  },

  entry: [Path.resolve(__dirname, '../src/index.js')],

  mode: 'development',

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
        test: /\.s[ac]ss$/,
        use: [
          { loader: 'style-loader', options: { sourceMap: true } },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } }
        ]
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader', options: { sourceMap: true } },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader', options: { sourceMap: true } }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|woff)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'html-loader'
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  output: {
    filename: 'bundle.js',
    library: PackageJSON.name,
    libraryTarget: 'umd',
    path: Path.resolve(__dirname, '../dist')
  },

  plugins: [
    new Webpack.NamedModulesPlugin(),
    new Webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    // Breaks the require references in src
    // new Webpack.optimize.UglifyJsPlugin({minimize: true}),
    new StyleLintPlugin({
      configFile: '.stylelintrc',
      context: '',
      files: '**/*.scss',
      syntax: 'scss',
      failOnError: false,
      quiet: false
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
