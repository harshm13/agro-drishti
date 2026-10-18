"""Crop Doctor - CNN Model Training Script.

Trains a Convolutional Neural Network (CNN) on plant leaf images
from the PlantVillage dataset using TensorFlow and Keras.

Pipeline:
1. Scans and validates image directories in data/PlantVillage/
2. Loads images and resizes to 150x150
3. Splits into 80% training and 20% validation
4. Builds a CNN architecture tailored for plant disease classification
5. Trains model with ModelCheckpoint and EarlyStopping
6. Saves model to model/crop_doctor.h5 and class labels to model/classes.json
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Suppress verbose TensorFlow logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau


DEFAULT_CLASSES = [
    "Potato___Early_blight",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___healthy",
]

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp"}


def count_valid_images(directory: Path) -> dict:
    """Counts valid images inside each subdirectory."""
    if not directory.exists() or not directory.is_dir():
        return {}
    class_counts = {}
    for sub in sorted(directory.iterdir()):
        if sub.is_dir() and not sub.name.startswith("."):
            images = [f for f in sub.iterdir() if f.suffix.lower() in IMAGE_EXTENSIONS]
            class_counts[sub.name] = len(images)
    return class_counts


def create_sample_dataset(target_dir: Path, samples_per_class: int = 15) -> None:
    """Generates synthetic sample images for initial pipeline testing."""
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("[!] PIL (Pillow) is required to generate sample images.")
        print("    Install it via: pip install pillow")
        return

    print(f"[*] Generating {samples_per_class} synthetic sample images per class in '{target_dir}'...")
    target_dir.mkdir(parents=True, exist_ok=True)

    color_schemes = {
        "Potato___Early_blight": ((100, 130, 40), (80, 50, 20)),
        "Tomato___Early_blight": ((90, 140, 50), (95, 60, 30)),
        "Tomato___Late_blight": ((70, 110, 40), (50, 40, 30)),
        "Tomato___healthy": ((40, 160, 50), (30, 180, 40)),
    }

    for class_name in DEFAULT_CLASSES:
        class_folder = target_dir / class_name
        class_folder.mkdir(parents=True, exist_ok=True)
        leaf_color, spot_color = color_schemes.get(class_name, ((60, 150, 60), (100, 60, 30)))

        for i in range(1, samples_per_class + 1):
            img = Image.new("RGB", (150, 150), (240, 240, 235))
            draw = ImageDraw.Draw(img)

            # Draw stylized leaf shape
            draw.ellipse([25, 20, 125, 130], fill=leaf_color, outline=(20, 80, 20))
            draw.line([(75, 25), (75, 125)], fill=(30, 90, 30), width=2)
            draw.line([(75, 55), (45, 45)], fill=(30, 90, 30), width=1)
            draw.line([(75, 55), (105, 45)], fill=(30, 90, 30), width=1)
            draw.line([(75, 85), (40, 75)], fill=(30, 90, 30), width=1)
            draw.line([(75, 85), (110, 75)], fill=(30, 90, 30), width=1)

            # Add disease spots if diseased class
            if "healthy" not in class_name:
                import random
                random.seed(i * 42)
                for _ in range(5 + (i % 6)):
                    sx = random.randint(45, 105)
                    sy = random.randint(40, 110)
                    r = random.randint(3, 8)
                    draw.ellipse([sx - r, sy - r, sx + r, sy + r], fill=spot_color)

            img.save(class_folder / f"sample_{i:03d}.jpg", quality=90)

    print("[+] Sample dataset generated successfully.")


def build_cnn_model(input_shape=(150, 150, 3), num_classes=4) -> models.Sequential:
    """Constructs a Convolutional Neural Network for plant disease classification.

    Architecture:
    - Rescaling (1./255)
    - 4x [Conv2D + ReLU + MaxPooling2D]
    - Flatten
    - Dense(512, ReLU) + Dropout(0.5)
    - Dense(num_classes, Softmax)
    """
    model = models.Sequential([
        # Normalize pixel values from [0, 255] to [0.0, 1.0]
        layers.Rescaling(1.0 / 255.0, input_shape=input_shape),

        # First Convolutional Block
        layers.Conv2D(32, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),

        # Second Convolutional Block
        layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),

        # Third Convolutional Block
        layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),

        # Fourth Convolutional Block
        layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),

        # Dense Classification Head
        layers.Flatten(),
        layers.Dropout(0.5),
        layers.Dense(512, activation="relu"),
        layers.Dense(num_classes, activation="softmax"),
    ])

    return model


def train(
    data_dir: str = "data/PlantVillage",
    model_dir: str = "model",
    model_name: str = "agro_drishti_model.h5",
    img_size: int = 150,
    batch_size: int = 32,
    epochs: int = 20,
    learning_rate: float = 0.001,
) -> None:
    """Loads dataset, trains CNN model, and saves trained model and class labels."""
    data_path = Path(data_dir)
    model_dir_path = Path(model_dir)
    model_dir_path.mkdir(parents=True, exist_ok=True)
    model_save_path = model_dir_path / model_name
    classes_json_path = model_dir_path / "classes.json"

    print("=" * 60)
    print("  🌱 Crop Doctor - Training CNN Model")
    print("=" * 60)
    print(f"[*] Dataset Directory : {data_path.resolve()}")
    print(f"[*] Target Model Path : {model_save_path.resolve()}")
    print(f"[*] Image Dimensions  : {img_size}x{img_size}")
    print(f"[*] Batch Size        : {batch_size}")
    print(f"[*] Epochs            : {epochs}")
    print("-" * 60)

    # Validate dataset existence
    if not data_path.exists():
        print(f"[!] Error: Dataset directory '{data_dir}' not found.")
        print("    Create the directory and populate it with PlantVillage disease classes,")
        print("    or run: python train.py --generate-sample-data")
        sys.exit(1)

    class_counts = count_valid_images(data_path)
    total_images = sum(class_counts.values())

    print(f"[*] Found {len(class_counts)} class directories with {total_images} total images:")
    for c_name, c_count in class_counts.items():
        print(f"    - {c_name}: {c_count} images")

    if len(class_counts) < 2 or total_images < 4:
        print("\n[!] Insufficient data to train.")
        print("    Please ensure your class folders contain leaf images.")
        print("    Quick start: run 'python train.py --generate-sample-data' to generate test data.")
        sys.exit(1)

    print("\n[*] Loading training dataset (80% split)...")
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_path,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=(img_size, img_size),
        batch_size=batch_size,
        label_mode="categorical",
    )

    print("[*] Loading validation dataset (20% split)...")
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_path,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=(img_size, img_size),
        batch_size=batch_size,
        label_mode="categorical",
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print(f"[+] Loaded {num_classes} classes: {class_names}")

    # Save class names mapping for predict.py and app.py
    with open(classes_json_path, "w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=2)
    print(f"[+] Saved class mapping to: {classes_json_path}")

    # Optimize pipeline with caching and prefetching
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(buffer_size=1000).prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

    # Build and compile model
    print("\n[*] Building CNN model...")
    model = build_cnn_model(input_shape=(img_size, img_size, 3), num_classes=num_classes)
    model.summary()

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    # Configure training callbacks
    callbacks = [
        ModelCheckpoint(
            filepath=str(model_save_path),
            monitor="val_accuracy",
            save_best_only=True,
            mode="max",
            verbose=1,
        ),
        EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.2,
            patience=3,
            min_lr=1e-6,
            verbose=1,
        ),
    ]

    print("\n[*] Starting training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=callbacks,
        verbose=1,
    )

    # Ensure model is saved to designated path
    model.save(str(model_save_path))
    print(f"\n[+] Training complete! Model successfully saved to: {model_save_path}")

    # Print final evaluation metrics
    final_val_acc = history.history.get("val_accuracy", [-1])[-1]
    final_val_loss = history.history.get("val_loss", [-1])[-1]
    print(f"[+] Final Validation Accuracy : {final_val_acc * 100:.2f}%")
    print(f"[+] Final Validation Loss     : {final_val_loss:.4f}")


def parse_args():
    """Parses command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Crop Doctor - Train CNN for Plant Disease Detection",
    )
    parser.add_argument(
        "--data-dir",
        type=str,
        default="data/PlantVillage",
        help="Path to PlantVillage dataset directory (default: data/PlantVillage)",
    )
    parser.add_argument(
        "--model-dir",
        type=str,
        default="model",
        help="Path to output model directory (default: model)",
    )
    parser.add_argument(
        "--model-name",
        type=str,
        default="agro_drishti_model.h5",
        help="Name of saved model file (default: agro_drishti_model.h5)",
    )
    parser.add_argument(
        "--img-size",
        type=int,
        default=150,
        help="Target image width and height in pixels (default: 150)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=32,
        help="Training batch size (default: 32)",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=20,
        help="Number of training epochs (default: 20)",
    )
    parser.add_argument(
        "--learning-rate",
        type=float,
        default=0.001,
        help="Adam optimizer learning rate (default: 0.001)",
    )
    parser.add_argument(
        "--generate-sample-data",
        action="store_true",
        help="Generate synthetic sample dataset in data-dir for quick testing",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    if args.generate_sample_data:
        create_sample_dataset(Path(args.data_dir))
    else:
        train(
            data_dir=args.data_dir,
            model_dir=args.model_dir,
            model_name=args.model_name,
            img_size=args.img_size,
            batch_size=args.batch_size,
            epochs=args.epochs,
            learning_rate=args.learning_rate,
        )
