# 🗺️ VibeQuest Mobile Integration & Diagnostic Manual

This blueprint covers the implementation details, installation scripts, environment manifests, and controller wiring rules required to deploy **System 1 (Live Photo Enforcement)** and **System 2 (VibeFlash Spontaneous Moments)** successfully in our iOS and Android mobile codebases.

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Section 1 — Installation Commands & Native Manifests
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To configure the device-level capabilities required for camera and high-accuracy geo-referencing, execute the following commands in the workspace root:

```bash
# Core Device Camera Framework (VisionCamera V5+)
npm install react-native-vision-camera@latest
npm install react-native-nitro-modules

# Background Local Alarm Scheduling Engine
npm install @notifee/react-native

# High-Precision Location Geo-Referencer (Non-Stale)
npm install react-native-geolocation-service

# Persistent Storage & State Caching Utilities
npm install @react-native-async-storage/async-storage

# Re-link native binaries inside iOS sandbox
cd ios && npx pod-install
```

### [A] Android Manifest Setup (`android/app/src/main/AndroidManifest.xml`)

Add these XML directives inside the `<manifest>` block. Note that **PHOTO_LIBRARY, MEDIA_LIBRARY, or external storage parameters are omitted entirely** to satisfy the strict live-only sharing enforcement.

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.vibequest.app">

    <!-- Enforce Camera Access Gating Only -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- Geolocation Permission Gating (High-Accuracy) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Notifee Time-Sensitive Alarms -->
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <!-- Re-routing alarm triggers on device cold-boots -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application>
        <!-- Receive boot event notifications to reschedule alarms securely -->
        <receiver android:name="io.invertase.notifee.RebootReceiver" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>
    </application>

</manifest>
```

### [B] iOS Configuration Setup (`ios/VibeQuest/Info.plist`)

Insert the appropriate keys detailing our physical camera constraints inside the root `<dict>` element:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Live-Only Camera capture explanation -->
    <key>NSCameraUsageDescription</key>
    <string>VibeQuest requires physical camera access for verified live-only captures. Device photo library sharing is completely disabled.</string>
    
    <!-- Precise Geolocation explanation -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>VibeQuest uses secure temporary GPS lookups to geo-verify the small business outposts you discover.</string>
    
    <!-- Local Alarm Interruptions (Time-Sensitive) -->
    <key>UIBackgroundModes</key>
    <array>
        <string>remote-notification</string>
    </array>
</dict>
</plist>
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Section 8 — Wiring VibeShot Into a "Share Place" Screen
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Below is the implementation blueprint showing how to connect `VibeShotCamera` and `VibeShotPreview` into a user interface designed to capture live proof-of-visit reviews without gallery cheating:

```tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { VibeShotCamera } from '../native/VibeShotCamera';
import { VibeShotPreview } from '../native/VibeShotPreview';

export const SharePlaceScreen: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photoResult, setPhotoResult] = useState<any>(null);
  const [vibeReviewText, setVibeReviewText] = useState('');

  const triggerPostSubmission = (finalData: any) => {
    // Client-side age validation is run inside VibeShotPreview prior to executing this upload
    Alert.alert("Success", "Verified live review submitted securely!");
  };

  if (isCameraActive) {
    return (
      <VibeShotCamera
        mode="place"
        onCapture={(result) => {
          setPhotoResult(result);
          setIsCameraActive(false);
        }}
        onCancel={() => setIsCameraActive(false)}
      />
    );
  }

  if (photoResult) {
    return (
      <VibeShotPreview
        result={photoResult}
        mode="place"
        onConfirm={(validatedResult) => {
          triggerPostSubmission(validatedResult);
        }}
        onRetake={() => {
          setPhotoResult(null);
          setIsCameraActive(true);
        }}
      />
    );
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.header}>Verify Outpost</Text>
      
      {/* Live enforcement capture card placeholder */}
      <TouchableOpacity 
        style={styles.cameraTriggerBox}
        onPress={() => setIsCameraActive(true)}
      >
        <Text style={styles.triggerText}>📸 Capture Live Evidence</Text>
        <Text style={styles.triggerSub}>Gallery selection is strictly prohibited</Text>
      </TouchableOpacity>

      <TextInput
         style={styles.input}
         placeholder="Describe the aesthetic vibe..."
         value={vibeReviewText}
         onChangeText={setVibeReviewText}
         placeholderTextColor="#636366"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: { flex: 1, backgroundColor: '#000', padding: 24, justifyContent: 'center' },
  header: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  cameraTriggerBox: {
    height: 160,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  triggerText: { color: '#3DDC6C', fontWeight: 'bold' },
  triggerSub: { color: '#8E8E93', fontSize: 11, marginTop: 4 },
  input: { height: 50, borderBottomWidth: 1, borderColor: '#3A3A3C', color: '#FFF' }
});
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Section 9 — Mounting VibeFlashBanner in Tab Outlines
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To render spontaneous interactive banners directly over standard views on spontaneous windows, mount `VibeFlashBanner` in your application's primary navigation frame:

