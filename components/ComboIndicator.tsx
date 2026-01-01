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
      case 2: return 'from-yellow-500/80 to-orange-500/80';
      case 3: return 'from-orange-500/80 to-red-500/80';
      case 4: return 'from-red-500/80 to-purple-600/80';
      default: return 'from-yellow-500/80 to-orange-500/80';
    }
  };

  const getTextColor = () => {
    switch (multiplier) {
      case 2: return 'text-yellow-100';
      case 3: return 'text-orange-100';
      case 4: return 'text-red-100';
      default: return 'text-yellow-100';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
        style={{ marginTop: '40px' }} // Just below the compact header
      >
        <div className={`bg-gradient-to-r ${getColor()} backdrop-blur-sm shadow-lg`}>
          <div className="px-3 py-1.5 flex items-center justify-center gap-2">
            <Flame className={`w-4 h-4 ${getTextColor()}`} fill="currentColor" />
            <span className={`text-sm font-bold ${getTextColor()} drop-shadow`}>
              {multiplier}x COMBO
            </span>
            <span className="text-xs font-medium text-white/70">
              ({comboCount} chain{comboCount > 1 ? 's' : ''})
            </span>
            <Flame className={`w-4 h-4 ${getTextColor()}`} fill="currentColor" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
