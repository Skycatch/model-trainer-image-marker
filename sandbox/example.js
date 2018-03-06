'use strict';
const d3Target = '#system';

/*******************************************************************/
/* This is the entry point for the implentation if your library    */
/* I bound it to window because it would be otherwise unaccessable */
/* with the way webpack serves the sandbox files                   */
/*******************************************************************/

const ModelTrainerImageMarker = window['@skycatch/model-trainer-image-marker'];

const internals = {};

const imageRequest = new Request('https://source.unsplash.com/random');

fetch(imageRequest)
.then((response) => {

  return response.url;
})
.then((url) => {

  const img = new Image();
  img.onload = () => {

    internals.CanvasSystem = new ModelTrainerImageMarker('cpId-1');
    // To specify the marker - pass reference to xlink:href
    // Available Options: { targetIcon, scaleMin, scaleMax, scaleLocateZoom, markerSize, markerShadowSize }
    internals.CanvasSystem.configure({
      targetIcon: '#target-white'
    })
    internals.CanvasSystem.boot(img, 'imgId-1', d3Target, null, null, {
      onReady: onReady.bind(this),
      onMark: onMarked.bind(this),
      onMarkClick: onMarkerClicked.bind(this),
      onMarkDelete: onMarkDelete.bind(this),
      onZoomReset: onZoomReset.bind(this),
      onZoomToCP: onZoomToCP.bind(this)
    });
  };
  img.onerror = (err) => {
    console.log(err);
  }

  img.src = Math.random() > .1 ? url : 'https://media.giphy.com/media/l0IyayMlfXiWKTJCM/giphy.gif';
});

/// Application Events

const onReady = (data) => {
  // Not Needed
  console.log('onReady: ', data);
}

const onMarked = (data) => {

  console.log('onCPMarked: ', data);
}

const onMarkerClicked = (data) => {

  console.log('onCPMarkerClicked: ', data);
}

const onMarkDelete = (data) => {

  console.log('onMarkDelete: ', data);
}

const onZoomReset = (data) => {
  // Not needed
}

const onZoomToCP = (data) => {

  console.log('onZoomToCP: ', data);
}


/// Application Modifiers

const resetZoom = () => {

  if (internals.CanvasSystem) { internals.CanvasSystem.resetZoom(750); }
};

const zoomControlPoint = () => {

  if (internals.CanvasSystem) { internals.CanvasSystem.findCP(1500); }
};

const clearMarker = () => {

  if (internals.CanvasSystem) { internals.CanvasSystem.clearMarker(); }
};

const redrawIcon = () => {

  if (internals.CanvasSystem) { internals.CanvasSystem.reDrawMarker(); }
}

window.onresize = function(event) {

  if (internals.CanvasSystem) { internals.CanvasSystem.resetDimentions(event); }
};
