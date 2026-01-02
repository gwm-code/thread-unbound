import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockColor, DragonSegment, Kitty } from '../types';

interface DragonViewProps {
  segments: DragonSegment[];
  kitty: Kitty;
}

const segmentColors: Record<BlockColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
};

const segmentStrokes: Record<BlockColor, string> = {
  red: '#b91c1c',
  blue: '#1d4ed8',
  green: '#047857',
  yellow: '#b45309',
  purple: '#6d28d9',
};

// Custom Kitty Component - matches dragon's visual style
const KittyIcon: React.FC<{ size?: number; scared?: boolean }> = ({ size = 36, scared = false }) => {
  const scale = size / 36; // Base size is 36
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <g transform={`scale(${scale})`}>
        {/* Body (main circle) */}
        <circle cx="18" cy="20" r="12" fill="#f97316" stroke="#c2410c" strokeWidth="2" />

        {/* Body highlight */}
        <circle cx="14" cy="16" r="4" fill="white" opacity="0.3" />

        {/* Head (slightly overlapping) */}
        <circle cx="18" cy="12" r="10" fill="#f97316" stroke="#c2410c" strokeWidth="2" />

        {/* Head highlight */}
        <circle cx="14" cy="9" r="3" fill="white" opacity="0.3" />

        {/* Ears */}
        <ellipse cx="11" cy="5" rx="3" ry="5" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
        <ellipse cx="25" cy="5" rx="3" ry="5" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />

        {/* Inner ears (pink) */}
        <ellipse cx="11" cy="6" rx="1.5" ry="2.5" fill="#fda4af" />
        <ellipse cx="25" cy="6" rx="1.5" ry="2.5" fill="#fda4af" />

        {scared ? (
          <>
            {/* Scared eyes (wide open circles) */}
            <circle cx="14" cy="11" r="2.5" fill="white" stroke="#1a1410" strokeWidth="1" />
            <circle cx="22" cy="11" r="2.5" fill="white" stroke="#1a1410" strokeWidth="1" />
            <circle cx="14" cy="11" r="1.5" fill="#1a1410" />
            <circle cx="22" cy="11" r="1.5" fill="#1a1410" />

            {/* Scared mouth (O shape) */}
            <ellipse cx="18" cy="16" rx="2" ry="3" fill="#1a1410" />
          </>
        ) : (
          <>
            {/* Happy eyes (closed curves) */}
            <path d="M 12 11 Q 14 13 16 11" stroke="#1a1410" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 20 11 Q 22 13 24 11" stroke="#1a1410" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Happy mouth (smile) */}
            <path d="M 15 15 Q 18 17 21 15" stroke="#1a1410" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Nose */}
        <ellipse cx="18" cy="14" rx="1.5" ry="1" fill="#fda4af" />

        {/* Whiskers */}
        <line x1="8" y1="13" x2="3" y2="12" stroke="#1a1410" strokeWidth="1" opacity="0.6" />
        <line x1="8" y1="15" x2="3" y2="15" stroke="#1a1410" strokeWidth="1" opacity="0.6" />
        <line x1="28" y1="13" x2="33" y2="12" stroke="#1a1410" strokeWidth="1" opacity="0.6" />
        <line x1="28" y1="15" x2="33" y2="15" stroke="#1a1410" strokeWidth="1" opacity="0.6" />

        {/* Tail */}
        <path
          d="M 27 22 Q 32 20 34 16"
          stroke="#c2410c"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 27 22 Q 32 20 34 16"
          stroke="#f97316"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

// Fixed Winding Path - snake emerges continuously from tunnel
// The path is a fixed S-curve that the snake follows
const getPathPosition = (distance: number, totalLength: number): { x: number; y: number } => {
  // Tunnel position (where tail segment at index=length-1 always stays)
  const tunnelX = 210;
  const tunnelY = 0;

  // The path is measured in distance from tunnel
  // distance = 0 means at the tunnel (tail position)
  // distance increases toward the kitty (head position)

  // Total path length available
  const totalPathLength = 400;

  // Position along the path as a ratio (0 = tunnel, 1 = kitty)
  const t = Math.min(distance / totalPathLength, 1);

  // Define the winding S-curve path
  // The path goes: tunnel (right) → curves → kitty (left)
  const endX = -230;       // Kitty position (far left end of path)
  const x = tunnelX + (endX - tunnelX) * t;

  // Create multiple S-curves for winding effect
  const curve1 = Math.sin(t * Math.PI * 3) * 35;      // 3 complete waves
  const curve2 = Math.sin(t * Math.PI * 2 + 0.5) * 20; // Offset wave for complexity
  const y = tunnelY + (curve1 + curve2 * 0.5);

  return { x, y };
};

export const DragonView: React.FC<DragonViewProps> = ({ segments, kitty }) => {
  // Config
  const radius = 18;
  // Moderate overlap - segments must be visible but connected
  // Diameter = 36px, spacing = 24px gives 33% overlap (12px)
  // This ensures all segments are visible while appearing connected
  const spacing = 24;

  // Position Configuration
  // Kitty position: When NOT swallowed, position at the END of the path
  let kittyX = 0;
  let kittyY = 0;

  if (!kitty.isSwallowed) {
    // Position kitty at the absolute end of the path (t = 1)
    // ViewBox is -240 to 240, so path should end near the far left edge
    const tunnelX = 210;
    const tunnelY = 0;
    const endX = -230;  // Far left end of visible path

    // t = 1 means the very end of the path
    const t = 1;
    kittyX = tunnelX + (endX - tunnelX) * t;
    const curve1 = Math.sin(t * Math.PI * 3) * 35;
    const curve2 = Math.sin(t * Math.PI * 2 + 0.5) * 20;
    kittyY = tunnelY + (curve1 + curve2 * 0.5);
  }

  // Danger Check: Kitty getting close to tail
  const isDanger = kitty.isSwallowed && (segments.length - kitty.segmentIndex) <= 5;

  return (
    <div className="w-full h-[80px] md:h-[120px] flex items-center justify-center relative z-10 bg-gradient-to-b from-green-100 to-green-200 rounded-b-2xl border-b border-green-300">
      <svg
        width="100%"
        height="100%"
        viewBox="-240 -60 480 120"
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        {/* Draw the visible winding path that the snake follows */}
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor: '#d4a574', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#b8935f', stopOpacity: 1}} />
          </linearGradient>
        </defs>

        {/* Path background - draw the road */}
        <path
          d={(() => {
            // Generate path points matching the snake path
            const points: string[] = [];
            const tunnelX = 210;
            const tunnelY = 0;
            const endX = -230;  // Match the path end position

            for (let i = 0; i <= 100; i++) {
              const t = i / 100;
              const x = tunnelX + (endX - tunnelX) * t;
              const curve1 = Math.sin(t * Math.PI * 3) * 35;
              const curve2 = Math.sin(t * Math.PI * 2 + 0.5) * 20;
              const y = tunnelY + (curve1 + curve2 * 0.5);
              points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
            }
            return points.join(' ');
          })()}
          stroke="url(#pathGradient)"
          strokeWidth="50"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Tunnel/Hole on the right where snake emerges */}
        <ellipse
          cx="220"
          cy="0"
          rx="40"
          ry="30"
          fill="#8b7355"
          opacity="0.8"
        />
        <ellipse
          cx="220"
          cy="0"
          rx="30"
          ry="22"
          fill="#3d2f24"
          opacity="0.9"
        />

        {/* Kitty - either at safe position or on path */}
        {!kitty.isSwallowed && (
          <motion.g
              key="kitty-free"
              initial={{ x: kittyX - 18, y: kittyY - 18, opacity: 0, scale: 0 }}
              animate={{ x: kittyX - 18, y: kittyY - 18, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
             <foreignObject width="36" height="36">
               <div className="flex items-center justify-center w-full h-full">
                 <KittyIcon size={36} scared={false} />
               </div>
             </foreignObject>
          </motion.g>
        )}

        <AnimatePresence mode='popLayout'>
          {/* Reverse the array so tail renders first (back), head renders last (front) */}
          {[...segments].reverse().map((segment, reverseIndex) => {
            // Get original index for positioning
            const index = segments.length - 1 - reverseIndex;
            const isHead = index === 0;
            const hasKitty = kitty.isSwallowed && kitty.segmentIndex === index;

            // Positioning Logic:
            // Snake emerges from the right like a train from a tunnel
            // Head (index 0) should be FURTHEST along the path (toward kitty on left)
            // Tail (last index) should be at START of path (right side, emerging)
            // Reverse the distance so head has max distance
            const distance = (segments.length - 1 - index) * spacing;
            const pos = getPathPosition(distance, segments.length);
            const cx = pos.x;
            const cy = pos.y;
            const scale = isHead ? 1.2 : (hasKitty ? 1.5 : 1); // Bulge if contains kitty

            return (
              <motion.g
                key={segment.id}
                layoutId={segment.id}
                id={`dragon-segment-${index}`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1
                }}
                exit={{ opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                }}
              >
                <motion.g
                  initial={{ x: cx + 50, y: cy, scale: 0 }}
                  animate={{
                    x: cx,
                    y: cy,
                    scale
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 25,
                  }}
                >
                  {/* Body Segment */}
                  <circle
                    r={radius}
                    fill={isHead ? '#3d2f24' : segmentColors[segment.color]}
                    stroke={isHead ? '#1a1410' : segmentStrokes[segment.color]}
                    strokeWidth={2}
                  />

                  {/* Highlight */}
                  <circle cx={-5} cy={-5} r={4} fill="white" opacity={0.3} />

                  {/* Head Details (Only on Index 0) */}
                  {isHead && (
                    <g transform="scale(-1, 1)"> {/* Flip to look Left at Kitty */}
                      <circle cx={6} cy={-6} r={4} fill="white" />
                      <circle cx={6} cy={-6} r={1.5} fill="black" />
                      <circle cx={6} cy={6} r={4} fill="white" />
                      <circle cx={6} cy={6} r={1.5} fill="black" />
                      <circle cx={12} cy={-2} r={1} fill="#1a1410" opacity={0.6} />
                      <circle cx={12} cy={2} r={1} fill="#1a1410" opacity={0.6} />
                    </g>
                  )}

                  {/* Scared Kitty inside segment */}
                  {hasKitty && (
                    <motion.g
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <foreignObject x={-14} y={-14} width="28" height="28">
                        <div className="flex items-center justify-center w-full h-full">
                          <KittyIcon size={28} scared={true} />
                        </div>
                      </foreignObject>
                    </motion.g>
                  )}
                </motion.g>
              </motion.g>
            );
          })}
        </AnimatePresence>
        
        {segments.length === 1 && (
           // If only head remains
           <motion.text
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            x="0"
            y="50"
            textAnchor="middle"
            fill="#059669"
            className="font-bold text-lg"
          >
            VICTORY!
          </motion.text>
        )}
      </svg>
    </div>
  );
};
