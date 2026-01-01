import { Block, BlockColor, Direction, GridSize, BlockType, LevelConfig } from '../types';
import { generateUUID } from './uuid';

export const GRID_SIZE: GridSize = { rows: 8, cols: 8 }; // Larger grid for original game feel

// Difficulty configuration for procedurally generated levels
export interface DifficultyConfig {
  gridFillPercentage: number;    // 0.0 to 1.0 - how full the grid is
  lockedBlockChance: number;      // 0.0 to 1.0 - chance a block is locked
  keyCount: number;               // Number of key/lock pairs
  initialDragonLength: number;    // Starting dragon size
  dragonGrowthInterval: number;   // Milliseconds between dragon growth
  conveyorCount: number;          // Number of conveyor blocks
}

export const DIRECTIONS: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'UP-LEFT', 'UP-RIGHT', 'DOWN-LEFT', 'DOWN-RIGHT'];
export const COLORS: BlockColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];
export const THREAD_COUNTS = [4, 6, 8, 10] as const;

export const getRandomColor = (): BlockColor => COLORS[Math.floor(Math.random() * COLORS.length)];
export const getRandomDirection = (): Direction => DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
export const getRandomThreadCount = (): number => THREAD_COUNTS[Math.floor(Math.random() * THREAD_COUNTS.length)];

/**
 * Calculate difficulty configuration based on level number
 * Levels 0-4 are tutorial levels (manually designed)
 * Level 5+ are procedurally generated with progressive difficulty
 */
export const getDifficultyForLevel = (levelIndex: number): DifficultyConfig => {
  // Tutorial levels use manual configuration, this is for procedural levels only
  // levelIndex 5 = first procedural level (difficulty level 1)
  // levelIndex 10 = difficulty level 6, etc.
  const difficultyLevel = Math.max(0, levelIndex - 4); // 5->1, 6->2, 7->3, etc.

  // Progressive scaling with diminishing returns (logarithmic growth)
  const scale = Math.min(1, difficultyLevel / 20); // Caps at level 24 (levelIndex 28)

  return {
    // Grid fill: 25% -> 60% (never gets super cramped)
    gridFillPercentage: 0.25 + (scale * 0.35),

    // Locked blocks: 0% -> 25% chance
    lockedBlockChance: scale * 0.25,

    // Key/lock pairs: 0 -> 2
    keyCount: Math.floor(scale * 2),

    // Dragon length: 8 -> 18 (never starts too long)
    initialDragonLength: Math.floor(8 + (scale * 10)),

    // Growth interval: 6s -> 2s (faster baseline, scales to very fast!)
    dragonGrowthInterval: Math.floor(6000 - (scale * 4000)),

    // Conveyor blocks: 4 -> 7
    conveyorCount: Math.floor(4 + (scale * 3))
  };
};

