import { useRef, useCallback } from "react";
import { Platform } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

export const useAudio = () => {
  const startSoundRef = useRef<Audio.Sound | null>(null);
  const stopSoundRef = useRef<Audio.Sound | null>(null);
  const endSoundRef = useRef<Audio.Sound | null>(null);

  // Fonction pour initialiser les sons
  const loadSounds = useCallback(async () => {
    try {
      if (!Audio || !Audio.setAudioModeAsync) {
        console.log("Audio API non disponible sur cette plateforme");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error: any) {
      console.log(
        "Audio non supporté sur cette plateforme:",
        error?.message || "Erreur inconnue"
      );
    }
  }, []);

  // Fonction pour jouer un son système (alternative robuste)
  const playSystemSound = useCallback(
    async (type: "start" | "stop" | "end") => {
      try {
        const duration = type === "end" ? 800 : 200;
        const frequency = type === "start" ? 800 : type === "stop" ? 400 : 1000;

        if (Platform.OS === "web") {
          try {
            const AudioContextClass =
              (window as any).AudioContext ||
              (window as any).webkitAudioContext;

            if (AudioContextClass) {
              const audioContext = new AudioContextClass();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();

              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);

              oscillator.frequency.value = frequency;
              oscillator.type = "sine";

              gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                audioContext.currentTime + duration / 1000
              );

              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + duration / 1000);
            }
          } catch (webAudioError) {
            console.log("Web Audio API non disponible:", webAudioError);
          }
        } else {
          if (type === "end") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }
      } catch (error) {
        console.log("Aucun son disponible:", error);
      }
    },
    []
  );

  // Fonction pour jouer un son
  const playSound = useCallback(
    async (type: "start" | "stop" | "end") => {
      try {
        let sound = null;

        switch (type) {
          case "start":
            sound = startSoundRef.current;
            break;
          case "stop":
            sound = stopSoundRef.current;
            break;
          case "end":
            sound = endSoundRef.current;
            break;
        }

        if (sound) {
          await sound.replayAsync();
        } else {
          await playSystemSound(type);
        }
      } catch (error: any) {
        console.log(
          "Son non disponible, utilisation du fallback:",
          error?.message || "Erreur inconnue"
        );
        await playSystemSound(type);
      }
    },
    [playSystemSound]
  );

  // Nettoyer les sons
  const cleanupSounds = useCallback(() => {
    if (startSoundRef.current) {
      startSoundRef.current.unloadAsync().catch(() => {});
    }
    if (stopSoundRef.current) {
      stopSoundRef.current.unloadAsync().catch(() => {});
    }
    if (endSoundRef.current) {
      endSoundRef.current.unloadAsync().catch(() => {});
    }
  }, []);

  return {
    loadSounds,
    playSound,
    cleanupSounds,
  };
};
