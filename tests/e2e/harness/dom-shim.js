// Generated with AI assistance (Google Antigravity). Reviewed by the team.

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Lightweight DOM, Canvas 2D, and Event simulation for Node.js E2E testing.
 * Provides realistic pixel data generation, landmark semantics, and event bubbling.
 */

// Helper to parse CSS color strings into [r, g, b, a]
function parseColor(colorStr) {
  if (!colorStr) return [0, 0, 0, 255];
  const s = String(colorStr).trim().toLowerCase();
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return [r, g, b, 255];
    } else if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b, 255];
    }
  }
  const rgbMatch = s.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    const a = rgbMatch[4] !== undefined ? Math.min(255, Math.max(0, Math.round(parseFloat(rgbMatch[4]) * 255))) : 255;
    return [r, g, b, a];
  }
  if (s === 'white') return [255, 255, 255, 255];
  if (s === 'black') return [0, 0, 0, 255];
  if (s === 'red') return [255, 0, 0, 255];
  if (s === 'green') return [0, 255, 0, 255];
  if (s === 'blue') return [0, 0, 255, 255];
  if (s === 'yellow') return [255, 255, 0, 255];
  return [128, 128, 128, 255];
}

export class Event {
  constructor(type, eventInitDict = {}) {
    this.type = type;
    this.bubbles = !!eventInitDict.bubbles;
    this.cancelable = !!eventInitDict.cancelable;
    this.defaultPrevented = false;
    this.target = null;
    this.currentTarget = null;
    this._propagationStopped = false;
  }
  preventDefault() {
    if (this.cancelable) this.defaultPrevented = true;
  }
  stopPropagation() {
    this._propagationStopped = true;
  }
}

export class CustomEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.detail = eventInitDict.detail || null;
  }
}

export class KeyboardEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, { bubbles: true, cancelable: true, ...eventInitDict });
    this.key = eventInitDict.key || '';
    this.code = eventInitDict.code || '';
    this.altKey = !!eventInitDict.altKey;
    this.ctrlKey = !!eventInitDict.ctrlKey;
    this.shiftKey = !!eventInitDict.shiftKey;
    this.metaKey = !!eventInitDict.metaKey;
    this.repeat = !!eventInitDict.repeat;
  }
}

export class MouseEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, { bubbles: true, cancelable: true, ...eventInitDict });
    this.clientX = eventInitDict.clientX || 0;
    this.clientY = eventInitDict.clientY || 0;
    this.button = eventInitDict.button || 0;
    this.buttons = eventInitDict.buttons || 0;
    this.shiftKey = !!eventInitDict.shiftKey;
    this.ctrlKey = !!eventInitDict.ctrlKey;
    this.altKey = !!eventInitDict.altKey;
    this.metaKey = !!eventInitDict.metaKey;
  }
}

export class TouchEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, { bubbles: true, cancelable: true, ...eventInitDict });
    this.touches = eventInitDict.touches || [];
    this.targetTouches = eventInitDict.targetTouches || [];
    this.changedTouches = eventInitDict.changedTouches || [];
  }
}

export class ImageData {
  constructor(widthOrData, height, settings) {
    if (widthOrData instanceof Uint8ClampedArray) {
      this.data = widthOrData;
      this.width = height;
      this.height = this.data.length / (this.width * 4);
    } else {
      this.width = widthOrData;
      this.height = height;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    }
  }
}

