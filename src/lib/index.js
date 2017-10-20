'use strict';

// TODO
// const d3 = Object.assign({},
//   require("d3-axis"),
//   require('d3-transform'),
//   require('d3-transition'),
//   require("d3-zoom"),
//   require("d3-selection"),
//   require("d3-scale")
// );

const d3 = require('d3');

const kScaleMin = .09;
const kScaleMax = 20;
const kScaleLocate = 2;
const kMarkSize = 38;
const kMarkShadowSize = 9;

/**
 * @Class ModelTrainerImageMarker class used to provide pan, zoom, and mark capabilities
 *
 * Methods:
 * boot (4)
 * destroy ()
 */

class ModelTrainerImageMarker {
  constructor(id) {

    this.cpId = id;
    this.imgId;
    this.target;
    this.pin;
    this.mark;
    this.events;
    this.width;
    this.height;

    this.cartesianSystem;
    this.hasPin = false;
  }

  boot(img, imgId, target, objects, mark, events) {

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

    this._init();
  }

  configure(options) {
    options = options || {};
    if (options.targetIcon) {
      this.targetIcon = options.targetIcon;
    }
  }

  // Zooms backwards to a hollistic perspective
  resetZoom(delay) {

    if (!delay) {
      delay = 0;
    }
    const scaledWidth = this.img.width * kScaleMin;
    const scaledHeight = this.img.height * kScaleMin;
    const x = (this.width - scaledWidth) / 2;
    const y = (this.height - scaledHeight) / 2;
    this.cartesianSystem.transition()
      .duration(delay)
      .call(this._zoomStrat().transform, d3.zoomIdentity.translate(x, y).scale(kScaleMin));
    this.events.onZoomReset ? this.events.onZoomReset() : this.onZoomReset();
  }

  // Cleans DOM and D3 Nodes / Listeners
  destroy() {

    if (!this.cartesianSystem) {
      return;
    }
    this.cartesianSystem.selectAll('*').remove();
    this.cartesianSystem = null;
    this.img = '';
    return null;
  }


  // Marks a pixel location on the system w.r.t. transformation and scale, uneditable marker
  drawStatic(x, y, context) {
    // draw static object
    const z = d3.zoomTransform(this.cartesianSystem.node()).k;
    if (x > 0 && y > 0) {
      this.mark = this.CanvasArea.append('circle')
        .attr('id', context.cpId)
        .attr('class', 'control-point-static')
        .attr('dr', kMarkShadowSize)
        .attr('r', kMarkShadowSize / z)
        .attr('cx', x )
        .attr('cy', y )
        .on('mouseover', (d) => {

          return this.tip
            .style('left', d3.event.pageX - 30 + 'px')
            .style('top', d3.event.pageY - 50 + 'px')
            .style('display', 'inline-block')
            .style('visibility', 'visible')
            .html('<h6 class="bold no-margin">' + context.name + '</h6>');
        })
        .on('mousemove', (d) => {

          return this.tip
            .style('left', d3.event.pageX - 30 + 'px')
            .style('top', d3.event.pageY - 50 + 'px')
            .style('display', 'inline-block')
            .html('<h6 class="bold no-margin">' + context.name + '</h6>');
        })
        .on('mouseout', (d) => {

          return this.tip.style('visibility', 'hidden');
        })
        .on('click', (d, i) => {

          d3.event.stopPropagation();
          this.events.onMarkClick ? this.events.onMarkClick({ photoId: this.imgId, cpId: context.cpId }) : this.onMarkClick({ photoId: this.imgId, cpId: context.cpId });
        });
    }
  }

