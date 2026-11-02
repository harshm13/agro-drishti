import React from 'react';
import { Leaf, Sun, Moon, Sparkles, Activity, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import LanguageToggle from './LanguageToggle';

const Header = ({
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  backendOnline,
  useMockMode,
  setUseMockMode,
  currentUser,
  onOpenAuthModal,
  onLogout,
  activeTab = 'scanner',
  setActiveTab = () => {},
}) => {
  return (
    <header className="relative w-full bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 text-white shadow-xl overflow-hidden">
      {/* Ambient background bio-glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="relative p-2.5 bg-white/15 dark:bg-black/20 rounded-2xl backdrop-blur-md border border-white/25 shadow-inner">
              <Leaf className="w-8 h-8 text-secondary-light drop-shadow-md animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-accent absolute top-1.5 right-1.5" />
            </div>

            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans">
                  AgroDrishti
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase bg-white/20 text-white rounded-full border border-white/30 backdrop-blur-sm">
                  v2.0 AI
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-emerald-100/90 mt-0.5">
                {language === 'hi'
                  ? 'Photo खींचो, बीमारी भगाओ • 100% जैविक उपचार'
                  : 'AI-Powered Foliage Pathology & 100% Biological Treatment'}
              </p>
            </div>
          </div>

          {/* Action Controls: Live Status, Mock Toggle, Dark Mode, Language, Auth */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            
            {/* Admin Switcher Toggle (Visible only if current user is admin) */}
            {currentUser && currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'scanner' ? 'admin' : 'scanner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all shadow-sm ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-amber-500/20 font-extrabold'
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                }`}
              >
                {activeTab === 'admin' ? (
                  <>
                    <Leaf className="w-3.5 h-3.5 text-emerald-900" />
                    <span>{language === 'hi' ? '🌱 स्कैनर पर लौटें' : '🌱 Scanner'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>{language === 'hi' ? '🛡️ एडमिन पोर्टल' : '🛡️ Admin Portal'}</span>
                  </>
                )}
              </button>
            )}

            {/* Backend Connectivity Status Badge */}
            <button
              type="button"
              onClick={() => setUseMockMode(!useMockMode)}
              title={
                useMockMode
                  ? 'Currently using Mock AI. Click to try Real Flask Backend.'
                  : backendOnline
                  ? 'Connected to Live Flask CNN. Click to switch to Mock.'
                  : 'Backend offline. Running on fallback simulator.'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all shadow-sm ${
                !useMockMode && backendOnline
                  ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-400/50 text-amber-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  !useMockMode && backendOnline
                    ? 'bg-emerald-400 animate-ping'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <Activity className="w-3.5 h-3.5 ml-0.5" />
              <span>
                {!useMockMode && backendOnline
                  ? language === 'hi' ? 'लाइव AI कनेक्टेड' : 'Live Flask CNN'
                  : language === 'hi' ? 'सिम्युलेशन मोड' : 'Mock Mode'}
              </span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/25 shadow-sm backdrop-blur-md transition-all duration-200"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-accent animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-100" />
              )}
            </button>

            {/* Language Selector */}
            <LanguageToggle language={language} setLanguage={setLanguage} />

            {/* User Auth Control */}
            {!currentUser ? (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/20 hover:bg-white/30 active:scale-95 text-white border border-white/30 backdrop-blur-md transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-200" />
                <span>{language === 'hi' ? 'लॉगिन / खाता' : 'Login / Register'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-black/25 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/40 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <span className="text-xs font-semibold max-w-[85px] sm:max-w-[110px] truncate text-white" title={currentUser.name}>
                    {currentUser.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-400 text-amber-950 font-black'
                        : 'bg-emerald-400/30 text-emerald-200 border border-emerald-400/40'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  title={language === 'hi' ? 'लॉगआउट करें' : 'Logout'}
                  className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-white/20 transition-colors ml-0.5"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Decorative Bottom Wave/Border */}
      <div className="w-full h-1 bg-gradient-to-r from-secondary-light via-accent to-secondary-dark opacity-60" />
    </header>
  );
};

export default Header;
