from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import json
import os

app = Flask(__name__)
CORS(app)  # React frontend ko access karne ke liye

# Model load kar
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'models', 'crop_doctor.h5')

# Fallback path if crop_doctor.h5 is named agro_drishti_model.h5
if not os.path.exists(model_path):
    alt_model = os.path.join(base_dir, 'models', 'agro_drishti_model.h5')
    if os.path.exists(alt_model):
        model_path = alt_model

model = tf.keras.models.load_model(model_path)
print(f"Model successfully loaded from: {model_path}")

# Bio-solutions load kar (UTF-8 encoding required for Hindi / multilingual content on Windows)
solutions_path = os.path.join(base_dir, 'solutions', 'bio_solutions.json')
with open(solutions_path, 'r', encoding='utf-8') as f:
    bio_solutions = json.load(f)

# Class names matching trained model output nodes (from model/classes.json)
class_names = ['Potato___Early_blight', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___healthy']

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Image receive kar
        if 'image' not in request.files:
            return jsonify({'error': 'No image file uploaded in request'}), 400

        file = request.files['image']
        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        
        # Resize kar (150x150 for CNN input)
        image = image.resize((150, 150))
        # Custom CNN model expects [0.0, 1.0] normalized float32 tensor
        image_array = np.array(image, dtype=np.float32) / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        
        # Predict kar
        predictions = model.predict(image_array)
        probs = predictions[0]
        
        # Calculate top-2 predictions sorted descending
        top_indices = np.argsort(probs)[::-1][:2]
        top_predictions = [
            {
                'disease': class_names[idx],
                'confidence': float(round(float(probs[idx] * 100), 2))
            }
            for idx in top_indices
        ]
        
        top_idx = int(top_indices[0])
        top_confidence = float(probs[top_idx] * 100)
        matched_class = class_names[top_idx]
        
        # Confidence threshold check (85%)
        if top_confidence < 85.0:
            result = {
                'disease': 'uncertain',
                'confidence': float(round(top_confidence, 2)),
                'message': 'Photo saaf nahi hai ya ye bimari model ke paas nahi hai. Kisi expert se check karein.',
                'top_predictions': top_predictions,
                'is_healthy': False,
                'solution': {}
            }
        else:
            # Look up solution with key normalization (supports Potato___Early_blight, Tomato_Early_Blight, etc.)
            solution_data = (
                bio_solutions.get(matched_class)
                or bio_solutions.get(matched_class.replace('___', '_'))
                or bio_solutions.get(matched_class.replace('___', ' ').replace('_', ' '))
                or {}
            )
            result = {
                'disease': matched_class,
                'confidence': float(round(top_confidence, 2)),
                'solution': solution_data,
                'is_healthy': 'healthy' in matched_class.lower(),
                'top_predictions': top_predictions
            }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model': 'loaded'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port, use_reloader=False)
