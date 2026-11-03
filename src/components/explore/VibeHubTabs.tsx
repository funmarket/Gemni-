import React, { useState } from 'react';

export type VibeTabType = 'Gossip' | 'Drift' | 'Vibes' | 'Orbit' | 'Echo' | 'Pulls';

interface VibeHubTabsProps {
  activeTab: VibeTabType;
  onChangeTab: (tab: VibeTabType) => void;
  pullsCount?: number;
  vibesCount?: number;
  echoCount?: number;
  orbitCount?: number;
}

export const VibeHubTabs: React.FC<VibeHubTabsProps> = ({
  activeTab,
  onChangeTab,
  pullsCount = 0,
  vibesCount = 0,
  echoCount = 0,
  orbitCount = 0,
}) => {
  const [hoveredTab, setHoveredTab] = useState<VibeTabType | null>(null);

  const tabs: { id: VibeTabType; label: string; count?: number; tooltip: string; activeColor: string; glowStyle: string }[] = [
    { 
      id: 'Gossip', 
      label: 'Gossip',
      tooltip: 'Spill the tea from your crew and matched besties — no filter zone',
      activeColor: 'var(--vibe-tab-gossip-color, #2DD4BF)',
      glowStyle: '0 0 12px var(--vibe-tab-gossip-glow, rgba(45, 212, 191, 0.45))'
    },
    { 
      id: 'Drift', 
      label: 'Drift',
      tooltip: 'Wander away, get lost on purpose, and vibe with random legends',
      activeColor: 'var(--vibe-tab-drift-color, #FB923C)',
      glowStyle: '0 0 12px var(--vibe-tab-drift-glow, rgba(251, 146, 60, 0.45))'
    },
    { 
      id: 'Vibes', 
      label: 'Vibes', 
      count: vibesCount,
      tooltip: 'Your official double-matched squad — the ones who already chose you back',
      activeColor: 'var(--vibe-tab-vibes-color, #22D3EE)',
      glowStyle: '0 0 12px var(--vibe-tab-vibes-glow, rgba(34, 211, 238, 0.45))'
    },
    { 
      id: 'Orbit', 
      label: 'Orbit', 
      count: orbitCount,
      tooltip: 'Your gravitational aura crew — the cool ones circling your energy',
      activeColor: 'var(--vibe-tab-orbit-color, #3B82F6)',
      glowStyle: '0 0 12px var(--vibe-tab-orbit-glow, rgba(59, 130, 246, 0.45))'
    },
    { 
      id: 'Echo', 
      label: 'Echo', 
      count: echoCount,
      tooltip: 'People whose vibes you’re tuned into — their frequency hits different',
      activeColor: 'var(--vibe-tab-echo-color, #A7F3D0)',
      glowStyle: '0 0 12px var(--vibe-tab-echo-glow, rgba(167, 243, 208, 0.45))'
    },
    { 
      id: 'Pulls', 
      label: 'Pulls', 
      count: pullsCount,
      tooltip: 'Incoming vibe magnets — who’s pulling you in right now?',
      activeColor: 'var(--vibe-tab-pulls-color, #FCA5A5)',
      glowStyle: '0 0 12px var(--vibe-tab-pulls-glow, rgba(252, 165, 165, 0.45))'
    },
  ];

  const currentTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="w-full flex flex-col shrink-0 bg-black border-t border-zinc-900 vibe-hub-tabs-container">
      {/* Short silly static descriptive info row directly above buttons to reinforce the long-press labels beautifully */}
      <div className="px-5 py-2 bg-black text-center select-none min-h-[32px] flex items-center justify-center border-b border-zinc-900/30 vibe-hub-tabs-info">
        <p className="text-[11px] font-medium text-zinc-500 font-lato transition-all duration-200 uppercase tracking-wider vibe-hub-tabs-info-text">
          {hoveredTab 
            ? tabs.find(t => t.id === hoveredTab)?.tooltip 
            : currentTabInfo?.tooltip
          }
        </p>
      </div>

      {/* Scrollable menu tabs bar with Lato font & custom glows */}
      <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar py-3 select-none bg-black pb-safe vibe-hub-tabs-scroll">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              title={tab.tooltip}
              className="px-4 py-2 rounded-[10px] text-[13px] font-black tracking-wide uppercase transition-all duration-300 cursor-pointer shrink-0 border font-lato vibe-hub-tab-button"
              style={{
                backgroundColor: isActive ? 'var(--vibe-tab-active-bg, rgba(20, 20, 22, 0.9))' : 'var(--vibe-tab-inactive-bg, rgba(20, 20, 22, 0.3))',
                borderColor: isActive ? tab.activeColor : 'var(--vibe-tab-inactive-border, #18181B)',
                color: isActive ? tab.activeColor : 'var(--vibe-tab-inactive-text, #64748B)',
                boxShadow: isActive ? tab.glowStyle : 'none',
              }}
            >
              <span className="flex items-center gap-1">
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span 
                    className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono leading-none bg-zinc-900 text-zinc-300 border border-zinc-800"
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VibeHubTabs;
