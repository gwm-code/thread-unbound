import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Block, GridSize } from '../types';
import { BlockView } from './BlockView';
import { AnimatePresence } from 'framer-motion';

interface GridProps {
  blocks: Block[];
  gridSize: GridSize;
  onBlockClick: (block: Block) => void;
  selectedKeyId?: string | null;
  aggroTileId?: string | null;
}

export const Grid: React.FC<GridProps> = ({ blocks, gridSize, onBlockClick, selectedKeyId, aggroTileId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(60);

  // Responsive cell size calculation
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const newSize = Math.floor((width) / gridSize.cols);
        setCellSize(newSize);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [gridSize.cols]);

  return (
    <div className="flex justify-center items-center w-full">
      <div
        ref={containerRef}
        className={`relative bg-white rounded-2xl shadow-xl border-4 overflow-hidden transition-all duration-300 ${
          aggroTileId ? 'border-red-500 animate-pulse' : 'border-slate-200'
        }`}
        style={{
          width: '100%',
          maxWidth: '500px',
          height: Math.max(cellSize * gridSize.rows, 300),
          minHeight: '300px',
          backgroundImage: 'radial-gradient(#e2e8f0 2px, transparent 2px)',
          backgroundSize: `${cellSize}px ${cellSize}px`,
          backgroundPosition: '4px 4px'
        }}
      >
        {/* Aggro Lock Overlay */}
        {aggroTileId && (
          <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[1px] pointer-events-none z-10 animate-pulse" />
        )}

        <AnimatePresence>
          {blocks.map((block) => {
             const isSelected = selectedKeyId === block.id;
             const isLockedByAggro = aggroTileId && block.id !== aggroTileId;
             return (
              <BlockView
                key={block.id}
                block={block}
                gridCellSize={cellSize}
                isSelected={isSelected}
                isLockedByAggro={isLockedByAggro}
                onClick={() => onBlockClick(block)}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
