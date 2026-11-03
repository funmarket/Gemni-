import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated, 
  PanResponder, 
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { VibeShotResult } from './VibeShotCamera';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VibeShotPreviewProps {
  result: VibeShotResult;
  mode: 'place' | 'profile' | 'vibeflash';
  onConfirm: (result: VibeShotResult) => void;
  onRetake: () => void;
}

export function validateVibeShot(result: VibeShotResult): boolean {
  const AGE_LIMIT_MS = 5 * 60 * 1000;  // 5 minutes
  const now = Date.now();
  if (now - result.timestamp > AGE_LIMIT_MS) {
    return false;
  }
  return true;
}

export const VibeShotPreview: React.FC<VibeShotPreviewProps> = ({
  result,
  mode,
  onConfirm,
  onRetake,
}) => {
  const [cityName, setCityName] = useState<string>("Resolving location...");
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);

  // Pan Animation state for Draggable front PIP
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Set up PanResponder for draggable front photo overlay
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  // Reverse Geocoding with Nominatim strictly limiting output label to city/region level ONLY
  useEffect(() => {
    if (result.latitude === null || result.longitude === null) {
      setCityName("Location unavailable");
      return;
    }

    const reverseGeocodeCoordinate = async () => {
      setIsResolvingLocation(true);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${result.latitude}&lon=${result.longitude}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'VibeQuest/1.0.0 (MobileReview; funmarketmn@gmail.com)'
          }
        });
        if (!response.ok) throw new Error("Nominatim response error");
        const data = await response.json();
        
        if (data && data.address) {
          const cityVal = data.address.city || 
                          data.address.town || 
                          data.address.village || 
                          data.address.suburb || 
                          data.address.county || 
                          "Nearby Node";
          setCityName(cityVal);
        } else {
          setCityName("Discovered Outpost");
        }
      } catch (err) {
        console.warn("Reverse geocode lookup error, using default fallback:", err);
        setCityName("Local Grid Coordinates");
      } finally {
        setIsResolvingLocation(false);
      }
    };

    reverseGeocodeCoordinate();
  }, [result.latitude, result.longitude]);

  // Handle Confirmed press with strict timestamp freshness verification
  const handleConfirmPress = () => {
    // [System 1.4 validation]: runs at the exact moment 'Use This Shot' is confirmed
    const isValid = validateVibeShot(result);

    if (!isValid) {
      Alert.alert(
        "Verification Failed",
        "This shot is too old. Take a fresh one.",
        [{ text: "Retake", onPress: onRetake }]
      );
      return;
    }

    onConfirm(result);
  };

  // Human-friendly timing conversion
  const formatCapturedTime = (timestampMs: number): string => {
    const minDiff = Math.floor((Date.now() - timestampMs) / 60000);
    if (minDiff < 1) {
      return "Just now";
    }
    const dateObj = new Date(timestampMs);
    const hrs = String(dateObj.getHours()).padStart(2, '0');
    const mins = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  };

  return (
    <View style={styles.container}>
      {/* Background Back Photo Frame strictly filling viewport screen */}
      <Image 
        source={{ uri: result.uri }} 
        style={StyleSheet.absoluteFillObject} 
        resizeMode="cover"
      />

      {/* Picture-In-Picture Overlay Front Reaction - Draggable via standard PanResponder in absolute space */}
      {mode === 'vibeflash' && result.frontUri && (
        <Animated.View
          style={[
            styles.draggableOverlay,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <Image 
            source={{ uri: result.frontUri }} 
            style={styles.pipFrontImage} 
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* Bottom Sheet - background OLED dark violet-accented card */}
      <View style={styles.bottomSheet}>
        
        {/* Info cluster row */}
        <View style={styles.vibeInfoCluster}>
          <View style={styles.statusBadgeBlock}>
            <Text style={styles.timeLabelText}>
              🕒 {formatCapturedTime(result.timestamp)}
            </Text>
          </View>

          <Text style={styles.gpsLabelText} numberOfLines={1}>
            📍 {cityName}
          </Text>
        </View>

        {/* Buttons: Retake & Confirm actions stack */}
        <View style={styles.actionsStack}>
          {/* Confirms & triggers validation check */}
          <TouchableOpacity 
            style={styles.confirmActionButton}
            onPress={handleConfirmPress}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Use This Shot</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.retakeActionButton}
            onPress={onRetake}
            activeOpacity={0.8}
          >
            <Text style={styles.retakeButtonText}>Retake</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.complianceFooter}>
          <Text style={styles.complianceDetail}>
            {mode === 'vibeflash' ? "📸 Back & Front reactions unified. Zero trace logs." : "🔒 Enforced live-only capturing secure transaction"}
          </Text>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  draggableOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
    zIndex: 99,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  pipFrontImage: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 30,
  },
  vibeInfoCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  statusBadgeBlock: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timeLabelText: {
    color: '#EBEBF5',
    fontWeight: '600',
    fontSize: 12,
  },
  gpsLabelText: {
    color: '#A2A2A7',
    fontWeight: 'bold',
    fontSize: 13,
    maxWidth: SCREEN_WIDTH * 0.5,
  },
  actionsStack: {
    flexDirection: 'column',
    width: '100%',
  },
  confirmActionButton: {
    backgroundColor: '#3DDC6C',
    borderRadius: 999,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  retakeActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3A3A3C',
    borderRadius: 999,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  complianceFooter: {
    alignItems: 'center',
    marginTop: 15,
  },
  complianceDetail: {
    color: '#636366',
    fontSize: 10,
    fontWeight: '600',
  }
});
