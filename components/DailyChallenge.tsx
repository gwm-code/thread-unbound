import React from 'react';
import { X, Calendar, Trophy, Flame } from 'lucide-react';
import { PlayerChallenges, PlayerStats, PlayerCurrency } from '../types';
import { DAILY_CHALLENGES, WEEKLY_CHALLENGES, LOGIN_REWARDS } from '../data/challenges';

interface DailyChallengeProps {
  challenges: PlayerChallenges;
  stats: PlayerStats;
  currency: PlayerCurrency;
  onClose: () => void;
  onClaimReward: (challengeId: string) => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  challenges,
  stats,
  currency,
  onClose,
  onClaimReward
}) => {
  // Calculate progress for each challenge
  const getDailyProgress = (challengeId: string): number => {
    return challenges.dailyProgress[challengeId] || 0;
  };

  const getWeeklyProgress = (challengeId: string): number => {
    return challenges.weeklyProgress[challengeId] || 0;
  };

  const isDailyComplete = (challengeId: string): boolean => {
    return challenges.dailyCompleted.has(challengeId);
  };

  const isWeeklyComplete = (challengeId: string): boolean => {
    return challenges.weeklyCompleted.has(challengeId);
  };

  // Time until daily reset (midnight)
  const getTimeUntilDailyReset = (): string => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  // Time until weekly reset (Monday)
  const getTimeUntilWeeklyReset = (): string => {
    const now = new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);

    const diff = nextMonday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Daily Challenges</h1>
          <p className="text-purple-200">Complete challenges to earn rewards!</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-95"
        >
          <X size={24} className="text-white" />
        </button>
      </div>

      {/* Currency Display */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
          <span className="text-2xl">💰</span>
          <span className="text-white font-bold">{currency.coins.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
          <span className="text-2xl">💎</span>
          <span className="text-white font-bold">{currency.gems.toLocaleString()}</span>
        </div>
      </div>

      {/* Daily Login Streak */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-400/50 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame size={32} className="text-orange-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Login Streak</h2>
            <p className="text-orange-200">Login daily to earn rewards!</p>
          </div>
        </div>

        {/* Streak Progress */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {LOGIN_REWARDS.map((reward) => {
            const isCompleted = challenges.loginStreak >= reward.day;
            const isCurrent = challenges.loginStreak === reward.day - 1;

            return (
              <div
                key={reward.day}
                className={`relative rounded-xl p-3 text-center transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 scale-105'
                    : isCurrent
                    ? 'bg-gradient-to-br from-orange-400 to-red-500 animate-pulse'
                    : 'bg-white/10'
                }`}
              >
                <div className="text-xs font-bold text-white mb-1">Day {reward.day}</div>
                {isCompleted && (
                  <div className="text-lg">✓</div>
                )}
                {!isCompleted && (
                  <>
                    {reward.coins > 0 && (
                      <div className="text-xs text-white/80">{reward.coins} 💰</div>
                    )}
                    {reward.gems > 0 && (
                      <div className="text-xs text-white/80">{reward.gems} 💎</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center text-white font-bold">
          Current Streak: {challenges.loginStreak} days 🔥
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Challenges */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={24} className="text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Daily</h2>
            </div>
            <div className="text-blue-300 text-sm">Resets in {getTimeUntilDailyReset()}</div>
          </div>

          <div className="space-y-3">
            {DAILY_CHALLENGES.map((challenge) => {
              const progress = getDailyProgress(challenge.id);
              const isComplete = isDailyComplete(challenge.id);
              const percentage = Math.min((progress / challenge.requirement) * 100, 100);

              return (
                <div
                  key={challenge.id}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 transition-all ${
                    isComplete
                      ? 'border-green-400 bg-green-500/20'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{challenge.icon}</div>
                      <div>
                        <h3 className="font-bold text-white">{challenge.name}</h3>
                        <p className="text-sm text-white/70">{challenge.description}</p>
                      </div>
                    </div>
                    {isComplete && (
                      <div className="text-2xl">✓</div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-black/30 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-white/80">
                      {progress} / {challenge.requirement}
                    </div>
                    <div className="flex gap-2">
                      {challenge.rewardCoins && (
                        <span className="text-yellow-300">+{challenge.rewardCoins} 💰</span>
                      )}
                      {challenge.rewardGems && (
                        <span className="text-cyan-300">+{challenge.rewardGems} 💎</span>
                      )}
                    </div>
                  </div>

                  {isComplete && (
                    <button
                      onClick={() => onClaimReward(challenge.id)}
                      className="w-full mt-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all"
                    >
                      Claim Reward
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Challenges */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={24} className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Weekly</h2>
            </div>
            <div className="text-purple-300 text-sm">Resets in {getTimeUntilWeeklyReset()}</div>
          </div>

          <div className="space-y-3">
            {WEEKLY_CHALLENGES.map((challenge) => {
              const progress = getWeeklyProgress(challenge.id);
              const isComplete = isWeeklyComplete(challenge.id);
              const percentage = Math.min((progress / challenge.requirement) * 100, 100);

              return (
                <div
                  key={challenge.id}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 transition-all ${
                    isComplete
                      ? 'border-green-400 bg-green-500/20'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{challenge.icon}</div>
                      <div>
                        <h3 className="font-bold text-white">{challenge.name}</h3>
                        <p className="text-sm text-white/70">{challenge.description}</p>
                      </div>
                    </div>
                    {isComplete && (
                      <div className="text-2xl">✓</div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-black/30 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-white/80">
                      {progress} / {challenge.requirement}
                    </div>
                    <div className="flex gap-2">
                      {challenge.rewardCoins && (
                        <span className="text-yellow-300">+{challenge.rewardCoins} 💰</span>
                      )}
                      {challenge.rewardGems && (
                        <span className="text-cyan-300">+{challenge.rewardGems} 💎</span>
                      )}
                    </div>
                  </div>

                  {isComplete && (
                    <button
                      onClick={() => onClaimReward(challenge.id)}
                      className="w-full mt-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all"
                    >
                      Claim Reward
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
