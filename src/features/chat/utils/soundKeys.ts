export const resolveSoundKey = (type: string): string => {
  const lower = type.toLowerCase().trim();
  if (lower === 'applause' || lower === 'real clap' || lower === 'real_clap' || lower === 'clapping') return 'clap';
  if (lower === 'laughter' || lower === 'laughing') return 'laugh';
  if (lower === 'surprise') return 'wow';
  if (lower === 'truckhorn') return 'coffindance';
  if (lower === 'awkward silence' || lower === 'awkward_silence' || lower === 'crickets' || lower === 'cricket') return 'crickets';
  if (lower === 'funny fart' || lower === 'funny_fart') return 'fart';
  if (lower === 'meme scream' || lower === 'meme_scream') return 'scream';
  if (lower === 'wiiw' || lower === 'wiou' || lower === 'wiou_meme') return 'wiou';
  return type;
};
