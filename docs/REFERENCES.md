# References & Attributions

This document logs all NASA data sources, scientific visualizations, external specifications, and standards utilized in ORBIS VOX. In accordance with the NASA Space Apps Challenge 2026 rules and NASA Media Usage Guidelines, all assets are credited to their respective NASA creators and scientific teams.

---

## 1. NASA Earth Information Center / Scientific Visualization Studio Datasets

### 1.1 Track: `night-lights` — Change in Night Lights between 2012 and 2023
- **Resource Title**: Change in Night Lights between 2012 and 2023 (EIC Version)
- **NASA SVS Identifier**: SVS #5313 (and related SVS #5276)
- **Canonical URL**: https://svs.gsfc.nasa.gov/5313/
- **Related Studio URL**: https://svs.gsfc.nasa.gov/5276/
- **Credit Line**:
  NASA's Scientific Visualization Studio. Visualizer: Kel Elkins (USRA). Scientists: Zhuosen Wang (University of Maryland), Miguel Román (Leidos), Ranjay Shrestha (SSAI), Srija Chakraborty (USRA), Virginia Kalb (NASA/GSFC).
- **Instruments / Missions**:
  Visible Infrared Imaging Radiometer Suite (VIIRS) Day-Night Band (DNB) aboard the Suomi NPP and NOAA-20 satellites; NASA Black Marble product suite.
- **Data Description**:
  Global flat map visualization depicting annual night light averages from 2012 to 2023, transitioning into a decadal difference map where purple regions indicate increased nighttime illumination and orange regions indicate diminished illumination.
- **Colorbar / Legend Source**:
  Authentic NASA SVS colorbar extracted from SVS #5276: `nightlights_change_colorbar_print.jpg`.
- **Data License / Use Policy**:
  NASA media is in the public domain and generally not subject to copyright in the United States, used under NASA Media and Information Usage Guidelines.

---

### 1.2 Track: `lightning` — Lightning Events Detected from the International Space Station (ISS)
- **Resource Title**: Lightning Events Detected from the International Space Station (ISS) 2017-2023
- **NASA SVS Identifier**: SVS #5011
- **Canonical URL**: https://svs.gsfc.nasa.gov/5011/
- **Credit Line**:
  NASA's Scientific Visualization Studio. Visualizers: Michala Garrison (SSAI), Greg Shirah (NASA/GSFC), Kel Elkins (USRA), Alex Kekesi (Global Science and Technology, Inc.).
- **Instruments / Missions**:
  Lightning Imaging Sensor (LIS) on the International Space Station (ISS).
- **Data Description**:
  Global distribution of lightning strikes detected between January 2017 and July 2023 using the final quality-controlled science dataset with a 10-day roving window illustrating seasonal storm patterns across tropical and temperate latitudes.
- **Data License / Use Policy**:
  Public domain; NASA Media and Information Usage Guidelines.

---

### 1.3 Track: `currents` — Perpetual Ocean 2: Western Boundary Currents
- **Resource Title**: Perpetual Ocean 2: Western Boundary Currents
- **NASA SVS Identifier**: SVS #5425
- **Canonical URL**: https://svs.gsfc.nasa.gov/5425/
- **Credit Line**:
  NASA's Scientific Visualization Studio. Visualizers: Greg Shirah (NASA/GSFC), Horace Mitchell (NASA/GSFC). Technical Support: Laurence Schuler (ADNET Systems, Inc.), Ian Jones (ADNET Systems, Inc.). Scientists: Atousa Saberi (NASA/GSFC), Josh Willis (NASA/JPL). Producer: Kathleen Gaeta (Advocates in Manpower Management, Inc.).
- **Instruments / Missions**:
  Estimating the Circulation and Climate of the Ocean, Phase II (ECCO2) high-resolution ocean and sea-ice model synthesis; NASA Jet Propulsion Laboratory (JPL) & Goddard Space Flight Center (GSFC).
- **Data Description**:
  High-resolution 3D velocity field particle trails depicting western boundary currents including the Kuroshio Current, the Agulhas Current retroflection and rings, and the Gulf Stream.
- **Data License / Use Policy**:
  Public domain; NASA Media and Information Usage Guidelines.

---

### 1.4 Track: `co2` — DYAMOND Global Carbon Dioxide
- **Resource Title**: DYAMOND Global Carbon Dioxide
- **NASA SVS Identifier**: SVS #5196
- **Canonical URL**: https://svs.gsfc.nasa.gov/5196/
- **Credit Line**:
  NASA's Scientific Visualization Studio. Visualizers: AJ Christensen (SSAI), Greg Shirah (NASA/GSFC), Helen-Nicole Kostis (USRA), Mark SubbaRao (NASA/GSFC). Technical Support: Laurence Schuler (ADNET Systems, Inc.), Ian Jones (ADNET Systems, Inc.). Scientists: Lesley Ott (NASA/GSFC), Brad Weir (Morgan State University), William Putman (NASA/GSFC), Tomohiro Oda (USRA/EfSI).
- **Instruments / Missions**:
  GEOS (Goddard Earth Observing System) high-resolution atmospheric model simulation; DYAMOND (Dynamics of the Atmospheric general circulation Modeled On Non-hydrostatic Domains) project.
- **Data Description**:
  Ultra-high-resolution 3D visualization showing global atmospheric concentrations of carbon dioxide (ppm) transporting across the globe from January through March 2020 driven by weather patterns and atmospheric winds.
- **Colorbar / Legend Source**:
  Authentic NASA SVS colorbar extracted from SVS #5196: `dyamondCbar_6-27-2024a_print.jpg`.
- **Data License / Use Policy**:
  Public domain; NASA Media and Information Usage Guidelines.

---

## 2. Conceptual & Sonification References

- **Data Sonification: Caldwell 73**:
  NASA demonstration of mapping visual brightness/luminosity to audio volume and spatial coordinates to pitch. Cited as conceptual reference in sonification methodology.
  URL: https://chandra.si.edu/sound/
- **Web Audio API Specification (W3C)**:
  Recommendation for modular synthesis, `DynamicsCompressorNode`, `AudioContext`, and `OfflineAudioContext`.
  URL: https://www.w3.org/TR/webaudio/
- **Web Content Accessibility Guidelines (WCAG) 2.2 AA**:
  W3C accessibility standards for focus management, keyboard operability, ARIA live regions, and minimum contrast ratios.
  URL: https://www.w3.org/TR/WCAG22/

---

## 3. Third-Party Runtime Dependencies

- **Runtime JavaScript Libraries**: None (0 dependencies). All audio synthesis, image processing, accessibility management, and UI logic are implemented directly in native vanilla JavaScript.
- **Runtime CSS Frameworks**: None. Vanilla CSS with modern custom properties.
- **External Fonts / CDNs**: None. System font stack with robust fallbacks (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `Roboto`, sans-serif) to ensure 100% offline functionality and zero network latency.
- **Third-Party Media / Logos**: None. No NASA logos, meatball, worm, mission patches, or third-party proprietary trademarks have been added to any part of the application.
