import { triggerHaptic } from '../services/device/haptics';

export const openDeviceMap = (name: string, location: string) => {
  triggerHaptic('light');
  const query = encodeURIComponent(`${name} ${location}`);
  
  // Try mapping apps specifically first
  if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    window.location.href = `maps://maps.apple.com/?q=${query}`;
  } else {
    // For Android, this intent format correctly prompts maps apps
    window.location.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
};
