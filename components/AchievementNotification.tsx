import React, { useEffect, useState } from 'react';
import { Trophy, Coins, Gem } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for slide-out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      }`}
      onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }}
    >
      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-2xl p-4 min-w-[320px] max-w-[400px] border-2 border-yellow-300 cursor-pointer hover:scale-105 transition-transform">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-yellow-900 fill-current" />
          <span className="text-yellow-900 font-bold text-sm uppercase tracking-wide">
            Achievement Unlocked!
          </span>
        </div>

        {/* Achievement Info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-4xl flex-shrink-0">{achievement.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900">{achievement.name}</h3>
            <p className="text-sm text-slate-800">{achievement.description}</p>
          </div>
        </div>

        {/* Rewards */}
        {(achievement.rewardCoins || achievement.rewardGems) && (
          <div className="flex gap-3 pt-2 border-t border-yellow-400/50">
            {achievement.rewardCoins && (
              <div className="flex items-center gap-1.5 text-slate-900">
                <Coins className="w-4 h-4" />
                <span className="font-bold text-sm">+{achievement.rewardCoins}</span>
              </div>
            )}
            {achievement.rewardGems && (
              <div className="flex items-center gap-1.5 text-slate-900">
                <Gem className="w-4 h-4" />
                <span className="font-bold text-sm">+{achievement.rewardGems}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface AchievementNotificationContainerProps {
  achievementIds: string[];
  achievements: Achievement[];
  onDismiss: (id: string) => void;
}

export const AchievementNotificationContainer: React.FC<AchievementNotificationContainerProps> = ({
  achievementIds,
  achievements,
  onDismiss
}) => {
  // Show one notification at a time with slight delay between them
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < achievementIds.length) {
      // Current notification will auto-dismiss after 5 seconds
      // Then show the next one after a brief delay
      const timer = setTimeout(() => {
        onDismiss(achievementIds[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 5300); // 5s display + 300ms animation

      return () => clearTimeout(timer);
    }
  }, [currentIndex, achievementIds, onDismiss]);

  if (currentIndex >= achievementIds.length) {
    return null;
  }

  const currentAchievementId = achievementIds[currentIndex];
  const achievement = achievements.find(a => a.id === currentAchievementId);

  if (!achievement) {
    return null;
  }

  return (
    <AchievementNotification
      achievement={achievement}
      onClose={() => {
        onDismiss(currentAchievementId);
        setCurrentIndex(prev => prev + 1);
      }}
    />
  );
};