  reDrawMarker() {

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
          .attr('id', this.cpId)
          .attr('xlink:href', this.targetIcon)
          .attr('class', 'control-point')
          .attr('width', kMarkSize / z)
          .attr('height', kMarkSize / z)
          .attr('x', x - (kMarkSize / z / 2) )
          .attr('y', y - (kMarkSize / z / 2));
      }
      else {
        this.mark = this.CanvasArea.append('circle')
          .attr('id', this.cpId)
          .attr('class', 'control-point')
          .attr('dr', kMarkShadowSize)
          .attr('r', kMarkShadowSize / z)
          .attr('cx', x )
          .attr('cy', y );
      }

      this.CanvasArea.append('circle')
        .attr('class', 'shadow')
        .attr('dr', kMarkShadowSize)
        .attr('r', kMarkShadowSize / z)
        .attr('cx', x )
        .attr('cy', y );
    }
  }

  // Marks a pixel location on the system w.r.t. transformation and scale
  drawMarker(x, y) {

    if (!this.CanvasArea) {
      return;
    }
    // draw pin on mouse click

    this.CanvasArea.selectAll('use.control-point').remove();
    this.CanvasArea.selectAll('circle.control-point').remove();
    this.CanvasArea.selectAll('circle.shadow').remove();
    if (!x && !y) {
      const mouse = d3.mouse(d3.event.currentTarget);
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
          .attr('id', this.cpId)
          .attr('xlink:href', this.targetIcon)
          .attr('class', 'control-point')
          .attr('width', kMarkSize / z)
          .attr('height', kMarkSize / z)
          .attr('x', x - (kMarkSize / z / 2) )
          .attr('y', y - (kMarkSize / z / 2));
      }
      else {
        this.mark = this.CanvasArea.append('circle')
          .attr('id', this.cpId)
          .attr('class', 'control-point')
          .attr('dr', kMarkShadowSize)
          .attr('r', kMarkShadowSize / z)
          .attr('cx', x )
          .attr('cy', y );
      }

      this.CanvasArea.append('circle')
        .attr('class', 'shadow')
        .attr('dr', kMarkShadowSize)
        .attr('r', kMarkShadowSize / z)
        .attr('cx', x )
        .attr('cy', y );

      this.events.onMark ? this.events.onMark({ photoId: this.imgId, cpId: this.cpId, x, y }) : this.onMark({ photoId: this.imgId, cpId: this.cpId, x, y });

    }
  }

  // Erases the marked location from the system
  clearMarker() {

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

    this.events.onMarkDelete ? this.events.onMarkDelete({ photoId: this.imgId, cpId: this.cpId }) : this.onMarkDelete({ photoId: this.imgId, cpId: this.cpId });
  }

  // Locates and zooms gradually to the Point of Interest
  findCP(delay) {

    if (!delay) {
      delay = 0;
    }

    if (this.pin && this.pin.pixelLocation && this.pin.pixelLocation.length === 2) {
      const x = (this.width / 2) - this.pin.pixelLocation[0] * kScaleLocate;
      const y = (this.height / 2) - this.pin.pixelLocation[1] * kScaleLocate;
      this.cartesianSystem.transition()
        .duration(delay)
        .call(this._zoomStrat().transform, d3.zoomIdentity.translate(x, y).scale(kScaleLocate));
    }
    else {
      this.resetZoom(750);
    }

    this.events.onZoomToCP ? this.events.onZoomToCP() : this.onZoomToCP();

  }

  // Incrementally Zoom in
  zoomIn() {

    const z = d3.zoomTransform(this.cartesianSystem.node()).k;
    const x = d3.zoomTransform(this.cartesianSystem.node()).x * z - this.width * z / 2;
    const y = d3.zoomTransform(this.cartesianSystem.node()).y * z - this.height * z / 2;
    this.cartesianSystem.transition()
      .duration(375)
      .call(this._zoomStrat().transform, d3.zoomIdentity.translate(x, y).scale(z * 2));
  }

  // Incrementally Zoom Out
  zoomOut() {

    const z = d3.zoomTransform(this.cartesianSystem.node()).k;
    const x = d3.zoomTransform(this.cartesianSystem.node()).x * z - this.width * z / 2;
    const y = d3.zoomTransform(this.cartesianSystem.node()).y * z - this.height * z / 2;
    this.cartesianSystem.transition()
      .duration(375)
      .call(this._zoomStrat().transform, d3.zoomIdentity.translate(x, y).scale(z / 2));
  }

  // Method that governs zoom behavior
  _zoomStrat() {

    return d3.zoom()
      .scaleExtent([kScaleMin, kScaleMax])
      //.translateExtent([[ -this.img.width / 2, -this.img.height / 2  ], [ this.img.width * 1.5,  this.img.height * 1.5 ]])
      .on('zoom', () => {

        this.CanvasArea.attr('transform', d3.event.transform);
        this.pX.call(this.xAxis.scale(d3.event.transform.rescaleX(this.xScale)));
        this.pY.call(this.yAxis.scale(d3.event.transform.rescaleY(this.yScale)));
        if (d3.event.transform) {
          // Resize the marker icon
          this.CanvasArea.selectAll('use.control-point')
            .each(function(d) {
              const cp = d3.select(this);
              let k = d3.event.transform.k;
              let dWidth = (parseFloat(cp.attr('width')) - kMarkSize / k) / 2;
              let dHeight = (parseFloat(cp.attr('height')) - kMarkSize / k) / 2;
              let x = parseFloat(cp.attr('x')) + dWidth;
              let y = parseFloat(cp.attr('y')) + dHeight;
              cp.attr('width', kMarkSize / k)
              cp.attr('height', kMarkSize / k)
              cp.attr('x', x)
              cp.attr('y', y);
            });
          this.CanvasArea.selectAll('circle.control-point')
            .each(function(d) {
              const cp = d3.select(this);
              let z = d3.event.transform.k;
              if (cp.attr('dr')) {
                z = cp.attr('dr') / z;
              }
              cp.attr('r', z);
            });
          this.CanvasArea.selectAll('circle.shadow')
            .each(function(d) {
              const cp = d3.select(this);
              let z = d3.event.transform.k;
              if (cp.attr('dr')) {
                z = cp.attr('dr') / z;
              }
              cp.attr('r', z);
            });
          this.CanvasArea.selectAll('circle.control-point-static')
            .each(function(d) {
              const cp = d3.select(this);
              let z = d3.event.transform.k;
              if (cp.attr('dr')) {
                z = cp.attr('dr') / z;
              }
              cp.attr('r', z);
            });
        }
      });
  }

  // Initialize System
  _init() {

    // X Scaling Behavior
    this.xScale = d3.scaleLinear()
      .domain([-1,  this.img.width + 1])
      .range([-1,  this.img.width + 1]);

    // Y Scaling Behavior
    this.yScale = d3.scaleLinear()
      .domain([-1,  this.img.height + 1])
      .range([-1,  this.img.height + 1]);

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
    d3.selectAll('#d3-tooltip').remove();
    this.tip = d3.select('body')
      .append('div')
      .attr('id', 'd3-tooltip');

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
    //this.cartesianSystem.call(this.tip.bind(this));
    this.resetZoom.bind(this);
    this.events.onReady ? this.events.onReady(this.cpId) : this.onReady(this.cpId);
    if (this.objects && this.objects.length) {
      this.objects.forEach((object) => {
        this.drawStatic(object.xPos, object.yPos, object);
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

  onReady(data) {
    // noop... set by application
  }

  onMark(data) {
    // noop... set by application
  }

  onMarkClick(data) {
    // noop... set by application
  }

  onMarkDelete(data) {
    // noop... set by application
  }

  onZoomReset(data) {
    // noop... set by application
  }

  onZoomToCP(data) {
    // noop... set by application
  }

  resetDimentions() {

    if (this.cartesianSystem) {
      this.width = parseFloat(this.cartesianSystem.style('width'));
      this.height = parseFloat(this.cartesianSystem.style('height'));
    }
  }
}

module.exports = ModelTrainerImageMarker;
