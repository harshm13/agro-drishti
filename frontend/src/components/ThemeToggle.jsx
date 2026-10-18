import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ isDarkMode, setIsDarkMode, language }) {
  const isHi = language === 'hi';

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-md flex items-center justify-center border focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
        isDarkMode
          ? 'bg-[#1E1E1E]/95 text-amber-400 border-[#333333] hover:bg-[#282828] hover:border-amber-400/50 hover:shadow-amber-500/20 shadow-lg'
          : 'bg-white/95 text-gray-700 border-white/60 hover:text-emerald-800 hover:bg-white shadow-sm'
      }`}
      aria-label={
        isDarkMode
          ? isHi
            ? 'लाइट मोड चालू करें'
            : 'Switch to Light Mode'
          : isHi
            ? 'डार्क मोड चालू करें'
            : 'Switch to Dark Mode'
      }
      title={
        isDarkMode
          ? isHi
            ? 'लाइट मोड चालू करें (Light Mode)'
            : 'Switch to Light Mode'
          : isHi
            ? 'डार्क मोड चालू करें (Dark Mode)'
            : 'Switch to Dark Mode'
      }
    >
      {isDarkMode ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
      ) : (
        <Moon className="w-4 h-4 text-emerald-800 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
