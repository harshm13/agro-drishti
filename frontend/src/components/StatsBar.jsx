import React from 'react';
import { Scan, ShieldCheck, AlertTriangle, Cpu } from 'lucide-react';

const StatsBar = ({ scanCount, recentScans, language, backendOnline, useMockMode }) => {
  // Calculate dynamic healthy % from recent scans if any exist
  const healthyCount = recentScans.filter((s) => s.is_healthy).length;
  const healthyPercentage =
    recentScans.length > 0
      ? Math.round((healthyCount / recentScans.length) * 100)
      : 82;

  const activeAlerts =
    recentScans.length > 0
      ? recentScans.filter((s) => !s.is_healthy).length
      : 1;

  const stats = [
    {
      id: 'scans',
      label: language === 'hi' ? 'कुल स्कैन' : 'Total Scans',
      value: scanCount.toLocaleString(),
      subtext: language === 'hi' ? 'सक्रिय सत्र' : 'Live Session',
      icon: Scan,
      color: 'text-primary dark:text-secondary',
      bgGlow: 'from-primary-500/10 to-transparent',
      borderColor: 'border-green-200 dark:border-green-900/40',
    },
    {
      id: 'healthy',
      label: language === 'hi' ? 'स्वस्थ फसल दर' : 'Healthy Crops',
      value: `${healthyPercentage}%`,
      subtext: language === 'hi' ? 'सामान्य दर' : 'Foliage Health',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgGlow: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-200 dark:border-emerald-900/40',
    },
    {
      id: 'alerts',
      label: language === 'hi' ? 'सक्रिय अलर्ट' : 'Active Alerts',
      value: activeAlerts,
      subtext: language === 'hi' ? 'झुलसा व फफूंद' : 'Blight & Mildew',
      icon: AlertTriangle,
      color: 'text-amber-500 dark:text-amber-400',
      bgGlow: 'from-amber-500/10 to-transparent',
      borderColor: 'border-amber-200 dark:border-amber-900/40',
    },
    {
      id: 'engine',
      label: language === 'hi' ? 'AI मॉडल स्थिति' : 'Model Status',
      value: !useMockMode && backendOnline ? 'CNN 150px' : 'Simulator',
      subtext: !useMockMode && backendOnline
        ? language === 'hi' ? 'सक्रिय एवं लोड' : 'TensorFlow Active'
        : language === 'hi' ? 'डेमो मोड' : 'Standby / Demo',
      icon: Cpu,
      color: 'text-blue-600 dark:text-blue-400',
      bgGlow: 'from-blue-500/10 to-transparent',
      borderColor: 'border-blue-200 dark:border-blue-900/40',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.id}
              className={`glass-card relative overflow-hidden rounded-2xl p-4 sm:p-5 border ${stat.borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${stat.bgGlow} rounded-full blur-xl pointer-events-none`} />

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {stat.subtext}
                  </p>
                </div>

                <div className={`p-2 sm:p-2.5 rounded-xl bg-gray-100/80 dark:bg-dark-surface/80 ${stat.color} shadow-sm border border-gray-200/50 dark:border-gray-800`}>
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsBar;
