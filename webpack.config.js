'use strict';

switch (process.env.NODE_ENV) {
  case 'prod':
  case 'production':
    module.exports = require('./webpack/webpack.prod');
    break;
  case 'test':
  case 'testing':
    module.exports = require('./webpack/webpack.test');
    break;
  case 'dev':
  case 'development':
  default:
    module.exports = require('./webpack/webpack.dev');
}