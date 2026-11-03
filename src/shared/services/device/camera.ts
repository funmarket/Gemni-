/**
 * Shared Camera Device Service
 * Handles user media streaming and video track operations
 */

export const requestCameraStream = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera access is not supported on this platform/device.');
  }
  return await navigator.mediaDevices.getUserMedia(constraints);
};

export const stopMediaStream = (stream: MediaStream | null) => {
  if (!stream) return;
  try {
    stream.getTracks().forEach((track) => {
      if (track.readyState === 'live') {
        track.stop();
      }
    });
  } catch (e) {
    console.warn('Error stopping media stream tracks:', e);
  }
};
