export interface VibeEcho {
  name: string;
  match: string;
  time: string;
  note: string;
  photo?: string | null;
  isPendingCreatorAction?: boolean;
}

export const initialVibeEchoes: Record<string, VibeEcho[]> = {
  'Interest Circles': [
    { name: '@alex_gold', match: '97%', time: '2m ago', note: 'Looking for a study/work bubble.' },
    { name: '@luna_scribe', match: '91%', time: '8m ago', note: 'Down for cozy chats!' }
  ],
  'Spontaneous Coffee': [
    { name: '@coffee_bean', match: '96%', time: '3m ago', note: 'Dolores Park coffee run?' },
    { name: '@sarah_read', match: '94%', time: '12m ago', note: 'Grabbing a flat white near 18th.' }
  ],
  'Shared Flow': [
    { name: '@synth_wizard', match: '88%', time: '5m ago', note: 'Let’s swap pocket synth patches.' },
    { name: '@mike_ambient', match: '89%', time: '15m ago', note: 'Testing out some granular delays.' }
  ],
  'Pop-up Meetups': [
    { name: '@tribesman', match: '95%', time: '4m ago', note: 'Acoustic guitar circle starting near playground.' },
    { name: '@plaza_host', match: '90%', time: '10m ago', note: 'Catching the late afternoon sun.' }
  ],
  'Group Walks': [
    { name: '@urban_wanderer', match: '92%', time: '6m ago', note: 'Walking down Liberty Street stairs.' },
    { name: '@step_master', match: '87%', time: '18m ago', note: 'Pacing around the neighborhood.' }
  ],
  'Outdoor Sessions': [
    { name: '@dolores_chill', match: '94%', time: '3m ago', note: 'Mellow guitar loops in the shade.' },
    { name: '@sunset_watcher', match: '91%', time: '14m ago', note: 'Dolores hill vibe check.' }
  ],
  'Coffee Walks': [
    { name: '@bean_stroller', match: '92%', time: '4m ago', note: 'Morning brew stroll around Mission.' },
    { name: '@latte_run', match: '88%', time: '20m ago', note: 'Strolling past Tartine.' }
  ],
  'Local Trails': [
    { name: '@trail_blazer', match: '89%', time: '7m ago', note: 'Heading up to Bernal Heights.' },
    { name: '@corona_heights', match: '85%', time: '16m ago', note: 'Catching the city views.' }
  ],
  'Sunset Pulse': [
    { name: '@dusk_patrol', match: '99%', time: '1m ago', note: 'Golden hour looks crazy right now!' },
    { name: '@skyline_seeker', match: '94%', time: '9m ago', note: 'Dolores hill sunset setup.' }
  ],
  'Quiet Nooks': [
    { name: '@book_worm', match: '98%', time: '5m ago', note: 'Cozy spot in the public library.' },
    { name: '@nook_finder', match: '93%', time: '15m ago', note: 'Reading under the cherry blossom.' }
  ],
  'Roof Terraces': [
    { name: '@sky_high', match: '89%', time: '8m ago', note: 'Sunset view from the top terrace.' },
    { name: '@rooftop_fan', match: '86%', time: '25m ago', note: 'Chilled electronic background music.' }
  ],
  'Inner Gardens': [
    { name: '@plant_parent', match: '95%', time: '3m ago', note: 'Drinking herbal tea in the courtyard.' },
    { name: '@garden_flow', match: '90%', time: '12m ago', note: 'Sketching flowers in the conservatory.' }
  ]
};

export interface CategoryItem {
  name: string;
  desc: string;
  comp: string;
}

export interface Category {
  name: string;
  icon: string;
  colorClass: string;
  tagColor: string;
  items: CategoryItem[];
}

export const categoriesList: Category[] = [
  {
    name: 'Vibe Matching',
    icon: '✨',
    colorClass: 'from-rose-500/20 via-[#4c1d24]/50 to-neutral-950/40 border-rose-500/30 text-rose-300',
    tagColor: 'bg-rose-500/10 text-rose-300 border-rose-500/15',
    items: [
      { name: 'Interest Circles', desc: 'Find neighbors with matching active vibes', comp: '96% Match' },
      { name: 'Spontaneous Coffee', desc: 'Spontaneous morning/afternoon coffee strolls', comp: '91% Match' },
      { name: 'Shared Flow', desc: 'Exchange creative art and synthesizer loops', comp: '88% Match' }
    ]
  },
  {
    name: 'Spontaneous Gatherings',
    icon: '🌍',
    colorClass: 'from-emerald-500/20 via-[#143224]/50 to-neutral-950/40 border-emerald-500/30 text-emerald-300',
    tagColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/15',
    items: [
      { name: 'Pop-up Meetups', desc: 'Spontaneous local plaza or park meetups', comp: '95% Match' },
      { name: 'Group Walks', desc: 'Explore neighborhood secret lanes together', comp: '90% Match' },
      { name: 'Outdoor Sessions', desc: 'Chill sunset acoustic setups, Dolores Park', comp: '94% Match' }
    ]
  },
  {
    name: 'Daily Journeys',
    icon: '🚶',
    colorClass: 'from-amber-500/20 via-[#452715]/50 to-neutral-950/40 border-amber-500/30 text-amber-300',
    tagColor: 'bg-amber-500/10 text-amber-350 border-amber-500/15',
    items: [
      { name: 'Coffee Walks', desc: 'Cozy morning strolls matching steps', comp: '92% Match' },
      { name: 'Local Trails', desc: 'Scenic lookout walks to catch the city fog', comp: '87% Match' },
      { name: 'Sunset Pulse', desc: 'Spontaneous vista gatherings at dusk', comp: '99% Match' }
    ]
  },
  {
    name: 'Sanctuary Shares',
    icon: '🏖️',
    colorClass: 'from-purple-500/20 via-[#27123d]/50 to-neutral-950/40 border-purple-500/30 text-purple-300',
    tagColor: 'bg-purple-500/10 text-purple-300 border-purple-500/15',
    items: [
      { name: 'Quiet Nooks', desc: 'Peaceful reading spots and city library seats', comp: '98% Match' },
      { name: 'Roof Terraces', desc: 'Secret viewpoint lookouts over the skyline', comp: '89% Match' },
      { name: 'Inner Gardens', desc: 'Inner-city foliage corners and botanical steps', comp: '93% Match' }
    ]
  }
];
