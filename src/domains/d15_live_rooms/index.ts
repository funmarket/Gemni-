/**
 * Domain 15: Live Rooms (D15)
 * Manages live cultural audio/video room sessions, speaker/listener participation,
 * and stage moderation per Structure.md D15.
 */

import { supabase } from '@/infrastructure/supabase/supabaseClient';

export interface RoomParticipant {
  userId: string;
  userHandle: string;
  displayName: string;
  avatarUrl?: string;
  role: 'host' | 'speaker' | 'listener';
  isMuted: boolean;
  joinedAt: string;
}

export interface LiveRoom {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostHandle: string;
  venueId?: string;
  city: string;
  tags: string[];
  status: 'active' | 'scheduled' | 'ended';
  maxParticipants: number;
  participants: RoomParticipant[];
  startedAt: string;
  endedAt?: string;
}

const STORAGE_KEY = 'vq_live_rooms_v1';

const DEFAULT_ROOMS: LiveRoom[] = [
  {
    id: 'room_medina_live',
    title: 'Medina Sunset & Andalusian Acoustic Oud',
    description: 'Live broadcast from the rooftop of Dar El Jeld discussing Medina secret spots and music.',
    hostId: 'usr_hannibal_1337',
    hostHandle: 'hannibal',
    city: 'Tunis',
    tags: ['Acoustic', 'Oud', 'Sunset', 'Culture'],
    status: 'active',
    maxParticipants: 50,
    startedAt: new Date().toISOString(),
    participants: [
      {
        userId: 'usr_hannibal_1337',
        userHandle: 'hannibal',
        displayName: 'Hannibal Barca 🛡️',
        role: 'host',
        isMuted: false,
        joinedAt: new Date().toISOString()
      },
      {
        userId: 'usr_sarah_sf',
        userHandle: 'sarah_scribe',
        displayName: 'Sarah Scribe 🎒',
        role: 'speaker',
        isMuted: true,
        joinedAt: new Date().toISOString()
      }
    ]
  }
];

class LiveRoomsDomain {
  private rooms: LiveRoom[] = [];
  private listeners: Set<(rooms: LiveRoom[]) => void> = new Set();

  constructor() {
    this.load();
    this.syncFromSupabase();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.rooms = raw ? JSON.parse(raw) : [...DEFAULT_ROOMS];
    } catch {
      this.rooms = [...DEFAULT_ROOMS];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.rooms));
    } catch {}
    this.notify();
  }

  private async syncFromSupabase() {
    try {
      const { data, error } = await supabase
        .from('activity')
        .select('*')
        .eq('type', 'LIVE_ROOM')
        .order('timestamp', { ascending: false });

      if (!error && data && data.length > 0) {
        // Sync real room broadcast notifications
      }
    } catch {}
  }

  public getActiveRooms(): LiveRoom[] {
    return this.rooms.filter(r => r.status === 'active');
  }

  public getRoomById(id: string): LiveRoom | undefined {
    return this.rooms.find(r => r.id === id);
  }

  public createRoom(params: Omit<LiveRoom, 'id' | 'status' | 'startedAt' | 'participants'>): LiveRoom {
    const newRoom: LiveRoom = {
      ...params,
      id: `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'active',
      startedAt: new Date().toISOString(),
      participants: [
        {
          userId: params.hostId,
          userHandle: params.hostHandle,
          displayName: params.hostHandle,
          role: 'host',
          isMuted: false,
          joinedAt: new Date().toISOString()
        }
      ]
    };

    this.rooms.unshift(newRoom);
    this.save();

    // Persist announcement to Supabase activity
    try {
      supabase.from('activity').upsert({
        id: newRoom.id,
        type: 'LIVE_ROOM',
        message: `Live Room: ${newRoom.title} is now active in ${newRoom.city}`,
        user_id: params.hostId,
        timestamp: newRoom.startedAt
      }).then(() => {}).catch(console.warn);
    } catch {}

    return newRoom;
  }

  public joinRoom(roomId: string, participant: Omit<RoomParticipant, 'joinedAt'>): boolean {
    const room = this.getRoomById(roomId);
    if (!room || room.status !== 'active') return false;

    if (!room.participants.some(p => p.userId === participant.userId)) {
      room.participants.push({
        ...participant,
        joinedAt: new Date().toISOString()
      });
      this.save();
    }
    return true;
  }

  public leaveRoom(roomId: string, userId: string): void {
    const room = this.getRoomById(roomId);
    if (!room) return;

    room.participants = room.participants.filter(p => p.userId !== userId);
    if (room.hostId === userId && room.participants.length === 0) {
      room.status = 'ended';
      room.endedAt = new Date().toISOString();
    }
    this.save();
  }

  public subscribe(cb: (rooms: LiveRoom[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.getActiveRooms());
    return () => this.listeners.delete(cb);
  }

  private notify() {
    const active = this.getActiveRooms();
    this.listeners.forEach(cb => cb(active));
  }
}

export const liveRoomsDomain = new LiveRoomsDomain();
