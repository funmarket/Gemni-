/**
 * Domain 11: Events (D11)
 * Organizer events published by eligible Pro providers or Business operators.
 * Published IMMEDIATELY without manual preapproval, subject to scoped D21 moderation.
 */

export interface OfficialEvent {
  id: string;
  organizerType: 'pro' | 'business';
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  flyerUrl: string;
  venueName: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  startTime: string; // ISO
  endTime: string;
  status: 'LIVE_NOW' | 'UPCOMING' | 'CONCLUDED' | 'CANCELLED';
  rsvps: string[]; // memberIds
  ticketProductId?: string; // Optional linkage to D28 ticketing product
  isModerated: boolean; // Flagged by D21 Control Room if reported
  createdAt: string;
}

const STORAGE_KEY = 'vq_events_catalog_v1';

const DEFAULT_EVENTS: OfficialEvent[] = [
  {
    id: 'evt_medina_electronic_night_01',
    organizerType: 'business',
    organizerId: 'biz_cafe_el_alia',
    organizerName: 'Café El Alia Historic Tea House',
    title: 'Cliffside Vinyl & Ambient Pulse Evening',
    description: 'An intimate sunset-to-midnight electronic ambient showcase with local crate-diggers, mint infusions, and sea breezes.',
    flyerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    venueName: 'Café El Alia Terrace',
    address: 'Rue Habib Thameur, Sidi Bou Said',
    city: 'Tunis',
    latitude: 36.8711,
    longitude: 10.3421,
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 2 + 18000000).toISOString(),
    status: 'UPCOMING',
    rsvps: ['usr_hannibal_1337', 'usr_sarah_carthage'],
    ticketProductId: 'tkt_vinyl_pulse_01',
    isModerated: false,
    createdAt: new Date().toISOString()
  }
];

class EventsDomain {
  private events: OfficialEvent[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.events = raw ? JSON.parse(raw) : [...DEFAULT_EVENTS];
      if (!raw) this.save();
    } catch {
      this.events = [...DEFAULT_EVENTS];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
    } catch {}
  }

  public getEvents(): OfficialEvent[] {
    return this.events.filter(e => !e.isModerated);
  }

  public getEventById(id: string): OfficialEvent | null {
    return this.events.find(e => e.id === id) || null;
  }

  /**
   * Pro or Business accounts publish immediately without manual preapproval.
   */
  public publishEvent(
    organizerType: 'pro' | 'business',
    organizerId: string,
    organizerName: string,
    data: Omit<OfficialEvent, 'id' | 'organizerType' | 'organizerId' | 'organizerName' | 'rsvps' | 'isModerated' | 'createdAt'>
  ): OfficialEvent {
    const newEvent: OfficialEvent = {
      ...data,
      id: `evt_${Date.now()}`,
      organizerType,
      organizerId,
      organizerName,
      rsvps: [organizerId],
      isModerated: false,
      createdAt: new Date().toISOString()
    };

    this.events.unshift(newEvent);
    this.save();
    this.notify();
    return newEvent;
  }

  public toggleRsvp(eventId: string, memberId: string): boolean {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) return false;
    const idx = evt.rsvps.indexOf(memberId);
    if (idx > -1) {
      evt.rsvps.splice(idx, 1);
    } else {
      evt.rsvps.push(memberId);
    }
    this.save();
    this.notify();
    return idx === -1;
  }

  public moderateEvent(eventId: string, isFlagged: boolean): void {
    const evt = this.events.find(e => e.id === eventId);
    if (evt) {
      evt.isModerated = isFlagged;
      this.save();
      this.notify();
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    cb();
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const eventsDomain = new EventsDomain();
