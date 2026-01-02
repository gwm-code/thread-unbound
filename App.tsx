import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Play, Info, RotateCcw, Shuffle, Trophy, XCircle, Clock, Map, Coins, Gem } from 'lucide-react';
// Toast removed - no longer needed
import { Block, Spool, BlockColor, Thread, GameState, DragonSegment, Kitty, PlayerCurrency, PlayerInventory, PlayerStats, PlayerAchievements, Crater } from './types';
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
import { Shop } from './components/Shop';
import { Profile } from './components/Profile';
import { Achievements } from './components/Achievements';
import { ComboIndicator } from './components/ComboIndicator';
import { SHOP_ITEMS } from './data/shopItems';
import { ACHIEVEMENTS, getActiveAchievements } from './data/achievements';

// LocalStorage keys
const PROGRESS_KEY = 'thread-unbound-progress';
const SETTINGS_KEY = 'thread-unbound-settings';
const CURRENCY_KEY = 'thread-unbound-currency';
const COMPLETED_LEVELS_KEY = 'thread-unbound-completed-levels';
const INVENTORY_KEY = 'thread-unbound-inventory';
const STATS_KEY = 'thread-unbound-stats';
const ACHIEVEMENTS_KEY = 'thread-unbound-achievements';

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

  // Currency
  const [currency, setCurrency] = useState<PlayerCurrency>({
    coins: 0,
    gems: 0,
  });

  // Inventory
  const [inventory, setInventory] = useState<PlayerInventory>({
    extraUndos: 0,
    freezeTime: 0,
    conveyorSpeed: 0,
    rerollGrid: 0,
    scoreMultiplierLevel: 0,
    hasStartingUndo: false,
    hasSpoolUpgrade: false,
    hasCoinMagnet: false,
  });

  // Stats
  const [stats, setStats] = useState<PlayerStats>({
    totalPlayTimeSeconds: 0,
    sessionStartTime: Date.now(),
    levelsCompleted: 0,
    levelsAttempted: 0,
    totalCoinsEarned: 0,
    totalGemsEarned: 0,
    totalSegmentsRemoved: 0,
    kittiesRescued: 0,
    // Achievement tracking stats
    perfectClears: 0,
    noUndoCompletions: 0,
    maxComboReached: 0,
    segmentsRemovedWith10Count: 0,
    maxSegmentsInOneTurn: 0,
    totalGemsSpent: 0,
    fastestLevelTime: Infinity,
    levelsCompletedUnder10Moves: 0,
  });

  // Achievements
  const [achievements, setAchievements] = useState<PlayerAchievements>({
    progress: {},
    unlocked: new Set(),
    recentlyUnlocked: [],
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

  // Combo system
  const [comboCount, setComboCount] = useState(0);
  const [lastActionTime, setLastActionTime] = useState<number>(0);
  const [moveCount, setMoveCount] = useState(0);
  const [usedUndo, setUsedUndo] = useState(false);

  // Thread Master bonus tracking - track spools fired in rolling 3-second window
  const [recentlyFiredSpools, setRecentlyFiredSpools] = useState<Set<number>>(new Set());
  const [lastSpoolFireTime, setLastSpoolFireTime] = useState<number>(0);
  const threadMasterBonusAwardedRef = useRef(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [selectedKey, setSelectedKey] = useState<Block | null>(null);
  const [dragonGrowthInterval, setDragonGrowthInterval] = useState(10000);
  const [speedMultiplier, setSpeedMultiplier] = useState(3); // Default 3x (fast), can toggle to 1x (slow)
  const [highestLevelReached, setHighestLevelReached] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [kitty, setKitty] = useState<Kitty>({ isSwallowed: false, segmentIndex: 0 });

  // Track if current level rewards were already given (prevent double-awarding)
  const levelRewardsGivenRef = useRef(false);

  // Track if current level has already been counted as "attempted"
  const levelAttemptCountedRef = useRef(false);

  // Track if kitty rescue was already counted this cycle
  const kittyRescueCountedRef = useRef(false);

  // Track level start time for speedrunner achievement
  const levelStartTimeRef = useRef<number>(0);

  // Special Tiles State
  const [selectedSniper, setSelectedSniper] = useState<Block | null>(null); // Sniper tile awaiting target selection
  const [aggroEffectActive, setAggroEffectActive] = useState(false); // Aggro 3x speed effect active
  const [aggroEffectEndTime, setAggroEffectEndTime] = useState<number>(0);
  const [lastAggroSpitTime, setLastAggroSpitTime] = useState<number>(0); // For 30s cooldown
  const [dragonUnder5StartTime, setDragonUnder5StartTime] = useState<number>(0); // When dragon first went under 5 segments
  const [currentLockedColors, setCurrentLockedColors] = useState<BlockColor[]>([]); // Colors with locked blocks (for conveyor keys)
  const [multiplierEffectActive, setMultiplierEffectActive] = useState(false); // Multiplier 2x score/coins for 10s
  const [multiplierEffectEndTime, setMultiplierEffectEndTime] = useState<number>(0);
  const [freezeEffectActive, setFreezeEffectActive] = useState(false); // Freeze spools for 10s
  const [freezeEffectEndTime, setFreezeEffectEndTime] = useState<number>(0);
  const [lastFreezeSpitTime, setLastFreezeSpitTime] = useState<number>(0); // Prevent spam
  const [craters, setCraters] = useState<Crater[]>([]); // Unusable grid spots
  const [lastBombSpitTime, setLastBombSpitTime] = useState<number>(0); // Prevent spam

  // Load progress, settings, and currency from localStorage on mount
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

    // Load currency
    const savedCurrency = localStorage.getItem(CURRENCY_KEY);
    if (savedCurrency) {
      try {
        const parsedCurrency = JSON.parse(savedCurrency);
        setCurrency(parsedCurrency);
      } catch (e) {
        console.error('Failed to parse currency:', e);
      }
    }

    // Load completed levels
    const savedCompleted = localStorage.getItem(COMPLETED_LEVELS_KEY);
    if (savedCompleted) {
      try {
        const parsedCompleted = JSON.parse(savedCompleted);
        setCompletedLevels(new Set(parsedCompleted));
      } catch (e) {
        console.error('Failed to parse completed levels:', e);
      }
    }

    // Load inventory
    const savedInventory = localStorage.getItem(INVENTORY_KEY);
    if (savedInventory) {
      try {
        const parsedInventory = JSON.parse(savedInventory);
        setInventory(parsedInventory);
      } catch (e) {
        console.error('Failed to parse inventory:', e);
      }
    }

    // Load stats
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);

        // Migration: Fix levelsAttempted if it's less than levelsCompleted
        // (This can happen if stats were tracked before levelsAttempted was implemented)
        // Also add new achievement tracking fields if they don't exist
        const fixedStats = {
          ...parsedStats,
          sessionStartTime: Date.now(),
          levelsAttempted: Math.max(parsedStats.levelsAttempted || 0, parsedStats.levelsCompleted || 0),
          // Add achievement tracking fields with defaults
          perfectClears: parsedStats.perfectClears || 0,
          noUndoCompletions: parsedStats.noUndoCompletions || 0,
          maxComboReached: parsedStats.maxComboReached || 0,
          segmentsRemovedWith10Count: parsedStats.segmentsRemovedWith10Count || 0,
          maxSegmentsInOneTurn: parsedStats.maxSegmentsInOneTurn || 0,
          totalGemsSpent: parsedStats.totalGemsSpent || 0,
          fastestLevelTime: parsedStats.fastestLevelTime || Infinity,
          levelsCompletedUnder10Moves: parsedStats.levelsCompletedUnder10Moves || 0,
        };

        setStats(fixedStats);
      } catch (e) {
        console.error('Failed to parse stats:', e);
      }
    }

    // Load achievements
    const savedAchievements = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (savedAchievements) {
      try {
        const parsedAchievements = JSON.parse(savedAchievements);
        // Convert unlocked array to Set (localStorage can't store Sets directly)
        setAchievements({
          ...parsedAchievements,
          unlocked: new Set(parsedAchievements.unlocked || []),
          recentlyUnlocked: [], // Always clear recent on load
        });
      } catch (e) {
        console.error('Failed to parse achievements:', e);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Save currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, JSON.stringify(currency));
  }, [currency]);

  // Save completed levels to localStorage when they change
  useEffect(() => {
    localStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(Array.from(completedLevels)));
  }, [completedLevels]);

  // Save inventory to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  }, [inventory]);

  // Save stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  // Save achievements to localStorage when they change
  useEffect(() => {
    // Convert Set to Array for JSON serialization
    const achievementsToSave = {
      ...achievements,
      unlocked: Array.from(achievements.unlocked),
    };
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievementsToSave));
  }, [achievements]);

  // Track play time (update every 10 seconds while playing)
  useEffect(() => {
    if (currentScreen !== 'playing' || gameState !== 'playing') return;

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalPlayTimeSeconds: prev.totalPlayTimeSeconds + 10,
      }));
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [currentScreen, gameState]);

  // Save progress to localStorage when highest level changes
  // level = the level index just completed
  // highestLevelReached = the next level to play (level + 1)
  const saveProgress = (level: number) => {
    const nextLevel = level + 1;
    if (nextLevel > highestLevelReached) {
      setHighestLevelReached(nextLevel);
      localStorage.setItem(PROGRESS_KEY, nextLevel.toString());
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

  // Currency helper functions
  const addCoins = (amount: number) => {
    // Apply coin magnet bonus (+25%)
    let multiplier = inventory.hasCoinMagnet ? 1.25 : 1;

    // Apply multiplier tile bonus (2x) if active
    if (multiplierEffectActive) {
      multiplier *= 2;
    }

    const finalAmount = Math.floor(amount * multiplier);
    setCurrency(prev => ({ ...prev, coins: prev.coins + finalAmount }));

    // Track total coins earned
    setStats(prev => ({ ...prev, totalCoinsEarned: prev.totalCoinsEarned + finalAmount }));
  };

  const addGems = (amount: number) => {
    setCurrency(prev => ({ ...prev, gems: prev.gems + amount }));

    // Track total gems earned
    setStats(prev => ({ ...prev, totalGemsEarned: prev.totalGemsEarned + amount }));
  };

  const spendCoins = (amount: number): boolean => {
    if (currency.coins >= amount) {
      setCurrency(prev => ({ ...prev, coins: prev.coins - amount }));
      return true;
    }
    return false;
  };

  const spendGems = (amount: number): boolean => {
    if (currency.gems >= amount) {
      setCurrency(prev => ({ ...prev, gems: prev.gems - amount }));
      // Track total gems spent for achievements
      setStats(prev => ({ ...prev, totalGemsSpent: prev.totalGemsSpent + amount }));
      return true;
    }
    return false;
  };

  // Register combo action (call this whenever player performs a scoring action)
  const registerComboAction = () => {
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTime;

    if (timeSinceLastAction < 3000 && lastActionTime > 0) {
      // Continue combo - increment count
      setComboCount(prev => Math.min(prev + 1, 4)); // Cap at 4x
    } else {
      // Start new combo
      setComboCount(1);
    }

    setLastActionTime(now);
  };

  // Get current combo multiplier (1x, 2x, 3x, 4x)
  const getComboMultiplier = (): number => {
    if (comboCount <= 1) return 1;
    if (comboCount === 2) return 2;
    if (comboCount === 3) return 3;
    return 4; // comboCount >= 4
  };

  // Score helper with multiplier
  const addScore = (amount: number, applyCombo: boolean = true) => {
    // Apply score multiplier bonus from inventory
    let multiplier = 1;
    if (inventory.scoreMultiplierLevel === 1) multiplier = 1.1;  // +10%
    if (inventory.scoreMultiplierLevel === 2) multiplier = 1.25; // +25%
    if (inventory.scoreMultiplierLevel === 3) multiplier = 1.5;  // +50%

    // Apply combo multiplier
    if (applyCombo) {
      multiplier *= getComboMultiplier();
    }

    // Apply multiplier tile bonus (2x) if active
    if (multiplierEffectActive) {
      multiplier *= 2;
    }

    const finalAmount = Math.floor(amount * multiplier);
    setScore(prev => prev + finalAmount);

    return finalAmount; // Return actual score added for potential feedback
  };

  // Achievement checking and unlocking
  const checkAndUnlockAchievements = useCallback(() => {
    const activeAchievements = getActiveAchievements();
    const newlyUnlocked: string[] = [];

    activeAchievements.forEach(achievement => {
      // Skip if already unlocked
      if (achievements.unlocked.has(achievement.id)) return;

      let currentProgress = 0;
      let shouldUnlock = false;

      // Check achievement conditions based on ID
      switch (achievement.id) {
        // PROGRESSION
        case 'beginner':
          currentProgress = stats.levelsCompleted;
          shouldUnlock = currentProgress >= 5;
          break;
        case 'intermediate':
          currentProgress = stats.levelsCompleted;
          shouldUnlock = currentProgress >= 25;
          break;
        case 'expert':
          currentProgress = stats.levelsCompleted;
          shouldUnlock = currentProgress >= 50;
          break;
        case 'master':
          currentProgress = stats.levelsCompleted;
          shouldUnlock = currentProgress >= 100;
          break;

        // COMBAT
        case 'dragon-slayer':
          currentProgress = stats.totalSegmentsRemoved;
          shouldUnlock = currentProgress >= 1000;
          break;
        case 'sharpshooter':
          currentProgress = stats.segmentsRemovedWith10Count;
          shouldUnlock = currentProgress >= 100;
          break;
        case 'speed-demon':
          currentProgress = stats.maxSegmentsInOneTurn;
          shouldUnlock = currentProgress >= 20;
          break;
        case 'combo-master':
          currentProgress = stats.maxComboReached;
          shouldUnlock = currentProgress >= 4;
          break;

        // COLLECTION
        case 'coin-hoarder':
          currentProgress = currency.coins;
          shouldUnlock = currentProgress >= 5000;
          break;
        case 'gem-enthusiast':
          currentProgress = stats.totalGemsSpent;
          shouldUnlock = currentProgress >= 500;
          break;

        // SKILL
        case 'perfectionist':
          currentProgress = stats.perfectClears;
          shouldUnlock = currentProgress >= 10;
          break;
        case 'no-mistakes':
          currentProgress = stats.noUndoCompletions;
          shouldUnlock = currentProgress >= 5;
          break;
        case 'speedrunner':
          currentProgress = stats.fastestLevelTime;
          shouldUnlock = currentProgress <= 60 && currentProgress > 0;
          break;
        case 'strategist':
          currentProgress = stats.levelsCompletedUnder10Moves;
          shouldUnlock = currentProgress >= 1;
          break;

        // HIDDEN
        case 'kitty-guardian':
          currentProgress = stats.kittiesRescued;
          shouldUnlock = currentProgress >= 100;
          break;
        case 'rainbow-warrior':
          // This will be checked manually during gameplay
          currentProgress = achievements.progress[achievement.id] || 0;
          shouldUnlock = currentProgress >= 1;
          break;
      }

      // Update progress
      setAchievements(prev => ({
        ...prev,
        progress: { ...prev.progress, [achievement.id]: currentProgress },
      }));

      // Unlock if condition met
      if (shouldUnlock) {
        newlyUnlocked.push(achievement.id);
        setAchievements(prev => ({
          ...prev,
          unlocked: new Set([...prev.unlocked, achievement.id]),
          recentlyUnlocked: [...prev.recentlyUnlocked, achievement.id],
        }));

        // Award rewards
        if (achievement.rewardCoins) {
          addCoins(achievement.rewardCoins);
        }
        if (achievement.rewardGems) {
          addGems(achievement.rewardGems);
        }

        console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
      }
    });

    return newlyUnlocked;
  }, [achievements, stats, currency, addCoins, addGems]);

  // Check achievements whenever stats or currency change
  useEffect(() => {
    checkAndUnlockAchievements();
  }, [stats, currency]);

  // --- AGGRO EFFECT TIMER ---
  // Clear aggro effect after 10 seconds
  useEffect(() => {
    if (!aggroEffectActive) return;

    const currentTime = Date.now();
    const timeRemaining = aggroEffectEndTime - currentTime;

    if (timeRemaining <= 0) {
      console.log('😡 Aggro effect ended!');
      setAggroEffectActive(false);
      return;
    }

    const timer = setTimeout(() => {
      setAggroEffectActive(false);
      console.log('😡 Aggro effect ended!');
    }, timeRemaining);

    return () => clearTimeout(timer);
  }, [aggroEffectActive, aggroEffectEndTime]);

  // --- MULTIPLIER EFFECT TIMER ---
  // Clear multiplier effect after 10 seconds
  useEffect(() => {
    if (!multiplierEffectActive) return;

    const currentTime = Date.now();
    const timeRemaining = multiplierEffectEndTime - currentTime;

    if (timeRemaining <= 0) {
      console.log('🧩 Multiplier effect ended!');
      setMultiplierEffectActive(false);
      return;
    }

    const timer = setTimeout(() => {
      setMultiplierEffectActive(false);
      console.log('🧩 Multiplier effect ended!');
    }, timeRemaining);

    return () => clearTimeout(timer);
  }, [multiplierEffectActive, multiplierEffectEndTime]);

  // --- FREEZE EFFECT TIMER ---
  // Clear freeze effect after 10 seconds
  useEffect(() => {
    if (!freezeEffectActive) return;

    const currentTime = Date.now();
    const timeRemaining = freezeEffectEndTime - currentTime;

    if (timeRemaining <= 0) {
      console.log('🧊 Freeze effect ended!');
      setFreezeEffectActive(false);
      return;
    }

    const timer = setTimeout(() => {
      setFreezeEffectActive(false);
      console.log('🧊 Freeze effect ended!');
    }, timeRemaining);

    return () => clearTimeout(timer);
  }, [freezeEffectActive, freezeEffectEndTime]);


  // Thread Master bonus: Clear recently fired spools after 3 seconds
  useEffect(() => {
    if (recentlyFiredSpools.size === 0) return;

    const currentTime = Date.now();
    const timeSinceLastFire = currentTime - lastSpoolFireTime;

    if (timeSinceLastFire >= 3000) {
      // Reset if no spools fired in last 3 seconds
      setRecentlyFiredSpools(new Set());
      threadMasterBonusAwardedRef.current = false;
      return;
    }

    // Check if we have enough spools for Thread Master bonus
    const requiredSpools = inventory.hasSpoolUpgrade ? 5 : 4;
    if (recentlyFiredSpools.size >= requiredSpools && !threadMasterBonusAwardedRef.current) {
      console.log('🏆 THREAD MASTER BONUS! All spools fired!');
      addScore(150, false); // Flat bonus, no combo multiplier
      threadMasterBonusAwardedRef.current = true;
      playSound('win');
    }

    // Set a timer to clear after 3 seconds
    const timer = setTimeout(() => {
      setRecentlyFiredSpools(new Set());
      threadMasterBonusAwardedRef.current = false;
    }, 3000);

    return () => clearTimeout(timer);
  }, [recentlyFiredSpools, lastSpoolFireTime, inventory.hasSpoolUpgrade, addScore]);

  // Menu navigation handlers
  const handlePlay = () => {
    // Start at the highest level reached (next level to play)
    setLevelIndex(highestLevelReached);
    setCurrentScreen('playing');
    startNewGame(true, highestLevelReached);
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
  };

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset ALL progress? This will clear levels, currency, and settings. This cannot be undone!')) {
      // Clear all localStorage
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(CURRENCY_KEY);
      localStorage.removeItem(COMPLETED_LEVELS_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(INVENTORY_KEY);

      // Reload the page to reset all state
      window.location.reload();
    }
  };

  // Shop purchase handler
  const handlePurchase = (itemId: string): boolean => {
    console.log('Attempting to purchase:', itemId);

    // Find the item
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return false;

    // Check if can afford
    const canAfford = item.currency === 'coins'
      ? currency.coins >= item.price
      : currency.gems >= item.price;

    if (!canAfford) {
      console.log('Cannot afford item');
      return false;
    }

    // Check if already owned (permanent items only)
    if (item.type === 'permanent') {
      const alreadyOwned =
        (itemId === 'score-multiplier-1' && inventory.scoreMultiplierLevel >= 1) ||
        (itemId === 'score-multiplier-2' && inventory.scoreMultiplierLevel >= 2) ||
        (itemId === 'score-multiplier-3' && inventory.scoreMultiplierLevel >= 3) ||
        (itemId === 'starting-undo' && inventory.hasStartingUndo) ||
        (itemId === 'spool-upgrade' && inventory.hasSpoolUpgrade) ||
        (itemId === 'coin-magnet' && inventory.hasCoinMagnet);

      if (alreadyOwned) {
        console.log('Already owned');
        return false;
      }
    }

    // Deduct currency
    if (item.currency === 'coins') {
      if (!spendCoins(item.price)) return false;
    } else {
      if (!spendGems(item.price)) return false;
    }

    // Add to inventory
    setInventory(prev => {
      const newInventory = { ...prev };

      switch (itemId) {
        // Consumables
        case 'extra-undo':
          newInventory.extraUndos += 1;
          break;
        case 'freeze-time':
          newInventory.freezeTime += 1;
          break;
        case 'conveyor-speed':
          newInventory.conveyorSpeed += 1;
          break;
        case 'reroll-grid':
          newInventory.rerollGrid += 1;
          break;

        // Permanent upgrades
        case 'score-multiplier-1':
          newInventory.scoreMultiplierLevel = 1;
          break;
        case 'score-multiplier-2':
          newInventory.scoreMultiplierLevel = 2;
          break;
        case 'score-multiplier-3':
          newInventory.scoreMultiplierLevel = 3;
          break;
        case 'starting-undo':
          newInventory.hasStartingUndo = true;
          break;
        case 'spool-upgrade':
          newInventory.hasSpoolUpgrade = true;
          break;
        case 'coin-magnet':
          newInventory.hasCoinMagnet = true;
          break;
      }

      return newInventory;
    });

    playSound('pop');
    triggerHaptic([20, 20]);
    return true;
  };

  // Initialize Spools (4 or 5 depending on upgrade)
  const initSpools = () => {
    const spoolCount = inventory.hasSpoolUpgrade ? 5 : 4;
    return Array.from({ length: spoolCount }, (_, i) => ({ id: i, block: null }));
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

  const startNewGame = useCallback((useLevel: boolean = true, forceLevel?: number) => {
    // Reset tracking flags for new level
    levelRewardsGivenRef.current = false;
    levelAttemptCountedRef.current = false;
    kittyRescueCountedRef.current = false;
    threadMasterBonusAwardedRef.current = false;

    // Track level start time for speedrunner achievement
    levelStartTimeRef.current = Date.now();

    const currentLevel = forceLevel !== undefined ? forceLevel : levelIndex;

    let newBlocks: Block[];
    let newDragonColors: BlockColor[];
    let newConveyorCount = 5;
    let newGrowthInterval = 10000; // Default 10s for tutorial levels
    let lockedColors: BlockColor[] = [];

    if (useLevel && LEVELS[currentLevel]) {
      // Tutorial levels (0-4): Use manually designed levels
      const levelData = loadLevel(LEVELS[currentLevel]);
      newBlocks = levelData.blocks;
      newDragonColors = levelData.dragon;
      newConveyorCount = LEVELS[currentLevel].conveyorCount;

      // Check if tutorial level has locked blocks (level 5 does)
      const hasLockedBlocks = newBlocks.some(b => b.type === 'locked');
      if (hasLockedBlocks) {
        // Extract unique colors of locked blocks
        const locked = newBlocks.filter(b => b.type === 'locked');
        lockedColors = Array.from(new Set(locked.map(b => b.color)));
      }

      // Ramp up snake speed in tutorial levels (faster baseline to match 3x default)
      // Level 1-2: 8s, Level 3: 7s, Level 4: 6s, Level 5: 5s
      const tutorialSpeeds = [8000, 8000, 7000, 6000, 5000];
      newGrowthInterval = tutorialSpeeds[currentLevel] || 6000;
    } else {
      // Procedural levels (5+): Use progressive difficulty
      const difficulty = getDifficultyForLevel(currentLevel);
      console.log(`🎮 Level ${currentLevel + 1} - Difficulty:`, difficulty);

      const levelData = generateLevel(difficulty);
      newBlocks = levelData.blocks;
      lockedColors = levelData.lockedColors;
      newDragonColors = generateDragon(difficulty.initialDragonLength);
      newConveyorCount = difficulty.conveyorCount;
      newGrowthInterval = difficulty.dragonGrowthInterval;
    }

    const newDragon: DragonSegment[] = newDragonColors.map(c => ({
      id: generateUUID(),
      color: c
    }));

    const newSpools = initSpools();
    const initialConveyorBlocks = generateConveyorBlocks(10, lockedColors);

    setBlocks(newBlocks);
    setDragon(newDragon);
    setInitialDragonSize(newDragon.length);
    // Generate 10 tiles to fill the belt
    setConveyorBlocks(initialConveyorBlocks);
    setHiddenConveyorIds(new Set()); // Reset hidden conveyor tiles
    setSpools(newSpools);
    setActiveThreads([]);
    setGameState('playing');
    setScore(0);
    setComboCount(0);
    setLastActionTime(0);
    setMoveCount(0);
    setUsedUndo(false);
    setSelectedKey(null);
    setDragonGrowthInterval(newGrowthInterval);
    setCurrentLockedColors(lockedColors); // Store locked colors for conveyor generation
    setKitty({ isSwallowed: false, segmentIndex: 0 }); // Reset kitty to end of path

    // Reset Thread Master tracking
    setRecentlyFiredSpools(new Set());
    setLastSpoolFireTime(0);

    // Note: levelsAttempted is tracked on first player action, not on level load

    // Starting Undo upgrade: Give 1 undo at start
    if (inventory.hasStartingUndo) {
      setHistory([{
        blocks: newBlocks,
        spools: newSpools,
        dragon: newDragon,
        conveyorBlocks: initialConveyorBlocks,
        score: 0,
      }]);
    } else {
      setHistory([]);
    }

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
      // Add one new tile to the end of the stream (no keys - keys only in initial batch)
      const newTile = generateConveyorBlocks(1, [])[0];
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
  // Adds segment at dynamic interval (faster on harder levels + speed multiplier + aggro effect)
  useEffect(() => {
    if (currentScreen !== 'playing' || gameState !== 'playing') return;

    // Apply both speed multiplier AND aggro effect (multiplicative)
    let effectiveMultiplier = speedMultiplier;
    if (aggroEffectActive) {
      effectiveMultiplier *= 3; // Aggro adds another 3x on top of current speed
      console.log('😡 Aggro effect active! Dragon growing faster!');
    }

    const adjustedInterval = dragonGrowthInterval / effectiveMultiplier;

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

      // FREEZE TILE SPITTING: 2% chance after dragon grows
      if (dragonGrew && Math.random() < 0.02) {
        const currentTime = Date.now();
        const timeSinceLastFreeze = currentTime - lastFreezeSpitTime;

        // Prevent spam (5 second cooldown)
        if (timeSinceLastFreeze >= 5000) {
          // Find empty spools
          setSpools(prevSpools => {
            const emptySpoolIndices = prevSpools
              .map((spool, idx) => ({ spool, idx }))
              .filter(({ spool }) => spool.block === null)
              .map(({ idx }) => idx);

            if (emptySpoolIndices.length > 0) {
              // Pick random empty spool
              const randomSpoolIdx = emptySpoolIndices[Math.floor(Math.random() * emptySpoolIndices.length)];

              console.log('🧊 DRAGON SPITTING FREEZE TILE!');
              playSound('error');
              triggerHaptic([50, 50, 50]);

              // Create freeze tile
              const freezeTile: Block = {
                id: generateUUID(),
                x: 0, // Position doesn't matter for spool blocks
                y: 0,
                color: 'blue', // Freeze tiles are blue for visibility
                direction: 'DOWN',
                type: 'freeze',
                threadCount: 0, // Doesn't remove segments
              };

              // Place freeze tile in random empty spool
              const newSpools = [...prevSpools];
              newSpools[randomSpoolIdx] = { ...newSpools[randomSpoolIdx], block: freezeTile };

              // Activate freeze effect (freeze ALL spools for 10 seconds)
              setFreezeEffectActive(true);
              setFreezeEffectEndTime(currentTime + 10000);
              setLastFreezeSpitTime(currentTime);

              // Remove freeze tile from spool after 500ms (visual feedback, then clear)
              setTimeout(() => {
                setSpools(prev => {
                  const cleared = [...prev];
                  cleared[randomSpoolIdx] = { ...cleared[randomSpoolIdx], block: null };
                  return cleared;
                });
              }, 500);

              return newSpools;
            }

            // No empty spools - no effect
            return prevSpools;
          });
        }
      }

      // BOMB SPITTING: 2% chance after dragon grows
      if (dragonGrew && Math.random() < 0.02) {
        const currentTime = Date.now();
        const timeSinceLastBomb = currentTime - lastBombSpitTime;

        // Prevent spam (5 second cooldown)
        if (timeSinceLastBomb >= 5000) {
          // Find empty grid positions (not occupied by blocks or craters)
          const emptyPositions: { x: number; y: number }[] = [];
          for (let row = 0; row < GRID_SIZE.rows; row++) {
            for (let col = 0; col < GRID_SIZE.cols; col++) {
              const occupiedByBlock = blocks.some(b => Math.round(b.x) === col && Math.round(b.y) === row);
              const occupiedByCrater = craters.some(c => c.x === col && c.y === row);
              if (!occupiedByBlock && !occupiedByCrater) {
                emptyPositions.push({ x: col, y: row });
              }
            }
          }

          if (emptyPositions.length > 0) {
            const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];

            console.log('💣 DRAGON SPITTING BOMB!');
            playSound('error');
            triggerHaptic([50, 50, 50]);

            const bombTile: Block = {
              id: generateUUID(),
              x: randomPos.x,
              y: randomPos.y,
              color: 'red', // Bombs are red for danger
              direction: 'DOWN',
              type: 'bomb',
              threadCount: 0, // Doesn't remove segments
              countdown: Date.now() + 5000, // Explodes in 5 seconds (timestamp)
            };

            setBlocks(prev => [...prev, bombTile]);
            setLastBombSpitTime(currentTime);

            // Schedule bomb explosion after 5 seconds
            setTimeout(() => {
              handleBombExplosion(bombTile);
            }, 5000);
          }
        }
      }

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
  }, [currentScreen, gameState, dragonGrowthInterval, speedMultiplier, aggroEffectActive]);

  // --- SWALLOWING CHECK ---
  // Check if dragon head has reached kitty position (end of path)
  useEffect(() => {
    if (currentScreen !== 'playing' || gameState !== 'playing' || kitty.isSwallowed) return;

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
  }, [currentScreen, dragon.length, kitty.isSwallowed, gameState]);

  // --- GAME OVER CHECK: Kitty at tail ---
  useEffect(() => {
    if (currentScreen !== 'playing' || gameState !== 'playing') return;

    if (kitty.isSwallowed && kitty.segmentIndex >= dragon.length - 1) {
      // Kitty has reached the tail - fully swallowed!
      console.log('💀 GAME OVER: Kitty fully swallowed!');
      setGameState('game_over');
      playSound('error');
    }
  }, [currentScreen, kitty, dragon.length, gameState]);

  // --- AGGRO TILE DRAGON SPITTING ---
  // When dragon is under 5 segments for 15 seconds, spit out an Aggro tile (30s cooldown)
  useEffect(() => {
    if (currentScreen !== 'playing' || gameState !== 'playing') return;

    const currentTime = Date.now();
    const dragonLength = dragon.length - 1; // Exclude head

    // Check if dragon is under 5 segments
    if (dragonLength < 5) {
      // Start tracking if not already
      if (dragonUnder5StartTime === 0) {
        setDragonUnder5StartTime(currentTime);
      }

      // Check if 15 seconds have passed and cooldown is over
      const timeUnder5 = currentTime - dragonUnder5StartTime;
      const timeSinceLastSpit = currentTime - lastAggroSpitTime;

      if (timeUnder5 >= 15000 && timeSinceLastSpit >= 30000) {
        // Spit out Aggro tile!
        console.log('🐉 DRAGON SPITTING AGGRO TILE!');

        // Find random empty grid position
        const emptyPositions: { x: number; y: number }[] = [];
        for (let row = 0; row < GRID_SIZE.rows; row++) {
          for (let col = 0; col < GRID_SIZE.cols; col++) {
            const occupied = blocks.some(b => b.x === col && b.y === row);
            if (!occupied) {
              emptyPositions.push({ x: col, y: row });
            }
          }
        }

        if (emptyPositions.length > 0) {
          const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
          const aggroTile: Block = {
            id: generateUUID(),
            x: randomPos.x,
            y: randomPos.y,
            color: 'red', // Aggro tiles are always red for visibility
            direction: 'UP',
            type: 'aggro',
            threadCount: 0, // Doesn't remove segments
          };

          setBlocks(prev => [...prev, aggroTile]);
          setLastAggroSpitTime(currentTime);
          playSound('error'); // Warning sound
          triggerHaptic([50, 50, 50]); // Strong haptic
        }
      }
    } else {
      // Reset timer if dragon goes above 5 segments
      if (dragonUnder5StartTime !== 0) {
        setDragonUnder5StartTime(0);
      }
    }
  }, [currentScreen, dragon.length, gameState, dragonUnder5StartTime, lastAggroSpitTime, blocks]);

  // --- RANDOM TILE DIRECTION CHANGER ---
  // Change direction of random tiles every 3 seconds
  useEffect(() => {
    if (currentScreen !== 'playing' || gameState !== 'playing') return;

    const interval = setInterval(() => {
      setBlocks(prev => {
        const hasRandomTiles = prev.some(b => b.type === 'random');
        if (!hasRandomTiles) return prev;

        return prev.map(b => {
          if (b.type === 'random') {
            // Pick a random direction
            const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'UP-LEFT', 'UP-RIGHT', 'DOWN-LEFT', 'DOWN-RIGHT'];
            const randomDir = directions[Math.floor(Math.random() * directions.length)];
            return { ...b, direction: randomDir };
          }
          return b;
        });
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [currentScreen, gameState]);

  // --- AUTO-FIRE MECHANISM ---
  // Check if snake head color matches any spool, then fire automatically
  // Use a slight delay to allow visual feedback
  // IMPORTANT: Only fire ONE spool per auto-fire check to prevent double-firing
  useEffect(() => {
    if (currentScreen !== 'playing' || gameState !== 'playing' || dragon.length === 0) return;

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

          // Track spool firing for Thread Master bonus
          const currentTime = Date.now();
          setLastSpoolFireTime(currentTime);
          setRecentlyFiredSpools(prev => {
            const updated = new Set(prev);
            updated.add(spoolIndex);
            return updated;
          });

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

            // Award coins for segments removed (+10 each)
            if (removed > 0) {
              addCoins(removed * 10);
              // Track segments removed
              setStats(prev => ({
                ...prev,
                totalSegmentsRemoved: prev.totalSegmentsRemoved + removed,
                // Track segments removed with 10-count blocks
                segmentsRemovedWith10Count: threadCount === 10
                  ? prev.segmentsRemovedWith10Count + removed
                  : prev.segmentsRemovedWith10Count,
                // Track max segments in one turn
                maxSegmentsInOneTurn: Math.max(prev.maxSegmentsInOneTurn, removed)
              }));

              // Dragon Shrink Streak Bonus: +50 per segment over 5
              if (removed > 5) {
                const bonusSegments = removed - 5;
                const bonusPoints = bonusSegments * 50;
                addScore(bonusPoints, false); // Flat bonus, no combo multiplier
                console.log(`🔥 DRAGON SHRINK STREAK! Removed ${removed} segments, bonus: +${bonusPoints}`);
              }
            }

            // Play sound and haptics
            if (removed > 0) {
              playSound('pop');
              triggerHaptic([20, 20]);
            }

            // Victory condition: All segments removed (only head remains)
            if (newDragon.length === 1 && !levelRewardsGivenRef.current) {
              setGameState('won');
              playSound('win');

              // Mark rewards as given for this level (prevent double-awarding)
              levelRewardsGivenRef.current = true;

              // Track level completion
              setStats(prev => ({ ...prev, levelsCompleted: prev.levelsCompleted + 1 }));

              // Always award coins for completion
              addCoins(50);

              // Only award gems if this is a NEW completion (not replaying)
              const isFirstTimeCompletion = !completedLevels.has(levelIndex);
              if (isFirstTimeCompletion) {
                addGems(5);
                setCompletedLevels(prev => new Set(prev).add(levelIndex));
              }

              // Award bonus scores and track achievement stats
              let bonusesAwarded: string[] = [];

              // Perfect Clear Bonus: Cleared entire grid
              if (blocks.length === 0) {
                addScore(500, false); // Flat bonus, no combo multiplier
                bonusesAwarded.push('Perfect Clear +500');
                setStats(prev => ({ ...prev, perfectClears: prev.perfectClears + 1 }));
              }

              // No Undo Bonus: Completed without using undo
              if (!usedUndo) {
                addScore(200, false);
                bonusesAwarded.push('No Undo +200');
                setStats(prev => ({ ...prev, noUndoCompletions: prev.noUndoCompletions + 1 }));
              }

              // Track max combo reached
              const currentCombo = getComboMultiplier();
              setStats(prev => ({
                ...prev,
                maxComboReached: Math.max(prev.maxComboReached, currentCombo)
              }));

              // Track level completion with <10 moves
              if (moveCount > 0 && moveCount < 10) {
                setStats(prev => ({ ...prev, levelsCompletedUnder10Moves: prev.levelsCompletedUnder10Moves + 1 }));
              }

              // Track fastest level completion time (for speedrunner achievement)
              if (levelStartTimeRef.current > 0) {
                const levelTime = Math.floor((Date.now() - levelStartTimeRef.current) / 1000);
                setStats(prev => ({
                  ...prev,
                  fastestLevelTime: Math.min(prev.fastestLevelTime, levelTime)
                }));
              }

              // Log bonuses for debugging
              if (bonusesAwarded.length > 0) {
                console.log('🎉 Bonuses awarded:', bonusesAwarded);
              }

              saveProgress(levelIndex);
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

              // Track kitty rescue (only once per rescue)
              if (!kittyRescueCountedRef.current) {
                kittyRescueCountedRef.current = true;
                setStats(prevStats => ({ ...prevStats, kittiesRescued: prevStats.kittiesRescued + 1 }));
              }

              // No gem reward here - only on level completion to prevent farming
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

          // Register combo action and add score
          registerComboAction();
          addScore(segmentsToRemove * 10);
        }
      }
    }, 600); // 600ms delay to allow visual feedback

    return () => clearTimeout(timer);
  }, [currentScreen, dragon, spools, gameState, initialDragonSize]);


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

    // Track level attempt on first player action
    if (!levelAttemptCountedRef.current) {
      levelAttemptCountedRef.current = true;
      setStats(prev => ({ ...prev, levelsAttempted: prev.levelsAttempted + 1 }));
    }

    setUsedUndo(true); // Track undo usage for "No Undo" bonus
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

    // Track level attempt on first player action
    if (!levelAttemptCountedRef.current) {
      levelAttemptCountedRef.current = true;
      setStats(prev => ({ ...prev, levelsAttempted: prev.levelsAttempted + 1 }));
    }

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

  // Helper: Rotate direction 90° clockwise
  const rotateDirection = (dir: Direction): Direction => {
    const rotationMap: Record<Direction, Direction> = {
      'UP': 'RIGHT',
      'RIGHT': 'DOWN',
      'DOWN': 'LEFT',
      'LEFT': 'UP',
      'UP-RIGHT': 'DOWN-RIGHT',
      'DOWN-RIGHT': 'DOWN-LEFT',
      'DOWN-LEFT': 'UP-LEFT',
      'UP-LEFT': 'UP-RIGHT',
    };
    return rotationMap[dir];
  };

  // Handle bomb explosion
  const handleBombExplosion = (bomb: Block) => {
    console.log(`💥 BOMB EXPLODING at (${bomb.x}, ${bomb.y})!`);
    playSound('error');
    triggerHaptic([100, 50, 100, 50, 100]);

    // Get 8 adjacent positions
    const adjacentPositions = [
      { x: bomb.x - 1, y: bomb.y - 1 }, // Top-left
      { x: bomb.x, y: bomb.y - 1 },     // Top
      { x: bomb.x + 1, y: bomb.y - 1 }, // Top-right
      { x: bomb.x - 1, y: bomb.y },     // Left
      { x: bomb.x + 1, y: bomb.y },     // Right
      { x: bomb.x - 1, y: bomb.y + 1 }, // Bottom-left
      { x: bomb.x, y: bomb.y + 1 },     // Bottom
      { x: bomb.x + 1, y: bomb.y + 1 }, // Bottom-right
    ];

    // Remove bomb and adjacent blocks
    setBlocks(prev => {
      return prev.filter(b => {
        // Remove bomb itself
        if (b.id === bomb.id) return false;

        // Remove adjacent blocks
        const isAdjacent = adjacentPositions.some(
          pos => Math.round(b.x) === pos.x && Math.round(b.y) === pos.y
        );
        return !isAdjacent;
      });
    });

    // Create craters at bomb position and adjacent positions
    const newCraters: Crater[] = [
      {
        id: generateUUID(),
        x: Math.round(bomb.x),
        y: Math.round(bomb.y),
        turnsRemaining: 3,
      },
      ...adjacentPositions.map(pos => ({
        id: generateUUID(),
        x: pos.x,
        y: pos.y,
        turnsRemaining: 3,
      }))
    ];

    setCraters(prev => [...prev, ...newCraters]);
    registerComboAction();
  };

  // Handle Spin tile: Rotate 8 adjacent tiles 90° clockwise
  const handleSpinTile = (spinBlock: Block) => {
    console.log(`🔄 Spin tile activated at (${spinBlock.x}, ${spinBlock.y})`);
    pushHistory();
    playSound('shuffle');
    triggerHaptic([10, 10, 10]);

    // Get 8 adjacent positions
    const adjacentPositions = [
      { x: spinBlock.x - 1, y: spinBlock.y - 1 }, // Top-left
      { x: spinBlock.x, y: spinBlock.y - 1 },     // Top
      { x: spinBlock.x + 1, y: spinBlock.y - 1 }, // Top-right
      { x: spinBlock.x - 1, y: spinBlock.y },     // Left
      { x: spinBlock.x + 1, y: spinBlock.y },     // Right
      { x: spinBlock.x - 1, y: spinBlock.y + 1 }, // Bottom-left
      { x: spinBlock.x, y: spinBlock.y + 1 },     // Bottom
      { x: spinBlock.x + 1, y: spinBlock.y + 1 }, // Bottom-right
    ];

    // Rotate direction of blocks at adjacent positions
    setBlocks(prev => {
      const rotated = prev.map(b => {
        // Check if this block is at an adjacent position
        const isAdjacent = adjacentPositions.some(
          pos => Math.round(b.x) === pos.x && Math.round(b.y) === pos.y
        );

        if (isAdjacent) {
          return { ...b, direction: rotateDirection(b.direction) };
        }
        return b;
      });

      // Remove the spin tile after use
      return rotated.filter(b => b.id !== spinBlock.id);
    });

    registerComboAction();
    addScore(25); // Bonus for using spin
  };

  // Handle Sniper tile: Remove any board tile (bombs, hazards, locked tiles, etc.)
  const handleSniperTarget = (targetBlock: Block) => {
    if (!selectedSniper) return;

    console.log(`🎯 Sniper targeting board tile ${targetBlock.id}`);
    pushHistory();
    playSound('pop');
    triggerHaptic([30, 30, 30]);

    // Remove the targeted tile from board
    setBlocks(prev => prev.filter(b => b.id !== targetBlock.id && b.id !== selectedSniper.id));

    // Clear selection
    setSelectedSniper(null);
    registerComboAction();
    addScore(50); // Bonus for using sniper
  };

  const handleBlockClick = (block: Block, source: 'grid' | 'conveyor') => {
    if (gameState !== 'playing') return;

    // Track level attempt on first player action
    if (!levelAttemptCountedRef.current) {
      levelAttemptCountedRef.current = true;
      setStats(prev => ({ ...prev, levelsAttempted: prev.levelsAttempted + 1 }));
    }

    // --- SNIPER MODE: Target board tile ---
    if (selectedSniper && source === 'grid' && block.id !== selectedSniper.id) {
      handleSniperTarget(block);
      return;
    }

    // --- AGGRO TILE BOARD LOCK ---
    // Check if there's an Aggro tile on the board - if so, only allow clicking it
    const aggroTileOnBoard = blocks.find(b => b.type === 'aggro');
    if (aggroTileOnBoard && source === 'grid' && block.id !== aggroTileOnBoard.id) {
      // Board is locked - can only click Aggro tile
      playSound('error');
      triggerHaptic([100, 50, 100]); // Triple buzz to indicate lock
      console.log('⚠️ Board locked! Must clear Aggro tile first!');
      return;
    }

    // --- SPECIAL TILE HANDLING (from grid only) ---
    if (source === 'grid') {
      // MYSTERY BOX: Transform into random special tile
      if (block.type === 'mystery') {
        console.log('🎁 MYSTERY BOX OPENED!');
        pushHistory();
        playSound('shuffle');
        triggerHaptic([15, 15, 15]);

        // Pick a random special tile type (all currently implemented tiles)
        const specialTiles: BlockType[] = ['sniper', 'rainbow', 'spin', 'random', 'multiplier', 'aggro'];
        const randomType = specialTiles[Math.floor(Math.random() * specialTiles.length)];

        console.log(`  Mystery box transformed into: ${randomType}`);

        // Transform mystery box into the random tile type
        setBlocks(prev => prev.map(b => {
          if (b.id === block.id) {
            return { ...b, type: randomType };
          }
          return b;
        }));

        registerComboAction();
        addScore(20); // Small bonus for opening
        return;
      }

      // SPIN TILE: Rotate adjacent tiles 90° clockwise
      if (block.type === 'spin') {
        handleSpinTile(block);
        return;
      }

      // MULTIPLIER TILE: Activate 2x score/coins for 10 seconds
      if (block.type === 'multiplier') {
        console.log('🧩 MULTIPLIER TILE ACTIVATED! 2x score/coins for 10 seconds!');
        pushHistory();
        playSound('pop');
        triggerHaptic([20, 20, 20]);

        // Remove multiplier tile from board
        setBlocks(prev => prev.filter(b => b.id !== block.id));

        // Activate multiplier effect (2x for 10 seconds)
        setMultiplierEffectActive(true);
        setMultiplierEffectEndTime(Date.now() + 10000);

        registerComboAction();
        addScore(30); // Bonus for using multiplier
        return;
      }

      // SNIPER TILE: Enter target selection mode
      if (block.type === 'sniper') {
        console.log('🎯 Sniper tile clicked! Select any board tile to remove.');
        setSelectedSniper(block);
        playSound('move');
        triggerHaptic(10);
        return;
      }

      // AGGRO TILE: Remove and trigger 3x speed effect
      if (block.type === 'aggro') {
        console.log('😡 AGGRO TILE CLEARED! Dragon speed x3 for 10 seconds!');
        pushHistory();
        playSound('error'); // Danger sound
        triggerHaptic([50, 50, 50, 50]); // Strong warning haptics

        // Remove Aggro tile from board
        setBlocks(prev => prev.filter(b => b.id !== block.id));

        // Activate Aggro effect (3x speed for 10 seconds)
        setAggroEffectActive(true);
        setAggroEffectEndTime(Date.now() + 10000);

        // Effect will be cleared by useEffect watching aggroEffectEndTime
        return;
      }
    }

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
      // Find all empty Layer 0 spots (not occupied by blocks or craters)
      const emptySpots: { x: number; y: number }[] = [];

      // Scan grid for all empty spots
      for (let r = 0; r < GRID_SIZE.rows; r++) {
        for (let c = 0; c < GRID_SIZE.cols; c++) {
          // Check if ANY block is at this x,y (Layer 0 or 1)
          const occupiedByBlock = blocks.some(b => Math.round(b.x) === c && Math.round(b.y) === r);
          const occupiedByCrater = craters.some(crater => crater.x === c && crater.y === r);
          if (!occupiedByBlock && !occupiedByCrater) {
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
      setMoveCount(prev => prev + 1); // Track move for efficiency bonus
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
    // Bombs cannot be moved to spools - they only explode
    if (block.type === 'bomb') {
      playSound('error');
      triggerHaptic([50, 50]);
      console.log('💣 Bombs cannot be moved! They will explode after countdown.');
      return;
    }

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

    // Rainbow tiles are OMNI-DIRECTIONAL - always have a clear path (bypass path checking)
    const isRainbow = block.type === 'rainbow';
    if (!isRainbow && !isPathClear(block, blocks, GRID_SIZE)) {
      playSound('error');
      triggerHaptic(50);
      return;
    }

    // Check if spools are frozen
    if (freezeEffectActive) {
      playSound('error');
      triggerHaptic([100, 50, 100]); // Triple buzz to indicate freeze
      console.log('🧊 Spools are frozen! Cannot move blocks.');
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
    setMoveCount(prev => prev + 1); // Track move for efficiency bonus
    playSound('move');
    triggerHaptic(10);

    // Remove the clicked block from grid
    setBlocks(prev => prev.filter(b => b.id !== block.id));

    // Decrement crater turns
    setCraters(prev => {
      return prev
        .map(c => ({ ...c, turnsRemaining: c.turnsRemaining - 1 }))
        .filter(c => c.turnsRemaining > 0);
    });

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
    registerComboAction();
    addScore(100);
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
        onResetProgress={handleResetProgress}
        onClose={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'shop') {
    return (
      <Shop
        currency={currency}
        inventory={inventory}
        onPurchase={handlePurchase}
        onClose={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'profile') {
    return (
      <Profile
        stats={stats}
        currency={currency}
        onClose={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'achievements') {
    return (
      <Achievements
        achievements={achievements}
        stats={stats}
        currency={currency}
        onClose={handleBackToMenu}
      />
    );
  }

  // Placeholder screens for future features
  if (currentScreen === 'leaderboards' || currentScreen === 'daily-challenge') {
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
      <ComboIndicator comboCount={comboCount} multiplier={getComboMultiplier()} />

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
              <Coins size={12} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-600">{currency.coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gem size={12} className="text-cyan-500" />
              <span className="text-xs font-bold text-slate-600">{currency.gems.toLocaleString()}</span>
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
        <DragonView
          segments={dragon}
          kitty={kitty}
        />

        {/* Spools - Horizontal at top of grid */}
        <div className="w-full flex justify-center py-1 z-30">
          <BufferArea slots={spools} isFrozen={freezeEffectActive} />
        </div>

        {/* Grid - Centered */}
        <div className="w-full flex items-center justify-center z-20">
          <Grid
            blocks={blocks}
            gridSize={GRID_SIZE}
            onBlockClick={(b) => handleBlockClick(b, 'grid')}
            selectedKeyId={selectedKey?.id}
            aggroTileId={blocks.find(b => b.type === 'aggro')?.id || null}
            craters={craters}
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
           <div className="text-center max-w-lg mx-auto">
             <div className="text-6xl mb-6 animate-bounce">🏆</div>
             <h2 className="text-4xl font-bold text-slate-800 mb-2">Safe & Sound!</h2>
             <p className="text-slate-600 mb-6 font-medium">You saved the Kitty!</p>

             {/* Achievement Unlocks */}
             {achievements.recentlyUnlocked.length > 0 && (
               <div className="mb-6 space-y-3">
                 <h3 className="text-lg font-bold text-yellow-600 flex items-center justify-center gap-2">
                   <span>🏆</span> Achievements Unlocked! <span>🏆</span>
                 </h3>
                 <div className="space-y-2 max-h-60 overflow-y-auto">
                   {achievements.recentlyUnlocked.map(id => {
                     const achievement = ACHIEVEMENTS.find(a => a.id === id);
                     if (!achievement) return null;
                     return (
                       <div key={id} className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-3 border-2 border-yellow-300 shadow-md">
                         <div className="flex items-center gap-3">
                           <div className="text-3xl">{achievement.icon}</div>
                           <div className="flex-1 text-left">
                             <div className="font-bold text-slate-800">{achievement.name}</div>
                             <div className="text-sm text-slate-600">{achievement.description}</div>
                             {(achievement.rewardCoins || achievement.rewardGems) && (
                               <div className="flex gap-2 text-xs font-medium text-slate-700 mt-1">
                                 {achievement.rewardCoins && <span>💰 +{achievement.rewardCoins}</span>}
                                 {achievement.rewardGems && <span>💎 +{achievement.rewardGems}</span>}
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}

             <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
               <button
                 onClick={() => {
                   // Clear achievement notifications
                   setAchievements(prev => ({ ...prev, recentlyUnlocked: [] }));
                   // Rewards already given when level was won
                   setLevelIndex(prev => prev + 1);
                   startNewGame(true);
                 }}
                 className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
               >
                 Next Level
               </button>
               <button
                 onClick={() => {
                   // Clear achievement notifications
                   setAchievements(prev => ({ ...prev, recentlyUnlocked: [] }));
                   startNewGame(true);
                 }}
                 className="w-full py-3 bg-white text-slate-600 font-bold rounded-xl border-2 border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
               >
                 Replay
               </button>
               <button
                 onClick={() => {
                   // Clear achievement notifications
                   setAchievements(prev => ({ ...prev, recentlyUnlocked: [] }));
                   handleBackToMenu();
                 }}
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

      {/* SNIPER TARGETING OVERLAY - Positioned over dragon area */}
      {selectedSniper && (
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-4 pointer-events-none">
          <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl px-6 py-3 border-2 border-slate-600 pointer-events-auto">
            <div className="flex items-center gap-4 text-white">
              <div className="text-3xl">🎯</div>
              <div className="text-left">
                <h2 className="text-lg font-bold">Sniper Mode</h2>
                <p className="text-white/80 text-sm">Click any board tile to remove it</p>
              </div>
              <button
                onClick={() => setSelectedSniper(null)}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 active:scale-95 transition-all text-sm"
              >
                Cancel
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
