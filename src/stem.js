// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements the `Stem` object. Generally this object is handled
// by its parent `StemmableNote`.

import { Vex } from './vex';
import { Flow } from './tables';

// To enable logging for this class. Set `Vex.Flow.Stem.DEBUG` to `true`.
function L(...args) { if (Stem.DEBUG) Vex.L('Vex.Flow.Stem', args); }

export class Stem {
  static get CATEGORY() { return 'stem'; }

  // Stem directions
  static get UP() {
    return 1;
  }
  static get DOWN() {
    return -1;
  }

  // Theme
  static get WIDTH() {
    return Flow.STEM_WIDTH;
  }
  static get HEIGHT() {
    return Flow.STEM_HEIGHT;
  }

  constructor(options = {}) {
    // Default notehead x bounds
    this.x_begin = options.x_begin || 0;
    this.x_end = options.x_end || 0;

    // Y bounds for top/bottom most notehead
    this.y_top = options.y_top || 0;
    this.y_bottom = options.y_bottom || 0;

    // Stem base extension
    this.y_extend = options.y_extend || 0;
    // Stem top extension
    this.stem_extension = options.stem_extension || 0;

    // Direction of the stem
    this.stem_direction = options.stem_direction || 0;

    // Flag to override all draw calls
    this.hide = options.hide || false;

    this.isStemlet = options.isStemlet || false;
    this.stemletHeight = options.stemletHeight || 0;
  }

  // Set the x bounds for the default notehead
  setNoteHeadXBounds(x_begin, x_end) {
    this.x_begin = x_begin;
    this.x_end = x_end;
    return this;
  }

  // Set the direction of the stem in relation to the noteheads
  setDirection(direction) { this.stem_direction = direction; }

  // Set the extension for the stem, generally for flags or beams
  setExtension(ext) { this.stem_extension = ext; }
  getExtension() { return this.stem_extension; }

  // The the y bounds for the top and bottom noteheads
  setYBounds(y_top, y_bottom) {
    this.y_top = y_top;
    this.y_bottom = y_bottom;
  }

  // The category of the object
  getCategory() { return Stem.CATEGORY; }

  // Set the canvas context to render on
  setContext(context) { this.context = context; return this; }

  // Gets the entire height for the stem
  getHeight() {
    return ((this.y_bottom - this.y_top) * this.stem_direction) +
           ((Stem.HEIGHT + this.stem_extension) * this.stem_direction);
  }
  getBoundingBox() {
    throw new Vex.RERR('NotImplemented', 'getBoundingBox() not implemented.');
  }

  // Get the y coordinates for the very base of the stem to the top of
  // the extension
  getExtents() {
    const isStemUp = this.stem_direction === Stem.UP;
    const ys = [this.y_top, this.y_bottom];
    const stemHeight = Stem.HEIGHT + this.stem_extension;
    const innerMostNoteheadY = (isStemUp ? Math.min : Math.max)(...ys);
    const outerMostNoteheadY = (isStemUp ? Math.max : Math.min)(...ys);
    const stemTipY = innerMostNoteheadY + (stemHeight * -this.stem_direction);

    return { topY: stemTipY, baseY: outerMostNoteheadY };
  }

  // set the draw style of a stem:
  setStyle(style) { this.style = style; return this; }
  getStyle() { return this.style; }

  setVisibility(isVisible) {
    this.hide = !isVisible;
    return this;
  }

  setStemlet(isStemlet, stemletHeight) {
    this.isStemlet = isStemlet;
    this.stemletHeight = stemletHeight;
    return this;
  }

  // Apply current style to Canvas `context`
  applyStyle(context) {
    const style = this.getStyle();
    if (style) {
      if (style.shadowColor) context.setShadowColor(style.shadowColor);
      if (style.shadowBlur) context.setShadowBlur(style.shadowBlur);
      if (style.strokeStyle) context.setStrokeStyle(style.strokeStyle);
    }
    return this;
  }

  // Render the stem onto the canvas
  draw() {
    if (!this.context) {
      throw new Vex.RERR('NoCanvasContext', "Can't draw without a canvas context.");
    }

    if (this.hide) return;

    const ctx = this.context;
    let stem_x;
    let stem_y;
    const stem_direction = this.stem_direction;

    if (stem_direction === Stem.DOWN) {
      // Down stems are rendered to the left of the head.
      stem_x = this.x_begin;
      stem_y = this.y_top;
    } else {
      // Up stems are rendered to the right of the head.
      stem_x = this.x_end;
      stem_y = this.y_bottom;
    }

    stem_y += this.y_extend * stem_direction;

    const stemHeight = this.getHeight() + -this.y_extend * -stem_direction;

    L('Rendering stem - ', 'Top Y: ', this.y_top, 'Bottom Y: ', this.y_bottom);

    // The offset from the stem's base which is required fo satisfy the stemlet height
    const stemletYOffset = this.isStemlet
      ? stemHeight - this.stemletHeight * this.stem_direction
      : 0;

    // Draw the stem
    ctx.save();
    this.applyStyle(ctx);
    ctx.beginPath();
    ctx.setLineWidth(Stem.WIDTH);
    ctx.moveTo(stem_x, stem_y - stemletYOffset);
    ctx.lineTo(stem_x, stem_y - stemHeight);
    ctx.stroke();
    ctx.restore();
  }
}
