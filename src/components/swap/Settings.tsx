'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSettings, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  slippage: number;
  setSlippage: (value: number) => void;
}

const slippagePresets = [0.1, 0.5, 1];

export default function Settings({ slippage, setSlippage }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [slippageInput, setSlippageInput] = useState(slippage.toString());
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSlippageInput(slippage.toString());
  }, [slippage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSlippageInput(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      setSlippage(parsed);
    }
  };

  const handlePresetClick = (preset: number) => {
    setSlippage(preset);
    setSlippageInput(preset.toString());
  };

  return (
    <div className="relative">
      <button
        className="p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <FiSettings className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="flex justify-between items-center border-b border-gray-700 p-4">
                <h3 className="font-bold text-lg">Transaction Settings</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Slippage tolerance</label>
                    <div className="flex items-center">
                      <input
                        inputMode="decimal"
                        value={slippageInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="0.5"
                        className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 w-20 text-right appearance-none
                          [&::-webkit-outer-spin-button]:appearance-none
                          [&::-webkit-inner-spin-button]:appearance-none
                          [-moz-appearance:textfield]"
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    {slippagePresets.map((preset) => (
                      <button
                        key={preset}
                        className={`flex-1 py-2 text-sm rounded-lg ${
                          slippage === preset
                            ? 'bg-brand-purple text-white'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        onClick={() => handlePresetClick(preset)}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Your transaction will revert if the price changes unfavorably by more than this percentage.
                  </p>
                </div>

                {/* Platform Fees Info */}
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="font-medium mb-2">Platform Fees</h4>
                  <p className="text-sm text-gray-300">
                    FrenzySwap charges a 0.3% fee on swaps. These fees are used to buy back and burn the $MEME token, supporting long-term ecosystem growth.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-700 p-4 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-brand-purple hover:bg-brand-purple/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Confirm Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
