"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function BackendStatus() {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const checkBackendStatus = async () => {
    setStatus('checking');
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'backend-connectivity' }),
      });

      const data = await response.json();
      setDetails(data);
      setLastCheck(new Date());

      // Determine overall status
      if (data.tests?.backendConnectivity?.status === 200) {
        setStatus('connected');
      } else if (data.tests?.backendConnectivity?.error) {
        setStatus('error');
      } else {
        setStatus('unknown');
      }
    } catch (error) {
      console.error('Backend status check failed:', error);
      setStatus('error');
      setDetails({ error: error.message });
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Backend Connected';
      case 'error':
        return 'Backend Disconnected';
      case 'checking':
        return 'Checking...';
      default:
        return 'Status Unknown';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {lastCheck && (
        <span className="opacity-75">
          ({lastCheck.toLocaleTimeString()})
        </span>
      )}
      <button
        onClick={checkBackendStatus}
        disabled={status === 'checking'}
        className="ml-1 p-0.5 hover:bg-black/10 rounded transition-colors disabled:opacity-50"
        title="Refresh status"
      >
        <RefreshCw className={`w-3 h-3 ${status === 'checking' ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}