import React from 'react';
import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LiveCameraFeatures } from '@/components/share/LiveCameraFeatures';

interface ShareHeroBannerProps {
  onLiveVibeShotPress?: () => void;
  onBroadcastPress?: () => void;
  onOpenShareModal?: () => void;
  triggerHaptic?: (type: 'light' | 'medium' | 'heavy') => void;
}

export const ShareHeroBanner: React.FC<ShareHeroBannerProps> = ({
  onLiveVibeShotPress,
  onBroadcastPress,
  onOpenShareModal,
}) => {
  const handleVibeShot = onLiveVibeShotPress || onOpenShareModal || (() => {});
  const handleBroadcast = onBroadcastPress || onOpenShareModal || (() => {});
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#121214] via-[#151419] to-[#0d120f] border border-white/5 rounded-3xl p-5 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-emerald-500/5 to-transparent pointer-events-none" />
        <div className="space-y-4 relative z-10 w-full flex flex-col items-center justify-center text-center">
          <div className="space-y-3 flex-1 flex flex-col items-center justify-center">
            <h2 className="font-kindness text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-wide uppercase italic select-none">
              {t('shareGoodVibes.title')}
            </h2>
            <p className="text-[12px] sm:text-[13px] leading-relaxed text-zinc-400 font-normal max-w-xs sm:max-w-md text-center px-1">
              Share the moment. Feel the city together. Right now. Warm, authentic human presence recorded in physical proximity.
            </p>
          </div>

          <LiveCameraFeatures onLiveVibeShotPress={handleVibeShot} />
        </div>
      </div>

      <div className="px-1">
        <button
          onClick={handleBroadcast}
          className="w-full h-12 bg-lime-950/20 text-[#a3e635] border border-lime-500/20 hover:bg-lime-950/30 active:scale-98 font-montserrat font-[900] text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-none"
        >
          <Camera className="w-4.5 h-4.5 text-[#a3e635]" />
          {t('vibe.broadcastButton')}
        </button>
      </div>
    </div>
  );
};