export class CanvasRenderingContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.font = '10px sans-serif';
    this.textAlign = 'start';
    this.textBaseline = 'alphabetic';
    this.globalAlpha = 1.0;
    this._drawCalls = [];
  }

  _ensureBuffer() {
    return this.canvas._getBuffer();
  }

  fillRect(x, y, w, h) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    this._drawCalls.push({ type: 'fillRect', x, y, w, h, fillStyle: this.fillStyle, alpha: this.globalAlpha });

    const buffer = this._ensureBuffer();
    const [r, g, b, a] = parseColor(this.fillStyle);
    const alpha = (a / 255) * this.globalAlpha;
    const effR = Math.round(r * alpha);
    const effG = Math.round(g * alpha);
    const effB = Math.round(b * alpha);
    const effA = Math.round(alpha * 255);

    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const startX = Math.max(0, x);
    const startY = Math.max(0, y);
    const endX = Math.min(canvasW, x + w);
    const endY = Math.min(canvasH, y + h);

    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const idx = (py * canvasW + px) * 4;
        buffer[idx] = effR;
        buffer[idx + 1] = effG;
        buffer[idx + 2] = effB;
        buffer[idx + 3] = effA;
      }
    }
  }

  clearRect(x, y, w, h) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    this._drawCalls.push({ type: 'clearRect', x, y, w, h });

    const buffer = this._ensureBuffer();
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const startX = Math.max(0, x);
    const startY = Math.max(0, y);
    const endX = Math.min(canvasW, x + w);
    const endY = Math.min(canvasH, y + h);

    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const idx = (py * canvasW + px) * 4;
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
      }
    }
  }

  strokeRect(x, y, w, h) {
    this._drawCalls.push({ type: 'strokeRect', x, y, w, h, strokeStyle: this.strokeStyle });
  }

  beginPath() {
    this._drawCalls.push({ type: 'beginPath' });
  }

  moveTo(x, y) {
    this._drawCalls.push({ type: 'moveTo', x, y });
  }

  lineTo(x, y) {
    this._drawCalls.push({ type: 'lineTo', x, y });
  }

  stroke() {
    this._drawCalls.push({ type: 'stroke', strokeStyle: this.strokeStyle });
  }

  fill() {
    this._drawCalls.push({ type: 'fill', fillStyle: this.fillStyle });
  }

  arc(x, y, radius, startAngle, endAngle, counterclockwise) {
    this._drawCalls.push({ type: 'arc', x, y, radius, startAngle, endAngle });
  }

  closePath() {
    this._drawCalls.push({ type: 'closePath' });
  }

  fillText(text, x, y) {
    this._drawCalls.push({ type: 'fillText', text, x, y, fillStyle: this.fillStyle });
  }

  strokeText(text, x, y) {
    this._drawCalls.push({ type: 'strokeText', text, x, y, strokeStyle: this.strokeStyle });
  }

  drawImage(image, ...args) {
    this._drawCalls.push({ type: 'drawImage', image, args });
    const buffer = this._ensureBuffer();
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;

    let sx = 0, sy = 0, sw = 0, sh = 0, dx = 0, dy = 0, dw = 0, dh = 0;
    if (args.length === 2) {
      [dx, dy] = args;
      dw = image.width || image.naturalWidth || canvasW;
      dh = image.height || image.naturalHeight || canvasH;
      sw = dw;
      sh = dh;
    } else if (args.length === 4) {
      [dx, dy, dw, dh] = args;
      sw = image.width || image.naturalWidth || dw;
      sh = image.height || image.naturalHeight || dh;
    } else if (args.length >= 8) {
      [sx, sy, sw, sh, dx, dy, dw, dh] = args;
    }

    const srcBuffer = image._getBuffer ? image._getBuffer() : (image._pixelData || null);
    if (!srcBuffer) {
      // Generate standard gradient / luminance if image has no direct pixels
      const fillW = Math.min(canvasW, Math.round(dx + dw));
      const fillH = Math.min(canvasH, Math.round(dy + dh));
      for (let py = Math.max(0, Math.round(dy)); py < fillH; py++) {
        for (let px = Math.max(0, Math.round(dx)); px < fillW; px++) {
          const idx = (py * canvasW + px) * 4;
          const u = px / canvasW;
          const v = py / canvasH;
          buffer[idx] = Math.round(255 * u);
          buffer[idx + 1] = Math.round(255 * (1 - v));
          buffer[idx + 2] = Math.round(180 * (u + v) * 0.5);
          buffer[idx + 3] = 255;
        }
      }
      return;
    }

    const srcW = image.width || image.naturalWidth || sw;
    const srcH = image.height || image.naturalHeight || sh;
    for (let py = 0; py < dh; py++) {
      const destY = Math.round(dy + py);
      if (destY < 0 || destY >= canvasH) continue;
      const srcY = Math.min(srcH - 1, Math.floor(sy + (py * sh) / dh));

      for (let px = 0; px < dw; px++) {
        const destX = Math.round(dx + px);
        if (destX < 0 || destX >= canvasW) continue;
        const srcX = Math.min(srcW - 1, Math.floor(sx + (px * sw) / dw));

        const srcIdx = (srcY * srcW + srcX) * 4;
        const destIdx = (destY * canvasW + destX) * 4;

        buffer[destIdx] = srcBuffer[srcIdx];
        buffer[destIdx + 1] = srcBuffer[srcIdx + 1];
        buffer[destIdx + 2] = srcBuffer[srcIdx + 2];
        buffer[destIdx + 3] = srcBuffer[srcIdx + 3];
      }
    }
  }

  getImageData(sx, sy, sw, sh) {
    sx = Math.round(sx);
    sy = Math.round(sy);
    sw = Math.round(sw);
    sh = Math.round(sh);

    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const buffer = this._ensureBuffer();
    const resultData = new Uint8ClampedArray(sw * sh * 4);

    for (let y = 0; y < sh; y++) {
      const srcY = sy + y;
      for (let x = 0; x < sw; x++) {
        const srcX = sx + x;
        const targetIdx = (y * sw + x) * 4;

        if (srcX >= 0 && srcX < canvasW && srcY >= 0 && srcY < canvasH) {
          const srcIdx = (srcY * canvasW + srcX) * 4;
          resultData[targetIdx] = buffer[srcIdx];
          resultData[targetIdx + 1] = buffer[srcIdx + 1];
          resultData[targetIdx + 2] = buffer[srcIdx + 2];
          resultData[targetIdx + 3] = buffer[srcIdx + 3];
        } else {
          resultData[targetIdx] = 0;
          resultData[targetIdx + 1] = 0;
          resultData[targetIdx + 2] = 0;
          resultData[targetIdx + 3] = 0;
        }
      }
    }

    return new ImageData(resultData, sw);
  }

  putImageData(imageData, dx, dy) {
    dx = Math.round(dx);
    dy = Math.round(dy);
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const buffer = this._ensureBuffer();

    for (let y = 0; y < imageData.height; y++) {
      const destY = dy + y;
      if (destY < 0 || destY >= canvasH) continue;
      for (let x = 0; x < imageData.width; x++) {
        const destX = dx + x;
        if (destX < 0 || destX >= canvasW) continue;
        const srcIdx = (y * imageData.width + x) * 4;
        const destIdx = (destY * canvasW + destX) * 4;
        buffer[destIdx] = imageData.data[srcIdx];
        buffer[destIdx + 1] = imageData.data[srcIdx + 1];
        buffer[destIdx + 2] = imageData.data[srcIdx + 2];
        buffer[destIdx + 3] = imageData.data[srcIdx + 3];
      }
    }
  }

  save() { this._drawCalls.push({ type: 'save' }); }
  restore() { this._drawCalls.push({ type: 'restore' }); }
  translate(x, y) { this._drawCalls.push({ type: 'translate', x, y }); }
  scale(x, y) { this._drawCalls.push({ type: 'scale', x, y }); }
  rotate(angle) { this._drawCalls.push({ type: 'rotate', angle }); }
  setTransform(a, b, c, d, e, f) { this._drawCalls.push({ type: 'setTransform', a, b, c, d, e, f }); }
  resetTransform() { this._drawCalls.push({ type: 'resetTransform' }); }
}

