import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

interface ComboIndicatorProps {
  comboCount: number;
  multiplier: number;
}

export const ComboIndicator: React.FC<ComboIndicatorProps> = ({ comboCount, multiplier }) => {
  // Don't show indicator for 1x multiplier
  if (multiplier === 1 || comboCount <= 1) return null;

  // Color based on multiplier level
  const getColor = () => {
    switch (multiplier) {
      case 2: return 'from-yellow-400 to-orange-400';
      case 3: return 'from-orange-400 to-red-400';
      case 4: return 'from-red-400 to-purple-500';
      default: return 'from-yellow-400 to-orange-400';
    }
  };

  const getTextColor = () => {
    switch (multiplier) {
      case 2: return 'text-yellow-400';
      case 3: return 'text-orange-400';
      case 4: return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className={`bg-gradient-to-r ${getColor()} rounded-full px-6 py-3 shadow-2xl border-2 border-white/30`}>
          <div className="flex items-center gap-2">
            <Flame className={`w-6 h-6 ${getTextColor()}`} fill="currentColor" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-black text-white drop-shadow-lg">
                {multiplier}x COMBO
              </div>
              <div className="text-xs font-bold text-white/80 -mt-1">
                {comboCount} chain{comboCount > 1 ? 's' : ''}
              </div>
            </div>
            <Flame className={`w-6 h-6 ${getTextColor()}`} fill="currentColor" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
