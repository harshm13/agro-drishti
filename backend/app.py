"""AgroDrishti - Flask REST API & Deep Learning Inference Engine.

Provides real-time CNN pathology diagnostics, bilingual biological solutions,
session authentication, user scan history, and administrator oversight.
"""

from flask import Flask, request, jsonify, session, g
from flask_cors import CORS
from functools import wraps
from datetime import timedelta
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import os
import re
import secrets
import time

from database import (
    init_db,
    create_user,
    authenticate_user,
    get_user_by_id,
    list_users,
    update_user_role,
    add_scan_history,
    get_user_scan_history,
    delete_scan_history,
    get_admin_stats,
    list_solution_drafts,
    create_solution_draft,
    update_solution_draft_status,
    get_solution_draft_by_id
)

app = Flask(__name__)

# Security & Session Configuration
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY') or 'agrodrishti_dev_secret_key_change_in_production'
if not os.environ.get('FLASK_SECRET_KEY'):
    print("[!] SECURITY WARNING: Using fallback FLASK_SECRET_KEY for local development. Set FLASK_SECRET_KEY in production.")

app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB maximum request payload

# Credentialed CORS configuration strictly for authorized local Vite and development origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]
extra_origins = os.environ.get('CORS_ORIGINS')
if extra_origins:
    ALLOWED_ORIGINS.extend([orig.strip() for orig in extra_origins.split(',') if orig.strip()])

CORS(app, supports_credentials=True, origins=ALLOWED_ORIGINS)

# Initialize Database Schema
init_db()

# Load CNN Model
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'models', 'agro_drishti_model.h5')

# Fallback path if agro_drishti_model.h5 is named crop_doctor.h5
if not os.path.exists(model_path):
    alt_model = os.path.join(base_dir, 'models', 'crop_doctor.h5')
    if os.path.exists(alt_model):
        model_path = alt_model

# compile=False avoids optimizer deserialization delays across TensorFlow versions
model = tf.keras.models.load_model(model_path, compile=False)
print(f"[*] AgroDrishti Model successfully loaded from: {model_path} (Output Shape: {model.output_shape})")

# Load Bio-solutions with UTF-8 encoding (supporting Hindi / Devanagari scripts)
solutions_path = os.path.join(base_dir, 'solutions', 'bio_solutions.json')
with open(solutions_path, 'r', encoding='utf-8') as f:
    bio_solutions = json.load(f)

# Build a normalized lookup table to guarantee 100% solution matching regardless of spacing/casing/underscores
def normalize_key(k: str) -> str:
    return re.sub(r'[\s_]+', '', k.lower())

normalized_solutions = {}
for k, v in bio_solutions.items():
    normalized_solutions[normalize_key(k)] = v

# Map model output neuron index to canonical disease identifiers
# Trained on 4 Tomato classes: 0 -> Tomato Early Blight, 1 -> Tomato Late Blight, 2 -> Tomato Leaf Mold, 3 -> Tomato Healthy
model_class_map = {
    0: 'Tomato_Early_blight',
    1: 'Tomato_Late_blight',
    2: 'Tomato_Leaf_Mold',
    3: 'Tomato_healthy'
}


def get_solution_for_disease(disease_name: str) -> dict:
    """Finds matching solution by exact match or normalized key and enriches schema."""
    sol = {}
    if disease_name in bio_solutions:
        sol = dict(bio_solutions[disease_name])
    else:
        norm = normalize_key(disease_name)
        if norm in normalized_solutions:
            sol = dict(normalized_solutions[norm])
        else:
            # Try fuzzy crop/condition matching
            for k, v in bio_solutions.items():
                if normalize_key(k) in norm or norm in normalize_key(k):
                    sol = dict(v)
                    break

            # Default healthy fallback if keyword healthy is present
            if not sol and 'healthy' in norm:
                sol = dict(normalized_solutions.get('healthy') or normalized_solutions.get('tomatohealthy', {}))

    if sol:
        # Guarantee cross-compatibility between frontend schemas
        if 'solution_hindi' not in sol:
            sol['solution_hindi'] = sol.get('solution', '')
        if 'solution_english' not in sol:
            sol['solution_english'] = sol.get('name_en', '') + ': ' + sol.get('dosage', '')

    return sol


# --- Security & Authentication Helpers ---

def get_or_create_csrf_token() -> str:
    """Retrieves or creates a session CSRF token."""
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)
    return session['csrf_token']


def verify_csrf():
    """Verifies CSRF token from X-CSRF-Token header against session token."""
    header_token = request.headers.get('X-CSRF-Token')
    session_token = session.get('csrf_token')
    if not header_token or not session_token or not secrets.compare_digest(header_token, session_token):
        return jsonify({'error': 'Invalid or missing CSRF token.'}), 403
    return None


# In-memory IP rate limiting for authentication (brute-force defense)
failed_login_attempts = {}

def check_login_rate_limit(client_ip: str) -> bool:
    now = time.time()
    history = [t for t in failed_login_attempts.get(client_ip, []) if now - t < 60]
    failed_login_attempts[client_ip] = history
    return len(history) < 5

