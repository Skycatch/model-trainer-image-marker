'use stict';
/****************************************/
/* This must stay here for HMR support! */
/****************************************/

require('./assets/scss');
require('./assets/svgs');
// require('./assets/images') // Not Needed

const ModelTrainerImageMarker = require('./lib');


if (module.hot) {
  if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development') {
    window.ModelTrainerImageMarker = ModelTrainerImageMarker;
  }
  module.hot.accept();
}

export default ModelTrainerImageMarker;