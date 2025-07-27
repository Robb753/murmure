import { useState, useEffect, useRef, useCallback } from "react";
import * as Haptics from "expo-haptics";

interface UseTimerProps {
  playSound?: (type: "start" | "stop" | "end") => Promise<void>;
}

export const useTimer = ({ playSound }: UseTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction de fin de timer intégrée au hook
  const handleTimerEnd = useCallback(async () => {
    setIsTimerRunning(false);

    // Vibration et son plus marqués pour la fin
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (playSound) await playSound("end");

    // Vibration supplémentaire pour attirer l'attention
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 300);
  }, [playSound]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerRunning) {
      handleTimerEnd();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining, handleTimerEnd]);

  const selectDuration = useCallback((minutes: number) => {
    setSelectedDuration(minutes);
    setTimeRemaining(minutes * 60);
    setIsTimerRunning(false);
  }, []);

  const toggleTimer = useCallback(async () => {
    const newRunningState = !isTimerRunning;

    // Vibration et son selon l'action
    if (newRunningState) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (playSound) await playSound("start");
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (playSound) await playSound("stop");
    }

    setIsTimerRunning(newRunningState);
  }, [isTimerRunning, playSound]);

  const resetTimer = useCallback(() => {
    setTimeRemaining(selectedDuration * 60);
    setIsTimerRunning(false);
  }, [selectedDuration]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    timeRemaining,
    selectedDuration,
    isTimerRunning,
    selectDuration,
    toggleTimer,
    resetTimer,
    formatTime,
    // Exposer les états internes pour les callbacks externes
    setTimeRemaining,
    setIsTimerRunning,
  };
};
