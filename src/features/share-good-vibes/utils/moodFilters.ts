import { MoodFilter } from '../types/shareGoodVibesTypes';

export const MOOD_FILTERS: MoodFilter[] = [
  {
    id: 'sunset',
    name: 'Sunset Projection',
    description: 'Slow-pulsing warm amber & gold projection gradient',
    vpack: 'Sunset Radiance',
    defaultIntensity: 0.65,
    locationTheme: 'Golden coastal wave dapples, sunset tones',
    icon: '🌅',
    influenceKeyword: 'warm, coast, beach, golden, evening'
  },
  {
    id: 'bokeh',
    name: 'Vanguard Bokeh',
    description: 'Floating, fuzzy geometric lens bokeh & blur simulation',
    vpack: 'Urban Dreamer',
    defaultIntensity: 0.5,
    locationTheme: 'Fuzzy city lanterns or ocean reflections',
    icon: '✨',
    influenceKeyword: 'dream, city, lights, night, blur'
  },
  {
    id: 'emojis',
    name: 'Universal Expressive Emojis',
    description: 'Floating geographic expressive particles spitting from center',
    vpack: 'Playful Social',
    defaultIntensity: 0.7,
    locationTheme: 'Seashells near water, digital stars in city, leaves in nature',
    icon: '🌸',
    influenceKeyword: 'emoji, hearts, play, seashell, nature, forest'
  },
  {
    id: 'glitch',
    name: 'Y2K Retro Glitch',
    description: 'RGB split, chromatic aberration & retro scanlines',
    vpack: 'Street Urban',
    defaultIntensity: 0.4,
    locationTheme: 'Streets crowd energy chromatic aberration',
    icon: '👾',
    influenceKeyword: 'glitch, cyber, neon, vintage, hyper'
  },
  {
    id: 'glam',
    name: 'Editorial Glam & Smooth',
    description: 'Classic skin-touch smoothing & studio contrast lens',
    vpack: 'Minimal Portrait',
    defaultIntensity: 0.6,
    locationTheme: 'Soft diffuse shadows and studio vignette',
    icon: '💄',
    influenceKeyword: 'pure, glam, portrait, simple, soft'
  },
  {
    id: 'neon',
    name: 'Neon Cyber Glow',
    description: 'Vivid cyan & magenta face lights wrapping contours',
    vpack: 'Retro Arcade',
    defaultIntensity: 0.7,
    locationTheme: 'Virtual night club neon highlights',
    icon: '⚡',
    influenceKeyword: 'neon, magenta, glow, dance, retro'
  },
  {
    id: 'chubby',
    name: 'Playful Bulge',
    description: 'Quirky dual eye-cheeks magnifying camera displacement',
    vpack: 'Giggle Core',
    defaultIntensity: 0.5,
    locationTheme: 'Warped landmark coordinates for social fun',
    icon: '🤪',
    influenceKeyword: 'funny, face, party, fat, wild'
  },
  {
    id: 'holographic',
    name: 'Pearl Iridescence',
    description: 'Metallic holographic pearl shift guided by coordinates',
    vpack: 'Cosmic Mystique',
    defaultIntensity: 0.55,
    locationTheme: 'Shimmering blues, greens, or desert pinks',
    icon: '🧬',
    influenceKeyword: 'hologram, metal, colors, magic, tech'
  },
  {
    id: 'makeup',
    name: 'Slick Velvet Makeup',
    description: 'Dynamic blush & velvety lip-gloss blend map overlays',
    vpack: 'Cyber Chic',
    defaultIntensity: 0.5,
    locationTheme: 'Culture-infused berry or velvet gold pigments',
    icon: '💅',
    influenceKeyword: 'lips, style, glam, tint, rouge'
  },
  {
    id: 'headwear',
    name: 'Seasonal Virtual Crown',
    description: 'High-end vector headwear (Neon Crown, Beach leaves, Sunglasses)',
    vpack: 'Nature Crown',
    defaultIntensity: 0.8,
    locationTheme: 'Local palm leaves, designer visors, or glowing halos',
    icon: '👑',
    influenceKeyword: 'hat, crown, flower, leaf, style, cool'
  },
  {
    id: 'jazzy',
    name: 'Jazzy Lounge',
    description: 'Sepia tone and multiply indigo shadows with a slow breathing highlight',
    vpack: 'Lounge Core',
    defaultIntensity: 0.7,
    locationTheme: 'Late-night bar neon or indoor vinyl sessions',
    icon: '🎷',
    influenceKeyword: 'jazz, warm, slow, indie, night, lounge'
  },
  {
    id: 'reggae',
    name: 'Sun-Baked Reggae',
    description: 'Analog film grain with high warm saturation and chromatic aberration',
    vpack: 'Reggae Sun',
    defaultIntensity: 0.65,
    locationTheme: 'Backyard gatherings or open beaches',
    icon: '🎸',
    influenceKeyword: 'reggae, sun, baked, retro, analogue'
  },
  {
    id: 'tropical',
    name: 'Tropical Breeze',
    description: 'Teal & magenta mood shift overlaid with moving palm shadow branches',
    vpack: 'Tropical Island',
    defaultIntensity: 0.6,
    locationTheme: 'Dune paths or beach side strolls',
    icon: '🏝️',
    influenceKeyword: 'beach, palm, water, exotic, island'
  },
  {
    id: 'happy',
    name: 'Happy Highlight',
    description: 'Warm, peachy exposure booster releasing soft glowing sparkles',
    vpack: 'Positive Spark',
    defaultIntensity: 0.75,
    locationTheme: 'Brunch hangouts, bright parks, and sunrooms',
    icon: '☀️',
    influenceKeyword: 'happy, bright, sparkle, peach, morning'
  },
  {
    id: 'blessed',
    name: 'Blessed Radiance',
    description: 'Procedural screen bloom filter with soft solar lens flares',
    vpack: 'Pure Light',
    defaultIntensity: 0.7,
    locationTheme: 'Churches, landmarks, and high viewpoints',
    icon: '🙏',
    influenceKeyword: 'blessed, bloom, light, soft, holy'
  },
  {
    id: 'coffee',
    name: 'Having Coffee',
    description: 'Velvet espresso brown vignette with realistic rising steam curls',
    vpack: 'Café Nomad',
    defaultIntensity: 0.65,
    locationTheme: 'Cozy cafés and creative workspaces',
    icon: '☕',
    influenceKeyword: 'coffee, cafe, warm, cozy, tea, breakfast'
  },
  {
    id: 'eating',
    name: 'Gourmet Focus',
    description: 'High red/orange visual boost paired with dark vignette focus frame',
    vpack: 'Food Explorer',
    defaultIntensity: 0.55,
    locationTheme: 'Tapas, dinners, and food market stalls',
    icon: '🍕',
    influenceKeyword: 'food, eating, kitchen, feed, dining'
  },
  {
    id: 'swimming',
    name: 'Swimming Caustics',
    description: 'Undersea aqua tint with undulating sinusoidal light reflection rays',
    vpack: 'Aqua Caustic',
    defaultIntensity: 0.7,
    locationTheme: 'Poolside, lakes, and ocean waters',
    icon: '🏊',
    influenceKeyword: 'water, swim, sea, ocean, refreshing, pool'
  },
  {
    id: 'geostamp',
    name: 'Street Geo-Stamp',
    description: 'Raw high-contrast output with retro geo-coordinate stamps',
    vpack: 'Street Urban',
    defaultIntensity: 0.9,
    locationTheme: 'Active public squares or unknown intersections',
    icon: '🎯',
    influenceKeyword: 'gps, text, retro, coordinate, raw, urban'
  },
  {
    id: 'goldenhour',
    name: 'Golden Hour Tracker',
    description: 'Real-time solar sunset gradient calculated via local coordinates',
    vpack: 'Sunset Glow',
    defaultIntensity: 0.8,
    locationTheme: 'Rooftops, outlooks, and open skies',
    icon: '🕒',
    influenceKeyword: 'sunset, solar, twilight, weather, gold'
  }
];
