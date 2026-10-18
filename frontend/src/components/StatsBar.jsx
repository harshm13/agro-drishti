import React from 'react';
import { Leaf, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

export default function StatsBar({ stats, language }) {
  const isHi = language === 'hi';

  const cards = [
    {
      id: 'scans',
      label: isHi ? 'कुल स्कैन' : 'Total Scans',
      value: stats.totalScans.toLocaleString(),
      subtext: isHi ? '+12 आज' : '+12 today',
      icon: <Leaf className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-100/70 dark:bg-emerald-950/70 border-emerald-200/60 dark:border-emerald-800/60',
    },
    {
      id: 'healthy',
      label: isHi ? 'स्वस्थ फसल दर' : 'Healthy Rate',
      value: `${stats.healthyRate.toFixed(1)}%`,
      subtext: isHi ? 'औसत दर' : 'High Immunity',
      icon: <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />,
      iconBg: 'bg-green-100/70 dark:bg-green-950/70 border-green-200/60 dark:border-green-800/60',
    },
    {
      id: 'alerts',
      label: isHi ? 'सक्रिय अलर्ट' : 'Active Alerts',
      value: stats.activeAlerts,
      subtext: isHi ? 'तत्काल ध्यान दें' : 'Requires Action',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      iconBg: 'bg-amber-100/70 dark:bg-amber-950/70 border-amber-200/60 dark:border-amber-800/60',
    },
    {
      id: 'model',
      label: isHi ? 'मॉडल स्थिति' : 'Model Status',
      value: stats.isModelLoaded ? 'CNN 150px' : 'Mock AI',
      subtext: stats.isModelLoaded ? 'Ready' : 'Demo Active',
      icon: <Cpu className="w-5 h-5 text-primary dark:text-emerald-400" />,
      iconBg: 'bg-emerald-100/70 dark:bg-emerald-950/70 border-emerald-200/60 dark:border-emerald-800/60',
      badge: 'Active',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="glass-card hover-lift p-4 flex flex-col items-start justify-between rounded-2xl transition-all shadow-md bg-white/80 dark:bg-[#1E1E1E] border border-white/50 dark:border-[#333333]"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div className={`p-2.5 rounded-xl ${card.iconBg} border shadow-sm`}>
              {card.icon}
            </div>
            {card.badge && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                {card.badge}
              </span>
            )}
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-800 dark:text-[#E0E0E0] tracking-tight">
              {card.value}
            </div>
            <div className="text-xs font-semibold text-gray-500 dark:text-[#B0B0B0] uppercase tracking-wide mt-0.5">
              {card.label}
            </div>
            <div className="text-[11px] font-medium text-gray-400 dark:text-gray-400 mt-0.5">
              {card.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
