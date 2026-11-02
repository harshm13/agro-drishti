import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Share2,
  Printer,
  Sparkles,
  Droplet,
  Clock,
  Shield,
  Layers,
  Calendar,
  ExternalLink
} from 'lucide-react';

const ResultCard = ({ result, language }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!result) return null;

  const {
    disease = 'Unknown',
    confidence = 0,
    is_healthy = false,
    solution = {},
    top_predictions = []
  } = result;

  // Normalize confidence whether received as 0.0-1.0 decimal or 0-100 percentage
  const rawConfidence = typeof confidence === 'number' ? confidence : parseFloat(confidence) || 0;
  const normalizedConfidence = rawConfidence <= 1.0 && rawConfidence > 0
    ? Math.round(rawConfidence * 1000) / 10
    : Math.round(rawConfidence * 10) / 10;

  // Confidence bar color strictly per specification: Green >90%, Orange 70-90%, Red <70%
  let progressBarColor = 'from-red-500 to-rose-600';
  if (normalizedConfidence > 90) {
    progressBarColor = 'from-emerald-500 to-green-600';
  } else if (normalizedConfidence >= 70) {
    progressBarColor = 'from-amber-400 to-amber-600';
  }

  // Severity styling & badge
  let severityBadge = {
    label: language === 'hi' ? 'उच्च जोखिम (High Risk)' : 'High Risk',
    color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
    icon: AlertTriangle
  };

  if (is_healthy) {
    severityBadge = {
      label: language === 'hi' ? '✅ 100% स्वस्थ फसल' : '✅ 100% Healthy',
      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      icon: CheckCircle
    };
  } else if (normalizedConfidence < 70) {
    severityBadge = {
      label: language === 'hi' ? '⚠️ कम जोखिम (Low Risk)' : '⚠️ Low Risk',
      color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
      icon: AlertTriangle
    };
  } else if (normalizedConfidence <= 90) {
    severityBadge = {
      label: language === 'hi' ? '⚠️ मध्यम / कम जोखिम (Low Risk)' : '⚠️ Low Risk',
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
      icon: AlertTriangle
    };
  }

  // Bilingual strings with robust multi-tiered fallbacks
  const displayName =
    language === 'hi'
      ? solution.name_hi || disease.replace(/___/g, ' ').replace(/_/g, ' ')
      : solution.name_en || disease.replace(/___/g, ' ').replace(/_/g, ' ');

  const summarySolution =
    language === 'hi'
      ? solution.solution_hindi || solution.solution
      : solution.solution_english || solution.solution;

  const prepStep =
    language === 'hi'
      ? solution.steps_hi?.prep || (solution.solution_hindi ? `${solution.solution_hindi} (खुराक: ${solution.dosage || 'निर्देशानुसार'})` : solution.dosage) || 'तैयारी विधि एवं उचित खुराक'
      : solution.steps_en?.prep || (solution.solution_english ? `${solution.solution_english} (Dosage: ${solution.dosage || 'As indicated'})` : solution.dosage) || 'Preparation and dosage instructions';

  const applyStep =
    language === 'hi'
      ? solution.steps_hi?.apply || solution.frequency || 'हर 7 से 10 दिनों में सुबह की पहली धूप या शाम के समय छिड़काव करें।'
      : solution.steps_en?.apply || solution.frequency || 'Spray every 7-10 days during dawn or late evening.';

  const preventStep =
    language === 'hi'
      ? solution.steps_hi?.prevent || solution.seasonal_tip || 'खेत में स्वच्छता रखें और नमी व फफूंद से बचाव हेतु हवा का आवागमन बनाए रखें।'
      : solution.steps_en?.prevent || solution.seasonal_tip || 'Maintain field sanitation, proper crop spacing, and moisture balance.';

  // Text-To-Speech SpeechSynthesis
  const speakPrescription = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak =
      language === 'hi'
        ? solution.audio_hi ||
          `एग्रोदृष्टि निदान: ${displayName}। उपचार: ${prepStep}। छिड़काव: ${applyStep}`
        : solution.audio_en ||
          `AgroDrishti diagnosis: ${displayName}. Treatment: ${prepStep}. Application: ${applyStep}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Stop audio on unmount or result change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [result]);

  // WhatsApp 1-Click Share
  const handleWhatsAppShare = () => {
    const shareMessage =
      language === 'hi'
        ? `🌾 *AgroDrishti फसल निदान रिपोर्ट*\n\n` +
          `• *रोग/स्थिति*: ${displayName}\n` +
          `• *विश्वास दर*: ${confidence}%\n` +
          `• *खुराक (तैयारी)*: ${prepStep}\n` +
          `• *छिड़काव (समय)*: ${applyStep}\n` +
          `• *रोकथाम*: ${preventStep}\n\n` +
          `_AgroDrishti AI (Photo खींचो, बीमारी भगाओ)_`
        : `🌾 *AgroDrishti Foliage Pathology Report*\n\n` +
          `• *Diagnosis*: ${displayName}\n` +
          `• *Confidence*: ${confidence}%\n` +
          `• *Preparation*: ${prepStep}\n` +
          `• *Application*: ${applyStep}\n` +
          `• *Prevention*: ${preventStep}\n\n` +
          `_AgroDrishti AI Crop Doctor_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  // Print slip
  const handlePrint = () => {
    window.print();
  };

  const SeverityIcon = severityBadge.icon;

  return (
    <div className="glass-card animate-fade-slide-up rounded-3xl p-6 sm:p-8 border border-green-200 dark:border-dark-border shadow-2xl relative overflow-hidden">
      
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-52 h-52 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Explicit Demo Warning Banner */}
      {result.is_demo && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {language === 'hi'
                ? '⚠️ डेमो — यह वास्तविक निदान नहीं है (सिम्युलेटर मोड)'
                : '⚠️ DEMO — NOT A REAL DIAGNOSIS (Demo Mode Active)'}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-[10px] tracking-wider uppercase font-mono font-extrabold">
            DEMO
          </span>
        </div>
      )}

      {/* Header: Disease Name & Severity Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 dark:border-dark-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-wider uppercase text-primary dark:text-secondary">
              {language === 'hi' ? 'निदान परिणाम (Diagnosis)' : 'Pathology Report'}
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'hi' ? '100% जैविक सलाह' : '100% Biological Advice'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {displayName}
          </h2>
        </div>

        {/* Severity Badge */}
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold border ${severityBadge.color}`}>
          <SeverityIcon className="w-4 h-4" />
          <span>{severityBadge.label}</span>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1.5">
          <span className="text-gray-600 dark:text-gray-300">
            {language === 'hi' ? 'AI विश्वास दर (Confidence Score):' : 'AI Confidence Score:'}
          </span>
          <span className="font-extrabold text-gray-900 dark:text-white">
            {normalizedConfidence}%
          </span>
        </div>

        <div className="w-full h-3 bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-gray-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressBarColor} transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(normalizedConfidence, 100)}%` }}
          />
        </div>

        {/* Top 2 Predictions Breakdown if available */}
        {top_predictions.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-500 dark:text-gray-400">
            <span>{language === 'hi' ? 'संभावित अन्य वर्ग:' : 'Secondary class probability:'}</span>
            {top_predictions.slice(1).map((item, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-gray-800">
                {item.disease.replace(/___/g, ' ').replace(/_/g, ' ')}: {typeof item.confidence === 'number' && item.confidence <= 1 ? Math.round(item.confidence * 100) : item.confidence}%
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Summary Highlight Box if available */}
      {summarySolution && (
        <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary dark:text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
              {language === 'hi' ? 'त्वरित जैविक समाधान' : 'Recommended Organic Solution'}
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5 leading-snug">
              {summarySolution}
            </p>
          </div>
        </div>
      )}

      {/* 3-Step Treatment Plan Grid */}
      <div className="mt-7">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary dark:text-secondary" />
          <span>
            {language === 'hi'
              ? '3-चरणीय जैविक उपचार योजना (Treatment Plan)'
              : '3-Step Biological Prescription'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Step 1: Preparation */}
          <div className="rounded-2xl p-4 sm:p-5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 relative">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                {language === 'hi' ? 'तैयारी व खुराक (Dosage)' : 'Preparation & Dose'}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {prepStep}
            </p>
          </div>

          {/* Step 2: Application */}
          <div className="rounded-2xl p-4 sm:p-5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 relative">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {language === 'hi' ? 'छिड़काव विधि (Application)' : 'Application Timing'}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {applyStep}
            </p>
          </div>

          {/* Step 3: Prevention */}
          <div className="rounded-2xl p-4 sm:p-5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 relative">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                {language === 'hi' ? 'रोकथाम सलाह (Prevention)' : 'Sanitation & Tips'}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {preventStep}
            </p>
          </div>

        </div>
      </div>

      {/* Action Footer: Audio TTS Player, WhatsApp Share, Print */}
      <div className="mt-7 pt-5 border-t border-gray-200/80 dark:border-dark-border flex flex-wrap items-center justify-between gap-3">
        
        {/* Animated TTS Audio Voice Player */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={speakPrescription}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md ${
              isPlayingAudio
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'btn-gradient'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{language === 'hi' ? 'आवाज रोकें' : 'Stop Audio'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>{language === 'hi' ? 'सलाह सुनें (Voice)' : 'Listen Prescription'}</span>
              </>
            )}
          </button>

          {/* Equalizer Waveform Bars (Active when speaking) */}
          {isPlayingAudio && (
            <div className="flex items-center h-6 px-2 py-1 bg-green-50 dark:bg-green-950/40 rounded-full border border-green-200 dark:border-green-800">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </div>
          )}
        </div>

        {/* WhatsApp & Print Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md transition-all active:scale-95"
            title="Share diagnosis on WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span>{language === 'hi' ? 'व्हाट्सएप शेयर' : 'WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border transition-all active:scale-95"
            title="Print or Save Prescription Slip"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'hi' ? 'पर्ची प्रिंट' : 'Print Slip'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default ResultCard;
