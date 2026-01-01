# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thread Unbound is a high-fidelity web clone of the mobile game "Wool Crush" - a spatial puzzle-strategy hybrid involving grid clearing, buffer management, and survival mechanics.

**Core Game Loop:**
1. Clear blocks from a grid by tapping them
2. Match colors in a buffer (5 spindles)
3. Fire threads to unravel a knitted dragon
4. Prevent the dragon from reaching the Kitty

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Architecture

### Game State Management (`App.tsx`)

The main App component manages all game state using React hooks:
- `blocks`: Grid blocks (layer 0 and 1) on 8×8 grid
- `conveyorBlocks`: Conveyor belt blocks that can be placed on empty grid tiles
- `spools`: 4 horizontal spools where blocks accumulate (changed from 5 vertical spindles)
- `dragon`: Array of DragonSegments (index 0 is the immortal head)
- `history`: Undo stack (max 5 states)
- `activeThreads`: Visual thread animations from spools to dragon
- `selectedKey`: Currently selected key block for manual unlocking
- `speedMultiplier`: 1x or 3x speed control for dragon growth

### Critical Game Mechanics

#### 1. Movement & Pathfinding (`utils/gameUtils.ts`)
- **Blocks can escape off ANY edge of the grid** - the arrows show the escape direction
- A block is only blocked if another block is in its path - NOT by grid boundaries
- Uses integer-based grid snapping (`Math.round`) to prevent floating-point precision issues
- **One block per grid position** - no stacking or layering

#### 2. Dragon Mechanics
- **Index 0 (Head)**: Permanent, represents the threat, faces the Kitty
- **Index 1+ (Body)**: Vulnerable to thread targeting
- Growth: New segment added to TAIL every 8-15 seconds (varies by level and speed multiplier)
- Fail state: Dragon length >= 35 segments
- Victory: Dragon length === 1 (only head remains)
- Speed Control: Players can toggle 3x speed to accelerate dragon growth

#### 3. Thread Count & Auto-Fire Mechanics
- Each block has a threadCount (4, 6, 8, or 10)
- Blocks placed in spools **auto-fire** when their color appears in the dragon
- Auto-fire removes min(threadCount, matchingSegments) from dragon
- **Thread Persistence**: If threadCount > segments removed, block stays with reduced count
  - Example: Blue-8 block + 2 blue segments → removes 2, block stays with threadCount=6
- Only removes block from spool when all threads are consumed
- Never targets Index 0 (head is protected)

#### 4. Conveyor Belt
- Tapping a conveyor block places it on a **random empty grid tile**
- Scans grid row-by-row, column-by-column for empty spots
- Strategy: Fill holes or create paths for trapped blocks

### Component Structure

```
App.tsx                     # Main game loop, state management
├── Grid.tsx                # Renders the 8×8 grid
│   └── BlockView.tsx       # Individual 3D tactile block (Framer Motion)
├── ConveyorBelt.tsx        # Horizontal scrollable conveyor
├── BufferArea.tsx          # 4 horizontal spools with auto-fire system
├── DragonView.tsx          # SVG dragon with animated segments (responsive height)
└── ThreadConnection.tsx    # SVG paths for wool thread animations

utils/
├── gameUtils.ts            # Core logic: pathfinding, collision, progressive difficulty
├── soundUtils.ts           # Audio feedback and haptics
└── uuid.ts                 # UUID generation with mobile browser compatibility
```

### Data Flow

1. **Block Click** → `handleBlockClick(block, source)`
   - If `source === 'conveyor'`: Find random empty grid tile, place block
   - If `source === 'grid' && type === 'key'`: Select key for manual unlocking
   - If `source === 'grid' && type === 'locked'`: Check for matching selected key, unlock if valid
   - If `source === 'grid' && type === 'normal'`: Check if covered/locked/path clear → move to spool
2. **Spool Update** → Auto-fire mechanism checks every 600ms if spool color matches dragon
3. **Auto-Fire** → Remove matching segments (up to threadCount) → Reduce or clear spool → Check victory/defeat

