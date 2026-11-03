import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useVibeCheck } from './useVibeCheck';

interface VibeCheckComposerProps {
  targetMatch: { id: string; username: string; avatarUri: string };
  onFired: (check: any) => void;
  onClose: () => void;
}

const PRESETS = [
  "Prove you're actually there 📍",
  "Show me that coffee ☕",
  "Prove the vibe is real 🌊",
  "Let me see the fit 👀",
  "Show me the view 🏙️",
  "Prove you're not in bed 😴"
];

export const VibeCheckComposer: React.FC<VibeCheckComposerProps> = ({
  targetMatch,
  onFired,
  onClose
}) => {
  const { fireCheck } = useVibeCheck();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const activePrompt = customPrompt.trim().length > 0 ? customPrompt : selectedPreset;

  const handleSelectPreset = (preset: string) => {
    setCustomPrompt('');
    setSelectedPreset(preset === selectedPreset ? null : preset);
    setErrorText(null);
  };

  const handleChangeCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPreset(null);
    setCustomPrompt(e.target.value);
    setErrorText(null);
  };

  const handleFirePress = async () => {
    if (!activePrompt) return;
    const finalPrompt = activePrompt.trim();
    if (finalPrompt.length === 0 || finalPrompt.length > 61) {
      setErrorText("Oops, challenge prompt must be 1-60 characters!");
      return;
    }

    setLoading(true);
    setErrorText(null);

    try {
      // Simulate/Trigger fireCheck database action
      await fireCheck(targetMatch.id, finalPrompt);
      
      // On success, create a temporary local representation to close cleanly
      const responseCheck = {
        challenger_id: 'current_user',
        challenged_id: targetMatch.id,
        prompt: finalPrompt,
        status: 'pending',
        created_at: Date.now(),
        expires_at: Date.now() + 33000,
      };

      onFired(responseCheck);
    } catch (err: any) {
      console.error('Failed to fire VibeCheck:', err);
      setErrorText("Couldn't send. Tap to try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine counter style alert threshold
  const countTooHigh = customPrompt.length > 55;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      {/* Back click overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Component */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-md bg-[#1A1A2E] rounded-t-[28px] border-t border-white/10 px-6 pt-3 pb-8 flex flex-col gap-5 z-15 shadow-[0_-10px_35px_rgba(0,0,0,0.5)] select-none text-left"
      >
        {/* Drag Pill Handle */}
        <div className="mx-auto w-10 h-1 bg-[#3A3A5C] rounded-full mb-1" />

        {/* Header Block */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white tracking-tight">
            @{targetMatch.username}&apos;s Vibe is about to get Checked 🎯
          </h3>
          <p className="text-xs text-[#9090B0]">
            They have exactly 33 seconds to prove it. Choose your challenge:
          </p>
        </div>

        {/* Target Profile Preview Block */}
        <div className="flex items-center gap-3 bg-[#252540] rounded-xl px-4 py-2.5 border border-white/5">
          <span className="text-2xl">{targetMatch.avatarUri || '🦊'}</span>
          <span className="text-sm font-semibold text-white">@{targetMatch.username}</span>
          <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-[#FF6B35] bg-[#FF6B35]/10 px-2.5 py-0.5 rounded-full font-bold">
            CHALLENGE RECEIVER
          </span>
        </div>

        {/* Preset selections */}
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset;
            return (
              <button
                key={preset}
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs font-semibold rounded-full py-2.5 px-4 text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FF6B35]/20 border-[#FF6B35] text-[#FF6B35] shadow-[0_2px_10px_rgba(255,107,53,0.15)]'
                    : 'bg-[#252540] border-[#3A3A5C] text-[#AEAED0] hover:bg-[#32325c]'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>

        {/* Custom prompt writer */}
        <div className="space-y-1.5 relative">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#9090B0]">
            Or write your own (max 60 chars)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Prove you're actually coding 💻"
              value={customPrompt}
              onChange={handleChangeCustom}
              maxLength={60}
              className="w-full text-sm bg-[#252540] border border-[#3A3A5C] text-white rounded-xl py-3 px-4 outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/50 transition-all placeholder:text-zinc-500"
            />
            <span
              className={`absolute right-4 bottom-3 text-[10px] font-mono ${
                countTooHigh ? 'text-rose-500 font-bold' : 'text-[#9090B0]'
              }`}
            >
              {customPrompt.length}/60
            </span>
          </div>
        </div>

        {/* Error notification display block */}
        {errorText && (
          <div className="text-xs text-rose-500 font-medium text-center bg-rose-500/10 border border-rose-500/20 py-2 rounded-xl">
            ⚠️ {errorText}
          </div>
        )}

        {/* Shutter Launcher action button with spring-pulse scale states */}
        <motion.button
          whileTap={activePrompt && !loading ? { scale: 0.97 } : {}}
          onClick={handleFirePress}
          className={`w-full py-4 rounded-full text-center text-sm font-bold uppercase tracking-wider transition-all select-none ${
            activePrompt && !loading
              ? 'bg-gradient-to-r from-[#FF6B35] to-[#FF9A5C] text-white shadow-lg cursor-pointer hover:shadow-orange-500/15'
              : 'bg-zinc-800 text-zinc-500 opacity-40 cursor-not-allowed'
          }`}
          disabled={!activePrompt || loading}
        >
          {loading ? 'Sending... 🎯' : 'Fire VibeCheck 🎯'}
        </motion.button>
      </motion.div>
    </div>
  );
};