// JSON-like Level Definitions - Gradual difficulty progression
export const LEVELS: LevelConfig[] = [
  {
    id: "level_1",
    dragon: ['red', 'red', 'blue', 'blue', 'green'],
    conveyorCount: 3,
    grid: [
      { x: 0, y: 0, color: 'red', direction: 'LEFT', type: 'normal', threadCount: 4 },
      { x: 1, y: 0, color: 'red', direction: 'DOWN', type: 'normal', threadCount: 6 },
      { x: 2, y: 0, color: 'blue', direction: 'RIGHT', type: 'normal', threadCount: 4 },
      { x: 3, y: 2, color: 'blue', direction: 'UP', type: 'normal', threadCount: 8 },
      { x: 4, y: 4, color: 'green', direction: 'LEFT', type: 'normal', threadCount: 10 },
    ]
  },
  {
    id: "level_2",
    dragon: ['red', 'red', 'blue', 'blue', 'green', 'green'],
    conveyorCount: 3,
    grid: [
      { x: 0, y: 0, color: 'red', direction: 'LEFT', type: 'normal', threadCount: 4 },
      { x: 1, y: 0, color: 'red', direction: 'DOWN', type: 'normal', threadCount: 6 },
      { x: 2, y: 0, color: 'blue', direction: 'RIGHT', type: 'normal', threadCount: 4 },
      { x: 3, y: 2, color: 'blue', direction: 'UP', type: 'normal', threadCount: 6 },
      { x: 4, y: 4, color: 'green', direction: 'LEFT', type: 'normal', threadCount: 8 },
      { x: 5, y: 3, color: 'green', direction: 'DOWN', type: 'normal', threadCount: 6 },
    ]
  },
  {
    id: "level_3",
    dragon: ['purple', 'purple', 'yellow', 'yellow', 'red', 'red', 'blue'],
    conveyorCount: 4,
    grid: [
      { x: 1, y: 1, color: 'purple', direction: 'DOWN', type: 'normal', threadCount: 6 },
      { x: 2, y: 1, color: 'purple', direction: 'DOWN', type: 'normal', threadCount: 6 },
      { x: 1, y: 3, color: 'yellow', direction: 'UP', type: 'normal', threadCount: 8 },
      { x: 2, y: 3, color: 'yellow', direction: 'UP', type: 'normal', threadCount: 6 },
      { x: 3, y: 2, color: 'red', direction: 'LEFT', type: 'normal', threadCount: 4 },
      { x: 4, y: 2, color: 'red', direction: 'RIGHT', type: 'normal', threadCount: 6 },
      { x: 5, y: 4, color: 'blue', direction: 'UP', type: 'normal', threadCount: 8 },
    ]
  },
  {
    id: "level_4",
    dragon: ['red', 'red', 'blue', 'blue', 'green', 'green', 'yellow', 'yellow'],
    conveyorCount: 4,
    grid: [
      { x: 0, y: 0, color: 'red', direction: 'RIGHT', type: 'normal', threadCount: 4 },
      { x: 1, y: 0, color: 'red', direction: 'DOWN', type: 'normal', threadCount: 6 },
      { x: 2, y: 1, color: 'blue', direction: 'LEFT', type: 'normal', threadCount: 4 },
      { x: 3, y: 1, color: 'blue', direction: 'UP', type: 'normal', threadCount: 8 },
      { x: 4, y: 2, color: 'green', direction: 'DOWN', type: 'normal', threadCount: 6 },
      { x: 5, y: 2, color: 'green', direction: 'LEFT', type: 'normal', threadCount: 8 },
      { x: 2, y: 4, color: 'yellow', direction: 'UP', type: 'normal', threadCount: 6 },
      { x: 3, y: 4, color: 'yellow', direction: 'RIGHT', type: 'normal', threadCount: 8 },
      { x: 2, y: 3, color: 'purple', direction: 'DOWN', type: 'normal', threadCount: 4 },
    ]
  },
  {
    id: "level_5_test_keys",
    dragon: ['red', 'red', 'blue', 'blue', 'green', 'green', 'yellow', 'yellow', 'purple'],
    conveyorCount: 4,
    grid: [
      // Green key and locked blocks
      { x: 1, y: 1, color: 'green', direction: 'RIGHT', type: 'key', threadCount: 6 },
      { x: 2, y: 1, color: 'green', direction: 'DOWN', type: 'locked', threadCount: 6 },
      { x: 3, y: 1, color: 'green', direction: 'LEFT', type: 'locked', threadCount: 8 },

      // Red key and locked blocks
      { x: 1, y: 3, color: 'red', direction: 'UP', type: 'key', threadCount: 4 },
      { x: 2, y: 3, color: 'red', direction: 'DOWN', type: 'locked', threadCount: 6 },
      { x: 3, y: 3, color: 'red', direction: 'RIGHT', type: 'locked', threadCount: 8 },

      // Normal blocks
      { x: 5, y: 2, color: 'blue', direction: 'LEFT', type: 'normal', threadCount: 6 },
      { x: 6, y: 2, color: 'yellow', direction: 'UP', type: 'normal', threadCount: 8 },
      { x: 4, y: 4, color: 'purple', direction: 'DOWN', type: 'normal', threadCount: 6 },
    ]
  }
];

export const generateLevel = (difficulty: DifficultyConfig): Block[] => {
  const blocks: Block[] = [];
  const takenPositions = new Set<string>();

  const totalCells = GRID_SIZE.rows * GRID_SIZE.cols;
  const targetBlockCount = Math.floor(totalCells * difficulty.gridFillPercentage);

  // Generate all positions and shuffle for random placement
  const allPositions: { x: number; y: number }[] = [];
  for (let r = 0; r < GRID_SIZE.rows; r++) {
    for (let c = 0; c < GRID_SIZE.cols; c++) {
      allPositions.push({ x: c, y: r });
    }
  }

  // Shuffle positions for random placement
  allPositions.sort(() => Math.random() - 0.5);

  // Place blocks up to target count - ONE block per position
  let blocksPlaced = 0;
  for (let i = 0; i < allPositions.length && blocksPlaced < targetBlockCount; i++) {
    const pos = allPositions[i];
    const key = `${pos.x},${pos.y}`;

    // Skip if position already taken (should never happen with unique positions, but safety check)
    if (takenPositions.has(key)) {
      console.error(`⚠️ Duplicate block attempted at ${key}! Skipping.`);
      continue;
    }

    takenPositions.add(key);
    blocks.push({
      id: generateUUID(),
      x: pos.x,
      y: pos.y,
      color: getRandomColor(),
      direction: getRandomDirection(),
      type: 'normal',
      threadCount: getRandomThreadCount()
    });
    blocksPlaced++;
  }

  console.log(`✅ Generated ${blocksPlaced} unique blocks (target: ${targetBlockCount})`);

  // Validation: Check for duplicates in final block list
  const positionCounts = new Map<string, number>();
  blocks.forEach(block => {
    const key = `${Math.round(block.x)},${Math.round(block.y)}`;
    positionCounts.set(key, (positionCounts.get(key) || 0) + 1);
  });

  // Report any duplicates found
  positionCounts.forEach((count, pos) => {
    if (count > 1) {
      console.error(`❌ DUPLICATE blocks at ${pos}: ${count} blocks`);
    }
  });

  // Assign Keys and Locks (if difficulty includes them)
  if (difficulty.keyCount > 0 && difficulty.lockedBlockChance > 0) {
    const allColors = Array.from(new Set(blocks.map(b => b.color)));
    const lockedColors = allColors.sort(() => 0.5 - Math.random()).slice(0, difficulty.keyCount);

    lockedColors.forEach(color => {
      const blocksOfColor = blocks.filter(b => b.color === color);
      if (blocksOfColor.length >= 3) {
        const keyBlock = blocksOfColor[0];

        keyBlock.type = 'key';
        blocksOfColor.forEach(b => {
          if (b.id !== keyBlock.id && Math.random() < difficulty.lockedBlockChance) {
            b.type = 'locked';
          }
        });
      }
    });
  }

  return blocks;
};

