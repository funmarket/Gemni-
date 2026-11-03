import React from 'react';
import { Sparkles, MapPin, Tag } from 'lucide-react';

export const PRESET_COVERS = [
  { label: 'Coastal Bay', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600&auto=format&fit=crop' },
  { label: 'Scenic View', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop' },
  { label: 'Cozy Café', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop' },
  { label: 'Night Lounge', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop' },
  { label: 'Ancient Culture', url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600&auto=format&fit=crop' },
];

interface TrailOverviewTabProps {
  trailTitle: string;
  setTrailTitle: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  narrativeStory: string;
  setNarrativeStory: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  tagsInput: string;
  setTagsInput: (v: string) => void;
  selectedCover: string;
  setSelectedCover: (url: string) => void;
}

export const TrailOverviewTab: React.FC<TrailOverviewTabProps> = ({
  trailTitle,
  setTrailTitle,
  city,
  setCity,
  narrativeStory,
  setNarrativeStory,
  category,
  setCategory,
  tagsInput,
  setTagsInput,
  selectedCover,
  setSelectedCover
}) => {
  return (
    <div className="space-y-4 text-left">
      <div>
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
          Trail Name *
        </label>
        <input
          type="text"
          value={trailTitle}
          onChange={(e) => setTrailTitle(e.target.value)}
          placeholder="e.g. Secret Medina Rooftops & Artisan Leather"
          className="w-full bg-[#1A181C] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
            City / Area *
          </label>
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Tunis"
              className="w-full bg-[#1A181C] border border-white/10 rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#1A181C] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="Full Day Circuit">Full Day Circuit</option>
            <option value="Half Day Walk">Half Day Walk</option>
            <option value="Nightlife & Bars">Nightlife & Bars</option>
            <option value="Food & Flavors">Food & Flavors</option>
            <option value="Architecture & History">Architecture & History</option>
            <option value="Hidden Sanctuaries">Hidden Sanctuaries</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
          The Story / Local Narrative *
        </label>
        <textarea
          value={narrativeStory}
          onChange={(e) => setNarrativeStory(e.target.value)}
          rows={3}
          placeholder="Explain the soul of this route. Why did you curate these specific locations?"
          className="w-full bg-[#1A181C] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
          Cover Visual
        </label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COVERS.map((cov) => (
            <button
              key={cov.label}
              type="button"
              onClick={() => setSelectedCover(cov.url)}
              className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all cursor-pointer ${
                selectedCover === cov.url ? 'border-emerald-400 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={cov.url} alt={cov.label} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
          Vibe Tags (comma separated)
        </label>
        <div className="relative">
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="culture, scenic, foodie"
            className="w-full bg-[#1A181C] border border-white/10 rounded-xl pl-9 pr-3 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
        </div>
      </div>
    </div>
  );
};
