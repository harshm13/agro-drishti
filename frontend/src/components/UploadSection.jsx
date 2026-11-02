import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  Maximize2
} from 'lucide-react';

const UploadSection = ({
  selectedImage,
  setSelectedImage,
  previewUrl,
  setPreviewUrl,
  isAnalyzing,
  onAnalyze,
  language
}) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'camera'
  const [isDragOver, setIsDragOver] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  // Interactive Lens Magnifier State
  const [lensPos, setLensPos] = useState({ x: 0, y: 0, show: false });
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'hi' ? 'कृपया केवल फोटो (JPG/PNG) फाइल चुनें।' : 'Please choose an image file (JPG/PNG).');
      return;
    }
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    stopCamera();
  };

  // Live Camera Handlers
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(
        language === 'hi'
          ? 'कैमरा शुरू नहीं हो सका। कृपया अनुमति दें या फाइल अपलोड का प्रयोग करें।'
          : 'Could not access camera. Please allow permissions or use file upload.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `leaf_snap_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedImage(file);
        setPreviewUrl(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  // Switch tabs
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  // Clear current image
  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  // Interactive Disease Lens (Magnifier) coordinates
  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    if (x >= 0 && x <= width && y >= 0 && y <= height) {
      setLensPos({ x, y, show: true });
    } else {
      setLensPos((prev) => ({ ...prev, show: false }));
    }
  };

  const handleMouseLeave = () => {
    setLensPos((prev) => ({ ...prev, show: false }));
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Preset demo samples to test immediately
  const loadPresetDemo = async (type) => {
    // We create realistic sample canvas representations for instant 1-click test
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Draw background leaf
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(0, 0, 300, 300);

    // Draw stylized leaf
    ctx.beginPath();
    ctx.ellipse(150, 150, 110, 130, 0, 0, 2 * Math.PI);
    ctx.fillStyle = type === 'healthy' ? '#22c55e' : '#65a30d';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#15803d';
    ctx.stroke();

    // Central vein
    ctx.beginPath();
    ctx.moveTo(150, 30);
    ctx.lineTo(150, 270);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#14532d';
    ctx.stroke();

    // Add lesions if diseased
    if (type === 'early_blight') {
      // Concentric target spots
      for (let i = 0; i < 4; i++) {
        const sx = 100 + i * 25;
        const sy = 90 + i * 30;
        ctx.beginPath();
        ctx.arc(sx, sy, 18, 0, 2 * Math.PI);
        ctx.fillStyle = '#78350f';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#451a03';
        ctx.fill();
      }
    } else if (type === 'late_blight') {
      // Water soaked dark blotches
      ctx.beginPath();
      ctx.ellipse(130, 170, 45, 30, Math.PI / 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#292524';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(180, 110, 35, 25, -Math.PI / 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#1c1917';
      ctx.fill();
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${type}_leaf_sample.jpg`, { type: 'image/jpeg' });
        setSelectedImage(file);
        setPreviewUrl(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-7 border border-green-200 dark:border-dark-border shadow-xl transition-all duration-300">
      
      {/* Tab Switcher: Upload File vs Camera */}
      <div className="flex items-center justify-between border-b border-gray-200/80 dark:border-dark-border pb-4 mb-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabSwitch('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'hi' ? '📁 फोटो अपलोड' : '📁 Upload File'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('camera')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'camera'
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'hi' ? '📸 लाइव कैमरा' : '📸 Camera'}</span>
          </button>
        </div>

        {/* Reset Preview button */}
        {previewUrl && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'बदलें' : 'Clear'}</span>
          </button>
        )}
      </div>

      {/* Main Inspection View Area */}
      <div className="relative">
        
        {/* If Image is Previewed: Show 21st.dev Laser Reticle & Interactive Lens */}
        {previewUrl ? (
          <div className="relative w-full max-w-md mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 border-2 border-primary/40 dark:border-primary/60 shadow-inner group">
            
            {/* Cyber-Organic Reticle Corner Brackets */}
            <div className="hud-corner hud-top-left" />
            <div className="hud-corner hud-top-right" />
            <div className="hud-corner hud-bottom-left" />
            <div className="hud-corner hud-bottom-right" />

            {/* Scanning Laser Beam (Visible while analyzing or hovered) */}
            {(isAnalyzing || lensPos.show) && (
              <div className="laser-beam animate-laser" />
            )}

            {/* Target Leaf Image */}
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Leaf Preview"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-full h-full object-contain cursor-crosshair select-none"
            />

            {/* Interactive Disease Lens Magnifier (Aceternity Style) */}
            {lensPos.show && !isAnalyzing && (
              <div
                className="pointer-events-none absolute w-28 h-28 rounded-full border-2 border-primary-light shadow-2xl overflow-hidden z-30"
                style={{
                  left: `${lensPos.x - 56}px`,
                  top: `${lensPos.y - 56}px`,
                  backgroundImage: `url(${previewUrl})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${imgRef.current?.width ? imgRef.current.width * 2.2 : 600}px ${
                    imgRef.current?.height ? imgRef.current.height * 2.2 : 600
                  }px`,
                  backgroundPosition: `-${lensPos.x * 2.2 - 56}px -${lensPos.y * 2.2 - 56}px`,
                  boxShadow: '0 0 20px rgba(0,255,102,0.6), inset 0 0 15px rgba(255,255,255,0.4)',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                </div>
              </div>
            )}

            {/* Telemetry HUD Badge */}
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 border border-emerald-500/30">
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>{isAnalyzing ? 'HUD SCANNING...' : 'LENS MAGNIFIER ACTIVE'}</span>
            </div>
          </div>
        ) : activeTab === 'camera' ? (
          /* Live Camera Viewport */
          <div className="relative w-full max-w-md mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center border-2 border-green-300 dark:border-green-800 shadow-md">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="hud-corner hud-top-left" />
                <div className="hud-corner hud-top-right" />
                <div className="hud-corner hud-bottom-left" />
                <div className="hud-corner hud-bottom-right" />

                {/* Snap Button Overlay */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center z-20">
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-800 font-bold text-sm rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4 text-primary" />
                    <span>{language === 'hi' ? 'फोटो खींचें (Snap)' : 'Capture Leaf'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-gray-300 mb-4">
                  {cameraError || (language === 'hi' ? 'कैमरा शुरू किया जा रहा है...' : 'Initializing Camera...')}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn-gradient px-4 py-2 text-xs font-semibold"
                >
                  {language === 'hi' ? 'पुनः प्रयास करें' : 'Retry Camera'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Drag and Drop Upload Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`upload-zone rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] ${
              isDragOver ? 'dragover' : ''
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="p-4 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-secondary mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-9 h-9" />
            </div>

            <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
              {language === 'hi'
                ? 'रोगग्रस्त पत्ती की फोटो यहाँ खींचें या चुनें'
                : 'Drag & Drop diseased leaf image here'}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
              {language === 'hi'
                ? 'PNG, JPG, JPEG (स्पष्ट रोशनी में ली गई फोटो)'
                : 'Supports JPG, PNG, WEBP (Natural light recommended)'}
            </p>

            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-dark-surface border border-green-200 dark:border-dark-border text-primary dark:text-secondary shadow-sm">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'कंप्यूटर या फोन से चुनें' : 'Browse from Device'}</span>
            </span>
          </div>
        )}

      </div>

      {/* 1-Click Quick Demo Leaf Presets (Instant Tester) */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border/60">
        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent" />
          <span>
            {language === 'hi'
              ? 'त्वरित टेस्ट के लिए नमूना पत्ती चुनें:'
              : 'Quick 1-click test with sample foliage:'}
          </span>
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadPresetDemo('early_blight')}
            className="px-2.5 py-1 text-xs rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors"
          >
            🍂 {language === 'hi' ? 'अगेती झुलसा (Early Blight)' : 'Early Blight'}
          </button>
          <button
            type="button"
            onClick={() => loadPresetDemo('late_blight')}
            className="px-2.5 py-1 text-xs rounded-lg bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50 hover:bg-red-100 transition-colors"
          >
            🥀 {language === 'hi' ? 'पछेती झुलसा (Late Blight)' : 'Late Blight'}
          </button>
          <button
            type="button"
            onClick={() => loadPresetDemo('healthy')}
            className="px-2.5 py-1 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors"
          >
            🌱 {language === 'hi' ? 'स्वस्थ पत्ता (Healthy)' : 'Healthy Leaf'}
          </button>
        </div>
      </div>

      {/* Analyze CTA Button */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!selectedImage || isAnalyzing}
          className="btn-gradient w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-3 shadow-glow-green"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>
                {language === 'hi'
                  ? 'न्यूरल नेटवर्क विश्लेषण जारी है...'
                  : 'Analyzing Foliage Tissue...'}
              </span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>
                {language === 'hi'
                  ? 'बीमारी की जांच करें (Analyze Disease)'
                  : 'Diagnose Crop Disease'}
              </span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default UploadSection;
