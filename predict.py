"""Crop Doctor - Single Image Prediction and Disease Diagnosis Script.

Loads a trained Keras/TensorFlow model (model/crop_doctor.h5),
preprocesses an input leaf image to 150x150 pixels, runs inference,
and provides detailed diagnostic reports including treatment recommendations.
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Suppress TensorFlow verbose logging
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import numpy as np
import tensorflow as tf


DEFAULT_MODEL_PATH = "model/agro_drishti_model.h5"
if not Path(DEFAULT_MODEL_PATH).exists():
    for fallback in ["model/crop_doctor.h5", "agro_drishti_model.h5", "crop_doctor.h5"]:
        if Path(fallback).exists():
            DEFAULT_MODEL_PATH = fallback
            break

DEFAULT_CLASSES_PATH = "model/classes.json"

FALLBACK_CLASSES = [
    "Potato___Early_blight",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___healthy",
]

# Comprehensive plant disease metadata and treatment repository
DISEASE_KNOWLEDGE_BASE: Dict[str, Dict] = {
    "Potato___Early_blight": {
        "crop": "Potato",
        "condition": "Early Blight",
        "pathogen": "Alternaria solani (Fungus)",
        "is_healthy": False,
        "severity": "Moderate to High",
        "symptoms": [
            "Concentric dark brown to black rings ('target-board' pattern) on older leaves.",
            "Yellow halo encircling circular to angular necrotic lesions.",
            "Premature defoliation starting from the lower canopy moving upward.",
        ],
        "treatments": [
            "Apply copper-based fungicides, chlorothalonil, or mancozeb at first sign of lesions.",
            "Ensure complete coverage of both upper and lower leaf surfaces.",
            "Organic option: Spray Bacillus subtilis or neem oil extract weekly.",
        ],
        "prevention": [
            "Practice a 3-4 year crop rotation with non-solanaceous crops.",
            "Ensure proper plant spacing for canopy ventilation and sun exposure.",
            "Use drip irrigation instead of overhead sprinklers to keep foliage dry.",
            "Remove and destroy crop residues post-harvest; avoid composting diseased leaves.",
        ],
    },
    "Tomato___Early_blight": {
        "crop": "Tomato",
        "condition": "Early Blight",
        "pathogen": "Alternaria solani (Fungus)",
        "is_healthy": False,
        "severity": "Moderate",
        "symptoms": [
            "Brown-black concentric ring spots on lower, mature foliage.",
            "Leaf tissue around spots turns yellow, causing chlorosis and leaf drop.",
            "Dark, sunken, leathery lesions can form at the stem base or fruit calyx.",
        ],
        "treatments": [
            "Spray fungicides containing chlorothalonil, azoxystrobin, or copper hydroxide.",
            "Prune infected bottom leaves immediately with sanitized shears.",
            "Apply bio-fungicides like Trichoderma harzianum to the root zone.",
        ],
        "prevention": [
            "Stake and cage tomato plants to keep foliage elevated off wet soil.",
            "Mulch around plants with straw or plastic film to prevent soil splash.",
            "Rotate crops annually and avoid planting near potatoes or eggplants.",
            "Water only at ground level early in the morning.",
        ],
    },
    "Tomato___Late_blight": {
        "crop": "Tomato",
        "condition": "Late Blight",
        "pathogen": "Phytophthora infestans (Oomycete)",
        "is_healthy": False,
        "severity": "Critical / Severe",
        "symptoms": [
            "Large, irregular water-soaked pale-green to brown lesions on leaves.",
            "Delicate white fungal-like fuzz/mold visible on the underside of leaves during humid weather.",
            "Rapid collapse of foliage and dark brown rot developing on green tomatoes.",
        ],
        "treatments": [
            "Immediate application of systemic fungicides (mefenoxam, cymoxanil, dimethomorph).",
            "Spray copper-based protectants before rain if humidity remains high.",
            "Uproot and bag severely infected plants immediately to prevent neighborhood spread.",
        ],
        "prevention": [
            "Plant certified disease-free transplants and certified resistant varieties.",
            "Destroy all volunteer tomato and potato plants near the garden or greenhouse.",
            "Maximize airflow by pruning suckers and spacing rows at least 3 feet apart.",
            "Avoid overhead irrigation entirely.",
        ],
    },
    "Tomato___healthy": {
        "crop": "Tomato",
        "condition": "Healthy Foliage",
        "pathogen": "None (Plant is Vigorous)",
        "is_healthy": True,
        "severity": "None",
        "symptoms": [
            "Vibrant, uniform green foliage with no necrotic spots or lesions.",
            "Sturdy turgid leaf stems and clean vein structure.",
            "Normal growth rate with no leaf curling or chlorotic discoloration.",
        ],
        "treatments": [
            "No chemical or corrective treatments necessary.",
            "Maintain balanced N-P-K fertilization according to vegetative growth stage.",
            "Continue optimal hydration and sunlight schedule (6-8 hours daily).",
        ],
        "prevention": [
            "Maintain regular inspection schedule (check undersides of leaves weekly).",
            "Maintain clean gardening tools sanitized with 70% isopropyl alcohol.",
            "Promote soil microbiome health using organic compost and beneficial mycorrhizae.",
        ],
    },
}


def load_class_names(classes_path: Optional[str] = None) -> List[str]:
    """Loads class names from JSON file, falling back to defaults if not found."""
    target_path = Path(classes_path or DEFAULT_CLASSES_PATH)
    if target_path.exists():
        try:
            with open(target_path, "r", encoding="utf-8") as f:
                classes = json.load(f)
            if isinstance(classes, list) and len(classes) > 0:
                return classes
        except Exception as e:
            print(f"[!] Warning: Could not read {target_path} ({e}). Using default class names.")
    return FALLBACK_CLASSES


def preprocess_image(image_path: str, target_size: Tuple[int, int] = (150, 150)) -> Tuple[np.ndarray, object]:
    """Loads and preprocesses an image file for CNN inference.

    Args:
        image_path: Path to the input image.
        target_size: Target (width, height) tuple.

    Returns:
        A tuple of (batch_tensor, PIL_image).
    """
    path = Path(image_path)
    if not path.exists() and not path.is_absolute():
        fallback_data = Path("data") / image_path
        if fallback_data.exists():
            path = fallback_data
    if not path.exists():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    # Load image using Keras image utilities
    pil_img = tf.keras.utils.load_img(str(path), target_size=target_size)
    img_array = tf.keras.utils.img_to_array(pil_img)

    # Expand batch dimension: (150, 150, 3) -> (1, 150, 150, 3)
    # The CNN model includes layers.Rescaling(1./255) as its first layer.
    img_batch = np.expand_dims(img_array, axis=0)

    return img_batch, pil_img


def predict_disease(
    image_path: str,
    model_path: str = DEFAULT_MODEL_PATH,
    classes_path: Optional[str] = None,
    target_size: Tuple[int, int] = (150, 150),
) -> Dict:
    """Performs inference on a single plant leaf image and returns diagnosis.

    Args:
        image_path: File path to the image to analyze.
        model_path: File path to the trained .h5 model.
        classes_path: File path to the classes.json metadata file.
        target_size: Dimensions expected by the model.

    Returns:
        Dictionary containing prediction results, probabilities, and treatment info.
    """
    model_file = Path(model_path)
    if not model_file.exists():
        raise FileNotFoundError(
            f"Model file not found at '{model_path}'. "
            f"Please run 'python train.py' first to train and save the model."
        )

    # Load model and class names
    model = tf.keras.models.load_model(str(model_file))
    class_names = load_class_names(classes_path)

    # Preprocess image
    img_batch, _ = preprocess_image(image_path, target_size=target_size)

    # Run inference
    raw_predictions = model.predict(img_batch, verbose=0)[0]

    # Postprocess probabilities
    probabilities = {
        class_names[i] if i < len(class_names) else f"Class_{i}": float(raw_predictions[i])
        for i in range(len(raw_predictions))
    }

    # Sort probabilities descending
    sorted_probs = sorted(probabilities.items(), key=lambda item: item[1], reverse=True)
    top_class, top_conf = sorted_probs[0]

    # Fetch knowledge base info
    details = DISEASE_KNOWLEDGE_BASE.get(
        top_class,
        {
            "crop": top_class.split("___")[0] if "___" in top_class else "Plant",
            "condition": top_class.split("___")[1].replace("_", " ") if "___" in top_class else top_class,
            "pathogen": "Unknown Pathogen",
            "is_healthy": "healthy" in top_class.lower(),
            "severity": "Unknown",
            "symptoms": ["Consult local agricultural extension for diagnosis."],
            "treatments": ["Apply broad-spectrum protectant fungicide if fungal."],
            "prevention": ["Maintain clean cultivation and crop rotation."],
        },
    )

    return {
        "image_path": str(Path(image_path).resolve()),
        "predicted_class": top_class,
        "confidence_percentage": round(top_conf * 100, 2),
        "is_healthy": details["is_healthy"],
        "crop": details["crop"],
        "condition": details["condition"],
        "severity": details.get("severity", "N/A"),
        "pathogen": details["pathogen"],
        "symptoms": details["symptoms"],
        "treatments": details["treatments"],
        "prevention": details["prevention"],
        "all_probabilities": {k: round(v * 100, 2) for k, v in sorted_probs},
    }


def print_report(result: Dict) -> None:
    """Formats and prints the diagnosis result to the terminal."""
    print("\n" + "=" * 65)
    print("           🌱 CROP DOCTOR - DIAGNOSTIC REPORT")
    print("=" * 65)
    print(f" Image Analyzed : {result['image_path']}")
    print(f" Crop Type      : {result['crop']}")
    print(f" Condition      : {result['condition']}")

    status_str = "🟢 HEALTHY" if result["is_healthy"] else f"🔴 DISEASE DETECTED ({result['severity']})"
    print(f" Health Status  : {status_str}")
    print(f" Confidence     : {result['confidence_percentage']}%")
    print(f" Pathogen       : {result['pathogen']}")
    print("-" * 65)

    print("📊 CLASS PROBABILITY DISTRIBUTION:")
    for c_name, prob in result["all_probabilities"].items():
        bar_len = int(prob / 2.5)
        bar = "█" * bar_len + "░" * (40 - bar_len)
        print(f"  {c_name:<26} |{bar}| {prob:5.2f}%")
    print("-" * 65)

    if result["is_healthy"]:
        print("✅ Plant is healthy. Recommended maintenance:")
        for t in result["treatments"]:
            print(f"   • {t}")
    else:
        print("🚨 OBSERVED SYMPTOMS:")
        for s in result["symptoms"]:
            print(f"   • {s}")
        print("\n💊 IMMEDIATE TREATMENT / REMEDIES:")
        for t in result["treatments"]:
            print(f"   • {t}")
        print("\n🛡️ LONG-TERM PREVENTION:")
        for p in result["prevention"]:
            print(f"   • {p}")

    print("=" * 65 + "\n")


def parse_args():
    """Parses command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Crop Doctor - Predict plant disease from a single leaf photograph",
    )
    parser.add_argument(
        "--image",
        "-i",
        type=str,
        required=True,
        help="Path to leaf image file (.jpg, .jpeg, .png)",
    )
    parser.add_argument(
        "--model",
        "-m",
        type=str,
        default=DEFAULT_MODEL_PATH,
        help=f"Path to trained model file (default: {DEFAULT_MODEL_PATH})",
    )
    parser.add_argument(
        "--classes",
        "-c",
        type=str,
        default=DEFAULT_CLASSES_PATH,
        help=f"Path to classes.json (default: {DEFAULT_CLASSES_PATH})",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw JSON instead of formatted text report",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    try:
        report = predict_disease(
            image_path=args.image,
            model_path=args.model,
            classes_path=args.classes,
        )
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            print_report(report)
    except Exception as exc:
        print(f"\n[!] Diagnosis Error: {exc}", file=sys.stderr)
        sys.exit(1)
