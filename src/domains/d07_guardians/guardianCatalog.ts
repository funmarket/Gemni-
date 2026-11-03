/**
 * Canonical Domain 07: Guardians Directory Catalog
 * Baseline directory representations linked to real Supabase profiles.
 * Preserved outside the React component tree per architecture specifications.
 */

import { VibeGuardian } from '@/features/explore/components/VibeGuardians/types';

// Helper to compute recent ISO dates relative to now
const getDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const CANONICAL_GUARDIANS_CATALOG: VibeGuardian[] = [
  {
    id: 'guardian-elena',
    name: 'Elena Rostova',
    handle: '@elena_urbanwalks',
    type: 'pro',
    city: 'San Francisco',
    stateCountry: 'California, US',
    age: 29,
    hideAge: false,
    selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    selfieCapturedAt: getDaysAgo(1), // Fresh: 1 day ago
    hasActiveProSubscription: true,
    showInHireSuggestions: true,
    hiresCount: 84,
    pricingType: 'hourly',
    hourlyRate: 35,
    priceDisplay: '$35 / hr',
    experience: '6 years certified cultural tour lead & architectural historian',
    hobbies: ['Film Photography', 'Mid-century Architecture', 'Espresso Roasting', 'Bouldering'],
    trails: [
      { id: 't-sf-murals', title: 'Clarion Alley Murals & Roasteries Loop', link: '/trail/t-sf-murals' },
      { id: 't-sf-twinpeaks', title: 'Twin Peaks Sunset Ridgeline', link: '/trail/t-sf-twinpeaks' },
      { id: 't-sf-stairs', title: 'Telegraph Hill Hidden Stairways Circuit', link: '/trail/t-sf-stairs' },
      { id: 't-sf-presidio', title: 'Presidio Ancient Cypress Groves', link: '/trail/t-sf-presidio' }
    ],
    favoriteTrails: ['Clarion Alley Murals & Roasteries Loop', 'Twin Peaks Sunset Ridgeline', 'Telegraph Hill Hidden Stairways Circuit'],
    preMadeTours: [
      {
        id: 'tour-elena-1',
        title: 'Hidden Architecture & Specialty Coffee Walk',
        description: 'Immersive 2.5h expedition through secret alley murals, roasteries, and private rooftop views.',
        duration: '2.5 hours',
        whatsIncluded: ['Hand-poured single origin tasting', 'Curated print architecture zine', 'Digital film portrait photos'],
        meetingPoint: 'Sightglass Coffee Courtyard (270 7th St)',
        pricingType: 'hourly',
        price: '$35 / hour',
        photos: [
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80'
        ],
        availableSlots: ['Today 2:00 PM', 'Tomorrow 10:00 AM', 'Saturday 11:30 AM', 'Sunday 3:00 PM']
      }
    ],
    bio: 'Professional urban expedition leader. I reveal the hidden murals, architectural gems, and quiet courtyard cafes ordinary tourists walk right past.',
    earnedBadges: [
      { badge: 'Good Vibe', count: 48 },
      { badge: 'Cool Vibe', count: 26 },
      { badge: 'Chill Vibe', count: 18 }
    ],
    reviews: [
      {
        id: 'rev-1',
        author: 'Marco K.',
        authorHandle: '@marcovibe',
        badge: 'Cool Vibe',
        note: 'Elena showed us hidden speakeasies and alley murals you would never find alone. Truly next-level guide!',
        createdAt: '2 days ago'
      },
      {
        id: 'rev-2',
        author: 'Aisha T.',
        authorHandle: '@aisha_quest',
        badge: 'Good Vibe',
        note: 'Super knowledgeable and patient. Turned a foggy SF afternoon into an unforgettable photo tour.',
        createdAt: '1 week ago'
      }
    ],
    handshakes: ['usr_hannibal_1337', 'marco_k'],
    suggestedBy: {
      author: 'David Chen',
      role: 'Explorer & Photographer',
      note: 'Booked Elena for our group visiting from Seattle. Best investment for discovering the authentic creative pulse of the city.'
    }
  },
  {
    id: 'guardian-malik',
    name: 'Malik Ben Youssef',
    handle: '@malik_medina',
    type: 'pro',
    city: 'Tunis',
    stateCountry: 'Tunisia',
    age: 33,
    hideAge: false,
    selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    selfieCapturedAt: getDaysAgo(2), // 2 days ago
    hasActiveProSubscription: true,
    showInHireSuggestions: true,
    hiresCount: 68,
    pricingType: 'flat',
    flatRate: 85,
    priceDisplay: '$85 flat tour',
    experience: '8 years professional Mediterranean heritage & culinary guide',
    hobbies: ['Traditional Lute', 'Calligraphy', 'Coastal Cycling', 'Mint Tea Roasts'],
    trails: [
      { id: 't-tunis-medina', title: 'Medina Labyrinth & Rooftop Palaces', link: '/trail/t-tunis-medina', flatPrice: 85 },
      { id: 't-tunis-sidi', title: 'Sidi Bou Said Jasmine & Blue Doors', link: '/trail/t-tunis-sidi', flatPrice: 75 },
      { id: 't-tunis-carthage', title: 'Carthage Byrsa Hill Odyssey', link: '/trail/t-tunis-carthage', flatPrice: 90 }
    ],
    favoriteTrails: ['Medina Labyrinth & Rooftop Palaces', 'Sidi Bou Said Jasmine & Blue Doors', 'Carthage Byrsa Hill Odyssey'],
    preMadeTours: [
      {
        id: 'tour-malik-1',
        title: 'Master Artisans & Palace Rooftops of the Medina',
        description: 'Private 3-hour journey through centuries-old copper ateliers, perfume makers, and panoramic tea terraces.',
        duration: '3 hours',
        whatsIncluded: ['Access to 2 private historic palaces', 'Traditional pine-nut mint tea', 'Artisan leather gift'],
        meetingPoint: 'Bab Bhar (Sea Gate / Porte de France)',
        pricingType: 'flat',
        price: '$85 flat rate',
        photos: [
          'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80'
        ],
        availableSlots: ['Tomorrow 9:30 AM', 'Friday 2:00 PM', 'Sunday 10:00 AM']
      }
    ],
    bio: 'Licensed heritage storyteller and culinary explorer. Connecting travelers with traditional artisans, rooftop viewpoints, and authentic Mediterranean recipes.',
    earnedBadges: [
      { badge: 'Chill Vibe', count: 42 },
      { badge: 'Good Vibe', count: 31 },
      { badge: 'Cool Vibe', count: 19 }
    ],
    reviews: [
      {
        id: 'rev-3',
        author: 'Chloe L.',
        authorHandle: '@chloe_wanders',
        badge: 'Chill Vibe',
        note: 'Malik opened private artisan workshops for us in the Medina. Unmatched hospitality and warmth.',
        createdAt: '3 days ago'
      }
    ],
    handshakes: ['usr_hannibal_1337', 'chloe_wanders'],
    suggestedBy: {
      author: 'Sophie Martin',
      role: 'Documentary Filmmaker',
      note: 'Malik knows every master artisan in the old city by first name. Essential pro guide for heritage buffs.'
    }
  },
  {
    id: 'guardian-tariq',
    name: 'Tariq Vance',
    handle: '@tariq_soundscapes',
    type: 'pro',
    city: 'San Francisco',
    stateCountry: 'California, US',
    age: 31,
    hideAge: true,
    selfieUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    selfieCapturedAt: getDaysAgo(3), // 3 days ago
    hasActiveProSubscription: true,
    showInHireSuggestions: true,
    hiresCount: 52,
    pricingType: 'hourly',
    hourlyRate: 40,
    priceDisplay: '$40 / hr',
    experience: '4 years vinyl archivist & nightlife acoustic curator',
    hobbies: ['Analog Synthesizers', 'Deep Listening Sessions', 'Night Running', 'Record Digging'],
    trails: [
      { id: 't-sf-vinyl', title: 'Haight Ashbury Psychedelic Vinyl Crawl', link: '/trail/t-sf-vinyl' },
      { id: 't-sf-jazz', title: 'North Beach Beat Generation Jazz Trail', link: '/trail/t-sf-jazz' },
      { id: 't-sf-ambient', title: 'Embarcadero Midnight Ambient Walk', link: '/trail/t-sf-ambient' }
    ],
    favoriteTrails: ['Haight Ashbury Psychedelic Vinyl Crawl', 'North Beach Beat Generation Jazz Trail', 'Embarcadero Midnight Ambient Walk'],
    preMadeTours: [
      {
        id: 'tour-tariq-1',
        title: 'Analog Vinyl Digging & Listening Room Session',
        description: 'Explore 3 tucked-away record cellars and test rare Japanese vinyl pressings in a private acoustic studio.',
        duration: '2 hours',
        whatsIncluded: ['Listening room reservation', 'Custom curated tape recording', 'Herbal tonic beverage'],
        meetingPoint: 'Amoeba Music Entrance (Haight St)',
        pricingType: 'hourly',
        price: '$40 / hour',
        photos: [
          'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80'
        ],
        availableSlots: ['Thursday 6:00 PM', 'Friday 7:30 PM', 'Saturday 4:00 PM']
      }
    ],
    bio: 'Sound designer & independent guide specializing in underground acoustic history, vinyl haunts, and sunset soundwalks across the Bay.',
    earnedBadges: [
      { badge: 'Cool Vibe', count: 38 },
      { badge: 'Good Vibe', count: 29 },
      { badge: 'Chill Vibe', count: 18 }
    ],
    reviews: [
      {
        id: 'rev-4',
        author: 'Kenji S.',
        authorHandle: '@kenji_groove',
        badge: 'Cool Vibe',
        note: 'Took us to three hidden vinyl basements and played analog synths with the shop owners. Legendary night!',
        createdAt: '4 days ago'
      }
    ],
    handshakes: ['kenji_groove']
  },
  {
    id: 'guardian-hana',
    name: 'Hana Khelil',
    handle: '@hana_locallens',
    type: 'local',
    city: 'Tunis',
    stateCountry: 'Tunisia',
    age: 24,
    hideAge: false,
    selfieUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    selfieCapturedAt: getDaysAgo(1), // 1 day ago
    hasActiveProSubscription: false,
    hiresCount: 31,
    experience: 'Lifelong resident, student artist & coastal wanderer',
    hobbies: ['Street Sketching', 'Botanical Walks', 'Baking Makroudh', 'Vintage Thrifting'],
    trails: [
      { id: 't-tunis-marsa', title: 'La Marsa Sea Cliff Sunset Circuit', link: '/trail/t-tunis-marsa' },
      { id: 't-tunis-gammarth', title: 'Gammarth Pine Forest Path', link: '/trail/t-tunis-gammarth' },
      { id: 't-tunis-souika', title: 'Bab Souika Street Food Alley', link: '/trail/t-tunis-souika' }
    ],
    favoriteTrails: ['La Marsa Sea Cliff Sunset Circuit', 'Gammarth Pine Forest Path', 'Bab Souika Street Food Alley'],
    bio: 'Proud local artist! I love meeting explorers, swapping stories, showing people where the real locals hang out for coffee, and sketching together by the sea.',
    earnedBadges: [
      { badge: 'Good Vibe', count: 33 },
      { badge: 'Chill Vibe', count: 27 },
      { badge: 'Cool Vibe', count: 14 }
    ],
    reviews: [
      {
        id: 'rev-5',
        author: 'Sara W.',
        authorHandle: '@sara_voyage',
        badge: 'Good Vibe',
        note: 'Hana is the sweetest! She walked around La Marsa with us and showed us the best bambalouni bakery in town.',
        createdAt: 'Yesterday'
      }
    ],
    handshakes: ['usr_hannibal_1337', 'sara_voyage'],
    suggestedBy: {
      author: 'Youssef B.',
      role: 'Local Cafe Owner',
      note: 'Hana is a genuine local legend. She loves our neighborhood and welcomes everyone with open arms.'
    }
  },
  {
    id: 'guardian-leo',
    name: 'Leo Marquez',
    handle: '@leo_skatehikes',
    type: 'local',
    city: 'San Francisco',
    stateCountry: 'California, US',
    age: 26,
    hideAge: false,
    selfieUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    selfieCapturedAt: getDaysAgo(4), // 4 days ago
    hasActiveProSubscription: false,
    hiresCount: 22,
    experience: '8 years living in the Mission & biking every hill in SF',
    hobbies: ['Cruiser Boarding', 'Taco Crawls', 'Urban Forestry', 'Flea Markets'],
    trails: [
      { id: 't-sf-dolores', title: 'Mission Dolores to Bernal Heights Sunset', link: '/trail/t-sf-dolores' },
      { id: 't-sf-panhandle', title: 'Panhandle to Ocean Beach Roll', link: '/trail/t-sf-panhandle' }
    ],
    favoriteTrails: ['Mission Dolores to Bernal Heights Sunset', 'Panhandle to Ocean Beach Roll'],
    bio: 'No fees, just good energy. If you are in SF and want someone down to grab street burritos and watch the city fog roll over Twin Peaks, hit me up.',
    earnedBadges: [
      { badge: 'Chill Vibe', count: 24 },
      { badge: 'Good Vibe', count: 21 },
      { badge: 'Cool Vibe', count: 17 }
    ],
    reviews: [
      {
        id: 'rev-6',
        author: 'Jordan P.',
        authorHandle: '@jordan_trails',
        badge: 'Chill Vibe',
        note: 'Leo is super down to earth. Showed me his favorite taqueria and we chilled at Bernal Heights for hours.',
        createdAt: '5 days ago'
      }
    ],
    handshakes: ['jordan_trails'],
    suggestedBy: {
      author: 'Nina Rossi',
      role: 'Community Organizer',
      note: 'Leo represents what VibeQuest is all about: welcoming strangers and making them feel like old friends.'
    }
  },
  {
    id: 'guardian-samira',
    name: 'Samira Mansour',
    handle: '@samira_hikes',
    type: 'local',
    city: 'San Francisco',
    stateCountry: 'California, US',
    age: 28,
    hideAge: false,
    selfieUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    selfieCapturedAt: getDaysAgo(2), // 2 days ago
    hasActiveProSubscription: false,
    hiresCount: 19,
    experience: 'Weekend hiker & community tea maker',
    hobbies: ['Trail Running', 'Matcha Ceremonies', 'Ceramics', 'Book Clubs'],
    trails: [
      { id: 't-sf-landsend', title: 'Lands End Coastal Trail & Labyrinth', link: '/trail/t-sf-landsend' },
      { id: 't-sf-overlook', title: 'Presidio Batteries to Golden Gate Overlook', link: '/trail/t-sf-overlook' }
    ],
    favoriteTrails: ['Lands End Coastal Trail & Labyrinth', 'Presidio Batteries to Golden Gate Overlook'],
    bio: 'I host casual weekend morning walks and bring homemade matcha for whoever joins. Looking to connect with mindful travelers and nature lovers.',
    earnedBadges: [
      { badge: 'Good Vibe', count: 22 },
      { badge: 'Chill Vibe', count: 19 }
    ],
    reviews: [
      {
        id: 'rev-7',
        author: 'Liam O.',
        authorHandle: '@liam_photo',
        badge: 'Chill Vibe',
        note: 'Best morning walk I had during my trip. Warm tea, fresh ocean air, and great conversation.',
        createdAt: '6 days ago'
      }
    ],
    handshakes: ['liam_photo']
  },
  {
    id: 'guardian-marcus-expired',
    name: 'Marcus Brody',
    handle: '@marcus_tours_exp',
    type: 'pro',
    city: 'San Francisco',
    stateCountry: 'California, US',
    age: 38,
    hideAge: false,
    selfieUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    selfieCapturedAt: getDaysAgo(9), // 9 days ago -> EXPIRED (> 7 days)
    hasActiveProSubscription: true,
    hiresCount: 45,
    pricingType: 'hourly',
    hourlyRate: 30,
    priceDisplay: '$30 / hr',
    experience: 'Historic maritime & Gold Rush tour specialist',
    hobbies: ['Antique Maps', 'Sailing', 'Leathercraft'],
    trails: [
      { id: 't-sf-barbary', title: 'Barbary Coast Trail', link: '/trail/t-sf-barbary' }
    ],
    favoriteTrails: ['Barbary Coast Trail'],
    bio: 'Historic maritime guide. (Simulated card to demonstrate 7-day selfie expiration auto-hide rule).',
    earnedBadges: [
      { badge: 'Good Vibe', count: 15 }
    ],
    reviews: []
  }
];

export default CANONICAL_GUARDIANS_CATALOG;
