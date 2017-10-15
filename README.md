# Library for implementing an image pixel marker for ML training
 
![Screenshot]()

This library is framework agnostic so it can be used with React, Angular, Vue, or whatever other frameworks you so choose.

To use this library in your application import it as follows for the javascript

```javascript
const ModelTrainerImageMarker = reqire('@skycatch/model-trainer-image-marker');
```

The css if applicable will be located in the `dist` folder of the node_module



## Interface

Pass in an in memory Image object using the [https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image](Image API)

URL can either be a http image url, or created from an in memory file with `window.URL.createObjectURL`



```javascript
const ModelTrainerImageMarker = require('@skycatch/model-trainer-image-marker');
const MarkerSystem = new ModelTrainerImageMarker('imageId');
const img = new Image();
img.onload = () => {
    MarkerSystem.boot(img, 'PoI-1', '#system', null, null, {
      onReady: onReady.bind(this),
      onMark: onMarked.bind(this),
      onMarkClick: onMarkerClicked.bind(this),
      onMarkDelete: onMarkDelete.bind(this),
      onZoomReset: onZoomReset.bind(this),
      onZoomToCP: onZoomToCP.bind(this)
    });
});
img.src = url;
```


## What's in the box?

D3, Webpack Hot Module Replacement (HMR), ES6, SASS, Linting, Unit Tests, and Sandbox library module template

## Environment setup 

```sh
  $ npm i
```

## Development

Start the Webpack server (includes live reloading + hot module replacement when you change files):

```sh
  $ npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in a browser.  `./sandbox/index.html` is the example which is an example of an implentation of your src library.
`./src/index.js` is the entry point.

## Bundling 

When you're finished and want to make a build, you will need to actually bundle the code into its distribution bundles.  The following command will do this with which you can publish the library

```sh
  $ npm run bundle
```

