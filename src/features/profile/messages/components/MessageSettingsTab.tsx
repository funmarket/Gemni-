import React from 'react';
import { Sliders, Shield } from 'lucide-react';

interface MessageSettingsTabProps {
  onlyFromFollowing: boolean;
  setOnlyFromFollowing: (val: boolean) => void;
  minVibeScore: number;
  setMinVibeScore: (val: number) => void;
  settingsSaved: boolean;
  onSave: () => void;
}

export const MessageSettingsTab: React.FC<MessageSettingsTabProps> = ({
  onlyFromFollowing,
  setOnlyFromFollowing,
  minVibeScore,
  setMinVibeScore,
  settingsSaved,
  onSave,
}) => {
  return (
    <div className="space-y-5 bg-zinc-900/20 p-4 rounded-2xl border border-white/5">
      <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 pb-2.5 border-b border-white/5">
        <Sliders className="w-4 h-4 text-purple-400" /> Privacy Protocols
      </h4>

      {/* Checkbox Preference */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="space-y-0.5 flex-1 pr-3">
          <span className="text-xs font-extrabold text-white uppercase tracking-tight block">
            Restrict Intake
          </span>
          <p className="text-[9px] text-zinc-500 leading-relaxed font-sans">
            Only allow direct messages from voyagers in your active following list.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={onlyFromFollowing} 
            onChange={() => setOnlyFromFollowing(!onlyFromFollowing)}
            className="sr-only peer" 
          />
          <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500 peer-checked:after:bg-white" />
        </label>
      </div>

      {/* Slider Preference */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-extrabold text-white uppercase tracking-tight">
            Min Vibe Filter
          </span>
          <span className="font-mono font-bold text-xs text-purple-400">
            {minVibeScore}% VQ
          </span>
        </div>
        <p className="text-[9px] text-zinc-500 leading-normal font-sans">
          Filter incoming signals below threshold of local Vibe alignment index.
        </p>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-600">0%</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={minVibeScore}
            onChange={(e) => setMinVibeScore(parseInt(e.target.value, 10))}
            className="flex-1 accent-purple-500 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none"
          />
          <span className="text-[10px] font-mono text-zinc-600">100%</span>
        </div>
      </div>

      {settingsSaved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-xs text-emerald-400 flex items-center justify-center gap-1.5 animate-pulse font-mono">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>COZY COMPASS PREFERENCES SAVED</span>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={onSave}
        className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-bold tracking-widest text-[10px] uppercase rounded-xl transition-colors cursor-pointer"
      >
        Save Vibe Rules
      </button>
    </div>
  );
};
