import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Play, Info, RotateCcw, Shuffle, Trophy, XCircle, Clock, Map } from 'lucide-react';
// Toast removed - no longer needed
import { Block, Spool, BlockColor, Thread, GameState, DragonSegment, Kitty } from './types';
import {
  GRID_SIZE,
  generateLevel,
  isPathClear,
  generateDragon,
  generateConveyorBlocks,
  LEVELS,
  loadLevel,
  shuffleBlocks,
  getRandomColor,
  getDifficultyForLevel
} from './utils/gameUtils';
import { playSound, triggerHaptic } from './utils/soundUtils';
import { generateUUID } from './utils/uuid';
import { Grid } from './components/Grid';
import { BufferArea } from './components/BufferArea';
import { DragonView } from './components/DragonView';
import { ThreadConnection } from './components/ThreadConnection';
import { ConveyorBelt } from './components/ConveyorBelt';
import { StartMenu } from './components/StartMenu';
import { Settings } from './components/Settings';

// LocalStorage keys
const PROGRESS_KEY = 'thread-unbound-progress';
const SETTINGS_KEY = 'thread-unbound-settings';

type Screen = 'menu' | 'playing' | 'settings' | 'shop' | 'achievements' | 'leaderboards' | 'profile' | 'daily-challenge';

interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

interface HistoryState {
  blocks: Block[];
  spools: Spool[];
  dragon: DragonSegment[];
  conveyorBlocks: Block[];
  score: number;
}

