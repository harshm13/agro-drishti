import React from 'react';
import { Leaf, Heart, Github, Award, ExternalLink } from 'lucide-react';

const Footer = ({ language }) => {
  return (
    <footer className="w-full mt-16 border-t border-green-200/60 dark:border-dark-border bg-white/60 dark:bg-dark-card/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Mission Statement */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary dark:text-secondary">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                AgroDrishti • एग्रोदृष्टि
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi'
                  ? 'भारतीय किसानों के लिए 100% जैविक व रासायनिक-मुक्त फसल समाधान'
                  : '100% Biological & Organic Foliar Disease Treatment for Farmers'}
              </p>
            </div>
          </div>

          {/* Credits & Founders */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300">
              <Award className="w-3.5 h-3.5 text-accent" />
              <span>
                {language === 'hi'
                  ? 'निर्माता: हर्ष मेहता (IT) व राशी (बायोटेक)'
                  : 'Created by Harsh Mehta (IT) & Rashi (Biotech)'}
              </span>
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary dark:hover:text-secondary transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Bottom copyright notice & KVK Educational Disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-border/40 text-center space-y-2">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            ⚠️ {language === 'hi'
              ? 'शैक्षिक एआई प्रोटोटाइप: खेत में किसी भी जैविक उपाय के प्रयोग से पहले नजदीकी कृषि विज्ञान केंद्र (KVK) या कृषि विशेषज्ञ की सलाह अवश्य लें।'
              : 'Educational AI Prototype: Consult a local Krishi Vigyan Kendra (KVK) or agricultural extension specialist before field application.'}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} AgroDrishti. {language === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'} • 
            <span className="ml-1 text-primary dark:text-secondary font-bold">Photo खींचो, बीमारी भगाओ</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
