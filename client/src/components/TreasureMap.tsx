import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreasureType, TreasureNode, TreasureMapState, DEFAULT_TREASURE_NODES } from '@shared/schema';
import redBootImage from '@assets/17586438224363330781733458024019_1758643831046.png';

interface TreasureMapProps {
  totalWords: number;
  masteredWords: number;
  onTreasureUnlocked?: (treasure: TreasureType) => void;
}

// Treasure icons mapping
const TREASURE_ICONS = {
  [TreasureType.GOLD_RING]: '💍',
  [TreasureType.DIAMOND]: '💎', 
  [TreasureType.RUBY]: '❤️',
  [TreasureType.GOLD_BAR]: '🥇',
  [TreasureType.CROWN]: '👑',
  [TreasureType.GEM]: '💠',
  [TreasureType.PEARL]: '🔮',
  [TreasureType.CRYSTAL]: '🌟',
  [TreasureType.COIN]: '🪙',
  [TreasureType.TROPHY]: '🏆',
  [TreasureType.STAR]: '⭐',
  [TreasureType.MEDAL]: '🥈'
};

// Particle component for digging effects
const DiggingParticle = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute w-2 h-2 bg-amber-600 rounded-full"
    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0.5],
      x: [0, Math.random() * 40 - 20],
      y: [0, -Math.random() * 30 - 10]
    }}
    transition={{ duration: 1.2, delay }}
  />
);

// Smoke effect component
const SmokeEffect = () => (
  <motion.div
    className="absolute inset-0 pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-8 h-8 bg-gray-300 rounded-full opacity-40"
        style={{
          left: `${40 + Math.random() * 20}%`,
          top: `${40 + Math.random() * 20}%`
        }}
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ 
          scale: [0, 2, 3],
          opacity: [0.6, 0.3, 0],
          y: [-10, -30, -50]
        }}
        transition={{ duration: 2, delay: i * 0.2 }}
      />
    ))}
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
      <div className="relative w-16 h-16 flex items-center justify-center">
        
        {/* Red X Mark (before digging) */}
        {!node.isRevealed && !isDigging && (
          <motion.div
            className={`
              relative w-12 h-12 flex items-center justify-center
              ${isActive ? 'scale-125' : 'scale-100'}
            `}
            animate={isActive ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-red-600 font-bold text-4xl drop-shadow-lg transform">
              ✕
            </div>
            {isActive && (
              <motion.div
                className="absolute inset-0 border-2 border-yellow-400 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
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

        {/* Digging Effects */}
        <AnimatePresence>
          {isDigging && (
            <>
              <SmokeEffect />
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <DiggingParticle key={i} delay={i * 0.1} />
                ))}
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Spinning Glowing Treasure (stays above pile permanently) */}
        <AnimatePresence>
          {node.isRevealed && (
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
              initial={{ scale: 0, rotateY: 0, y: 50 }}
              animate={{ 
                scale: [0, 1.5, 1],
                rotateY: [0, 720, 0],
                y: [50, 0, 0]
              }}
              transition={{ duration: 1.5, type: "spring" }}
            >
              {/* Permanent spinning and glowing treasure */}
              <motion.div
                className="glass-card w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl bg-gradient-to-br from-yellow-400 to-amber-600 relative"
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                {TREASURE_ICONS[node.treasureType]}
                
                {/* Glowing effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-yellow-300 opacity-30"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Sparkle effects */}
                <div className="absolute -inset-2">
                  <motion.div
                    className="absolute top-0 left-0 text-yellow-400 text-xs"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    className="absolute bottom-0 right-0 text-yellow-300 text-xs"
                    animate={{ rotate: [360, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    ⭐
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

// Red Boot sprite component
const RedBootSprite = ({ position }: { position: { x: number; y: number } }) => (
  <motion.div
    className="absolute w-20 h-20 z-10 transform -translate-x-1/2 -translate-y-1/2"
    animate={{ left: `${position.x}%`, top: `${position.y}%` }}
    transition={{ duration: 1.5, type: "easeInOut" }}
  >
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative w-full h-full">
        <div className="w-16 h-16 rounded-full bg-white border-2 border-amber-600 shadow-xl overflow-hidden mx-auto">
          <img 
            src={redBootImage}
            alt="Red Boot the Pirate"
            className="w-full h-full object-cover scale-110"
          />
        </div>
        {/* Pirate hat shadow */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black/20 rounded-full" />
      </div>
    </motion.div>
  </motion.div>
);

export default function TreasureMap({ totalWords, masteredWords, onTreasureUnlocked }: TreasureMapProps) {
  const [mapState, setMapState] = useState<TreasureMapState>({
    currentNodeIndex: 0,
    redBootPosition: { x: 15, y: 75 }, // Start at first X
    unlockedTreasures: [],
    totalCorrectAnswers: masteredWords
  });

  const [treasureNodes, setTreasureNodes] = useState<TreasureNode[]>(
    DEFAULT_TREASURE_NODES.slice(0, Math.min(totalWords, 8)).map(node => ({
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

  const handleDigComplete = (nodeId: string) => {
    const node = treasureNodes.find(n => n.id === nodeId);
    if (!node) return;

    // Reveal treasure and add to collection
    setTreasureNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, isDigging: false, isRevealed: true } : n
    ));
    
    setMapState(prev => ({
      ...prev,
      unlockedTreasures: [...prev.unlockedTreasures, node.treasureType]
    }));

    setCurrentlyDigging(null);
    onTreasureUnlocked?.(node.treasureType);
  };

  return (
    <div className="relative w-full h-[500px] mx-auto max-w-5xl" data-testid="treasure-map">
      {/* Main treasure map container */}
      <div className="relative w-full h-full glass-card rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400/30 via-green-400/20 to-emerald-600/30 shadow-2xl">
        
        {/* Island background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-300 to-green-600 opacity-40 rounded-2xl" />
        
        {/* Ocean border effect */}
        <div className="absolute inset-0 border-8 border-blue-400/30 rounded-2xl" />
        
        {/* Decorative palm trees */}
        <div className="absolute top-6 left-12 text-3xl drop-shadow-lg">🌴</div>
        <div className="absolute top-16 right-16 text-2xl drop-shadow-lg">🌴</div>
        <div className="absolute bottom-12 left-16 text-xl drop-shadow-lg">🌴</div>
        <div className="absolute bottom-8 right-8 text-xl drop-shadow-lg">🌴</div>
        
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