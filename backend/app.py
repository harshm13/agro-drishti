from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import os
import re

app = Flask(__name__)
# Enable CORS for Vite frontend (localhost:5173) and local network
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]}})

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
# Trained nodes: 0 -> Potato Early Blight, 1 -> Tomato Early Blight, 2 -> Tomato Late Blight, 3 -> Tomato Healthy
model_class_map = {
    0: 'Potato___Early_blight',
    1: 'Tomato_Early_blight',
    2: 'Tomato_Late_blight',
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

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file uploaded in request'}), 400

        file = request.files['image']
        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        
        # Resize to 150x150 for CNN input
        image = image.resize((150, 150))
        # Custom CNN model expects normalized [0.0, 1.0] float32 tensor
        image_array = np.array(image, dtype=np.float32) / 255.0
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
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model': 'loaded',
        'classes': list(model_class_map.values()),
        'solution_records': len(bio_solutions),
        'version': '2.0.0'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] Starting AgroDrishti Backend on http://localhost:{port}")
    app.run(host='0.0.0.0', debug=True, port=port, use_reloader=False)
