import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

// Audio settings interface
interface AudioSettings {
  masterVolume: number;
  soundEffectsEnabled: boolean;
  backgroundMusicEnabled: boolean;
  focusModeEnabled: boolean;
  characterVoiceEnabled: boolean;
}

// Audio context interface
interface AudioContextType {
  settings: AudioSettings;
  updateSettings: (newSettings: Partial<AudioSettings>) => void;
  playSound: (soundType: SoundType, volume?: number) => void;
  startBackgroundMusic: (musicType: BackgroundMusicType) => void;
  stopBackgroundMusic: () => void;
  playCharacterVoice: (voiceType: CharacterVoiceType) => void;
  setFocusMode: (enabled: boolean) => void;
}

// Sound effect types
export type SoundType = 
  | 'treasure_chest_open'
  | 'ship_bell_success'
  | 'parrot_hint'
  | 'cannon_achievement'
  | 'anchor_button_click'
  | 'waves_gentle'
  | 'compass_navigation'
  | 'victory_fanfare'
  | 'spell_correct'
  | 'spell_incorrect';

// Background music types
export type BackgroundMusicType = 
  | 'ocean_ambient'
  | 'pirate_adventure'
  | 'study_focus'
  | 'celebration';

// Character voice types
export type CharacterVoiceType = 
  | 'red_boot_ahoy'
  | 'red_boot_great_job'
  | 'red_boot_try_again'
  | 'red_boot_welcome'
  | 'red_boot_adventure_complete'
  | 'ocean_blue_encouraging'
  | 'salty_helpful_tip';

// Default audio settings
const defaultSettings: AudioSettings = {
  masterVolume: 0.7,
  soundEffectsEnabled: true,
  backgroundMusicEnabled: true,
  focusModeEnabled: false,
  characterVoiceEnabled: true,
};

// Create audio context
const AudioContext = createContext<AudioContextType | null>(null);

// Audio manager provider component
export function AudioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    // Load settings from localStorage if available
    const saved = localStorage.getItem('redboot-audio-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  // Audio references
  const soundEffectsRef = useRef<Map<SoundType, HTMLAudioElement>>(new Map());
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const characterVoiceRef = useRef<Map<CharacterVoiceType, HTMLAudioElement>>(new Map());

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('redboot-audio-settings', JSON.stringify(settings));
  }, [settings]);

  // Initialize audio elements
  useEffect(() => {
    // Preload sound effects (these would be actual audio files in production)
    const soundEffects: Record<SoundType, string> = {
      treasure_chest_open: '/sounds/treasure-chest-open.mp3',
      ship_bell_success: '/sounds/ship-bell.mp3',
      parrot_hint: '/sounds/parrot-squawk.mp3',
      cannon_achievement: '/sounds/cannon-fire.mp3',
      anchor_button_click: '/sounds/anchor-click.mp3',
      waves_gentle: '/sounds/ocean-waves.mp3',
      compass_navigation: '/sounds/compass-tick.mp3',
      victory_fanfare: '/sounds/pirate-victory.mp3',
      spell_correct: '/sounds/spell-correct.mp3',
      spell_incorrect: '/sounds/spell-incorrect.mp3',
    };

    // Character voice clips
    const characterVoices: Record<CharacterVoiceType, string> = {
      red_boot_ahoy: '/voices/red-boot-ahoy.mp3',
      red_boot_great_job: '/voices/red-boot-great-job.mp3',
      red_boot_try_again: '/voices/red-boot-try-again.mp3',
      red_boot_welcome: '/voices/red-boot-welcome.mp3',
      red_boot_adventure_complete: '/voices/red-boot-adventure-complete.mp3',
      ocean_blue_encouraging: '/voices/ocean-blue-encouraging.mp3',
      salty_helpful_tip: '/voices/salty-helpful-tip.mp3',
    };

    // Create audio elements for sound effects
    Object.entries(soundEffects).forEach(([key, src]) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = 'metadata';
      soundEffectsRef.current.set(key as SoundType, audio);
    });

    // Create audio elements for character voices
    Object.entries(characterVoices).forEach(([key, src]) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = 'metadata';
      characterVoiceRef.current.set(key as CharacterVoiceType, audio);
    });

    return () => {
      // Cleanup audio elements
      soundEffectsRef.current.clear();
      characterVoiceRef.current.clear();
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  // Update settings function
  const updateSettings = (newSettings: Partial<AudioSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Play sound effect
  const playSound = (soundType: SoundType, volume = 1) => {
    if (!settings.soundEffectsEnabled || settings.focusModeEnabled) return;
    
    const audio = soundEffectsRef.current.get(soundType);
    if (audio) {
      audio.volume = settings.masterVolume * volume;
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  };

  // Start background music
  const startBackgroundMusic = (musicType: BackgroundMusicType) => {
    if (!settings.backgroundMusicEnabled || settings.focusModeEnabled) return;

    const musicSources: Record<BackgroundMusicType, string> = {
      ocean_ambient: '/music/ocean-ambient.mp3',
      pirate_adventure: '/music/pirate-adventure.mp3',
      study_focus: '/music/study-focus.mp3',
      celebration: '/music/celebration.mp3',
    };

    // Stop current music if playing
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }

    // Start new music
    const audio = new Audio(musicSources[musicType]);
    audio.volume = settings.masterVolume * 0.3; // Background music at lower volume
    audio.loop = true;
    audio.play().catch(console.error);
    backgroundMusicRef.current = audio;
  };

  // Stop background music
  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current = null;
    }
  };

  // Play character voice
  const playCharacterVoice = (voiceType: CharacterVoiceType) => {
    if (!settings.characterVoiceEnabled || settings.focusModeEnabled) return;

    const audio = characterVoiceRef.current.get(voiceType);
    if (audio) {
      audio.volume = settings.masterVolume;
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  };

  // Set focus mode
  const setFocusMode = (enabled: boolean) => {
    updateSettings({ focusModeEnabled: enabled });
    if (enabled) {
      stopBackgroundMusic();
    }
  };

  const contextValue: AudioContextType = {
    settings,
    updateSettings,
    playSound,
    startBackgroundMusic,
    stopBackgroundMusic,
    playCharacterVoice,
    setFocusMode,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

// Custom hook to use audio context
export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

// Audio control button component
export function AudioControls() {
  const { settings, updateSettings, setFocusMode } = useAudio();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border" data-testid="audio-controls">
      <div className="flex flex-col gap-2">
        {/* Master Volume */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.masterVolume}
            onChange={(e) => updateSettings({ masterVolume: parseFloat(e.target.value) })}
            className="w-20"
            data-testid="volume-slider"
          />
        </div>

        {/* Audio Toggles */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={settings.soundEffectsEnabled}
              onChange={(e) => updateSettings({ soundEffectsEnabled: e.target.checked })}
              data-testid="toggle-sound-effects"
            />
            🎵 Effects
          </label>
          
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={settings.backgroundMusicEnabled}
              onChange={(e) => updateSettings({ backgroundMusicEnabled: e.target.checked })}
              data-testid="toggle-background-music"
            />
            🎼 Music
          </label>
          
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={settings.characterVoiceEnabled}
              onChange={(e) => updateSettings({ characterVoiceEnabled: e.target.checked })}
              data-testid="toggle-character-voice"
            />
            🏴‍☠️ Voice
          </label>
          
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={settings.focusModeEnabled}
              onChange={(e) => setFocusMode(e.target.checked)}
              data-testid="toggle-focus-mode"
            />
            🎯 Focus
          </label>
        </div>
      </div>
    </div>
  );
}