class DOMTokenList {
  constructor(element) {
    this._element = element;
    this._tokens = new Set();
  }
  _syncFromAttr() {
    const cls = this._element.getAttribute('class') || '';
    this._tokens.clear();
    cls.split(/\s+/).filter(Boolean).forEach(t => this._tokens.add(t));
  }
  _syncToAttr() {
    this._element.setAttribute('class', Array.from(this._tokens).join(' '));
  }
  add(...tokens) {
    this._syncFromAttr();
    tokens.forEach(t => this._tokens.add(t));
    this._syncToAttr();
  }
  remove(...tokens) {
    this._syncFromAttr();
    tokens.forEach(t => this._tokens.delete(t));
    this._syncToAttr();
  }
  contains(token) {
    this._syncFromAttr();
    return this._tokens.has(token);
  }
  toggle(token, force) {
    this._syncFromAttr();
    if (force !== undefined) {
      if (force) this._tokens.add(token);
      else this._tokens.delete(token);
    } else {
      if (this._tokens.has(token)) this._tokens.delete(token);
      else this._tokens.add(token);
    }
    this._syncToAttr();
    return this.contains(token);
  }
  toString() {
    this._syncFromAttr();
    return Array.from(this._tokens).join(' ');
  }
}

export class HTMLElement {
  constructor(tagName, ownerDocument = null) {
    this.tagName = String(tagName).toUpperCase();
    this.nodeName = this.tagName;
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.parentElement = null;
    this.childNodes = [];
    this.children = [];
    this._attributes = new Map();
    this._listeners = new Map();
    this.classList = new DOMTokenList(this);
    this.dataset = new Proxy({}, {
      get: (_, prop) => {
        const attrName = 'data-' + String(prop).replace(/([A-Z])/g, '-$1').toLowerCase();
        return this.getAttribute(attrName);
      },
      set: (_, prop, val) => {
        const attrName = 'data-' + String(prop).replace(/([A-Z])/g, '-$1').toLowerCase();
        this.setAttribute(attrName, String(val));
        return true;
      }
    });
    this.style = {
      display: '',
      visibility: '',
      color: '',
      backgroundColor: '',
      opacity: '',
      transform: '',
      width: '',
      height: '',
      setProperty: (prop, val) => { this.style[prop] = String(val); },
      getPropertyValue: (prop) => this.style[prop] || ''
    };
  }

