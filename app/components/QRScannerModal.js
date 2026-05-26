"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Camera, RefreshCw } from "lucide-react";

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [scanError, setScanError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const html5QrcodeRef = useRef(null);
  const scannerContainerRef = useRef(null);
  const scannerDivRef = useRef(null);
  const hasScannedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    const scanner = html5QrcodeRef.current;
    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch (err) {
        // Ignore stop/clear errors — the DOM node may already be gone
      }
      html5QrcodeRef.current = null;
    }
    // Manually clear the scanner div's innerHTML so React doesn't fight with it
    if (scannerDivRef.current) {
      scannerDivRef.current.innerHTML = "";
    }
  }, []);

  const startScanner = useCallback(async () => {
    // Dynamically import html5-qrcode to avoid SSR issues
    const { Html5Qrcode } = await import("html5-qrcode");

    // Ensure previous instance is fully cleaned up
    await stopScanner();

    // Create a fresh div for the scanner, appended via ref (not React rendering)
    if (!scannerContainerRef.current) return;

    const div = document.createElement("div");
    div.id = "qr-reader-" + Date.now();
    scannerContainerRef.current.innerHTML = "";
    scannerContainerRef.current.appendChild(div);
    scannerDivRef.current = div;

    try {
      const html5Qrcode = new Html5Qrcode(div.id);
      html5QrcodeRef.current = html5Qrcode;
      hasScannedRef.current = false;

      const config = {
        fps: 10,
        qrbox: { width: 200, height: 200 },
      };

      await html5Qrcode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (!hasScannedRef.current) {
            hasScannedRef.current = true;
            onScanSuccess(decodedText);
          }
        },
        () => {
          // Partial scan errors are expected, ignore silently
        }
      );
      setHasPermission(true);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      const errStr = String(err);
      if (errStr.includes("NotAllowedError") || errStr.includes("Permission denied")) {
        setHasPermission(false);
        setScanError("Camera permission denied. Please enable camera access in your browser settings.");
      } else {
        setScanError("Could not access camera. Please make sure no other application is using it.");
      }
    }
  }, [stopScanner, onScanSuccess]);

  useEffect(() => {
    if (!isOpen) return;

    setScanError(null);
    setHasPermission(null);

    // Small delay to let the modal DOM render before we inject the scanner
    const timer = setTimeout(() => {
      startScanner();
    }, 400);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  const handleClose = useCallback(() => {
    stopScanner();
    onClose();
  }, [stopScanner, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Scan QR Code</h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Point your camera at a stock QR code</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-900 dark:hover:text-white" />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-950/40 min-h-[320px]">
          {!scanError ? (
            <>
              {/* 
                This container is intentionally empty in React's tree.
                The scanner div is created and appended via JS ref, keeping 
                html5-qrcode's DOM manipulations outside React's reconciliation.
              */}
              <div
                ref={scannerContainerRef}
                className="w-full max-w-[280px] overflow-hidden rounded-2xl border-2 border-dashed border-red-500 dark:border-red-400/50 bg-black"
                style={{ minHeight: 280 }}
              />
              {hasPermission === null && (
                <div className="flex items-center gap-2 mt-4">
                  <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Starting Camera...</p>
                </div>
              )}
              {hasPermission && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  Position the QR code inside the frame to scan automatically
                </p>
              )}
            </>
          ) : (
            <div className="text-center p-8 space-y-4">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-base font-black text-gray-900 dark:text-white mb-2">Camera Access Required</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-[300px] mx-auto leading-relaxed">
                  {scanError}
                </p>
              </div>
              <button
                onClick={() => {
                  setScanError(null);
                  setHasPermission(null);
                  startScanner();
                }}
                className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
