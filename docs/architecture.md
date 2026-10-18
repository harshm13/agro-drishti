# Crop Doctor Documentation

## System Architecture

Crop Doctor is an end-to-end plant disease diagnosis application designed to classify plant foliage diseases using deep convolutional neural networks (CNNs).

```
+-----------------------------------------------------------+
|                      User Interface                       |
|               (Streamlit Web Application)                 |
+-----------------------------+-----------------------------+
                              | Upload Plant Leaf Image
                              v
+-----------------------------------------------------------+
|                   Inference Engine                        |
|                     (predict.py)                          |
|  - Preprocessing: Resize 150x150, RGB scaling             |
|  - Model: model/agro_drishti_model.h5 (Trained CNN)       |
|  - Postprocessing: Softmax probabilities + Disease mapping|
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
|                   Diagnostic Output                       |
|  - Predicted Class Name & Confidence Score                |
|  - Probability Distribution                               |
|  - Pathogen Cause, Symptoms, & Recommended Treatment      |
+-----------------------------------------------------------+
```

## Model Architecture Details
- **Input Layer**: `(150, 150, 3)`
- **Rescaling**: `1./255` normalization
- **Feature Extractor**:
  - `Conv2D(32, (3, 3), activation='relu')` -> `MaxPooling2D(2, 2)`
  - `Conv2D(64, (3, 3), activation='relu')` -> `MaxPooling2D(2, 2)`
  - `Conv2D(128, (3, 3), activation='relu')` -> `MaxPooling2D(2, 2)`
  - `Conv2D(128, (3, 3), activation='relu')` -> `MaxPooling2D(2, 2)`
- **Classifier**:
  - `Flatten()`
  - `Dense(512, activation='relu')`
  - `Dropout(0.5)`
  - `Dense(4, activation='softmax')`
- **Optimizer**: `Adam(learning_rate=0.001)`
- **Loss Function**: `categorical_crossentropy` or `sparse_categorical_crossentropy`
