import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { getLiveActivityPhoto } from '../data/homeHelpers';
import { ActivityCardItem } from './activities/ActivityCardItem';
import { ScheduleActivityInlineForm } from './activities/ScheduleActivityInlineForm';
import { activitiesDomain } from '@/domains/d10_activities';

interface LiveActivity {
  id: string;
  text: string;
  location: string;
  emoji: string;
  author?: string;
  date?: string;
}

interface LiveActivitiesPanelProps {
  liveActivityFeed: LiveActivity[];
  upcomingActivities?: any[];
  saveUpcomingActivities?: (acts: any[]) => void;
  profile?: any;
  profileCompCompleted?: boolean;
  setProfileCompCompleted?: (val: boolean) => void;
  setLiveActivityFeed?: React.Dispatch<React.SetStateAction<any[]>>;
  triggerAlert?: (title: string, message: string, type?: string) => void;
  ratingsAndReviews?: Record<string, any>;
  saveRatingsAndReviews?: (data: any) => void;
  showToast?: (msg: string) => void;
  expandedActivityId: string | null;
  setExpandedActivityId: (id: string | null) => void;
  activityResonances: Record<string, number>;
  boostActivityResonance: (id: string) => void;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
  setModalType?: (type: string | null) => void;
  onNavigate?: (tab: string, search?: string, category?: string) => void;
  initialTab?: 'live' | 'upcoming';
  isModal?: boolean;
}

export const LiveActivitiesPanel: React.FC<LiveActivitiesPanelProps> = ({
  liveActivityFeed,
  upcomingActivities = [],
  saveUpcomingActivities,
  showToast,
  expandedActivityId,
  setExpandedActivityId,
  activityResonances,
  boostActivityResonance,
  triggerHaptic,
  initialTab,
  isModal = false,
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>(initialTab || 'live');
  const [showAddInline, setShowAddInline] = useState(false);
  const [isFeedExpanded, setIsFeedExpanded] = useState(false);

  const currentFeed = activeTab === 'live' ? liveActivityFeed : upcomingActivities;
  const MAX_INITIAL = 3;
  const displayedFeed = !isModal && !isFeedExpanded ? currentFeed.slice(0, MAX_INITIAL) : currentFeed;

  const handleScheduleSubmit = (actData: {
    text: string;
    location: string;
    date: string;
    emoji: string;
  }) => {
    const newAct: LiveActivity = {
      id: `act_${Date.now()}`,
      text: actData.text,
      location: actData.location,
      date: actData.date,
      emoji: actData.emoji,
      author: 'You',
    };

    if (saveUpcomingActivities) {
      saveUpcomingActivities([newAct, ...upcomingActivities]);
    }

    activitiesDomain.createActivity({
      hostId: 'current_user',
      hostName: 'You',
      title: actData.text,
      description: `Spontaneous meetup at ${actData.location}`,
      meetingPoint: actData.location,
      city: 'Tunis',
      startTime: new Date(Date.now() + 3600000).toISOString(),
      status: 'UPCOMING',
    });

    setShowAddInline(false);
    if (showToast) showToast('Activity broadcasted live to community!');
  };

  return (
    <div className="space-y-3">
      {/* Tab Switcher & Assemble Button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-zinc-950 p-1 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'live'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Live Assemblies
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Scheduled
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAddInline(!showAddInline)}
          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Assemble
        </button>
      </div>

      {/* Inline Form */}
      {showAddInline && (
        <ScheduleActivityInlineForm
          onSubmit={handleScheduleSubmit}
          onCancel={() => setShowAddInline(false)}
        />
      )}

      {/* Activities List */}
      {displayedFeed.length === 0 ? (
        <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-white/5 text-xs text-zinc-500">
          No {activeTab} assemblies broadcasted yet. Start one!
        </div>
      ) : (
        <div className="space-y-2">
          {displayedFeed.map((act) => (
            <ActivityCardItem
              key={act.id}
              activity={act}
              isExpanded={expandedActivityId === act.id}
              onToggleExpand={() =>
                setExpandedActivityId(expandedActivityId === act.id ? null : act.id)
              }
              resonancesCount={activityResonances[act.id] || 0}
              onBoostResonance={() => boostActivityResonance(act.id)}
              photoUrl={getLiveActivityPhoto(act.text, act.id)}
              fireHaptic={triggerHaptic}
            />
          ))}
        </div>
      )}

      {/* View More Toggle */}
      {!isModal && currentFeed.length > MAX_INITIAL && (
        <button
          type="button"
          onClick={() => setIsFeedExpanded(!isFeedExpanded)}
          className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {isFeedExpanded ? 'Show Less' : `View All (${currentFeed.length})`}
        </button>
      )}
    </div>
  );
};
export default LiveActivitiesPanel;