### Progressive Difficulty System

Levels 1-5 are **tutorial levels** (manually designed). Level 6+ are **procedurally generated** with progressive difficulty:

**Difficulty Scaling** (Level 6 → Level 30+):
- Grid Fill: 25% → 60%
- Layer 1 Blocks: 0 → 3 (reduced to minimize confusion)
- Dragon Length: 8 → 18 segments
- Growth Speed: 10s → 5s per segment
- Locked Blocks: 0% → 25% chance
- Key Pairs: 0 → 2

See `getDifficultyForLevel()` in `utils/gameUtils.ts` for implementation.

## Level System

Levels defined in `utils/gameUtils.ts` as `LevelConfig` objects:
- `grid`: Array of block definitions (x, y, color, direction, layer, type)
- `dragon`: Array of BlockColors defining initial dragon
- `conveyorCount`: Number of conveyor blocks to spawn

Block types:
- `normal`: Standard block with threadCount
- `key`: User selects key, then clicks specific locked block to unlock (one at a time)
- `locked`: Cannot be clicked until unlocked with matching key
- Keys only appear in manually designed levels, not procedural generation

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Framer Motion** for layout animations and spring physics
- **Tailwind CSS** for 3D-tactile UI styling (configured via inline classes)
- **Lucide React** for icons
- **react-hot-toast** for notifications

## Environment Variables

`.env.local`:
```
GEMINI_API_KEY=your_key_here
```

Note: Currently loaded in `vite.config.ts` but not actively used by game logic.

## Code Conventions

- Use `generateUUID()` from `utils/uuid.ts` for ID generation (mobile-compatible fallback)
- Grid coordinates are 0-indexed: `x ∈ [0, 7]`, `y ∈ [0, 7]` (8×8 grid)
- Direction arrows: `'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'UP-LEFT' | 'UP-RIGHT' | 'DOWN-LEFT' | 'DOWN-RIGHT'`
- Colors: `'red' | 'blue' | 'green' | 'yellow' | 'purple'`
- Thread Counts: `4 | 6 | 8 | 10`
- Use integer-based grid snapping (`Math.round`) to handle floating-point imprecision
- One block per grid position - no layering or stacking

## Mobile Compatibility

- **UUID Generation**: Uses fallback for `crypto.randomUUID()` on HTTP (see `utils/uuid.ts`)
- **Responsive Layout**: Compact header, smaller dragon (80px on mobile vs 120px desktop)
- **Touch-Optimized**: 48x48px minimum touch targets, translucent overlays
- **No Toasts**: All popup notifications removed for cleaner mobile experience

## Meta-Progression Systems (January 2025)

### Currency System
- **Sumo Coins**: Primary currency earned from level completion (+50) and segment removal (+10 per segment)
- **Thread Gems**: Premium currency earned from first-time level completions (+5 per level)
- **Coin Magnet Upgrade**: +25% bonus to all coin earnings when purchased
- All currency persists to localStorage

### Shop System (`components/Shop.tsx`)
**Consumables** (can purchase multiple):
- Extra Undo (50 coins): +1 undo for current level
- Freeze Time (100 coins): Freeze dragon for 10 seconds
- Conveyor Speed (50 coins): 2x conveyor speed
- Reroll Grid (100 coins): Regenerate grid (keeps score/dragon)

**Permanent Upgrades** (one-time purchases):
- Score Multiplier I/II/III (500/1000/2000 coins): +10%/+25%/+50% all scores
- Starting Undo (300 coins): Start each level with 1 undo
- Spool Upgrade (1500 coins): 5 spools instead of 4
- Coin Magnet (600 coins): +25% coin earnings

### Statistics Tracking (`types.ts`: PlayerStats)
Tracks and persists:
- Total play time (increments every 10 seconds during gameplay)
- Levels completed and attempted
- Total coins and gems earned (lifetime)
- Total segments removed
- Kitties rescued (when kitty escapes from dragon)
- Derived stats: Win rate, average coins/level, average segments/level