export default function App() {
  // Screen navigation
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    hapticsEnabled: true,
  });

  // Game state
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [conveyorBlocks, setConveyorBlocks] = useState<Block[]>([]);
  const [hiddenConveyorIds, setHiddenConveyorIds] = useState<Set<string>>(new Set());
  const [spools, setSpools] = useState<Spool[]>([]);
  const [dragon, setDragon] = useState<DragonSegment[]>([]);
  const [initialDragonSize, setInitialDragonSize] = useState(20);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [score, setScore] = useState(0);
  const [activeThreads, setActiveThreads] = useState<Thread[]>([]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [selectedKey, setSelectedKey] = useState<Block | null>(null);
  const [dragonGrowthInterval, setDragonGrowthInterval] = useState(10000);
  const [speedMultiplier, setSpeedMultiplier] = useState(3); // Default 3x (fast), can toggle to 1x (slow)
  const [highestLevelReached, setHighestLevelReached] = useState(0);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [kitty, setKitty] = useState<Kitty>({ isSwallowed: false, segmentIndex: 0 });

  // Load progress and settings from localStorage on mount
  useEffect(() => {
    // Load progress
    const savedProgress = localStorage.getItem(PROGRESS_KEY);
    if (savedProgress) {
      const progress = parseInt(savedProgress, 10);
      setHighestLevelReached(progress);
    }

    // Load settings
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Save progress to localStorage when highest level changes
  const saveProgress = (level: number) => {
    if (level > highestLevelReached) {
      setHighestLevelReached(level);
      localStorage.setItem(PROGRESS_KEY, level.toString());
    }
  };

  // Get available checkpoints (every 10 levels)
  const getCheckpoints = (): number[] => {
    const checkpoints = [0]; // Always include level 1 (index 0)
    for (let i = 10; i <= highestLevelReached; i += 10) {
      checkpoints.push(i);
    }
    return checkpoints;
  };

  // Menu navigation handlers
  const handlePlay = () => {
    setCurrentScreen('playing');
    startNewGame(true);
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  // Initialize 4 Spools (not 5 buffer slots!)
  const initSpools = () => {
    return Array.from({ length: 4 }, (_, i) => ({ id: i, block: null }));
  };

  // Helper: Calculate position on the path (matches DragonView logic)
  const getPathPosition = (distance: number): { x: number; y: number } => {
    const tunnelX = 210;
    const tunnelY = 0;
    const endX = -230;  // Kitty position (far left end of path)
    const totalPathLength = 400;

    const t = Math.min(distance / totalPathLength, 1);

    const x = tunnelX + (endX - tunnelX) * t;
    const curve1 = Math.sin(t * Math.PI * 3) * 35;
    const curve2 = Math.sin(t * Math.PI * 2 + 0.5) * 20;
    const y = tunnelY + (curve1 + curve2 * 0.5);

    return { x, y };
  };

  // Helper: Calculate dragon head position
  const getDragonHeadPosition = (dragonLength: number): { x: number; y: number } => {
    const spacing = 24;
    // Head is at index 0, so its distance is:
    const distance = (dragonLength - 1) * spacing;
    return getPathPosition(distance);
  };

  // Helper: Calculate kitty position on path when NOT swallowed
  const getKittyPathPosition = (): { x: number; y: number } => {
    return getPathPosition(400); // At the end of the path
  };

  const startNewGame = useCallback((useLevel: boolean = true) => {
    let newBlocks: Block[];
    let newDragonColors: BlockColor[];
    let newConveyorCount = 5;
    let newGrowthInterval = 10000; // Default 10s for tutorial levels

    if (useLevel && LEVELS[levelIndex]) {
      // Tutorial levels (0-4): Use manually designed levels
      const levelData = loadLevel(LEVELS[levelIndex]);
      newBlocks = levelData.blocks;
      newDragonColors = levelData.dragon;
      newConveyorCount = LEVELS[levelIndex].conveyorCount;

      // Ramp up snake speed in tutorial levels (faster baseline to match 3x default)
      // Level 1-2: 8s, Level 3: 7s, Level 4: 6s, Level 5: 5s
      const tutorialSpeeds = [8000, 8000, 7000, 6000, 5000];
      newGrowthInterval = tutorialSpeeds[levelIndex] || 6000;
    } else {
      // Procedural levels (5+): Use progressive difficulty
      const difficulty = getDifficultyForLevel(levelIndex);
      console.log(`🎮 Level ${levelIndex + 1} - Difficulty:`, difficulty);

      newBlocks = generateLevel(difficulty);
      newDragonColors = generateDragon(difficulty.initialDragonLength);
      newConveyorCount = difficulty.conveyorCount;
      newGrowthInterval = difficulty.dragonGrowthInterval;
    }

    const newDragon: DragonSegment[] = newDragonColors.map(c => ({
      id: generateUUID(),
      color: c
    }));

    setBlocks(newBlocks);
    setDragon(newDragon);
    setInitialDragonSize(newDragon.length);
    // Generate 10 tiles to fill the belt
    const initialBlocks = generateConveyorBlocks(10);
    setConveyorBlocks(initialBlocks);
    setHiddenConveyorIds(new Set()); // Reset hidden conveyor tiles
    setSpools(initSpools());
    setActiveThreads([]);
    setGameState('playing');
    setScore(0);
    setHistory([]);
    setSelectedKey(null);
    setDragonGrowthInterval(newGrowthInterval);
    setKitty({ isSwallowed: false, segmentIndex: 0 }); // Reset kitty to end of path
    playSound('move');
  }, [levelIndex]);

  useEffect(() => {
    startNewGame(true);
  }, [startNewGame]);

  // No auto-refill - tiles only added when they scroll off naturally

  // Handle blocks that scroll off the conveyor belt
  const handleBlockScrolledOff = (block: Block) => {
    console.log(`handleBlockScrolledOff: removing block ${block.id}, adding 1 new tile`);
    setConveyorBlocks(prev => {
      const newBlocks = prev.filter(b => b.id !== block.id);
      // Add one new tile to the end of the stream
      const newTile = generateConveyorBlocks(1)[0];
      return [...newBlocks, newTile];
    });
    // Clean up hidden ID
    setHiddenConveyorIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(block.id);
      return newSet;
    });
  };

  // --- SURVIVAL CLOCK ---
  // Adds segment at dynamic interval (faster on harder levels + speed multiplier)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const adjustedInterval = dragonGrowthInterval / speedMultiplier;

    const interval = setInterval(() => {
      // Calculate max dragon length (when head reaches end of path)
      const spacing = 24;
      const totalPathLength = 400;
      const maxDragonLength = Math.ceil(totalPathLength / spacing) + 1; // ~18

      let dragonGrew = false;
      let finalDragonLength = dragon.length;

      setDragon(prevDragon => {
        const currentLength = prevDragon.length;
        const isAtMaxLength = currentLength >= maxDragonLength;

        // Only grow if below max length
        if (!isAtMaxLength) {
          const newSegment: DragonSegment = {
            id: generateUUID(),
            color: getRandomColor()
          };
          playSound('move');
          dragonGrew = true;
          finalDragonLength = currentLength + 1;
          return [...prevDragon, newSegment];
        }

        // At max length - don't grow
        finalDragonLength = currentLength;
        return prevDragon;
      });

      // Handle kitty digestion when at max length
      setKitty(prev => {
        const isAtMaxLength = finalDragonLength >= maxDragonLength;

        if (isAtMaxLength && prev.isSwallowed) {
          // At max length with kitty inside: DIGEST (move kitty through segments)
          const newIndex = prev.segmentIndex + 1;
          playSound('move');
          return { ...prev, segmentIndex: newIndex };
        }

        // Not at max or kitty outside - no kitty movement
        return prev;
      });
    }, adjustedInterval);

    return () => clearInterval(interval);
  }, [gameState, dragonGrowthInterval, speedMultiplier]);

  // --- SWALLOWING CHECK ---
  // Check if dragon head has reached kitty position (end of path)
  useEffect(() => {
    if (gameState !== 'playing' || kitty.isSwallowed) return;

    const headPos = getDragonHeadPosition(dragon.length);
    const kittyPos = getKittyPathPosition(); // Kitty is at end of path

    // Check if head is close enough to kitty (within 30 units)
    const distance = Math.sqrt(Math.pow(headPos.x - kittyPos.x, 2) + Math.pow(headPos.y - kittyPos.y, 2));

    if (distance < 30) {
      // Start swallowing!
      console.log('🐱 SWALLOWING STARTED! Dragon head reached kitty');
      setKitty({ ...kitty, isSwallowed: true, segmentIndex: 0 });
      playSound('error'); // Uh oh sound
    }
  }, [dragon.length, kitty.isSwallowed, gameState]);

  // --- GAME OVER CHECK: Kitty at tail ---
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (kitty.isSwallowed && kitty.segmentIndex >= dragon.length - 1) {
      // Kitty has reached the tail - fully swallowed!
      console.log('💀 GAME OVER: Kitty fully swallowed!');
      setGameState('game_over');
      playSound('error');
    }
  }, [kitty, dragon.length, gameState]);

  // --- AUTO-FIRE MECHANISM ---
  // Check if snake head color matches any spool, then fire automatically
  // Use a slight delay to allow visual feedback
  // IMPORTANT: Only fire ONE spool per auto-fire check to prevent double-firing
  useEffect(() => {
    if (gameState !== 'playing' || dragon.length === 0) return;

    // Delay check slightly to allow spools to be visible
    const timer = setTimeout(() => {
      console.log('🔍 Auto-fire check running...');
      console.log('  Dragon length:', dragon.length);
      console.log('  Dragon colors:', dragon.map(d => d.color));

      // Find FIRST matching spool only (prevent double-fire)
      let firedThisCycle = false;

      for (let spoolIndex = 0; spoolIndex < spools.length; spoolIndex++) {
        const spool = spools[spoolIndex];

        if (firedThisCycle) break; // Only fire one spool per cycle

        if (!spool.block) {
          console.log(`  Spool ${spoolIndex}: empty`);
          continue; // Empty spool, skip
        }

        const blockColor = spool.block.color;
        console.log(`  Spool ${spoolIndex}: ${blockColor} (threadCount: ${spool.block.threadCount})`);

        // Check if spool color matches ANY segment in the entire snake body
        const hasMatchingColor = dragon.some(seg => seg.color === blockColor);

        console.log(`  Does snake have ${blockColor}? ${hasMatchingColor}`);

        if (hasMatchingColor) {
          // AUTO-FIRE!
          const threadCount = spool.block.threadCount;
          const targetColor = spool.block.color;

          console.log(`🎯 AUTO-FIRE CHECK! ${blockColor} spool matched! Attempting to remove up to ${threadCount} segments`);

          // Count how many matching segments exist in the snake (excluding head)
          let matchingCount = 0;
          dragon.forEach((seg, idx) => {
            if (idx > 0 && seg.color === targetColor) {
              matchingCount++;
            }
          });

          const segmentsToRemove = Math.min(threadCount, matchingCount);
          console.log(`  Found ${matchingCount} matching ${targetColor} segments, removing ${segmentsToRemove}`);

          if (segmentsToRemove === 0) {
            console.log(`  ⚠️ No segments to remove, skipping this spool`);
            continue; // Skip if no segments to remove, check next spool
          }

          // Only set flag AFTER confirming we have segments to remove
          firedThisCycle = true;
          console.log(`  ✅ FIRING spool ${spoolIndex}!`);

          // Visual thread animation
          const threadId = generateUUID();
          setActiveThreads(prev => [...prev, {
            id: threadId,
            fromSlotId: spoolIndex,
            color: targetColor,
            targetSegmentIndex: 0 // Target head
          }]);

          setTimeout(() => setActiveThreads(prev => prev.filter(t => t.id !== threadId)), 500);

          // Remove segments from snake
          let actuallyRemoved = 0;
          setDragon(prev => {
            let removed = 0;
            const newDragon: DragonSegment[] = [];

            // Keep head (index 0), then filter out matching color segments
            for (let i = 0; i < prev.length; i++) {
              if (i === 0) {
                // Always keep head
                newDragon.push(prev[i]);
              } else if (prev[i].color === targetColor && removed < segmentsToRemove) {
                // This segment matches and we haven't removed enough yet - REMOVE IT
                removed++;
              } else {
                // Keep this segment
                newDragon.push(prev[i]);
              }
            }

            actuallyRemoved = removed;

            // Play sound and haptics
            if (removed > 0) {
              playSound('pop');
              triggerHaptic([20, 20]);
            }

            // Victory condition: All segments removed (only head remains)
            if (newDragon.length === 1) {
              setGameState('won');
              playSound('win');
            }

            return newDragon;
          });

          // Update kitty position after segment removal
          setKitty(prev => {
            if (!prev.isSwallowed) return prev;

            // Kitty moves BACK (toward head) by the number of segments removed
            // Visual: kitty travels LEFT along the snake body
            const newIndex = prev.segmentIndex - actuallyRemoved;


            // Check if kitty has escaped (moved past the head)
            if (newIndex <= 0) {
              // Kitty escaped! Place it back at the end of the path
              console.log('🎉 Kitty escaped! Back at the end of the path');
              return {
                ...prev,
                isSwallowed: false,
                segmentIndex: 0
              };
            }

            return { ...prev, segmentIndex: newIndex };
          });

          // Update or clear the spool based on remaining threadCount
          const remainingThreads = threadCount - segmentsToRemove;
          console.log(`  Remaining threads: ${remainingThreads}`);

          setSpools(prev => {
            const newSpools = [...prev];
            if (remainingThreads > 0) {
              // Keep block in spool with reduced threadCount
              newSpools[spoolIndex] = {
                ...newSpools[spoolIndex],
                block: { ...spool.block!, threadCount: remainingThreads }
              };
              console.log(`  ✓ Block stays in spool with ${remainingThreads} threads remaining`);
            } else {
              // Remove block from spool (all threads used)
              newSpools[spoolIndex] = { ...newSpools[spoolIndex], block: null };
              console.log(`  ✓ Block removed from spool (all threads used)`);
            }
            return newSpools;
          });

          // Add score based on segments actually removed
          setScore(s => s + segmentsToRemove * 10);
        }
      }
    }, 600); // 600ms delay to allow visual feedback

    return () => clearTimeout(timer);
  }, [dragon, spools, gameState, initialDragonSize]);


  const pushHistory = () => {
    setHistory(prev => {
      const newState: HistoryState = {
        blocks: JSON.parse(JSON.stringify(blocks)),
        spools: JSON.parse(JSON.stringify(spools)),
        dragon: [...dragon],
        conveyorBlocks: JSON.parse(JSON.stringify(conveyorBlocks)),
        score
      };
      const newHistory = [...prev, newState];
      if (newHistory.length > 5) newHistory.shift();
      return newHistory;
    });
  };

  const handleUndo = () => {
    if (history.length === 0 || gameState !== 'playing') return;
    playSound('undo');
    triggerHaptic(15);
    const previousState = history[history.length - 1];
    setBlocks(previousState.blocks);
    setSpools(previousState.spools);
    setDragon(previousState.dragon);
    setConveyorBlocks(previousState.conveyorBlocks);
    setScore(previousState.score);
    setHistory(prev => prev.slice(0, -1));
    setSelectedKey(null); // Clear any selected key
  };

  const handleShuffle = () => {
    if (gameState !== 'playing') return;
    pushHistory();
    playSound('shuffle');
    triggerHaptic([10, 10, 10]);
    setBlocks(prev => shuffleBlocks(prev));
  };

  const unlockBlocks = (keyColor: BlockColor) => {
    console.log(`🔓 unlockBlocks called with keyColor: ${keyColor}`);
    const lockedBlocks = blocks.filter(b => b.type === 'locked');
    console.log(`  All locked blocks:`, lockedBlocks.map(b => `${b.color} at (${b.x},${b.y})`));

    const lockedCount = blocks.filter(b => b.color === keyColor && b.type === 'locked').length;
    console.log(`  Locked blocks matching ${keyColor}: ${lockedCount}`);

    if (lockedCount > 0) {
      setBlocks(prev => prev.map(b => {
        if (b.color === keyColor && b.type === 'locked') {
          console.log(`  Unlocking ${b.color} block at (${b.x},${b.y})`);
          return { ...b, type: 'normal', justUnlocked: true };
        }
        return b;
      }));
      playSound('pop');
      triggerHaptic([30, 30, 30]);
      setTimeout(() => {
         setBlocks(prev => prev.map(b => {
           if (b.justUnlocked) {
             const { justUnlocked, ...rest } = b;
             return rest;
           }
           return b;
         }));
      }, 600);
    }
  };

  const handleBlockClick = (block: Block, source: 'grid' | 'conveyor') => {
    if (gameState !== 'playing') return;

    // --- KEY BLOCK SPECIAL LOGIC (from grid only) ---
    if (source === 'grid' && block.type === 'key') {
      // Select the key - user will then click on a locked block to unlock it
      console.log(`🔑 Key block clicked! Color: ${block.color}, Position: (${block.x},${block.y})`);

      // If clicking the same key again, deselect it
      if (selectedKey?.id === block.id) {
        setSelectedKey(null);
        playSound('move');
        return;
      }

      // Select this key
      setSelectedKey(block);
      playSound('move');
      triggerHaptic(10);

      return; // Don't continue to spool logic
    }

    // --- CONVEYOR LOGIC ---
    if (source === 'conveyor') {
      // Find all empty Layer 0 spots
      const emptySpots: { x: number; y: number }[] = [];

      // Scan grid for all empty spots
      for (let r = 0; r < GRID_SIZE.rows; r++) {
        for (let c = 0; c < GRID_SIZE.cols; c++) {
          // Check if ANY block is at this x,y (Layer 0 or 1)
          const occupied = blocks.some(b => Math.round(b.x) === c && Math.round(b.y) === r);
          if (!occupied) {
            emptySpots.push({ x: c, y: r });
          }
        }
      }

      if (emptySpots.length === 0) {
        playSound('error');
        return;
      }

      // Pick a random empty spot
      const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
      const targetX = randomSpot.x;
      const targetY = randomSpot.y;

      pushHistory();
      playSound('move');
      // Hide the clicked block but keep it in array to maintain spacing
      setHiddenConveyorIds(prev => new Set(prev).add(block.id));

      const newBlock: Block = {
        ...block,
        x: targetX,
        y: targetY,
        layer: 0, // Always drop to base layer
        // Preserve original direction - blocks can point in any direction
      };

      // IMPORTANT: Remove any existing blocks at this position before adding (prevents stacking)
      setBlocks(prev => {
        const filtered = prev.filter(b =>
          !(Math.round(b.x) === targetX && Math.round(b.y) === targetY)
        );
        return [...filtered, newBlock];
      });
      return;
    }

    // --- GRID LOGIC ---
    if (block.type === 'locked') {
      // Check if we have a matching key selected
      if (selectedKey && selectedKey.color === block.color) {
        // Unlock this specific block with the key!
        pushHistory();
        playSound('pop');
        triggerHaptic([30, 30, 30]);

        // Remove the key from the grid
        setBlocks(prev => prev.filter(b => b.id !== selectedKey.id));

        // Unlock this specific locked block
        setBlocks(prev => prev.map(b => {
          if (b.id === block.id) {
            return { ...b, type: 'normal', justUnlocked: true };
          }
          return b;
        }));

        // Clear the justUnlocked flag after animation
        setTimeout(() => {
          setBlocks(prev => prev.map(b => {
            if (b.justUnlocked) {
              const { justUnlocked, ...rest } = b;
              return rest;
            }
            return b;
          }));
        }, 600);

        // Clear selected key
        setSelectedKey(null);

        return;
      } else {
        // No matching key selected
        playSound('error');
        triggerHaptic(50);
        return;
      }
    }
    if (!isPathClear(block, blocks, GRID_SIZE)) {
      playSound('error');
      triggerHaptic(50);
      return; 
    }

    // NEW SPOOL LOGIC: Find first empty spool (no stacking, no match-3!)
    const emptySpoolIndex = spools.findIndex(spool => spool.block === null);

    if (emptySpoolIndex === -1) {
      // All 4 spools are full - can't click more blocks
      playSound('error');
      triggerHaptic(100);
      return;
    }

    pushHistory();
    playSound('move');
    triggerHaptic(10);

    // Remove block from grid
    setBlocks(prev => prev.filter(b => b.id !== block.id));

    // Place block in empty spool (ONE block per spool)
    setSpools(prev => {
      const newSpools = [...prev];
      newSpools[emptySpoolIndex] = { ...newSpools[emptySpoolIndex], block };
      return newSpools;
    });

    // Visual thread animation (will be replaced with auto-fire logic later)
    const threadId = generateUUID();
    setActiveThreads(prev => [...prev, {
      id: threadId,
      fromSlotId: emptySpoolIndex,
      color: block.color,
      targetSegmentIndex: 1 // Temporary - will be replaced with auto-fire
    }]);

    setTimeout(() => setActiveThreads(prev => prev.filter(t => t.id !== threadId)), 500);

    // Note: Key blocks are handled separately above and never reach this point
  };

  // Legacy function - no longer used with new auto-fire system
  const triggerUnravel = (slotIndex: number, color: BlockColor) => {
    playSound('pop');
    triggerHaptic([20, 20]);

    setDragon(prev => {
       // Search from Index 1 (Head Protected)
       const indicesToRemove: number[] = [];
       for (let i = 1; i < prev.length; i++) {
         if (indicesToRemove.length < 3 && prev[i].color === color) {
           indicesToRemove.push(i);
         }
       }

       const newDragon = prev.filter((_, index) => !indicesToRemove.includes(index));

       // Victory if only head remains
       if (newDragon.length === 1) {
         setGameState('won');
         playSound('win');
       }
       return newDragon;
    });
    setScore(s => s + 100);
  };

  // Render different screens based on currentScreen
  if (currentScreen === 'menu') {
    return (
      <StartMenu
        currentLevel={levelIndex + 1}
        onPlay={handlePlay}
        onDailyChallenge={() => setCurrentScreen('daily-challenge')}
        onShop={() => setCurrentScreen('shop')}
        onAchievements={() => setCurrentScreen('achievements')}
        onLeaderboards={() => setCurrentScreen('leaderboards')}
        onSettings={() => setCurrentScreen('settings')}
        onProfile={() => setCurrentScreen('profile')}
      />
    );
  }

  if (currentScreen === 'settings') {
    return (
      <Settings
        soundEnabled={settings.soundEnabled}
        hapticsEnabled={settings.hapticsEnabled}
        onSoundToggle={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
        onHapticsToggle={() => setSettings(prev => ({ ...prev, hapticsEnabled: !prev.hapticsEnabled }))}
        onClose={handleBackToMenu}
      />
    );
  }

  // Placeholder screens for future features
  if (currentScreen === 'shop' || currentScreen === 'achievements' || currentScreen === 'leaderboards' || currentScreen === 'profile' || currentScreen === 'daily-challenge') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4 capitalize">{currentScreen.replace('-', ' ')}</h2>
          <p className="text-purple-200 mb-8">Coming soon!</p>
          <button
            onClick={handleBackToMenu}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="min-h-screen bg-game-bg flex flex-col font-sans relative overflow-hidden select-none">
      <ThreadConnection activeThreads={activeThreads} />
      
      {/* Compact Header */}
      <header className="px-3 py-2 bg-white shadow-sm z-30 relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToMenu}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full active:scale-95 transition-all"
              title="Menu"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5 bg-indigo-100 px-2 py-0.5 rounded-md">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                {levelIndex < LEVELS.length ? 'Tutorial' : 'Lvl'} {levelIndex + 1}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy size={12} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-600">{score.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setShowCheckpointModal(true)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full active:scale-95 transition-all"
              title="Select Level"
            >
              <Map size={16} />
            </button>
            <button
              onClick={() => setSpeedMultiplier(prev => prev === 1 ? 3 : 1)}
              className={`px-2 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                speedMultiplier === 3
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {speedMultiplier}x
            </button>
            <button onClick={handleUndo} disabled={history.length === 0} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full disabled:opacity-30 active:scale-95 transition-all">
              <RotateCcw size={16} />
            </button>
            <button onClick={handleShuffle} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full active:scale-95 transition-all">
              <Shuffle size={16} />
            </button>
            <button onClick={() => startNewGame(true)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full active:scale-95 transition-all">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="w-full max-w-4xl mx-auto px-2 flex flex-col items-center gap-2 relative z-10">
        {/* Dragon - More compact */}
        <DragonView segments={dragon} kitty={kitty} />

        {/* Spools - Horizontal at top of grid */}
        <div className="w-full flex justify-center py-1 z-30">
          <BufferArea slots={spools} />
        </div>

        {/* Grid - Centered */}
        <div className="w-full flex items-center justify-center z-20">
          <Grid
            blocks={blocks}
            gridSize={GRID_SIZE}
            onBlockClick={(b) => handleBlockClick(b, 'grid')}
            selectedKeyId={selectedKey?.id}
          />
        </div>

        {/* Conveyor Belt - More spacing from grid to prevent overlap */}
        <div className="w-full pt-3 pb-1">
          <ConveyorBelt
            blocks={conveyorBlocks}
            hiddenIds={hiddenConveyorIds}
            onBlockClick={(b) => handleBlockClick(b, 'conveyor')}
            onBlockScrolledOff={handleBlockScrolledOff}
          />
        </div>
      </main>
      
      {/* WIN OVERLAY */}
      {gameState === 'won' && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
           <div className="text-center">
             <div className="text-6xl mb-6 animate-bounce">🏆</div>
             <h2 className="text-4xl font-bold text-slate-800 mb-2">Safe & Sound!</h2>
             <p className="text-slate-600 mb-8 font-medium">You saved the Kitty!</p>
             <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
               <button
                 onClick={() => {
                   saveProgress(levelIndex); // Save progress before advancing
                   setLevelIndex(prev => prev + 1);
                   startNewGame(true);
                 }}
                 className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
               >
                 Next Level
               </button>
               <button
                 onClick={() => startNewGame(true)}
                 className="w-full py-3 bg-white text-slate-600 font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
               >
                 Replay
               </button>
               <button
                 onClick={handleBackToMenu}
                 className="w-full py-2 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
               >
                 Menu
               </button>
             </div>
           </div>
        </div>
      )}

      {/* GAME OVER OVERLAY */}
      {gameState === 'game_over' && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
           <div className="text-center text-white">
             <div className="text-6xl mb-6 text-red-500"><XCircle size={80} /></div>
             <h2 className="text-4xl font-bold mb-2">Game Over!</h2>
             <p className="text-slate-300 mb-8 font-medium">
               {dragon.length >= 35 ? 'The Dragon got too long!' : 'The buffer is full.'}
             </p>
             <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
               <button
                 onClick={handleUndo}
                 disabled={history.length === 0}
                 className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
               >
                 Undo Last Move
               </button>
               <button
                 onClick={() => startNewGame(true)}
                 className="w-full py-3 bg-white text-slate-800 font-bold rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
               >
                 Try Again
               </button>
               <button
                 onClick={handleBackToMenu}
                 className="w-full py-2 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 active:scale-95 transition-all"
               >
                 Menu
               </button>
             </div>
           </div>
        </div>
      )}

      {/* CHECKPOINT SELECTION MODAL */}
      {showCheckpointModal && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Select Level</h2>
            <p className="text-slate-600 mb-6 text-sm">
              Choose a checkpoint to start from. Checkpoints are unlocked every 10 levels.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {getCheckpoints().map((checkpoint) => (
                <button
                  key={checkpoint}
                  onClick={() => {
                    setLevelIndex(checkpoint);
                    setShowCheckpointModal(false);
                    startNewGame(true);
                  }}
                  className={`py-3 px-4 rounded-xl font-bold transition-all active:scale-95 ${
                    checkpoint === levelIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {checkpoint === 0 ? 'Start' : `Lvl ${checkpoint + 1}`}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCheckpointModal(false)}
              className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
