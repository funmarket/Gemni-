/**
 * Domain 10: Activities (D10)
 * Community-led activities, schedules, Live/Upcoming, participation, and resonance boost.
 */

export interface CommunityActivity {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatarUrl?: string;
  title: string;
  description: string;
  meetingPoint: string;
  city: string;
  startTime: string; // ISO
  endTime?: string;
  status: 'LIVE_NOW' | 'UPCOMING' | 'COMPLETED';
  participants: string[]; // memberIds
  resonanceBoosts: number;
  linkedCommunityId?: string;
  createdAt: string;
}

const STORAGE_KEY = 'vq_activities_catalog_v1';

const DEFAULT_ACTIVITIES: CommunityActivity[] = [
  {
    id: 'act_sunset_sketch_01',
    hostId: 'usr_sarah_carthage',
    hostName: 'Sarah K.',
    title: 'Sunset Watercolor Sketching & Jasmine Tea',
    description: 'Bring a sketchbook or just relax with us on the Sidi Bou Said coastal bluffs as golden hour paints the bay.',
    meetingPoint: 'Lighthouse lookout terrace, Sidi Bou Said',
    city: 'Tunis',
    startTime: new Date(Date.now() + 3600000 * 2).toISOString(),
    status: 'UPCOMING',
    participants: ['usr_sarah_carthage', 'usr_hannibal_1337'],
    resonanceBoosts: 14,
    createdAt: new Date().toISOString()
  }
];

class ActivitiesDomain {
  private activities: CommunityActivity[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.activities = raw ? JSON.parse(raw) : [...DEFAULT_ACTIVITIES];
      if (!raw) this.save();
    } catch {
      this.activities = [...DEFAULT_ACTIVITIES];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.activities));
    } catch {}
  }

  public getActivities(): CommunityActivity[] {
    return this.activities;
  }

  public createActivity(data: Omit<CommunityActivity, 'id' | 'participants' | 'resonanceBoosts' | 'createdAt'>): CommunityActivity {
    const act: CommunityActivity = {
      ...data,
      id: `act_${Date.now()}`,
      participants: [data.hostId],
      resonanceBoosts: 1,
      createdAt: new Date().toISOString()
    };
    this.activities.unshift(act);
    this.save();
    this.notify();
    return act;
  }

  public boostResonance(activityId: string): number {
    const act = this.activities.find(a => a.id === activityId);
    if (!act) return 0;
    act.resonanceBoosts += 1;
    this.save();
    this.notify();
    return act.resonanceBoosts;
  }

  public toggleJoin(activityId: string, memberId: string): boolean {
    const act = this.activities.find(a => a.id === activityId);
    if (!act) return false;
    const idx = act.participants.indexOf(memberId);
    if (idx > -1) {
      act.participants.splice(idx, 1);
    } else {
      act.participants.push(memberId);
    }
    this.save();
    this.notify();
    return idx === -1;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    cb();
    return () => this.listeners.delete(cb);
  }

  // Compatibility helpers for venue pop-up gatherings
  public getGatherings(): any[] {
    return this.activities.map(a => ({
      id: a.id,
      venueId: a.meetingPoint || 'v-1',
      venueName: a.meetingPoint || 'Community Hub',
      title: a.title,
      description: a.description,
      hostId: a.hostId,
      hostName: a.hostName,
      hostAvatar: a.hostAvatarUrl || '✨',
      timeLabel: a.status === 'LIVE_NOW' ? 'Live Now ⚡' : 'Upcoming',
      capacity: 20,
      rsvps: a.participants.map(p => ({ userId: p, userName: `@${p}`, userAvatar: '🎒' })),
      createdAt: a.createdAt
    }));
  }

  public getGatheringsForVenue(venueId: string): any[] {
    return this.getGatherings().filter(g => g.venueId === venueId || g.venueName.toLowerCase().includes(venueId.toLowerCase()));
  }

  public addGathering(g: any): any {
    const act = this.createActivity({
      hostId: g.hostId || 'current_user',
      hostName: g.hostName || 'Explorer',
      hostAvatarUrl: g.hostAvatar,
      title: g.title,
      description: g.description,
      meetingPoint: g.venueName || 'Local Venue',
      city: 'Tunis',
      startTime: new Date().toISOString(),
      status: 'LIVE_NOW',
    });
    return act;
  }

  public rsvpGathering(gatheringId: string, user: { userId: string; userName: string; userAvatar: string }): boolean {
    return this.toggleJoin(gatheringId, user.userId);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const activitiesDomain = new ActivitiesDomain();
export const vibeGatheringStore = activitiesDomain;

