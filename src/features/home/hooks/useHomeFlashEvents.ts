import { useState, useEffect } from 'react';
import { dispatchFlashEventCreated } from '@/lib/pushNotifications';

export const useHomeFlashEvents = ({ profile, updateProfilePoints, latitude, longitude, triggerHaptic, triggerAlert }: any) => {
  const [flashEvents, setFlashEvents] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('vq_flash_events');
      if (cached) {
        const parsed = JSON.parse(cached);
        const valid = parsed.filter((ev: any) => ev.timeLeft > 0);
        if (valid.length > 0) return valid;
      }
    } catch (e) {
      console.error("Error reading flash events cache:", e);
    }
    
    // Seed default flash event as requested in spec
    const defaultEvent = {
      id: "flash_default_seed",
      title: "Secret Pop-up Gallery",
      description: "An exclusive, invitation-only underground art installation with neon projections, synth soundscapes, and interactive holographic panels.",
      targetLat: 36.8065,
      targetLng: 10.1815,
      timeLeft: 7200, // 2 hours
      initialTime: 7200,
      reward: 500,
      claimed: false,
      entryType: 'free',
      parking: true,
      transport: true,
      creator: "Alex Rivera",
      rules: "No cameras, password is 'Aether', respect the artists",
      comment: "Look for the door with the purple glow in the alleyway.",
      photos: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop"],
      interestedUsers: ["Elena Vance", "Marcus Brody", "John Doe", "Jane Smith"],
      goingUsers: ["Alex Rivera", "Bob Johnson"]
    };
    return [defaultEvent];
  });

  const [showEventAlertModal, setShowEventAlertModal] = useState<any | null>(null);
  const [showFlashListModal, setShowFlashListModal] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [showCreateFlashModal, setShowCreateFlashModal] = useState(false);

  // Form states
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createRules, setCreateRules] = useState('');
  const [createDuration, setCreateDuration] = useState(120);
  const [createLocationOffset, setCreateLocationOffset] = useState('current');
  const [createEntryType, setCreateEntryType] = useState('free');
  const [createPrice, setCreatePrice] = useState('');
  const [createParking, setCreateParking] = useState(false);
  const [createTransport, setCreateTransport] = useState(false);
  const [createReward, setCreateReward] = useState(500);
  const [createComment, setCreateComment] = useState('');
  const [createPhotos, setCreatePhotos] = useState<string[]>([]);

  // Synchronize state changes to localStorage
  useEffect(() => {
    localStorage.setItem('vq_flash_events', JSON.stringify(flashEvents));
  }, [flashEvents]);

  // Handle push notification tap listeners
  useEffect(() => {
    const handleTap = (e: Event) => {
      const customEv = e as CustomEvent;
      const event = customEv.detail;
      if (event) {
        setShowEventAlertModal({ ...event, step: 'detect' });
      }
    };
    window.addEventListener('vq_flash_event_tap', handleTap);
    return () => window.removeEventListener('vq_flash_event_tap', handleTap);
  }, []);

  // Countdown background loop (timer logic)
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashEvents(prev => {
        const updated = prev.map(event => ({
          ...event,
          timeLeft: Math.max(0, event.timeLeft - 1)
        })).filter(event => event.timeLeft > 0);

        if (showEventAlertModal) {
          const currentModalActive = updated.find(e => e.id === showEventAlertModal.id);
          if (!currentModalActive) {
            setShowEventAlertModal(null);
          } else {
            setShowEventAlertModal((prevModal: any) => ({
              ...prevModal,
              timeLeft: Math.max(0, prevModal.timeLeft - 1),
              claimed: currentModalActive.claimed
            }));
          }
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showEventAlertModal]);

  const handleCreateFlashEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createDesc.trim()) {
      triggerAlert("⚠️ Error", "Please provide a Title and description for your Secret Flash Event!");
      return;
    }

    const userLat = latitude || 36.8065;
    const userLng = longitude || 10.1815;

    let targetLat = userLat;
    let targetLng = userLng;

    if (createLocationOffset === '200m_north') {
      targetLat += 0.0018;
    } else if (createLocationOffset === '500m_east') {
      targetLng += 0.0045;
    } else if (createLocationOffset === '1km_west') {
      targetLng -= 0.009;
    } else if (createLocationOffset === '2km_south') {
      targetLat -= 0.018;
    } else if (createLocationOffset === '5km_north') {
      targetLat += 0.045;
    } else if (createLocationOffset === '10km_east') {
      targetLng += 0.09;
    }

    const newEvent = {
      id: `flash_user_${Date.now()}`,
      title: createTitle,
      description: createDesc,
      rules: createRules || "Respect the space, keep it low-key.",
      comment: createComment || "",
      photos: createPhotos,
      targetLat,
      targetLng,
      timeLeft: createDuration * 60,
      initialTime: createDuration * 60,
      reward: createReward,
      claimed: false,
      entryType: createEntryType,
      price: createEntryType === 'paid' ? createPrice : null,
      parking: createParking,
      transport: createTransport,
      creator: profile?.displayName || "Local Explorer",
      interestedUsers: [],
      goingUsers: []
    };

    setFlashEvents(prev => [newEvent, ...prev]);
    dispatchFlashEventCreated(newEvent);

    // Reset Form
    setCreateTitle('');
    setCreateDesc('');
    setCreateRules('');
    setCreateComment('');
    setCreatePhotos([]);
    setCreateDuration(120);
    setCreateLocationOffset('current');
    setCreateEntryType('free');
    setCreatePrice('');
    setCreateParking(false);
    setCreateTransport(false);
    setCreateReward(500);

    setShowCreateFlashModal(false);
    triggerHaptic('heavy');
    triggerAlert("✨ Live Flash Created!", `"${createTitle}" is now live on the alert board for explorers in your area!`);
  };

  const handleToggleRsvp = (type: 'interested' | 'going') => {
    if (!showEventAlertModal) return;
    triggerHaptic('medium');
    const currentUser = profile?.displayName || "Sarah J.";
    const eventId = showEventAlertModal.id;

    setFlashEvents(prev => {
      const updated = prev.map(event => {
        if (event.id === eventId) {
          let interested = Array.isArray(event.interestedUsers) ? [...event.interestedUsers] : [];
          let going = Array.isArray(event.goingUsers) ? [...event.goingUsers] : [];

          if (type === 'interested') {
            if (interested.includes(currentUser)) {
              interested = interested.filter(u => u !== currentUser);
            } else {
              interested.push(currentUser);
              going = going.filter(u => u !== currentUser);
            }
          } else if (type === 'going') {
            if (going.includes(currentUser)) {
              going = going.filter(u => u !== currentUser);
            } else {
              going.push(currentUser);
              interested = interested.filter(u => u !== currentUser);
            }
          }

          const updatedEvent = { ...event, interestedUsers: interested, goingUsers: going };

          setShowEventAlertModal((prevModal: any) => {
            if (prevModal && prevModal.id === eventId) {
              return { ...prevModal, ...updatedEvent };
            }
            return prevModal;
          });

          return updatedEvent;
        }
        return event;
      });
      return updated;
    });
  };

  const handleClaimFlashReward = async (event: any) => {
    try {
      if (updateProfilePoints) {
        await updateProfilePoints(event.reward);
      }

      // Add activity log to purse activities
      const ledgerActivitiesStr = localStorage.getItem('vq_ledger_activities');
      let parsedActivities = [];
      if (ledgerActivitiesStr) {
        parsedActivities = JSON.parse(ledgerActivitiesStr);
      }
      const newTx = {
        id: `tx-flash-${Date.now()}`,
        type: 'quest',
        amount: `+${event.reward} VQ`,
        sender: event.title,
        date: 'Just now'
      };
      parsedActivities.unshift(newTx);
      localStorage.setItem('vq_ledger_activities', JSON.stringify(parsedActivities));

      setFlashEvents(prev => prev.map(e => e.id === event.id ? { ...e, claimed: true } : e));
      if (showEventAlertModal) {
        setShowEventAlertModal((prev: any) => prev ? { ...prev, claimed: true } : null);
      }
      triggerHaptic('heavy');
      triggerAlert("✨ Success!", `You claimed +${event.reward} VQ points! Check your Purse Ledger.`);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    flashEvents,
    setFlashEvents,
    showEventAlertModal,
    setShowEventAlertModal,
    showFlashListModal,
    setShowFlashListModal,
    isListExpanded,
    setIsListExpanded,
    showCreateFlashModal,
    setShowCreateFlashModal,

    // Form states & setters
    createTitle,
    setCreateTitle,
    createDesc,
    setCreateDesc,
    createRules,
    setCreateRules,
    createDuration,
    setCreateDuration,
    createLocationOffset,
    setCreateLocationOffset,
    createEntryType,
    setCreateEntryType,
    createPrice,
    setCreatePrice,
    createParking,
    setCreateParking,
    createTransport,
    setCreateTransport,
    createReward,
    setCreateReward,
    createComment,
    setCreateComment,
    createPhotos,
    setCreatePhotos,

    // Handlers
    handleCreateFlashEvent,
    handleToggleRsvp,
    handleClaimFlashReward
  };
};
