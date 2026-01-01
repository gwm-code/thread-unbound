export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'UP-LEFT' | 'UP-RIGHT' | 'DOWN-LEFT' | 'DOWN-RIGHT';

export type BlockColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export type BlockType = 'normal' | 'key' | 'locked';

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
