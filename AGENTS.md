# 🌾 AgroDrishti - Agent Reference & Implementation Guide

## 📌 Project Overview
AgroDrishti (*Photo खींचो, बीमारी भगाओ*) is an AI-powered foliar disease diagnosis application coupled with a 100% biological/organic treatment recommendation system for Indian farmers.

- **Stack**:
  - **Frontend**: React 18 + Vite + Tailwind CSS (`frontend/`)
  - **Backend**: Python Flask REST API (`backend/app.py`, port 5000)
  - **Deep Learning Model**: Convolutional Neural Network (CNN) trained with TensorFlow/Keras on `(150, 150, 3)` normalized leaf images.
  - **Biotech Database**: `model/bio_solutions.json` containing 3-step preparation, application, and prevention remedies in Hindi & English.

---

## 🎨 UI Design Standard: 21st.dev Reference Database
All frontend UI components, micro-interactions, animations, and visual layouts in this repository must adhere to the design engineering quality benchmarks found on **[https://21st.dev/](https://21st.dev/)**.

- **Website Reference**: `https://21st.dev/`
- **Markdown Twins API**: Append `.md` to any 21st.dev component URL (e.g., `https://21st.dev/mcp.md`, `https://21st.dev/@manuarora700/library/aceternity-ui.md`).
- **Core Design Patterns from 21st.dev**:
  1. **Laser Scanner & HUD Reticle**: Live scanning beam with corner brackets and telemetry for leaf inspection.
  2. **Interactive Disease Lens (Hover Magnifier)**: Aceternity/Cult UI lens magnifier over uploaded diseased leaves.
  3. **Bento Grid Dashboard**: High-contrast, glassmorphic cards with glowing border gradients.
  4. **Animated Voice Prescription Waveform**: Dynamic audio equalizer wave for Hindi/English speech synthesis.
  5. **Shimmer Buttons & Border Beams**: Premium glowing primary action buttons with tactile response.
  6. **Ambient Bio-Particle Atmosphere**: Floating pollen/spores micro-particles for dark and light modes.

Detailed guidelines are preserved in [ui-design-21st-dev.md](file:///c:/Users/HP/Downloads/Project/disease_detector/.agents/rules/ui-design-21st-dev.md).

---

## 🗺️ AgroDrishti Master Implementation Roadmap

### Phase 1: Mind-Blowing ("Crazy") UI Redesign (from 21st.dev)
- [ ] **Laser Reticle & Cyber-Organic Scanner HUD**: Upgrade `UploadSection.jsx` with an animated laser sweep line, sci-fi/organic corner brackets, and active camera guidance.
- [ ] **Interactive Disease Lens Magnifier**: Add a hover zoom lens component on leaf images so farmers can inspect leaf spots, chlorosis, and mildew in high detail.
- [ ] **21st.dev Bento Grid Analytics**: Transform `StatsBar.jsx` and `App.jsx` into a true modern bento layout with glowing border highlights.
- [ ] **Animated TTS Waveform Player**: Replace the simple audio button with a pulsing frequency waveform visualizer when speech is playing.
- [ ] **Shimmer & Border-Beam CTA Buttons**: Upgrade the "बीमारी की जांच करें" button to use glowing border sweep animations.

### Phase 2: Farmer Utility & Field Practicality
- [ ] **WhatsApp 1-Click Share & Export**: Enable farmers to send diagnosis cards directly to WhatsApp with pre-filled Hindi/English advice for local kisan centers.
- [ ] **Downloadable PDF Prescription Slip**: Auto-generate a printable / downloadable bio-solution slip containing preparation, dosage, and crop spray schedule.
- [ ] **Local Storage Scan History with Thumbnail Gallery**: Cache past scans in IndexedDB/localStorage with quick replay and symptom comparison.
- [ ] **Weather & Seasonal Foliage Disease Advisory**: Add live micro-weather widget (humidity, rain forecast) that warns of high blight risk conditions.

### Phase 3: AI & Pathology Engine Expansion
- [ ] **Multi-Crop Expansion**: Train / extend CNN classes from the current 4 classes (Tomato & Potato) to Pepper Bell, Corn, and Apple from the local `PlantVillage` dataset.
- [ ] **Grad-CAM Saliency Heatmap**: Visualize where the CNN model is looking on the leaf (red heatmap highlighting lesion areas) directly in the UI.
- [ ] **Offline PWA Support**: Service worker caching for basic app operation when field internet is intermittent.