def record_failed_login(client_ip: str):
    now = time.time()
    if client_ip not in failed_login_attempts:
        failed_login_attempts[client_ip] = []
    failed_login_attempts[client_ip].append(now)

def clear_failed_logins(client_ip: str):
    failed_login_attempts.pop(client_ip, None)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Authentication required. Please log in.'}), 401
        user = get_user_by_id(user_id)
        if not user:
            session.clear()
            return jsonify({'error': 'User session expired or invalid. Please log in again.'}), 401
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Authentication required. Please log in.'}), 401
        user = get_user_by_id(user_id)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Forbidden. Administrator privileges required.'}), 403
        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function


# --- Authentication Routes ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or len(name) < 2:
        return jsonify({'error': 'Full name must be at least 2 characters.'}), 400
    if not email or '@' not in email:
        return jsonify({'error': 'A valid email address is required.'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long.'}), 400

    try:
        # Public registration always creates standard 'user' role
        user = create_user(name=name, email=email, password=password, role='user')
        session.permanent = True
        session['user_id'] = user['id']
        csrf_token = get_or_create_csrf_token()

        return jsonify({
            'message': 'Registration successful.',
            'user': user,
            'csrf_token': csrf_token
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to complete registration.'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    client_ip = request.remote_addr or 'unknown'
    if not check_login_rate_limit(client_ip):
        return jsonify({'error': 'Too many failed login attempts. Please wait 1 minute before trying again.'}), 429

    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    user = authenticate_user(email=email, password=password)
    if not user:
        record_failed_login(client_ip)
        return jsonify({'error': 'Invalid email or password.'}), 401

    clear_failed_logins(client_ip)
    session.permanent = True
    session['user_id'] = user['id']
    csrf_token = get_or_create_csrf_token()

    return jsonify({
        'message': 'Login successful.',
        'user': user,
        'csrf_token': csrf_token
    }), 200


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully.'}), 200


@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated.'}), 401

    user = get_user_by_id(user_id)
    if not user:
        session.clear()
        return jsonify({'error': 'Session invalid.'}), 401

    return jsonify({
        'user': user,
        'csrf_token': get_or_create_csrf_token()
    }), 200


# --- User Scan History Routes ---

@app.route('/api/history', methods=['GET'])
@login_required
def get_history():
    history = get_user_scan_history(user_id=g.current_user['id'], limit=50)
    return jsonify({'history': history}), 200


@app.route('/api/history/<int:scan_id>', methods=['DELETE'])
@login_required
def delete_scan(scan_id: int):
    csrf_err = verify_csrf()
    if csrf_err:
        return csrf_err

    success = delete_scan_history(scan_id=scan_id, user_id=g.current_user['id'])
    if not success:
        return jsonify({'error': 'Scan record not found or unauthorized to delete.'}), 404

    return jsonify({'message': 'Scan record deleted successfully.'}), 200


# --- Disease Prediction Endpoint (Preserved & Enhanced) ---

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file uploaded in request'}), 400

        file = request.files['image']
        file_bytes = file.read()

        if len(file_bytes) == 0:
            return jsonify({'error': 'Uploaded file is empty.'}), 400

        if len(file_bytes) > 10 * 1024 * 1024:
            return jsonify({'error': 'Image file exceeds maximum 10MB limit.'}), 400

        # Validate actual image decoding and supported formats
        try:
            image = Image.open(io.BytesIO(file_bytes))
            image_format = (image.format or '').upper()
            if image_format not in ('JPEG', 'JPG', 'PNG', 'WEBP', 'MPO'):
                return jsonify({'error': f'Unsupported image format ({image_format}). Please upload a JPG, PNG, or WEBP image.'}), 400
            image = image.convert('RGB')
        except Exception:
            return jsonify({'error': 'Corrupt or unreadable image file. Please upload a valid photo.'}), 400

        # Resize to 150x150 for CNN input
        image = image.resize((150, 150))
        # MobileNetV2 scaling: [-1.0, 1.0] normalized float32 tensor
        image_array = (np.array(image, dtype=np.float32) / 127.5) - 1.0
        image_array = np.expand_dims(image_array, axis=0)

        # Run inference
        predictions = model.predict(image_array, verbose=0)
        probs = predictions[0]

        # Calculate sorted top predictions
        top_indices = np.argsort(probs)[::-1]
        top_predictions = [
            {
                'disease': model_class_map.get(idx, f'Class_{idx}'),
                'confidence': float(round(float(probs[idx] * 100), 2))
            }
            for idx in top_indices[:3]
        ]

        top_idx = int(top_indices[0])
        top_confidence = float(probs[top_idx] * 100)
        matched_class = model_class_map.get(top_idx, 'uncertain')
        solution_data = get_solution_for_disease(matched_class)
        is_healthy = 'healthy' in matched_class.lower()

        # Handle very low confidence (< 45%) as truly uncertain
        if top_confidence < 45.0:
            result = {
                'disease': 'uncertain',
                'confidence': float(round(top_confidence, 2)),
                'message': 'Photo saaf nahi hai ya ye bimari model ke paas nahi hai. Kripya achhi roshni me patti ki photo lein.',
                'message_en': 'Image unclear or condition unknown to model. Please re-take photo in bright natural lighting.',
                'top_predictions': top_predictions,
                'is_healthy': False,
                'solution': solution_data
            }
        else:
            result = {
                'disease': matched_class,
                'confidence': float(round(top_confidence, 2)),
                'solution': solution_data,
                'is_healthy': is_healthy,
                'top_predictions': top_predictions,
                'status': 'verified' if top_confidence >= 80.0 else 'moderate_confidence'
            }

        # Privacy Rule: Automatically persist metadata to scan_history only if user is logged in
        saved_to_history = False
        user_id = session.get('user_id')
        if user_id:
            try:
                add_scan_history(
                    user_id=user_id,
                    disease=result['disease'],
                    confidence=result['confidence'],
                    is_healthy=result['is_healthy']
                )
                saved_to_history = True
            except Exception as e:
                print(f"[!] Warning: Could not log scan history: {e}")

        result['saved_to_history'] = saved_to_history
        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Admin Oversight Endpoints ---

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def admin_stats():
    stats = get_admin_stats()
    return jsonify(stats), 200


@app.route('/api/admin/users', methods=['GET'])
@admin_required
def admin_users():
    users = list_users()
    return jsonify({'users': users}), 200


@app.route('/api/admin/users/<int:target_user_id>/role', methods=['PUT'])
@admin_required
def admin_update_role(target_user_id: int):
    csrf_err = verify_csrf()
    if csrf_err:
        return csrf_err

    data = request.get_json(silent=True) or {}
    new_role = data.get('role', '').strip()

    try:
        updated_user = update_user_role(
            target_user_id=target_user_id,
            new_role=new_role,
            requesting_admin_id=g.current_user['id']
        )
        return jsonify({'message': 'User role updated successfully.', 'user': updated_user}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/admin/solutions', methods=['GET'])
@admin_required
def admin_solutions():
    drafts = list_solution_drafts()
    return jsonify({
        'active_solutions': bio_solutions,
        'drafts': drafts
    }), 200


@app.route('/api/admin/solutions/draft', methods=['POST'])
@admin_required
def admin_create_draft():
    csrf_err = verify_csrf()
    if csrf_err:
        return csrf_err

    data = request.get_json(silent=True) or {}
    disease_key = data.get('disease_key', '').strip()
    proposed_json = data.get('proposed_json', {})
    source_reference = data.get('source_reference', '').strip()

    if not disease_key or not proposed_json or not source_reference:
        return jsonify({'error': 'disease_key, proposed_json, and source_reference are all required.'}), 400

    try:
        draft_id = create_solution_draft(
            disease_key=disease_key,
            proposed_json=proposed_json,
            source_reference=source_reference,
            user_id=g.current_user['id']
        )
        return jsonify({'message': 'Solution draft submitted for review.', 'draft_id': draft_id}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/admin/solutions/draft/<int:draft_id>/approve', methods=['POST'])
@admin_required
def admin_approve_draft(draft_id: int):
    csrf_err = verify_csrf()
    if csrf_err:
        return csrf_err

    draft = get_solution_draft_by_id(draft_id)
    if not draft:
        return jsonify({'error': 'Draft not found.'}), 404
    if draft['status'] == 'approved':
        return jsonify({'error': 'Draft is already approved.'}), 400

    disease_key = draft['disease_key']
    proposed_json = draft['proposed_json']

    # Update in-memory bio_solutions
    bio_solutions[disease_key] = proposed_json
    normalized_solutions[normalize_key(disease_key)] = proposed_json

    # Atomic file write to solutions/bio_solutions.json
    try:
        temp_path = solutions_path + '.tmp'
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(bio_solutions, f, indent=2, ensure_ascii=False)
        os.replace(temp_path, solutions_path)
    except Exception as e:
        return jsonify({'error': f'Failed to write updated solution file: {e}'}), 500

    update_solution_draft_status(draft_id, 'approved')
    return jsonify({'message': f'Draft #{draft_id} approved and live solution database updated.'}), 200


@app.route('/api/admin/solutions/draft/<int:draft_id>/reject', methods=['POST'])
@admin_required
def admin_reject_draft(draft_id: int):
    csrf_err = verify_csrf()
    if csrf_err:
        return csrf_err

    draft = get_solution_draft_by_id(draft_id)
    if not draft:
        return jsonify({'error': 'Draft not found.'}), 404

    update_solution_draft_status(draft_id, 'rejected')
    return jsonify({'message': f'Draft #{draft_id} rejected.'}), 200


# --- Health & Diagnostics Endpoint ---

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model': 'loaded',
        'classes': list(model_class_map.values()),
        'solution_records': len(bio_solutions),
        'version': '2.1.0'
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] Starting AgroDrishti Backend on http://localhost:{port}")
    app.run(host='0.0.0.0', debug=True, port=port, use_reloader=False)
