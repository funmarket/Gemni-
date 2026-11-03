import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  Alert
} from 'react-native';
import { 
  Camera, 
  useCameraDevice, 
  useCameraDevices, 
  CameraDevice, 
  PhotoFile,
  TakePhotoOptions
} from 'react-native-vision-camera';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Inline Icons mock for React Native environment (to match guidelines)
const ZapIcon = ({ color = '#FFF', size = 24 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color, fontSize: size * 0.7, fontWeight: 'bold' }}>⚡</Text>
  </View>
);

const XIcon = ({ color = '#FFF', size = 24 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color, fontSize: size * 0.7, fontWeight: 'bold' }}>✕</Text>
  </View>
);

const FlipIcon = ({ color = '#FFF', size = 24 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color, fontSize: size * 0.7, fontWeight: 'bold' }}>↻</Text>
  </View>
);

export interface VibeShotResult {
  uri: string;           // local file path of captured photo
  timestamp: number;     // Date.now() at moment of capture (NOT at confirm)
  latitude: number | null;
  longitude: number | null;
  frontUri: string | null;  // only populated in 'vibeflash' mode
}

interface VibeShotCameraProps {
  mode: 'place' | 'profile' | 'vibeflash';   // controls UI overlays only
  onCapture: (photo: VibeShotResult) => void;  // called after capture succeeds
  onCancel: () => void;
}

