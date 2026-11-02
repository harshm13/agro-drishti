import React from 'react';
import { Globe } from 'lucide-react';

const LanguageToggle = ({ language, setLanguage }) => {
  return (
    <div className="inline-flex items-center p-1 bg-white/70 dark:bg-dark-card/90 border border-green-200 dark:border-dark-border rounded-full shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-primary dark:text-secondary">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
          language === 'hi'
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white'
        }`}
      >
        हिन्दी
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
          language === 'en'
            ? 'bg-primary text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
