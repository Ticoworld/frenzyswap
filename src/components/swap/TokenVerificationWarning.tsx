"use client";

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Token } from '@/config/tokens';

interface TokenVerificationWarningProps {
  token: Token;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TokenVerificationWarning({ 
  token, 
  isOpen, 
  onConfirm, 
  onCancel 
}: TokenVerificationWarningProps) {
  const [understood, setUnderstood] = useState(false);

  const handleConfirm = () => {
    if (understood) {
      onConfirm();
      setUnderstood(false); // Reset for next time
    }
  };

  const handleClose = () => {
    onCancel();
    setUnderstood(false); // Reset for next time
  };

  const isFromDexScreener = token.isFromDexScreener;
  
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="fixed inset-0 z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl border border-yellow-500/20">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div>
                    <Dialog.Title className="text-lg font-bold text-white">
                      Token Verification Warning
                    </Dialog.Title>
                    <p className="text-sm text-gray-400">
                      {isFromDexScreener ? 'Unverified Token from DexScreener' : 'Unverified Token'}
                    </p>
                  </div>
                </div>

                {/* Token Info */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-sm">
                      {token.symbol.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        {token.address.slice(0, 8)}...{token.address.slice(-8)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Content */}
                <div className="space-y-4 mb-6">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <ShieldExclamationIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-yellow-200 mb-1">
                          This token is not verified
                        </h4>
                        <p className="text-sm text-yellow-300/80">
                          {isFromDexScreener ? (
                            <>This token was found on DexScreener and may be a newly created or experimental token. It has not been verified by Jupiter&apos;s strict token list.</>
                          ) : (
                            <>This token is not part of Jupiter&apos;s verified token list and may carry additional risks.</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="font-medium text-white mb-2">Potential risks include:</div>
                    <ul className="space-y-1 list-disc list-inside text-gray-400">
                      <li>Token may have limited liquidity</li>
                      <li>Higher price volatility and slippage</li>
                      <li>Potential for scam or rug pull tokens</li>
                      <li>May not be tradeable on all DEXs</li>
                      <li>Limited trading history and data</li>
                    </ul>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-sm text-blue-300">
                      💡 <strong>Tip:</strong> Always do your own research (DYOR) before trading unverified tokens. 
                      Check the token&apos;s website, social media, and community before investing.
                    </p>
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <div className="mb-6">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={understood}
                      onChange={(e) => setUnderstood(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-gray-300">
                      I understand the risks and want to proceed with trading this unverified token.
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!understood}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      understood
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Proceed Anyway
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
