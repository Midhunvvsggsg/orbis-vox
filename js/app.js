// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Main Application Coordinator for ORBIS VOX: The Earth Jukebox.
 * Loads tracks.json, manages UI interactions, audio playback,
 * probe explore mode, tour sequence, and client-side WAV export.
 */

import { AudioEngine } from './audio-engine.js';
import { analyzeFrame } from './image-analysis.js';
import { initAccessibility, announceLive } from './a11y.js';
import { exportTrackToWav, getWavExportFilename } from './export-wav.js';

export class OrbisVoxApp {
  constructor() {
    this.tracks = [];
    this.currentTrackIndex = 0;
    this.currentFrameIndex = 0;
    this.audioEngine = new AudioEngine();
    this.isExploreActive = false;
    this.probeX = 0.5;
    this.probeY = 0.5;
    this.isTourActive = false;
    this.tourTimer = null;
    this.tourStepIndex = 0;
    this.TOUR_STEP_DURATION_MS = 15000;
    this.TOUR_CAPTIONS = {
      'night-lights': 'Tour 1/4: Night Lights (2012–2023) — Plucked rhythm tempo scales with city illumination density.',
      'lightning': 'Tour 2/4: ISS Lightning (2017–2023) — Flash clusters trigger spatial Dorian pings and bursts.',
      'currents': 'Tour 3/4: Ocean Currents — 4-voice ambient pad drifts with oceanic hue and flow velocity.',
      'co2': 'Tour 4/4: Global CO2 Plume — Atmospheric emissions gather harmonic tension and resolve.'
    };
    this.loadedImages = new Map();

    // DOM Elements
    this.canvas = document.getElementById('visualizer-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.playheadLine = document.getElementById('playhead-line');
    this.probeMarker = document.getElementById('probe-marker');
    this.trackShelf = document.getElementById('track-list');
    this.playPauseBtn = document.getElementById('btn-play-pause');
    this.playPauseText = document.getElementById('play-pause-text');
    this.playPauseIcon = document.getElementById('play-pause-icon');
    this.prevBtn = document.getElementById('btn-prev');
    this.nextBtn = document.getElementById('btn-next');
    this.tourBtn = document.getElementById('btn-tour');
    this.exploreBtn = document.getElementById('btn-explore');
    this.exportWavBtn = document.getElementById('btn-export-wav');
    this.muteBtn = document.getElementById('btn-mute');
    this.volumeSlider = document.getElementById('volume-slider');
    this.timeScrubber = document.getElementById('time-scrubber');
    this.scrubberTime = document.getElementById('scrubber-time');
    this.frameDescText = document.getElementById('frame-desc-text');
    this.frameStatsText = document.getElementById('frame-stats-text');

    // Mapping Card Elements
    this.mapSource = document.getElementById('map-source');
    this.mapSee = document.getElementById('map-see');
    this.mapSound = document.getElementById('map-sound');
    this.mapScale = document.getElementById('map-scale');
    this.mapLimits = document.getElementById('map-limits');
    this.legendContainer = document.getElementById('legend-container');
    this.legendImg = document.getElementById('track-legend-img');

    // Modals & Navigation
    this.aboutBtn = document.getElementById('btn-about');
    this.aboutModal = document.getElementById('about-modal');
    this.modalClose = document.getElementById('modal-close');
    this.listenOnlyBtn = document.getElementById('btn-listen-only');
    this.tourCaptionBox = document.getElementById('tour-caption-box');
    this.tourCaptionText = document.getElementById('tour-caption-text');
  }

  async init(tracksData = null) {
    try {
      if (tracksData) {
        this.tracks = tracksData;
      } else {
        const response = await fetch('data/tracks.json');
        this.tracks = await response.json();
      }
      this.renderTrackShelf();
      this.setupEventListeners();
      this.setupAudioEngine();
      this.setupAccessibility();

      if (this.tracks.length > 0) {
        await this.selectTrack(0);
      }
    } catch (err) {
      console.error('Failed to initialize ORBIS VOX application:', err);
    }
  }

  renderTrackShelf() {
    if (!this.trackShelf) return;
    this.trackShelf.innerHTML = '';

    this.tracks.forEach((track, idx) => {
      const card = document.createElement('button');
      card.className = 'track-card';
      card.setAttribute('role', 'tab');
      card.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      card.setAttribute('aria-controls', 'visualizer-canvas');
      card.innerHTML = `
        <div class="track-card-title">${track.title}</div>
        <div class="track-card-meta">${track.category} &bull; SVS #${track.svsId}</div>
      `;
      card.addEventListener('click', () => {
        if (this.isTourActive) this.stopTour();
        this.selectTrack(idx);
      });
      this.trackShelf.appendChild(card);
    });
  }

  async selectTrack(index) {
    if (index < 0 || index >= this.tracks.length) return;
    this.currentTrackIndex = index;
    this.currentFrameIndex = 0;
    const track = this.tracks[index];

    // Update shelf tab states
    const cards = this.trackShelf.querySelectorAll('.track-card');
    cards.forEach((c, idx) => c.setAttribute('aria-selected', idx === index ? 'true' : 'false'));

    // Update Mapping Card
    if (this.mapSource) this.mapSource.textContent = track.mappingCard.source;
    if (this.mapSee) this.mapSee.textContent = track.mappingCard.whatYouSee;
    if (this.mapSound) this.mapSound.textContent = track.mappingCard.howItSounds;
    if (this.mapScale) this.mapScale.textContent = track.mappingCard.scaleAndTempo;
    if (this.mapLimits) this.mapLimits.textContent = track.mappingCard.limits;

    // Legend
    if (track.legend) {
      this.legendContainer.hidden = false;
      this.legendImg.src = track.legend;
    } else {
      this.legendContainer.hidden = true;
    }

    // Configure Audio Engine
    this.audioEngine.setTrack(track);

    // Load active frame
    await this.loadCurrentFrame();

    announceLive(`Selected record: ${track.title}. ${track.mappingCard.whatYouSee}`);
  }

  async loadCurrentFrame() {
    const track = this.tracks[this.currentTrackIndex];
    if (!track || !track.frames || !track.frames.length) return;

    const frameUrl = track.frames[this.currentFrameIndex];
    let img = this.loadedImages.get(frameUrl);

    if (!img) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = frameUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      this.loadedImages.set(frameUrl, img);
    }

    // Render to canvas
    if (this.ctx && img.complete && img.naturalWidth > 0) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);

