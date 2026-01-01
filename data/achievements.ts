import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  // ===== PROGRESSION =====
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Complete your first 5 levels',
    icon: '🏆',
    category: 'progression',
    requirement: 5,
    requirementText: 'Reach Level 5',
    rewardCoins: 100,
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'You\'re getting good at this!',
    icon: '🥇',
    category: 'progression',
    requirement: 25,
    requirementText: 'Reach Level 25',
    rewardCoins: 500,
    rewardGems: 10,
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'True mastery of the threads',
    icon: '👑',
    category: 'progression',
    requirement: 50,
    requirementText: 'Reach Level 50',
    rewardCoins: 1000,
    rewardGems: 25,
  },
  {
    id: 'master',
    name: 'Master',
    description: 'You\'ve conquered 100 levels!',
    icon: '💎',
    category: 'progression',
    requirement: 100,
    requirementText: 'Reach Level 100',
    rewardCoins: 2000,
    rewardGems: 50,
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Reached prestige status',
    icon: '🌟',
    category: 'progression',
    requirement: 1,
    requirementText: 'Prestige once',
    rewardGems: 100,
    comingSoon: true, // Prestige system not yet implemented
  },

  // ===== COMBAT =====
  {
    id: 'dragon-slayer',
    name: 'Dragon Slayer',
    description: 'Remove 1,000 dragon segments total',
    icon: '🐉',
    category: 'combat',
    requirement: 1000,
    requirementText: 'Remove 1,000 segments',
    rewardCoins: 500,
    rewardGems: 20,
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Remove 100 segments with 10-count blocks',
    icon: '🎯',
    category: 'combat',
    requirement: 100,
    requirementText: 'Use 10-count blocks effectively',
    rewardCoins: 300,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Remove 20+ segments in a single turn',
    icon: '⚡',
    category: 'combat',
    requirement: 20,
    requirementText: 'Remove 20+ segments at once',
    rewardCoins: 400,
    rewardGems: 15,
  },
  {
    id: 'combo-master',
    name: 'Combo Master',
    description: 'Achieve a 4x combo multiplier',
    icon: '🔥',
    category: 'combat',
    requirement: 4,
    requirementText: 'Reach 4x combo',
    rewardCoins: 250,
  },

  // ===== COLLECTION =====
  {
    id: 'fashionista',
    name: 'Fashionista',
    description: 'Unlock 10 cosmetic items',
    icon: '🎨',
    category: 'collection',
    requirement: 10,
    requirementText: 'Collect 10 cosmetics',
    rewardGems: 50,
    comingSoon: true, // Cosmetics not yet implemented
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Open 50 mystery boxes',
    icon: '🎁',
    category: 'collection',
    requirement: 50,
    requirementText: 'Open 50 mystery boxes',
    rewardCoins: 1000,
    comingSoon: true, // Mystery boxes not yet implemented
  },
  {
    id: 'coin-hoarder',
    name: 'Coin Hoarder',
    description: 'Accumulate 5,000 coins at once',
    icon: '💰',
    category: 'collection',
    requirement: 5000,
    requirementText: 'Have 5,000 coins',
    rewardGems: 25,
  },
  {
    id: 'gem-enthusiast',
    name: 'Gem Enthusiast',
    description: 'Spend 500 gems in the shop',
    icon: '💎',
    category: 'collection',
    requirement: 500,
    requirementText: 'Spend 500 gems',
    rewardCoins: 1000,
  },

  // ===== SKILL =====
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Clear the entire grid 10 times',
    icon: '🎯',
    category: 'skill',
    requirement: 10,
    requirementText: 'Achieve 10 perfect clears',
    rewardCoins: 500,
    rewardGems: 15,
  },
  {
    id: 'no-mistakes',
    name: 'No Mistakes',
    description: 'Complete 5 levels without using undo',
    icon: '🚫',
    category: 'skill',
    requirement: 5,
    requirementText: 'Complete 5 levels without undo',
    rewardCoins: 300,
  },
  {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Complete a level in under 60 seconds',
    icon: '⏱️',
    category: 'skill',
    requirement: 60,
    requirementText: 'Finish in under 60 seconds',
    rewardCoins: 400,
    rewardGems: 10,
  },
  {
    id: 'strategist',
    name: 'Strategist',
    description: 'Complete a level using fewer than 10 moves',
    icon: '🧠',
    category: 'skill',
    requirement: 10,
    requirementText: 'Win with <10 moves',
    rewardCoins: 350,
  },

  // ===== HIDDEN/SECRET =====
  {
    id: 'kitty-guardian',
    name: 'Kitty Guardian',
    description: 'Save the kitty 100 times',
    icon: '🐱',
    category: 'hidden',
    requirement: 100,
    requirementText: 'Rescue kitty 100 times',
    rewardCoins: 1000,
    rewardGems: 50,
    hidden: true,
  },
  {
    id: 'rainbow-warrior',
    name: 'Rainbow Warrior',
    description: 'Clear all 5 block colors in a single turn',
    icon: '🌈',
    category: 'hidden',
    requirement: 1,
    requirementText: 'Clear all colors at once',
    rewardGems: 25,
    hidden: true,
  },
  {
    id: 'ghost-clearer',
    name: 'Ghost Clearer',
    description: 'Clear 5 ghost tiles',
    icon: '👻',
    category: 'hidden',
    requirement: 5,
    requirementText: 'Clear 5 ghost tiles',
    rewardCoins: 500,
    hidden: true,
    comingSoon: true, // Ghost tiles not yet implemented
  },
  {
    id: 'oracle',
    name: 'Oracle',
    description: 'Use the Oracle tile 50 times',
    icon: '🔮',
    category: 'hidden',
    requirement: 50,
    requirementText: 'Use Oracle tile 50 times',
    rewardCoins: 750,
    hidden: true,
    comingSoon: true, // Oracle tile not yet implemented
  },
];

// Helper to get achievement by ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

// Helper to get achievements by category
export const getAchievementsByCategory = (category: string): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

// Helper to get all unlockable achievements (not coming soon)
export const getActiveAchievements = (): Achievement[] => {
  return ACHIEVEMENTS.filter(a => !a.comingSoon);
};
