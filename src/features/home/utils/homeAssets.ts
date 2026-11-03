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
