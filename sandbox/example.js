'use strict';
const d3Target = '#system';
const d3Target2 = '#system2';
const d3Target3 = '#system3';

/*******************************************************************/
/* This is the entry point for the implentation if your library    */
/* I bound it to window because it would be otherwise unaccessable */
/* with the way webpack serves the sandbox files                   */
/*******************************************************************/

const ModelTrainerImageMarker = window['@skycatch/model-trainer-image-marker'];

const internals = {};
internals.CanvasSystem = [];
internals.iconColors = ['white', 'red', 'blue'];

internals.guid = () => {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const imageRequest = new Request('https://source.unsplash.com/random');

fetch(imageRequest)
.then((response) => {

  return response.url;
})
.then((url) => {

  initialize(d3Target, url);
  initialize(d3Target2, url);
  initialize(d3Target3, url);
});

const initialize = (el, url) => {
  const img = new Image();
  el = el.split('#').pop();

  img.onload = () => {

    internals.CanvasSystem[el] = new ModelTrainerImageMarker('cpId-'+internals.guid());
    // To specify the marker - pass reference to xlink:href
    // Available Options: { targetIcon, scaleMin, scaleMax, scaleLocateZoom, markerSize, markerShadowSize }
    internals.CanvasSystem[el].configure({
      targetIcon: '#target-'+internals.iconColors[Math.floor(Math.random() * internals.iconColors.length)]
    });

    internals.CanvasSystem[el].boot(img, 'imgId-'+internals.guid(), '#'+el, null, null, {
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
}

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

const resetZoom = (el) => {

  if (internals.CanvasSystem[el]) { internals.CanvasSystem[el].resetZoom(750); }
};

const zoomControlPoint = (el) => {

  if (internals.CanvasSystem[el]) { internals.CanvasSystem[el].findCP(1500); }
};

const clearMarker = (el) => {

  if (internals.CanvasSystem[el]) { internals.CanvasSystem[el].clearMarker(); }
};

const redrawIcon = (el) => {

  if (internals.CanvasSystem[el]) { internals.CanvasSystem[el].reDrawMarker(); }
}

window.onresize = function(event) {

  if (internals.CanvasSystem) {
    internals.CanvasSystem.forEach((el) => {
      internals.CanvasSystem[el].resetDimentions(event);
    })
  }
};
