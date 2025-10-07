"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Token } from '@/config/tokens';

interface QuickTokenWarningProps {
  token: Token;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function QuickTokenWarning({ 
  token, 
  isOpen, 
  onConfirm, 
  onCancel 
}: QuickTokenWarningProps) {
  
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
          <div className="fixed inset-0 bg-black/60" />
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
            <Dialog.Panel className="w-full max-w-sm bg-gray-900 rounded-lg shadow-2xl border border-orange-500/30">
              <div className="p-5">
                {/* Compact Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-500 flex-shrink-0" />
                  <div>
                    <Dialog.Title className="text-base font-bold text-white">
                      Unverified Token
                    </Dialog.Title>
                    <p className="text-sm text-gray-400">
                      {token.symbol} • {token.isJupiterFallback ? 'Not in verified lists' : 'Not on Jupiter\'s verified list'}
                    </p>
                  </div>
                </div>

                {/* Quick Risk Summary */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
                  <p className="text-sm text-orange-200">
                    {token.isJupiterFallback ? (
                      <>⚠️ This token is swappable on Jupiter but not in their verified token lists. Exercise extra caution.</>
                    ) : (
                      <>⚠️ This token may have limited liquidity or higher risks.</>
                    )}
                  </p>
                </div>

                {/* Fast Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 px-3 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors text-sm font-medium"
                  >
                    Trade Anyway
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
