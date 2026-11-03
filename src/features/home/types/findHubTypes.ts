export interface GeofenceConfig {
  id: string;
  label: string; // e.g. "Home", "Work", "School", "Gym"
  latitude: number;
  longitude: number;
  radiusMeters: number;
  triggerOnArrive: boolean;
  triggerOnLeave: boolean;
  isEnabled: boolean;
}

export interface HubContact {
  id: string; // matches UserProfile.id
  username: string;
  avatar: string;
  isOnline: boolean;
  relationship: string; // e.g. "Son", "Partner", "Daughter", "Friend", "Family"
  lockOnEnabled: boolean; // Mutually approved active real-time tracking
  latitude: number; // current simulated or live latitude
  longitude: number; // current simulated or live longitude
  geofences: GeofenceConfig[];
  lastUpdated: number; // timestamp
}

export interface HubAlertLog {
  id: string;
  contactId: string;
  username: string;
  avatar: string;
  geofenceLabel: string;
  eventType: 'arrive' | 'leave'; // triggered event
  timestamp: number;
  message: string;
  isRead: boolean;
}
