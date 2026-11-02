import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import UploadSection from './components/UploadSection';
import ResultCard from './components/ResultCard';
import Footer from './components/Footer';
import { predictDiseaseReal, predictDiseaseMock, checkBackendHealth } from './utils/api';
import { AlertCircle, History, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import './styles/theme.css';

function App() {
  // Theme state persisted in localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('agro_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Language state persisted in localStorage ('hi' | 'en')
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agro_language') || 'hi';
  });

  // Image & Diagnostic States
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [scanCount, setScanCount] = useState(148);
  const [recentScans, setRecentScans] = useState([]);
  
  // Backend & Fallback Mode
  const [backendOnline, setBackendOnline] = useState(false);
  const [useMockMode, setUseMockMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Sync Dark Mode class with <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('agro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('agro_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync Language preference
  useEffect(() => {
    localStorage.setItem('agro_language', language);
  }, [language]);

  // Periodically probe backend health
  useEffect(() => {
    const probe = async () => {
      const isAlive = await checkBackendHealth();
      setBackendOnline(isAlive);
    };

    probe();
    const interval = setInterval(probe, 25000);
    return () => clearInterval(interval);
  }, []);

  // Main Analysis Trigger
  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setStatusMessage(null);

    try {
      let data = null;

      if (!useMockMode) {
        try {
          data = await predictDiseaseReal(selectedImage);
          setBackendOnline(true);
        } catch (backendErr) {
          console.error('Real backend call failed:', backendErr);
          setBackendOnline(false);
          const errorMsg = backendErr.response?.data?.error
            || (language === 'hi'
                ? 'बैकएंड सर्वर (http://localhost:5000) ऑफ़लाइन है। कृपया Flask बैकएंड चालू करें या ऊपर "सिम्युलेशन मोड" चुनें।'
                : 'Flask backend (http://localhost:5000) is offline or failed. Please check the backend or switch to Demo mode.');
          setStatusMessage({
            type: 'error',
            text: errorMsg
          });
          setPredictionResult(null);
          return; // Strictly DO NOT fall back to mock data silently
        }
      } else {
        data = await predictDiseaseMock(selectedImage);
      }

      setPredictionResult(data);
      setScanCount((prev) => prev + 1);

      // Celebrate if crop is healthy!
      if (data.is_healthy) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2E7D32', '#4CAF50', '#A5D6A7', '#FFB300']
        });
      }

      // Add to recent scans history only if real prediction (never save demo data as real history)
      if (!useMockMode && !data.is_demo) {
        const confVal = typeof data.confidence === 'number' && data.confidence <= 1.0 ? Math.round(data.confidence * 100) : Math.round(data.confidence);
        const historyItem = {
          id: Date.now(),
          disease: data.disease,
          confidence: confVal,
          is_healthy: data.is_healthy,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          preview: previewUrl,
          resultData: data
        };

        setRecentScans((prev) => [historyItem, ...prev.slice(0, 4)]);
      }

    } catch (err) {
      console.error('Fatal diagnosis error:', err);
      setStatusMessage({
        type: 'error',
        text: language === 'hi'
          ? 'जांच के दौरान त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Diagnostic analysis failed. Please try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#121212] text-[#212121] dark:text-[#E0E0E0] transition-colors duration-300">
      
      {/* Header */}
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        language={language}
        setLanguage={setLanguage}
        backendOnline={backendOnline}
        useMockMode={useMockMode}
        setUseMockMode={setUseMockMode}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Top 4 Bento Stats Bar */}
        <StatsBar
          scanCount={scanCount}
          recentScans={recentScans}
          language={language}
          backendOnline={backendOnline}
          useMockMode={useMockMode}
        />

        {/* Temporary Status / Toast Banner */}
        {statusMessage && (
          <div className="max-w-4xl mx-auto mt-4 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-slide-up">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2-Column Responsive Workspace */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Leaf Capture, Upload, Laser HUD Reticle (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span>
                  {language === 'hi' ? 'फसल की पत्ती स्कैन करें' : 'Scan Diseased Leaf'}
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi'
                  ? 'स्पष्ट फोटो खींचें या अपलोड करें — AI तुरन्त निदान देगा'
                  : 'Capture or upload foliage image for instant deep learning pathology'}
              </p>
            </div>

            <UploadSection
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              isAnalyzing={isAnalyzing}
              onAnalyze={handleAnalyze}
              language={language}
            />
          </div>

          {/* Right Column: Diagnostic Prescription Slip & History (col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* If Diagnosis Result is available, display ResultCard */}
            {predictionResult ? (
              <ResultCard result={predictionResult} language={language} />
            ) : (
              /* Empty Standby Hero Card */
              <div className="glass-card rounded-3xl p-8 sm:p-12 text-center border border-dashed border-gray-300 dark:border-dark-border flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-secondary mb-4 animate-bounce">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {language === 'hi'
                    ? 'AI निदान प्रतीक्षा में है'
                    : 'Awaiting Leaf Inspection'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
                  {language === 'hi'
                    ? 'बाईं ओर पत्ती की फोटो अपलोड करें और "बीमारी की जांच करें" बटन दबाएं। आपको 100% जैविक व प्राकृतिक उपचार की पर्ची प्राप्त होगी।'
                    : 'Upload or capture a crop leaf on the left and tap Diagnose. AgroDrishti will generate a certified biological prescription.'}
                </p>
              </div>
            )}

            {/* Scan History / Comparison Strip */}
            {recentScans.length > 0 && (
              <div className="glass-card rounded-3xl p-5 border border-green-200/60 dark:border-dark-border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-primary dark:text-secondary" />
                    <h4 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
                      {language === 'hi' ? 'हालिया स्कैन इतिहास' : 'Recent Scan History'}
                    </h4>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {recentScans.length} {language === 'hi' ? 'सहेजे गए' : 'cached'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {recentScans.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPredictionResult(item.resultData)}
                      className="p-2 rounded-xl bg-gray-50 dark:bg-dark-surface/60 border border-gray-200 dark:border-gray-800 hover:border-primary text-left transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        {item.preview && (
                          <img
                            src={item.preview}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-primary">
                            {item.disease.replace(/___/g, ' ').replace(/_/g, ' ')}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {item.confidence}% • {item.timestamp}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer language={language} />

    </div>
  );
}

export default App;
