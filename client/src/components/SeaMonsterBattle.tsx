import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import diegoImage from "@assets/17586535267086549247092506575635_1758653585024.png";
import diegoBarkSound from "@assets/chihuahua-barks-75088_1759205101905.mp3";
import { useAudio } from '@/contexts/AudioContext';

export enum SeaMonsterType {
  KRAKEN = 'KRAKEN',
  SHARK = 'SHARK',
  SEA_DRAGON = 'SEA_DRAGON',
  GIANT_SQUID = 'GIANT_SQUID',
  SEA_SERPENT = 'SEA_SERPENT',
  LEVIATHAN = 'LEVIATHAN',
  MEGALODON = 'MEGALODON',
  HYDRA = 'HYDRA',
}

interface SeaMonsterNode {
  id: string;
  x: number;
  y: number;
  monsterType: SeaMonsterType;
  wordIndex: number;
  isDefeated: boolean;
  isBattling: boolean;
  isRevealed: boolean;
}

interface SeaMonsterBattleProps {
  totalWords: number;
  masteredWords: number;
  treasureJustUnlocked?: boolean;
}

// Sea monster emojis and names
const MONSTER_DATA = {
  [SeaMonsterType.KRAKEN]: { emoji: '🐙', name: 'Kraken', treasure: '💎' },
  [SeaMonsterType.SHARK]: { emoji: '🦈', name: 'Mega Shark', treasure: '🔴' },
  [SeaMonsterType.SEA_DRAGON]: { emoji: '🐉', name: 'Sea Dragon', treasure: '👑' },
  [SeaMonsterType.GIANT_SQUID]: { emoji: '🦑', name: 'Giant Squid', treasure: '💚' },
  [SeaMonsterType.SEA_SERPENT]: { emoji: '🐍', name: 'Sea Serpent', treasure: '🟢' },
  [SeaMonsterType.LEVIATHAN]: { emoji: '🐋', name: 'Leviathan', treasure: '💎' },
  [SeaMonsterType.MEGALODON]: { emoji: '🦈', name: 'Megalodon', treasure: '🔴' },
  [SeaMonsterType.HYDRA]: { emoji: '🐲', name: 'Hydra', treasure: '💚' },
};

// Default monster positions scattered across the sea (spread out to prevent overlap)
const DEFAULT_MONSTER_NODES: Omit<SeaMonsterNode, 'isDefeated' | 'isBattling' | 'isRevealed'>[] = [
  { id: 'monster-1', x: 15, y: 70, monsterType: SeaMonsterType.SHARK, wordIndex: 0 },
  { id: 'monster-2', x: 45, y: 25, monsterType: SeaMonsterType.KRAKEN, wordIndex: 1 },
  { id: 'monster-3', x: 75, y: 65, monsterType: SeaMonsterType.GIANT_SQUID, wordIndex: 2 },
  { id: 'monster-4', x: 25, y: 15, monsterType: SeaMonsterType.SEA_DRAGON, wordIndex: 3 },
  { id: 'monster-5', x: 85, y: 35, monsterType: SeaMonsterType.SEA_SERPENT, wordIndex: 4 },
  { id: 'monster-6', x: 55, y: 55, monsterType: SeaMonsterType.LEVIATHAN, wordIndex: 5 },
  { id: 'monster-7', x: 90, y: 20, monsterType: SeaMonsterType.MEGALODON, wordIndex: 6 },
  { id: 'monster-8', x: 65, y: 10, monsterType: SeaMonsterType.HYDRA, wordIndex: 7 },
];

