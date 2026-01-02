import React from 'react';
import { Spool, Block } from '../types';
import { BlockView } from './BlockView';
import { AnimatePresence } from 'framer-motion';

interface BufferAreaProps {
  slots: Spool[]; // Now uses Spool type
  isFrozen?: boolean; // Indicate if spools are frozen
}

export const BufferArea: React.FC<BufferAreaProps> = ({ slots, isFrozen = false }) => {
  return (
    <div className="flex flex-row gap-2">
      {slots.map((spool) => (
        <div
          key={spool.id}
          id={`buffer-slot-${spool.id}`}
          className={`relative w-12 h-12 bg-slate-300/30 rounded-lg shadow-md border-2 flex items-center justify-center transition-all duration-300 pointer-events-none ${
            isFrozen ? 'border-cyan-400 bg-cyan-100/50 animate-pulse' : 'border-slate-400/30'
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence>
              {/* Only ONE block per spool (not an array!) */}
              {spool.block && (
                <div className="absolute inset-1 pointer-events-auto">
                  <BlockView
                    block={spool.block}
                    isInteractive={false}
                    isBuffer={true}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Empty State Marker */}
            {!spool.block && (
              <div className="w-2 h-2 rounded-full bg-slate-400/40" />
            )}
          </div>

          {/* Frozen Overlay */}
          {isFrozen && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-xl">🧊</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
