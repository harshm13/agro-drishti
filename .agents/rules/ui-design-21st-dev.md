# 🎨 21st.dev UI Design System & Component Reference Guide

> **Official Catalog**: [https://21st.dev/](https://21st.dev/)  
> **Markdown Twins Endpoint**: Append `.md` to any component, author, or category URL (e.g., `https://21st.dev/mcp.md`, `https://21st.dev/ai.md`)  
> **CLI & MCP**: `npx @21st-dev/cli@latest init`

This rule establishes **21st.dev** as the primary design engineering reference for the **AgroDrishti** web application. Any new UI components, visual redesigns, micro-animations, or dashboard widgets created for this project should draw inspiration and implementation patterns directly from **21st.dev** to ensure a high-end, futuristic, and engaging user experience ("Crazy UI").

---

## 🌟 Core Component Archetypes from 21st.dev for AgroDrishti

When implementing or upgrading UI elements in AgroDrishti, reference the following 21st.dev component patterns:

### 1. 📷 Laser Scanner & Cyber-Organic Leaf HUD
- **Inspiration**: Scanner Reticle / Radar Sweep / AI Vision Viewfinder from 21st.dev.
- **Application**: The leaf upload & camera viewfinder in `UploadSection.jsx`.
- **Key Features**:
  - Animated pulsing laser scan line sweeping vertically across the leaf.
  - HUD corner brackets (`border-emerald-400`), targeting crosshairs, and live status pills ("SCANNING FOLIAGE...", "PATHOLOGY MATRIX ACTIVE").
  - Glassmorphism backdrop blur with grid overlay.

### 2. 🔍 Interactive Disease Lens / Foliar Zoom Magnifier
- **Inspiration**: 21st.dev "Lens" / "Spotlight Card" / "Hover Preview" components (Aceternity UI / Cult UI).
- **Application**: The leaf preview card before and after diagnosis.
- **Key Features**:
  - Interactive cursor magnifier that enlarges leaf lesions, fungal spores, or chlorosis spots when the user hovers over the image.
  - Micro-callout badges pinpointing affected zones.

### 3. 🍱 Bento Grid Architecture for Smart Dashboard
- **Inspiration**: 21st.dev Bento Grids (Magic UI / Aceternity).
- **Application**: The top stats and analytics layout (`StatsBar.jsx`).
- **Key Features**:
  - Irregular, harmonious grid cards with subtle gradient borders (`border-white/10 dark:border-emerald-500/20`).
  - Animated hover lift (`transform hover:-translate-y-1 hover:shadow-2xl`).
  - Micro-counters that dynamically roll up on page load.

### 4. 🔊 Animated Audio Waveform for Voice Prescriptions
- **Inspiration**: 21st.dev "AI Voice Visualizer" / "Waveform Pill" / "Audio Wave".
- **Application**: Text-to-Speech (TTS) prescription player in `ResultCard.jsx`.
- **Key Features**:
  - Animated audio bars (varying heights pulsing with CSS keyframes) while Hindi/English prescription advice is spoken.
  - Glowing play/pause pill button with animated gradient ring.

### 5. ✨ Shimmer & Glowing Buttons
- **Inspiration**: 21st.dev "Shimmer Button" / "Border Beam" / "Glow Button".
- **Application**: "बीमारी की जांच करें" (Analyze Crop Health) call-to-action button.
- **Key Features**:
  - Highlighting border beam rotating around the button perimeter.
  - Radiant emerald-to-lime glow on hover with tactile click feedback.

### 6. 🌿 Floating Micro-Particle Background
- **Inspiration**: 21st.dev "Dotted Surface" / "Particles" / "Aurora Background".
- **Application**: Subtle background atmosphere across the entire app.
- **Key Features**:
  - Floating ambient bio-spore / leaf particles moving gently across dark and light themes.

---

## 🛠️ How to Reference & Query 21st.dev

When looking for UI components to build:
1. Browse categories at [https://21st.dev/community/components](https://21st.dev/community/components).
2. For any component page URL (e.g., `https://21st.dev/@author/components/slug`), read the lightweight markdown version directly by appending `.md` (`https://21st.dev/@author/components/slug.md`).
3. Leverage popular curated libraries on 21st:
   - **Aceternity UI**: `https://21st.dev/@manuarora700/library/aceternity-ui.md`
   - **Magic UI**: `https://21st.dev/@dillionverma/library/magic-ui.md`
   - **Cult UI & Eldora UI**: Bento cards, interactive sliders, spotlight effects.