export default function SeaMonsterBattle({ totalWords, masteredWords, treasureJustUnlocked }: SeaMonsterBattleProps) {
  const { playAudioFile } = useAudio();
  const [diegoPosition, setDiegoPosition] = useState({ x: 10, y: 80 });
  const [monsterNodes, setMonsterNodes] = useState<SeaMonsterNode[]>([]);
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
  const [defeatedTreasures, setDefeatedTreasures] = useState<string[]>([]);
  const [currentlyBattling, setCurrentlyBattling] = useState<string | null>(null);

  // Initialize/update monster nodes when totalWords changes
  useEffect(() => {
    if (totalWords > 0) {
      const newMonsters = DEFAULT_MONSTER_NODES.slice(0, Math.min(totalWords, 8)).map(node => ({
        ...node,
        isDefeated: false,
        isBattling: false,
        isRevealed: false
      }));
      setMonsterNodes(newMonsters);
      // Set initial Diego position to first monster
      if (newMonsters.length > 0) {
        setDiegoPosition({ x: newMonsters[0].x, y: newMonsters[0].y });
      }
    }
  }, [totalWords]);

  // Handle word mastery progression
  useEffect(() => {
    if (masteredWords > currentMonsterIndex && currentMonsterIndex < monsterNodes.length) {
      const nextMonsterIndex = Math.min(masteredWords - 1, monsterNodes.length - 1);
      const nextMonster = monsterNodes[nextMonsterIndex];
      
      // Move Diego to next monster position
      setDiegoPosition({ x: nextMonster.x, y: nextMonster.y });
      setCurrentMonsterIndex(nextMonsterIndex);
      
      // Diego barks when starting the battle!
      playAudioFile(diegoBarkSound, 1, true); // Play from middle
      
      // Start battle animation
      setCurrentlyBattling(nextMonster.id);
      setMonsterNodes(prev => prev.map(node => 
        node.id === nextMonster.id ? { ...node, isBattling: true } : node
      ));
    }
  }, [masteredWords, currentMonsterIndex, monsterNodes.length, playAudioFile]);

  // Handle external treasure unlocking
  useEffect(() => {
    if (treasureJustUnlocked && currentMonsterIndex < monsterNodes.length) {
      const currentMonster = monsterNodes[currentMonsterIndex];
      if (currentMonster && !currentMonster.isBattling) {
        setCurrentlyBattling(currentMonster.id);
        setMonsterNodes(prev => prev.map(node => 
          node.id === currentMonster.id ? { ...node, isBattling: true } : node
        ));
      }
    }
  }, [treasureJustUnlocked, currentMonsterIndex, monsterNodes]);

  const handleBattleComplete = (monsterId: string) => {
    const monster = monsterNodes.find(n => n.id === monsterId);
    if (!monster) return;

    // Reveal defeated monster and add treasure
    setMonsterNodes(prev => prev.map(n => 
      n.id === monsterId ? { ...n, isBattling: false, isRevealed: true, isDefeated: true } : n
    ));
    
    const monsterData = MONSTER_DATA[monster.monsterType];
    setDefeatedTreasures(prev => [...prev, monsterData.treasure]);
    setCurrentlyBattling(null);
  };

  return (
    <div className="relative w-full h-[500px] mx-auto max-w-5xl" data-testid="sea-monster-battle">
      {/* Main sea battle container with glass morphism */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.4) 0%, rgba(3, 105, 161, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        
        {/* Ocean waves background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 via-blue-500 to-blue-900" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900 to-transparent" />
        </div>

        {/* Animated waves - multiple layers */}
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
          {/* Wave 1 */}
          <motion.div
            className="absolute bottom-0 left-0 w-[200%] h-20"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            }}
            animate={{
              x: ['-50%', '0%'],
              y: [0, -3, 0],
            }}
            transition={{
              x: { duration: 8, repeat: Infinity, ease: 'linear' },
              y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
          {/* Wave 2 */}
          <motion.div
            className="absolute bottom-0 left-0 w-[200%] h-24"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(96, 165, 250, 0.2) 0%, transparent 70%)',
            }}
            animate={{
              x: ['0%', '-50%'],
              y: [0, 4, 0],
            }}
            transition={{
              x: { duration: 10, repeat: Infinity, ease: 'linear' },
              y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            }}
          />
          {/* Wave 3 */}
          <motion.div
            className="absolute bottom-0 left-0 w-[200%] h-16"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(147, 197, 253, 0.25) 0%, transparent 70%)',
            }}
            animate={{
              x: ['-30%', '20%'],
              y: [0, -2, 0],
            }}
            transition={{
              x: { duration: 12, repeat: Infinity, ease: 'linear' },
              y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            }}
          />
        </div>
        
        {/* Monster nodes */}
        {monsterNodes.map((monster) => {
          const monsterData = MONSTER_DATA[monster.monsterType];
          
          return (
            <div
              key={monster.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
              style={{
                left: `${monster.x}%`,
                top: `${monster.y}%`,
                zIndex: monster.isBattling ? 50 : 10,
              }}
            >
              {/* Battle animation */}
              <AnimatePresence>
                {monster.isBattling && (
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.3, 1] }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 2 }}
                    onAnimationComplete={() => handleBattleComplete(monster.id)}
                    className="relative"
                  >
                    {/* Fire and smoke effects */}
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                      <motion.div
                        animate={{
                          y: [-20, -60],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                        className="text-6xl"
                      >
                        🔥
                      </motion.div>
                    </div>
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <motion.div
                        animate={{
                          y: [-10, -50],
                          opacity: [1, 0],
                          scale: [1, 1.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.3,
                        }}
                        className="text-5xl"
                      >
                        💨
                      </motion.div>
                    </div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                        }}
                        className="text-4xl"
                      >
                        ⚔️
                      </motion.div>
                    </div>
                    
                    {/* Glass morphism bubbles during battle */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          left: `${(i * 30) % 100}px`,
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                          width: `${20 + (i % 3) * 10}px`,
                          height: `${20 + (i % 3) * 10}px`,
                        }}
                        animate={{
                          y: [0, -100, -200],
                          x: [0, (i % 2 === 0 ? 20 : -20)],
                          opacity: [0, 0.8, 0],
                          scale: [0.5, 1, 0.8],
                        }}
                        transition={{
                          duration: 2 + i * 0.2,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: 'easeOut',
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Monster display */}
              {!monster.isDefeated ? (
                <div className={`text-center ${monster.isBattling ? 'animate-pulse' : ''}`}>
                  <div className="text-8xl mb-2 drop-shadow-2xl filter brightness-110">
                    {monsterData.emoji}
                  </div>
                  <div className="text-xs font-bold text-white bg-red-600/80 px-2 py-1 rounded-full shadow-lg backdrop-blur-sm">
                    {monsterData.name}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  className="text-center"
                >
                  <div className="text-5xl mb-1 drop-shadow-xl animate-bounce">
                    {monsterData.treasure}
                  </div>
                  <div className="text-xs font-bold text-white bg-green-600/80 px-2 py-1 rounded-full shadow-lg backdrop-blur-sm">
                    Victory!
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}

        {/* Diego on pirate boat */}
        <motion.div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
          animate={{
            left: `${diegoPosition.x}%`,
            top: `${diegoPosition.y}%`,
          }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
          }}
        >
          <div className="relative">
            {/* Pirate boat */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-9xl drop-shadow-2xl">
              ⛵
            </div>
            {/* Diego on the boat */}
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-28 h-28 rounded-full overflow-hidden shadow-2xl -bottom-8"
            >
              <img 
                src={diegoImage}
                alt="Diego the Pup Pup"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Floating treasures with glass morphism */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-2">
          {defeatedTreasures.map((treasure, index) => {
            const isGlassTreasure = ['💎', '🔴', '💚', '🟢'].includes(treasure);
            return (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180, y: -50 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  y: [0, -5, 0],
                }}
                transition={{
                  scale: { duration: 0.5 },
                  rotate: { duration: 0.5 },
                  y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.1 }
                }}
                className="text-2xl drop-shadow-2xl relative"
                style={isGlassTreasure ? {
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  padding: '8px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                } : {}}
              >
                {treasure}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          Monsters Defeated: {defeatedTreasures.length} / {monsterNodes.length}
        </div>
      </div>
    </div>
  );
}
