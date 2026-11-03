import React from 'react';
import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DailyStreakQuestProps {
  streakCount: number;
  streakClaimed: boolean;
  handleClaimStreak: () => void;
}

export const DailyStreakQuest: React.FC<DailyStreakQuestProps> = ({
  streakCount,
  streakClaimed,
  handleClaimStreak
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#16141a] border border-white/5 rounded-2xl p-4.5 space-y-3.5 text-left relative overflow-hidden select-none col-span-1">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-extrabold uppercase tracking-wide text-amber-400 font-mono">
            {t('home.liveFeedSystem')} ({streakCount} {t('common.active')})
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 font-bold">
          {t('common.status')}: {streakClaimed ? t('common.active') : t('common.loading')}
        </span>
      </div>
      <button
        type="button"
        onClick={handleClaimStreak}
        disabled={streakClaimed}
        className="w-full bg-amber-500/10 hover:bg-amber-500/15 disabled:bg-zinc-900 disabled:text-zinc-650 disabled:border-transparent text-amber-400 border border-amber-500/20 rounded-xl h-11 flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
      >
        {streakClaimed ? `✓ ${t('settings.linkedNode')}` : `${t('home.claim')} (+25 VQ)`}
      </button>
    </div>
  );
};
