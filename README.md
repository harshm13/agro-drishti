# 🌱 AgroDrishti
*Photo खींच, बीमारी भगाओ*

AI-Powered Crop Disease Detection with Biological Solutions

💻 **IT:** Convolutional Neural Network (TensorFlow / Keras)  
🧬 **Biotech:** Bio-based organic treatment database for Indian crops  

**Made by:** Harsh Mehta (IT, Ahmedabad) & Rashi (Biotech, Chhattisgarh)

---

## 🏷️ Well-Organized Project Structure

```text
disease_detector/
├── .agents/                      # AI assistant skills & customization rules
├── .streamlit/                   # Streamlit layout & theme configuration
│   └── config.toml
├── backend/                      # Flask REST API Backend (for React Frontend)
│   ├── app.py                    # Flask API server (/predict & /health)
│   ├── .env                      # Environment configuration
│   ├── requirements.txt          # Backend Python dependencies
│   ├── models/                   # Local models cache
│   └── solutions/                # Local bio-solutions copy
├── frontend/                     # React + Vite + Tailwind CSS Web Application
│   ├── src/                      # UI components, state management, & API client
│   ├── package.json              # Frontend npm dependencies & scripts
│   ├── vite.config.js            # Vite build configuration
│   └── ...
├── model/                        # Central ML Model Weights & Biological Database
│   ├── agro_drishti_model.h5     # Trained Keras CNN model weights
│   ├── bio_solutions.json        # Bio-treatment & organic remedy database
│   ├── classes.json              # Dataset disease classes mapping
│   └── README.md                 # Model documentation
├── data/                         # Datasets & Training Images
│   └── PlantVillage/             # Clean PlantVillage leaf image dataset
│       ├── Pepper__bell___Bacterial_spot/
│       ├── Pepper__bell___healthy/
│       ├── Potato___Early_blight/
│       ├── Potato___healthy/
│       ├── Potato___Late_blight/
│       ├── Tomato_Bacterial_spot/
│       ├── Tomato_Early_blight/
│       ├── Tomato_healthy/
│       ├── Tomato_Late_blight/
│       ├── Tomato_Leaf_Mold/
│       └── ... (All disease classes)
├── docs/                         # System architecture & technical specs
│   └── architecture.md
├── app.py                        # Unified Streamlit Web Application (Main entrypoint)
├── agro_drishti.py               # Streamlit launcher alias (delegates to app.py)
├── predict.py                    # Single-image CLI prediction tool
├── train.py                      # CNN Model training pipeline
├── requirements.txt              # Unified Python dependencies
├── .gitignore                    # Git ignore specifications
└── README.md                     # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Install Python Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Option A: Run the Streamlit Web Application
```powershell
streamlit run app.py
```
*(Also runnable via `streamlit run agro_drishti.py`)*

### 3. Option B: Run the React + Flask Full-Stack Application

**Terminal 1 (Flask API Backend):**
```powershell
python backend/app.py
```

**Terminal 2 (React Frontend):**
```powershell
cd frontend
npm install
npm run dev
```

### 4. Single-Image CLI Prediction
```powershell
python predict.py --image "data/PlantVillage/Tomato_Early_blight/0012b9d2-2130-4a06-a834-b1f3af34f57e___RS_Erly.B 8389.JPG"
```

### 5. Model Training (Optional)
```powershell
python train.py --data-dir "data/PlantVillage" --model-dir "model" --model-name "agro_drishti_model.h5"
```

---

## ✨ Features
* **Glassmorphism & Nature Theme:** Deep Forest Green (`#1B5E20`), Lime Accent (`#AEEA00`), Cream Background (`#F6FFF0`).
* **Multi-Language Toggle:** Instant switching between 🇮🇳 Hindi and 🇺🇸 English.
* **Voice Output (TTS):** Integrated Google Text-to-Speech (`gTTS`) speaking out prescription advice in Hindi/English.
* **Smart Dashboard:** Live tracking of Total Scans, Healthy Crop Rate %, and Active Alerts.
* **Rich 3-Step Bio-Solution Plan:** Preparation (Dosage), Application (Frequency), and Prevention (Seasonal Tips).
* **Mobile-First Camera Input:** Snap photos directly in the field with `st.camera_input`.
* **Scan History Gallery:** Keeps recent scans with thumbnails and timestamps.
