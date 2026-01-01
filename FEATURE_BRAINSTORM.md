# Thread Unbound - Feature Brainstorming & Expansion Plan

## Current Game State Summary

**Core Strengths:**
- Solid puzzle mechanics (grid clearing, auto-fire, dragon survival)
- Progressive difficulty (5 tutorial + infinite procedural levels)
- Mobile-optimized with haptics and audio
- Clean architecture ready for expansion

**Current Gaps:**
- No meta-progression system (currency, unlocks)
- No social/competitive features
- Minimal statistics tracking
- No cosmetic customization
- Limited special tile variety
- No retention mechanics (dailies, challenges)

---

## User's Initial Ideas ✅

1. **Start Menu** - Essential for proper game flow
2. **Shop System** with "Sumo Coins" currency earned from levels
3. **Buff Tiles** on the grid
4. **Negative Effect Tiles** (hazards)
5. **Score Leaderboard** - Competitive element

These are all strong foundations. Let me expand with complementary features:

---

## 🎮 CORE GAMEPLAY ENHANCEMENTS

### 1. Special Tile Types (Beyond Buffs/Debuffs)

**Buff Tiles (Power-ups on Grid):**
- 🔥 **Fire Tile** - Auto-removes adjacent segments when activated
- ⚡ **Lightning Tile** - Chains to remove all blocks of same color
- 🎯 **Sniper Tile** - Targets specific dragon segment (player picks)
- 🌟 **Star Tile** - Acts as wildcard color (matches anything)
- 💎 **Diamond Tile** - Worth 2x thread count when fired
- 🔄 **Spin Tile** - Rotates surrounding blocks 90 degrees
- 🧲 **Magnet Tile** - Pulls nearby blocks toward it

**Negative/Hazard Tiles:**
- 💀 **Poison Tile** - Speeds up dragon growth temporarily (3x for 10 seconds)
- 🧊 **Freeze Tile** - Locks block in place for X moves (must clear adjacent to unlock)
- ⏰ **Time Bomb** - Explodes after X moves, removing nearby blocks
- 🌀 **Vortex Tile** - Changes color every 3 seconds (hard to match)
- 🔗 **Chain Tile** - Links to another chain tile (must clear both together)
- 👻 **Ghost Tile** - Invisible until you click nearby blocks
- 🎲 **Random Tile** - Changes direction randomly each turn

**Neutral Special Tiles:**
- 🔓 **Master Key** - Unlocks ALL locked blocks at once
- 🎁 **Mystery Box** - Random effect when cleared (could be good or bad)
- 🌈 **Rainbow Block** - Removes ALL segments of the color you choose
- 🔮 **Oracle Tile** - Shows next 3 conveyor blocks coming
- 🧩 **Multiplier Tile** - Doubles score for that move only

### 2. Block Modifiers (Status Effects)

**Positive Modifiers:**
- **Blessed** - Can't be affected by negative tiles
- **Charged** - Removes +2 extra segments when fired
- **Lucky** - 50% chance to refund itself back to grid
- **Shielded** - Protects adjacent blocks from hazards

**Negative Modifiers:**
- **Cursed** - Must be cleared within 5 moves or creates poison tile
- **Sticky** - Takes 2 clicks to move instead of 1
- **Brittle** - Auto-removes if dragon grows while in spool
- **Heavy** - Can only move in downward directions

### 3. Combo System & Scoring Depth

**Current:** Simple +10 per segment removed

**Enhanced Scoring:**
- **Combo Multiplier** - Chain multiple block clears within 3 seconds for 2x, 3x, 4x
- **Perfect Clear** - Clear entire grid bonus: +500
- **Speed Bonus** - Complete level under target time: +100 per second saved
- **Efficiency** - Use fewer moves than par: +50 per move saved
- **No Undo** - Complete without undo: +200
- **Thread Master** - Fire all 4 spools in single turn: +150
- **Dragon Shrink Streak** - Remove 5+ segments in one fire: +50 per segment over 5

### 4. Dragon Variants & Behaviors

**Current:** Single winding dragon with kitty mechanic

