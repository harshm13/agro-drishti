// src/utils/api.js
const API_BASE = 'http://localhost:5000';

/**
 * Predict crop disease using Flask backend (http://localhost:5000/predict).
 * Throws on network failure or backend error (no silent fallback).
 */
export const predictDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();

  // Error ko throw karo, null return mat karo
  if (!response.ok || data.error) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
};

// Alias for backwards compatibility
export const predictDiseaseReal = predictDisease;

/**
 * Check Flask server health at http://localhost:5000/health
 */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (!res.ok) throw new Error('Health check status not ok');
    return await res.json();
  } catch (e) {
    return { status: 'offline', model: 'offline' };
  }
};

/**
 * Mock mode disabled — agro-drishti strictly uses live Flask AI backend predictions.
 */
export const predictDiseaseMock = async () => {
  throw new Error('Mock mode is disabled. Please run the Flask server (python backend/app.py on port 5000) for real model predictions.');
};

