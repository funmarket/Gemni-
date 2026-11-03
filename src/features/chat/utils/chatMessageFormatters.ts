import { Message } from '../types/chatroomTypes';

/**
 * Checks if a message is a real voice message (not a soundboard broadcast)
 */
export const isVoiceMessage = (msg: Message): boolean => {
  return !!msg.voiceUrl && !msg.voiceUrl.startsWith('soundboard_');
};

/**
 * Checks if a message is a soundboard effect trigger
 */
export const isSoundboardMessage = (msg: Message): boolean => {
  return !!msg.voiceUrl && msg.voiceUrl.startsWith('soundboard_');
};

/**
 * Extracts soundboard key from message voiceUrl
 */
export const getSoundboardKey = (msg: Message): string | null => {
  if (!isSoundboardMessage(msg)) return null;
  return msg.voiceUrl!.replace('soundboard_', '');
};

/**
 * Formats voice message duration in a nice readable format (e.g., 0:03s)
 */
export const formatDuration = (seconds?: number): string => {
  const sec = seconds || 3;
  return `0:${sec < 10 ? '0' : ''}${sec}s`;
};