```tsx
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { VibeFlashBanner } from '../native/VibeFlashBanner';
import { VibeShotCamera } from '../native/VibeShotCamera';
import { VibeShotPreview } from '../native/VibeShotPreview';

export const MainAppTabShell: React.FC = () => {
  const [activeVibeFlashCamera, setActiveVibeFlashCamera] = useState(false);
  const [vibeFlashResult, setVibeFlashResult] = useState<any>(null);

  const handlePublishVibeFlash = (result: any) => {
    // 1. Submit double images to VibeQuest backends
    setVibeFlashResult(null);
    Alert.alert("Sent!", "Your daily reaction is posted!");
  };

  return (
    <View style={styles.rootContainer}>
      
      {/* Mounted at absolute top of layout hierarchy */}
      <VibeFlashBanner onCapturePress={() => setActiveVibeFlashCamera(true)} />

      {/* Primary tab views content go here */}

      {/* Absolute fullscreen overlays rendering active lenses on click */}
      {activeVibeFlashCamera && (
        <VibeShotCamera
          mode="vibeflash"
          onCapture={(res) => {
            setVibeFlashResult(res);
            setActiveVibeFlashCamera(false);
          }}
          onCancel={() => setActiveVibeFlashCamera(false)}
        />
      )}

      {vibeFlashResult && (
        <VibeShotPreview
          result={vibeFlashResult}
          mode="vibeflash"
          onConfirm={handlePublishVibeFlash}
          onRetake={() => {
            setVibeFlashResult(null);
            setActiveVibeFlashCamera(true);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#000000' }
});
```

---

## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## Section 10 — Device Compatibility Matrices & Fallbacks
## ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Simultaneous multi-cam capture represents a major physical constraint on many mid-tier and high-end hardware chipsets due to system bus and camera ISP throughput limitations.

### Dual-Cam Silicon Capability Baseline

| OEM Brand | Support Matrix Coverage | Multi-Camera Simultaneous Session Capability |
| :--- | :--- | :--- |
| **Apple iOS** | iPhone XR, XS, 11 Pro, 12, 13, 14, 15, 16 (Pro versions fully supported) | **FULLY SUPPORTED** utilizing standard AVCaptureMultiCamSessions (AVFoundation). |
| **Samsung** | Galaxy S20 Ultra, S21, S22, S23, S24 (Snapdragon 8 Gen 1+) | **SUPPORTED** under Limited Camera2 Multi-Stream API parameters. |
| **Google** | Pixel 6 Pro, Pixel 7, Pixel 8, Pixel 9 | **SUPPORTED** on primary wide and front facing camera arrays. |
| **Mid-Tier Android**| Xiaomi, OnePlus, Oppo (MediaTek Dimensity / Snapdragon 600) | **NO SUPPORT**. System bus throws physical exceptions if multiple physical session requests bind simultaneously. |

### The Sequential Fallback Experience (≤ 400ms Offset)

If `useCameraDevices()` indicates lack of dual-active streams, our `VibeShotCamera.tsx` gracefully executes sequential capture protocol:

1. **Phase A (Back Main)**: Back camera captures instantly upon shutter click. Timestamp is strictly indexed (`Date.now()`).
2. **Phase B (Front Flip)**: Back stream is paused, system waits exactly **150ms** for general hardware state resets, and initiates capturing via Front lens on a separate Camera component instance under **400ms total elapsed time**.
3. **No Overheat Protection**: By sequencing, the device's image processing unit (ISP) never gets overloaded, avoiding thermal throttling or crashes in hot climate regions.
4. **User UX Indicator**: A clean custom Toast appears once (and only once) saying: *"Sequential capture active on this device"*.
