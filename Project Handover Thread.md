# Project Handover: Thread Unbound (Wool Crush Clone)

## 🎯 Project Goal
The objective is to create a high-fidelity web-based clone of the mobile game **"Wool Crush"**. The game is a spatial puzzle-strategy hybrid involving grid clearing, buffer management, and survival mechanics.

### Reference for Claude:
- **Game Title:** Wool Crush (by various mobile publishers)
- **Core Loop:** Clear blocks from a grid -> Match colors in a buffer (spindles) -> Fire threads to unravel a knitted dragon -> Prevent the dragon from reaching the target (Kitty).

---

## 🏗️ Technical Stack
- **Framework:** React (TypeScript)
- **Styling:** Tailwind CSS (3D-tactile UI focus)
- **Animations:** Framer Motion (Layout transitions and spring physics)
- **Icons:** Lucide-React

---

## 🕹️ Game Mechanics & Logic (The "Wool Crush" Standard)
To achieve 1:1 fidelity, the following rules must be strictly enforced:

### 1. The Grid & Pathfinding
- **Movement:** Blocks move in the direction of their arrow only if the path to the grid boundary is clear.
- **Layering:** A Layer 1 (top) block can fly over a Layer 0 (bottom) block. However, a Layer 0 block is trapped if a Layer 1 block is directly on top of it.
- **Ghosting Issue:** Current logic suffers from floating-point errors. We need **integer-based grid snapping** (Math.round/Math.floor) to ensure blocks don't get "stuck" by invisible collisions.

### 2. The Conveyor Belt
- **Flow:** Tapping a conveyor block should **not** send it to the buffer. It must land on an **empty grid tile** first.
- **Strategy:** Players use conveyor blocks to fill holes or create paths for trapped grid blocks.

### 3. The Dragon (The Survival Mechanic)
- **Protected Head:** The Dragon Head (index 0) is permanent. It represents the "Threat". 
- **The "Pluck" Logic:** When 3 colors match in the buffer, a thread fires. It must hit the **matching color segment** in the dragon's body (anywhere from index 1 to Tail) and remove it.
- **Growth:** The dragon grows from the "Neck" (index 1), pushing the head closer to the Kitty every 10 seconds.
- **Fail State:** If the dragon reaches a certain length (e.g., 35 segments), it reaches the Kitty and the game ends.

---

## 🚩 Current Blocking Issues (For Claude to Fix First)
1. **Precision Targeting:** The thread currently doesn't always hit the specific matching color segment; it sometimes hits the tail or the wrong index.
2. **Pathfinding Bugs:** Blocks that appear clear often return `false` for `isPathClear` due to decimal precision issues in the `gameUtils.ts` coordinate checks.
3. **Head/Kitty Preservation:** The "Kitty" and "Dragon Head" sometimes disappear during the unravelling loop. They must be protected as static UI/Game entities.

---

## 📂 File Manifest
- `App.tsx`: Main game loop and state management.
- `gameUtils.ts`: Collision logic, level generation, and pathfinding.
- `DragonView.tsx`: SVG-based dragon rendering and growth logic.
- `ThreadConnection.tsx`: SVG path calculation for the "wool" strings.
- `BlockView.tsx`: The 3D tactile tile component.
