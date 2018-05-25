'use strict';

import * as axis from 'd3-axis';
import * as scale from 'd3-scale';
import * as transform from 'd3-transform';
import * as transition from 'd3-transition';
import * as zoom from 'd3-zoom';
import { select, selectAll, mouse } from 'd3-selection';
import { event as currentEvent } from 'd3-selection';

const d3 = Object.assign({},
  { mouse, select, selectAll },
  axis,
  scale,
  transform,
  transition,
  zoom
);

const KOptionsList = [
  'targetIcon', // links to an svg icon by x-link id (must by registered to DOM)
  'scaleMin', // zoom out max
  'scaleMax', // zoom in max
  'scaleLocateZoom', // how far it autozooms into a mark
  'markerSize',
  'markerShadowSize',
  'readOnly' // none of the clicking does anything
];
const kScaleMin = .09;
const kScaleMax = 20;
const kScaleLocateZoom = 2;
const kMarkerSize = 38;
const kMarkerShadowSize = 9;
const kReadOnlyMode = false;
/**
 * @Class ModelTrainerImageMarker class used to provide pan, zoom, and mark capabilities
 *
 * Methods:
 * boot (6)
 * destroy ()
 */

class ModelTrainerImageMarker {

  constructor (id) {

    this.id = id;
    this.imgId, this.target, this.pin, this.mark, this.events, this.width, this.height;
    this.cartesianSystem;
    this.hasPin = false;
  }

  boot (img, imgId, target, objects, mark, events) {

    if (events) {
      this.events = events;
    }
    this.objects = objects; // other markers on image
    this.pin = {
      marked: false,
      pixelLocation: []
    };
    if (mark && mark.x && mark.y) {
      this.pin.pixelLocation = [mark.x, mark.y];
    }
    if (img) {
      this.img = img;
    }
    this.events = events;
    this.target = target;
    this.imgId = imgId;
    this.cartesianSystem = d3.select(`svg${this.target}`);
    this.cartesianSystem.attr('class', 'mtim_system');
    this._init();
  }

  configure (options) {

    /* Superset */
    /*
      { targetIcon, scaleMin, scaleMax, scaleLocateZoom, markerSize, markerShadowSize, viewOnly }
    */

    options = options || {};
    Object.keys(options).forEach((option) => {

      if (!KOptionsList.includes(option)) {
        console.warn(`Option: ${option} is not an acceptable option`);
        console.warn(`Acceptable options include: ${KOptionsList.join(', ')}`);
      }
    })
    if (options.targetIcon) {
      this.targetIcon = this.targetIcon ? this.targetIcon : options.targetIcon;
    }

    this.optionScaleMin = this.optionScaleMin ? this.optionScaleMin : (options.scaleMin ? options.scaleMin : kScaleMin);
    this.optionScaleMax = this.optionScaleMax ? this.optionScaleMax : (options.scaleMax ? options.scaleMax : kScaleMax);
    this.optionScaleLocateZoom = this.optionScaleLocateZoom ? this.optionScaleLocateZoom : (options.scaleLocateZoom ? options.scaleLocateZoom : kScaleLocateZoom);
    this.optionMarkerSize = this.optionMarkerSize ? this.optionMarkerSize : (options.markerSize ? options.markerSize : kMarkerSize);
    this.optionMarkerShadowSize = this.optionMarkerShadowSize ? this.optionMarkerShadowSize : (options.markerShadowSize ? options.markerShadowSize : kMarkerShadowSize);
    this.optionReadOnly = this.optionReadOnly ? this.optionReadOnly : (options.readOnly ? options.readOnly : kReadOnlyMode);
  }

  // Zooms backwards to a hollistic perspective
  resetZoom (delay) {

    if (!delay) {
      delay = 0;
    }
    const scaledWidth = this.img.width * this.optionScaleMin;
    const scaledHeight = this.img.height * this.optionScaleMin;
    const x = (this.width - scaledWidth) / 2;
    const y = (this.height - scaledHeight) / 2;
    this.cartesianSystem.transition()
      .duration(delay)
      .call(this._zoomStrat().transform, d3.zoomIdentity.translate(x, y).scale(this.optionScaleMin));
    this.events.onZoomReset ? this.events.onZoomReset() : this.onZoomReset();
  }

