import React from 'react';
import { Play, ShoppingBag, Trophy, BarChart3, Settings, User, Coins, Gem } from 'lucide-react';
import { PlayerCurrency } from '../types';

interface StartMenuProps {
  currentLevel: number;
  currency: PlayerCurrency;
  onPlay: () => void;
  onDailyChallenge: () => void;
  onShop: () => void;
  onAchievements: () => void;
  onLeaderboards: () => void;
  onSettings: () => void;
  onProfile: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  currentLevel,
  currency,
  onPlay,
  onDailyChallenge,
  onShop,
  onAchievements,
  onLeaderboards,
  onSettings,
  onProfile,
}) => {
  // Unlock conditions based on ROADMAP.md
  const shopUnlocked = currentLevel >= 5;
  const achievementsUnlocked = currentLevel >= 10;
  const dailyChallengesUnlocked = currentLevel >= 15;
  const leaderboardsUnlocked = currentLevel >= 20;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      {/* Game Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
          Thread Unbound
        </h1>
        <p className="text-purple-200 text-sm md:text-base mb-3">
          Level {currentLevel}
        </p>

        {/* Currency Display */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-white font-bold">{currency.coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">{currency.gems.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Menu Buttons */}
      <div className="w-full max-w-md space-y-3">
        {/* Play Button - Primary */}
        <MenuButton
          icon={<Play className="w-6 h-6" />}
          label="Play"
          onClick={onPlay}
          variant="primary"
        />

        {/* Daily Challenge */}
        <MenuButton
          icon={<Trophy className="w-6 h-6" />}
          label="Daily Challenge"
          onClick={onDailyChallenge}
          locked={!dailyChallengesUnlocked}
          unlockLevel={15}
        />

        {/* Shop */}
        <MenuButton
          icon={<ShoppingBag className="w-6 h-6" />}
          label="Shop"
          onClick={onShop}
          locked={!shopUnlocked}
          unlockLevel={5}
        />

        {/* Achievements */}
        <MenuButton
          icon={<Trophy className="w-6 h-6" />}
          label="Achievements"
          onClick={onAchievements}
          locked={!achievementsUnlocked}
          unlockLevel={10}
        />

        {/* Leaderboards */}
        <MenuButton
          icon={<BarChart3 className="w-6 h-6" />}
          label="Leaderboards"
          onClick={onLeaderboards}
          locked={!leaderboardsUnlocked}
          unlockLevel={20}
        />

        {/* Settings */}
        <MenuButton
          icon={<Settings className="w-6 h-6" />}
          label="Settings"
          onClick={onSettings}
        />

        {/* Profile/Stats */}
        <MenuButton
          icon={<User className="w-6 h-6" />}
          label="Profile & Stats"
          onClick={onProfile}
        />
      </div>

      {/* Footer */}
      <div className="mt-8 text-purple-300 text-xs text-center">
        v1.0.0
      </div>
    </div>
  );
};

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'normal';
  locked?: boolean;
  unlockLevel?: number;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'normal',
  locked = false,
  unlockLevel,
}) => {
  const isPrimary = variant === 'primary';

  const baseClasses = "w-full h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg";

  const variantClasses = locked
    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
    : isPrimary
    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 active:scale-95"
    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 active:scale-95";

  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`${baseClasses} ${variantClasses}`}
    >
      {icon}
      <span>{label}</span>
      {locked && unlockLevel && (
        <span className="ml-auto mr-4 text-xs bg-slate-600 px-2 py-1 rounded">
          Lvl {unlockLevel}
        </span>
      )}
    </button>
  );
};
