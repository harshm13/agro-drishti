import React from 'react';
import { Leaf, Heart, ExternalLink } from 'lucide-react';

export default function Footer({ language }) {
  const isHi = language === 'hi';

  return (
    <footer className="bg-white dark:bg-[#181818] border-t border-green-100/80 dark:border-[#333333] py-6 mt-12 text-center text-xs text-gray-500 dark:text-[#B0B0B0] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 space-y-2">
        <div className="font-extrabold text-sm text-primary dark:text-emerald-400 flex items-center justify-center gap-2">
          <Leaf className="w-4 h-4 text-primary dark:text-emerald-400" />
          <span>AgroDrishti (एग्रोदृष्टि)</span>
          <span>•</span>
          <span className="font-semibold text-gray-600 dark:text-[#B0B0B0]">
            {isHi ? 'फोटो खींचो, बीमारी भगाओ' : 'AI-Powered Foliar Pathology'}
          </span>
        </div>

        <p className="text-gray-600 dark:text-[#B0B0B0] font-medium">
          {isHi ? 'निर्माता' : 'Project by'}:{' '}
          <span className="font-bold text-gray-800 dark:text-[#E0E0E0]">Harsh Mehta</span> (IT, Ahmedabad) &amp;{' '}
          <span className="font-bold text-gray-800 dark:text-[#E0E0E0]">Rashi</span> (Biotech, Chhattisgarh)
        </p>

        <div className="flex items-center justify-center gap-4 pt-1 text-gray-400 dark:text-gray-500">
          <a
            href="https://github.com/harshm13/agro-drishti"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-primary dark:hover:text-emerald-400 transition-colors font-semibold"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>•</span>
          <span className="flex items-center gap-1 text-primary dark:text-emerald-400 font-semibold">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>Kisan Mitra Bio Initiative</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
