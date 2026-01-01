import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Thread } from '../types';

interface ThreadConnectionProps {
  activeThreads: Thread[];
}

interface LineCoords {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

const colorMap: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
};

export const ThreadConnection: React.FC<ThreadConnectionProps> = ({ activeThreads }) => {
  const [lines, setLines] = useState<LineCoords[]>([]);

  useEffect(() => {
    if (activeThreads.length === 0) {
      setLines([]);
      return;
    }

    const newLines: LineCoords[] = [];

    const getCenter = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    };

    activeThreads.forEach(thread => {
      const slotPos = getCenter(`buffer-slot-${thread.fromSlotId}`);
      
      // Ensure we target the body (index 1+), never the head (index 0)
      // Fallback: if calculated target is 0 or -1, default to 1
      const safeTargetIndex = Math.max(1, thread.targetSegmentIndex);
      
      const targetId = `dragon-segment-${safeTargetIndex}`;
      let targetPos = getCenter(targetId);
      
      // Fallback search if specific segment is missing
      if (!targetPos) {
         // Try finding any segment > 0
         // Note: DOM order usually matches render order, but we can't guarantee selector order
         // Just try segment 1
         targetPos = getCenter(`dragon-segment-1`);
         if (!targetPos) {
             // Absolute fallback
             targetPos = { x: window.innerWidth / 2, y: 150 };
         }
      }

      if (slotPos && targetPos) {
        newLines.push({
          id: thread.id,
          x1: slotPos.x,
          y1: slotPos.y,
          x2: targetPos.x,
          y2: targetPos.y,
          color: colorMap[thread.color] || '#cbd5e1'
        });
      }
    });

    setLines(newLines);
  }, [activeThreads]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <svg className="w-full h-full">
        {lines.map(line => (
          <motion.path
            key={line.id}
            // Control point logic: Pull visually "up" out of buffer, then arc down to dragon
            d={`M${line.x1},${line.y1} C${line.x1},${line.y1 - 100} ${line.x2},${line.y2 + 50} ${line.x2},${line.y2}`}
            fill="none"
            stroke={line.color}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.8 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
};
