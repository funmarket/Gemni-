export const venueDescriptions: Record<string, { desc: string; vibe: string; hours: string; links: string }> = {
  'v-3': {
    desc: "An incredible industrial-chic open roastery with a beautiful, sunlit central courtyard. Perfect for focusing, sketching, or experiencing artisan hand-brews.",
    vibe: "🌿 Creative Focus & Acoustic Ambient",
    hours: "07:00 - 18:00 Local Time",
    links: "Sightglass Coffee Courtyard, San Francisco"
  },
  'v-5': {
    desc: "The world-famous historic community mural alleyway. A critical bastion for street art activism, underground vinyl trading, and local writer circles.",
    vibe: "🎨 Street Art Activism & Vinyl Culture",
    hours: "24/7 Outdoor Spectrogram Open",
    links: "Clarion Alley Art Block, San Francisco"
  },
  'v-1': {
    desc: "A hidden, alternative botanical tea sanctuary serving rare loose-leaf herbal harvests behind anonymous wooden gates. Zero digital noise permitted.",
    vibe: "🍵 Slow-Restoration & Unplugged Reflection",
    hours: "11:00 - 21:00 Local Time",
    links: "Local Tealicious Garden, Oakland"
  }
};

export const curatedCoordinates = [
  { id: 'cc-1', name: 'Bardo Ottoman Palace Gate', desc: '18th Century historic mosaic-walled courtyard and tea garden.', loc: 'Tunis Medina', points: 40, icon: '🏛️' },
  { id: 'cc-2', name: 'Clarion Secret Vinyl Vault', desc: 'Unmarked brick alley entrance hosting raw local synth exchanges.', loc: 'Mission District, SF', points: 60, icon: '🎹' },
  { id: 'cc-3', name: 'Telegraph Hand-Brew Sanctum', desc: 'Alternative collective-run performance space serving dark coffee.', loc: 'Telegraph Ave, Oakland', points: 50, icon: '☕' }
];

export const getActivitiesForCity = (city: any) => {
  const cityStr = typeof city === 'string' ? city : String(city || 'Current Location');
  const cleanCity = cityStr.split(',')[0].trim();
  
  if (cleanCity.toLowerCase().includes('san francisco') || cleanCity.toLowerCase().includes('sf')) {
    return [
      { text: 'Live music starting at Blue Note Jazz Club', emoji: '🎵', location: 'Mission District' },
      { text: 'Clarion Alley color swap session - +3 people joined', emoji: '🎨', location: 'Valencia Corridor' },
      { text: 'Sightglass espresso share - +5 checkins', emoji: '☕', location: 'SOMA' },
      { text: 'Acoustic jam sunset circle forming on the grass mound', emoji: '🎸', location: 'Dolores Heights' },
      { text: 'Sunset drum circle gathering at Dolores Hill', emoji: '🌅', location: 'Dolores Heights' },
      { text: 'Private silent tea exchange invitation posted', emoji: '🍵', location: 'Pacific Heights' }
    ];
  }
  
  if (cleanCity.toLowerCase().includes('oakland')) {
    return [
      { text: 'Lake Temescal acoustic session in the park', emoji: '🎵', location: 'Temescal' },
      { text: 'Grand Lake Theater organ performance', emoji: '🎭', location: 'Grand Lake' },
      { text: 'Red Bay Coffee Roastery espresso flight', emoji: '☕', location: 'Fruitvale' },
      { text: 'Jack London Square sunset waterfront walk', emoji: '🌅', location: 'Waterfront' },
      { text: 'First Friday art murmur popup stalls', emoji: '🎨', location: 'Telegraph Ave' },
      { text: 'West Oakland industrial metal synth jam', emoji: '🎸', location: 'West Oakland' }
    ];
  }

  if (cleanCity.toLowerCase().includes('tunis')) {
    return [
      { text: 'Sunset Oud performance at Café des Nattes', emoji: '🎵', location: 'Sidi Bou Said' },
      { text: 'Contemporary art fair live check-ins', emoji: '🎨', location: 'Medina of Tunis' },
      { text: 'Traditional mint tea tasting and acoustic fusion', emoji: '🍵', location: 'La Marsa' },
      { text: 'Sidi Bou Said scenic harbor vibe walk', emoji: '🌅', location: 'Cliffside' },
      { text: 'Bardo historical exploration group meetup', emoji: '🎭', location: 'Le Bardo' },
      { text: 'Artisanal jasmine swap session', emoji: '🌸', location: 'Carthage' }
    ];
  }

  return [
    { text: `Live acoustic jam sessions forming in downtown ${cleanCity}`, emoji: '🎵', location: 'Downtown Hub' },
    { text: `Aesthetic neighborhood espresso bar flight checkins`, emoji: '☕', location: 'Old Quarter' },
    { text: `Independent pop-up art installation check-ins`, emoji: '🎨', location: 'Creative District' },
    { text: `Decentralized sunset drum gathering in ${cleanCity}`, emoji: '🌅', location: 'Scenic overlook' },
    { text: `Bookstore poetry reading & silent sharing session`, emoji: '📖', location: 'Arts District' },
    { text: `Community organic herbal tea exchange loop`, emoji: '🍵', location: 'Botanical enclave' }
  ];
};