  getAttribute(name) {
    return this._attributes.has(name) ? this._attributes.get(name) : null;
  }

  setAttribute(name, value) {
    const strVal = String(value);
    this._attributes.set(name, strVal);
  }

  removeAttribute(name) {
    this._attributes.delete(name);
  }

  hasAttribute(name) {
    return this._attributes.has(name);
  }

  get id() { return this.getAttribute('id') || ''; }
  set id(val) { this.setAttribute('id', val); }

  get className() { return this.getAttribute('class') || ''; }
  set className(val) { this.setAttribute('class', val); }

  get role() { return this.getAttribute('role') || ''; }
  set role(val) { this.setAttribute('role', val); }

  get ariaLive() { return this.getAttribute('aria-live') || ''; }
  set ariaLive(val) { this.setAttribute('aria-live', val); }

  get ariaLabel() { return this.getAttribute('aria-label') || ''; }
  set ariaLabel(val) { this.setAttribute('aria-label', val); }

  get tabIndex() {
    const val = this.getAttribute('tabindex');
    return val !== null ? parseInt(val, 10) : -1;
  }
  set tabIndex(val) { this.setAttribute('tabindex', String(val)); }

  get hidden() {
    return this.hasAttribute('hidden') || this._hidden === true;
  }
  set hidden(val) {
    this._hidden = !!val;
    if (val) this.setAttribute('hidden', '');
    else this.removeAttribute('hidden');
  }

  get value() {
    return this.getAttribute('value') ?? this._value ?? '';
  }
  set value(val) {
    this._value = String(val);
    this.setAttribute('value', String(val));
  }

  get clientWidth() {
    return parseInt(this.style.width || '100', 10);
  }
  get clientHeight() {
    return parseInt(this.style.height || '100', 10);
  }

  get textContent() {
    let text = '';
    for (const child of this.childNodes) {
      if (child.nodeType === 3) text += child.nodeValue;
      else if (child.textContent) text += child.textContent;
    }
    return text;
  }
  set textContent(val) {
    this.childNodes = [];
    this.children = [];
    const textNode = { nodeType: 3, nodeValue: String(val), parentNode: this };
    this.childNodes.push(textNode);
  }

  get innerText() { return this.textContent; }
  set innerText(val) { this.textContent = val; }

  get innerHTML() {
    // Basic innerHTML serializer
    return this.childNodes.map(child => {
      if (child.nodeType === 3) return child.nodeValue;
      if (child.outerHTML) return child.outerHTML;
      return child.textContent || '';
    }).join('');
  }
  set innerHTML(htmlStr) {
    this.childNodes = [];
    this.children = [];
    if (!htmlStr) return;
    const ownerDoc = this.ownerDocument || (globalThis.document || null);
    if (ownerDoc) {
      const nodes = parseHtmlToNodes(htmlStr, ownerDoc);
      for (const node of nodes) {
        this.appendChild(node);
      }
    } else {
      this.textContent = String(htmlStr).replace(/<[^>]+>/g, '');
    }
  }

  get outerHTML() {
    const tag = this.tagName.toLowerCase();
    const attrs = Array.from(this._attributes.entries())
      .map(([k, v]) => ` ${k}="${v}"`)
      .join('');
    return `<${tag}${attrs}>${this.innerHTML}</${tag}>`;
  }

  appendChild(child) {
    if (child.parentNode) {
      child.parentNode.removeChild(child);
    }
    child.parentNode = this;
    child.parentElement = this;
    this.childNodes.push(child);
    if (child instanceof HTMLElement) {
      this.children.push(child);
    }
    return child;
  }

  removeChild(child) {
    const idx = this.childNodes.indexOf(child);
    if (idx !== -1) {
      this.childNodes.splice(idx, 1);
      child.parentNode = null;
      child.parentElement = null;
    }
    const cIdx = this.children.indexOf(child);
    if (cIdx !== -1) {
      this.children.splice(cIdx, 1);
    }
    return child;
  }

