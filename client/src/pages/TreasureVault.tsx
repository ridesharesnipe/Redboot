import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useLocation } from 'wouter';

interface TreasureCount {
  diamonds: number;
  coins: number;
  crowns: number;
  bags: number;
  stars: number;
  trophies: number;
}

interface UserTreasures {
  redboot: TreasureCount;
  diego: TreasureCount;
}

export default function TreasureVault() {
  const [, setLocation] = useLocation();
  const { playSound } = useAudio();
  const [selectedCharacter, setSelectedCharacter] = useState<'redboot' | 'diego'>('redboot');
  const [chestOpen, setChestOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const { data: treasures, isLoading } = useQuery<UserTreasures>({
    queryKey: ['/api/treasures'],
  });

  const getTotalTreasures = (treasureCount: TreasureCount): number => {
    return Object.values(treasureCount).reduce((sum, count) => sum + count, 0);
  };

  const getChestLevel = (total: number): { name: string; color: string; glow: string } => {
    if (total >= 500) return { name: 'Legendary', color: 'from-purple-600 to-pink-600', glow: 'rgba(168, 85, 247, 0.6)' };
    if (total >= 200) return { name: 'Gold', color: 'from-yellow-500 to-amber-600', glow: 'rgba(234, 179, 8, 0.6)' };
    if (total >= 50) return { name: 'Silver', color: 'from-gray-300 to-slate-400', glow: 'rgba(148, 163, 184, 0.6)' };
    return { name: 'Wooden', color: 'from-amber-700 to-orange-900', glow: 'rgba(180, 83, 9, 0.6)' };
  };

  const handleChestClick = () => {
    if (!chestOpen) {
      playSound('treasure_chest_open');
      setChestOpen(true);
      setShowParticles(true);
      
      // Play character-specific sound
      if (selectedCharacter === 'diego') {
        // Diego barks when his chest opens
        const audio = new Audio('/attached_assets/chihuahua-barks-75088_1759205101905.mp3');
        audio.volume = 0.4;
        audio.play().catch(console.error);
      } else {
        // Red Boot says something pirate-y
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance("Arrr, me treasure!");
          utterance.rate = 0.75;
          utterance.pitch = 0.9;
          utterance.lang = 'en-GB';
          speechSynthesis.speak(utterance);
        }, 500);
      }

      setTimeout(() => setShowParticles(false), 3000);
    } else {
      setChestOpen(false);
    }
  };

  if (isLoading || !treasures) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading treasure vault...</div>
      </div>
    );
  }

  const currentTreasures = treasures[selectedCharacter];
  const totalCount = getTotalTreasures(currentTreasures);
  const chestLevel = getChestLevel(totalCount);

  const treasureItems = [
    { emoji: '💎', label: 'Diamonds', count: currentTreasures.diamonds, color: 'rgba(59, 130, 246, 0.3)' },
    { emoji: '🪙', label: 'Gold Coins', count: currentTreasures.coins, color: 'rgba(234, 179, 8, 0.3)' },
    { emoji: '👑', label: 'Crowns', count: currentTreasures.crowns, color: 'rgba(168, 85, 247, 0.3)' },
    { emoji: '💰', label: 'Money Bags', count: currentTreasures.bags, color: 'rgba(34, 197, 94, 0.3)' },
    { emoji: '⭐', label: 'Stars', count: currentTreasures.stars, color: 'rgba(251, 191, 36, 0.3)' },
    { emoji: '🏆', label: 'Trophies', count: currentTreasures.trophies, color: 'rgba(249, 115, 22, 0.3)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 p-4">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto mb-4">
        <Button
          onClick={() => setLocation('/dashboard')}
          variant="outline"
          className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 font-semibold px-6 py-3 shadow-lg"
          data-testid="button-back-to-dashboard"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Adventures
        </Button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Character Selection */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            onClick={() => { setSelectedCharacter('redboot'); setChestOpen(false); }}
            className={`px-8 py-6 text-lg font-bold transition-all ${
              selectedCharacter === 'redboot'
                ? 'bg-red-600 hover:bg-red-700 scale-110'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            style={{ fontFamily: 'var(--font-pirate)' }}
            data-testid="button-select-redboot"
          >
            🥾 Red Boot's Vault
          </Button>
          <Button
            onClick={() => { setSelectedCharacter('diego'); setChestOpen(false); }}
            className={`px-8 py-6 text-lg font-bold transition-all ${
              selectedCharacter === 'diego'
                ? 'bg-blue-600 hover:bg-blue-700 scale-110'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            style={{ fontFamily: 'var(--font-fun)' }}
            data-testid="button-select-diego"
          >
            🐕 Diego's Vault
          </Button>
        </div>

        {/* Treasure Chest Card */}
        <Card 
          className="relative overflow-visible"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `0 8px 32px ${chestLevel.glow}`,
          }}
        >
          <CardContent className="p-8">
            {/* Chest Level Badge */}
            <div className="text-center mb-6">
              <div 
                className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${chestLevel.color} text-white font-bold text-xl shadow-lg`}
                style={{
                  boxShadow: `0 4px 20px ${chestLevel.glow}`,
                }}
              >
                <Sparkles className="inline w-5 h-5 mr-2" />
                {chestLevel.name} Chest
              </div>
            </div>

            {/* Total Treasure Count */}
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-white mb-2" style={{ 
                textShadow: `0 0 20px ${chestLevel.glow}, 0 0 40px ${chestLevel.glow}`,
                fontFamily: 'var(--font-pirate)'
              }}>
                {totalCount}
              </div>
              <div className="text-xl text-white/90 font-semibold">TOTAL TREASURES</div>
            </div>

            {/* Animated Treasure Chest */}
            <div className="flex justify-center mb-8">
              <motion.div
                className="relative cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleChestClick}
                data-testid="button-treasure-chest"
              >
                {/* Chest Base */}
                <div 
                  className={`w-64 h-48 rounded-2xl bg-gradient-to-br ${chestLevel.color} relative`}
                  style={{
                    boxShadow: `0 8px 32px ${chestLevel.glow}, inset 0 4px 16px rgba(0, 0, 0, 0.3)`,
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {/* Gold Lock */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl">
                    🔒
                  </div>

                  {/* Chest Lid (opens when clicked) */}
                  <motion.div
                    className={`absolute -top-2 left-0 right-0 h-24 rounded-t-2xl bg-gradient-to-br ${chestLevel.color}`}
                    style={{
                      boxShadow: `0 4px 16px ${chestLevel.glow}`,
                      border: '4px solid rgba(255, 255, 255, 0.3)',
                      transformOrigin: 'bottom',
                    }}
                    animate={{ rotateX: chestOpen ? -120 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {chestOpen && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-4xl">
                        ✨
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Sparkle Particles */}
                <AnimatePresence>
                  {showParticles && (
                    <>
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-3xl"
                          style={{
                            left: '50%',
                            top: '30%',
                          }}
                          initial={{ opacity: 1, scale: 0 }}
                          animate={{
                            opacity: 0,
                            scale: 2,
                            x: (Math.random() - 0.5) * 200,
                            y: -Math.random() * 150,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5, delay: i * 0.05 }}
                        >
                          ✨
                        </motion.div>
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Click to Open Text */}
            <div className="text-center text-white/80 mb-8 font-semibold">
              {chestOpen ? 'Click to close' : 'Click the chest to reveal your treasures!'}
            </div>

            {/* Treasure Grid (shown when chest is open) */}
            <AnimatePresence>
              {chestOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {treasureItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-xl text-center"
                      style={{
                        background: item.color,
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: `0 4px 16px ${item.color}`,
                      }}
                      data-testid={`treasure-${item.label.toLowerCase().replace(' ', '-')}`}
                    >
                      <div className="text-5xl mb-2">{item.emoji}</div>
                      <div className="text-3xl font-bold text-white mb-1">{item.count}</div>
                      <div className="text-sm text-white/90 font-semibold">{item.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Progress to Next Level */}
        {totalCount < 500 && (
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="text-white/90 mb-2 font-semibold">
                {totalCount < 50 && `Collect ${50 - totalCount} more treasures to unlock the Silver Chest!`}
                {totalCount >= 50 && totalCount < 200 && `Collect ${200 - totalCount} more treasures to unlock the Gold Chest!`}
                {totalCount >= 200 && totalCount < 500 && `Collect ${500 - totalCount} more treasures to unlock the Legendary Chest!`}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