  // Cleans DOM and D3 Nodes / Listeners
  destroy () {

    if (!this.cartesianSystem) {
      return;
    }
    this.cartesianSystem.selectAll('*').remove();
    this.cartesianSystem = null;
    this.img = '';
    return null;
  }


  // Marks a pixel location on the system w.r.t. transformation and scale, uneditable marker
  drawStatic (x, y, context) {

    // draw static object
    const z = d3.zoomTransform(this.cartesianSystem.node()).k;
    if (x > 0 && y > 0) {
      this.mark = this.CanvasArea.append('circle')
        .attr('id', context.id)
        .attr('class', 'control-point-static')
        .attr('dr', this.optionMarkerShadowSize)
        .attr('r', this.optionMarkerShadowSize / z)
        .attr('cx', x )
        .attr('cy', y )
        .on('mouseover', (d) => {
          return this.tip
            .style('left', currentEvent.pageX - 30 + 'px')
            .style('top', currentEvent.pageY - 50 + 'px')
            .style('display', 'inline-block')
            .style('visibility', 'visible')
            .html(`<h6 id="${context.id}" class="bold no-margin">${context.id}</h6>`);
        })
        .on('mousemove', (d) => {
          return this.tip
            .style('left', currentEvent.pageX - 30 + 'px')
            .style('top', currentEvent.pageY - 50 + 'px')
            .style('display', 'inline-block')
            .html(`<h6 id="${context.id}" class="bold no-margin">${context.id}</h6>`);
        })
        .on('mouseout', (d) => {

          return this.tip.style('visibility', 'hidden');
        })
        .on('click', (d, i) => {

          currentEvent.stopPropagation();
          this.events.onMarkClick ? this.events.onMarkClick({ photoId: this.imgId, id: context.id }) : this.onMarkClick({ photoId: this.imgId, id: context.id });
        });
    }
  }

  reDrawMarker () {

    if (!this.optionReadOnly) {

      if (!this.CanvasArea) {
        return;
      }

      this.CanvasArea.selectAll('use.control-point').remove();
      this.CanvasArea.selectAll('circle.control-point').remove();
      this.CanvasArea.selectAll('circle.shadow').remove();
      const z = d3.zoomTransform(this.cartesianSystem.node()).k;
      if (this.pin.pixelLocation[0] > 0 && this.pin.pixelLocation[1] > 0) {
        const x = this.pin.pixelLocation[0];
        const y = this.pin.pixelLocation[1];
        if (this.targetIcon) {
          this.mark = this.CanvasArea.append('use')
            .attr('id', this.id)
            .attr('xlink:href', this.targetIcon)
            .attr('class', 'control-point')
            .attr('width', this.optionMarkerSize / z)
            .attr('height', this.optionMarkerSize / z)
            .attr('x', x - (this.optionMarkerSize / z / 2) )
            .attr('y', y - (this.optionMarkerSize / z / 2));
        }
        else {
          this.mark = this.CanvasArea.append('circle')
            .attr('id', this.id)
            .attr('class', 'control-point')
            .attr('dr', this.optionMarkerShadowSize + 6)
            .attr('r', this.optionMarkerShadowSize / z + 6)
            .attr('cx', x )
            .attr('cy', y );
        }

        this.CanvasArea.append('circle')
          .attr('class', 'shadow')
          .attr('dr', this.optionMarkerShadowSize)
          .attr('r', this.optionMarkerShadowSize / z)
          .attr('cx', x )
          .attr('cy', y );
      }
    }
  }

