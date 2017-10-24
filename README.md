# Library for implementing an image pixel marker for ML training
 
![Screenshot](https://user-images.githubusercontent.com/4627728/31919244-e004a99c-b815-11e7-8547-1ce77bcbfc0e.png)

This library is framework agnostic so it can be used with React, Angular, Vue, or whatever other frameworks you so choose.

To use this library in your application import it as follows for the javascript

```javascript
const ModelTrainerImageMarker = reqire('@skycatch/model-trainer-image-marker');
```

The css if applicable will be located in the `dist` folder of the node_module



## Interface

Pass in an in-memory Image object using the [https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image](API)

URL can either be a http image url, or created from an in memory file with `window.URL.createObjectURL`


```javascript
const ModelTrainerImageMarker = require('@skycatch/model-trainer-image-marker');
const url = "https://user-images.githubusercontent.com/4627728/31919244-e004a99c-b815-11e7-8547-1ce77bcbfc0e.png";
const MarkerSystem = new ModelTrainerImageMarker('imageId');
const img = new Image();
img.onload = () => {
    MarkerSystem.boot(img, 'PoI-1', '#system', null, null, {
      onReady: myOnReady.bind(this),
      onMark: myOnMarked.bind(this),
      onMarkClick: myOnMarkerClicked.bind(this),
      onMarkDelete: myOnMarkDelete.bind(this),
      onZoomReset: myOnZoomReset.bind(this),
      onZoomToCP: myOnZoomToCP.bind(this)
    });
});
img.src = url;
```


## API 

**new ModelTrainerImageMarker(imageId)**

* `imageId` - _String_: UID of image

**MarkerSystem.configure(options)** - _JSON_: Configuration optinos

* `options`

```javascript
 {
      'targetIcon': '#svg-xlink:href'
 }
```


**MarkerSystem.boot(img, poi-Id, DOM-Id, alreadyMarked, currentMark, events)**

* `img` - _Image()_: In-memory Image object
* `poi-Id` - _String_: UID of Point of Interest PoI)
* `DOM-Id` - _String_: DOM Element UID
* `alreadyMarked` - _Array[JSON]_: Array of points of interest already marked in this image

```javascript
 [{
      'cpId': 'PoI-1',
      'x': 2500,
      'y': 1000
 }]
```
* `currentMark` - _JSON_: Access to live marking session

```javascript
 {
      'cpId': 'PoI-1',
      'x': 2500,
      'y': 1000
 }
```
- `events` - _JSON_: Event Listener Handles
  - onReady
  - onMark
  - onMarkClick
  - onMarkDelete
  - onZoomReset
  - onZoomToCP

## Interact

**MarkerSystem.resetZoom(duration)** - _(ms)_ - zooms back to the original centered - non-zoomed state

**MarkerSystem.findCP(duration)** - _(ms)_ - focus + zooms to the marked PoI id marked

**MarkerSystem.clearMarker()** - Removes the mark from the image

**MarkerSystem.reDrawMarker()** - Redraws the marker (incase configuration changes have occured)



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

