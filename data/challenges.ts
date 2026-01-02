import { Challenge } from '../types';

// Daily Challenges (reset every 24 hours)
export const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'daily-segments',
    type: 'daily',
    name: 'Segment Slayer',
    description: 'Remove 100 dragon segments',
    icon: '🐉',
    requirement: 100,
    rewardCoins: 200,
    progressKey: 'totalSegmentsRemoved',
  },
  {
    id: 'daily-levels',
    type: 'daily',
    name: 'Level Master',
    description: 'Complete 3 levels',
    icon: '🎯',
    requirement: 3,
    rewardCoins: 150,
    rewardGems: 5,
    progressKey: 'levelsCompleted',
  },
  {
    id: 'daily-no-undo',
    type: 'daily',
    name: 'Flawless Play',
    description: 'Complete 2 levels without undo',
    icon: '🚫',
    requirement: 2,
    rewardCoins: 150,
    rewardGems: 5,
    progressKey: 'noUndoCompletions',
  },
  {
    id: 'daily-perfect-clears',
    type: 'daily',
    name: 'Perfectionist',
    description: 'Achieve 3 perfect clears',
    icon: '✨',
    requirement: 3,
    rewardGems: 10,
    progressKey: 'perfectClears',
  },
  {
    id: 'daily-score',
    type: 'daily',
    name: 'High Scorer',
    description: 'Earn 5,000 points in total',
    icon: '💯',
    requirement: 5000,
    rewardCoins: 100,
    progressKey: 'totalSegmentsRemoved', // Using this as proxy for score
  },
];

// Weekly Challenges (reset every Monday)
export const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'weekly-levels',
    type: 'weekly',
    name: 'Weekly Grind',
    description: 'Complete 25 levels this week',
    icon: '🏆',
    requirement: 25,
    rewardCoins: 1000,
    progressKey: 'levelsCompleted',
  },
  {
    id: 'weekly-segments',
    type: 'weekly',
    name: 'Dragon Destroyer',
    description: 'Remove 500 segments this week',
    icon: '🔥',
    requirement: 500,
    rewardCoins: 500,
    rewardGems: 50,
    progressKey: 'totalSegmentsRemoved',
  },
  {
    id: 'weekly-combo',
    type: 'weekly',
    name: 'Combo King',
    description: 'Achieve a 5x combo',
    icon: '⚡',
    requirement: 5,
    rewardGems: 100,
    progressKey: 'maxComboReached',
  },
  {
    id: 'weekly-streak',
    type: 'weekly',
    name: 'Dedication',
    description: 'Login 7 days in a row',
    icon: '📅',
    requirement: 7,
    rewardCoins: 500,
    rewardGems: 20,
    progressKey: 'levelsCompleted', // Will use loginStreak instead
  },
];

// Daily Login Rewards (7-day streak)
export const LOGIN_REWARDS = [
  { day: 1, coins: 50, gems: 0 },
  { day: 2, coins: 75, gems: 0 },
  { day: 3, coins: 100, gems: 5 },
  { day: 4, coins: 125, gems: 0 },
  { day: 5, coins: 150, gems: 10 },
  { day: 6, coins: 200, gems: 0 },
  { day: 7, coins: 500, gems: 25 }, // Big reward on day 7
];
