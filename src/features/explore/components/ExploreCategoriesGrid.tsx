import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryItem {
  name: string;
  emoji: string;
  count: number;
}

const CATEGORIES: CategoryItem[] = [
  { name: "Food & Drink", emoji: "🍽️", count: 23 },
  { name: "Music & Arts", emoji: "🎵", count: 15 },
  { name: "Culture", emoji: "🏛️", count: 8 },
  { name: "Nightlife", emoji: "🌙", count: 12 },
  { name: "Cafés", emoji: "☕", count: 18 },
  { name: "Shopping", emoji: "🛍️", count: 7 }
];

interface ExploreCategoriesGridProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  onOpenSuggestionModal: () => void;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const ExploreCategoriesGrid: React.FC<ExploreCategoriesGridProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenSuggestionModal,
  fireHaptic
}) => {
  return (
    <div className="space-y-4 pt-4 text-left">
      <div className="space-y-3">
        <h3 className="text-[20px] font-bold text-white tracking-tight">Categories</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  fireHaptic('light');
                  onSelectCategory(cat.name);
                }}
                className={cn(
                  "p-4 rounded-[14px] flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.98] text-left outline-none cursor-pointer border",
                  isSelected 
                    ? "bg-[#242226] border-white/15" 
                    : "bg-[#1A181C] border-white/5"
                )}
              >
                <div className="flex items-center gap-2 px-0.5 min-w-0">
                  <span className="text-[24px] select-none h-8 w-8 flex items-center justify-center shrink-0">{cat.emoji}</span>
                  <span className="text-[15px] font-semibold text-white tracking-tight leading-tight truncate">{cat.name}</span>
                </div>
                <span className="text-[12px] font-medium text-[#8E8E93] pr-1 shrink-0">{cat.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vibe suggestion banner */}
      <div 
        onClick={() => {
          fireHaptic('medium');
          onOpenSuggestionModal();
        }}
        className="bg-[#1A181C] border border-white/5 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-white/10 transition-all active:scale-[0.99] mt-3 select-none text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-950/15 border border-emerald-500/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#3DDC6C]" />
          </div>
          <div>
            <h4 className="text-white text-sm font-bold">Vibe suggestions active</h4>
            <p className="text-[#8E8E93] text-[11px] font-medium">Verify local recommendations & neighborhood matching</p>
          </div>
        </div>
        <button className="bg-teal-950/15 border border-teal-500/15 px-3 py-1.5 rounded-xl text-teal-400 font-bold tracking-tight text-[11px] outline-none">
          DETAILS
        </button>
      </div>
    </div>
  );
};
