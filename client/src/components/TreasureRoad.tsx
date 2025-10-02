import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreasureType, TreasureNode, TreasureMapState, DEFAULT_TREASURE_NODES } from '@shared/schema';
import redBootImage from '@assets/17586438224363330781733458024019_1758643831046.png';
import { useAudio } from '@/contexts/AudioContext';

interface TreasureRoadProps {
  totalWords: number;
  masteredWords: number;
  treasureJustUnlocked?: string;
}

// Treasure icons mapping - 12 different varieties!
const TREASURE_ICONS = {
  [TreasureType.GOLD_RING]: '💍',
  [TreasureType.DIAMOND]: '💎', 
  [TreasureType.RUBY]: '❤️',
  [TreasureType.GOLD_BAR]: '🥇',
  [TreasureType.CROWN]: '👑',
  [TreasureType.GEM]: '💠',
  [TreasureType.PEARL]: '🦪',
  [TreasureType.CRYSTAL]: '🔮',
  [TreasureType.COIN]: '🪙',
  [TreasureType.TROPHY]: '🏆',
  [TreasureType.STAR]: '⭐',
  [TreasureType.MEDAL]: '🏅'
};

// Particle component for digging effects - BIGGER and MORE VISIBLE
const DiggingParticle = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute w-3 h-3 bg-orange-700 rounded-full z-10"
    style={{
      boxShadow: '0 0 8px rgba(194, 65, 12, 0.8)'
    }}
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 2, 0.8],
      x: [0, Math.random() * 60 - 30],
      y: [0, -Math.random() * 50 - 20]
    }}
    transition={{ duration: 1.5, delay }}
  />
);

// Smoke effect component - ENHANCED with bigger, more visible plumes
const SmokeEffect = () => (
  <motion.div
    className="absolute inset-0 pointer-events-none z-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-16 h-16 bg-amber-900 rounded-full"
        style={{
          left: `${30 + Math.random() * 40}%`,
          top: `${30 + Math.random() * 40}%`,
          boxShadow: '0 0 30px rgba(120, 53, 15, 0.9), 0 0 60px rgba(92, 38, 3, 0.5)'
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ 
          scale: [0, 2, 3.5],
          opacity: [1, 0.7, 0],
          y: [-15, -50, -90],
          x: [0, Math.random() * 20 - 10, Math.random() * 40 - 20]
        }}
        transition={{ duration: 2, delay: i * 0.1 }}
      />
    ))}
  </motion.div>
);