export const getLiveActivityPhoto = (emoji: string) => {
  switch (emoji) {
    case '🎵': return 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=150&h=150&q=80';
    case '☕': return 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=150&h=150&q=80';
    case '🎨': return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=150&h=150&q=80';
    case '🍽️': return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=150&h=150&q=80';
    case '🎭': return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&h=150&q=80';
    case '🌅': return 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=150&h=150&q=80';
    case '🎸': return 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=150&h=150&q=80';
    case '🍵': return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=150&h=150&q=80';
    default: return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&h=150&q=80';
  }
};

export const getEventPhoto = (id: string) => {
  const term = id.toLowerCase();
  if (term === 'ev-1' || term.includes('swap') || term.includes('meet') || term.includes('assembly')) {
    return 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=150&h=150&q=80';
  }
  if (term === 'ev-2' || term.includes('synth') || term.includes('audio') || term.includes('lab') || term.includes('noise')) {
    return 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=150&h=150&q=80';
  }
  if (term === 'ev-4' || term.includes('acoustic') || term.includes('jam') || term.includes('sunset') || term.includes('circle')) {
    return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&h=150&q=80';
  }
  if (term === 'ev-5' || term.includes('oud') || term.includes('music') || term.includes('trio') || term.includes('sing')) {
    return 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=150&h=150&q=80';
  }
  
  // Hash function to pick a stable Unsplash image based on event title
  const index = Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const randomCovers = [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=150&h=150&q=80', // stage
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=150&h=150&q=80', // crowdy outdoor fest
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=150&h=150&q=80', // art lights
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=150&h=150&q=80', // lounge/instruments
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=150&h=150&q=80'  // ambient neon scene
  ];
  return randomCovers[index % randomCovers.length];
};

export const getVenuePhoto = (id: string) => {
  switch (id) {
    case 'v-3': return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&h=200&q=80';
    case 'v-5': return 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=300&h=200&q=80';
    case 'v-1': return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&h=200&q=80';
    default: return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&h=200&q=80';
  }
};

export const feedPosts = {
  network: [
    {
      id: 'p-net-1',
      author: '@haight_vibe',
      avatar: '🎒',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      text: 'Acquired a super rare analog synth tape from the record swap tonight! Anyone down to host an assembly in the park?',
      votes: 16,
      time: '35m ago',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      zone: 'AMBER'
    },
    {
      id: 'p-net-2',
      author: '@manga_fox',
      avatar: '🦊',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      text: 'Checked into Golden Gate tea terrace. Spontaneous tea sessions are completely active! Come say hello.',
      votes: 9,
      time: '2h ago',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      zone: 'COZY'
    }
  ],
  local: [
    {
      id: 'p-loc-1',
      author: '@sf_explorer',
      avatar: '👽',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80',
      text: 'Sightglass coffee courtyard has a cozy music jam forming near the back roasters. Fully analog live jam, no screens allowed!',
      votes: 24,
      time: '8m ago',
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=600&q=80',
      zone: 'AMBER'
    },
    {
      id: 'p-loc-2',
      author: '@mission_soul',
      avatar: '🎨',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
      text: 'Finished coloring the community paint block inside Clarion Alley. The vibe is so vibrant and positive right now!',
      votes: 31,
      time: '1h ago',
      image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=600&q=80',
      zone: 'CREATIVE'
    }
  ],
  foryou: [
    {
      id: 'p-fy-1',
      author: '@acoustic_breeze',
      avatar: '🎸',
      avatarUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=120&h=120&q=80',
      text: 'Acoustic jam sunset circle forming on the grass mound of Dolores hillside. High compliance, pure human rhythm.',
      votes: 52,
      time: '12m ago',
      image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80',
      zone: 'WARM'
    },
    {
      id: 'p-fy-2',
      author: '@zen_stroller',
      avatar: '🚶',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80',
      text: 'Stroll club is coordinating a night walk through the lantern rows of Chinatown. Completely serverless, safe & friendly atmosphere.',
      votes: 41,
      time: '3h ago',
      image: 'https://images.unsplash.com/photo-1525230071276-4a87f42f469e?auto=format&fit=crop&w=600&q=80',
      zone: 'CHILLED'
    }
  ]
};

export const INITIAL_UPCOMING_ACTIVITIES = [
  { id: 'act-up-1', text: 'Spontaneous acoustic cello performance and tea sharing', emoji: '🎻', location: 'Telegraph Ave', date: 'Tomorrow 15:00', author: 'Malek G. (Level 4 Voyager)' },
  { id: 'act-up-2', text: 'Cozy vinyl listening round and sketch swap meet', emoji: '🎨', location: 'Mission Courtyard', date: 'Wednesday 18:30', author: 'Sarah K. (Level 3 Sentinel)' },
  { id: 'act-up-3', text: 'Decentralized outdoor yoga alignment & raw matcha flight', emoji: '🧘‍♀️', location: 'Presidio Grove', date: 'Saturday 09:00', author: 'Nadia B. (Level 5 Explorer)' }
];
