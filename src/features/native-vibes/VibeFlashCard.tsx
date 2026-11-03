import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  Dimensions 
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VibeFlashCardProps {
  backUri: string;
  frontUri: string | null;
  username: string;
  locationLabel: string | null;   // city name only, or null
  postedAt: number;               // timestamp
  vibeTags: string[];
  isLocked: boolean;
}

export const VibeFlashCard: React.FC<VibeFlashCardProps> = ({
  backUri,
  frontUri,
  username,
  locationLabel,
  postedAt,
  vibeTags,
  isLocked,
}) => {
  // Convert timestamp to highly scannable human description (e.g., "12m ago")
  const getElapsedTimeString = (pastTimestamp: number): string => {
    const diffSecs = Math.floor((Date.now() - pastTimestamp) / 1000);
    if (diffSecs < 60) return "Just now";
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const timeLabel = getElapsedTimeString(postedAt);
  const locationSubText = locationLabel ? `${locationLabel} • ` : "";

  return (
    <View style={styles.cardContainer}>
      {/* Photo Frame Section (forced to solid 4:3 aspect ratio) */}
      <View style={styles.photoContainer}>
        {/* Main Background (back camera photo) */}
        <Image
          source={{ uri: backUri }}
          style={styles.backImage}
          blurRadius={isLocked ? 12 : 0}
          resizeMode="cover"
        />

        {/* Front Camera Reaction Picture-In-Picture Overlay */}
        {frontUri && (
          <View style={[styles.pipContainer, isLocked && styles.pipLockedBorder]}>
            <Image
              source={{ uri: frontUri }}
              style={styles.pipImage}
              blurRadius={isLocked ? 12 : 0}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Locked State Absolute Cover Overlay */}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockEmoji}>🔒</Text>
            <Text style={styles.lockCallToAction}>
              Post your VibeFlash to unlock 👀
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Metadata Descriptor Strip */}
      <View style={styles.metadataStrip}>
        <View style={styles.userRow}>
          <Text style={styles.usernameText}>{username}</Text>
          <Text style={styles.detailsText}>
            {locationSubText}{timeLabel}
          </Text>
        </View>

        {/* Horizontal scroll of small vibe tags (non-blocking) */}
        {vibeTags && vibeTags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagScrollContainer}
          >
            {vibeTags.map((tag, idx) => (
              <View key={`${tag}-${idx}`} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  backImage: {
    width: '100%',
    height: '100%',
  },
  pipContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 72,
    height: 96,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  pipLockedBorder: {
    borderColor: '#3A3A3C',
  },
  pipImage: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    paddingHorizontal: 25,
  },
  lockEmoji: {
    fontSize: 28,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
  },
  lockCallToAction: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
  },
  metadataStrip: {
    backgroundColor: '#1C1C1E',
    padding: 12,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  usernameText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  tagScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagPill: {
    backgroundColor: 'rgba(61,220,108,0.12)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginRight: 6,
  },
  tagText: {
    color: '#3DDC6C',
    fontSize: 10,
    fontWeight: '700',
  },
});
