import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';

interface HostEventInlineFormProps {
  onSubmit: (eventData: { name: string; loc: string; date: string; tag: string }) => void;
  onCancel: () => void;
}

export const HostEventInlineForm: React.FC<HostEventInlineFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [loc, setLoc] = useState('');
  const [date, setDate] = useState('');
  const [tag, setTag] = useState('music');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !loc.trim()) return;
    onSubmit({ name: name.trim(), loc: loc.trim(), date: date.trim() || 'Tonight 8 PM', tag });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-[#181622] border border-purple-500/30 rounded-2xl space-y-3 text-left">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-bold uppercase text-purple-300">Host New Event</h4>
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
          placeholder="Event Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
        />
        <input
          type="text"
          required
          placeholder="Location / Venue"
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="e.g. Tonight 8 PM"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
          />
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="music">Music</option>
            <option value="art">Art & Culture</option>
            <option value="food">Culinary</option>
            <option value="sports">Sports</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase cursor-pointer"
      >
        Publish Event Immediately
      </button>
    </form>
  );
};
