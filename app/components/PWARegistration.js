"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            console.log('PWA SW registered: ', registration.scope);
          },
          function(err) {
            console.log('PWA SW failed: ', err);
          }
        );
      });
    }

    // 2. Intercept Chrome's "Add to Home Screen" event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing automatically
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our beautiful custom installation popup
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Listen to successful installation
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was successfully installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the native browser install prompt inside our custom trigger
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    // We can't use the prompt again, throw it away
    setDeferredPrompt(null);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-md mx-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-800/50 shadow-2xl rounded-[28px] p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-12 h-12 min-w-[3rem] bg-gray-50 flex items-center justify-center rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <img src="/logo.png" alt="Unixparts App" className="w-8 h-8 object-contain" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="font-black text-gray-900 dark:text-white text-[15px] leading-snug truncate">Unixparts App</h3>
            <p className="text-xs text-gray-500 font-bold dark:text-zinc-400 truncate">Install for mobile experience</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/30 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
          <button 
            onClick={() => setShowInstallPrompt(false)}
            className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
