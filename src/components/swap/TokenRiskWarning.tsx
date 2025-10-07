"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Token } from '@/config/tokens';

interface TokenRiskWarningProps {
  token: Token;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  riskLevel: 'high' | 'medium' | 'low';
  specificRisks?: string[];
}

export default function TokenRiskWarning({ 
  token, 
  isOpen, 
  onConfirm, 
  onCancel,
  riskLevel,
  specificRisks = []
}: TokenRiskWarningProps) {
  
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'high':
        return {
          color: 'red',
          title: 'High Risk Token',
          icon: ShieldExclamationIcon,
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'medium':
        return {
          color: 'orange',
          title: 'Unverified Token',
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-orange-900/20',
          borderColor: 'border-orange-500/30',
          textColor: 'text-orange-400',
          buttonColor: 'bg-orange-600 hover:bg-orange-700'
        };
      default:
        return {
          color: 'blue',
          title: 'Token Information',
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const config = getRiskConfig();
  const IconComponent = config.icon;

  const getDefaultRisks = () => {
    const risks = [];
    
    if (token.verified === false) {
      risks.push('This token is not on Jupiter\'s verified list');
    }
    
    if (token.isFromDexScreener) {
      risks.push('Token information from DexScreener - limited verification');
    }
    
    if (!token.logoURI || token.logoURI === '/token-fallback.png') {
      risks.push('No official logo - may be a new or unestablished token');
    }
    
    return risks;
  };

  const allRisks = [...specificRisks, ...getDefaultRisks()];

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onCancel} className="fixed inset-0 z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={`w-full max-w-md bg-gray-900 rounded-lg shadow-2xl border ${config.borderColor}`}>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <IconComponent className={`h-8 w-8 ${config.textColor} flex-shrink-0`} />
                  <div>
                    <Dialog.Title className="text-lg font-bold text-white">
                      {config.title}
                    </Dialog.Title>
                    <p className="text-sm text-gray-400">
                      {token.symbol} • {token.name}
                    </p>
                  </div>
                </div>

                {/* Warning Content */}
                <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 mb-6`}>
                  <div className="space-y-3">
                    <p className={`text-sm ${config.textColor} font-medium`}>
                      ⚠️ Please be aware of the following risks:
                    </p>
                    
                    <ul className="text-sm text-gray-300 space-y-2">
                      {allRisks.map((risk, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className={`text-${config.color}-400 mt-0.5`}>•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>

                    {riskLevel === 'high' && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
                        <p className="text-red-300 text-xs font-medium">
                          🚨 High Risk: This token may have limited liquidity, high volatility, or other significant risks. Only trade if you understand and accept these risks.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 px-4 py-3 ${config.buttonColor} text-white rounded-lg transition-colors text-sm font-medium`}
                  >
                    I Understand, Continue
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  By continuing, you acknowledge that you understand the risks and are making an informed decision.
                </p>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
