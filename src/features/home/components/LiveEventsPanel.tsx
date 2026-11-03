import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { getEventPhoto } from '../data/homeHelpers';
import { EventCardItem } from './events/EventCardItem';
import { HostEventInlineForm } from './events/HostEventInlineForm';
import { eventsDomain } from '@/domains/d11_events';

interface EventItem {
  id: string;
  name: string;
  loc: string;
  tag: string;
  date: string;
  type: 'live' | 'upcoming';
  addedBy: string;
}

interface LiveEventsPanelProps {
  eventsList: EventItem[];
  saveEventsList?: (events: any[]) => void;
  expandedEventId: string | null;
  setExpandedEventId: (id: string | null) => void;
  rsvpedEvents: Record<string, boolean>;
  toggleRsvp: (id: string) => void;
  getAverageRating?: (id: string, ratings: Record<string, any>) => { avg: number; count: number };
  reviewPanelItemId?: string | null;
  setReviewPanelItemId?: (id: string | null) => void;
  ratingInput?: number;
  setRatingInput?: (rating: number) => void;
  reviewTextInput?: string;
  setReviewTextInput?: (text: string) => void;
  ratingsAndReviews?: Record<string, any>;
  saveRatingsAndReviews?: (data: any) => void;
  profile?: any;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
  setModalType?: (type: string | null) => void;
  showToast?: (msg: string) => void;
  onNavigate?: (tab: string, search?: string, category?: string) => void;
  initialTab?: 'live' | 'upcoming';
  isModal?: boolean;
}

export const LiveEventsPanel: React.FC<LiveEventsPanelProps> = ({
  eventsList,
  saveEventsList,
  expandedEventId,
  setExpandedEventId,
  rsvpedEvents,
  toggleRsvp,
  triggerHaptic,
  showToast,
  initialTab,
  isModal = false,
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>(initialTab || 'live');
  const [showHostInline, setShowHostInline] = useState(false);
  const [isFeedExpanded, setIsFeedExpanded] = useState(false);

  const filteredEvents = eventsList.filter((ev) => ev.type === activeTab);
  const MAX_INITIAL = 3;
  const displayedEvents = !isModal && !isFeedExpanded ? filteredEvents.slice(0, MAX_INITIAL) : filteredEvents;

  const handleHostSubmit = (data: { name: string; loc: string; date: string; tag: string }) => {
    const newEvt: EventItem = {
      id: `evt_${Date.now()}`,
      name: data.name,
      loc: data.loc,
      date: data.date,
      tag: data.tag,
      type: 'upcoming',
      addedBy: 'You',
    };

    if (saveEventsList) {
      saveEventsList([newEvt, ...eventsList]);
    }

    eventsDomain.publishEvent('pro', 'current_user', 'You', {
      title: data.name,
      description: `Community curated event at ${data.loc}`,
      flyerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      venueName: data.loc,
      address: data.loc,
      city: 'Tunis',
      latitude: 36.8,
      longitude: 10.18,
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 86400000 + 14400000).toISOString(),
      status: 'UPCOMING',
    });

    setShowHostInline(false);
    if (showToast) showToast('Event published live to community!');
  };

  return (
    <div className="space-y-3">
      {/* Tab Switcher & Host Button */}
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
            Live Now
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
            Upcoming
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowHostInline(!showHostInline)}
          className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Host Event
        </button>
      </div>

      {/* Inline Form */}
      {showHostInline && (
        <HostEventInlineForm
          onSubmit={handleHostSubmit}
          onCancel={() => setShowHostInline(false)}
        />
      )}

      {/* Events List */}
      {displayedEvents.length === 0 ? (
        <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-white/5 text-xs text-zinc-500">
          No {activeTab} events at this moment. Host the first one!
        </div>
      ) : (
        <div className="space-y-2">
          {displayedEvents.map((evt) => (
            <EventCardItem
              key={evt.id}
              event={evt}
              isExpanded={expandedEventId === evt.id}
              onToggleExpand={() =>
                setExpandedEventId(expandedEventId === evt.id ? null : evt.id)
              }
              isRsvped={Boolean(rsvpedEvents[evt.id])}
              onToggleRsvp={() => toggleRsvp(evt.id)}
              photoUrl={getEventPhoto(evt.tag, evt.id)}
              fireHaptic={triggerHaptic}
            />
          ))}
        </div>
      )}

      {/* View More Toggle */}
      {!isModal && filteredEvents.length > MAX_INITIAL && (
        <button
          type="button"
          onClick={() => setIsFeedExpanded(!isFeedExpanded)}
          className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {isFeedExpanded ? 'Show Less' : `View All (${filteredEvents.length})`}
        </button>
      )}
    </div>
  );
};
export default LiveEventsPanel;