  replaceChild(newChild, oldChild) {
    const idx = this.childNodes.indexOf(oldChild);
    if (idx !== -1) {
      this.removeChild(oldChild);
      this.childNodes.splice(idx, 0, newChild);
      newChild.parentNode = this;
      newChild.parentElement = this;
      if (newChild instanceof HTMLElement && !this.children.includes(newChild)) {
        this.children.push(newChild);
      }
    }
    return oldChild;
  }

  contains(otherNode) {
    if (otherNode === this) return true;
    let curr = otherNode ? otherNode.parentNode : null;
    while (curr) {
      if (curr === this) return true;
      curr = curr.parentNode;
    }
    return false;
  }

  addEventListener(type, listener, options) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    this._listeners.get(type).add(listener);
  }

  removeEventListener(type, listener, options) {
    if (this._listeners.has(type)) {
      this._listeners.get(type).delete(listener);
    }
  }

  dispatchEvent(event) {
    event.target = this;
    let curr = this;
    while (curr && !event._propagationStopped) {
      event.currentTarget = curr;
      const listeners = curr._listeners.get(event.type);
      if (listeners) {
        for (const listener of Array.from(listeners)) {
          try {
            if (typeof listener === 'function') {
              listener.call(curr, event);
            } else if (listener && typeof listener.handleEvent === 'function') {
              listener.handleEvent(event);
            }
          } catch (err) {
            console.error('Error in event listener:', err);
          }
        }
      }
      if (!event.bubbles) break;
      curr = curr.parentNode;
    }
    return !event.defaultPrevented;
  }

  click() {
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    this.dispatchEvent(ev);
  }

  focus() {
    if (this.ownerDocument) {
      this.ownerDocument.activeElement = this;
    }
  }

  blur() {
    if (this.ownerDocument && this.ownerDocument.activeElement === this) {
      this.ownerDocument.activeElement = this.ownerDocument.body;
    }
  }

  querySelector(selector) {
    return querySelectorSingle(this, selector);
  }

  querySelectorAll(selector) {
    return querySelectorAll(this, selector);
  }

  getElementById(id) {
    return querySelectorSingle(this, `#${id}`);
  }

  getElementsByClassName(className) {
    return querySelectorAll(this, `.${className}`);
  }

  getElementsByTagName(tagName) {
    return querySelectorAll(this, tagName.toLowerCase());
  }

  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      bottom: parseInt(this.style.height || '100', 10),
      right: parseInt(this.style.width || '100', 10),
      width: parseInt(this.style.width || '100', 10),
      height: parseInt(this.style.height || '100', 10),
      x: 0,
      y: 0
    };
  }
}

export class HTMLCanvasElement extends HTMLElement {
  constructor(ownerDocument = null) {
    super('CANVAS', ownerDocument);
    this._width = 300;
    this._height = 150;
    this._ctx = null;
    this._buffer = null;
  }

  get width() { return this._width; }
  set width(val) {
    const num = parseInt(val, 10) || 0;
    if (num !== this._width) {
      this._width = num;
      this._buffer = null;
    }
  }

  get height() { return this._height; }
  set height(val) {
    const num = parseInt(val, 10) || 0;
    if (num !== this._height) {
      this._height = num;
      this._buffer = null;
    }
  }

  setAttribute(name, value) {
    super.setAttribute(name, value);
    if (name === 'width') {
      this.width = parseInt(value, 10) || 0;
    } else if (name === 'height') {
      this.height = parseInt(value, 10) || 0;
    }
  }

  get clientWidth() { return this._width; }
  get clientHeight() { return this._height; }

  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      bottom: this._height,
      right: this._width,
      width: this._width,
      height: this._height,
      x: 0,
      y: 0
    };
  }

  _getBuffer() {
    if (!this._buffer || this._buffer.length !== this._width * this._height * 4) {
      this._buffer = new Uint8ClampedArray(this._width * this._height * 4);
    }
    return this._buffer;
  }

  getContext(contextType) {
    if (contextType === '2d') {
      if (!this._ctx) {
        this._ctx = new CanvasRenderingContext2D(this);
      }
      return this._ctx;
    }
    return null;
  }
}

export class HTMLImageElement extends HTMLElement {
  constructor(ownerDocument = null) {
    super('IMG', ownerDocument);
    this._src = '';
    this.alt = '';
    this._width = 1600;
    this._height = 900;
    this.naturalWidth = 1600;
    this.naturalHeight = 900;
    this.complete = true;
    this.onload = null;
    this.onerror = null;
    this._pixelData = null;
    this._generateDefaultPixels();
  }

