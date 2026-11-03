import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Easing 
} from 'react-native';
import { useVibeFlashWindow } from './useVibeFlashWindow';

interface VibeFlashBannerProps {
  onCapturePress: () => void; // Trigger callback starting active double reaction capturer
}

export const VibeFlashBanner: React.FC<VibeFlashBannerProps> = ({ onCapturePress }) => {
  const { 
    isWindowOpen, 
    secondsRemaining, 
    userResponse, 
    denyVibeFlash, 
    acceptVibeFlash 
  } = useVibeFlashWindow();

  // Animation translateY ref
  const translateY = useRef(new Animated.Value(-120)).current;

  // Track banner open rules to trigger slide sequences
  useEffect(() => {
    if (isWindowOpen && userResponse === 'pending') {
      // Slide animation in
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      // Slide animation out
      Animated.timing(translateY, {
        toValue: -120,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [isWindowOpen, userResponse]);

  // Convert raw seconds into highly readable MM:SS layout countdowns
  const formatSecondsToMMSS = (totalSecs: number | null): string => {
    if (totalSecs === null || totalSecs < 0) return "03:00";
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCaptureClick = () => {
    acceptVibeFlash();
    onCapturePress();
  };

  // Do not render anything on screen if not open
  if (!isWindowOpen || userResponse !== 'pending') {
    return null;
  }

  return (
    <Animated.View style={[styles.animatedWrapper, { transform: [{ translateY }] }]}>
      <View style={styles.bannerContainer}>
        
        {/* Left Hand: Title and Countdown */}
        <View style={styles.leftColumn}>
          <Text style={styles.sparkleIcon}>✨</Text>
          <View style={styles.textBlock}>
            <Text style={styles.bannerHeadline}>VibeFlash!</Text>
            <Text style={styles.bannerTimeRemaining}>
              {formatSecondsToMMSS(secondsRemaining)} remaining
            </Text>
          </View>
        </View>

        {/* Right Hand: Action Button Cluster */}
        <View style={styles.buttonSegment}>
          <TouchableOpacity 
            style={styles.notNowBtn} 
            onPress={denyVibeFlash}
            activeOpacity={0.7}
          >
            <Text style={styles.notNowText}>Not Now</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.captureBtn} 
            onPress={handleCaptureClick}
            activeOpacity={0.8}
          >
            <Text style={styles.captureText}>Capture ✨</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedWrapper: {
    width: '100%',
    zIndex: 999,
  },
  bannerContainer: {
    // Cheerful warm gradient simulation (peach to warm gold-orange blend)
    backgroundColor: '#FF6B35',
    // We add secondary fallback backing using solid tone to ensure perfect visual execution
    borderWidth: 1,
    borderColor: '#F7C59F',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  leftColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sparkleIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  textBlock: {
    flexDirection: 'column',
  },
  bannerHeadline: {
    color: '#1A0A00', // high contrast dark outline
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerTimeRemaining: {
    color: '#1A0A00',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.85,
  },
  buttonSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notNowBtn: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 8,
  },
  notNowText: {
    color: '#1A0A00',
    fontSize: 12,
    fontWeight: '600',
  },
  captureBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  captureText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
