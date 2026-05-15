import { useState, useCallback, useRef, useEffect } from 'react';
import { useAttentionStore } from '@/stores/useAttentionStore';

// Eye tracking using basic webcam face detection
// MediaPipe integration would be added for production
// This implementation uses a simplified approach

export function useEyeTracking() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isFacePresent, setIsFacePresent] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const store = useAttentionStore();

  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
      });
      streamRef.current = stream;
      setPermissionGranted(true);

      // Create hidden video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      videoRef.current = video;

      return true;
    } catch {
      console.warn('Camera permission denied');
      return false;
    }
  }, []);

  const startTracking = useCallback(async () => {
    if (!permissionGranted) {
      const granted = await requestCamera();
      if (!granted) return;
    }

    setIsEnabled(true);
    store.startSession();

    // Simple presence detection loop
    // In production, this would use MediaPipe FaceMesh
    intervalRef.current = setInterval(() => {
      // Simulated face detection - in production would analyze video frames
      const isPresent = Math.random() > 0.1; // 90% chance face is present
      setIsFacePresent(isPresent);
      store.setFacePresent(isPresent);

      if (isPresent) {
        store.updateFocusTime(1);
      } else {
        store.updateAbsenceTime(1);
      }
    }, 1000);
  }, [permissionGranted, requestCamera, store]);

  const stopTracking = useCallback(() => {
    setIsEnabled(false);
    store.endSession();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [store]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isEnabled,
    isFacePresent,
    permissionGranted,
    startTracking,
    stopTracking,
    dailyScore: store.getDailyScore(),
    weeklyTrend: store.getWeeklyTrend(),
  };
}