  // Marks a pixel location on the system w.r.t. transformation and scale
  drawMarker (x, y) {

    if (!this.optionReadOnly) {
      if (!this.CanvasArea) {
        return;
      }
      // draw pin on mouse click

      this.CanvasArea.selectAll('use.control-point').remove();
      this.CanvasArea.selectAll('circle.control-point').remove();
      this.CanvasArea.selectAll('circle.shadow').remove();
      if (!x && !y) {
        const mouse = d3.mouse(currentEvent.currentTarget);
        x = mouse[0];
        y = mouse[1];
        this.pin = {
          marked: true,
          pixelLocation: [x, y]
        };
      }
      const z = d3.zoomTransform(this.cartesianSystem.node()).k;
      if (x > 0 && y > 0) {
        if (this.targetIcon) {
          this.mark = this.CanvasArea.append('use')
            .attr('id', this.id)
            .attr('xlink:href', this.targetIcon)
            .attr('class', 'control-point')
            .attr('width', this.optionMarkerSize / z)
            .attr('height', this.optionMarkerSize / z)
            .attr('x', x - (this.optionMarkerSize / z / 2) )
            .attr('y', y - (this.optionMarkerSize / z / 2));
        }
        else {
          this.mark = this.CanvasArea.append('circle')
            .attr('id', this.id)
            .attr('class', 'control-point')
            .attr('dr', this.optionMarkerShadowSize)
            .attr('r', this.optionMarkerShadowSize / z)
            .attr('cx', x )
            .attr('cy', y );
        }

        this.CanvasArea.append('circle')
          .attr('class', 'shadow')
          .attr('dr', this.optionMarkerShadowSize)
          .attr('r', this.optionMarkerShadowSize / z)
          .attr('cx', x )
          .attr('cy', y );

        this.events.onMark ? this.events.onMark({ photoId: this.imgId, id: this.id, x, y }) : this.onMark({ photoId: this.imgId, id: this.id, x, y });
      }
    }
  }

  // Erases the marked location from the system
  clearMarker () {

    if (!this.CanvasArea) {
      return;
    }
    this.CanvasArea.selectAll('use.control-point').remove();
    this.CanvasArea.selectAll('circle.control-point').remove();
    this.CanvasArea.selectAll('circle.shadow').remove();
    this.pin = {
      marked: false,
      pixelLocation: [] // x, y
    };

    this.events.onMarkDelete ? this.events.onMarkDelete({ photoId: this.imgId, id: this.id }) : this.onMarkDelete({ photoId: this.imgId, id: this.id });
  }

  // Locates and zooms gradually to the Point of Interest
  findCP (delay) {

    if (!this.optionReadOnly) {
      if (!delay) {
        delay = 0;
      }

      if (this.pin && this.pin.pixelLocation && this.pin.pixelLocation.length === 2) {
        const x = (this.width / 2) - this.pin.pixelLocation[0] * this.optionScaleLocateZoom;
        const y = (this.height / 2) - this.pin.pixelLocation[1] * this.optionScaleLocateZoom;
        this.cartesianSystem.transition()
          .duration(delay)
          .call(this._zoomStrat().transform, d3.zoomIdentity.translate(x, y).scale(this.optionScaleLocateZoom));
      }
      else {
        this.resetZoom(750);
      }

      this.events.onZoomToMark ? this.events.onZoomToMark() : this.onZoomToMark();

    }
  }

  // Incrementally Zoom in
  zoomIn () {

    const z = d3.zoomTransform(this.cartesianSystem.node()).k;
    const x = d3.zoomTransform(this.cartesianSystem.node()).x * z - this.width * z / 2;
    const y = d3.zoomTransform(this.cartesianSystem.node()).y * z - this.height * z / 2;
    this.cartesianSystem.transition()
      .duration(375)
      .call(this._zoomStrat().transform, d3.zoomIdentity.translate(x, y).scale(z * 2));
  }

  // Incrementally Zoom Out
  zoomOut () {

    const z = d3.zoomTransform(this.cartesianSystem.node()).k;
    const x = d3.zoomTransform(this.cartesianSystem.node()).x * z - this.width * z / 2;
    const y = d3.zoomTransform(this.cartesianSystem.node()).y * z - this.height * z / 2;
    this.cartesianSystem.transition()
      .duration(375)
      .call(this._zoomStrat().transform, d3.zoomIdentity.translate(x, y).scale(z / 2));
  }

