import React from 'react';
import { X, User, Clock, Trophy, Coins, Gem, Zap, Heart } from 'lucide-react';
import { PlayerStats, PlayerCurrency } from '../types';

interface ProfileProps {
  stats: PlayerStats;
  currency: PlayerCurrency;
  onClose: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ stats, currency, onClose }) => {
  // Calculate derived stats
  const winRate = stats.levelsAttempted > 0
    ? ((stats.levelsCompleted / stats.levelsAttempted) * 100).toFixed(1)
    : '0.0';

  const avgCoinsPerLevel = stats.levelsCompleted > 0
    ? Math.floor(stats.totalCoinsEarned / stats.levelsCompleted)
    : 0;

  const avgSegmentsPerLevel = stats.levelsCompleted > 0
    ? Math.floor(stats.totalSegmentsRemoved / stats.levelsCompleted)
    : 0;

  // Format play time
  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <User className="w-7 h-7 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">Player Profile</h2>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Current Currency */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-3">Current Balance</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={<Coins className="w-6 h-6 text-amber-400" />}
                label="Sumo Coins"
                value={currency.coins.toLocaleString()}
                color="amber"
              />
              <StatCard
                icon={<Gem className="w-6 h-6 text-cyan-400" />}
                label="Thread Gems"
                value={currency.gems.toLocaleString()}
                color="cyan"
              />
            </div>
          </div>

          {/* Lifetime Stats */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-3">Lifetime Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={<Clock className="w-6 h-6 text-blue-400" />}
                label="Total Play Time"
                value={formatPlayTime(stats.totalPlayTimeSeconds)}
                color="blue"
              />
              <StatCard
                icon={<Trophy className="w-6 h-6 text-yellow-400" />}
                label="Levels Completed"
                value={stats.levelsCompleted.toLocaleString()}
                color="yellow"
              />
              <StatCard
                icon={<Coins className="w-6 h-6 text-amber-400" />}
                label="Total Coins Earned"
                value={stats.totalCoinsEarned.toLocaleString()}
                color="amber"
              />
              <StatCard
                icon={<Gem className="w-6 h-6 text-cyan-400" />}
                label="Total Gems Earned"
                value={stats.totalGemsEarned.toLocaleString()}
                color="cyan"
              />
              <StatCard
                icon={<Zap className="w-6 h-6 text-purple-400" />}
                label="Segments Removed"
                value={stats.totalSegmentsRemoved.toLocaleString()}
                color="purple"
              />
              <StatCard
                icon={<Heart className="w-6 h-6 text-pink-400" />}
                label="Kitties Rescued"
                value={stats.kittiesRescued.toLocaleString()}
                color="pink"
              />
            </div>
          </div>

          {/* Derived Stats */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={<Trophy className="w-6 h-6 text-green-400" />}
                label="Win Rate"
                value={`${winRate}%`}
                subtitle={`${stats.levelsCompleted} / ${stats.levelsAttempted} levels`}
                color="green"
              />
              <StatCard
                icon={<Coins className="w-6 h-6 text-amber-400" />}
                label="Avg Coins/Level"
                value={avgCoinsPerLevel.toLocaleString()}
                color="amber"
              />
              <StatCard
                icon={<Zap className="w-6 h-6 text-purple-400" />}
                label="Avg Segments/Level"
                value={avgSegmentsPerLevel.toLocaleString()}
                color="purple"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color: 'amber' | 'cyan' | 'blue' | 'yellow' | 'purple' | 'pink' | 'green';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtitle, color }) => {
  const colorClasses = {
    amber: 'border-amber-500/30 bg-amber-900/10',
    cyan: 'border-cyan-500/30 bg-cyan-900/10',
    blue: 'border-blue-500/30 bg-blue-900/10',
    yellow: 'border-yellow-500/30 bg-yellow-900/10',
    purple: 'border-purple-500/30 bg-purple-900/10',
    pink: 'border-pink-500/30 bg-pink-900/10',
    green: 'border-green-500/30 bg-green-900/10',
  };

  return (
    <div className={`bg-slate-700/50 rounded-xl p-4 border-2 transition-all ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h4 className="text-slate-300 text-sm font-medium">{label}</h4>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtitle && <div className="text-slate-400 text-xs mt-1">{subtitle}</div>}
    </div>
  );
};
