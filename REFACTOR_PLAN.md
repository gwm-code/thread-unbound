# Major Refactor Plan - Match Original Game

## ✅ Completed So Far
1. ✅ Added 8-direction type system (UP, DOWN, LEFT, RIGHT, UP-LEFT, UP-RIGHT, DOWN-LEFT, DOWN-RIGHT)
2. ✅ Added diagonal pathfinding logic
3. ✅ Added `threadCount` to Block interface
4. ✅ Changed BufferSlot → Spool (holds ONE block, not array)
5. ✅ Added thread count constants [4, 6, 8, 10]
6. ✅ Updated ALL block generation to include `threadCount`
7. ✅ Updated BlockView to show diagonal arrows (8-direction support)
8. ✅ Updated BlockView to display thread count badge on blocks
9. ✅ Replaced buffer component with 4 horizontal spools above grid
10. ✅ Removed match-3 logic completely
11. ✅ Implemented auto-fire when dragon color matches spool (600ms interval)
12. ✅ Implemented thread count persistence (blocks stay in spools until all threads consumed)
13. ✅ Created long, winding S-curve path for dragon
14. ✅ Increased grid size to 8×8
15. ✅ Repositioned spools ABOVE grid (horizontal layout)
16. ✅ Implemented endless auto-scrolling conveyor belt
17. ✅ Conveyor click behavior: places block on random empty grid tile
18. ✅ Conveyor gap flow system: clicked blocks create flowing gaps
19. ✅ Dragon growth with max length cap and kitty swallowing mechanic
20. ✅ Kitty digestion system (moves through segments when dragon at max length)
21. ✅ Kitty escape mechanic (when segments removed, kitty moves back toward head)

## 🚧 Still Need to Implement

### Core Mechanics Changes
- [x] Update ALL block generation to include `threadCount` ✅
- [x] Update BlockView to show diagonal arrows (4 new rotations) ✅
- [x] Update BlockView to display thread count number on blocks ✅
- [ ] Make block visual SIZE scale with thread count (4=smallest, 10=largest) ⚠️ OPTIONAL
- [x] Replace buffer component with spools component (4 spools, above board) ✅
- [x] Implement "spools full = can't click" logic ✅
- [x] Remove match-3 logic completely ✅
- [x] Implement auto-fire when snake color matches spool ✅

### Snake/Dragon Changes
- [ ] Change from "dragon" to "snake" terminology ⚠️ KEPT AS DRAGON (thematic choice)
- [x] Make snake infinitely long and continuously advancing ✅ (with max length cap)
- [x] Create long, winding path for snake (not straight) ✅ (S-curve path)
- [x] Auto-fire mechanism: when snake head reaches spool color → remove X segments → empty spool ✅
- [x] Win condition: dragon reduced to head only ✅
- [x] Lose condition: kitty reaches tail (game over) ✅

### Grid & Visual Changes
- [x] Increase grid size (currently 6×5 → maybe 8×8 or 10×10) ✅ (now 8×8)
- [x] Make blocks smaller to fit larger grid ✅
- [x] Reposition spools ABOVE grid (not below) ✅

### Conveyor Changes
- [ ] Make conveyor optional per level (not always present) ⚠️ CONVEYOR ALWAYS PRESENT
- [x] Implement auto-scrolling conveyor (blocks move through it) ✅
- [x] Change click behavior: grab from moving belt (place on grid) ✅

### Level System
- [ ] Update level configs to include:
  - `hasConveyor: boolean`
  - Thread counts for each block
  - 8-direction support

## Files That Need Major Updates

1. **types.ts** - ✅ DONE (Direction, Block, Spool, Kitty)
2. **utils/gameUtils.ts** - ✅ DONE (pathfinding, block generation, progressive difficulty)
3. **components/BlockView.tsx** - ✅ DONE (diagonal arrows + thread count badge)
4. **components/BufferArea.tsx** - ✅ DONE (4 horizontal spools with auto-fire)
5. **components/DragonView.tsx** - ✅ DONE (winding S-curve path, kitty mechanics)
6. **components/ConveyorBelt.tsx** - ✅ DONE (endless scrolling with gap flow)
7. **App.tsx** - ✅ DONE (complete game logic rewrite)

## Recent Implementation Details (Jan 2026)

### Conveyor Belt System
The endless conveyor belt was the final major feature implemented:

**Implementation Approach:**
- Position blocks using array index + scroll offset
- Scroll offset continuously increases (30px/sec)
- When scroll reaches one block width (56px), remove first block and reset offset
- Clicked blocks marked as hidden (not removed from array) to maintain spacing
- Hidden blocks create flowing gaps that scroll through the belt
- New blocks only added when blocks naturally scroll off (not when clicked)

**Key Technical Details:**
```typescript
// Position calculation
const currentPos = startPosition + (index * blockWidth) - scrollOffsetRef.current;

// Reset logic when block scrolls off
if (scrollOffsetRef.current >= blockWidth && blocks.length > 0) {
  scrollOffsetRef.current -= blockWidth;
  onBlockScrolledOff(blocks[0]);
}
```

### Kitty Swallowing Mechanic
- Dragon grows until reaching max path length (~18 segments)
- At max length: digests kitty (increments segmentIndex) instead of growing
- When player removes segments: kitty moves back toward head
- If kitty reaches index 0: escapes back to end of path
- If kitty reaches tail: game over

### Auto-Fire System
- 600ms interval checks if spool color matches dragon
- Removes min(threadCount, matchingSegments) from dragon
- Block stays in spool with reduced threadCount if partially consumed
- Only removes block when threadCount reaches 0

## Breaking Changes (All Implemented)
- ✅ All existing levels have thread counts added
- ✅ All block generation includes thread counts
- ✅ Buffer logic completely replaced with spool logic
- ✅ Match-3 removed, auto-fire added
- ✅ Layer system simplified (single layer)
- ✅ Key/lock mechanics changed to manual selection

## Current Status
🎉 **GAME COMPLETE AND FUNCTIONAL**

All major mechanics implemented and working:
- Grid clearing with pathfinding
- Conveyor belt with endless scrolling
- Spool system with auto-fire
- Dragon growth and kitty mechanics
- Progressive difficulty (5 tutorial + procedural levels)
- Mobile-optimized responsive UI