// Colorful Parrot component - Flying parrots across the screen
const Parrot = ({ delay = 0, yPosition = 20 }: { delay?: number; yPosition?: number }) => (
  <motion.div
    className="absolute text-6xl z-20 pointer-events-none"
    style={{
      left: '-10%',
      top: `${yPosition}%`,
      pointerEvents: 'none'
    }}
    initial={{ x: 0 }}
    animate={{ 
      x: ['0vw', '110vw']
    }}
    transition={{ 
      duration: 12 + Math.random() * 4,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  >
    🦜
  </motion.div>
);

// Individual treasure spot component
const TreasureSpot = ({ 
  node, 
  isActive, 
  isDigging, 
  onDigComplete 
}: { 
  node: TreasureNode;
  isActive: boolean;
  isDigging: boolean;
  onDigComplete: () => void;
}) => {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isDigging) {
      setShowParticles(true);
      // Complete digging after animation
      setTimeout(() => {
        setShowParticles(false);
        onDigComplete();
      }, 2500);
    }
  }, [isDigging, onDigComplete]);

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <div className="relative w-20 h-20 flex items-center justify-center">
        
        {/* Sand mound under X mark */}
        {!node.isRevealed && !isDigging && (
          <div className="absolute bottom-0 w-24 h-12 rounded-t-full bg-gradient-to-b from-amber-400 to-amber-600 opacity-80 shadow-xl" style={{
            boxShadow: '0 4px 20px rgba(217, 119, 6, 0.5), inset 0 -2px 8px rgba(180, 83, 9, 0.3)'
          }} />
        )}
        
        {/* Red X Mark (before digging) - ON TOP OF MOUND */}
        {!node.isRevealed && !isDigging && (
          <motion.div
            className={`
              relative w-16 h-16 flex items-center justify-center z-10
              ${isActive ? 'scale-125' : 'scale-100'}
            `}
            animate={isActive ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-red-600 font-bold text-5xl drop-shadow-2xl transform" style={{
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 10px rgba(220, 38, 38, 0.5)'
            }}>
              ✕
            </div>
            {isActive && (
              <motion.div
                className="absolute inset-0 border-3 border-yellow-400 rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  boxShadow: '0 0 20px rgba(250, 204, 21, 0.8)'
                }}
              />
            )}
          </motion.div>
        )}

        {/* Dirt Pile (after digging) */}
        {node.isRevealed && (
          <div className="w-12 h-8 rounded-full bg-gradient-to-b from-amber-700 to-amber-900 glass-card shadow-lg relative">
            {/* Dirt texture overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600 via-transparent to-amber-900 opacity-60" />
          </div>
        )}

        {/* Digging Effects - MORE PARTICLES for dramatic effect */}
        <AnimatePresence>
          {isDigging && (
            <>
              <SmokeEffect />
              <div className="absolute inset-0 z-10">
                {[...Array(15)].map((_, i) => (
                  <DiggingParticle key={i} delay={i * 0.08} />
                ))}
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Treasure Chest Opening Animation */}
        <AnimatePresence>
          {node.isRevealed && (
            <motion.div
              className="absolute -top-16 left-1/2 transform -translate-x-1/2"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              {/* Treasure Chest */}
              <motion.div
                className="relative w-20 h-16 rounded-lg shadow-2xl"
                style={{
                  background: 'linear-gradient(to bottom, #92400e, #78350f)',
                  border: '3px solid #a16207',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                }}
              >
                {/* Chest lid */}
                <motion.div
                  className="absolute -top-1 left-0 right-0 h-8 rounded-t-lg"
                  style={{
                    background: 'linear-gradient(to bottom, #a16207, #92400e)',
                    border: '3px solid #a16207',
                    borderBottom: 'none',
                    transformOrigin: 'bottom',
                    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                  }}
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: -120 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                >
                  {/* Gold lock */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-500 text-sm">
                    🔒
                  </div>
                </motion.div>
                
                {/* Chest glow when opening */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-yellow-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{ duration: 1, delay: 1.8 }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glass Morphism Treasure flying out and spinning */}
        <AnimatePresence>
          {node.isRevealed && (
            <motion.div
              className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20"
              initial={{ scale: 0, y: 0 }}
              animate={{ 
                scale: [0, 1.8, 1.2],
                y: [0, -80, -60],
                rotateY: [0, 1080, 720]
              }}
              transition={{ 
                duration: 2,
                delay: 2.2,
                type: "spring",
                bounce: 0.3
              }}
            >
              {/* Glass Morphism Treasure with enhanced styling */}
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl relative"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(12px)',
                  border: '3px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 40px rgba(250, 204, 21, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.3)'
                }}
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.15, 1],
                }}
                transition={{ 
                  rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                {TREASURE_ICONS[node.treasureType]}
                
                {/* Enhanced glowing effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(250, 204, 21, 0.4), transparent)',
                  }}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Enhanced sparkle effects */}
                <div className="absolute -inset-6">
                  <motion.div
                    className="absolute top-0 left-0 text-2xl"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    className="absolute bottom-0 right-0 text-2xl"
                    animate={{ 
                      rotate: [360, 0],
                      scale: [1, 1.3, 1]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    ⭐
                  </motion.div>
                  <motion.div
                    className="absolute top-1/2 right-0 text-xl"
                    animate={{ 
                      rotate: [0, 360],
                      x: [0, 5, 0]
                    }}
                    transition={{ duration: 2.8, repeat: Infinity }}
                  >
                    💫
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Treasure shelf component (top-right collection)
const TreasureShelf = ({ unlockedTreasures }: { unlockedTreasures: TreasureType[] }) => (
  <div className="absolute top-4 right-4 z-20">
    <div className="glass-card bg-gradient-to-br from-yellow-400/20 to-amber-600/20 p-3 rounded-xl min-w-[200px]">
      <div className="text-center mb-2">
        <div className="text-sm font-bold text-amber-800 font-pirate">Treasure Collection</div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <AnimatePresence>
          {unlockedTreasures.map((treasure, index) => (
            <motion.div
              key={`${treasure}-${index}`}
              className="glass-button w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md"
              initial={{ scale: 0, x: -200, y: 200 }}
              animate={{ scale: 1, x: 0, y: 0 }}
              transition={{ 
                duration: 1, 
                delay: index * 0.2,
                type: "spring",
                bounce: 0.5 
              }}
            >
              {TREASURE_ICONS[treasure]}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="text-xs text-amber-700 text-center mt-1">
        {unlockedTreasures.length} treasures found
      </div>
    </div>
  </div>
);

// Red Boot sprite component - BIGGER like Diego!
const RedBootSprite = ({ position }: { position: { x: number; y: number } }) => (
  <motion.div
    className="absolute w-32 h-32 z-10 transform -translate-x-1/2 -translate-y-1/2"
    animate={{ left: `${position.x}%`, top: `${position.y}%` }}
    transition={{ duration: 1.5, type: "easeInOut" }}
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative w-full h-full">
        <div className="w-28 h-28 rounded-full bg-white border-4 border-amber-600 shadow-2xl overflow-hidden mx-auto" style={{
          boxShadow: '0 8px 32px rgba(217, 119, 6, 0.4), 0 0 20px rgba(251, 191, 36, 0.3)'
        }}>
          <img 
            src={redBootImage}
            alt="Red Boot the Pirate"
            className="w-full h-full object-cover scale-110"
          />
        </div>
        {/* Pirate hat shadow */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-black/20 rounded-full" />
      </div>
    </motion.div>
  </motion.div>
);

export default function TreasureRoad({ totalWords, masteredWords, treasureJustUnlocked }: TreasureRoadProps) {
  const { playCharacterVoice, playSound } = useAudio();
  
  const [mapState, setMapState] = useState<TreasureMapState>({
    currentNodeIndex: 0,
    redBootPosition: { x: 15, y: 75 }, // Start at first X
    unlockedTreasures: [],
    totalCorrectAnswers: masteredWords
  });

  const [treasureNodes, setTreasureNodes] = useState<TreasureNode[]>(
    DEFAULT_TREASURE_NODES.slice(0, Math.min(totalWords, 12)).map(node => ({
      ...node,
      isUnlocked: false,
      isDigging: false,
      isRevealed: false
    }))
  );

  const [currentlyDigging, setCurrentlyDigging] = useState<string | null>(null);

  // Handle word mastery progression
  useEffect(() => {
    if (masteredWords > mapState.totalCorrectAnswers && mapState.currentNodeIndex < treasureNodes.length) {
      const nextNodeIndex = Math.min(masteredWords - 1, treasureNodes.length - 1);
      const nextNode = treasureNodes[nextNodeIndex];
      
      // Move Red Boot to next position
      setMapState(prev => ({
        ...prev,
        currentNodeIndex: nextNodeIndex,
        redBootPosition: { x: nextNode.x, y: nextNode.y },
        totalCorrectAnswers: masteredWords
      }));

      // Start digging animation
      setCurrentlyDigging(nextNode.id);
      setTreasureNodes(prev => prev.map(node => 
        node.id === nextNode.id ? { ...node, isDigging: true, isUnlocked: true } : node
      ));
    }
  }, [masteredWords, mapState.totalCorrectAnswers, mapState.currentNodeIndex, treasureNodes.length]);

  // Handle external treasure unlocking (from SimplePractice)
  useEffect(() => {
    if (treasureJustUnlocked && mapState.currentNodeIndex < treasureNodes.length) {
      const currentNode = treasureNodes[mapState.currentNodeIndex];
      if (currentNode && !currentNode.isDigging) {
        setCurrentlyDigging(currentNode.id);
        setTreasureNodes(prev => prev.map(node => 
          node.id === currentNode.id ? { ...node, isDigging: true, isUnlocked: true } : node
        ));
      }
    }
  }, [treasureJustUnlocked, mapState.currentNodeIndex, treasureNodes]);

  const handleDigComplete = (nodeId: string) => {
    const node = treasureNodes.find(n => n.id === nodeId);
    if (!node) return;

    // Play treasure chest opening sound and Red Boot's excited voice!
    playSound('treasure_chest_open');
    setTimeout(() => {
      playCharacterVoice('red_boot_treasure');
    }, 1800); // Delay to sync with chest opening animation

    // Reveal treasure and add to collection
    setTreasureNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, isDigging: false, isRevealed: true } : n
    ));
    
    setMapState(prev => ({
      ...prev,
      unlockedTreasures: [...prev.unlockedTreasures, node.treasureType]
    }));

    setCurrentlyDigging(null);
  };

  return (
    <div className="relative w-full h-[500px] mx-auto max-w-5xl" data-testid="treasure-road">
      {/* Flying colorful parrots */}
      <Parrot delay={0} yPosition={15} />
      <Parrot delay={3} yPosition={25} />
      <Parrot delay={7} yPosition={10} />
      <Parrot delay={12} yPosition={30} />
      
      {/* Main treasure map container */}
      <div className="relative w-full h-full glass-card rounded-2xl overflow-hidden bg-gradient-to-br from-amber-200/40 via-yellow-100/30 to-orange-200/40 shadow-2xl">
        
        {/* Beach sand background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-yellow-200 to-orange-300 opacity-50 rounded-2xl" />
        
        {/* Sandy beach border effect */}
        <div className="absolute inset-0 border-8 border-amber-400/40 rounded-2xl" />
        
        {/* Decorative glass morphism palm trees - MUCH BIGGER like sea monsters */}
        <motion.div 
          className="absolute top-6 left-12 text-8xl drop-shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            borderRadius: '24px',
            padding: '12px'
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🌴
        </motion.div>
        <motion.div 
          className="absolute top-16 right-16 text-8xl drop-shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            borderRadius: '24px',
            padding: '12px'
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          🌴
        </motion.div>
        <motion.div 
          className="absolute bottom-12 left-16 text-8xl drop-shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            borderRadius: '24px',
            padding: '12px'
          }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          🌴
        </motion.div>
        <motion.div 
          className="absolute bottom-8 right-8 text-8xl drop-shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            borderRadius: '24px',
            padding: '12px'
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          🌴
        </motion.div>
        
        {/* Compass rose */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 glass-card w-14 h-14 rounded-full flex items-center justify-center bg-amber-400/20 shadow-lg">
          <div className="text-xl drop-shadow-md">🧭</div>
        </div>
        
        {/* Treasure spots (X marks or piles with treasures) */}
        {treasureNodes.map(node => (
          <TreasureSpot
            key={node.id}
            node={node}
            isActive={mapState.currentNodeIndex === node.wordIndex}
            isDigging={currentlyDigging === node.id}
            onDigComplete={() => handleDigComplete(node.id)}
          />
        ))}
        
        {/* Red Boot character */}
        <RedBootSprite position={mapState.redBootPosition} />
        
        {/* Map title */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="glass-card bg-amber-400/20 px-6 py-3 rounded-lg shadow-lg">
            <div className="text-center text-amber-800 font-bold font-pirate text-xl drop-shadow-md">
              Red Boot's Treasure Island
            </div>
          </div>
        </div>
      </div>
      
      {/* Treasure collection shelf */}
      <TreasureShelf unlockedTreasures={mapState.unlockedTreasures} />
    </div>
  );
}