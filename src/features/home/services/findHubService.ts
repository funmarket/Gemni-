import { HubContact, HubAlertLog, GeofenceConfig } from '../types/findHubTypes';

// Earth radius in meters
const EARTH_RADIUS_METERS = 6371000;

export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

const STORAGE_KEYS = {
  CONTACTS: 'vq_hub_contacts',
  ALERTS: 'vq_hub_alerts',
};

// Seed profiles with specific social meetup context to showcase "Lock-on" capabilities
export const DEFAULT_HUB_CONTACTS = (userLat: number, userLng: number): HubContact[] => [
  {
    id: 'analog_lens',
    username: 'Sarah (Best Friend)',
    avatar: '📷',
    isOnline: true,
    relationship: 'Best Friend',
    lockOnEnabled: true,
    latitude: userLat + 0.005, // very close (~500m)
    longitude: userLng + 0.004,
    lastUpdated: Date.now(),
    geofences: [
      {
        id: 'sarah-coffee',
        label: 'Coffee Shop Meetup',
        latitude: userLat,
        longitude: userLng,
        radiusMeters: 250,
        triggerOnArrive: true,
        triggerOnLeave: true,
        isEnabled: true,
      },
      {
        id: 'sarah-arts',
        label: 'Community Arts Center',
        latitude: userLat + 0.015,
        longitude: userLng + 0.015,
        radiusMeters: 300,
        triggerOnArrive: true,
        triggerOnLeave: true,
        isEnabled: true,
      }
    ]
  },
  {
    id: 'cyber_voyager',
    username: 'Alex (Vibe Questor)',
    avatar: '🦊',
    isOnline: true,
    relationship: 'Co-adventurer',
    lockOnEnabled: true,
    latitude: userLat + 0.012, // approx 1.3 km away
    longitude: userLng - 0.010,
    lastUpdated: Date.now(),
    geofences: [
      {
        id: 'alex-plaza',
        label: 'Central Meetup Plaza',
        latitude: userLat + 0.012,
        longitude: userLng - 0.010,
        radiusMeters: 200,
        triggerOnArrive: true,
        triggerOnLeave: true,
        isEnabled: true,
      }
    ]
  },
  {
    id: 'pixel_chef',
    username: 'Chloe (Foodie Member)',
    avatar: '🍳',
    isOnline: false,
    relationship: 'Vibe Member',
    lockOnEnabled: false,
    latitude: userLat - 0.008,
    longitude: userLng + 0.008,
    lastUpdated: Date.now() - 3600000,
    geofences: [
      {
        id: 'chloe-camp',
        label: 'VibeQuest Base Camp',
        latitude: userLat - 0.008,
        longitude: userLng + 0.008,
        radiusMeters: 150,
        triggerOnArrive: true,
        triggerOnLeave: false,
        isEnabled: false,
      }
    ]
  }
];

export const findHubService = {
  getContacts(userLat: number, userLng: number): HubContact[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading hub contacts:', e);
    }
    // Return seed and save
    const seeds = DEFAULT_HUB_CONTACTS(userLat, userLng);
    this.saveContacts(seeds);
    return seeds;
  },

  saveContacts(contacts: HubContact[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    } catch (e) {
      console.error('Error saving hub contacts:', e);
    }
  },

  getAlerts(): HubAlertLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading hub alerts:', e);
    }
    return [];
  },

  saveAlerts(alerts: HubAlertLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.error('Error saving hub alerts:', e);
    }
  },

  addAlert(alert: Omit<HubAlertLog, 'id' | 'timestamp' | 'isRead'>): HubAlertLog {
    const alerts = this.getAlerts();
    const newAlert: HubAlertLog = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      isRead: false,
    };
    alerts.unshift(newAlert);
    this.saveAlerts(alerts.slice(0, 100)); // cap logs at 100 items
    return newAlert;
  },

  clearAlerts(): void {
    this.saveAlerts([]);
  }
};