export const loadLevel = (config: LevelConfig): { blocks: Block[], dragon: BlockColor[] } => {
  const blocks: Block[] = config.grid.map(b => ({
    id: generateUUID(),
    ...b
  }));

  // Validation: Check for duplicate positions in tutorial levels
  const positionMap = new Map<string, Block[]>();
  blocks.forEach(block => {
    const key = `${Math.round(block.x)},${Math.round(block.y)}`;
    if (!positionMap.has(key)) {
      positionMap.set(key, []);
    }
    positionMap.get(key)!.push(block);
  });

  positionMap.forEach((blockList, key) => {
    if (blockList.length > 1) {
      console.error(`❌ DUPLICATE blocks in tutorial level at ${key}:`, blockList);
    }
  });

  return { blocks, dragon: [...config.dragon] };
};

export const generateConveyorBlocks = (count: number = 5): Block[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `conveyor-${generateUUID()}`,
    x: -1,
    y: -1,
    color: getRandomColor(),
    direction: getRandomDirection(),
    type: 'normal', // Keys only appear in designed levels
    threadCount: getRandomThreadCount()
  }));
};

export const generateDragon = (length: number = 20): BlockColor[] => {
  return Array.from({ length }, () => getRandomColor());
};

export const isPathClear = (block: Block, allBlocks: Block[], gridSize: GridSize): boolean => {
  const { x, y, direction } = block;

  // Use integer-based grid snapping to prevent floating-point precision issues
  const gridX = Math.round(x);
  const gridY = Math.round(y);

  // NO BOUNDARY CHECKS! Blocks can escape off any edge.
  // Only check if another block is blocking the path to the edge.

  // Check if any block is blocking the path in the direction the block is pointing
  return !allBlocks.some((other) => {
    if (other.id === block.id) return false;

    const otherGridX = Math.round(other.x);
    const otherGridY = Math.round(other.y);

    // Integer-based alignment checks (blocks are on same grid line)
    const alignedX = otherGridX === gridX;
    const alignedY = otherGridY === gridY;

    // Check if the other block is in this block's escape path
    switch (direction) {
      case 'UP':
        return alignedX && otherGridY < gridY;
      case 'DOWN':
        return alignedX && otherGridY > gridY;
      case 'LEFT':
        return alignedY && otherGridX < gridX;
      case 'RIGHT':
        return alignedY && otherGridX > gridX;
      case 'UP-LEFT':
        // Diagonal: block on diagonal line going up-left
        return (otherGridX < gridX && otherGridY < gridY &&
                (gridX - otherGridX) === (gridY - otherGridY));
      case 'UP-RIGHT':
        return (otherGridX > gridX && otherGridY < gridY &&
                (otherGridX - gridX) === (gridY - otherGridY));
      case 'DOWN-LEFT':
        return (otherGridX < gridX && otherGridY > gridY &&
                (gridX - otherGridX) === (otherGridY - gridY));
      case 'DOWN-RIGHT':
        return (otherGridX > gridX && otherGridY > gridY &&
                (otherGridX - gridX) === (otherGridY - gridY));
    }
    return false;
  });
};

export const canBlockMove = (block: Block, allBlocks: Block[], gridSize: GridSize): boolean => {
  if (block.type === 'locked') return false;
  return isPathClear(block, allBlocks, gridSize);
};

export const shuffleBlocks = (blocks: Block[]): Block[] => {
  return blocks.map(b => ({
    ...b,
    direction: getRandomDirection()
  }));
};
