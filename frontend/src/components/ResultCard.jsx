import React, { useState } from 'react';
import { Volume2, VolumeX, ShieldCheck, Sparkles, AlertTriangle, HelpCircle } from 'lucide-react';

export default function ResultCard({ result, language }) {
  const isHi = language === 'hi';
  const [isPlaying, setIsPlaying] = useState(false);

  // If no prediction yet, render an inviting glassmorphism placeholder card
  if (!result) {
    return (
      <div
        className="glass-card p-8 sm:p-10 rounded-2xl flex flex-col items-center justify-center text-center h-full min-h-[380px] border-dashed border-2 border-green-300 dark:border-[#333333] bg-white/80 dark:bg-[#1E1E1E] shadow-md transition-all"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-[#252525] border border-emerald-200/80 dark:border-[#333333] flex items-center justify-center text-3xl mb-4 shadow-sm animate-bounce">
          🌱
        </div>
        <h3 className="font-extrabold text-lg text-gray-800 dark:text-[#E0E0E0] mb-2">
          {isHi ? 'यहाँ आपकी फसल का निदान दिखेगा' : 'Diagnosis & Bio-Solution Results'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-[#B0B0B0] max-w-sm leading-relaxed">
          {isHi
            ? 'बाईं ओर से पत्ती की फोटो अपलोड करें और "बीमारी की जांच करें" पर क्लिक करें। AgroDrishti AI तुरंत सटीक रोग और 100% जैविक उपचार बताएगा।'
            : 'Select or snap a leaf photo on the left, then click "Analyze Crop Health". AgroDrishti AI will provide instant pathology & 100% organic remedies.'}
        </p>
      </div>
    );
  }

  const { disease, confidence = 0.95, solution = {}, is_healthy = false, message, top_predictions = [] } = result;

  // Confidence percentage
  const confPercent = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);
  const isUncertain = disease === 'uncertain' || confPercent < 85;

  // Confidence progress bar color: Green >=90%, Amber 85-89%, Rose <85%
  let progressBarColor = 'bg-emerald-600 dark:bg-emerald-500';
  let progressTextColor = 'text-emerald-700 dark:text-emerald-400';
  if (confPercent >= 90) {
    progressBarColor = 'bg-emerald-600 dark:bg-emerald-500';
    progressTextColor = 'text-emerald-700 dark:text-emerald-400';
  } else if (confPercent >= 85) {
    progressBarColor = 'bg-amber-500 dark:bg-amber-400';
    progressTextColor = 'text-amber-700 dark:text-amber-400';
  } else {
    progressBarColor = 'bg-rose-500 dark:bg-rose-400';
    progressTextColor = 'text-rose-700 dark:text-rose-400';
  }

  // Determine Severity / Status Badge
  let severityBadge = {
    label: is_healthy ? 'Healthy' : 'High Risk',
    labelHi: is_healthy ? '✅ स्वस्थ पौधा (Healthy)' : '🔴 उच्च जोखिम (High Risk)',
    classes: 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
  };

  if (isUncertain) {
    severityBadge = {
      label: 'Uncertain (<85%)',
      labelHi: '⚠️ अनिश्चित (<85%)',
      classes: 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    };
  } else if (is_healthy) {
    severityBadge = {
      label: 'Healthy',
      labelHi: '✅ स्वस्थ (Healthy)',
      classes: 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    };
  } else if (solution.severity === 'Low Risk' || confPercent < 88) {
    severityBadge = {
      label: 'Low Risk',
      labelHi: '🟡 कम जोखिम (Low Risk)',
      classes: 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    };
  } else {
    severityBadge = {
      label: 'High Risk',
      labelHi: '🔴 उच्च जोखिम (High Risk)',
      classes: 'bg-rose-100/90 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    };
  }

  // Display Name: If uncertain, do NOT show a disease name!
  const diseaseDisplayName = isUncertain
    ? (isHi ? 'पहचान अनिश्चित (Uncertain)' : 'Uncertain Diagnosis')
    : (isHi
        ? solution.name_hi || disease.replace(/_/g, ' ')
        : solution.name_en || disease.replace(/_/g, ' '));

  const uncertainWarningMessage = message || (isHi
    ? 'Photo saaf nahi hai ya ye bimari model ke paas nahi hai. Kisi expert se check karein.'
    : 'Photo is unclear or this condition is outside model scope. Please consult an agricultural specialist.');

  // Steps
  const step1Preparation = isHi
    ? solution.steps_hi?.prep || solution.dosage || '5 ml Neem oil per liter of water.'
    : solution.steps_en?.prep || solution.dosage || '5 ml Neem oil per liter of water.';

  const step2Application = isHi
    ? solution.steps_hi?.apply || solution.frequency || 'हर 7 से 10 दिन में एक बार छिड़काव करें।'
    : solution.steps_en?.apply || solution.frequency || 'Spray thoroughly every 7-10 days.';

  const step3Prevention = isHi
    ? solution.steps_hi?.prevent || solution.seasonal_tip || 'हवा का संचार अच्छा रखें और रोगग्रस्त पत्तों को हटाएं।'
    : solution.steps_en?.prevent || solution.seasonal_tip || 'Maintain good air circulation and prune damaged foliage.';

  const summarySolution = isHi
    ? solution.solution_hindi || solution.solution || 'जैविक समाधान का प्रयोग करें।'
    : solution.solution_english || solution.solution || 'Use organic biological treatment.';

  // Text to Speech
  const handleListen = () => {
    if (!('speechSynthesis' in window)) {
      alert(isHi ? 'आपका ब्राउज़र ऑडियो सपोर्ट नहीं करता।' : 'Speech synthesis not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const spokenText = isHi
      ? (isUncertain
          ? `एग्रोदृष्टि सूचना: पहचान अनिश्चित है। विश्वसनीयता केवल ${confPercent} प्रतिशत है। ${uncertainWarningMessage}`
          : `एग्रोदृष्टि रिपोर्ट: ${diseaseDisplayName}। विश्वसनीयता ${confPercent} प्रतिशत है। उपचार: ${summarySolution}`)
      : (isUncertain
          ? `AgroDrishti Notice: Uncertain identification. Confidence is only ${confPercent} percent. ${uncertainWarningMessage}`
          : `AgroDrishti Report: ${diseaseDisplayName}. Confidence is ${confPercent} percent. Recommendation: ${summarySolution}`);

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = isHi ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className="glass-card p-5 sm:p-6 rounded-2xl space-y-5 shadow-md animate-fade-in bg-white/80 dark:bg-[#1E1E1E] border border-white/50 dark:border-[#333333]"
    >
      {/* Top Header with Disease Name or Uncertain Warning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-[#333333] pb-4">
        <div>
          <span className="text-[11px] font-bold text-gray-400 dark:text-[#B0B0B0] uppercase tracking-wider block">
            {isUncertain ? (isHi ? 'जांच स्थिति (Analysis Status)' : 'Analysis Status') : (isHi ? 'पहचाना गया रोग' : 'Detected Crop Condition')}
          </span>
          <h2 className={`text-xl sm:text-2xl font-extrabold mt-0.5 ${isUncertain ? 'text-amber-700 dark:text-amber-400' : 'text-gray-900 dark:text-[#E0E0E0]'}`}>
            {diseaseDisplayName}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Severity / Status Badge */}
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${severityBadge.classes}`}
          >
            {isHi ? severityBadge.labelHi : severityBadge.label}
          </span>

          {/* Gradient Pill Listen Button */}
          <button
            type="button"
            onClick={handleListen}
            className={`btn-gradient px-4 py-1.5 text-xs font-bold rounded-full shadow-md flex items-center gap-1.5 transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              isPlaying ? 'animate-pulse ring-2 ring-emerald-400' : ''
            }`}
            title="Listen to audio prescription"
          >
            {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isPlaying ? (isHi ? 'रोकें' : 'Stop') : (isHi ? 'सुनें (Listen)' : 'Listen')}</span>
          </button>
        </div>
      </div>

      {/* Confidence Score Bar */}
      <div className="bg-white/90 dark:bg-[#252525] p-4 rounded-xl border border-gray-100 dark:border-[#333333] shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-gray-600 dark:text-[#B0B0B0]">
            {isHi ? 'AI विश्वसनीयता स्कोर (Confidence Score)' : 'AI Confidence Score'}
          </span>
          <span className={`${progressTextColor} font-extrabold text-sm`}>
            {confPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-[#151515] rounded-full h-3 overflow-hidden p-0.5 border border-gray-200/60 dark:border-[#333333]">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${progressBarColor}`}
            style={{ width: `${confPercent}%` }}
          />
        </div>
      </div>

      {/* Either Warning Card (if Uncertain) OR Treatment Plan (if Confident) */}
      {isUncertain ? (
        <div className="space-y-4">
          {/* Warning Message Card */}
          <div className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300/80 dark:border-amber-700/80 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                  {isHi ? 'परामर्श सूचना (Advisory Notice)' : 'Diagnosis Advisory'}
                </h4>
                <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200/90 font-medium leading-relaxed">
                  {uncertainWarningMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Top-2 Alternative Predictions */}
          {top_predictions && top_predictions.length > 0 && (
            <div className="bg-white/90 dark:bg-[#252525] p-4 rounded-xl border border-gray-200/80 dark:border-[#333333] shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#333333] pb-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-[#E0E0E0] flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>{isHi ? 'मॉडल के शीर्ष संभावित विकल्प (Top-2 Alternatives)' : 'Model Top-2 Alternatives'}</span>
                </h4>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Top Candidates
                </span>
              </div>

              <div className="space-y-2.5">
                {top_predictions.map((item, idx) => {
                  const altName = item.disease.replace(/_/g, ' ');
                  return (
                    <div
                      key={idx}
                      className="bg-gray-50/90 dark:bg-[#1A1A1A] p-3 rounded-xl border border-gray-100 dark:border-[#2C2C2C] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-[#333333] text-gray-700 dark:text-gray-300 text-[11px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {altName}
                        </span>
                        <span className="text-amber-700 dark:text-amber-400 font-extrabold text-xs">
                          {Number(item.confidence).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200/70 dark:bg-[#252525] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, item.confidence))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Main Treatment Plan - 3 Steps Timeline */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm sm:text-base text-gray-800 dark:text-[#E0E0E0] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary dark:text-emerald-400" />
              <span>{isHi ? '100% जैविक उपचार योजना' : 'Biological Treatment Plan'}</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {isHi ? '3 चरण' : '3 Action Steps'}
            </span>
          </div>

          {/* 3 Step Cards */}
          <div className="space-y-2.5">
            {/* Step 1: Preparation (Dosage) */}
            <div className="bg-white/95 dark:bg-[#252525] p-3.5 rounded-xl border border-gray-100 dark:border-[#333333] hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 shadow-sm flex items-start gap-3 transform hover:translate-x-1">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                1
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800 dark:text-[#E0E0E0]">
                  {isHi ? 'चरण 1: तैयारी एवं खुराक (Preparation & Dosage)' : 'Step 1: Preparation (Dosage)'}
                </div>
                <p className="text-xs text-gray-600 dark:text-[#B0B0B0] mt-1 leading-relaxed">
                  {step1Preparation}
                </p>
              </div>
            </div>

            {/* Step 2: Application (Frequency) */}
            <div className="bg-white/95 dark:bg-[#252525] p-3.5 rounded-xl border border-gray-100 dark:border-[#333333] hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 shadow-sm flex items-start gap-3 transform hover:translate-x-1">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                2
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800 dark:text-[#E0E0E0]">
                  {isHi ? 'चरण 2: छिड़काव विधि एवं अंतराल (Application & Frequency)' : 'Step 2: Application (Frequency)'}
                </div>
                <p className="text-xs text-gray-600 dark:text-[#B0B0B0] mt-1 leading-relaxed">
                  {step2Application}
                </p>
              </div>
            </div>

            {/* Step 3: Prevention (Seasonal Tip) */}
            <div className="bg-white/95 dark:bg-[#252525] p-3.5 rounded-xl border border-gray-100 dark:border-[#333333] hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 shadow-sm flex items-start gap-3 transform hover:translate-x-1">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                3
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800 dark:text-[#E0E0E0]">
                  {isHi ? 'चरण 3: दीर्घकालिक बचाव (Prevention & Seasonal Tip)' : 'Step 3: Prevention (Seasonal Tip)'}
                </div>
                <p className="text-xs text-gray-600 dark:text-[#B0B0B0] mt-1 leading-relaxed">
                  {step3Prevention}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