  // Method that governs zoom behavior
  _zoomStrat () {

    return d3.zoom()
      .scaleExtent([this.optionScaleMin, this.optionScaleMax])
      .on('zoom', () => {

        const markerSize = this.optionMarkerSize;
        this.CanvasArea.attr('transform', currentEvent.transform);
        this.pX.call(this.xAxis.scale(currentEvent.transform.rescaleX(this.xScale)));
        this.pY.call(this.yAxis.scale(currentEvent.transform.rescaleY(this.yScale)));
        if (currentEvent.transform) {
          // Resize the marker icon
          this.CanvasArea.selectAll('use.control-point')
            .each(function(d) {

              const spot = d3.select(this);
              const k = currentEvent.transform.k;
              const dWidth = (parseFloat(spot.attr('width')) - markerSize / k) / 2;
              const dHeight = (parseFloat(spot.attr('height')) - markerSize / k) / 2;
              const x = parseFloat(spot.attr('x')) + dWidth;
              const y = parseFloat(spot.attr('y')) + dHeight;
              spot.attr('width', markerSize / k)
              spot.attr('height', markerSize / k)
              spot.attr('x', x)
              spot.attr('y', y);
            });
          this.CanvasArea.selectAll('circle.control-point')
            .each(function(d) {

              const spot = d3.select(this);
              let z = currentEvent.transform.k;
              if (spot.attr('dr')) {
                z = spot.attr('dr') / z;
              }
              spot.attr('r', z);
            });
          this.CanvasArea.selectAll('circle.shadow')
            .each(function(d) {

              const spot = d3.select(this);
              let z = currentEvent.transform.k;
              if (spot.attr('dr')) {
                z = spot.attr('dr') / z;
              }
              spot.attr('r', z);
            });
          this.CanvasArea.selectAll('circle.control-point-static')
            .each(function(d) {

              const spot = d3.select(this);
              let z = currentEvent.transform.k;
              if (spot.attr('dr')) {
                z = spot.attr('dr') / z;
              }
              spot.attr('r', z);
            });
        }
      });
  }

  // Initialize System
  _init () {

    this.configure();
    // X Scaling Behavior
    this.xScale = d3.scaleLinear()
      .domain([-1, this.img.width + 1])
      .range([-1, this.img.width + 1]);

    // Y Scaling Behavior
    this.yScale = d3.scaleLinear()
      .domain([-1, this.img.height + 1])
      .range([-1, this.img.height + 1]);

    // X Axis Rules
    this.xAxis = d3.axisBottom(this.xScale)
      .ticks( 20 )
      .tickSize( 10 )
      .tickPadding( 5 );

    // Y Axis Rules
    this.yAxis = d3.axisRight(this.yScale)
      .ticks( 20 )
      .tickSize( 10 )
      .tickPadding( 5 );

    // Physical X Axis
    this.pX = this.cartesianSystem.append('g')
      .attr('class', 'axis axis--x')
      .call(this.xAxis);

    // Physical Y Axis
    this.pY = this.cartesianSystem.append('g')
      .attr('class', 'axis axis--y')
      .call(this.yAxis);

    // Photo Canvas Area
    this.CanvasArea = this.cartesianSystem.append('g')
      .attr('class', 'canvas');

    // Tooltip
    d3.selectAll(`.d3-tooltip`).filter(`#${this.target.replace("#","")}-mtim`).remove();
    this.tip = d3.select('body')
      .append('div')
      .attr('id', `${this.target.replace("#","")}-mtim`)
      .attr('class', 'd3-tooltip');

    // Photo
    this.CanvasImage = this.CanvasArea.append('svg:image')
      .attr('xlink:href', this.img.src || this.img)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', this.img.width)
      .attr('height', this.img.height);

    this.resetDimentions();
    this.CanvasArea.on('click', this.drawMarker.bind(this));
    this.cartesianSystem.call(this._zoomStrat().bind(this));
    this.resetZoom.bind(this);
    this.events.onReady ? this.events.onReady(this.id) : this.onReady(this.id);
    if (this.objects && this.objects.length) {
      this.objects.forEach((object) => {

        this.drawStatic(object.x, object.y, object);
      });
    }
    if (this.pin && this.pin.pixelLocation && this.pin.pixelLocation.length === 2) {
      this.drawMarker(this.pin.pixelLocation[0], this.pin.pixelLocation[1]);
      this.findCP();
    }
    else {
      this.resetZoom();
    }

  }

  onReady (data) {

    // noop... set by application
  }

  onMark (data) {

    // noop... set by application
  }

  onMarkClick (data) {

    // noop... set by application
  }

  onMarkDelete (data) {

    // noop... set by application
  }

  onZoomReset (data) {

    // noop... set by application
  }

  onZoomToMark (data) {

    // noop... set by application
  }

  resetDimentions() {

    if (this.cartesianSystem) {
      this.width = parseFloat(this.cartesianSystem.style('width'));
      this.height = parseFloat(this.cartesianSystem.style('height'));
    }
  }
}

export default ModelTrainerImageMarker;
