import { useState, useEffect, useRef } from 'react';
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

// Sea monster emojis and names with progressively increasing treasures
const MONSTER_DATA = {
  [SeaMonsterType.SHARK]: { emoji: '🦈', name: 'Mega Shark', treasures: ['🪙', '🪙'] }, // 2 coins
  [SeaMonsterType.KRAKEN]: { emoji: '🐙', name: 'Kraken', treasures: ['💎', '💎'] }, // 2 diamonds
  [SeaMonsterType.GIANT_SQUID]: { emoji: '🦑', name: 'Giant Squid', treasures: ['💍', '💍', '💍'] }, // 3 rings
  [SeaMonsterType.SEA_DRAGON]: { emoji: '🐉', name: 'Sea Dragon', treasures: ['🏆', '🏆', '🏆'] }, // 3 trophies
  [SeaMonsterType.SEA_SERPENT]: { emoji: '🐍', name: 'Sea Serpent', treasures: ['🪙', '🪙', '🪙', '🪙'] }, // 4 coins
  [SeaMonsterType.LEVIATHAN]: { emoji: '🐋', name: 'Leviathan', treasures: ['💎', '💎', '💎', '💎'] }, // 4 diamonds
  [SeaMonsterType.MEGALODON]: { emoji: '🦈', name: 'Megalodon', treasures: ['💍', '💍', '💍', '💍', '💍'] }, // 5 rings
  [SeaMonsterType.HYDRA]: { emoji: '🐲', name: 'Hydra', treasures: ['👑', '👑', '👑', '👑', '👑'] }, // 5 crowns
};

// Default monster positions scattered across the sea (widely spread out with more spacing)
const DEFAULT_MONSTER_NODES: Omit<SeaMonsterNode, 'isDefeated' | 'isBattling' | 'isRevealed'>[] = [
  { id: 'monster-1', x: 18, y: 78, monsterType: SeaMonsterType.SHARK, wordIndex: 0 },
  { id: 'monster-2', x: 48, y: 12, monsterType: SeaMonsterType.KRAKEN, wordIndex: 1 },
  { id: 'monster-3', x: 82, y: 72, monsterType: SeaMonsterType.GIANT_SQUID, wordIndex: 2 },
  { id: 'monster-4', x: 10, y: 22, monsterType: SeaMonsterType.SEA_DRAGON, wordIndex: 3 },
  { id: 'monster-5', x: 52, y: 40, monsterType: SeaMonsterType.SEA_SERPENT, wordIndex: 4 },
  { id: 'monster-6', x: 25, y: 58, monsterType: SeaMonsterType.LEVIATHAN, wordIndex: 5 },
  { id: 'monster-7', x: 90, y: 10, monsterType: SeaMonsterType.MEGALODON, wordIndex: 6 },
  { id: 'monster-8', x: 85, y: 48, monsterType: SeaMonsterType.HYDRA, wordIndex: 7 },
];

