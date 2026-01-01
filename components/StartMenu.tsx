import React from 'react';
import { Play, ShoppingBag, Trophy, BarChart3, Settings, User } from 'lucide-react';

interface StartMenuProps {
  currentLevel: number;
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
  const achievementsUnlocked = true; // Always unlocked - players can earn achievements from level 1
  const dailyChallengesUnlocked = currentLevel >= 15;
  const leaderboardsUnlocked = currentLevel >= 20;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      {/* Game Title */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-1 drop-shadow-lg">
          Thread Unbound
        </h1>
        <p className="text-purple-200 text-sm md:text-base">
          Level {currentLevel}
        </p>
      </div>

      {/* Menu Buttons */}
      <div className="w-full max-w-md space-y-2">
        {/* Play Button - Primary */}
        <MenuButton
          icon={<Play className="w-5 h-5" />}
          label="Play"
          onClick={onPlay}
          variant="primary"
        />

        {/* Daily Challenge */}
        <MenuButton
          icon={<Trophy className="w-5 h-5" />}
          label="Daily Challenge"
          onClick={onDailyChallenge}
          locked={!dailyChallengesUnlocked}
          unlockLevel={15}
        />

        {/* Shop */}
        <MenuButton
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Shop"
          onClick={onShop}
          locked={!shopUnlocked}
          unlockLevel={5}
        />

        {/* Achievements */}
        <MenuButton
          icon={<Trophy className="w-5 h-5" />}
          label="Achievements"
          onClick={onAchievements}
        />

        {/* Leaderboards */}
        <MenuButton
          icon={<BarChart3 className="w-5 h-5" />}
          label="Leaderboards"
          onClick={onLeaderboards}
          locked={!leaderboardsUnlocked}
          unlockLevel={20}
        />

        {/* Settings */}
        <MenuButton
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
          onClick={onSettings}
        />

        {/* Profile/Stats */}
        <MenuButton
          icon={<User className="w-5 h-5" />}
          label="Profile & Stats"
          onClick={onProfile}
        />
      </div>

      {/* Footer */}
      <div className="mt-4 text-purple-300 text-xs text-center">
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

  const baseClasses = "w-full h-14 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-lg";

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
