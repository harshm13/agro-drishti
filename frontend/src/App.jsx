import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import UploadSection from './components/UploadSection';
import ResultCard from './components/ResultCard';
import Footer from './components/Footer';
import { predictDisease, predictDiseaseReal, predictDiseaseMock, checkBackendHealth } from './utils/api';
import { History } from 'lucide-react';

export default function App() {
  // Dark Mode State: default false or detect system preference, synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved !== null) {
        return saved === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  // Effect to apply/remove 'dark' class on <html> & <body> and persist to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      try {
        localStorage.setItem('theme', 'dark');
      } catch (e) {}
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      try {
        localStorage.setItem('theme', 'light');
      } catch (e) {}
    }
  }, [isDarkMode]);

  // Language State: 'hi' (Hindi) or 'en' (English)
  const [language, setLanguage] = useState('hi');

  // Core App States as required
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [scanCount, setScanCount] = useState(1483);
  
  // Recent scans (last 5 predictions)
  const [recentScans, setRecentScans] = useState([
    {
      disease: 'Tomato_Early_Blight',
      name_hi: 'टमाटर अगेती झुलसा',
      name_en: 'Tomato Early Blight',
      confidence: 0.94,
      is_healthy: false,
      timestamp: '12:40 PM',
    },
    {
      disease: 'Tomato_healthy',
      name_hi: 'स्वस्थ पौधा',
      name_en: 'Healthy Tomato Plant',
      confidence: 0.99,
      is_healthy: true,
      timestamp: '11:15 AM',
    },
  ]);

  // API Mode toggle: 'real' (default, Flask API at :5000) or 'mock' (fallback/testing)
  const [apiMode, setApiMode] = useState('real');
  const [isModelLoaded, setIsModelLoaded] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Periodically check Flask backend health
  useEffect(() => {
    let isMounted = true;
    const verifyHealth = async () => {
      const health = await checkBackendHealth();
      if (isMounted) {
        setIsModelLoaded(health.model === 'loaded' || health.status === 'healthy');
      }
    };
    verifyHealth();
    const timer = setInterval(verifyHealth, 8000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const isHi = language === 'hi';

  const stats = {
    totalScans: scanCount,
    healthyRate: 88.5,
    activeAlerts: 3,
    isModelLoaded: isModelLoaded,
  };

  // Image selection handler
  const handleImageSelected = (file) => {
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPredictionResult(null); // Clear previous result until user clicks Analyze
    setErrorMessage(null); // Clear any previous error
  };

  // Clear selected image handler
  const handleClearImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPredictionResult(null);
    setErrorMessage(null);
  };

  // Primary Analyze Action: sends selected image to Flask backend
  const handleAnalyze = async () => {
    if (!selectedImage) return;

    // 1. Set isAnalyzing = true (triggers loading spinner)
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // 2. Call real Flask API in real mode, or mock ONLY in explicit demo mode
      const result = apiMode === 'real'
        ? await predictDisease(selectedImage)
        : await predictDiseaseMock(selectedImage);

      if (result) {
        // 3. On success: update predictionResult, increment scanCount, add to recentScans
        setPredictionResult(result);
        setScanCount((prev) => prev + 1);

        const isUncertain = result.disease === 'uncertain';
        const newScanEntry = {
          disease: result.disease,
          name_hi: isUncertain ? 'अनिश्चित (कम स्पष्ट)' : (result.solution?.name_hi || result.disease),
          name_en: isUncertain ? 'Uncertain (Low Confidence)' : (result.solution?.name_en || result.disease.replace(/_/g, ' ')),
          confidence: result.confidence,
          is_healthy: result.is_healthy,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setRecentScans((prev) => [newScanEntry, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      console.error('Analyze error:', err);
      setPredictionResult(null);
      setErrorMessage(`Backend se result nahi aaya: ${err.message}. Kya Flask server chal raha hai?`);
    } finally {
      // 4. Set isAnalyzing = false
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#121212] font-sans antialiased text-[#212121] dark:text-[#E0E0E0] transition-colors duration-200">
      {/* 1. Header with Gradient background, branding, Language toggle & Dark mode switch */}
      <Header
        language={language}
        setLanguage={setLanguage}
        apiMode={apiMode}
        setApiMode={setApiMode}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full pb-8">
        {/* 2. Stats Bar with 4 Glassmorphism Cards */}
        <StatsBar stats={stats} language={language} />

        {/* 2-Column Responsive Layout (Stacks on mobile: 1 col, Desktop: 2 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Upload Section & Recent Scans History (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 3. Upload Zone Component */}
            <UploadSection
              onImageSelected={handleImageSelected}
              onAnalyze={handleAnalyze}
              selectedImage={selectedImage}
              previewUrl={previewUrl}
              onClear={handleClearImage}
              isAnalyzing={isAnalyzing}
              language={language}
            />

            {/* Recent Scans History Widget with Glassmorphism */}
            <div
              className="glass-card p-4 rounded-2xl shadow-md transition-all bg-white/80 dark:bg-[#1E1E1E] border border-white/50 dark:border-[#333333]"
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-[#E0E0E0] mb-3 pb-2 border-b border-gray-100 dark:border-[#333333]">
                <span className="flex items-center gap-1.5 text-primary dark:text-emerald-400">
                  <History className="w-4 h-4" />
                  <span>{isHi ? 'हाल के स्कैन (Recent Scans)' : 'Recent Scans'}</span>
                </span>
                <span className="text-[10px] text-gray-400 dark:text-[#B0B0B0] font-bold bg-gray-100 dark:bg-[#252525] px-2 py-0.5 rounded-full border border-gray-200/50 dark:border-[#333333]">
                  Last 5
                </span>
              </div>

              <div className="space-y-2">
                {recentScans.map((scan, idx) => {
                  const confPct = scan.confidence <= 1 ? Math.round(scan.confidence * 100) : Math.round(scan.confidence);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/70 dark:bg-[#252525] hover:bg-emerald-50/80 dark:hover:bg-[#2D3A2E] transition-all duration-150 border border-gray-100 dark:border-[#333333] shadow-sm transform hover:translate-x-1"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={scan.is_healthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                          {scan.is_healthy ? '🟢' : '🔴'}
                        </span>
                        <span className="font-bold text-gray-800 dark:text-[#E0E0E0] truncate">
                          {isHi ? scan.name_hi || scan.name_en : scan.name_en}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-[#B0B0B0] font-medium whitespace-nowrap ml-2">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800 mr-2">
                          {confPct}%
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">{scan.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: 4. Result Card / Diagnosis & Bio-Solution (7 cols on lg) */}
          <div className="lg:col-span-7">
            {errorMessage ? (
              <div className="glass-card p-6 sm:p-8 rounded-2xl border-2 border-rose-400 dark:border-rose-800 bg-rose-50/95 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 shadow-lg space-y-4 animate-fade-in">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 shadow-inner text-2xl font-bold">
                    ⚠️
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-extrabold text-base sm:text-lg text-rose-900 dark:text-rose-100">
                      {isHi ? 'सर्वर से संपर्क नहीं हो पाया (Backend Connection Error)' : 'Backend Connection Error'}
                    </h3>
                    <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-200/90 font-medium leading-relaxed">
                      {errorMessage}
                    </p>
                    <div className="pt-2 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <span>💡</span>
                      <span>
                        {isHi
                          ? 'टर्मिनल में जांचें: `python backend/app.py` पोर्ट 5000 पर चालू होना चाहिए।'
                          : 'Please check your terminal: verify `python backend/app.py` is running on port 5000.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ResultCard result={predictionResult} language={language} />
            )}
          </div>
        </div>
      </main>

      {/* 6. Footer Component */}
      <Footer language={language} />
    </div>
  );
}
