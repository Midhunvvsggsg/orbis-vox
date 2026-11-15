# NASA data sources (official Resources list for the challenge)

NASA does not endorse non-U.S. Government websites. Follow each site's data-use terms. The page URLs are not in this file: find each one by title using the EIC Content Database / Scientific Visualization Studio (SVS) search, then record the exact URL and the license/credit line in the table and in `docs/REFERENCES.md`.

| Track id | Resource title | Why it suits sonification | Priority | Exact URL | Credit line |
|---|---|---|---|---|---|
| night-lights | Change in Night Lights between 2012 and 2023 (EIC version) | High contrast, brightness maps to rhythm/tempo | CORE | https://svs.gsfc.nasa.gov/5313/ | NASA SVS. Visualizer: Kel Elkins. Scientists: Zhuosen Wang, Miguel Román, Ranjay Shrestha, Srija Chakraborty, Virginia Kalb. |
| lightning | Lightning Events Detected from the ISS 2017-2023 | Flashes map to percussive triggers | CORE | https://svs.gsfc.nasa.gov/5011/ | NASA SVS. Visualizers: Michala Garrison, Greg Shirah, Kel Elkins, Alex Kekesi. |
| currents | Perpetual Ocean 2: Western Boundary Currents | High contrast flow, drives evolving pad and rhythm | CORE | https://svs.gsfc.nasa.gov/5425/ | NASA SVS. Visualizers: Greg Shirah, Horace Mitchell. Scientists: Atousa Saberi, Josh Willis. |
| co2 | DYAMOND Global Carbon Dioxide | CO2 intensity over time, harmonic tension | CORE | https://svs.gsfc.nasa.gov/5196/ | NASA SVS. Visualizers: AJ Christensen, Greg Shirah, Helen-Nicole Kostis, Mark SubbaRao. Scientists: Lesley Ott, Brad Weir, William Putman, Tomohiro Oda. |
| aerosols | GEOS Aerosols | Multiple aerosol types become multi-track instruments | STRETCH | https://svs.gsfc.nasa.gov/5115/ | NASA SVS. Visualizer: Kel Elkins. |
| forest | GEDI Forest Height | Canopy-height color spectrum to pitch and rhythm | STRETCH | https://svs.gsfc.nasa.gov/5092/ | NASA SVS. Visualizer: Alex Kekesi. |
| sst | Global Sea Surface Currents and Temperature | Temperature to pitch, motion to texture | STRETCH | https://svs.gsfc.nasa.gov/3912/ | NASA SVS. Visualizer: Horace Mitchell. |
| airq | Air Quality Model Runs (SVS frames) | Downloadable high-res frames | STRETCH | https://svs.gsfc.nasa.gov/11494/ | NASA SVS. Visualizer: Greg Shirah. |
| river | A 3D View of an Atmospheric River from an Earth System Model | Moisture density and spread to texture | STRETCH | https://svs.gsfc.nasa.gov/4548/ | NASA SVS. Visualizer: Greg Shirah. |

Conceptual reference (cite in method text, no frames needed): **Data Sonification: Caldwell 73**, NASA's example of mapping luminosity to volume and spatial position to pitch.

## Acquisition rules
1. Prefer SVS/EIC downloadable stills or video. If video, extract 8 to 24 evenly spaced frames per track with `ffmpeg` if installed (`ffmpeg -i in.mp4 -vf "fps=1,scale=1600:-1" -q:v 4 frame_%03d.jpg`), then sample down to what the track needs.
2. Store under `assets/frames/<track-id>/`, JPG, max 1600 px wide.
3. Save the colorbar/legend frame separately as `legend.jpg` when one exists. It is used to document the approximate color-to-value mapping.
4. If the network or a download fails, STOP and list exactly which files I need to download manually, with the source page names. Do not substitute fake data.
5. If a frame contains a NASA logo burned into the video, leave the NASA media unmodified. Do not add or recreate logos anywhere in our own UI.
