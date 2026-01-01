import React from 'react';
import { X, Volume2, VolumeX, Vibrate } from 'lucide-react';

interface SettingsProps {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onSoundToggle: () => void;
  onHapticsToggle: () => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  soundEnabled,
  hapticsEnabled,
  onSoundToggle,
  onHapticsToggle,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Options */}
        <div className="space-y-4">
          {/* Sound Toggle */}
          <SettingRow
            icon={soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            label="Sound Effects"
            description="Play sounds when interacting with blocks"
            enabled={soundEnabled}
            onToggle={onSoundToggle}
          />

          {/* Haptics Toggle */}
          <SettingRow
            icon={<Vibrate className="w-6 h-6" />}
            label="Haptic Feedback"
            description="Vibration on block placement"
            enabled={hapticsEnabled}
            onToggle={onHapticsToggle}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-4 border-t border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            Thread Unbound v1.0.0
          </p>
          <p className="text-slate-500 text-xs text-center mt-1">
            More settings coming soon!
          </p>
        </div>
      </div>
    </div>
  );
};

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  label,
  description,
  enabled,
  onToggle,
}) => {
  return (
    <div className="bg-slate-700/50 rounded-xl p-4 flex items-center gap-4">
      <div className="text-purple-400">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold">{label}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-14 h-8 rounded-full transition-colors duration-200 relative ${
          enabled ? 'bg-green-500' : 'bg-slate-600'
        }`}
      >
        <div
          className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};
