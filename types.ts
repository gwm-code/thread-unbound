export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'UP-LEFT' | 'UP-RIGHT' | 'DOWN-LEFT' | 'DOWN-RIGHT';

export type BlockColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export type BlockType = 'normal' | 'key' | 'locked' | 'sniper' | 'rainbow' | 'aggro' | 'spin' | 'random' | 'multiplier' | 'freeze' | 'bomb' | 'mystery';

export type GameState = 'playing' | 'won' | 'game_over';

export interface Block {
  id: string;
  x: number;
  y: number;
  color: BlockColor;
  direction: Direction;
  type: BlockType;
  threadCount: number; // 4, 6, 8, or 10 - how many snake segments this removes
  justUnlocked?: boolean;
  countdown?: number; // For bomb tiles - number of moves until explosion
}

export interface Crater {
  id: string;
  x: number;
  y: number;
  expiresAt: number; // Timestamp when crater disappears (10 seconds after creation)
}

export interface DragonSegment {
  id: string;
  color: BlockColor;
}

export interface Spool {
  id: number;
  block: Block | null; // Only ONE block per spool (not an array!)
}

export interface GridSize {
  rows: number;
  cols: number;
}

export interface Thread {
  id: string;
  fromSlotId: number;
  color: BlockColor;
  targetSegmentIndex: number;
}

export interface Kitty {
  isSwallowed: boolean; // True when inside dragon
  segmentIndex: number; // Which dragon segment contains the kitty (0 = head)
  // Position is ALWAYS calculated from the path - no raw x,y coordinates
}

export interface LevelConfig {
  id: string;
  grid: {
    x: number;
    y: number;
    color: BlockColor;
    direction: Direction;
    type: BlockType;
    threadCount: number;
  }[];
  dragon: BlockColor[];
  conveyorCount: number;
}

export interface PlayerCurrency {
  coins: number;  // Sumo Coins - primary gameplay currency
  gems: number;   // Thread Gems - premium/rare currency
}

export type ShopItemType = 'consumable' | 'permanent';
export type CurrencyType = 'coins' | 'gems';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: CurrencyType;
  type: ShopItemType;
  icon: string; // Emoji
  maxPurchases?: number; // For multi-tier upgrades (e.g., Score Multiplier I, II, III)
}

export interface PlayerInventory {
  // Consumables (can have multiple)
  extraUndos: number;
  freezeTime: number;
  conveyorSpeed: number;
  rerollGrid: number;

  // Permanent upgrades (boolean flags)
  scoreMultiplierLevel: number; // 0, 1, 2, or 3 (I, II, III)
  hasStartingUndo: boolean;
  hasSpoolUpgrade: boolean; // 5 spools instead of 4
  hasCoinMagnet: boolean; // +25% coins
}

export interface PlayerStats {
  // Play time
  totalPlayTimeSeconds: number;
  sessionStartTime: number; // Timestamp when current session started

  // Level progress
  levelsCompleted: number;
  levelsAttempted: number;

  // Currency earned (lifetime totals)
  totalCoinsEarned: number;
  totalGemsEarned: number;

  // Dragon segments
  totalSegmentsRemoved: number;

  // Kitty rescues
  kittiesRescued: number;

  // Achievement tracking (additional stats for achievements)
  perfectClears: number; // Perfect Clear bonus awarded count
  noUndoCompletions: number; // Levels completed without undo
  maxComboReached: number; // Highest combo multiplier achieved
  segmentsRemovedWith10Count: number; // Segments removed using 10-count blocks
  maxSegmentsInOneTurn: number; // Highest segments removed in single turn
  totalGemsSpent: number; // Total gems spent (for Gem Enthusiast achievement)
  fastestLevelTime: number; // Fastest level completion in seconds
  levelsCompletedUnder10Moves: number; // Levels completed with <10 moves
}

export type AchievementCategory = 'progression' | 'combat' | 'collection' | 'skill' | 'hidden';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
  category: AchievementCategory;
  requirement: number; // Target value to unlock
  requirementText: string; // e.g., "Reach Level 5", "Remove 1,000 segments"
  rewardCoins?: number; // Optional coin reward
  rewardGems?: number; // Optional gem reward
  hidden?: boolean; // Hidden achievements don't show until unlocked
  comingSoon?: boolean; // Features not yet implemented
}

export interface PlayerAchievements {
  // Map of achievement ID to progress value
  progress: Record<string, number>;
  // Set of unlocked achievement IDs
  unlocked: Set<string>;
  // Track newly unlocked (for notifications)
  recentlyUnlocked: string[];
}

export type ChallengeType = 'daily' | 'weekly';

export interface Challenge {
  id: string;
  type: ChallengeType;
  name: string;
  description: string;
  icon: string; // Emoji
  requirement: number; // Target value to complete
  rewardCoins?: number;
  rewardGems?: number;
  progressKey: keyof PlayerStats; // Which stat to track
}

export interface PlayerChallenges {
  // Daily challenges reset at midnight
  dailyResetTime: number; // Timestamp of last daily reset
  dailyProgress: Record<string, number>; // Challenge ID -> progress
  dailyCompleted: Set<string>; // Completed challenge IDs for today

  // Weekly challenges reset on Monday
  weeklyResetTime: number; // Timestamp of last weekly reset
  weeklyProgress: Record<string, number>; // Challenge ID -> progress
  weeklyCompleted: Set<string>; // Completed challenge IDs for this week

  // Daily login streak
  loginStreak: number; // Consecutive days logged in
  lastLoginDate: string; // YYYY-MM-DD format
}
