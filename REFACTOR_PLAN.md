# Major Refactor Plan - Match Original Game

## ✅ Completed So Far
1. Added 8-direction type system (UP, DOWN, LEFT, RIGHT, UP-LEFT, UP-RIGHT, DOWN-LEFT, DOWN-RIGHT)
2. Added diagonal pathfinding logic
3. Added `threadCount` to Block interface
4. Changed BufferSlot → Spool (holds ONE block, not array)
5. Added thread count constants [4, 6, 8, 10]

## 🚧 Still Need to Implement

### Core Mechanics Changes
- [ ] Update ALL block generation to include `threadCount`
- [ ] Update BlockView to show diagonal arrows (4 new rotations)
- [ ] Update BlockView to display thread count number on blocks
- [ ] Make block visual SIZE scale with thread count (4=smallest, 10=largest)
- [ ] Replace buffer component with spools component (4 spools, above board)
- [ ] Implement "spools full = can't click" logic
- [ ] Remove match-3 logic completely
- [ ] Implement auto-fire when snake color matches spool

### Snake/Dragon Changes
- [ ] Change from "dragon" to "snake" terminology
- [ ] Make snake infinitely long and continuously advancing
- [ ] Create long, winding path for snake (not straight)
- [ ] Auto-fire mechanism: when snake head reaches spool color → remove X segments → empty spool
- [ ] Win condition: snake pushed back to start
- [ ] Lose condition: snake reaches kitty

### Grid & Visual Changes
- [ ] Increase grid size (currently 6×5 → maybe 8×8 or 10×10)
- [ ] Make blocks smaller to fit larger grid
- [ ] Reposition spools ABOVE grid (not below)

### Conveyor Changes
- [ ] Make conveyor optional per level (not always present)
- [ ] Implement auto-scrolling conveyor (blocks move through it)
- [ ] Change click behavior: grab from moving belt (not place on grid)

### Level System
- [ ] Update level configs to include:
  - `hasConveyor: boolean`
  - Thread counts for each block
  - 8-direction support

## Files That Need Major Updates

1. **types.ts** - ✅ DONE (Direction, Block, Spool)
2. **utils/gameUtils.ts** - ⚠️ PARTIAL (pathfinding done, need block generation)
3. **components/BlockView.tsx** - Need diagonal arrows + thread count display
4. **components/BufferArea.tsx** - Rename to SpoolArea, complete rewrite
5. **components/DragonView.tsx** - Rename to SnakeView, winding path logic
6. **components/ConveyorBelt.tsx** - Add auto-scrolling animation
7. **App.tsx** - Major rewrite of game logic

## Breaking Changes
- All existing levels need thread counts added
- All block generation needs thread counts
- Buffer logic completely replaced with spool logic
- Match-3 removed, auto-fire added

## Recommended Approach
Start fresh conversation with this plan as reference, implement systematically in phases.
