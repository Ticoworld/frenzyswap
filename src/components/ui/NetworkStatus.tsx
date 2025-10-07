'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { MdSignalWifiOff } from 'react-icons/md';

interface NetworkStatusProps {
  className?: string;
  showLabel?: boolean;
}

export default function NetworkStatus({ className = '', showLabel = true }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'unknown'>('unknown');

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Test connection speed
    const testConnectionSpeed = async () => {
      if (!navigator.onLine) {
        setConnectionSpeed('unknown');
        return;
      }

      try {
        const startTime = Date.now();
        const response = await fetch('/api/ping', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (response.ok) {
          setConnectionSpeed(duration < 1000 ? 'fast' : 'slow');
        } else {
          setConnectionSpeed('slow');
        }
      } catch {
        setConnectionSpeed('slow');
      }
    };

    // Initial status
    updateNetworkStatus();
    testConnectionSpeed();

    // Event listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Periodic speed test
    const speedInterval = setInterval(testConnectionSpeed, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      clearInterval(speedInterval);
    };
  }, []);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: MdSignalWifiOff,
        text: 'Offline',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30'
      };
    }
    
    if (connectionSpeed === 'slow') {
      return {
        icon: FaExclamationTriangle,
        text: 'Slow Connection',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30'
      };
    }
    
    return {
      icon: FaWifi,
      text: 'Online',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor} ${className}`}
      >
        <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
        {showLabel && (
          <span className={`text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.text}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Simple ping endpoint component for testing
export function PingIndicator() {
  const [latency, setLatency] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testLatency = async () => {
    setIsLoading(true);
    try {
      const startTime = Date.now();
      await fetch('/api/ping', { method: 'HEAD', cache: 'no-cache' });
      const endTime = Date.now();
      setLatency(endTime - startTime);
    } catch {
      setLatency(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testLatency();
    const interval = setInterval(testLatency, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-xs">
        <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full" />
        <span>Testing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        latency === null ? 'bg-red-500' : 
        latency < 100 ? 'bg-green-500' : 
        latency < 500 ? 'bg-orange-500' : 'bg-red-500'
      }`} />
      <span>{latency ? `${latency}ms` : 'Failed'}</span>
    </div>
  );
}