**Dragon Types (Level-Specific or Random):**
- 🐉 **Classic Dragon** - Current behavior (balanced)
- 🐍 **Speed Snake** - Grows faster but shorter max length
- 🐢 **Tank Dragon** - Grows slowly but requires more segments removed
- 👹 **Chaos Dragon** - Changes colors randomly during growth
- 🌈 **Rainbow Dragon** - Multi-colored segments (harder to match)
- 👻 **Ghost Dragon** - Invisible segments (only see first 3)
- 🔥 **Fire Dragon** - Occasionally "breathes fire" and locks random blocks
- 💎 **Crystal Dragon** - Takes double damage but awards double points

**Dynamic Dragon AI:**
- **Aggro Mode** - Dragon speeds up when player doing well
- **Retreat Mode** - Dragon slows down if player struggling (assist mode)
- **Hunger Meter** - Dragon gets faster the longer kitty stays swallowed
- **Critical State** - When near victory, dragon makes last-ditch speed burst

---

## 💰 META-PROGRESSION & ECONOMY

### 1. Currency System

**Primary: Sumo Coins** (User's idea)
- Earned: +50 per level completed
- Earned: +10 per segment removed
- Earned: Bonus for achievements
- Used: Shop purchases, continues, power-ups

**Secondary: Thread Gems** (Premium/Rare)
- Earned: Daily login rewards
- Earned: Special achievements only
- Earned: (Optional) Real money purchase
- Used: Exclusive cosmetics, premium buffs

**Tertiary: Kitty Hearts** (Affection/Progress)
- Earned: Save kitty from dragon
- Used: Unlock kitty cosmetics
- Used: Unlock special "Kitty Power" abilities

### 2. Shop System Categories

**Power-Up Shop (Consumables):**
- 🔄 Extra Undo (50 coins) - +1 undo use for current level
- ⏸️ Freeze Time (100 coins) - Stop dragon growth for 30 seconds
- 🎯 Thread Boost (75 coins) - +2 thread count to all blocks in spools
- 🌟 Color Bomb (150 coins) - Remove all blocks of chosen color from grid
- 🔓 Quick Unlock (25 coins) - Unlock all locked blocks immediately
- 💨 Conveyor Speed (50 coins) - 2x conveyor speed for easier grabbing
- 🎲 Reroll Grid (100 coins) - Regenerate entire grid (keeps score/dragon)

**Permanent Upgrades (One-Time Purchase):**
- 📈 Score Multiplier I/II/III (500/1000/2000 coins) - +10%/+25%/+50% all scores
- 🔋 Starting Undo (300 coins) - Start each level with 1 undo already available
- ⏰ Dragon Delay (800 coins) - +2 seconds to dragon growth interval
- 🎯 Thread Count Boost (1000 coins) - All blocks have +1 thread count
- 🌟 Spool Upgrade (1500 coins) - 5 spools instead of 4
- 🔮 Oracle Vision (400 coins) - Always see next 3 conveyor blocks
- 💎 Coin Magnet (600 coins) - +25% coin earnings from all sources

**Cosmetics Shop:**
- **Dragon Skins** (200-500 gems): Color variants, particle effects, eyes
- **Kitty Costumes** (150-400 gems): Hats, accessories, expressions
- **Block Themes** (300 gems): Neon, Wood, Metal, Candy, Space
- **Grid Backgrounds** (100-250 gems): Different patterns and colors
- **Thread Styles** (150 gems): Rainbow threads, glowing, particle trails
- **UI Themes** (400 gems): Dark mode, pastel, cyberpunk, retro

### 3. Progression Systems

**Level-Based Unlocks:**
- Level 5: Unlock Shop
- Level 10: Unlock Achievements
- Level 15: Unlock Daily Challenges
- Level 20: Unlock Leaderboards
- Level 25: Unlock Prestige System
- Level 50: Unlock Hard Mode
- Level 100: Unlock Endless Mode

**Prestige System (Level 100+):**
- Reset to Level 1 but keep cosmetics and gems
- Earn "Prestige Stars" (displayed on profile)
- Each prestige: +5% permanent score bonus
- Unlock exclusive prestige-only cosmetics
- Prestige leaderboard separate from main

---

## 📊 ENGAGEMENT & RETENTION

### 1. Daily/Weekly Challenges

**Daily Challenges (Resets 24h):**
- "Clear 50 blocks today" → 100 coins
- "Complete 3 levels without undo" → 150 coins + 5 gems
- "Remove 100 dragon segments" → 200 coins
- "Use conveyor belt 20 times" → 75 coins
- "Achieve 3 perfect clears" → 50 gems

**Weekly Challenges (Resets Monday):**
- "Reach Level X" → 500 coins + 25 gems
- "Complete 25 levels total" → 1000 coins
- "Earn 10,000 score in single level" → 50 gems
- "Use each special tile once" → 100 gems
- "Save kitty 10 times" → 200 coins + 20 gems

**Event Challenges (Limited Time):**
- Special themed levels (Halloween, Christmas, etc.)
- Unique dragon variants only available during event
- Exclusive cosmetic rewards
- Event-specific currency/tokens

### 2. Achievement System

**Categories & Examples:**

**Progression:**
- 🏆 Beginner (Reach Level 5)
- 🥇 Intermediate (Reach Level 25)
- 👑 Expert (Reach Level 50)
- 💎 Master (Reach Level 100)
- 🌟 Legend (Prestige once)

**Combat:**
- 🐉 Dragon Slayer (Remove 1,000 segments total)
- 🎯 Sharpshooter (Remove 100 segments with 10-count blocks)
- ⚡ Speed Demon (Remove 20+ segments in single turn)
- 🔥 Combo Master (Achieve 5x combo)

**Collection:**
- 🎨 Fashionista (Unlock 10 cosmetics)
- 🎁 Collector (Open 50 mystery boxes)
- 💰 Coin Hoarder (Have 5,000 coins at once)
- 💎 Gem Enthusiast (Spend 500 gems)

**Skill:**
- 🎯 Perfectionist (10 perfect clears)
- 🚫 No Mistakes (Complete 5 levels without undo)
- ⏱️ Speedrunner (Complete level in under 60 seconds)
- 🧠 Strategist (Complete level using <10 moves)

**Hidden/Secret:**
- 🐱 Kitty Guardian (Never let kitty reach tail 100 times)
- 🌈 Rainbow Warrior (Clear all 5 colors in single turn)
- 👻 Ghost Clearer (Clear 5 ghost tiles)
- 🔮 Oracle (Use Oracle tile 50 times)

### 3. Social & Competitive Features

**Leaderboards (Multiple Types):**
- **Global All-Time** - Lifetime score across all levels
- **Weekly** - Score earned this week only (resets)
- **Friends** - Compare with friends (if social login)
- **Level-Specific** - Best score on each individual level
- **Speedrun** - Fastest completion time per level
- **Prestige** - Highest prestige level reached

**Social Integration:**
- Share score on social media
- Challenge friend to beat your score
- Co-op mode: Take turns on same level
- Async multiplayer: Both play same daily level, compare scores
- Clan/Guild system: Contribute to weekly team goals

**Spectator Mode:**
- Watch replays of top players
- Learn strategies from leaderboard players
- AI analysis of your plays vs. top 1%

### 4. Daily Login Rewards

**Consecutive Day Bonuses:**
- Day 1: 50 coins
- Day 2: 75 coins
- Day 3: 100 coins + 5 gems
- Day 4: 125 coins
- Day 5: 150 coins + 10 gems
- Day 6: 200 coins
- Day 7: 500 coins + 25 gems + Rare Cosmetic Box

**Monthly Login Milestone:**
- 30 days: Exclusive "Veteran" title + 100 gems

---

## 🎯 GAME MODES & VARIANTS

### 1. Alternative Game Modes

**Endless Mode:**
- No level progression, just survive as long as possible
- Dragon continuously grows, never stops
- Leaderboard for longest survival time
- Escalating difficulty (conveyor speeds up, special tiles appear)

**Time Attack:**
- Complete level before timer runs out
- Bonus points for remaining time
- Faster gameplay, more frantic
- Daily time attack leaderboard

**Puzzle Mode:**
- Pre-set scenarios with specific solution
- No randomness, pure skill
- 3-star rating system (moves used)
- Community-created puzzles (user submissions)

**Zen Mode:**
- No timer, no pressure
- Practice mode with unlimited undos
- No score tracking
- Relaxing background music
- Tutorial/learning environment

**Hard Mode (Unlocked at Level 50):**
- All negative tiles appear more frequently
- Dragon grows 2x faster
- Only 3 spools instead of 4
- No undo available
- Double coin rewards

**Kitty Rescue Mode:**
- Special levels focused on saving kitty
- Kitty starts already swallowed
- Race against time to remove enough segments
- Unique rewards for kitty-themed levels

### 2. Special Event Modes

**Weekend Tournament:**
- Friday-Sunday only
- Special ruleset each week
- Entry fee: 100 coins
- Top 10% get gems + exclusive cosmetics
- Bracket-style elimination or points-based

**Boss Battles:**
- Special ultra-long dragons with phases
- Each phase has different behavior
- Requires coordination of power-ups
- Epic rewards for completion
- Monthly boss rotation

---

## 🎨 PRESENTATION & POLISH

### 1. Menu System

**Start Menu:**
- Play (enters level select/checkpoint)
- Daily Challenge (highlighted if available)
- Shop
- Achievements
- Leaderboards
- Settings
- Profile/Stats

**Settings Menu:**
- Audio volume sliders (SFX, Music)
- Haptics on/off
- Visual effects quality (high/med/low)
- Color blind mode
- Tutorial replay
- Language selection
- Data reset/account management

**Profile/Stats Page:**
- Total play time
- Levels completed
- Total segments removed
- Total coins earned
- Achievement progress (X/100)
- Win rate percentage
- Average score per level
- Highest combo achieved
- Prestige level + stars

### 2. Onboarding & Tutorials

**Enhanced Tutorial Flow:**
- Interactive step-by-step guide (not just text)
- Highlight specific elements (arrows, pulses)
- Forced actions ("Tap this block to continue")
- Gradual mechanic introduction:
  - Tutorial 1: Basic movement
  - Tutorial 2: Spools and auto-fire
  - Tutorial 3: Conveyor belt
  - Tutorial 4: Special tiles
  - Tutorial 5: Key/lock mechanics

**In-Game Tips:**
- Contextual hints when stuck (after 30 seconds no move)
- "Did you know?" popups between levels
- Loading screen tips
- Optional hint system (costs 10 coins per hint)

### 3. Visual & Audio Enhancements

**Particle Effects:**
- Sparkles on tile clear
- Explosion on dragon segment removal
- Trail effects on moving blocks
- Glow effects on special tiles
- Confetti on level complete

**Animation Polish:**
- Block squish/bounce on placement
- Dragon wiggle when segment removed
- Kitty scared expression when dragon grows
- Spool fill-up animation
- Conveyor belt rhythm pulses

**Audio Depth:**
- Background music (toggleable)
- Unique sounds per tile type
- Satisfying "pop" variations
- Dragon roar on growth
- Kitty meow on save
- Level complete fanfare
- Combo counter voice ("Double!", "Triple!")

---

## 💸 MONETIZATION OPPORTUNITIES

*(If you want to consider revenue)*

### 1. Ad Integration (Optional)

**Rewarded Ads:**
- Watch ad → Get 50 coins
- Watch ad → Continue failed level (instead of restart)
- Watch ad → 2x coins for next level
- Watch ad → Free power-up

**Banner Ads:**
- Non-intrusive bottom banner on menu screens
- Removable with "No Ads" purchase

### 2. IAP (In-App Purchases)

**Currency Packs:**
- Small: 500 coins ($0.99)
- Medium: 1,200 coins ($1.99)
- Large: 3,000 coins ($4.99)
- Mega: 7,500 coins + 50 gems ($9.99)

**Premium Pass ($4.99/month):**
- 2x coin earnings
- Exclusive cosmetics each month
- No ads
- +1 extra spool permanently
- Early access to new features

**One-Time Purchases:**
- Remove Ads Forever ($2.99)
- Starter Pack (1,000 coins + 100 gems + cosmetic) ($4.99)
- Premium Cosmetic Bundle ($9.99)

### 3. Battle Pass System

**Free Track:**
- Basic rewards at milestones (every 5 levels)
- Coins and small gem amounts
- Common cosmetics

**Premium Track ($4.99/season):**
- 10x more generous rewards
- Exclusive cosmetics (limited time)
- 500 gems total across track
- Unique titles and badges
- Instant unlock of 5 levels of rewards

---

## 🔧 QUALITY OF LIFE IMPROVEMENTS

### 1. Accessibility Features

- **Color Blind Mode:** Different patterns/symbols per color
- **High Contrast Mode:** Bold outlines and brightness
- **Large Text Option:** For readability
- **Reduce Motion:** Disable particle effects
- **Audio Cues:** Sound indicators for color blind players
- **Touch Assist:** Larger hit boxes, hold-to-confirm

### 2. UX Improvements

- **Block Preview:** Show where block will go before clicking
- **Path Indicator:** Visual line showing block's escape route
- **Spool Fullness:** Clear indication when spool is occupied
- **Undo Preview:** Show what state you'll return to
- **Danger Alert:** Warning when dragon is close to kitty
- **Auto-Save:** Never lose progress mid-level
- **Resume Level:** Return to exact state if app closed

### 3. Advanced Features

- **Replay System:** Save and replay your best games
- **Strategy Planner:** Pause and plan out next 5 moves
- **Move Counter:** Show how many moves you've made
- **Par System:** Show optimal move count for each level
- **Ghost Mode:** See AI's suggested move (costs coins)
- **Level Editor:** Create and share custom levels (community feature)

---

## 🚀 PRIORITY RECOMMENDATIONS

### Phase 1 (Core Foundation) - Highest Impact
1. **Start Menu** - Essential entry point
2. **Shop System with Sumo Coins** - Meta-progression hook
3. **Basic Statistics Tracking** - Profile page with stats
4. **Achievement System (20-30 achievements)** - Engagement driver
5. **Score Leaderboard (Global + Weekly)** - Competitive element

### Phase 2 (Gameplay Depth) - Medium Priority
6. **Buff/Debuff Tiles (5 of each)** - Adds variety
7. **Combo Scoring System** - Skill expression
8. **Daily Challenges** - Daily retention
9. **Settings Menu** - QoL baseline
10. **Enhanced Tutorial** - Better onboarding

### Phase 3 (Long-term Engagement) - Future Growth
11. **Prestige System** - Endgame content
12. **Alternative Game Modes** - Content variety
13. **Social Features** - Viral potential
14. **Cosmetics Shop** - Revenue + expression
15. **Event System** - Live ops cadence

---

## 🎮 FEATURE SYNERGIES TO CONSIDER

**Strong Synergies:**
- Shop + Currency + Daily Challenges = Retention loop
- Achievements + Leaderboards + Statistics = Engagement triad
- Buff tiles + Power-ups + Hard mode = Difficulty curve management
- Cosmetics + Prestige + Social = Status/bragging rights
- Events + Boss Battles + Leaderboards = Community moments

**Avoid Over-Complexity:**
- Don't add all 30 special tiles at once (start with 5-8)
- Don't add 4 currencies (stick to 1-2)
- Don't launch 6 game modes simultaneously (roll out 1-2)
- Iterate based on player feedback

---

## 📝 FINAL THOUGHTS

Thread Unbound has **excellent bones** for a successful puzzle game. The mechanics are solid, mobile optimization is great, and the foundation is clean.

**The gaps are primarily in:**
1. **Meta-progression** (no reason to keep playing beyond levels)
2. **Social/competitive** (no way to compare or compete)
3. **Variety** (limited special mechanics beyond core loop)
4. **Retention** (no daily hooks or rewards)

Your instincts about needing a **shop, currency, special tiles, and leaderboards** are spot-on. These address the core gaps.

**My top additional recommendations:**
- **Achievements** (easy to implement, huge engagement boost)
- **Daily challenges** (proven retention mechanic)
- **Statistics tracking** (players love seeing their progress)
- **Combo system** (adds skill expression to scoring)
- **Enhanced tutorial** (better onboarding = better retention)

The game has strong potential for a premium mobile release or web monetization through ads + IAP. The core loop is addictive enough to support either model.

---

## NEXT STEPS

Once you decide which features to prioritize, I can help create detailed implementation plans for each system. We'd want to:

1. Define exact specifications (currency amounts, shop prices, achievement criteria)
2. Design database/storage schema (localStorage, cloud saves)
3. Create UI mockups (menu flows, new screens)
4. Plan technical architecture (new components, state management)
5. Implement incrementally with testing

Let me know which direction excites you most and we can dive deeper!
