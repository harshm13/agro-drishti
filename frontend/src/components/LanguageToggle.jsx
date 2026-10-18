import React from 'react';
import { Globe } from 'lucide-react';

export default function LanguageToggle({ language, setLanguage }) {
  return (
    <div className="flex items-center gap-2 bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 dark:border-[#333333] shadow-md transition-colors duration-200">
      <Globe className="w-4 h-4 text-primary dark:text-emerald-400" />
      <div className="flex rounded-full bg-emerald-50/80 dark:bg-[#121212]/90 p-0.5 border border-emerald-100 dark:border-[#333333]">
        <button
          type="button"
          onClick={() => setLanguage('hi')}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
            language === 'hi'
              ? 'bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white shadow-md transform scale-105'
              : 'text-gray-600 dark:text-[#B0B0B0] hover:text-primary dark:hover:text-[#E0E0E0] hover:scale-105'
          }`}
          aria-label="Switch to Hindi"
        >
          🇮🇳 हिंदी
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
            language === 'en'
              ? 'bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white shadow-md transform scale-105'
              : 'text-gray-600 dark:text-[#B0B0B0] hover:text-primary dark:hover:text-[#E0E0E0] hover:scale-105'
          }`}
          aria-label="Switch to English"
        >
          🇺🇸 English
        </button>
      </div>
    </div>
  );
}
