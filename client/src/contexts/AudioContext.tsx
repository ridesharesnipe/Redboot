import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Volume2, Music, Music2, Flag, Target } from 'lucide-react';

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
  playAudioFile: (audioFilePath: string, volume?: number, startFromMiddle?: boolean) => void;
  startBackgroundMusic: (musicType: BackgroundMusicType) => void;
  stopBackgroundMusic: () => void;
  fadeOutBackgroundMusic: (durationMs?: number) => void;
  playCharacterVoice: (voiceType: CharacterVoiceType) => void;
  speakFeedback: (message: string) => void;
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
  | 'red_boot_retry'
  | 'red_boot_bonus'
  | 'red_boot_treasure'
  | 'red_boot_skip'
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicNodesRef = useRef<any[]>([]);
  const musicTimerRef = useRef<number | null>(null);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('redboot-audio-settings', JSON.stringify(settings));
  }, [settings]);

  // Initialize audio system
  useEffect(() => {
    // Initialize Web Audio API
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }

    // Initialize Speech Synthesis API
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    } else {
      console.warn('Speech Synthesis API not supported');
    }

    return () => {
      // Cleanup audio context
      if (musicTimerRef.current) {
        clearTimeout(musicTimerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
      cancelSpeech();
    };
  }, []);

  // Update settings function
  const updateSettings = (newSettings: Partial<AudioSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Generate and play sound effect using Web Audio API
  const playSound = async (soundType: SoundType, volume = 1) => {
    if (!settings.soundEffectsEnabled || settings.focusModeEnabled || !audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const finalVolume = settings.masterVolume * volume;
    
    try {
      // Resume audio context if suspended (required for user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure sound based on type
      switch (soundType) {
        case 'treasure_chest_open':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3);
          gainNode.gain.setValueAtTime(finalVolume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
        case 'ship_bell_success':
          // Create bell with harmonics
          [800, 1200, 1600].forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            gain.gain.setValueAtTime(finalVolume * (0.8 - i * 0.2), audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
            osc.start();
            osc.stop(audioContext.currentTime + 2);
          });
          return;
        case 'cannon_achievement':
          // Cannon: boom + rumble
          const cannonOsc1 = audioContext.createOscillator();
          const cannonOsc2 = audioContext.createOscillator();
          const cannonGain1 = audioContext.createGain();
          const cannonGain2 = audioContext.createGain();
          cannonOsc1.connect(cannonGain1);
          cannonOsc2.connect(cannonGain2);
          cannonGain1.connect(audioContext.destination);
          cannonGain2.connect(audioContext.destination);
          // Boom
          cannonOsc1.type = 'sawtooth';
          cannonOsc1.frequency.setValueAtTime(120, audioContext.currentTime);
          cannonOsc1.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.1);
          cannonGain1.gain.setValueAtTime(finalVolume, audioContext.currentTime);
          cannonGain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          // Rumble
          cannonOsc2.type = 'triangle';
          cannonOsc2.frequency.setValueAtTime(30, audioContext.currentTime + 0.1);
          cannonGain2.gain.setValueAtTime(finalVolume * 0.7, audioContext.currentTime + 0.1);
          cannonGain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
          cannonOsc1.start();
          cannonOsc2.start(audioContext.currentTime + 0.1);
          cannonOsc1.stop(audioContext.currentTime + 0.4);
          cannonOsc2.stop(audioContext.currentTime + 0.8);
          return;
        case 'anchor_button_click':
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          gainNode.gain.setValueAtTime(finalVolume * 0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case 'spell_correct':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
          gainNode.gain.setValueAtTime(finalVolume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
          break;
        case 'spell_incorrect':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
          gainNode.gain.setValueAtTime(finalVolume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
          break;
        case 'victory_fanfare':
          // Play a triumphant sequence
          [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
            gain.gain.setValueAtTime(finalVolume, audioContext.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
            osc.start(audioContext.currentTime + i * 0.15);
            osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
          });
          return;
        case 'parrot_hint':
          // Parrot squawk: noise burst + chirp
          const parrotBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
          const parrotData = parrotBuffer.getChannelData(0);
          for (let i = 0; i < parrotData.length; i++) {
            parrotData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / parrotData.length, 2);
          }
          const parrotSource = audioContext.createBufferSource();
          const parrotFilter = audioContext.createBiquadFilter();
          parrotSource.buffer = parrotBuffer;
          parrotSource.connect(parrotFilter);
          parrotFilter.connect(gainNode);
          parrotFilter.type = 'bandpass';
          parrotFilter.frequency.setValueAtTime(2000, audioContext.currentTime);
          parrotFilter.frequency.exponentialRampToValueAtTime(3000, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(finalVolume * 0.6, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          parrotSource.start();
          return;
        case 'waves_gentle':
          // Ocean waves: filtered noise with slow modulation
          const wavesBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
          const wavesData = wavesBuffer.getChannelData(0);
          for (let i = 0; i < wavesData.length; i++) {
            wavesData[i] = (Math.random() * 2 - 1) * 0.3;
          }
          const wavesSource = audioContext.createBufferSource();
          const wavesFilter = audioContext.createBiquadFilter();
          const wavesLFO = audioContext.createOscillator();
          const wavesLFOGain = audioContext.createGain();
          wavesSource.buffer = wavesBuffer;
          wavesSource.connect(wavesFilter);
          wavesFilter.connect(gainNode);
          wavesLFO.connect(wavesLFOGain);
          wavesLFOGain.connect(wavesFilter.frequency);
          wavesFilter.type = 'lowpass';
          wavesFilter.frequency.setValueAtTime(400, audioContext.currentTime);
          wavesLFO.type = 'sine';
          wavesLFO.frequency.setValueAtTime(0.5, audioContext.currentTime);
          wavesLFOGain.gain.setValueAtTime(200, audioContext.currentTime);
          gainNode.gain.setValueAtTime(finalVolume * 0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
          wavesSource.start();
          wavesLFO.start();
          wavesSource.stop(audioContext.currentTime + 2);
          wavesLFO.stop(audioContext.currentTime + 2);
          return;
        case 'compass_navigation':
          // Compass tick: sharp click
          const clickOsc = audioContext.createOscillator();
          const clickFilter = audioContext.createBiquadFilter();
          clickOsc.connect(clickFilter);
          clickFilter.connect(gainNode);
          clickOsc.type = 'square';
          clickOsc.frequency.setValueAtTime(1000, audioContext.currentTime);
          clickFilter.type = 'highpass';
          clickFilter.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(finalVolume * 0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
          clickOsc.start();
          clickOsc.stop(audioContext.currentTime + 0.05);
          return;
        default:
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          gainNode.gain.setValueAtTime(finalVolume * 0.5, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Play audio file (MP3, WAV, etc.) with optional start time
  const playAudioFile = (audioFilePath: string, volume = 1, startFromMiddle = false) => {
    if (!settings.soundEffectsEnabled || settings.focusModeEnabled) return;
    
    try {
      const audio = new Audio(audioFilePath);
      audio.volume = Math.min(1, Math.max(0, settings.masterVolume * volume));
      
      if (startFromMiddle) {
        // Wait for metadata to load to get duration
        audio.addEventListener('loadedmetadata', () => {
          audio.currentTime = audio.duration / 2; // Start from middle
          audio.play().catch(error => {
            console.error('Error playing audio file:', error);
          });
        });
      } else {
        audio.play().catch(error => {
          console.error('Error playing audio file:', error);
        });
      }
    } catch (error) {
      console.error('Error loading audio file:', error);
    }
  };

  // Start background music using Web Audio API with pirate-themed melodies
  const startBackgroundMusic = (musicType: BackgroundMusicType) => {
    if (!settings.backgroundMusicEnabled || settings.focusModeEnabled || !audioContextRef.current) return;

    // Stop current music if playing
    stopBackgroundMusic();

    const audioContext = audioContextRef.current;
    
    try {
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create persistent gain node for music ducking
      musicGainRef.current = audioContext.createGain();
      musicGainRef.current.connect(audioContext.destination);
      musicGainRef.current.gain.setValueAtTime(0, audioContext.currentTime);
      musicGainRef.current.gain.linearRampToValueAtTime(settings.masterVolume * 0.15, audioContext.currentTime + 1);
      
      musicNodesRef.current = [];
      
      switch (musicType) {
        case 'ocean_ambient':
          // Create ocean waves with filtered noise
          const oceanBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 4, audioContext.sampleRate);
          const oceanData = oceanBuffer.getChannelData(0);
          for (let i = 0; i < oceanData.length; i++) {
            oceanData[i] = (Math.random() * 2 - 1) * 0.2;
          }
          const oceanSource = audioContext.createBufferSource();
          const oceanFilter = audioContext.createBiquadFilter();
          oceanSource.buffer = oceanBuffer;
          oceanSource.loop = true;
          oceanSource.connect(oceanFilter);
          oceanFilter.connect(musicGainRef.current!);
          oceanFilter.type = 'lowpass';
          oceanFilter.frequency.setValueAtTime(300, audioContext.currentTime);
          oceanSource.start();
          musicNodesRef.current.push(oceanSource);
          break;
        case 'pirate_adventure':
          // Authentic sea shanty: "Drunken Sailor" melody with maritime rhythm
          const createSeaShanty = () => {
            // Melody notes for "Drunken Sailor" (simplified)
            const melody = [
              { note: 293.66, duration: 0.5 }, // D4
              { note: 293.66, duration: 0.5 }, // D4  
              { note: 293.66, duration: 0.5 }, // D4
              { note: 329.63, duration: 0.5 }, // E4
              { note: 369.99, duration: 1.0 }, // F#4
              { note: 329.63, duration: 0.5 }, // E4
              { note: 293.66, duration: 1.0 }, // D4
              { note: 246.94, duration: 1.0 }, // B3
            ];
            
            // Bass drum rhythm (ship's heartbeat)
            const createDrumBeat = (startTime: number) => {
              for (let i = 0; i < 8; i++) {
                const drumOsc = audioContext.createOscillator();
                const drumGain = audioContext.createGain();
                drumOsc.connect(drumGain);
                drumGain.connect(musicGainRef.current!);
                drumOsc.type = 'triangle';
                drumOsc.frequency.setValueAtTime(60, startTime + i * 0.5);
                drumGain.gain.setValueAtTime(0.4, startTime + i * 0.5);
                drumGain.gain.exponentialRampToValueAtTime(0.01, startTime + i * 0.5 + 0.1);
                drumOsc.start(startTime + i * 0.5);
                drumOsc.stop(startTime + i * 0.5 + 0.1);
                musicNodesRef.current.push(drumOsc);
              }
            };
            
            // Accordion-like harmony
            const createAccordion = (startTime: number) => {
              const chords = [
                [146.83, 220, 293.66], // D major (low)
                [164.81, 246.94, 329.63], // E minor
                [146.83, 220, 293.66], // D major
                [123.47, 184.997, 246.94], // B minor
              ];
              
              chords.forEach((chord, chordIndex) => {
                chord.forEach((freq, noteIndex) => {
                  const osc = audioContext.createOscillator();
                  const gain = audioContext.createGain();
                  osc.connect(gain);
                  gain.connect(musicGainRef.current!);
                  osc.type = 'sawtooth'; // Accordion-like timbre
                  osc.frequency.setValueAtTime(freq, startTime + chordIndex * 2);
                  gain.gain.setValueAtTime(0.15 - noteIndex * 0.03, startTime + chordIndex * 2);
                  gain.gain.exponentialRampToValueAtTime(0.01, startTime + chordIndex * 2 + 1.8);
                  osc.start(startTime + chordIndex * 2);
                  osc.stop(startTime + chordIndex * 2 + 1.8);
                  musicNodesRef.current.push(osc);
                });
              });
            };
            
            // Fiddle melody
            const createFiddleMelody = (startTime: number) => {
              melody.forEach((note, noteIndex) => {
                const fiddleOsc = audioContext.createOscillator();
                const fiddleGain = audioContext.createGain();
                const fiddleFilter = audioContext.createBiquadFilter();
                
                fiddleOsc.connect(fiddleFilter);
                fiddleFilter.connect(fiddleGain);
                fiddleGain.connect(musicGainRef.current!);
                
                fiddleOsc.type = 'sawtooth';
                fiddleFilter.type = 'lowpass';
                fiddleFilter.frequency.setValueAtTime(2000, startTime);
                
                const noteStart = startTime + noteIndex * 0.5;
                fiddleOsc.frequency.setValueAtTime(note.note, noteStart);
                fiddleGain.gain.setValueAtTime(0.25, noteStart);
                fiddleGain.gain.exponentialRampToValueAtTime(0.01, noteStart + note.duration);
                
                fiddleOsc.start(noteStart);
                fiddleOsc.stop(noteStart + note.duration);
                musicNodesRef.current.push(fiddleOsc);
              });
            };
            
            const currentTime = audioContext.currentTime;
            createDrumBeat(currentTime);
            createAccordion(currentTime);
            createFiddleMelody(currentTime + 0.25); // Slight delay for authentic feel
            
            // Schedule next loop
            musicTimerRef.current = window.setTimeout(() => {
              if (settings.backgroundMusicEnabled && !settings.focusModeEnabled) {
                startBackgroundMusic('pirate_adventure');
              }
            }, 8000);
          };
          
          createSeaShanty();
          break;
        case 'study_focus':
          // Calm ambient drone with gentle modulation
          const focusOsc1 = audioContext.createOscillator();
          const focusOsc2 = audioContext.createOscillator();
          const focusLFO = audioContext.createOscillator();
          const focusLFOGain = audioContext.createGain();
          focusOsc1.connect(musicGainRef.current!);
          focusOsc2.connect(musicGainRef.current!);
          focusLFO.connect(focusLFOGain);
          focusLFOGain.connect(focusOsc1.frequency);
          focusOsc1.type = 'sine';
          focusOsc2.type = 'triangle';
          focusLFO.type = 'sine';
          focusOsc1.frequency.setValueAtTime(220, audioContext.currentTime);
          focusOsc2.frequency.setValueAtTime(330, audioContext.currentTime);
          focusLFO.frequency.setValueAtTime(0.2, audioContext.currentTime);
          focusLFOGain.gain.setValueAtTime(5, audioContext.currentTime);
          focusOsc1.start();
          focusOsc2.start();
          focusLFO.start();
          musicNodesRef.current.push(focusOsc1, focusOsc2, focusLFO);
          break;
        case 'celebration':
          // Triumphant fanfare sequence
          const fanfareNotes = [523, 659, 784, 1047, 784, 659, 523]; // C5-E5-G5-C6-G5-E5-C5
          fanfareNotes.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(musicGainRef.current!);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.3);
            gain.gain.setValueAtTime(0.6, audioContext.currentTime + i * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.3 + 0.5);
            osc.start(audioContext.currentTime + i * 0.3);
            osc.stop(audioContext.currentTime + i * 0.3 + 0.5);
            musicNodesRef.current.push(osc);
          });
          break;
      }
      
      // Store reference for cleanup
      backgroundMusicRef.current = {
        pause: () => {
          musicNodesRef.current.forEach((node: any) => {
            try {
              if (node.stop) node.stop();
            } catch (e) {}
          });
          musicNodesRef.current = [];
        }
      } as HTMLAudioElement;
      
    } catch (error) {
      console.error('Error starting background music:', error);
    }
  };

  // Stop background music
  const stopBackgroundMusic = () => {
    // Clear timer to prevent loop restarts
    if (musicTimerRef.current) {
      clearTimeout(musicTimerRef.current);
      musicTimerRef.current = null;
    }
    
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current = null;
    }
  };

  // Fade out background music smoothly, then stop
  const fadeOutBackgroundMusic = (durationMs = 1500) => {
    if (!musicGainRef.current || !audioContextRef.current) {
      stopBackgroundMusic();
      return;
    }
    const gain = musicGainRef.current;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const durationSec = durationMs / 1000;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + durationSec);
    setTimeout(() => stopBackgroundMusic(), durationMs + 50);
  };

  // Track current speech session to prevent canceled speech from continuing
  const speechSessionRef = useRef<number>(0);

  // Centralized speech cancellation that updates session tracking
  const cancelSpeech = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      speechSessionRef.current++; // Invalidate all pending speech sessions
    }
  };

  // Play character voice using Speech Synthesis API with better voice selection
  const playCharacterVoice = (voiceType: CharacterVoiceType) => {
    if (!settings.characterVoiceEnabled || settings.focusModeEnabled || !speechSynthRef.current) return;

    const synth = speechSynthRef.current;
    cancelSpeech(); // Stop any current speech and invalidate sessions

    // Create unique session ID to detect if this speech has been superseded
    const currentSession = speechSessionRef.current;

    // Duck background music during speech
    if (musicGainRef.current && audioContextRef.current) {
      try {
        musicGainRef.current.gain.linearRampToValueAtTime(
          settings.masterVolume * 0.05,
          audioContextRef.current.currentTime + 0.1
        );
      } catch (e) {}
    }

    // Get child's name for personalized phrases
    const childName = localStorage.getItem('redboot-child-name') || 'matey';
    const name = childName.trim() || 'matey';

    // Kid-friendly pirate phrases - name used sparingly (about 1 in 4 phrases)
    const characterPhrases: Record<CharacterVoiceType, string[]> = {
      red_boot_ahoy: [
        `Ahoy ${name}! Ready to find some treasure?`,
        `Yo ho ho! Time to hunt for word treasure!`,
        `Shiver me timbers! Let's find some spelling gold!`,
        `Ahoy there! The adventure begins!`,
        `All aboard, matey! Let's set sail!`,
        `Anchors aweigh! Time for spelling fun!`,
        `Welcome to the ship, ${name}! Ready for adventure?`,
        `Arrr! Let's discover some treasure today!`,
        `The seas are calm! Perfect for spelling!`,
        `Hoist the sails! Our journey starts now!`,
        `Land ho! I see treasure ahead!`,
        `The treasure map is ready! Let's go!`,
        `Time to be a spelling pirate!`,
        `The ship is ready! All hands on deck!`,
        `Arrr, the adventure awaits, ${name}!`,
        `Let's sail to Treasure Island!`,
        `Ready for a grand adventure?`,
        `The treasure chest awaits, matey!`,
        `Off we go on our spelling quest!`,
        `Yo ho ho, ${name}! This will be fun!`
      ],
      red_boot_welcome: [
        `Welcome aboard, ${name}!`,
        `All hands on deck! Let's go!`,
        `Hold on tight! Here we go!`,
        `Welcome to the crew, ${name}!`,
        `Great to see you, ${name}!`,
        `Ready to find treasure?`,
        `The ship awaits!`,
        `Let's make this fun!`,
        `Adventure time, matey!`,
        `Welcome back, sailor!`,
        `Good to have you here, ${name}!`,
        `The crew is ready!`,
        `Time for adventure!`,
        `Let's get started!`,
        `Ahoy! Off we go!`,
        `The treasure awaits!`,
        `Ready to spell, ${name}?`,
        `Here we go again!`,
        `Another great day for treasure!`,
        `Let's make some magic!`
      ],
      red_boot_great_job: [
        `Arrr, great job, ${name}!`,
        `Yo ho ho! You found treasure!`,
        `Amazing work, Captain!`,
        `Brilliant spelling!`,
        `That's the spirit!`,
        `Fantastic work, ${name}!`,
        `You're on fire!`,
        `Perfect spelling!`,
        `Incredible!`,
        `Way to go!`,
        `Superb!`,
        `Outstanding work!`,
        `You're a natural, ${name}!`,
        `Excellent work!`,
        `That's how it's done!`,
        `Marvelous!`,
        `Splendid spelling!`,
        `Top notch, ${name}!`,
        `Wonderful!`,
        `Keep it up!`
      ],
      red_boot_try_again: [
        `Oops! Try again, ${name}!`,
        `Almost there! One more try!`,
        `No worries! Pirates never give up!`,
        `Close one! Give it another shot!`,
        `That's a tricky one! Try again!`,
        `Not quite, ${name}! You've got this!`,
        `Almost had it! One more time!`,
        `Keep trying, matey!`,
        `So close! Try once more!`,
        `You can do it! Try again!`,
        `That word is sneaky! Try again!`,
        `Tricky letters! Give it another go!`,
        `Almost perfect, ${name}! One more try!`,
        `Close! You're getting it!`,
        `Good effort! Try once more!`,
        `Nearly there! Another try!`,
        `That's tough! Keep going, ${name}!`,
        `Nice try! Do it again!`,
        `Getting closer! Try again!`,
        `Almost! You've got this!`
      ],
      red_boot_adventure_complete: [
        `Shiver me timbers, ${name}! You finished the whole adventure!`,
        `Wow! You found ALL the treasure!`,
        `Land ho! You did it, ${name}!`,
        `Amazing work, Captain!`,
        `The adventure is complete!`,
        `You're a true spelling champion, ${name}!`,
        `Incredible journey, matey!`,
        `What an amazing adventure!`,
        `You conquered the seas!`,
        `Brilliant work! Adventure complete!`,
        `The treasure is all yours, ${name}!`,
        `You're a spelling legend!`,
        `Mission accomplished!`,
        `Fantastic voyage, ${name}!`,
        `You did it! Celebrations all around!`,
        `A true pirate champion!`,
        `What a spectacular finish!`,
        `You sailed through perfectly!`,
        `The crew cheers for you, ${name}!`,
        `Victory is yours, Captain!`
      ],
      ocean_blue_encouraging: [
        `Keep going, ${name}! The treasure is close!`,
        `You're doing great!`,
        `Don't stop now! So close!`,
        `Almost there, sailor!`,
        `You can see the finish, ${name}!`,
        `Keep sailing forward!`,
        `The chest is in sight!`,
        `You're nearly there!`,
        `Just a little more, ${name}!`,
        `Stay strong, matey!`,
        `Almost at the treasure!`,
        `Keep pushing forward!`,
        `So close to the gold!`,
        `You're doing amazing!`,
        `The finish line awaits!`,
        `Almost there, Captain!`,
        `Keep up the great work!`,
        `Victory is near, ${name}!`,
        `Don't give up now!`,
        `The treasure awaits!`
      ],
      red_boot_retry: [
        `Let's try those tricky words again, ${name}!`,
        `Time for round two!`,
        `Ready to practice some more?`,
        `Let's polish up those words!`,
        `Bonus round time, ${name}!`,
        `Extra practice makes perfect!`,
        `Let's master those tricky ones!`,
        `Time to conquer those words!`,
        `Ready for more treasure hunting, ${name}?`,
        `Let's give those words another go!`,
        `Practice time for tricky words!`,
        `Round two, here we come!`,
        `Let's tackle those again, ${name}!`,
        `More practice, more treasure!`,
        `Those words won't escape us!`,
        `Time to show those words who's boss!`,
        `Let's get those tricky ones!`,
        `Another chance to shine, ${name}!`,
        `Ready to master these?`,
        `Let's finish strong, matey!`
      ],
      red_boot_bonus: [
        `Bonus treasure time, ${name}!`,
        `Ready for extra gold?`,
        `Let's practice more for bonus coins!`,
        `Want some extra treasure, ${name}?`,
        `Time for bonus practice!`,
        `Extra words, extra treasure!`,
        `Bonus round awaits!`,
        `More practice, more gold, ${name}!`,
        `Ready for bonus adventure?`,
        `Let's earn extra treasure!`,
        `Bonus time, matey!`,
        `Extra practice for extra loot!`,
        `Want more gold, ${name}?`,
        `Bonus words incoming!`,
        `Time for extra rewards!`,
        `Let's grab more treasure!`,
        `Bonus challenge awaits!`,
        `Extra treasure for you, ${name}!`,
        `Ready for more gold?`,
        `Let's go for bonus coins!`
      ],
      red_boot_treasure: [
        `Look at all this treasure, ${name}!`,
        `Yo ho ho! So much gold!`,
        `Amazing treasure haul!`,
        `The chest is overflowing, ${name}!`,
        `What a treasure trove!`,
        `Gold coins everywhere!`,
        `Shiver me timbers! Such riches!`,
        `The treasure is yours, ${name}!`,
        `A pirate's dream come true!`,
        `So much loot!`,
        `What a haul, ${name}!`,
        `Treasure galore!`,
        `Gold and gems for days!`,
        `The chest is bursting!`,
        `Riches beyond measure!`,
        `A mountain of treasure!`,
        `Pure pirate gold, ${name}!`,
        `Sparkling treasures await!`,
        `The loot is legendary!`,
        `What a fortune, matey!`
      ],
      red_boot_skip: [
        `That's okay, ${name}! We'll try it later!`,
        `No worries! Moving on!`,
        `We'll come back to that one!`,
        `Let's try another word, ${name}!`,
        `That's fine! Next word!`,
        `We'll practice that one later!`,
        `Skipping ahead! No problem, ${name}!`,
        `That's a tricky one! We'll return!`,
        `Moving forward! We've got this!`,
        `Let's try another!`,
        `We'll get that one next time, ${name}!`,
        `On to the next treasure!`,
        `That word can wait!`,
        `Let's keep the adventure going!`,
        `We'll master that later, ${name}!`,
        `Onward to more words!`,
        `That one's sneaky! We'll return!`,
        `Next word awaits!`,
        `We'll tackle that another day!`,
        `Keep sailing forward, ${name}!`
      ],
      salty_helpful_tip: [
        `Sound out each letter carefully, ${name}!`,
        `Break the word into pieces!`,
        `Practice makes perfect!`,
        `Listen to each sound, ${name}!`,
        `Take your time!`,
        `You've got this, ${name}!`,
        `Focus on the tricky part!`,
        `Say it slowly first!`,
        `Think about the sounds!`,
        `One letter at a time, ${name}!`,
        `Listen carefully!`,
        `Sound it out slowly!`,
        `Break it into chunks!`,
        `Focus and concentrate!`,
        `Take a deep breath and try!`,
        `You can figure it out!`,
        `Think about each letter!`,
        `Sound by sound, ${name}!`,
        `Slow and steady wins!`,
        `Concentrate on the sounds!`
      ]
    };

    const phrases = characterPhrases[voiceType];
    const text = phrases[Math.floor(Math.random() * phrases.length)];
    let voiceConfig = { rate: 1, pitch: 1 };

    // Character-specific voice settings
    switch (voiceType) {
      case 'red_boot_ahoy':
      case 'red_boot_welcome':
      case 'red_boot_great_job':
      case 'red_boot_try_again':
      case 'red_boot_adventure_complete':
      case 'red_boot_retry':
      case 'red_boot_bonus':
      case 'red_boot_treasure':
      case 'red_boot_skip':
        voiceConfig = { rate: 0.9, pitch: 1.0 }; // Natural, friendly voice
        break;
      case 'ocean_blue_encouraging':
        voiceConfig = { rate: 0.95, pitch: 1.0 }; // Natural encouraging voice
        break;
      case 'salty_helpful_tip':
        voiceConfig = { rate: 0.85, pitch: 1.0 }; // Slightly slower for tips
        break;
    }

    if (text) {
      // Wait for voices to load if needed
      const speakText = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = voiceConfig.rate;
        utterance.pitch = voiceConfig.pitch;
        utterance.volume = settings.masterVolume;
        
        // Better voice selection based on character
        const voices = synth.getVoices();
        let selectedVoice = null;
        
        // Get the best natural-sounding voice (same approach as spelling test)
        const getNaturalVoice = () => {
          // Prefer non-Google voices as they tend to sound more natural on most devices
          const naturalVoice = voices.find(voice => 
            voice.lang.startsWith('en') && !voice.name.includes('Google')
          );
          if (naturalVoice) return naturalVoice;
          
          // Fallback: any English voice
          const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
          if (englishVoice) return englishVoice;
          
          // Last resort: first available voice
          return voices[0];
        };

        selectedVoice = getNaturalVoice();
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        // Split long text into chunks to prevent browser truncation
        const chunkText = (text: string, maxLength: number = 200): string[] => {
          if (text.length <= maxLength) return [text];
          
          const chunks: string[] = [];
          let currentPos = 0;
          
          while (currentPos < text.length) {
            let endPos = currentPos + maxLength;
            
            // If we're not at the end, try to break at a sentence or phrase boundary
            if (endPos < text.length) {
              const remainingText = text.substring(currentPos, endPos);
              const lastPeriod = remainingText.lastIndexOf('. ');
              const lastComma = remainingText.lastIndexOf(', ');
              const lastSpace = remainingText.lastIndexOf(' ');
              
              if (lastPeriod > maxLength * 0.5) {
                endPos = currentPos + lastPeriod + 2;
              } else if (lastComma > maxLength * 0.5) {
                endPos = currentPos + lastComma + 2;
              } else if (lastSpace > maxLength * 0.5) {
                endPos = currentPos + lastSpace + 1;
              }
            }
            
            chunks.push(text.substring(currentPos, Math.min(endPos, text.length)));
            currentPos = endPos;
          }
          
          return chunks;
        };
        
        // Speak text chunks sequentially
        const chunks = chunkText(text);
        let chunkIndex = 0;
        
        const speakNextChunk = () => {
          // Check if this speech session has been superseded
          if (currentSession !== speechSessionRef.current || chunkIndex >= chunks.length) {
            // Session canceled or all chunks complete - restore music
            if (musicGainRef.current && audioContextRef.current) {
              setTimeout(() => {
                try {
                  musicGainRef.current!.gain.linearRampToValueAtTime(
                    settings.masterVolume * 0.15,
                    audioContextRef.current!.currentTime + 0.5
                  );
                } catch (e) {}
              }, 100);
            }
            return;
          }
          
          const chunkUtterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
          chunkUtterance.rate = voiceConfig.rate;
          chunkUtterance.pitch = voiceConfig.pitch;
          chunkUtterance.volume = settings.masterVolume;
          if (selectedVoice) {
            chunkUtterance.voice = selectedVoice;
          }
          
          chunkUtterance.onend = () => {
            chunkIndex++;
            speakNextChunk();
          };
          
          synth.speak(chunkUtterance);
        };
        
        // Start speaking first chunk
        speakNextChunk();
      };

      // Handle voice loading
      if (synth.getVoices().length === 0) {
        synth.addEventListener('voiceschanged', speakText, { once: true });
      } else {
        speakText();
      }
    }
  };

  // Speak custom feedback message with Red Boot's voice
  const speakFeedback = (message: string) => {
    if (!settings.characterVoiceEnabled || settings.focusModeEnabled || !speechSynthRef.current) return;

    const synth = speechSynthRef.current;
    cancelSpeech(); // Stop any current speech and invalidate sessions

    // Create unique session ID to detect if this speech has been superseded
    const currentSession = speechSessionRef.current;

    // Duck background music during speech
    if (musicGainRef.current && audioContextRef.current) {
      try {
        musicGainRef.current.gain.linearRampToValueAtTime(
          settings.masterVolume * 0.05,
          audioContextRef.current.currentTime + 0.1
        );
      } catch (e) {}
    }

    const speakText = () => {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9; // Natural speaking rate
      utterance.pitch = 1.0;
      utterance.volume = settings.masterVolume;

      // Select natural-sounding voice (same as spelling test)
      const voices = synth.getVoices();
      
      const getNaturalVoice = () => {
        // Prefer non-Google voices as they tend to sound more natural
        const naturalVoice = voices.find(voice => 
          voice.lang.startsWith('en') && !voice.name.includes('Google')
        );
        if (naturalVoice) return naturalVoice;
        
        // Fallback: any English voice
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) return englishVoice;
        
        return voices[0];
      };

      const selectedVoice = getNaturalVoice();
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Split long text into chunks to prevent browser truncation
      const chunkText = (text: string, maxLength: number = 200): string[] => {
        if (text.length <= maxLength) return [text];
        
        const chunks: string[] = [];
        let currentPos = 0;
        
        while (currentPos < text.length) {
          let endPos = currentPos + maxLength;
          
          // If we're not at the end, try to break at a sentence or phrase boundary
          if (endPos < text.length) {
            const remainingText = text.substring(currentPos, endPos);
            const lastPeriod = remainingText.lastIndexOf('. ');
            const lastComma = remainingText.lastIndexOf(', ');
            const lastSpace = remainingText.lastIndexOf(' ');
            
            if (lastPeriod > maxLength * 0.5) {
              endPos = currentPos + lastPeriod + 2;
            } else if (lastComma > maxLength * 0.5) {
              endPos = currentPos + lastComma + 2;
            } else if (lastSpace > maxLength * 0.5) {
              endPos = currentPos + lastSpace + 1;
            }
          }
          
          chunks.push(text.substring(currentPos, Math.min(endPos, text.length)));
          currentPos = endPos;
        }
        
        return chunks;
      };
      
      // Speak text chunks sequentially
      const chunks = chunkText(message);
      let chunkIndex = 0;
      
      const speakNextChunk = () => {
        // Check if this speech session has been superseded
        if (currentSession !== speechSessionRef.current || chunkIndex >= chunks.length) {
          // Session canceled or all chunks complete - restore music
          if (musicGainRef.current && audioContextRef.current) {
            setTimeout(() => {
              try {
                musicGainRef.current!.gain.linearRampToValueAtTime(
                  settings.masterVolume * 0.15,
                  audioContextRef.current!.currentTime + 0.5
                );
              } catch (e) {}
            }, 100);
          }
          return;
        }
        
        const chunkUtterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
        chunkUtterance.rate = 0.9; // Natural speaking rate
        chunkUtterance.pitch = 1.0;
        chunkUtterance.volume = settings.masterVolume;
        if (selectedVoice) {
          chunkUtterance.voice = selectedVoice;
        }
        
        chunkUtterance.onend = () => {
          chunkIndex++;
          speakNextChunk();
        };
        
        synth.speak(chunkUtterance);
      };
      
      // Start speaking first chunk
      speakNextChunk();
    };

    // Handle voice loading
    if (synth.getVoices().length === 0) {
      synth.addEventListener('voiceschanged', speakText, { once: true });
    } else {
      speakText();
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
    playAudioFile,
    startBackgroundMusic,
    stopBackgroundMusic,
    fadeOutBackgroundMusic,
    playCharacterVoice,
    speakFeedback,
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
          <Volume2 className="w-4 h-4" />
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
            <div className="flex items-center gap-1">
              <Music className="w-3 h-3" />
              Effects
            </div>
          </label>
          
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={settings.backgroundMusicEnabled}
              onChange={(e) => updateSettings({ backgroundMusicEnabled: e.target.checked })}
              data-testid="toggle-background-music"
            />
            <div className="flex items-center gap-1">
              <Music2 className="w-3 h-3" />
              Music
            </div>
          </label>
          
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={settings.characterVoiceEnabled}
              onChange={(e) => updateSettings({ characterVoiceEnabled: e.target.checked })}
              data-testid="toggle-character-voice"
            />
            <div className="flex items-center gap-1">
              <Flag className="w-3 h-3" />
              Voice
            </div>
          </label>
          
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={settings.focusModeEnabled}
              onChange={(e) => setFocusMode(e.target.checked)}
              data-testid="toggle-focus-mode"
            />
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              Focus
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}