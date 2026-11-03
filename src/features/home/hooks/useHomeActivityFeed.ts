import { useState, useEffect } from 'react';
import { getActivitiesForCity } from '../utils/homeCityActivities';

export const useHomeActivityFeed = ({ cityName, triggerHaptic }: any) => {
  const [selectedCity, setSelectedCity] = useState<'current'>('current');
  const [liveActivityFeed, setLiveActivityFeed] = useState<any[]>([]);

  const handleCityChange = (city: 'current') => {
    if (triggerHaptic) triggerHaptic('light');
    setSelectedCity(city);
    
    const activeCityName = cityName || 'Current GPS';
    const cityActivities = getActivitiesForCity(activeCityName);
    
    setLiveActivityFeed(cityActivities.slice(0, 3).map((act, idx) => ({
      ...act,
      id: `l-init-${Date.now()}-${idx}`,
      timestamp: Date.now() - (idx * 50000)
    })));
  };

  const updateLiveActivityFeed = () => {
    const activeCityName = cityName || 'Current GPS';
    const pool = getActivitiesForCity(activeCityName);
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const newActivity = {
      id: `l-live-${Date.now()}`,
      text: picked.text,
      emoji: picked.emoji,
      timestamp: Date.now(),
      location: picked.location
    };
    setLiveActivityFeed(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    const activeCityName = cityName || 'Current GPS';
    const cityActivities = getActivitiesForCity(activeCityName);
    
    setLiveActivityFeed(cityActivities.slice(0, 3).map((act, idx) => ({
      ...act,
      id: `l-init-${Date.now()}-${idx}`,
      timestamp: Date.now() - (idx * 50000)
    })));

    const ticker = setInterval(() => {
      updateLiveActivityFeed();
    }, 18000); // 18-sec update interval matching original code logic

    return () => clearInterval(ticker);
  }, [cityName]);

  return {
    selectedCity,
    liveActivityFeed,
    setLiveActivityFeed,
    handleCityChange
  };
};
