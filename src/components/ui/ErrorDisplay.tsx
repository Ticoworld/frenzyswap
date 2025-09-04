"use client";

import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  showRetry?: boolean;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  showRetry = true,
  type = 'error'
}: ErrorDisplayProps) {
  
  const getErrorConfig = () => {
    // Analyze error message to determine severity and type
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('insufficient liquidity') || 
        errorLower.includes('no route found') ||
        errorLower.includes('price impact too high')) {
      return {
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-400',
        iconColor: 'text-yellow-500',
        type: 'warning',
        title: 'Trading Limitation'
      };
    }
    
    if (errorLower.includes('insufficient balance') || 
        errorLower.includes('not enough')) {
      return {
        icon: InformationCircleIcon,
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        textColor: 'text-blue-400',
        iconColor: 'text-blue-500',
        type: 'info',
        title: 'Balance Issue'
      };
    }
    
    if (errorLower.includes('network') || 
        errorLower.includes('timeout') ||
        errorLower.includes('connection')) {
      return {
        icon: ExclamationCircleIcon,
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        textColor: 'text-orange-400',
        iconColor: 'text-orange-500',
        type: 'error',
        title: 'Network Error'
      };
    }
    
    // High risk errors
    if (errorLower.includes('restricted') || 
        errorLower.includes('blocked') ||
        errorLower.includes('suspended')) {
      return {
        icon: ShieldExclamationIcon,
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
        iconColor: 'text-red-500',
        type: 'error',
        title: 'Trading Restricted'
      };
    }
    
    // Default error
    return {
      icon: ExclamationCircleIcon,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      iconColor: 'text-red-500',
      type: 'error',
      title: 'Error'
    };
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;
  
  const shouldShowRetry = showRetry && onRetry && (
    !error.includes('Insufficient') && 
    !error.includes('No valid route') &&
    !error.includes('restricted') &&
    !error.includes('blocked')
  );

  const getSuggestion = () => {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('insufficient liquidity')) {
      return 'Try reducing the amount or selecting a different token pair.';
    }
    if (errorLower.includes('price impact too high')) {
      return 'Increase slippage tolerance or reduce the swap amount.';
    }
    if (errorLower.includes('insufficient balance')) {
      return 'Add more tokens to your wallet or reduce the swap amount.';
    }
    if (errorLower.includes('no route found')) {
      return 'This token pair may not have sufficient trading routes available.';
    }
    if (errorLower.includes('network') || errorLower.includes('timeout')) {
      return 'Check your internet connection and try again.';
    }
    
    return 'Please check the details and try again.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 text-sm`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col space-y-3">
        {/* Header */}
        <div className="flex items-start space-x-3">
          <IconComponent className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${config.textColor} mb-1`}>
              {config.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-300 break-words">
              {error}
            </p>
          </div>
        </div>

        {/* Suggestion */}
        <div className={`text-xs ${config.textColor} bg-black/20 rounded-lg p-3 border border-current/10`}>
          <p className="font-medium mb-1">💡 Suggestion:</p>
          <p className="text-gray-600 dark:text-gray-300">{getSuggestion()}</p>
        </div>

        {/* Retry Button */}
        {shouldShowRetry && (
          <div className="flex justify-center pt-1">
            <button
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg text-sm font-bold hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              onClick={onRetry}
              aria-label="Retry the operation"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