export const VibeShotCamera: React.FC<VibeShotCameraProps> = ({
  mode,
  onCapture,
  onCancel,
}) => {
  // Device selection
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const backDevice = useCameraDevice('back');
  const frontDevice = useCameraDevice('front');
  const activeDevice = cameraPosition === 'back' ? backDevice : frontDevice;

  // Refs for camera devices
  const backCameraRef = useRef<Camera>(null);
  const frontCameraRef = useRef<Camera>(null);

  // UI state
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Request permissions at mount
  useEffect(() => {
    const requestAndCheckPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    };
    requestAndCheckPermission();
  }, []);

  // Multi-cam dual capture diagnostic/toast
  useEffect(() => {
    if (mode === 'vibeflash') {
      const checkMultiCamSupport = async () => {
        try {
          const shown = await AsyncStorage.getItem('vf_seq_toast_shown');
          if (shown !== 'true') {
            // Check if dual-cam is natively supported natively in a single session
            const devices = Camera.getAvailableCameraDevices();
            // True multiCam criteria is typically checking devices support multiCam
            const supportsPhysicalMultiCam = devices.some(d => d.isMultiCam);
            
            if (!supportsPhysicalMultiCam) {
              Alert.alert(
                "Device Note",
                "Sequential dual-camera capture active on this device.",
                [{ text: "OK", onPress: () => AsyncStorage.setItem('vf_seq_toast_shown', 'true') }]
              );
            } else {
              await AsyncStorage.setItem('vf_seq_toast_shown', 'true');
            }
          }
        } catch (err) {
          console.warn("AsyncStorage multiCam tracking error:", err);
        }
      };
      checkMultiCamSupport();
    }
  }, [mode]);

  // Flash cycler OFF -> ON -> AUTO
  const cycleFlash = () => {
    setFlash((prev) => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  };

  // Dual camera physical position flipping
  const flipCamera = () => {
    if (mode === 'vibeflash') return; // Fixed dual mode
    setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  // Shutter action logic
  const handleShutterPress = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setErrorMessage(null);

    // [a] Record timestamp = Date.now() immediately at push before any asynchronous code triggers
    const triggerTimestamp = Date.now();

    // [b] Asynchronous GPS location capture from react-native-geolocation-service
    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
      const locationPromise = new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
      });

      const coordsRes = await Promise.race([
        locationPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5100))
      ]);

      if (coordsRes) {
        latitude = coordsRes.latitude;
        longitude = coordsRes.longitude;
      }
    } catch (gpsError) {
      // Rule 1.2: Do not block user on GPS failure or timeout
      console.warn("VibeShot GPS resolution failed, proceeding without lock:", gpsError);
    }

    // Photo capture operation
    try {
      const takePhotoOptions: TakePhotoOptions = {
        flash: flash,
        enableShutterSound: true,
      };

      if (mode === 'vibeflash') {
        // [d] In VIBEFLASH mode, we require dual sequential/simultaneous captures
        // Capture Back Main layout
        if (!backCameraRef.current) {
          throw new Error("Back Main Camera reference not available");
        }
        const backPhoto: PhotoFile = await backCameraRef.current.takePhoto(takePhotoOptions);

        // Sequence spacer: capture front camera < 400ms gap
        let frontPhoto: PhotoFile | null = null;
        if (frontCameraRef.current) {
          // Brief gap under 400ms
          await new Promise((r) => setTimeout(r, 150));
          frontPhoto = await frontCameraRef.current.takePhoto({
            flash: 'off', // No flash on face front sensor
            enableShutterSound: false
          });
        }

        // [e] Success output call
        onCapture({
          uri: `file://${backPhoto.path}`,
          timestamp: triggerTimestamp,
          latitude,
          longitude,
          frontUri: frontPhoto ? `file://${frontPhoto.path}` : null,
        });

      } else {
        // Standard place/profile capturing
        const mainCamera = cameraPosition === 'back' ? backCameraRef : frontCameraRef;
        if (!mainCamera.current) {
          throw new Error(`${cameraPosition} camera interface loaded incorrectly`);
        }
        
        const photo: PhotoFile = await mainCamera.current.takePhoto(takePhotoOptions);
        
        onCapture({
          uri: `file://${photo.path}`,
          timestamp: triggerTimestamp,
          latitude,
          longitude,
          frontUri: null
        });
      }

    } catch (captureErr) {
      console.error("VibeShot Camera internal hardware thrown error:", captureErr);
      // Rule 1.2: If camera throws, show inline error text and do not navigate away
      setErrorMessage("Couldn't capture. Tap to retry.");
    } finally {
      setIsCapturing(false);
    }
  };

  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorHeader}>Camera Permission Denied</Text>
        <Text style={styles.errorSub}>VibeQuest strictly captures live reactions. Please grant camera permission in system settings.</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
          <Text style={styles.closeText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasPermission === null || !activeDevice) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3DDC6C" />
        <Text style={[styles.infoText, { marginTop: 15 }]}>Calibrating Sensors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Camera fills screen fully */}
      <Camera
        ref={backCameraRef}
        style={StyleSheet.absoluteFill}
        device={backDevice!}
        isActive={true}
        photo={true}
      />

      {/* Picture-In-Picture Overlay Front Camera Preview (Exclusive to VibeFlash mode) */}
      {mode === 'vibeflash' && frontDevice && (
        <View style={styles.pipContainer}>
          <Camera
            ref={frontCameraRef}
            style={styles.pipCamera}
            device={frontDevice}
            isActive={true}
            photo={true}
          />
        </View>
      )}

      {/* Header Overlay Actions Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.headerCircleButton} 
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <XIcon color="#FFFFFF" size={20} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.headerCircleButton, flash !== 'off' && styles.activeYellowBtn]} 
          onPress={cycleFlash}
          activeOpacity={0.7}
        >
          <ZapIcon color={flash !== 'off' ? '#FFD60A' : '#FFFFFF'} size={20} />
          {flash !== 'off' && (
            <Text style={styles.flashLabel}>
              {flash.toUpperCase()}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Controls Container Column at screen bottom */}
      <View style={styles.bottomBar}>
        {errorMessage && (
          <Text style={styles.shutterErrorText}>{errorMessage}</Text>
        )}

        {isCapturing && (
          <ActivityIndicator size="small" color="#3DDC6C" style={{ marginBottom: 15 }} />
        )}

        <View style={styles.actionRow}>
          {/* Left space holder in dual-mode, or Flip Device option in typical captures */}
          {mode !== 'vibeflash' ? (
            <TouchableOpacity 
              style={styles.auxButton} 
              onPress={flipCamera}
              activeOpacity={0.7}
            >
              <FlipIcon color="#FFFFFF" size={24} />
            </TouchableOpacity>
          ) : (
            <View style={styles.auxButtonPlaceholder} />
          )}

          {/* Core Shutter Circle Button */}
          <TouchableOpacity 
            style={[styles.shutterOuter, isCapturing && styles.shutterProcessing]}
            onPress={handleShutterPress}
            activeOpacity={0.8}
            delayPressIn={0}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          {/* Right spacer for centering alignment */}
          <View style={styles.auxButtonPlaceholder} />
        </View>

        <View style={styles.indicatorRow}>
          <Text style={styles.indicatorLabel}>
            {mode === 'vibeflash' ? "⚡ DUAL REACTION LIVE" : "👤 SECURE LIVE FRAME"}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  infoText: {
    color: '#8E8E93',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
  },
  errorHeader: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSub: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  closeBtn: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  closeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
    zIndex: 10,
  },
  pipCamera: {
    flex: 1,
  },
  headerRow: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  headerCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeYellowBtn: {
    borderColor: '#FFD60A',
    borderWidth: 1,
  },
  flashLabel: {
    position: 'absolute',
    bottom: -18,
    fontSize: 9,
    fontWeight: 'black',
    color: '#FFD60A',
    fontFamily: 'monospace',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    paddingHorizontal: 20,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1 }],
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  shutterProcessing: {
    borderColor: '#3DDC6C',
    opacity: 0.5,
  },
  auxButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  auxButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  shutterErrorText: {
    color: '#FF453A',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  indicatorRow: {
    marginTop: 20,
  },
  indicatorLabel: {
    color: '#8E8E93',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
