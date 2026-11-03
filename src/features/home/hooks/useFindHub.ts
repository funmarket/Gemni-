import { useState, useEffect, useRef, useCallback } from 'react';
import { HubContact, HubAlertLog, GeofenceConfig } from '../types/findHubTypes';
import { findHubService, getDistanceMeters } from '../services/findHubService';
import { useGeolocation } from '@/hooks/useGeolocation';

export function useFindHub(triggerAlert?: (title: string, msg: string) => void, triggerHaptic?: (style: string) => void) {
  const { latitude: userLat, longitude: userLng } = useGeolocation();
  
  const refLat = userLat || 37.7749;
  const refLng = userLng || -122.4194;

  const [contacts, setContacts] = useState<HubContact[]>([]);
  const [alerts, setAlerts] = useState<HubAlertLog[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track previous geofence states: "contactId_geofenceId" -> isInside (boolean)
  const geofenceStatesRef = useRef<Record<string, boolean>>({});

  // Initialize data
  useEffect(() => {
    // If we've already initialized using a real device GPS location, lock it in
    if (isInitialized) return;

    const loadedContacts = findHubService.getContacts(refLat, refLng);
    const loadedAlerts = findHubService.getAlerts();
    
    setContacts(loadedContacts);
    setAlerts(loadedAlerts);

    // Bootstrap initial geofence state map to prevent false triggers on startup
    const initialStates: Record<string, boolean> = {};
    loadedContacts.forEach(contact => {
      contact.geofences.forEach(gf => {
        const dist = getDistanceMeters(contact.latitude, contact.longitude, gf.latitude, gf.longitude);
        initialStates[`${contact.id}_${gf.id}`] = dist <= gf.radiusMeters;
      });
    });
    geofenceStatesRef.current = initialStates;

    if (userLat && userLng) {
      setIsInitialized(true);
    }
  }, [userLat, userLng, refLat, refLng, isInitialized]);

  // Sync to local storage
  const updateContactsState = useCallback((newContacts: HubContact[]) => {
    setContacts(newContacts);
    findHubService.saveContacts(newContacts);
  }, []);

  // Set up background geofence check logic
  const checkGeofences = useCallback((updatedContacts: HubContact[]) => {
    let alertTriggered = false;
    const currentAlerts = [...findHubService.getAlerts()];

    const nextStates = { ...geofenceStatesRef.current };

    updatedContacts.forEach(contact => {
      contact.geofences.forEach(gf => {
        if (!gf.isEnabled) return;

        const dist = getDistanceMeters(contact.latitude, contact.longitude, gf.latitude, gf.longitude);
        const isInsideNow = dist <= gf.radiusMeters;
        const stateKey = `${contact.id}_${gf.id}`;
        const wasInside = geofenceStatesRef.current[stateKey];

        // Only trigger if we have a defined previous state and it changed
        if (wasInside !== undefined && wasInside !== isInsideNow) {
          if (isInsideNow && gf.triggerOnArrive) {
            // ARRIVED
            const message = `${contact.username} has arrived at ${gf.label} (${Math.round(dist)}m range)`;
            const newAlert: HubAlertLog = {
              id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              contactId: contact.id,
              username: contact.username,
              avatar: contact.avatar,
              geofenceLabel: gf.label,
              eventType: 'arrive',
              timestamp: Date.now(),
              message,
              isRead: false
            };
            currentAlerts.unshift(newAlert);
            alertTriggered = true;

            if (triggerAlert) {
              triggerAlert('Find Hub Alert', message);
            }
            if (triggerHaptic) {
              triggerHaptic('heavy');
            }
          } else if (!isInsideNow && gf.triggerOnLeave) {
            // LEFT
            const message = `${contact.username} has left ${gf.label}`;
            const newAlert: HubAlertLog = {
              id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              contactId: contact.id,
              username: contact.username,
              avatar: contact.avatar,
              geofenceLabel: gf.label,
              eventType: 'leave',
              timestamp: Date.now(),
              message,
              isRead: false
            };
            currentAlerts.unshift(newAlert);
            alertTriggered = true;

            if (triggerAlert) {
              triggerAlert('Find Hub Alert', message);
            }
            if (triggerHaptic) {
              triggerHaptic('heavy');
            }
          }
        }

        nextStates[stateKey] = isInsideNow;
      });
    });

    if (alertTriggered) {
      findHubService.saveAlerts(currentAlerts.slice(0, 100));
      setAlerts(currentAlerts);
    }
    geofenceStatesRef.current = nextStates;
  }, [triggerAlert, triggerHaptic]);

  // Toggle tracking lock-on
  const toggleLockOn = useCallback((contactId: string) => {
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        const nextState = !c.lockOnEnabled;
        if (triggerHaptic) triggerHaptic('medium');
        return { ...c, lockOnEnabled: nextState, lastUpdated: Date.now() };
      }
      return c;
    });
    updateContactsState(updated);
  }, [contacts, updateContactsState, triggerHaptic]);

  // Update geofence settings
  const toggleGeofence = useCallback((contactId: string, geofenceId: string) => {
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        const updatedGfs = c.geofences.map(gf => {
          if (gf.id === geofenceId) {
            return { ...gf, isEnabled: !gf.isEnabled };
          }
          return gf;
        });
        return { ...c, geofences: updatedGfs };
      }
      return c;
    });
    updateContactsState(updated);
    if (triggerHaptic) triggerHaptic('light');
  }, [contacts, updateContactsState, triggerHaptic]);

  // Add a custom geofence
  const addGeofence = useCallback((contactId: string, label: string, lat: number, lng: number, radius = 200) => {
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        const newGf: GeofenceConfig = {
          id: `gf_${Date.now()}`,
          label,
          latitude: lat,
          longitude: lng,
          radiusMeters: radius,
          triggerOnArrive: true,
          triggerOnLeave: true,
          isEnabled: true
        };
        return { ...c, geofences: [...c.geofences, newGf] };
      }
      return c;
    });
    updateContactsState(updated);
    
    // Seed state for new geofence
    setTimeout(() => {
      const contact = updated.find(c => c.id === contactId);
      if (contact) {
        const gf = contact.geofences[contact.geofences.length - 1];
        const dist = getDistanceMeters(contact.latitude, contact.longitude, gf.latitude, gf.longitude);
        geofenceStatesRef.current[`${contact.id}_${gf.id}`] = dist <= gf.radiusMeters;
      }
    }, 50);

    if (triggerHaptic) triggerHaptic('medium');
  }, [contacts, updateContactsState, triggerHaptic]);

  // Delete a geofence
  const deleteGeofence = useCallback((contactId: string, geofenceId: string) => {
    const updated = contacts.map(c => {
      if (c.id === contactId) {
        return { ...c, geofences: c.geofences.filter(gf => gf.id !== geofenceId) };
      }
      return c;
    });
    updateContactsState(updated);
    delete geofenceStatesRef.current[`${contactId}_${geofenceId}`];
    if (triggerHaptic) triggerHaptic('light');
  }, [contacts, updateContactsState, triggerHaptic]);

  // Clear alert logs
  const clearAlertLogs = useCallback(() => {
    findHubService.clearAlerts();
    setAlerts([]);
    if (triggerHaptic) triggerHaptic('medium');
  }, [triggerHaptic]);

  // Mark all alerts as read
  const markAlertsRead = useCallback(() => {
    const updated = alerts.map(a => ({ ...a, isRead: true }));
    findHubService.saveAlerts(updated);
    setAlerts(updated);
  }, [alerts]);

  // Location simulation step (Simulates active device updates, moving users towards/away from geofences)
  const simulateMovement = useCallback(() => {
    const updated = contacts.map(c => {
      if (!c.lockOnEnabled) return c; // only move lock-on enabled users

      // Determine a target geofence or shift randomly
      let nextLat = c.latitude;
      let nextLng = c.longitude;

      if (c.geofences.length > 0) {
        // Find a random geofence
        const gf = c.geofences[Math.floor(Math.random() * c.geofences.length)];
        const dist = getDistanceMeters(c.latitude, c.longitude, gf.latitude, gf.longitude);

        if (dist > gf.radiusMeters + 100) {
          // Outside: move towards geofence center to trigger an "Arrive" event!
          const stepRatio = 0.5; // snap 50% closer
          nextLat = c.latitude + (gf.latitude - c.latitude) * stepRatio;
          nextLng = c.longitude + (gf.longitude - c.longitude) * stepRatio;
        } else {
          // Inside: move outside of the geofence radius to trigger a "Leave" event!
          const angle = Math.random() * Math.PI * 2;
          const offsetDistDeg = (gf.radiusMeters + 150) / 111111; // convert meters to rough degree offset
          nextLat = gf.latitude + Math.cos(angle) * offsetDistDeg;
          nextLng = gf.longitude + Math.sin(angle) * offsetDistDeg;
        }
      } else {
        // Fallback random jitter
        const jitterLat = (Math.random() - 0.5) * 0.003;
        const jitterLng = (Math.random() - 0.5) * 0.003;
        nextLat += jitterLat;
        nextLng += jitterLng;
      }

      return {
        ...c,
        latitude: nextLat,
        longitude: nextLng,
        lastUpdated: Date.now()
      };
    });

    updateContactsState(updated);
    checkGeofences(updated);
    
    if (triggerHaptic) triggerHaptic('light');
  }, [contacts, updateContactsState, checkGeofences, triggerHaptic]);

  return {
    contacts,
    alerts,
    toggleLockOn,
    toggleGeofence,
    addGeofence,
    deleteGeofence,
    clearAlertLogs,
    markAlertsRead,
    simulateMovement,
  };
}
