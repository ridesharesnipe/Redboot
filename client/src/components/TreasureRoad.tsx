import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Crown, Gem, Coins, Diamond } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

interface TreasureRoadProps {
  isOpen: boolean;
  onClose: () => void;
  totalWords: number;
  masteredWords: number;
  newlyMastered?: number; // Words just mastered in this session
}

interface TreasureMilestone {
  id: string;
  name: string;
  icon: React.ReactNode;
  wordsRequired: number;
  color: string;
  unlocked: boolean;
  newlyUnlocked: boolean;
}

export default function TreasureRoad({ isOpen, onClose, totalWords, masteredWords, newlyMastered = 0 }: TreasureRoadProps) {
  const { playSound } = useAudio();
  const [showCelebration, setShowCelebration] = useState(false);

  // Helper function to convert Tailwind color classes to hex
  const getHexColor = (colorClass: string): string => {
    const colorMap: Record<string, string> = {
      'text-gray-400': '#9CA3AF',
      'text-green-500': '#10B981',
      'text-red-500': '#EF4444',
      'text-blue-400': '#60A5FA',
      'text-yellow-500': '#EAB308',
      'text-purple-500': '#A855F7'
    };
    return colorMap[colorClass] || '#9CA3AF';
  };

  // Calculate treasure milestones based on total words
  const getMilestones = (total: number, mastered: number): TreasureMilestone[] => {
    const milestones: TreasureMilestone[] = [];
    const steps = Math.ceil(total / 6); // Divide into ~6 segments
    
    const treasureTypes = [
      { name: "Silver Coins", icon: <Coins className="w-6 h-6" />, color: "text-gray-400" },
      { name: "Emeralds", icon: <Gem className="w-6 h-6" />, color: "text-green-500" },
      { name: "Rubies", icon: <Gem className="w-6 h-6" />, color: "text-red-500" },
      { name: "Diamonds", icon: <Diamond className="w-6 h-6" />, color: "text-blue-400" },
      { name: "Gold Coins", icon: <Coins className="w-6 h-6" />, color: "text-yellow-500" },
      { name: "Ultimate Treasure", icon: <Crown className="w-6 h-6" />, color: "text-purple-500" }
    ];

    treasureTypes.forEach((treasure, index) => {
      const wordsRequired = Math.min((index + 1) * steps, total);
      const wasUnlocked = mastered - newlyMastered >= wordsRequired;
      const nowUnlocked = mastered >= wordsRequired;
      
      milestones.push({
        id: treasure.name.toLowerCase().replace(' ', '-'),
        name: treasure.name,
        icon: treasure.icon,
        wordsRequired,
        color: treasure.color,
        unlocked: nowUnlocked,
        newlyUnlocked: !wasUnlocked && nowUnlocked
      });
    });

    return milestones;
  };

  const milestones = getMilestones(totalWords, masteredWords);
  const progress = Math.min((masteredWords / totalWords) * 100, 100);
  
  // Show celebration for newly unlocked treasures
  useEffect(() => {
    if (isOpen && milestones.some(m => m.newlyUnlocked)) {
      setShowCelebration(true);
      playSound('treasure_chest_open');
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [isOpen, milestones, playSound]);

  // SVG path for S-curve
  const pathData = `M 50 30 
                   Q 80 50 50 70
                   Q 20 90 50 110
                   Q 80 130 50 150
                   Q 20 170 50 190
                   Q 80 210 50 230`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-hidden relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-pirate text-white">Treasure Road</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
                data-testid="button-close-treasure-road"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Summary */}
            <div className="text-center mb-6 text-white">
              <div className="text-lg font-bold">{masteredWords} of {totalWords} Words Mastered</div>
              {newlyMastered > 0 && (
                <div className="text-yellow-300 text-sm">
                  +{newlyMastered} new {newlyMastered === 1 ? 'word' : 'words'} this session!
                </div>
              )}
            </div>

            {/* SVG Treasure Road */}
            <div className="relative bg-white/10 rounded-xl p-4 mb-4">
              <svg viewBox="0 0 100 260" className="w-full h-64">
                {/* Background path */}
                <path
                  d={pathData}
                  stroke="#D4A574"
                  strokeWidth="8"
                  fill="none"
                  opacity="0.5"
                />
                
                {/* Progress path */}
                <path
                  d={pathData}
                  stroke="#F4D03F"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="200"
                  strokeDashoffset={200 - (progress * 2)}
                  className="transition-all duration-1000"
                />

                {/* Red Boot Position */}
                <motion.circle
                  cx="50"
                  cy={30 + (progress * 2)}
                  r="4"
                  fill="#DC2626"
                  animate={{
                    scale: showCelebration ? [1, 1.5, 1] : 1,
                  }}
                  transition={{ duration: 0.5, repeat: showCelebration ? 2 : 0 }}
                />

                {/* Treasure Milestones */}
                {milestones.map((milestone, index) => {
                  const yPosition = 30 + ((milestone.wordsRequired / totalWords) * 200);
                  return (
                    <motion.g key={milestone.id}>
                      <circle
                        cx="50"
                        cy={yPosition}
                        r="8"
                        fill={milestone.unlocked ? getHexColor(milestone.color) : '#9CA3AF'}
                        opacity={milestone.unlocked ? 1 : 0.5}
                        stroke="#FFF"
                        strokeWidth="2"
                      />
                      {milestone.newlyUnlocked && (
                        <motion.circle
                          cx="50"
                          cy={yPosition}
                          r="12"
                          fill="none"
                          stroke="#FFD700"
                          strokeWidth="2"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0, 1],
                          }}
                          transition={{ duration: 1, repeat: 3 }}
                        />
                      )}
                    </motion.g>
                  );
                })}
              </svg>
            </div>

            {/* Treasure List */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {milestones.map((milestone) => (
                <motion.div
                  key={milestone.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    milestone.unlocked 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/10 text-white/60'
                  }`}
                  animate={{
                    scale: milestone.newlyUnlocked ? [1, 1.05, 1] : 1,
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className={milestone.color}>
                    {milestone.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{milestone.name}</div>
                    <div className="text-xs opacity-75">
                      {milestone.wordsRequired} {milestone.wordsRequired === 1 ? 'word' : 'words'}
                    </div>
                  </div>
                  {milestone.unlocked && (
                    <div className="text-green-300 text-sm">✓</div>
                  )}
                  {milestone.newlyUnlocked && (
                    <motion.div
                      className="text-yellow-300 text-sm font-bold"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                    >
                      NEW!
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Continue Button */}
            <Button
              onClick={onClose}
              className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              data-testid="button-continue-adventure"
            >
              Continue Adventure!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}