// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Image analysis and pixel statistics coordinator for ORBIS VOX.
 * Analyzes rendered canvas/image frames for sonification parameters,
 * bright blob detection, and normalized frame differencing.
 */

import { quantizePitch } from './audio-engine.js';

/**
 * Converts RGB [0, 255] values to HSV components.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {{ h: number, s: number, v: number }} h in [0, 360], s in [0, 1], v in [0, 1]
 */
export function rgbToHsv(r, g, b) {
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;
  const max = Math.max(normR, normG, normB);
  const min = Math.min(normR, normG, normB);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    if (max === normR) {
      h = ((normG - normB) / delta) % 6;
    } else if (max === normG) {
      h = (normB - normR) / delta + 2;
    } else {
      h = (normR - normG) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s, v };
}

/**
 * Analyzes a loaded HTMLImageElement or HTMLCanvasElement across 32 columns x 12 rows.
 * @param {HTMLImageElement|HTMLCanvasElement} imageElement
 * @returns {Object} Frame analysis statistics and column data
 */
export function analyzeFrame(imageElement) {
  if (!imageElement) {
    return {
      width: 0,
      height: 0,
      litFraction: 0.0,
      meanBrightness: 0.0,
      meanHue: 0.0,
      meanSaturation: 0.0,
      brightBlobs: [],
      columnData: []
    };
  }

  const rawWidth = imageElement.naturalWidth || imageElement.width || 0;
  const rawHeight = imageElement.naturalHeight || imageElement.height || 0;

  if (rawWidth <= 0 || rawHeight <= 0) {
    return {
      width: rawWidth,
      height: rawHeight,
      litFraction: 0.0,
      meanBrightness: 0.0,
      meanHue: 0.0,
      meanSaturation: 0.0,
      brightBlobs: [],
      columnData: []
    };
  }

  const sampleW = Math.min(rawWidth, 320);
  const sampleH = Math.min(rawHeight, 180);

  let canvas = null;
  let ctx = null;

  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    canvas = document.createElement('canvas');
    canvas.width = sampleW;
    canvas.height = sampleH;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
  }

  if (!ctx) {
    return {
      width: rawWidth,
      height: rawHeight,
      litFraction: 0.0,
      meanBrightness: 0.0,
      meanHue: 0.0,
      meanSaturation: 0.0,
      brightBlobs: [],
      columnData: []
    };
  }

  let litFraction = 0.0;
  let meanBrightness = 0.0;
  let meanHue = 0.0;
  let meanSaturation = 0.0;
  const brightBlobs = [];
  const columnData = [];

  try {
    ctx.drawImage(imageElement, 0, 0, sampleW, sampleH);
    const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = imgData.data;
    const totalPixels = sampleW * sampleH;

    let litCount = 0;
    let totalLum = 0;
    let totalHue = 0;
    let totalSat = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      totalLum += lum;
      if (lum > 0.15) litCount++;

      const hsv = rgbToHsv(r, g, b);
      totalHue += hsv.h;
      totalSat += hsv.s;
    }

    litFraction = totalPixels > 0 ? litCount / totalPixels : 0.0;
    meanBrightness = totalPixels > 0 ? totalLum / totalPixels : 0.0;
    meanHue = totalPixels > 0 ? totalHue / totalPixels : 0.0;
    meanSaturation = totalPixels > 0 ? totalSat / totalPixels : 0.0;

    // Detect candidate bright blobs (up to 8 peak points)
    const stepX = Math.max(1, Math.floor(sampleW / 8));
    const stepY = Math.max(1, Math.floor(sampleH / 8));
    const candidateBlobs = [];

    for (let bx = Math.floor(stepX / 2); bx < sampleW; bx += stepX) {
      for (let by = Math.floor(stepY / 2); by < sampleH; by += stepY) {
        const pIdx = (by * sampleW + bx) * 4;
        const bLum = (data[pIdx] * 0.2126 + data[pIdx + 1] * 0.7152 + data[pIdx + 2] * 0.0722) / 255;
        if (bLum > 0.35) {
          candidateBlobs.push({
            x: bx / sampleW,
            y: by / sampleH,
            brightness: bLum
          });
        }
      }
    }

    // Sort candidate blobs descending by brightness and take top 8
    candidateBlobs.sort((a, b) => b.brightness - a.brightness);
    for (let i = 0; i < Math.min(8, candidateBlobs.length); i++) {
      brightBlobs.push(candidateBlobs[i]);
    }

    // Generate 32 columns with 12 sample points each
    const cols = 32;
    const rows = 12;
    for (let c = 0; c < cols; c++) {
      const colPoints = [];
      const colX = Math.min(sampleW - 1, Math.floor((c / cols) * sampleW));
      for (let r = 0; r < rows; r++) {
        const rowY = Math.min(sampleH - 1, Math.floor((r / rows) * sampleH));
        const idx = (rowY * sampleW + colX) * 4;
        const red = data[idx];
        const green = data[idx + 1];
        const blue = data[idx + 2];
        const lum = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
        const hsv = rgbToHsv(red, green, blue);
        const yNorm = r / rows;

        colPoints.push({
          y: yNorm,
          luminance: lum,
          hue: hsv.h,
          saturation: hsv.s,
          scalePitchHz: quantizePitch(yNorm, 'A minor pentatonic')
        });
      }
      columnData.push({
        colIndex: c,
        points: colPoints
      });
    }
  } catch (err) {
    console.warn('Frame analysis fallback due to error:', err);
  }

  return {
    width: rawWidth,
    height: rawHeight,
    litFraction,
    meanBrightness,
    meanHue,
    meanSaturation,
    brightBlobs,
    columnData
  };
}

/**
 * Computes normalized frame difference between two consecutive frames in [0.0, 1.0].
 * @param {HTMLCanvasElement|HTMLImageElement} frameA
 * @param {HTMLCanvasElement|HTMLImageElement} frameB
 * @returns {number} Normalized difference metric in [0.0, 1.0]
 */
export function computeFrameDiff(frameA, frameB) {
  if (!frameA || !frameB) return 0.0;
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    return 0.0;
  }

  const sampleW = 64;
  const sampleH = 36;
  const canvas = document.createElement('canvas');
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0.0;

  try {
    ctx.drawImage(frameA, 0, 0, sampleW, sampleH);
    const dataA = ctx.getImageData(0, 0, sampleW, sampleH).data;

    ctx.clearRect(0, 0, sampleW, sampleH);
    ctx.drawImage(frameB, 0, 0, sampleW, sampleH);
    const dataB = ctx.getImageData(0, 0, sampleW, sampleH).data;

    let diffSum = 0;
    const totalPixels = sampleW * sampleH;
    for (let i = 0; i < dataA.length; i += 4) {
      const lumA = dataA[i] * 0.2126 + dataA[i + 1] * 0.7152 + dataA[i + 2] * 0.0722;
      const lumB = dataB[i] * 0.2126 + dataB[i + 1] * 0.7152 + dataB[i + 2] * 0.0722;
      diffSum += Math.abs(lumA - lumB);
    }
    const normalized = diffSum / (totalPixels * 255);
    return Math.max(0.0, Math.min(1.0, normalized));
  } catch (err) {
    return 0.0;
  }
}
