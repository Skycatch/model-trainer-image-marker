'use stict';
/****************************************/
/* This must stay here for HMR support! */
/****************************************/

require('./assets/scss');
require('./assets/svgs');
// require('./assets/images') // Not Needed

const ModelTrainerImageMarker = require('./lib');

if (module.hot) {
  module.hot.accept();
}

module.exports = ModelTrainerImageMarker;