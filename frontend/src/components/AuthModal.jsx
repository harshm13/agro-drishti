import React, { useState } from 'react';
import { LogIn, UserPlus, Lock, Mail, User, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { loginUser, registerUser } from '../utils/api';

const AuthModal = ({ isOpen, onClose, onAuthSuccess, language }) => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError(language === 'hi' ? 'कृपया मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError(
        language === 'hi'
          ? 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।'
          : 'Password must be at least 8 characters long.'
      );
      return;
    }

    if (tab === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        setError(language === 'hi' ? 'कृपया पूरा नाम दर्ज करें।' : 'Please enter your full name (min 2 chars).');
        return;
      }
      if (password !== confirmPassword) {
        setError(language === 'hi' ? 'दोनों पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      let user = null;
      if (tab === 'login') {
        user = await loginUser(cleanEmail, password);
      } else {
        user = await registerUser(name.trim(), cleanEmail, password);
      }

      // Success
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      console.error('Authentication error:', err);
      const serverMsg =
        err.response?.data?.error ||
        (language === 'hi'
          ? 'प्रमाणीकरण विफल रहा। कृपया जांचें कि बैकएंड सर्वर चालू है।'
          : 'Authentication failed. Please verify credentials or check backend.');
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-slide-up">
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-3xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
        
        {/* Header decoration */}
        <div className="relative p-6 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">
                {language === 'hi' ? 'एग्रोदृष्टि खाता' : 'AgroDrishti Account'}
              </h3>
              <p className="text-xs text-emerald-100">
                {language === 'hi'
                  ? 'इतिहास सहेजें व किसान सहायता प्राप्त करें'
                  : 'Save foliage scan history & get expert support'}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-black/20 rounded-full backdrop-blur-sm text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`py-2 rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-white text-primary-800 shadow-md font-extrabold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'लॉग इन' : 'Login'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`py-2 rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-white text-primary-800 shadow-md font-extrabold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'पंजीकरण (Register)' : 'Register'}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-gray-800 dark:text-gray-200">
          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {language === 'hi' ? 'पूरा नाम (Full Name)' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. रमेश पटेल' : 'e.g. Ramesh Patel'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {language === 'hi' ? 'ईमेल पता (Email)' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {language === 'hi' ? 'पासवर्ड (Password - min 8 chars)' : 'Password (min 8 chars)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {language === 'hi' ? 'पासवर्ड की पुष्टि (Confirm Password)' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : tab === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'hi' ? 'लॉग इन करें' : 'Sign In'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{language === 'hi' ? 'खाता बनाएं' : 'Create Account'}</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-[11px] text-gray-500 dark:text-gray-400 pt-1">
            {language === 'hi'
              ? 'प्रवेश करके आप 100% सुरक्षित स्थानीय सत्र नीति स्वीकार करते हैं।'
              : 'Secure session with HttpOnly cookies & encrypted password hashing.'}
          </div>
        </form>

      </div>
    </div>
  );
};

export default AuthModal;