### Profile Page (`components/Profile.tsx`)
Displays:
- Current balance (coins, gems)
- Lifetime statistics
- Performance metrics with derived calculations

### Combo Scoring System
**Combo Multipliers**:
- Chain actions within 3 seconds: 1x → 2x → 3x → 4x
- Applies to segment removal scoring
- Stacks multiplicatively with inventory score upgrades
- Visual indicator (`components/ComboIndicator.tsx`) shows current combo with color-coded animations

**Bonus Scores**:
- Perfect Clear (+500): Clear entire grid
- No Undo (+200): Complete level without using undo
- Thread Master (+150): Fire all 4 spools in single turn *(planned)*
- Dragon Shrink Streak (+50 per segment over 5): Remove 5+ segments in one fire *(planned)*

### Menu System (`components/StartMenu.tsx`, `components/Settings.tsx`)
- Start Menu with navigation: Play, Daily Challenge, Shop, Achievements, Leaderboards, Profile/Stats, Settings
- Settings: Sound/haptics toggles, reset progress
- Checkpoint system: Level selection every 10 levels

### Data Persistence
All game progress stored in localStorage:
- `thread-unbound-progress`: Current level, highest reached
- `thread-unbound-settings`: Sound/haptics preferences
- `thread-unbound-currency`: Coins and gems
- `thread-unbound-completed-levels`: Set of completed level indices
- `thread-unbound-inventory`: Shop purchases and upgrades
- `thread-unbound-stats`: Player statistics

## Development Roadmap

See `roadmap_in_use.md` for the complete feature roadmap and implementation priorities.

**Completed (Phase 1)**:
- ✅ Start Menu & Settings
- ✅ Currency System (Sumo Coins, Thread Gems)
- ✅ Basic Shop (consumables + permanent upgrades)
- ✅ Statistics Tracking & Profile Page
- ✅ Combo Scoring System (partial - missing 2 bonuses)

**Next Steps**:
- Complete Section 2 bonuses (Thread Master, Dragon Shrink Streak)
- Achievement System (Phase 1, item #5)
- Special Tiles (Phase 2, item #6)

## Recent Updates (December 2024)

### Core Mechanics Changes
1. **Spool System Redesign**:
   - Changed from 5 vertical spindles to 4 horizontal spools
   - Moved spools from side overlays to horizontal row above grid
   - Blocks persist in spools with reduced threadCount until fully consumed

2. **Thread Count Persistence**:
   - Blocks now stay in spools after partial segment removal
   - threadCount decrements by segments removed
   - Only removes block when threadCount reaches 0

3. **Key/Lock Mechanics**:
   - Changed from auto-unlock-all to manual selection
   - Player clicks key, then clicks specific locked block to unlock
   - Keys removed from procedural generation (tutorial only)

4. **Auto-Fire System**:
   - Replaced Match-3 mechanic with auto-fire
   - 600ms check interval for color matching
   - Prevents phantom firing (validates matching segments exist)

### UI/UX Improvements
1. **Compact Header**: Removed logo, reduced from ~80px to ~40px height
2. **Speed Control**: 3x speed toggle button for faster gameplay
3. **Removed Toasts**: All popup messages eliminated
4. **Thread Count Badge**: Moved from top-right to bottom-right (arrow visibility)
5. **Mobile Optimization**: Responsive spacing, smaller components on mobile

### Bug Fixes (December 2024)
1. Level progression no longer resets after level 6
2. No duplicate blocks at same position (proper validation)
3. Mobile HTTP compatibility (UUID polyfill)
4. Grid visibility fixed with minHeight constraint
5. **Fixed double auto-fire**: Only one spool fires per cycle (prevents double thread deduction)
6. **Fixed UI overlap**: Bottom row tiles no longer blocked by conveyor belt
7. **3x speed default**: Game now starts at 3x speed (faster baseline difficulty)
8. **Checkpoint system**: Progress saved every 10 levels with localStorage persistence
9. **Removed layer system**: Simplified to single-layer grid (no Mahjong-style layering needed)
