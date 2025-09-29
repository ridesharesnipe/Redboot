import { useEffect, useState } from 'react';
import redBootImage from '@assets/17586438224363330781733458024019_1758643831046.png';

interface TreasureRoadProps {
  totalWords: number;
  masteredWords: number;
  treasureJustUnlocked?: string;
}

export default function TreasureRoad({ totalWords, masteredWords, treasureJustUnlocked }: TreasureRoadProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [isDigging, setIsDigging] = useState(false);
  const progress = (masteredWords / totalWords) * 100;
  
  useEffect(() => {
    if (treasureJustUnlocked) {
      setShowAnimation(true);
      setIsDigging(true);
      // Start digging animation
      setTimeout(() => setIsDigging(false), 1500);
      // Keep treasure unlock animation longer
      setTimeout(() => setShowAnimation(false), 3000);
    }
  }, [treasureJustUnlocked]);
  
  // Calculate milestones with unique word counts for proper per-word distribution
  const getMilestones = () => {
    const treasureTypes = [
      { treasure: 'Silver Coins', icon: '🪙', color: 'text-gray-600', isChest: false },
      { treasure: 'Emeralds', icon: '💚', color: 'text-emerald-600', isChest: false },
      { treasure: 'Rubies', icon: '❤️', color: 'text-red-600', isChest: false },
      { treasure: 'Diamonds', icon: '💎', color: 'text-blue-500', isChest: true },
      { treasure: 'Gold Coins', icon: '🥇', color: 'text-yellow-600', isChest: true }
    ];
    
    const milestones = [];
    
    // Create milestones based on word count - ensuring unique word values
    if (totalWords <= 3) {
      // For very short lists: milestone at each word except final
      for (let i = 1; i < totalWords; i++) {
        const treasureIndex = (i - 1) % treasureTypes.length;
        milestones.push({
          words: i,
          ...treasureTypes[treasureIndex],
          position: 20 + (60 * i / totalWords) // Spread from 20% to 80%
        });
      }
    } else if (totalWords <= 6) {
      // For short lists: milestone every 2 words
      for (let i = 2; i < totalWords; i += 2) {
        const treasureIndex = Math.floor((i - 2) / 2) % treasureTypes.length;
        milestones.push({
          words: i,
          ...treasureTypes[treasureIndex],
          position: 15 + (70 * i / totalWords) // Spread from 15% to 85%
        });
      }
    } else {
      // For longer lists: create specific milestone positions based on total words
      let milestoneWords = [];
      
      if (totalWords === 7) {
        milestoneWords = [1, 3, 4, 6]; // 4 milestones for proper pacing
      } else if (totalWords === 8) {
        milestoneWords = [2, 3, 5, 6]; // 4 milestones 
      } else if (totalWords <= 12) {
        // For 9-12 words: distribute 4 milestones
        const quarter = totalWords / 4;
        milestoneWords = [
          Math.round(quarter * 0.5),      // ~12.5% 
          Math.round(quarter * 1.5),      // ~37.5%
          Math.round(quarter * 2.5),      // ~62.5%
          Math.round(quarter * 3.2)       // ~80%
        ].filter(w => w > 0 && w < totalWords);
      } else {
        // For 13+ words: distribute 4-5 milestones more evenly  
        const step = totalWords / 5;
        milestoneWords = [
          Math.floor(step),           // 20%
          Math.floor(step * 2.2),     // 44%
          Math.floor(step * 3.2),     // 64%
          Math.floor(step * 4.1)      // 82%
        ].filter(w => w > 0 && w < totalWords);
      }
      
      // Convert to milestone objects
      milestoneWords.forEach((words, index) => {
        const treasureIndex = index % treasureTypes.length;
        const position = 10 + (80 * words / totalWords); // Position proportional to word progress
        milestones.push({
          words,
          ...treasureTypes[treasureIndex],
          position
        });
      });
    }
    
    // Always add final treasure at totalWords (unique position)
    milestones.push({ 
      words: totalWords, 
      treasure: 'Ultimate Treasure', 
      icon: '👑', 
      color: 'text-purple-600', 
      position: 90, 
      isChest: true 
    });
    
    return milestones;
  };
  
  const milestones = getMilestones();
  
  // Calculate Red Boot's position - Top-down vertical movement
  const getRedBootPosition = () => {
    // Check if Red Boot should be at a milestone
    const currentMilestone = milestones.find(m => masteredWords === m.words);
    if (currentMilestone) {
      // Snap to exact milestone position when reached
      return {
        left: 50, // Center horizontally
        top: 10 + currentMilestone.position
      };
    }
    
    // Otherwise, interpolate between milestones based on progress
    const progressPercent = Math.max(0, Math.min(100, (masteredWords / totalWords) * 100));
    
    // Find which milestone range we're in for smooth movement
    let targetPosition = progressPercent * 0.8; // Scale to 80% of container height
    if (milestones.length > 0) {
      const nextMilestone = milestones.find(m => masteredWords < m.words);
      if (nextMilestone) {
        const prevMilestone = milestones[milestones.indexOf(nextMilestone) - 1];
        if (prevMilestone) {
          // Interpolate between previous and next milestone
          const prevWords = prevMilestone.words;
          const nextWords = nextMilestone.words;
          const progressInRange = (masteredWords - prevWords) / (nextWords - prevWords);
          targetPosition = prevMilestone.position + (nextMilestone.position - prevMilestone.position) * progressInRange;
        } else {
          // Before first milestone
          targetPosition = (masteredWords / nextMilestone.words) * nextMilestone.position;
        }
      } else {
        // After last milestone
        const lastMilestone = milestones[milestones.length - 1];
        targetPosition = lastMilestone.position;
      }
    }
    
    return {
      left: 50, // Center horizontally  
      top: 10 + targetPosition
    };
  };
  
  const redBootPos = getRedBootPosition();

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="relative bg-gradient-to-br from-blue-300 via-emerald-300 to-yellow-200 rounded-3xl p-8 shadow-2xl border-4 border-amber-600">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-900">🏴‍☠️ Red Boot's Treasure Map 🏴‍☠️</h2>
          <p className="text-lg text-amber-700 font-semibold">{masteredWords} of {totalWords} words mastered!</p>
        </div>
        
        {/* Top-Down Treasure Island Map - Vertical Path */}
        <div className="relative h-96 bg-gradient-to-b from-blue-200 via-emerald-200 to-amber-100 rounded-2xl overflow-hidden shadow-2xl border-2 border-yellow-400">
          
          {/* Island Background - Top-down view */}
          <div className="absolute inset-0">
            {/* Ocean water at edges */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-blue-400 to-blue-300"></div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-400 to-blue-300"></div>
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-blue-400 to-blue-300"></div>
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-blue-400 to-blue-300"></div>
            
            {/* Island terrain - grass and sand */}
            <div className="absolute top-8 bottom-8 left-8 right-8 bg-gradient-to-b from-emerald-300 via-green-400 to-amber-200 rounded-xl"></div>
            
            {/* Palm trees scattered around - top-down view */}
            <div className="absolute top-12 left-12 text-3xl opacity-80">🌴</div>
            <div className="absolute top-16 right-16 text-2xl opacity-70">🌴</div>
            <div className="absolute bottom-20 left-20 text-3xl opacity-80">🌴</div>
            <div className="absolute bottom-16 right-12 text-2xl opacity-70">🌴</div>
            <div className="absolute top-1/3 left-1/4 text-xl opacity-60">🌿</div>
            <div className="absolute bottom-1/3 right-1/4 text-xl opacity-60">🌿</div>
            
            {/* Rocks and vegetation */}
            <div className="absolute top-20 right-20 text-lg opacity-50">🪨</div>
            <div className="absolute bottom-24 left-16 text-lg opacity-50">🪨</div>
          </div>
          
          {/* Vertical Treasure Path - Top to Bottom */}
          <div className="absolute top-4 bottom-4 left-1/2 transform -translate-x-1/2 w-16">
            {/* Path shadow for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 opacity-40 rounded-full transform translate-x-1 filter blur-sm"></div>
            
            {/* Main dirt path */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-800 rounded-full"></div>
            
            {/* Sandy path surface */}
            <div className="absolute top-0 bottom-0 left-1 right-1 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 rounded-full"></div>
            
            {/* Center walking trail */}
            <div className="absolute top-0 bottom-0 left-2 right-2 bg-gradient-to-b from-yellow-300 via-amber-300 to-yellow-300 rounded-full opacity-90"></div>
            
            {/* Footprint marks along the path */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-amber-700 rounded-full opacity-60"></div>
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 translate-x-1 w-1 h-2 bg-amber-700 rounded-full opacity-60"></div>
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 -translate-x-1 w-1 h-2 bg-amber-700 rounded-full opacity-60"></div>
          </div>
          
          {/* Treasure milestones positioned along the vertical trail */}
          <div className="absolute inset-0">
            {milestones.map((milestone, index) => {
              const unlocked = masteredWords >= milestone.words;
              
              // Calculate position on vertical trail - aligned with Red Boot path
              const left = 50; // Center horizontally on the path
              const top = 10 + milestone.position; // Vertical position along the path
              
              return (
                <div
                  key={milestone.treasure}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {/* Enhanced Treasure with Digging Animation */}
                  <div className="relative">
                    {/* Digging dirt animation */}
                    {isDigging && treasureJustUnlocked === milestone.treasure && (
                      <div className="absolute -top-8 -left-8 w-20 h-20 flex items-center justify-center">
                        <div className="animate-bounce">
                          {/* Dirt particles flying out */}
                          <div className="absolute top-0 left-0 w-2 h-2 bg-amber-600 rounded-full animate-ping"></div>
                          <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-700 rounded-full animate-bounce"></div>
                          <div className="absolute bottom-1 left-3 w-2 h-2 bg-amber-700 rounded-full animate-pulse"></div>
                          <div className="absolute bottom-2 right-0 w-1 h-1 bg-brown-600 rounded-full animate-ping"></div>
                          {/* Digging shovel */}
                          <div className="text-2xl animate-bounce">⛏️</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Treasure base - X marks the spot when locked */}
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-500 relative
                      ${unlocked ? 
                        milestone.treasure === 'Silver Coins' ? 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-500' :
                        milestone.treasure === 'Emeralds' ? 'bg-gradient-to-br from-emerald-200 via-emerald-400 to-emerald-600' :
                        milestone.treasure === 'Rubies' ? 'bg-gradient-to-br from-red-200 via-red-400 to-red-600' :
                        milestone.treasure === 'Diamonds' ? 'bg-gradient-to-br from-blue-100 via-cyan-300 to-blue-500' :
                        milestone.treasure === 'Gold Coins' ? 'bg-gradient-to-br from-yellow-200 via-amber-300 to-yellow-500' :
                        'bg-gradient-to-br from-purple-300 via-violet-400 to-purple-600'
                        : 'bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-600'}
                      ${unlocked && treasureJustUnlocked === milestone.treasure ? 'animate-bounce scale-125' : 'hover:scale-105'}
                      ${unlocked ? 'animate-pulse' : ''}
                    `}>
                      {/* X marks the spot for locked treasures */}
                      {!unlocked && (
                        <div className="text-2xl font-bold text-amber-900">✖️</div>
                      )}
                      
                      {/* Treasure icon when unlocked */}
                      {unlocked && (
                        <div 
                          className={`
                            relative z-10 transition-all duration-300
                            ${showAnimation && treasureJustUnlocked === milestone.treasure ? 'animate-bounce scale-110' : ''}
                            filter drop-shadow-lg
                          `} 
                          style={{ 
                            fontSize: '2rem',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 8px rgba(255,255,255,0.6)'
                          }}
                        >
                          {milestone.icon}
                        </div>
                      )}
                      
                      {/* Sparkle effects for unlocked treasure */}
                      {unlocked && (
                        <>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-200 rounded-full opacity-80 animate-ping"></div>
                          <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full opacity-90 animate-pulse"></div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Milestone word count label */}
                  <div className="relative mt-2">
                    <div className={`
                      px-2 py-1 rounded-lg text-xs font-bold shadow-md transform transition-all duration-300
                      ${unlocked ? 
                        'bg-gradient-to-r from-yellow-200 to-amber-200 text-amber-900 border border-amber-400' : 
                        'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 border border-gray-400'
                      }
                    `}>
                      {milestone.words}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Red Boot character - Walking vertically down the treasure path */}
            <div 
              className="absolute flex items-center justify-center transition-all duration-1000 ease-in-out z-30"
              style={{ 
                left: `${redBootPos.left}%`, 
                top: `${redBootPos.top}%`,
                transform: 'translate(-50%, -50%)' 
              }}
              data-testid="red-boot-character"
            >
              <div className={`relative transform transition-all duration-1000 ${isDigging ? 'animate-bounce' : ''}`}>
                {/* Red Boot's Adventure Glow */}
                <div className="absolute -inset-3 bg-gradient-radial from-yellow-400 via-amber-300 to-transparent rounded-full opacity-25 animate-pulse pointer-events-none"></div>
                
                {/* Digging animation with shovel */}
                {isDigging && (
                  <div className="absolute -top-6 -right-6 animate-bounce">
                    <div className="text-xl">⛏️</div>
                    {/* Dirt particles */}
                    <div className="absolute -top-2 left-2 w-1 h-1 bg-amber-700 rounded-full animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-yellow-800 rounded-full animate-bounce"></div>
                  </div>
                )}
                
                {/* Red Boot character - Top-down view */}
                <img 
                  src={redBootImage} 
                  alt="Red Boot the Pirate" 
                  className={`relative z-20 w-14 h-14 object-contain transform transition-all duration-500 hover:scale-110 ${isDigging ? 'animate-pulse' : ''}`}
                  style={{ 
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4)) drop-shadow(0 0 8px rgba(255,215,0,0.5)) brightness(1.1)',
                    imageRendering: 'crisp-edges'
                  }}
                />
                
                {/* Footprint trail behind Red Boot */}
                <div className="absolute inset-0 bg-gradient-radial from-amber-500 to-transparent rounded-full opacity-40 animate-pulse pointer-events-none transform scale-75"></div>
                
                {/* Adventure sparkles */}
                <div className="absolute -top-1 -left-1 w-1 h-1 bg-yellow-200 rounded-full opacity-80 animate-bounce"></div>
                <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-amber-300 rounded-full opacity-90 animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Treasure announcement */}
        {treasureJustUnlocked && (
          <div className="mt-4 text-center animate-bounce">
            <div className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 rounded-xl px-4 py-2 inline-block shadow-xl border-2 border-amber-500">
              <span className="text-lg font-bold text-amber-900">
                🏴‍☠️ {treasureJustUnlocked} Found! ⚡
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}