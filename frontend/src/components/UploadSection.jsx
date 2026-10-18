import React, { useState, useRef } from 'react';
import { Upload, Camera, Search, RefreshCw, X, Sparkles } from 'lucide-react';

export default function UploadSection({
  onImageSelected,
  onAnalyze,
  selectedImage,
  previewUrl,
  onClear,
  isAnalyzing,
  language,
}) {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'camera'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Quick sample leaf shortcuts for convenient testing
  const sampleLeafTests = [
    { name: isHi ? '🍂 अगेती झुलसा' : '🍂 Early Blight', key: 'early_blight' },
    { name: isHi ? '🌧️ पछेती झुलसा' : '🌧️ Late Blight', key: 'late_blight' },
    { name: isHi ? '🍄 पत्ता फफूंद' : '🍄 Leaf Mold', key: 'leaf_mold' },
    { name: isHi ? '🌱 स्वस्थ पत्ता' : '🌱 Healthy Leaf', key: 'healthy' },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
    // Reset input value so selecting the same file consecutively triggers onChange
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  const startCamera = async () => {
    setActiveTab('camera');
    setCameraActive(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(
        isHi
          ? 'कैमरा उपलब्ध नहीं है। कृपया फ़ाइल अपलोड का उपयोग करें।'
          : 'Camera access unavailable. Please use file upload.'
      );
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'tomato_leaf_capture.jpg', { type: 'image/jpeg' });
          onImageSelected(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleSelectSample = (sample) => {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');

    const bgGradient = ctx.createLinearGradient(0, 0, 150, 150);
    if (sample.key === 'healthy') {
      bgGradient.addColorStop(0, '#2e7d32');
      bgGradient.addColorStop(1, '#81c784');
    } else if (sample.key === 'early_blight') {
      bgGradient.addColorStop(0, '#5d4037');
      bgGradient.addColorStop(1, '#a1887f');
    } else if (sample.key === 'late_blight') {
      bgGradient.addColorStop(0, '#3e2723');
      bgGradient.addColorStop(1, '#616161');
    } else {
      bgGradient.addColorStop(0, '#d7ccc8');
      bgGradient.addColorStop(1, '#bcaaa4');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 150, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(sample.key.replace('_', ' '), 15, 75);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample_${sample.key}.jpg`, { type: 'image/jpeg' });
        onImageSelected(file);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div
      className="glass-card p-5 sm:p-6 rounded-2xl space-y-4 shadow-md transition-all bg-white/80 dark:bg-[#1E1E1E] border border-white/50 dark:border-[#333333]"
    >
      {/* Header and Two Pill Tabs */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#333333] pb-3">
        <h2 className="font-extrabold text-base sm:text-lg text-gray-800 dark:text-[#E0E0E0] flex items-center gap-2">
          <span>{isHi ? 'पत्ती की तस्वीर दें' : 'Input Crop Image'}</span>
        </h2>

        {/* Pill Tab Switchers */}
        <div className="flex bg-emerald-50/80 dark:bg-[#121212]/90 p-1 rounded-full border border-emerald-100 dark:border-[#333333] shadow-inner">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 transform ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white shadow-md scale-105'
                : 'text-gray-600 dark:text-[#B0B0B0] hover:text-primary dark:hover:text-[#E0E0E0] hover:scale-105'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isHi ? 'अपलोड' : 'Upload'}</span>
          </button>
          <button
            type="button"
            onClick={startCamera}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 transform ${
              activeTab === 'camera'
                ? 'bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white shadow-md scale-105'
                : 'text-gray-600 dark:text-[#B0B0B0] hover:text-primary dark:hover:text-[#E0E0E0] hover:scale-105'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isHi ? 'कैमरा' : 'Camera'}</span>
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Hidden canvas for video frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Upload Zone with Dashed Border, Centered Icon & Text, Hover Effect */}
      {activeTab === 'camera' && cameraActive ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-primary dark:border-emerald-600 bg-black aspect-video flex items-center justify-center shadow-md">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-3 flex items-center gap-3">
            <button
              type="button"
              onClick={capturePhoto}
              className="btn-gradient px-5 py-2 text-xs font-bold shadow-lg flex items-center gap-2 border border-white/40"
            >
              <Camera className="w-4 h-4" />
              <span>{isHi ? 'फोटो खींचें' : 'Capture Leaf'}</span>
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-gray-800/85 hover:bg-gray-900 text-white font-semibold px-4 py-2 rounded-full text-xs transition-transform hover:scale-105"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>
      ) : previewUrl ? (
        /* Image Preview Box */
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-[#181818] p-3 group shadow-inner">
          <div className="relative w-full max-h-64 h-56 flex items-center justify-center bg-white dark:bg-[#121212] rounded-xl overflow-hidden border border-emerald-100 dark:border-[#333333] shadow-sm">
            <img
              src={previewUrl}
              alt="Selected crop leaf"
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 shadow-md transition-all transform hover:scale-110"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#B0B0B0] mt-2.5 px-1">
            <span className="truncate max-w-[200px] font-semibold text-gray-700 dark:text-[#E0E0E0]">
              {selectedImage?.name || 'leaf_photo.jpg'}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-pill-light px-3 py-1 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              <span>{isHi ? 'बदलें' : 'Change'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dashed Border Drag & Drop Zone, Centered Vertically, Light Green BG / Dark Mode Gray BG */
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-green-300 dark:border-[#333333] hover:border-primary dark:hover:border-emerald-500 bg-green-50/50 dark:bg-[#181818] hover:bg-green-100/60 dark:hover:bg-[#222222] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group min-h-[200px]"
        >
          <div className="w-14 h-14 mx-auto mb-3.5 rounded-full bg-white dark:bg-[#252525] shadow-sm border border-green-200 dark:border-[#333333] flex items-center justify-center text-primary dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <p className="font-extrabold text-sm sm:text-base text-gray-800 dark:text-[#E0E0E0]">
            {isHi ? 'पत्ती की फोटो यहाँ खींचकर लाएँ या क्लिक करें' : 'Drag & drop leaf photo or click to browse'}
          </p>
          <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1">
            {isHi ? 'JPG, PNG, WebP समर्थित (टमाटर पत्ता)' : 'Supports JPG, PNG, WebP (Tomato Leaf)'}
          </p>
        </div>
      )}

      {cameraError && (
        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900/60">
          {cameraError}
        </div>
      )}

      {/* Quick Sample Leaf Buttons for Instant Testing */}
      <div className="pt-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-[#B0B0B0] uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>{isHi ? 'त्वरित परीक्षण नमूने' : 'Quick Test Samples'}:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {sampleLeafTests.map((sample) => (
            <button
              key={sample.key}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="text-left text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-[#333333] hover:border-primary dark:hover:border-emerald-500 bg-gray-50 dark:bg-[#242424] hover:bg-emerald-50 dark:hover:bg-[#2C2C2C] font-medium text-gray-700 dark:text-[#E0E0E0] transition-all duration-150 transform hover:scale-[1.02] shadow-sm truncate"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Analyze Button: Gradient Pill, Soft Shadow, Hover Scale(1.05) & Shadow-lg, Spinner on analyzing */}
      <button
        type="button"
        onClick={onAnalyze}
        disabled={!selectedImage || isAnalyzing}
        className={`w-full py-3.5 px-6 rounded-full font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-all duration-200 ${
          !selectedImage || isAnalyzing
            ? 'bg-gray-200 dark:bg-[#262626] text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none'
            : 'btn-gradient hover:shadow-lg dark:shadow-emerald-950/50'
        }`}
      >
        {isAnalyzing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>{isHi ? 'AI जांच कर रहा है...' : 'AI Analyzing Leaf...'}</span>
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            <span>{isHi ? 'बीमारी की जांच करें (Analyze)' : 'Analyze Crop Health'}</span>
          </>
        )}
      </button>
    </div>
  );
}
