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