  get src() { return this._src; }
  set src(val) {
    this._src = String(val);
    this.setAttribute('src', this._src);
    // Simulate async image load event
    queueMicrotask(() => {
      if (typeof this.onload === 'function') {
        const ev = new Event('load');
        ev.target = this;
        this.onload(ev);
      }
      this.dispatchEvent(new Event('load'));
    });
  }

  get width() { return this._width; }
  set width(v) {
    const num = parseInt(v, 10) || 0;
    if (num !== this._width) {
      this._width = num;
      this.naturalWidth = num;
      this._generateDefaultPixels();
    }
  }

  get height() { return this._height; }
  set height(v) {
    const num = parseInt(v, 10) || 0;
    if (num !== this._height) {
      this._height = num;
      this.naturalHeight = num;
      this._generateDefaultPixels();
    }
  }

  _generateDefaultPixels() {
    const w = this.naturalWidth;
    const h = this.naturalHeight;
    this._pixelData = new Uint8ClampedArray(w * h * 4);
    // Fill with gradient and realistic bright spots for testing analyzers
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const normX = x / w;
        const normY = y / h;
        // background level
        const base = Math.floor(40 + 30 * Math.sin(normX * Math.PI));
        this._pixelData[idx] = base;
        this._pixelData[idx + 1] = Math.floor(base * 0.8);
        this._pixelData[idx + 2] = Math.floor(base * 1.2);
        this._pixelData[idx + 3] = 255;
      }
    }
    // Add 3 bright blobs for blob detection tests
    const blobs = [
      { x: Math.floor(w * 0.25), y: Math.floor(h * 0.3), r: 15 },
      { x: Math.floor(w * 0.6), y: Math.floor(h * 0.4), r: 25 },
      { x: Math.floor(w * 0.8), y: Math.floor(h * 0.7), r: 20 }
    ];
    for (const b of blobs) {
      for (let dy = -b.r; dy <= b.r; dy++) {
        for (let dx = -b.r; dx <= b.r; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= b.r) {
            const px = b.x + dx;
            const py = b.y + dy;
            if (px >= 0 && px < w && py >= 0 && py < h) {
              const idx = (py * w + px) * 4;
              const intensity = Math.floor(255 * (1 - dist / b.r));
              this._pixelData[idx] = Math.max(this._pixelData[idx], intensity);
              this._pixelData[idx + 1] = Math.max(this._pixelData[idx + 1], intensity);
              this._pixelData[idx + 2] = Math.max(this._pixelData[idx + 2], intensity);
            }
          }
        }
      }
    }
  }

  setImagePixels(pixelGeneratorOrBuffer) {
    if (typeof pixelGeneratorOrBuffer === 'function') {
      const w = this.naturalWidth;
      const h = this.naturalHeight;
      this._pixelData = new Uint8ClampedArray(w * h * 4);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const [r, g, b, a = 255] = pixelGeneratorOrBuffer(x, y, w, h);
          this._pixelData[idx] = r;
          this._pixelData[idx + 1] = g;
          this._pixelData[idx + 2] = b;
          this._pixelData[idx + 3] = a;
        }
      }
    } else if (pixelGeneratorOrBuffer instanceof Uint8ClampedArray) {
      this._pixelData = pixelGeneratorOrBuffer;
    }
  }
}

