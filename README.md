<div align="center">

# 🌾 AgroDrishti (एग्रोदृष्टि)

### AI-Powered Crop Foliage Pathology & Biological Prescription Engine

**“Photo खींचो, बीमारी भगाओ”**

*Objective crop-leaf diagnosis. Structured biological guidance. Better-informed farming decisions.*

[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Flask](https://img.shields.io/badge/Backend-Flask_REST_API-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![TensorFlow](https://img.shields.io/badge/AI_Engine-TensorFlow_%2F_MobileNetV2-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📌 Overview

**AgroDrishti** is a full-stack AI and biotechnology platform designed for farmers and agricultural researchers. Its core mission is to identify crop foliage diseases and provide biological and organic treatment guidance—without relying on chemical pesticides.

The platform combines AI-based leaf diagnosis with a structured biological treatment knowledgebase featuring solutions such as **Trichoderma, Bacillus subtilis, and Neem oil**.

AgroDrishti also includes a sci-fi-inspired **HUD Scanner Workspace**, session-based authentication, personal scan-history tracking, and a protected **Biotech & Admin Oversight Portal**. Researchers can propose new biological advisories for peer review, and administrators can approve proposals before they are added to the live knowledgebase.

## 🚀 Key Features

### 🌿 1. AI-Powered Foliage Pathology

- Uses a **MobileNetV2 transfer-learning architecture** with a `150 × 150` input resolution, trained on agricultural datasets.
- Supports four primary diagnostic classes:

  | Model class | Description |
  |---|---|
  | `Tomato_Early_blight` | अगेती झुलसा |
  | `Tomato_Late_blight` | पछेती झुलसा |
  | `Tomato_Leaf_Mold` | पत्ता फफूंद |
  | `Tomato_healthy` | स्वस्थ पत्ता |

- **Confidence diagnostics:** displays model probabilities and provides an uncertain-image warning when confidence is below the configured 85% threshold.

### 🧪 2. Biological Treatment Knowledgebase

- Follows a **zero-chemical-pesticide policy** for the treatment guidance represented in the platform.
- Provides structured, three-step treatment plans:
  1. **Preparation & Dose (तैयारी व खुराक)**
  2. **Application Timing (छिड़काव विधि)**
  3. **Prevention & Field Sanitation (रोकथाम व सावधानियां)**
- Presents bilingual content in **Devanagari Hindi and English**.

### 🎨 3. Next-Gen UI/UX

- **Cyberpunk / Biotech HUD Scanner:** laser-scanning reticle and interactive leaf-magnifier lens.
- **Audio equalizer waveform:** text-to-speech (TTS) prescription player with animated equalizer bars.
- **WhatsApp sharing:** share diagnosis results and dosage recipes with farmer groups.
- **Dark / Light mode:** system-based theme detection with persistent theme preferences.

### 🔐 4. Authentication & Application Security

- **Flask session authentication:** uses `HttpOnly`, `SameSite=Lax/None`, and `Secure` cookie settings as configured for the deployment environment.
- **Password hashing:** uses `werkzeug.security` with PBKDF2:SHA-256.
- **CSRF protection:** double-submit CSRF-token validation on state-changing endpoints.
- **Brute-force rate limiting:** in-memory IP tracking to limit repeated login failures.

### 🛡️ 5. Admin & Biotech Oversight Portal

- **Analytics dashboard:** displays SQLite-backed metrics, including total scans, foliage-health ratio, and disease breakdowns.
- **User and role management:** role-based access control (RBAC) with `user` and `admin` roles.
- **Biotech review queue — Rashi's Workspace:** researchers can propose biological formulas with ICAR/KVK scientific citations. Administrators can review and approve proposals before they are merged into the live knowledgebase.

---

## 🧭 How AgroDrishti Works

1. Capture or upload a crop-leaf photo.
2. The AI model analyzes the image and predicts a supported diagnostic class.
3. The platform displays the diagnosis and confidence information.
4. The biological knowledgebase provides a structured treatment advisory.
5. The farmer can listen to the advisory, share it, and revisit previous scans through scan history when signed in.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Axios, Canvas Confetti |
| **Backend** | Python 3.11+, Flask, Flask-CORS, Pillow (PIL), NumPy |
| **Machine Learning** | TensorFlow 2.x, Keras, MobileNetV2 |
| **Database** | SQLite3, parameterized queries, foreign-key cascades |
| **Deployment** | Vercel (frontend SPA) + Render (backend web service) |

## 📁 Repository Structure

```text
agro-drishti/
├── backend/
│   ├── models/
│   │   ├── agro_drishti_model.h5   # Trained MobileNetV2 weights (29.1 MB)
│   │   └── README.md
│   ├── solutions/
│   │   └── bio_solutions.json      # Biological-remedy knowledgebase
│   ├── app.py                      # Flask REST API, session auth and CSRF
│   ├── database.py                 # SQLite schema, initialization and connections
│   ├── create_admin.py             # CLI tool to provision or promote admin users
│   ├── test_backend.py             # Automated unit and integration tests (6 tests)
│   ├── requirements.txt            # Python dependencies
│   └── .env.example                # Sample environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx  # Review queue, analytics and user management
│   │   │   ├── AuthModal.jsx       # Login/register modal and validation
│   │   │   ├── Footer.jsx          # Credits and KVK advisory disclaimer
│   │   │   ├── Header.jsx          # Navigation, theme, language and workspace
│   │   │   ├── LanguageToggle.jsx  # Hindi/English language toggle
│   │   │   ├── ResultCard.jsx      # Diagnosis, TTS player and WhatsApp sharing
│   │   │   ├── StatsBar.jsx        # Diagnostic metrics
│   │   │   └── UploadSection.jsx   # Upload, webcam and scanner HUD
│   │   ├── styles/
│   │   │   └── theme.css           # Glassmorphism, HUD and equalizer animations
│   │   ├── utils/
│   │   │   └── api.js              # Axios instance, CSRF interceptor and API calls
│   │   ├── App.jsx                 # Main application controller
│   │   ├── index.css               # Tailwind directives and base styles
│   │   └── main.jsx
│   ├── index.html                  # Font imports (Poppins and Noto Sans Devanagari)
│   ├── package.json
│   ├── tailwind.config.js          # Dark mode and custom green palette
│   └── vite.config.js              # Vite server and proxy configuration
├── legacy_archive/                 # Preserved legacy scripts (gitignored)
├── docs/
│   └── architecture.md
├── .gitignore
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites

- **Python 3.11 or 3.12**
- **Node.js 18 or higher** and npm
- **Git**

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd agro-drishti
```

Replace `<YOUR_REPOSITORY_URL>` with the repository's actual clone URL.

### 2. Set up the backend

```powershell
cd backend

# Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Linux/macOS activation:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Provision an administrator account (choose a unique strong password)
python create_admin.py --name "Admin User" --email "admin@agrodrishti.org" --password "<CHOOSE_A_STRONG_PASSWORD>"

# Run automated backend tests
python test_backend.py

# Start the Flask API
python app.py
```

The backend runs at `http://localhost:5000` with the default local configuration.

### 3. Set up the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 4. Open the application

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

> Review `.env.example` and configure the environment variables required by your local setup. Never commit real secrets or credentials.

---

## 📡 API Reference

### Authentication Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Registers a standard user (`role='user'`) and establishes a session. |
| `/api/auth/login` | `POST` | Public | Rate-limited login; returns user information and a CSRF token. |
| `/api/auth/logout` | `POST` | Auth | Invalidates the server session and clears cookies. |
| `/api/auth/me` | `GET` | Auth | Validates the current session and returns the user profile. |

### Diagnostic & History Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/predict` | `POST` | Public / Auth | Accepts a leaf image (maximum 10 MB), runs MobileNetV2 inference, and logs the scan to history when the user is signed in. |
| `/api/history` | `GET` | Auth | Returns the authenticated user's previous scans. |
| `/api/history/<id>` | `DELETE` | Auth | Deletes a scan record owned by the authenticated user. |

### Admin & Biotech Review Endpoints

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/admin/stats` | `GET` | Admin | Returns SQLite-backed aggregates, including scan totals, health ratio and user count. |
| `/api/admin/users` | `GET` | Admin | Lists registered users and roles; passwords are not exposed. |
| `/api/admin/users/<id>/role` | `PUT` | Admin | Promotes or demotes roles, with protection against demoting the last administrator. |
| `/api/admin/solutions` | `GET` | Admin | Returns active remedies and pending biotech proposals. |
| `/api/admin/solutions/draft` | `POST` | Admin | Submits a biological-remedy update with a mandatory ICAR/KVK reference. |
| `/api/admin/solutions/draft/<id>/approve` | `POST` | Admin | Merges an approved draft into `bio_solutions.json`. |
| `/api/admin/solutions/draft/<id>/reject` | `POST` | Admin | Rejects a proposal without changing the live knowledgebase. |

> **Implementation check:** Verify endpoint paths, access requirements, and request/response formats against the current Flask code before treating this table as a formal API contract.

---

## 🌐 Production Deployment

### Frontend — Vercel

Deploy the frontend as a static React single-page application.

Set the following environment variable in the Vercel project settings:

```env
VITE_API_BASE_URL=<YOUR_RENDER_BACKEND_URL>
```

### Backend — Render

Deploy the Flask application as a Python web service.

**Example Gunicorn start command:**

```bash
gunicorn -w 2 -b 0.0.0.0:$PORT app:app
```

The original setup also lists `python app.py` as an alternative. Use the command appropriate to the Render service configuration.

Configure the following in Render:

- Set `FLASK_SECRET_KEY` as a private environment variable.
- Configure CORS origins to match the production Vercel domain.
- Ensure cookie security and `SameSite` settings match the frontend/backend domain arrangement.
- Keep all credentials and secrets out of Git.

---

## 👥 Contributors & Credits

| Contributor | Role |
|---|---|
| **Harsh Mehta** | Lead Developer & IT Architecture — B.Tech IT, Silver Oak University, Ahmedabad |
| **Rashi** | Biotechnology Research & Plant Pathology — B.Sc Biotechnology, Chhattisgarh |

---

## ⚠️ Disclaimer

AgroDrishti is an **educational and technological AI prototype**. AI-generated diagnoses and biological treatment suggestions should not be treated as a substitute for professional agricultural advice.

Always cross-verify important field diagnoses and treatment decisions with certified agronomists or local **Krishi Vigyan Kendra (KVK)** extension specialists before applying intensive biological treatments.

---

<div align="center">

**AgroDrishti — Bringing AI-assisted crop diagnosis and biological knowledge closer to the farmer.**

*Built with 🌱 by Team AgroDrishti.*

</div>
