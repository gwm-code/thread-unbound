import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Key } from 'lucide-react';
import { Block, Direction, BlockColor } from '../types';

interface BlockViewProps {
  block: Block;
  onClick?: () => void;
  isInteractive?: boolean;
  isBuffer?: boolean;
  gridCellSize?: number;
  isSelected?: boolean;
  isLockedByAggro?: boolean;
}

// Deep, rich colors for tactile feel. 
// Border is the "side" of the 3D block. Text is the icon color.
const colorStyles: Record<BlockColor, string> = {
  red: 'bg-red-500 border-red-800 text-red-950',
  blue: 'bg-blue-500 border-blue-800 text-blue-950',
  green: 'bg-emerald-500 border-emerald-800 text-emerald-950',
  yellow: 'bg-amber-400 border-amber-700 text-amber-950',
  purple: 'bg-violet-500 border-violet-800 text-violet-950',
};

const Chevron = ({ direction, className }: { direction: Direction, className?: string }) => {
  // Base chevron points DOWN (∨), so rotate accordingly
  const rotation = {
    'UP': 180,         // Flip to point up (∧)
    'RIGHT': 270,      // Rotate to point right (>)
    'DOWN': 0,         // Already points down (∨)
    'LEFT': 90,        // Rotate to point left (<)
    'UP-LEFT': 135,    // Diagonal up-left (↖)
    'UP-RIGHT': 225,   // Diagonal up-right (↗)
    'DOWN-LEFT': 45,   // Diagonal down-left (↙)
    'DOWN-RIGHT': 315  // Diagonal down-right (↘)
  }[direction];

  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} drop-shadow-sm w-8 h-8 sm:w-10 sm:h-10`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M12 16.5L3.5 8L6 5.5L12 11.5L18 5.5L20.5 8L12 16.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const BlockView: React.FC<BlockViewProps> = ({
  block,
  onClick,
  isInteractive = true,
  isBuffer = false,
  gridCellSize = 60,
  isSelected = false,
  isLockedByAggro = false
}) => {
  const styles = colorStyles[block.color];
  const isLocked = block.type === 'locked';
  const isKey = block.type === 'key';
  const isSniper = block.type === 'sniper';
  const isRainbow = block.type === 'rainbow';
  const isAggro = block.type === 'aggro';
  const isSpin = block.type === 'spin';
  const isRandom = block.type === 'random';
  const isMultiplier = block.type === 'multiplier';
  const isMystery = block.type === 'mystery';
  const isFreeze = block.type === 'freeze';
  const isBomb = block.type === 'bomb';
  const isUnlocking = !!block.justUnlocked;

  // Bomb countdown display (time-based)
  const [bombSecondsLeft, setBombSecondsLeft] = useState(0);

  useEffect(() => {
    if (!isBomb || block.countdown === undefined) return;

    // Update countdown every 100ms
    const interval = setInterval(() => {
      const timeLeft = block.countdown! - Date.now();
      const secondsLeft = Math.max(0, Math.ceil(timeLeft / 1000));
      setBombSecondsLeft(secondsLeft);
    }, 100);

    // Initial set
    const timeLeft = block.countdown - Date.now();
    const secondsLeft = Math.max(0, Math.ceil(timeLeft / 1000));
    setBombSecondsLeft(secondsLeft);

    return () => clearInterval(interval);
  }, [isBomb, block.countdown]);

  // Size scaling based on thread count: 4=0.85, 6=0.95, 8=1.05, 10=1.15
  const sizeScale = 0.70 + (block.threadCount / 20); // 4→0.90, 6→0.95, 8→1.10, 10→1.20

  // 3D Logic - all blocks same height
  const initialY = 0;
  const borderHeight = 6;

  // Positioning with size scaling
  const baseSize = gridCellSize - 6;
  const scaledSize = baseSize * sizeScale;
  const offset = (baseSize - scaledSize) / 2; // Center the scaled block

  const positionStyles = !isBuffer ? {
    width: `${scaledSize}px`,
    height: `${scaledSize}px`,
    left: block.x * gridCellSize + 3 + offset,
    top: block.y * gridCellSize + 3 + offset,
    position: 'absolute' as const,
    zIndex: 0,
  } : {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
  };

  const isDisabled = !isInteractive && !isBuffer;
  const isEffectivelyLocked = isLocked || isLockedByAggro;

  // Press Animation
  // Compressing the block: Move Y down, reduce Border Bottom
  const pressDist = 4;
  const tapY = initialY + pressDist;
  const tapBorder = Math.max(0, borderHeight - pressDist);

  return (
    <motion.button
      layoutId={block.id}
      initial={!isBuffer ? { scale: 0, opacity: 0, y: initialY } : { y: 0 }}
      animate={{
        scale: isSelected ? [1, 1.05, 1] : 1,
        opacity: 1,
        y: isBuffer ? 0 : initialY,
        x: 0,
        filter: 'none',
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileTap={!isDisabled && !isEffectivelyLocked ? {
        y: isBuffer ? 4 : tapY,
        borderBottomWidth: `${tapBorder}px`,
        transition: { duration: 0.05 }
      } : (isEffectivelyLocked ? { x: [-5, 5], transition: { duration: 0.3, repeat: 2, repeatType: "reverse" } } : undefined)}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        x: isUnlocking ? { duration: 0.5, type: "tween" } : undefined,
        scale: isSelected ? { duration: 1.5, repeat: Infinity, repeatType: "loop" } : undefined
      }}
      style={{
        ...positionStyles,
        borderBottomWidth: `${borderHeight}px`
      }}
      onClick={isDisabled ? undefined : onClick}
      className={`
        ${styles}
        rounded-xl
        flex items-center justify-center
        shadow-block
        transition-all duration-200
        ${isDisabled || isEffectivelyLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-110 hover:scale-105'}
        ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2 shadow-[0_0_20px_rgba(250,204,21,0.8)]' : ''}
        ${isLockedByAggro ? 'brightness-50 saturate-50' : ''}
        relative
        overflow-visible
      `}
    >
      {/* Texture: Wool / Noise Pattern */}
      <div className="absolute inset-0 rounded-lg opacity-25 pointer-events-none mix-blend-overlay"
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             backgroundSize: '120px 120px'
           }} 
      />
      
      {/* Edge Highlights for plastic/3D look */}
      <div className="absolute inset-x-2 top-0 h-[2px] bg-white/40 rounded-full" />
      <div className="absolute inset-y-2 left-0 w-[2px] bg-white/20 rounded-full" />

      {/* Content Layer */}
      <div className={`
        flex items-center justify-center relative z-10 transform transition-transform
        opacity-100
      `}>
        {isLocked ? (
          <Lock size={26} className="text-white drop-shadow-md opacity-90" strokeWidth={3} />
        ) : isKey ? (
          <div className="relative">
             <Key size={26} className="text-white drop-shadow-md animate-pulse" strokeWidth={3} />
             <div className="absolute inset-0 bg-white/50 blur-lg rounded-full animate-pulse" />
          </div>
        ) : isSniper ? (
          <div className="text-2xl drop-shadow-md">🎯</div>
        ) : isRainbow ? (
          <div className="text-2xl drop-shadow-md animate-pulse">🌈</div>
        ) : isAggro ? (
          <div className="text-2xl drop-shadow-md animate-bounce">😡</div>
        ) : isSpin ? (
          <div className="text-2xl drop-shadow-md" style={{ animation: 'spin 2s linear infinite' }}>🔄</div>
        ) : isRandom ? (
          <div className="relative">
            <div className="text-2xl drop-shadow-md">🎲</div>
            <div className="absolute inset-0 -z-10">
              <Chevron direction={block.direction} className="opacity-50 scale-75" />
            </div>
          </div>
        ) : isMultiplier ? (
          <div className="text-2xl drop-shadow-md animate-pulse">🧩</div>
        ) : isMystery ? (
          <div className="text-2xl drop-shadow-md animate-bounce">🎁</div>
        ) : isFreeze ? (
          <div className="text-2xl drop-shadow-md animate-pulse">🧊</div>
        ) : isBomb ? (
          <div className="relative">
            <div className="text-2xl drop-shadow-md animate-bounce">💣</div>
            {bombSecondsLeft > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                {bombSecondsLeft}
              </div>
            )}
          </div>
        ) : (
          <Chevron direction={block.direction} />
        )}
      </div>

      {/* Thread Count Badge - Bottom Right Corner (only for normal tiles) */}
      {!isKey && !isSniper && !isRainbow && !isAggro && !isSpin && !isRandom && !isMultiplier && !isMystery && !isFreeze && !isBomb && (
        <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold z-20">
          {block.threadCount}
        </div>
      )}

      {/* Locked Pattern Overlay */}
      {isLocked && (
        <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden opacity-30">
           <div className="absolute inset-[-50%] w-[200%] h-[200%] bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
        </div>
      )}

      {/* Aggro Lock Overlay */}
      {isLockedByAggro && (
        <div className="absolute inset-0 rounded-xl pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-red-500/30 rounded-xl animate-pulse" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(220,38,38,0.3)_8px,rgba(220,38,38,0.3)_16px)] rounded-xl" />
          <Lock size={20} className="text-red-600 drop-shadow-lg relative z-10 animate-pulse" strokeWidth={3} />
        </div>
      )}
    </motion.button>
  );
};