      // Perform frame analysis
      const stats = analyzeFrame(img);
      this.audioEngine.setFrameData(stats);
      const litPercent = Math.round(stats.litFraction * 100);
      if (this.frameDescText) {
        this.frameDescText.textContent = `${track.title} — Frame ${this.currentFrameIndex + 1} of ${track.frames.length}.`;
      }
      if (this.frameStatsText) {
        this.frameStatsText.textContent = `Active illumination: ${litPercent}% of surface. Mean brightness: ${(stats.meanBrightness * 100).toFixed(1)}%.`;
      }
    }
  }

  async startTour() {
    if (this.isTourActive) {
      this.stopTour();
      return;
    }
    this.isTourActive = true;
    this.tourStepIndex = 0;
    if (this.tourBtn) {
      this.tourBtn.setAttribute('aria-pressed', 'true');
      this.tourBtn.textContent = 'Stop Tour';
    }
    if (this.tourCaptionBox) this.tourCaptionBox.hidden = false;
    await this.audioEngine.init();
    if (!this.audioEngine.isPlaying) {
      this.audioEngine.play();
      if (this.playPauseText) this.playPauseText.textContent = 'Pause';
      if (this.playPauseIcon) this.playPauseIcon.innerHTML = '&#10074;&#10074;';
    }
    await this.runTourStep(0);
  }

  async runTourStep(stepIdx) {
    if (!this.isTourActive) return;
    this.tourStepIndex = stepIdx;
    await this.selectTrack(stepIdx);
    const track = this.tracks[stepIdx];
    const caption = this.TOUR_CAPTIONS[track?.id] || `Tour ${stepIdx + 1}/4: ${track?.title}`;
    if (this.tourCaptionText) this.tourCaptionText.textContent = caption;
    announceLive(caption);

    this.tourTimer = setTimeout(async () => {
      if (!this.isTourActive) return;
      if (stepIdx + 1 < Math.min(4, this.tracks.length)) {
        await this.runTourStep(stepIdx + 1);
      } else {
        this.stopTour();
        announceLive('Tour completed.');
      }
    }, this.TOUR_STEP_DURATION_MS);
  }

  stopTour() {
    if (!this.isTourActive && !this.tourTimer) return;
    this.isTourActive = false;
    if (this.tourTimer) {
      clearTimeout(this.tourTimer);
      this.tourTimer = null;
    }
    if (this.tourBtn) {
      this.tourBtn.setAttribute('aria-pressed', 'false');
      this.tourBtn.textContent = 'Start 60s Tour';
    }
    if (this.tourCaptionBox) this.tourCaptionBox.hidden = true;
  }

  setupAudioEngine() {
    this.audioEngine.onTick(({ currentTime, progress }) => {
      // Move playhead
      if (this.playheadLine) {
        this.playheadLine.style.transform = `translateX(${progress * this.canvas.clientWidth}px)`;
      }

      // Update scrubber
      if (this.timeScrubber) {
        this.timeScrubber.value = Math.round(progress * 100);
      }
      if (this.scrubberTime) {
        const secs = Math.floor(currentTime);
        const frac = Math.floor((currentTime % 1) * 10);
        this.scrubberTime.textContent = `0:${secs < 10 ? '0' : ''}${secs}.${frac} / 0:14.0`;
      }
    });
  }

  setupEventListeners() {
    // Tour Mode button
    this.tourBtn?.addEventListener('click', () => {
      if (this.isTourActive) this.stopTour();
      else this.startTour();
    });

    // Play/Pause button
    this.playPauseBtn?.addEventListener('click', async () => {
      if (this.isTourActive) this.stopTour();
      await this.audioEngine.init();
      this.audioEngine.toggle();
      const isPlaying = this.audioEngine.isPlaying;
      if (this.playPauseText) this.playPauseText.textContent = isPlaying ? 'Pause' : 'Play';
      if (this.playPauseIcon) this.playPauseIcon.innerHTML = isPlaying ? '&#10074;&#10074;' : '&#9654;';
      announceLive(isPlaying ? 'Audio playing' : 'Audio paused');
    });

    // Prev / Next buttons
    this.prevBtn?.addEventListener('click', () => {
      if (this.isTourActive) this.stopTour();
      const prevIdx = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
      this.selectTrack(prevIdx);
    });

    this.nextBtn?.addEventListener('click', () => {
      if (this.isTourActive) this.stopTour();
      const nextIdx = (this.currentTrackIndex + 1) % this.tracks.length;
      this.selectTrack(nextIdx);
    });

    // Scrubber
    this.timeScrubber?.addEventListener('input', (e) => {
      if (this.isTourActive) this.stopTour();
      const fraction = parseFloat(e.target.value) / 100;
      this.audioEngine.seek(fraction);
      const track = this.tracks[this.currentTrackIndex];
      if (track && track.frames.length) {
        const targetFrame = Math.floor(fraction * (track.frames.length - 1));
        if (targetFrame !== this.currentFrameIndex) {
          this.currentFrameIndex = targetFrame;
          this.loadCurrentFrame();
        }
      }
    });

    // Volume & Mute
    this.volumeSlider?.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value) / 100;
      this.audioEngine.setVolume(vol);
    });

    this.muteBtn?.addEventListener('click', () => {
      const isMuted = !this.audioEngine.isMuted;
      this.audioEngine.setMute(isMuted);
      this.muteBtn.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
      this.muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
      announceLive(isMuted ? 'Audio muted' : 'Audio unmuted');
    });

    // Explore Mode Toggle
    this.exploreBtn?.addEventListener('click', () => {
      this.isExploreActive = !this.isExploreActive;
      this.exploreBtn.setAttribute('aria-pressed', this.isExploreActive ? 'true' : 'false');
      if (this.probeMarker) this.probeMarker.hidden = !this.isExploreActive;
      announceLive(this.isExploreActive ? 'Explore probe active. Use arrow keys to probe canvas.' : 'Explore probe deactivated.');
    });

    // Canvas click / probe exploration
    this.canvas?.addEventListener('click', async (e) => {
      if (!this.isExploreActive) return;
      await this.audioEngine.init();
      const rect = this.canvas.getBoundingClientRect();
      const xNorm = (e.clientX - rect.left) / rect.width;
      const yNorm = (e.clientY - rect.top) / rect.height;

      this.probeX = xNorm;
      this.probeY = yNorm;

      if (this.probeMarker) {
        this.probeMarker.style.left = `${xNorm * 100}%`;
        this.probeMarker.style.top = `${yNorm * 100}%`;
      }
      this.audioEngine.triggerProbe(xNorm, yNorm);
      announceLive(`Probe at ${(xNorm * 100).toFixed(0)}% horizontal, ${(yNorm * 100).toFixed(0)}% vertical.`);
    });

    // WAV Export
    this.exportWavBtn?.addEventListener('click', async () => {
      const track = this.tracks[this.currentTrackIndex];
      if (!track) return;
      announceLive(`Rendering WAV for ${track.title}...`);
      const wavBlob = await exportTrackToWav(track, this.canvas);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getWavExportFilename(track.id);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      announceLive(`Downloaded ${getWavExportFilename(track.id)}`);
    });

    // Listen-only toggle
    this.listenOnlyBtn?.addEventListener('click', () => {
      const isActive = document.body.classList.toggle('listen-only-active');
      this.listenOnlyBtn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      this.listenOnlyBtn.textContent = isActive ? 'Exit Listen-Only' : 'Listen-Only Mode';
      announceLive(isActive ? 'Listen-only mode enabled. Visual canvas hidden.' : 'Listen-only mode disabled.');
    });

    // About modal
    const closeModal = () => {
      if (this.aboutModal) {
        this.aboutModal.hidden = true;
        this.aboutBtn?.setAttribute('aria-expanded', 'false');
        this.aboutBtn?.focus();
      }
    };

    this.aboutBtn?.addEventListener('click', () => {
      if (this.aboutModal) {
        this.aboutModal.hidden = false;
        this.aboutBtn.setAttribute('aria-expanded', 'true');
        this.modalClose?.focus();
      }
    });

    this.modalClose?.addEventListener('click', closeModal);
    document.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.aboutModal && !this.aboutModal.hidden) {
        closeModal();
      }
    });
  }

  setupAccessibility() {
    initAccessibility({
      onPlayPause: () => this.playPauseBtn?.click(),
      onNext: () => this.nextBtn?.click(),
      onPrev: () => this.prevBtn?.click(),
      onExploreToggle: () => this.exploreBtn?.click(),
      onMute: () => this.muteBtn?.click(),
      onProbeMove: (dx, dy) => {
        if (!this.isExploreActive) return;
        this.probeX = Math.max(0, Math.min(1, (this.probeX !== undefined ? this.probeX : 0.5) + dx));
        this.probeY = Math.max(0, Math.min(1, (this.probeY !== undefined ? this.probeY : 0.5) + dy));
        if (this.probeMarker) {
          this.probeMarker.style.left = `${(this.probeX * 100).toFixed(1)}%`;
          this.probeMarker.style.top = `${(this.probeY * 100).toFixed(1)}%`;
        }
        this.audioEngine.triggerProbe(this.probeX, this.probeY);
        announceLive(`Probe at ${(this.probeX * 100).toFixed(0)}% horizontal, ${(this.probeY * 100).toFixed(0)}% vertical.`);
      },
      onDesc: () => {
        const track = this.tracks[this.currentTrackIndex];
        if (track) announceLive(`${track.title}. ${track.mappingCard.whatYouSee}`);
      },
      onVolume: (delta) => {
        const newVol = Math.max(0, Math.min(1, this.audioEngine.volume + delta));
        this.audioEngine.setVolume(newVol);
        if (this.volumeSlider) this.volumeSlider.value = Math.round(newVol * 100);
        announceLive(`Volume ${Math.round(newVol * 100)} percent`);
      }
    });
  }
}

// Bootstrap application on DOM load
window.addEventListener('DOMContentLoaded', () => {
  const app = new OrbisVoxApp();
  app.init();
});