// Selector matching helper
function matchesSelector(element, selector) {
  if (!element || !(element instanceof HTMLElement)) return false;
  selector = selector.trim();
  if (selector === '*') return true;
  // ID selector
  if (selector.startsWith('#')) {
    return element.id === selector.slice(1);
  }
  // Class selector
  if (selector.startsWith('.')) {
    return element.classList.contains(selector.slice(1));
  }
  // Attribute selector [attr=val] or [attr]
  if (selector.startsWith('[') && selector.endsWith(']')) {
    const inner = selector.slice(1, -1);
    if (inner.includes('=')) {
      const [attr, val] = inner.split('=');
      const cleanVal = val.replace(/^["']|["']$/g, '');
      return element.getAttribute(attr.trim()) === cleanVal;
    }
    return element.hasAttribute(inner.trim());
  }
  // Tag selector
  if (element.tagName.toLowerCase() === selector.toLowerCase()) {
    return true;
  }
  return false;
}

function querySelectorSingle(root, selector) {
  const parts = selector.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const queue = [root];
    while (queue.length > 0) {
      const node = queue.shift();
      if (node !== root && matchesSelector(node, selector)) {
        return node;
      }
      if (node.children) {
        for (const child of node.children) {
          queue.push(child);
        }
      }
    }
    return null;
  }
  // Multi-part descendant selector (e.g. "header h1")
  const allMatches = querySelectorAll(root, selector);
  return allMatches.length > 0 ? allMatches[0] : null;
}

function querySelectorAll(root, selector) {
  const parts = selector.split(/\s+/).filter(Boolean);
  let candidates = [root];

  for (const part of parts) {
    const nextCandidates = [];
    for (const parent of candidates) {
      const queue = parent === root ? [...root.children] : [...parent.children];
      while (queue.length > 0) {
        const node = queue.shift();
        if (matchesSelector(node, part)) {
          nextCandidates.push(node);
        }
        if (node.children) {
          queue.push(...node.children);
        }
      }
    }
    candidates = nextCandidates;
  }

  return candidates;
}

export class Document extends HTMLElement {
  constructor() {
    super('#DOCUMENT');
    this.ownerDocument = this;
    this.documentElement = new HTMLElement('HTML', this);
    this.head = new HTMLElement('HEAD', this);
    this.body = new HTMLElement('BODY', this);
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
    this.activeElement = this.body;
  }

  createElement(tagName) {
    const tag = String(tagName).toUpperCase();
    if (tag === 'CANVAS') return new HTMLCanvasElement(this);
    if (tag === 'IMG') return new HTMLImageElement(this);
    return new HTMLElement(tag, this);
  }
}

export class Window {
  constructor() {
    this.document = new Document();
    this.document.defaultView = this;
    this._listeners = new Map();
    this.localStorage = new MockStorage();
    this.sessionStorage = new MockStorage();
    this.location = {
      href: 'http://localhost:8000/',
      protocol: 'http:',
      host: 'localhost:8000',
      pathname: '/',
      search: '',
      hash: ''
    };
    this.navigator = {
      userAgent: 'Mozilla/5.0 (Node.js E2E Test Runner)',
      language: 'en-US'
    };
    this._prefersReducedMotion = false;
    this._prefersColorScheme = 'dark';
  }

  addEventListener(type, listener) {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(listener);
  }

  removeEventListener(type, listener) {
    if (this._listeners.has(type)) this._listeners.get(type).delete(listener);
  }

  dispatchEvent(event) {
    event.target = this;
    const listeners = this._listeners.get(event.type);
    if (listeners) {
      for (const listener of Array.from(listeners)) {
        try {
          if (typeof listener === 'function') listener.call(this, event);
        } catch (err) {
          console.error('Window listener error:', err);
        }
      }
    }
    return !event.defaultPrevented;
  }

  matchMedia(query) {
    const self = this;
    const isReducedMotion = query.includes('prefers-reduced-motion');
    const isDarkMode = query.includes('prefers-color-scheme') && query.includes('dark');
    return {
      get matches() {
        if (isReducedMotion) return self._prefersReducedMotion;
        if (isDarkMode) return self._prefersColorScheme === 'dark';
        return false;
      },
      media: query,
      addEventListener(type, cb) {},
      removeEventListener(type, cb) {}
    };
  }

  requestAnimationFrame(callback) {
    return setTimeout(() => callback(Date.now()), 16);
  }

  cancelAnimationFrame(id) {
    clearTimeout(id);
  }
}

class MockStorage {
  constructor() { this._items = new Map(); }
  getItem(key) { return this._items.has(key) ? this._items.get(key) : null; }
  setItem(key, val) { this._items.set(key, String(val)); }
  removeItem(key) { this._items.delete(key); }
  clear() { this._items.clear(); }
  get length() { return this._items.size; }
}

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const TAG_REGEX = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9-]+)((?:\s+[^=>\s/]+(?:=(?:\"[^\"]*\"|'[^']*'|[^>\s/]+))?)*)\s*(\/)?>|([^<]+)/g;

/**
 * Parses an HTML string into an array of DOM nodes using a lightweight tokenizer.
 * @param {string} htmlStr
 * @param {Document} doc
 * @returns {Array<HTMLElement|object>}
 */
export function parseHtmlToNodes(htmlStr, doc = globalThis.document) {
  const root = doc && typeof doc.createElement === 'function' ? doc.createElement('div') : new HTMLElement('DIV', doc);
  const stack = [root];
  TAG_REGEX.lastIndex = 0;
  let match;

  while ((match = TAG_REGEX.exec(htmlStr)) !== null) {
    const [full, isClosing, tagName, attrStr, isSelfClosing, textContent] = match;
    if (full.startsWith('<!--')) continue;
    if (textContent && textContent.trim()) {
      const textNode = { nodeType: 3, nodeValue: textContent };
      stack[stack.length - 1].appendChild(textNode);
      continue;
    }
    if (!tagName) continue;
    const tagLower = tagName.toLowerCase();
    if (tagLower === '!doctype' || tagLower === 'html' || tagLower === 'head' || tagLower === 'body') continue;

    if (isClosing) {
      if (stack.length > 1 && stack[stack.length - 1].tagName.toLowerCase() === tagLower) {
        stack.pop();
      }
    } else {
      const el = doc && typeof doc.createElement === 'function' ? doc.createElement(tagLower) : new HTMLElement(tagLower.toUpperCase(), doc);
      if (attrStr) {
        const attrRegex = /([a-zA-Z0-9-:_]+)(?:=(?:\"([^\"]*)\"|'([^']*)'|([^>\s]+)))?/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
          const attrName = attrMatch[1];
          const attrVal = attrMatch[2] !== undefined ? attrMatch[2] : (attrMatch[3] !== undefined ? attrMatch[3] : (attrMatch[4] !== undefined ? attrMatch[4] : ''));
          el.setAttribute(attrName, attrVal);
        }
      }
      stack[stack.length - 1].appendChild(el);
      if (!VOID_TAGS.has(tagLower) && !isSelfClosing) {
        stack.push(el);
      }
    }
  }
  return [...root.childNodes];
}

/**
 * Mounts an HTML fixture into doc.body.
 * @param {string} htmlStr
 * @param {Document} doc
 */
export function loadHtmlFixture(htmlStr, doc = globalThis.document) {
  if (!doc || !doc.body) return;
  doc.body.childNodes = [];
  doc.body.children = [];
  const nodes = parseHtmlToNodes(htmlStr, doc);
  for (const node of nodes) {
    doc.body.appendChild(node);
  }
}

/**
 * Initializes global browser DOM simulation on globalThis.
 */
export function setupDomShim() {
  const win = new Window();
  const originalGlobals = {
    window: globalThis.window,
    document: globalThis.document,
    HTMLElement: globalThis.HTMLElement,
    HTMLCanvasElement: globalThis.HTMLCanvasElement,
    HTMLImageElement: globalThis.HTMLImageElement,
    ImageData: globalThis.ImageData,
    Event: globalThis.Event,
    CustomEvent: globalThis.CustomEvent,
    KeyboardEvent: globalThis.KeyboardEvent,
    MouseEvent: globalThis.MouseEvent,
    TouchEvent: globalThis.TouchEvent,
    matchMedia: globalThis.matchMedia,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    cancelAnimationFrame: globalThis.cancelAnimationFrame,
    Image: globalThis.Image,
    fetch: globalThis.fetch
  };

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function shimFetch(input, init) {
    const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : String(input));
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://') || urlStr.startsWith('file://')) {
      if (originalFetch) return originalFetch(input, init);
    }
    const resolvedPath = resolve(process.cwd(), urlStr.replace(/^\//, ''));
    if (existsSync(resolvedPath)) {
      const content = readFileSync(resolvedPath, 'utf-8');
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () => content,
        json: async () => JSON.parse(content),
        blob: async () => new Blob([content])
      };
    }
    if (originalFetch) return originalFetch(input, init);
    throw new Error(`File not found at relative path: ${resolvedPath}`);
  };

  globalThis.window = win;
  globalThis.document = win.document;
  globalThis.HTMLElement = HTMLElement;
  globalThis.HTMLCanvasElement = HTMLCanvasElement;
  globalThis.HTMLImageElement = HTMLImageElement;
  globalThis.ImageData = ImageData;
  globalThis.Event = Event;
  globalThis.CustomEvent = CustomEvent;
  globalThis.KeyboardEvent = KeyboardEvent;
  globalThis.MouseEvent = MouseEvent;
  globalThis.TouchEvent = TouchEvent;
  globalThis.matchMedia = win.matchMedia.bind(win);
  globalThis.requestAnimationFrame = win.requestAnimationFrame.bind(win);
  globalThis.cancelAnimationFrame = win.cancelAnimationFrame.bind(win);
  globalThis.Image = HTMLImageElement;

  return {
    window: win,
    document: win.document,
    teardown: () => {
      for (const [k, v] of Object.entries(originalGlobals)) {
        if (v === undefined) delete globalThis[k];
        else globalThis[k] = v;
      }
    }
  };
}