export default function SeaMonsterBattle({ totalWords, masteredWords, treasureJustUnlocked }: SeaMonsterBattleProps) {
  const { playAudioFile } = useAudio();
  const [diegoPosition, setDiegoPosition] = useState({ x: 10, y: 80 });
  const [monsterNodes, setMonsterNodes] = useState<SeaMonsterNode[]>([]);
  const [defeatedTreasures, setDefeatedTreasures] = useState<string[]>([]);
  const [currentlyBattling, setCurrentlyBattling] = useState<string | null>(null);
  const [lastProcessedMastery, setLastProcessedMastery] = useState(0);

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
      // Reset mastery tracking when word list changes
      setLastProcessedMastery(0);
    }
  }, [totalWords]);

  // Handle word mastery progression - simple state-based tracking
  useEffect(() => {
    if (masteredWords > lastProcessedMastery && masteredWords > 0) {
      // Use functional update to get current monsterNodes without including in deps
      setMonsterNodes(prev => {
        if (prev.length === 0) return prev;
        
        const nextMonsterIndex = Math.min(masteredWords - 1, prev.length - 1);
        const nextMonster = prev[nextMonsterIndex];
        
        if (nextMonster) {
          // Move Diego to next monster position
          setDiegoPosition({ x: nextMonster.x, y: nextMonster.y });
          
          // Diego barks when starting the battle!
          playAudioFile(diegoBarkSound, 0.4, true);
          
          // Start battle animation
          setCurrentlyBattling(nextMonster.id);
          
          // Update last processed to prevent re-processing
          setLastProcessedMastery(masteredWords);
          
          // Return updated nodes with battling state
          return prev.map(node => 
            node.id === nextMonster.id ? { ...node, isBattling: true } : node
          );
        }
        return prev;
      });
    }
  }, [masteredWords, lastProcessedMastery, playAudioFile]);

  // Handle external treasure unlocking (simplified - no longer needed with mastery-based progression)

  const handleBattleComplete = (monsterId: string) => {
    const monster = monsterNodes.find(n => n.id === monsterId);
    if (!monster) return;

    // Reveal defeated monster and add treasure
    setMonsterNodes(prev => prev.map(n => 
      n.id === monsterId ? { ...n, isBattling: false, isRevealed: true, isDefeated: true } : n
    ));
    
    const monsterData = MONSTER_DATA[monster.monsterType];
    setDefeatedTreasures(prev => [...prev, ...monsterData.treasures]); // Add all treasures from this monster
    setCurrentlyBattling(null);
  };

  return (
    <div className="relative w-full h-[700px] mx-auto max-w-5xl" data-testid="sea-monster-battle">
      {/* Main sea battle container with glass morphism and 3D perspective */}
      <div className="relative w-full h-full rounded-3xl overflow-visible shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.4) 0%, rgba(3, 105, 161, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          perspective: '1200px',
          transformStyle: 'preserve-3d',
        }}
      >
        
        {/* Ocean waves background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 via-blue-500 to-blue-900" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900 to-transparent" />
        </div>

        {/* Animated waves - 3D rolling waves */}
        <div className="absolute bottom-0 left-0 right-0 h-40 overflow-visible pointer-events-none z-20" style={{ transformStyle: 'preserve-3d' }}>
          {/* Wave 1 - Front layer rolling toward viewer */}
          <motion.div
            className="absolute bottom-0 left-0 w-[300%] h-28 rounded-t-full"
            style={{
              background: 'linear-gradient(to top, rgba(59, 130, 246, 0.8) 0%, rgba(96, 165, 250, 0.6) 50%, rgba(191, 219, 254, 0.4) 100%)',
              boxShadow: '0 -4px 20px rgba(59, 130, 246, 0.5)',
              transformStyle: 'preserve-3d',
              transformOrigin: 'bottom center',
            }}
            animate={{
              x: ['-66%', '0%'],
              rotateX: [-2, 2, -2],
              translateZ: [0, 30, 0],
            }}
            transition={{
              x: { duration: 15, repeat: Infinity, ease: 'linear' },
              rotateX: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              translateZ: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
          {/* Wave 2 - Middle layer with 3D depth */}
          <motion.div
            className="absolute bottom-2 left-0 w-[300%] h-24 rounded-t-full"
            style={{
              background: 'linear-gradient(to top, rgba(37, 99, 235, 0.7) 0%, rgba(59, 130, 246, 0.5) 50%, rgba(147, 197, 253, 0.3) 100%)',
              boxShadow: '0 -3px 15px rgba(37, 99, 235, 0.4)',
              transformStyle: 'preserve-3d',
              transformOrigin: 'bottom center',
            }}
            animate={{
              x: ['0%', '-66%'],
              rotateX: [2, -2, 2],
              translateZ: [-10, 20, -10],
            }}
            transition={{
              x: { duration: 18, repeat: Infinity, ease: 'linear' },
              rotateX: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
              translateZ: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            }}
          />
          {/* Wave 3 - Back layer in distance */}
          <motion.div
            className="absolute bottom-4 left-0 w-[300%] h-20 rounded-t-full"
            style={{
              background: 'linear-gradient(to top, rgba(29, 78, 216, 0.6) 0%, rgba(37, 99, 235, 0.4) 50%, rgba(96, 165, 250, 0.2) 100%)',
              boxShadow: '0 -2px 10px rgba(29, 78, 216, 0.3)',
              transformStyle: 'preserve-3d',
              transformOrigin: 'bottom center',
            }}
            animate={{
              x: ['-33%', '33%'],
              rotateX: [-1, 1, -1],
              translateZ: [-20, 10, -20],
            }}
            transition={{
              x: { duration: 20, repeat: Infinity, ease: 'linear' },
              rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 },
              translateZ: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 },
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
              <AnimatePresence mode="wait">
                {!monster.isDefeated ? (
                  <motion.div
                    key="monster"
                    exit={{ 
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`text-center ${monster.isBattling ? 'animate-pulse' : ''}`}
                  >
                    <div className="text-8xl mb-2 drop-shadow-2xl filter brightness-110">
                      {monsterData.emoji}
                    </div>
                    <div className="text-xs font-bold text-white bg-red-600/80 px-2 py-1 rounded-full shadow-lg backdrop-blur-sm">
                      {monsterData.name}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="treasure"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center relative"
                  >
                    {/* Puff of smoke appears first */}
                    <motion.div
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 2, 3],
                        opacity: [0, 1, 0],
                        y: [0, -30, -60],
                      }}
                      transition={{ duration: 1.5 }}
                    >
                      <div className="text-6xl">💨</div>
                    </motion.div>
                    <motion.div
                      className="absolute -top-12 left-1/4 transform -translate-x-1/2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.5, 2.5],
                        opacity: [0, 0.8, 0],
                        y: [0, -20, -50],
                      }}
                      transition={{ duration: 1.3, delay: 0.1 }}
                    >
                      <div className="text-5xl">💨</div>
                    </motion.div>
                    <motion.div
                      className="absolute -top-10 left-3/4 transform -translate-x-1/2"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.8, 2.8],
                        opacity: [0, 0.9, 0],
                        y: [0, -25, -55],
                      }}
                      transition={{ duration: 1.4, delay: 0.2 }}
                    >
                      <div className="text-5xl">💨</div>
                    </motion.div>
                    
                    {/* Treasures appear after smoke - showing all earned treasures */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    >
                      <div className="mb-2 drop-shadow-2xl animate-bounce flex flex-wrap justify-center items-center gap-1 text-3xl p-2 rounded-xl max-w-[120px]" 
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        {monsterData.treasures.map((treasure, idx) => (
                          <span key={idx}>{treasure}</span>
                        ))}
                      </div>
                      <div className="text-xs font-bold text-white bg-green-600/80 px-2 py-1 rounded-full shadow-lg backdrop-blur-sm">
                        Victory!
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Diego on pirate boat with 3D rocking */}
        <motion.div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            left: `${diegoPosition.x}%`,
            top: `${diegoPosition.y}%`,
          }}
          transition={{
            duration: 1.5,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            className="relative"
            style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
            animate={{
              rotateX: [-8, 8, -8],
              rotateY: [-6, 6, -6],
              rotateZ: [-4, 4, -4],
              translateZ: [0, 15, 0],
            }}
            transition={{
              rotateX: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
              rotateY: { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
              rotateZ: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 },
              translateZ: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            {/* Pirate boat */}
            <motion.div 
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-9xl"
              style={{ transformStyle: 'preserve-3d', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              ⛵
            </motion.div>
            {/* Diego on the boat */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-28 h-28 rounded-full overflow-hidden shadow-2xl"
              style={{
                boxShadow: '0 15px 50px rgba(0,0,0,0.5)',
                border: '3px solid rgba(255,255,255,0.3)',
              }}
            >
              <img 
                src={diegoImage}
                alt="Diego the Pup Pup"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        </motion.div>

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
