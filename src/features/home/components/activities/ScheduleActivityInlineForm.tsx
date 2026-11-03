import React, { useState } from 'react';

interface ScheduleActivityInlineFormProps {
  onSubmit: (actData: { text: string; location: string; date: string; emoji: string }) => void;
  onCancel: () => void;
}

export const ScheduleActivityInlineForm: React.FC<ScheduleActivityInlineFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [emoji, setEmoji] = useState('🎵');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !location.trim()) return;
    onSubmit({ text: text.trim(), location: location.trim(), date: date.trim() || 'In 1 hour', emoji });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-[#181622] border border-amber-500/30 rounded-2xl space-y-3 text-left">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-bold uppercase text-amber-300">Assemble Spontaneous Activity</h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] text-zinc-400 hover:text-white"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          required
          placeholder="Activity Title (e.g. Sunset Sketching & Tea)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
        />
        <input
          type="text"
          required
          placeholder="Meeting Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Time (e.g. In 45 mins)"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
          />
          <select
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="🎵">🎵 Jam / Music</option>
            <option value="🎨">🎨 Art / Sketch</option>
            <option value="☕">☕ Coffee / Chat</option>
            <option value="🏃">🏃 Run / Fitness</option>
            <option value="📸">📸 Photo Walk</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
      >
        Broadcast to Nearby Explorers
      </button>
    </form>
  );
};
