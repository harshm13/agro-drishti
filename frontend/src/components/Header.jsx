import React from 'react';
import { Leaf, Sparkles } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';

export default function Header({
  language,
  setLanguage,
  isModelLoaded,
  isDarkMode,
  setIsDarkMode,
}) {
  const isHi = language === 'hi';

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-[#2E7D32] via-[#388E3C] to-[#81C784] dark:from-[#113314] dark:via-[#1a441d] dark:to-[#153417] text-white shadow-md dark:border-b dark:border-[#333333] transition-colors duration-200">
      {/* Subtle organic light reflections */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-950/20 dark:bg-black/30 rounded-full blur-xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-13 h-13 p-2.5 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30 dark:border-white/20 transform hover:scale-105 transition-all">
              <Leaf className="w-8 h-8 text-white drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans">
                  AgroDrishti
                </h1>
                <span className="text-xs bg-amber-400 dark:bg-amber-500 text-stone-900 font-extrabold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
                  {isHi ? 'एग्रोदृष्टि' : 'v1.0'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-emerald-100 dark:text-emerald-200/90 tracking-wide mt-0.5">
                {isHi
                  ? 'AI-संचालित फसल रोग पहचान एवं 100% प्राकृतिक जैविक समाधान'
                  : 'AI-Powered Crop Disease Detection with Biological Solutions'}
              </p>
            </div>
          </div>

          {/* Right Section: Backend Status Badge, Language Switcher & Dark Mode Toggle */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Real-time Backend Connection Status Badge */}
            <div
              title={
                isModelLoaded
                  ? 'Flask backend server is running and ready on port 5000'
                  : 'Flask backend server is currently offline. Start with: python app.py'
              }
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border shadow-sm ${
                isModelLoaded
                  ? 'bg-emerald-900/90 dark:bg-[#1A331D] text-white border-emerald-400/60'
                  : 'bg-rose-900/90 dark:bg-rose-950 text-rose-100 border-rose-500/60'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isModelLoaded ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span>
                {isModelLoaded
                  ? (isHi ? 'सर्वर चालू (पोर्ट 5000)' : 'Flask API (5000) Live')
                  : (isHi ? 'सर्वर बंद (Offline)' : 'Backend Offline')}
              </span>
            </div>

            {/* Language Toggle Component */}
            <LanguageToggle language={language} setLanguage={setLanguage} />

            {/* Dark Mode Theme Toggle Component */}
            <ThemeToggle
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              language={language}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
