import { useRef, useCallback, useEffect } from "react";
import { Platform } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

// ✅ NOUVEAU: Interface pour gérer l'état audio web
interface WebAudioState {
  context: AudioContext | null;
  isSupported: boolean;
  isInitialized: boolean;
  userHasInteracted: boolean;
  lastError: string | null;
}

// ✅ NOUVEAU: Types de son avec paramètres
interface SoundConfig {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
}

// ✅ NOUVEAU: Configuration des sons
const SOUND_CONFIGS: Record<"start" | "stop" | "end", SoundConfig> = {
  start: { frequency: 800, duration: 200, volume: 0.1, type: "sine" },
  stop: { frequency: 400, duration: 200, volume: 0.1, type: "sine" },
  end: { frequency: 1000, duration: 800, volume: 0.15, type: "sine" },
};

export const useAudio = () => {
  const startSoundRef = useRef<Audio.Sound | null>(null);
  const stopSoundRef = useRef<Audio.Sound | null>(null);
  const endSoundRef = useRef<Audio.Sound | null>(null);

  // ✅ NOUVEAU: État audio web sécurisé
  const webAudioStateRef = useRef<WebAudioState>({
    context: null,
    isSupported: false,
    isInitialized: false,
    userHasInteracted: false,
    lastError: null,
  });

  // ✅ NOUVEAU: Détection sécurisée du support Web Audio
  const checkWebAudioSupport = useCallback((): boolean => {
    // Vérification de l'environnement
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.log("🌐 [Audio] Environnement non-web détecté");
      return false;
    }

    try {
      // Vérification de l'existence de AudioContext
      const AudioContextClass =
        (window as any).AudioContext ||
        (window as any).webkitAudioContext ||
        (window as any).mozAudioContext ||
        (window as any).msAudioContext;

      if (!AudioContextClass) {
        console.log("🚫 [Audio] AudioContext non supporté");
        return false;
      }

      // Test de création (sans l'utiliser)
      try {
        const testContext = new AudioContextClass();
        if (testContext.close) {
          testContext.close().catch(() => {
            // Ignore les erreurs de fermeture
          });
        }
        console.log("✅ [Audio] Web Audio API supporté");
        return true;
      } catch (testError) {
        console.log("❌ [Audio] Échec création AudioContext:", testError);
        return false;
      }
    } catch (error) {
      console.log("❌ [Audio] Erreur détection Web Audio:", error);
      return false;
    }
  }, []);

  // ✅ NOUVEAU: Création sécurisée d'AudioContext
  const createAudioContext = useCallback((): AudioContext | null => {
    const state = webAudioStateRef.current;

    // Si déjà initialisé, retourner l'instance existante
    if (state.context && state.context.state !== "closed") {
      return state.context;
    }

    try {
      if (!state.isSupported) {
        console.log("🚫 [Audio] Web Audio non supporté, skip création");
        return null;
      }

      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextClass) {
        console.log("❌ [Audio] AudioContext non disponible");
        return null;
      }

      const context = new AudioContextClass();

      // ✅ Gestion de l'autoplay policy moderne
      if (context.state === "suspended") {
        console.log("⏸️ [Audio] AudioContext suspendu (autoplay policy)");
        // Ne pas essayer de résumer automatiquement
        // Attendre l'interaction utilisateur
      }

      // Sauvegarder l'instance
      webAudioStateRef.current = {
        ...state,
        context,
        isInitialized: true,
        lastError: null,
      };

      console.log("✅ [Audio] AudioContext créé, état:", context.state);
      return context;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      console.error("❌ [Audio] Erreur création AudioContext:", errorMessage);

      webAudioStateRef.current = {
        ...state,
        context: null,
        lastError: errorMessage,
      };

      return null;
    }
  }, []);

  // ✅ NOUVEAU: Activation sécurisée après interaction utilisateur
  const resumeAudioContext = useCallback(async (): Promise<boolean> => {
    const state = webAudioStateRef.current;

    if (!state.context) {
      console.log("🚫 [Audio] Pas de contexte audio à reprendre");
      return false;
    }

    try {
      if (state.context.state === "suspended") {
        console.log("▶️ [Audio] Reprise du contexte audio...");
        await state.context.resume();

        webAudioStateRef.current = {
          ...state,
          userHasInteracted: true,
        };

        console.log(
          "✅ [Audio] Contexte audio repris, état:",
          state.context.state
        );
        return true;
      }

      return state.context.state === "running";
    } catch (error) {
      console.error("❌ [Audio] Erreur reprise contexte:", error);
      return false;
    }
  }, []);

  // ✅ NOUVEAU: Génération de son web sécurisée
  const playWebSound = useCallback(
    async (config: SoundConfig): Promise<boolean> => {
      try {
        const context = createAudioContext();
        if (!context) {
          console.log("🚫 [Audio] Pas de contexte audio disponible");
          return false;
        }

        // Essayer de reprendre le contexte si suspendu
        if (context.state === "suspended") {
          const resumed = await resumeAudioContext();
          if (!resumed) {
            console.log(
              "⏸️ [Audio] Impossible de reprendre le contexte (autoplay)"
            );
            return false;
          }
        }

        // Vérifier que le contexte est actif
        if (context.state !== "running") {
          console.log("⏹️ [Audio] Contexte audio non actif:", context.state);
          return false;
        }

        console.log(`🔊 [Audio] Génération son:`, {
          frequency: config.frequency,
          duration: config.duration,
          volume: config.volume,
        });

        // Créer les nœuds audio
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        // Configuration de l'oscillateur
        oscillator.frequency.value = config.frequency;
        oscillator.type = config.type;

        // Configuration du volume avec fade out
        const now = context.currentTime;
        const endTime = now + config.duration / 1000;

        gainNode.gain.setValueAtTime(config.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

        // Connexion des nœuds
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        // Démarrage et arrêt programmé
        oscillator.start(now);
        oscillator.stop(endTime);

        console.log("✅ [Audio] Son généré avec succès");
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erreur inconnue";
        console.error("❌ [Audio] Erreur génération son:", errorMessage);

        // Sauvegarder l'erreur pour debug
        webAudioStateRef.current = {
          ...webAudioStateRef.current,
          lastError: errorMessage,
        };

        return false;
      }
    },
    [createAudioContext, resumeAudioContext]
  );

  // ✅ AMÉLIORATION: Fonction de fallback haptic améliorée
  const playHapticFallback = useCallback(
    async (type: "start" | "stop" | "end"): Promise<void> => {
      if (Platform.OS === "web") {
        console.log("🌐 [Audio] Fallback web - pas de vibration disponible");
        return;
      }

      try {
        switch (type) {
          case "start":
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case "stop":
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case "end":
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            // Double vibration pour attirer l'attention
            setTimeout(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 300);
            break;
        }
        console.log(`📳 [Audio] Vibration ${type} exécutée`);
      } catch (error) {
        console.log("❌ [Audio] Erreur vibration:", error);
      }
    },
    []
  );

  // ✅ FONCTION PRINCIPALE: Initialisation sécurisée des sons
  const loadSounds = useCallback(async () => {
    console.log("🔄 [Audio] Initialisation du système audio...");

    try {
      // Sur web, vérifier le support
      if (Platform.OS === "web") {
        const isSupported = checkWebAudioSupport();
        webAudioStateRef.current = {
          ...webAudioStateRef.current,
          isSupported,
        };

        if (isSupported) {
          // Pré-créer le contexte (sans l'activer)
          createAudioContext();
          console.log(
            "✅ [Audio] Web Audio initialisé (suspendu jusqu'à interaction)"
          );
        } else {
          console.log(
            "ℹ️ [Audio] Web Audio non supporté, utilisation des vibrations uniquement"
          );
        }
        return;
      }

      // Sur mobile, configurer Expo Audio
      if (!Audio || !Audio.setAudioModeAsync) {
        console.log("📱 [Audio] API Audio Expo non disponible");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log("✅ [Audio] Expo Audio configuré");
    } catch (error: any) {
      console.log(
        "⚠️ [Audio] Erreur initialisation:",
        error?.message || "Erreur inconnue"
      );
    }
  }, [checkWebAudioSupport, createAudioContext]);

  // ✅ FONCTION PRINCIPALE: Lecture de son sécurisée
  const playSound = useCallback(
    async (type: "start" | "stop" | "end") => {
      console.log(`🎵 [Audio] Demande lecture son: ${type}`);

      try {
        // Sur web, essayer Web Audio API
        if (Platform.OS === "web") {
          const state = webAudioStateRef.current;

          if (state.isSupported) {
            const config = SOUND_CONFIGS[type];
            const success = await playWebSound(config);

            if (success) {
              console.log(`✅ [Audio] Son ${type} joué via Web Audio`);
              return;
            } else {
              console.log(
                `⚠️ [Audio] Échec Web Audio, pas de fallback sur web`
              );
              return;
            }
          } else {
            console.log(
              `ℹ️ [Audio] Web Audio non supporté, son ${type} ignoré`
            );
            return;
          }
        }

        // Sur mobile, essayer les sons Expo puis vibrations
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
          console.log(`✅ [Audio] Son ${type} joué via Expo Audio`);
        } else {
          console.log(
            `📳 [Audio] Son ${type} non disponible, utilisation vibration`
          );
          await playHapticFallback(type);
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Erreur inconnue";
        console.log(`❌ [Audio] Erreur lecture son ${type}:`, errorMessage);

        // Fallback vers vibrations sur mobile
        if (Platform.OS !== "web") {
          console.log(`📳 [Audio] Fallback vibration pour ${type}`);
          await playHapticFallback(type);
        }
      }
    },
    [playWebSound, playHapticFallback]
  );

  // ✅ NOUVEAU: Fonction pour activer l'audio après interaction utilisateur
  const enableAudioAfterInteraction =
    useCallback(async (): Promise<boolean> => {
      if (Platform.OS !== "web") {
        return true; // Pas nécessaire sur mobile
      }

      const state = webAudioStateRef.current;

      if (!state.isSupported) {
        console.log("🚫 [Audio] Web Audio non supporté");
        return false;
      }

      if (state.userHasInteracted) {
        console.log("✅ [Audio] Utilisateur a déjà interagi");
        return true;
      }

      console.log("👆 [Audio] Activation après interaction utilisateur...");
      return await resumeAudioContext();
    }, [resumeAudioContext]);

  // ✅ FONCTION DE NETTOYAGE: Sécurisée
  const cleanupSounds = useCallback(() => {
    console.log("🧹 [Audio] Nettoyage des ressources audio...");

    try {
      // Nettoyage des sons Expo
      const sounds = [
        startSoundRef.current,
        stopSoundRef.current,
        endSoundRef.current,
      ];
      sounds.forEach((sound, index) => {
        if (sound) {
          sound.unloadAsync().catch((error) => {
            console.warn(`⚠️ [Audio] Erreur déchargement son ${index}:`, error);
          });
        }
      });

      // Nettoyage du contexte web
      if (Platform.OS === "web") {
        const state = webAudioStateRef.current;
        if (state.context && state.context.state !== "closed") {
          state.context.close().catch((error) => {
            console.warn("⚠️ [Audio] Erreur fermeture AudioContext:", error);
          });
        }

        // Reset de l'état
        webAudioStateRef.current = {
          context: null,
          isSupported: false,
          isInitialized: false,
          userHasInteracted: false,
          lastError: null,
        };
      }

      console.log("✅ [Audio] Nettoyage terminé");
    } catch (error) {
      console.error("❌ [Audio] Erreur lors du nettoyage:", error);
    }
  }, []);

  // ✅ NOUVEAU: Fonction pour obtenir l'état audio (debug)
  const getAudioState = useCallback(() => {
    if (Platform.OS === "web") {
      return {
        platform: "web",
        ...webAudioStateRef.current,
        contextState: webAudioStateRef.current.context?.state || "no-context",
      };
    }
    return {
      platform: Platform.OS,
      expoAudioAvailable: !!Audio,
    };
  }, []);

  // ✅ EFFET: Nettoyage automatique lors du démontage
  useEffect(() => {
    return () => {
      cleanupSounds();
    };
  }, [cleanupSounds]);

  // ✅ EFFET: Écoute des interactions utilisateur sur web
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleUserInteraction = () => {
      const state = webAudioStateRef.current;

      if (state.isSupported && !state.userHasInteracted) {
        console.log("👆 [Audio] Première interaction utilisateur détectée");
        enableAudioAfterInteraction();
      }
    };

    // Écouter les événements d'interaction
    const events = ["click", "touchstart", "keydown"];
    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, {
        once: true,
        passive: true,
      });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [enableAudioAfterInteraction]);

  return {
    loadSounds,
    playSound,
    cleanupSounds,
    enableAudioAfterInteraction,
    getAudioState,
  };
};
