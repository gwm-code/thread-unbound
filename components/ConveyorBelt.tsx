import React, { useEffect, useState, useRef } from 'react';
import { Block } from '../types';
import { BlockView } from './BlockView';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface ConveyorBeltProps {
  blocks: Block[];
  hiddenIds: Set<string>;
  onBlockClick: (block: Block) => void;
  onBlockScrolledOff?: (block: Block) => void;
  speedBoostActive?: boolean; // 2x speed when true
}

export const ConveyorBelt: React.FC<ConveyorBeltProps> = ({ blocks, hiddenIds, onBlockClick, onBlockScrolledOff, speedBoostActive = false }) => {
  const blockWidth = 56; // 48px block + 8px gap
  const baseScrollSpeed = 30; // pixels per second
  const scrollSpeed = speedBoostActive ? baseScrollSpeed * 2 : baseScrollSpeed; // 2x speed when boost active
  const startPosition = 450; // Where blocks start (right edge)

  // Track continuous scroll offset
  const scrollOffsetRef = useRef(0);
  const [, forceUpdate] = useState(0);

  // Animation loop
  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      scrollOffsetRef.current += deltaTime * scrollSpeed;

      // Check if first block has scrolled off the left edge (-56px is fully off)
      if (blocks.length > 0 && onBlockScrolledOff) {
        const firstBlockPos = startPosition - scrollOffsetRef.current;
        if (firstBlockPos < -blockWidth) {
          // Remove the first block and reset offset to compensate
          scrollOffsetRef.current -= blockWidth;
          onBlockScrolledOff(blocks[0]);
        }
      }

      forceUpdate(prev => prev + 1);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [blocks, blockWidth, onBlockScrolledOff, startPosition]);

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-0.5 pl-1">
         <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Conveyor</span>
         <div className="h-[1px] flex-1 bg-slate-200"></div>
      </div>

      <div className="relative h-12 md:h-16 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600 shadow-inner flex items-center">
        {/* Moving Background Pattern */}
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 20px)',
               backgroundSize: '28px 28px',
             }}
        >
          <motion.div
            className="w-full h-full"
            animate={{ x: [-28, 0] }}
            transition={{ repeat: Infinity, duration: 0.67, ease: "linear" }}
             style={{
               backgroundImage: 'inherit',
             }}
          />
        </div>

        {/* The Blocks - Continuous stream */}
        <div className="relative w-full h-full">
          {blocks.map((block, index) => {
            // Skip rendering if this block is hidden (clicked by user)
            if (hiddenIds.has(block.id)) return null;

            // Position based on array index, offset by scroll
            // Index 0 starts at startPosition (right edge), each next block is blockWidth to the right
            const currentPos = startPosition + (index * blockWidth) - scrollOffsetRef.current;

            return (
              <div
                key={block.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${currentPos}px`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  transition: 'none'
                }}
              >
                <div className="w-12 h-12 relative">
                  <BlockView
                    block={block}
                    isBuffer={true}
                    onClick={() => onBlockClick(block)}
                  />
                </div>
              </div>
            );
          })}

          {blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs italic">
              Belt Empty
            </div>
          )}
        </div>

        {/* Right Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-800 to-transparent pointer-events-none z-20" />
      </div>
    </div>
  );
};
