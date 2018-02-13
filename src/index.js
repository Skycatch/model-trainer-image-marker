'use stict';
/****************************************/
/* This must stay here for HMR support! */
/****************************************/

import scss from './assets/scss';
import svgs from './assets/svgs';

import ModelTrainerImageMarker from './lib';

if (module.hot) {
  module.hot.accept();
}

module.exports = ModelTrainerImageMarker;
