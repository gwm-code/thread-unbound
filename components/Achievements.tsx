import React, { useState } from 'react';
import { X, Trophy, Lock, Star } from 'lucide-react';
import { Achievement, PlayerAchievements, PlayerStats, PlayerCurrency, AchievementCategory } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

interface AchievementsProps {
  achievements: PlayerAchievements;
  stats: PlayerStats;
  currency: PlayerCurrency;
  onClose: () => void;
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements, stats, currency, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const categories: { value: AchievementCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🏆' },
    { value: 'progression', label: 'Progression', icon: '⬆️' },
    { value: 'combat', label: 'Combat', icon: '⚔️' },
    { value: 'collection', label: 'Collection', icon: '💰' },
    { value: 'skill', label: 'Skill', icon: '🎯' },
    { value: 'hidden', label: 'Hidden', icon: '🔒' },
  ];

  // Filter achievements
  const filteredAchievements = ACHIEVEMENTS.filter(a => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  // Count unlocked achievements
  const unlockedCount = ACHIEVEMENTS.filter(a => achievements.unlocked.has(a.id)).length;
  const totalCount = ACHIEVEMENTS.length;

  // Calculate progress for an achievement
  const getProgress = (achievement: Achievement): number => {
    const progress = achievements.progress[achievement.id] || 0;
    return Math.min((progress / achievement.requirement) * 100, 100);
  };

  // Get current progress value for display
  const getCurrentProgress = (achievement: Achievement): number => {
    return achievements.progress[achievement.id] || 0;
  };

  const isUnlocked = (achievement: Achievement): boolean => {
    return achievements.unlocked.has(achievement.id);
  };

  // Should show achievement (hide hidden ones until unlocked)
  const shouldShowAchievement = (achievement: Achievement): boolean => {
    if (achievement.hidden && !isUnlocked(achievement)) {
      return false;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <div>
              <h2 className="text-3xl font-bold text-white">Achievements</h2>
              <p className="text-slate-400 text-sm mt-1">
                {unlockedCount} / {totalCount} Unlocked
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-4 border-b border-slate-700 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map(category => {
              const isSelected = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAchievements.filter(shouldShowAchievement).map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={isUnlocked(achievement)}
                progress={getProgress(achievement)}
                currentProgress={getCurrentProgress(achievement)}
              />
            ))}
          </div>

          {filteredAchievements.filter(shouldShowAchievement).length === 0 && (
            <div className="text-center py-12">
              <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No achievements to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  progress: number;
  currentProgress: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  unlocked,
  progress,
  currentProgress
}) => {
  return (
    <div
      className={`relative rounded-xl p-4 border-2 transition-all ${
        unlocked
          ? 'bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-500/40 shadow-lg'
          : achievement.comingSoon
          ? 'bg-slate-700/30 border-slate-600/30 opacity-60'
          : 'bg-slate-700/50 border-slate-600/50'
      }`}
    >
      {/* Coming Soon Badge */}
      {achievement.comingSoon && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
          COMING SOON
        </div>
      )}

      {/* Unlocked Badge */}
      {unlocked && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-slate-900 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          UNLOCKED
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        {/* Icon */}
        <div className={`text-4xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${unlocked ? 'text-yellow-300' : 'text-slate-300'}`}>
            {achievement.name}
          </h3>
          <p className={`text-sm ${unlocked ? 'text-slate-300' : 'text-slate-400'}`}>
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {!unlocked && !achievement.comingSoon && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-400">{achievement.requirementText}</span>
            <span className="text-xs text-slate-400 font-medium">
              {currentProgress} / {achievement.requirement}
            </span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirement Text (when unlocked) */}
      {unlocked && (
        <div className="mb-3">
          <span className="text-xs text-yellow-200 font-medium">✓ {achievement.requirementText}</span>
        </div>
      )}

      {/* Rewards */}
      {(achievement.rewardCoins || achievement.rewardGems) && (
        <div className="flex gap-2 text-sm">
          {achievement.rewardCoins && (
            <div className={`flex items-center gap-1 ${unlocked ? 'text-amber-300' : 'text-slate-400'}`}>
              <span>💰</span>
              <span className="font-medium">{achievement.rewardCoins}</span>
            </div>
          )}
          {achievement.rewardGems && (
            <div className={`flex items-center gap-1 ${unlocked ? 'text-cyan-300' : 'text-slate-400'}`}>
              <span>💎</span>
              <span className="font-medium">{achievement.rewardGems}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
