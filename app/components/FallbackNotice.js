import React from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export default function FallbackNotice({ show = false, type = 'data' }) {
  if (!show) return null;

  const messages = {
    data: {
      title: 'Using Offline Data',
      description: 'Backend server is unavailable. Showing cached data.',
      icon: WifiOff,
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      textColor: 'text-amber-800 dark:text-amber-200',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    retry: {
      title: 'Connection Issues',
      description: 'Retrying connection to backend server...',
      icon: Wifi,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    error: {
      title: 'Backend Unavailable',
      description: 'Cannot connect to server. Some features may be limited.',
      icon: AlertTriangle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  };

  const config = messages[type] || messages.data;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 mb-4`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h4>
          <p className={`text-xs ${config.textColor} opacity-80 mt-0.5`}>
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}