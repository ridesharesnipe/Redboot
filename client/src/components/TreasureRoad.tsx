import { useEffect, useState } from 'react';
import redBootImage from '@assets/17586438224363330781733458024019_1758643831046.png';

interface TreasureRoadProps {
  totalWords: number;
  masteredWords: number;
  treasureJustUnlocked?: string;
}

export default function TreasureRoad({ totalWords, masteredWords, treasureJustUnlocked }: TreasureRoadProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const progress = (masteredWords / totalWords) * 100;
  
  useEffect(() => {
    if (treasureJustUnlocked) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
    }
  }, [treasureJustUnlocked]);
  
  // Calculate milestones based on word count
  const getMilestones = () => {
    if (totalWords <= 12) {
      return [
        { words: 2, treasure: 'Silver Coins', icon: 'lni-coin-dollar', color: 'text-gray-600', position: 16 },
        { words: 4, treasure: 'Emeralds', icon: 'lni-gem', color: 'text-emerald-600', position: 33 },
        { words: 6, treasure: 'Rubies', icon: 'lni-heart', color: 'text-red-600', position: 50 },
        { words: 8, treasure: 'Diamonds', icon: 'lni-diamond', color: 'text-blue-500', position: 67 },
        { words: 10, treasure: 'Gold Coins', icon: 'lni-coin', color: 'text-yellow-600', position: 83 },
        { words: 12, treasure: 'Ultimate Treasure', icon: 'lni-crown', color: 'text-purple-600', position: 95 }
      ];
    } else {
      return [
        { words: 3, treasure: 'Silver Coins', icon: 'lni-coin-dollar', color: 'text-gray-600', position: 16 },
        { words: 5, treasure: 'Emeralds', icon: 'lni-gem', color: 'text-emerald-600', position: 33 },
        { words: 7, treasure: 'Rubies', icon: 'lni-heart', color: 'text-red-600', position: 50 },
        { words: 10, treasure: 'Diamonds', icon: 'lni-diamond', color: 'text-blue-500', position: 67 },
        { words: 13, treasure: 'Gold Coins', icon: 'lni-coin', color: 'text-yellow-600', position: 83 },
        { words: totalWords, treasure: 'Ultimate Treasure', icon: 'lni-crown', color: 'text-purple-600', position: 95 }
      ];
    }
  };
  
  const milestones = getMilestones();
  
  // Calculate Red Boot's position - must match milestone positioning exactly
  const getRedBootPosition = () => {
    // Check if Red Boot should be at a milestone
    const currentMilestone = milestones.find(m => masteredWords === m.words);
    if (currentMilestone) {
      // Snap to exact milestone position when reached
      return {
        left: 5 + (currentMilestone.position / 100) * 90,
        top: 50
      };
    }
    
    // Otherwise, interpolate between milestones based on progress
    const progressPercent = Math.max(0, Math.min(100, (masteredWords / totalWords) * 100));
    
    // Find which milestone range we're in for smooth movement
    let targetPosition = progressPercent;
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
      left: 5 + (targetPosition / 100) * 90,
      top: 50
    };
  };
  
  const redBootPos = getRedBootPosition();

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="relative bg-gradient-to-b from-blue-300 to-yellow-100 rounded-3xl p-10 shadow-2xl border-4 border-amber-600">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-amber-900">🏴‍☠️ Red Boot's Treasure Road 🏴‍☠️</h2>
          <p className="text-xl text-amber-700 font-semibold">{masteredWords} of {totalWords} words mastered!</p>
        </div>
        
        {/* Vibrant Daytime Treasure Trail - Brilliant Sky & Sun-Drenched */}
        <div className="relative h-48 bg-gradient-to-b from-blue-400 via-sky-300 to-emerald-200 rounded-2xl overflow-hidden shadow-2xl border-2 border-yellow-400">
          
          {/* Brilliant Blue Sky with Fluffy White Clouds */}
          <div className="absolute inset-0">
            {/* Brilliant blue sky background */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-500 via-sky-400 to-sky-300"></div>
            
            {/* Fluffy white clouds */}
            <div className="absolute top-2 left-8 w-12 h-6 bg-white rounded-full opacity-90 shadow-lg"></div>
            <div className="absolute top-1 left-12 w-10 h-5 bg-white rounded-full opacity-80"></div>
            <div className="absolute top-1 right-12 w-14 h-7 bg-white rounded-full opacity-90 shadow-lg"></div>
            <div className="absolute top-2 right-16 w-10 h-5 bg-white rounded-full opacity-80"></div>
            <div className="absolute top-4 left-1/3 w-12 h-6 bg-white rounded-full opacity-85 shadow-md"></div>
            
            {/* Lush tropical ground areas */}
            <div className="absolute top-16 left-0 right-0 bottom-0 bg-gradient-to-b from-emerald-300 via-green-400 to-green-500"></div>
            
            {/* Stylized Lush Palm Trees - Vector Art Style */}
            <div className="absolute bottom-2 left-1">
              <div className="text-4xl transform rotate-12 filter drop-shadow-lg">🌴</div>
              <div className="absolute inset-0 bg-gradient-to-t from-green-600 to-transparent opacity-20 rounded-full"></div>
            </div>
            <div className="absolute bottom-4 right-2">
              <div className="text-4xl transform -rotate-12 filter drop-shadow-lg">🌴</div>
              <div className="absolute inset-0 bg-gradient-to-t from-green-600 to-transparent opacity-20 rounded-full"></div>
            </div>
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
              <div className="text-3xl transform rotate-45 filter drop-shadow-md">🌴</div>
            </div>
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
              <div className="text-3xl transform -rotate-45 filter drop-shadow-md">🌴</div>
            </div>
            
            {/* Tropical flowers for vibrant atmosphere */}
            <div className="absolute top-1/4 left-1/4 text-2xl opacity-70 filter drop-shadow-sm">🌺</div>
            <div className="absolute bottom-1/4 right-1/4 text-2xl opacity-70 filter drop-shadow-sm">🌸</div>
            <div className="absolute top-3/4 left-1/6 text-xl opacity-60">🌼</div>
            <div className="absolute top-1/6 right-1/6 text-xl opacity-60">🌼</div>
          </div>
          
          {/* Sun-Drenched Golden Sandy Trail - 3D Depth & Dynamic Lighting */}
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 px-2">
            {/* Deep trail shadow for 3D depth */}
            <div className="h-28 bg-gradient-to-b from-amber-900 to-yellow-900 opacity-40 rounded-full transform translate-y-2 filter blur-sm"></div>
            
            {/* Trail borders - darker earth edges */}
            <div className="absolute top-0 left-2 right-2 h-28 bg-gradient-to-b from-amber-900 via-yellow-800 to-amber-900 rounded-full"></div>
            
            {/* Main sandy trail base with rich texture */}
            <div className="absolute top-2 left-2 right-2 h-24 bg-gradient-to-b from-yellow-600 via-amber-500 to-yellow-700 rounded-full shadow-inner"></div>
            
            {/* Sun-drenched golden surface - brilliant lighting */}
            <div className="absolute top-4 left-2 right-2 h-20 bg-gradient-to-b from-yellow-400 via-amber-300 to-yellow-500 rounded-full"></div>
            
            {/* Bright center path - where Red Boot walks - with sparkle effect */}
            <div className="absolute top-6 left-2 right-2 h-16 bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-200 rounded-full opacity-95 animate-pulse"></div>
            
            {/* Sun highlights on the trail - dynamic lighting */}
            <div className="absolute top-8 left-8 right-8 h-4 bg-gradient-to-r from-transparent via-yellow-100 to-transparent rounded-full opacity-60"></div>
            <div className="absolute top-12 left-12 right-12 h-2 bg-gradient-to-r from-transparent via-white to-transparent rounded-full opacity-40"></div>
            
            {/* Scattered sand texture details */}
            <div className="absolute top-10 left-12 w-3 h-3 bg-amber-600 rounded-full opacity-50 shadow-sm"></div>
            <div className="absolute top-16 left-24 w-2 h-2 bg-yellow-700 rounded-full opacity-40"></div>
            <div className="absolute top-12 left-36 w-2 h-2 bg-amber-700 rounded-full opacity-35"></div>
            <div className="absolute top-18 right-36 w-3 h-3 bg-amber-600 rounded-full opacity-50 shadow-sm"></div>
            <div className="absolute top-14 right-24 w-2 h-2 bg-yellow-700 rounded-full opacity-40"></div>
            <div className="absolute top-10 right-12 w-2 h-2 bg-amber-700 rounded-full opacity-35"></div>
          </div>
          
          {/* Treasure milestones positioned along the straight trail */}
          <div className="absolute inset-0">
            {milestones.map((milestone, index) => {
              const unlocked = masteredWords >= milestone.words;
              
              // Calculate position on straight trail - same logic as Red Boot to ensure alignment
              const left = 5 + (milestone.position / 100) * 90; // Spread evenly from 5% to 95%
              const top = 50; // Fixed middle position on the trail
              
              return (
                <div
                  key={milestone.treasure}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {/* High-Fidelity Sparkling 3D Treasure - Dynamic Light Reflections */}
                  <div className="relative">
                    {/* Treasure base with 3D depth and shimmer */}
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-500 relative overflow-hidden
                      ${unlocked ? 
                        milestone.treasure === 'Silver Coins' ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600 border-3 border-gray-500' :
                        milestone.treasure === 'Emeralds' ? 'bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 border-3 border-emerald-600' :
                        milestone.treasure === 'Rubies' ? 'bg-gradient-to-br from-red-300 via-red-500 to-red-700 border-3 border-red-600' :
                        milestone.treasure === 'Diamonds' ? 'bg-gradient-to-br from-blue-200 via-cyan-400 to-blue-600 border-3 border-cyan-500' :
                        milestone.treasure === 'Gold Coins' ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-3 border-amber-500' :
                        'bg-gradient-to-br from-purple-400 via-violet-500 to-purple-700 border-3 border-purple-600'
                        : 'bg-gradient-to-br from-gray-200 to-gray-400 border-3 border-gray-400'}
                      ${unlocked && treasureJustUnlocked === milestone.treasure ? 'animate-bounce scale-125 rotate-12' : 'hover:scale-105'}
                      ${unlocked ? 'animate-pulse' : ''}
                    `}>
                      {/* Sparkling light reflection overlay */}
                      {unlocked && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-60 rounded-full animate-ping"></div>
                      )}
                      
                      {/* Dynamic shimmer effect */}
                      {unlocked && (
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-conic from-white via-transparent to-transparent opacity-30 rounded-full animate-spin"></div>
                      )}
                      
                      {/* Treasure icon with enhanced styling */}
                      <i 
                        className={`
                          lni ${milestone.icon} ${unlocked ? milestone.color : 'text-gray-500'} relative z-10
                          ${showAnimation && treasureJustUnlocked === milestone.treasure ? 'animate-bounce' : ''}
                          ${unlocked ? 'filter drop-shadow-lg' : ''}
                        `} 
                        style={{ 
                          fontSize: '2.2rem',
                          textShadow: unlocked ? '2px 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.5)' : 'none'
                        }}
                      ></i>
                      
                      {/* Intense sparkle effects around the treasure */}
                      {unlocked && (
                        <>
                          <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-80 animate-ping"></div>
                          <div className="absolute bottom-2 left-2 w-1 h-1 bg-yellow-200 rounded-full opacity-90 animate-pulse"></div>
                          <div className="absolute top-3 left-1 w-1 h-1 bg-white rounded-full opacity-70 animate-bounce"></div>
                          <div className="absolute bottom-1 right-3 w-1 h-1 bg-yellow-100 rounded-full opacity-80 animate-ping"></div>
                        </>
                      )}
                    </div>
                    
                    {/* Treasure chest for major milestones (every 5+ words) */}
                    {milestone.words >= 8 && unlocked && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <div className="text-2xl filter drop-shadow-lg animate-bounce">🏦</div>
                        <div className="text-xs text-amber-800 font-bold bg-yellow-200 px-2 py-1 rounded-full text-center shadow-md">
                          Chest!
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Milestone word count label - Vibrant Speech Bubbles */}
                  <div className="relative mt-3">
                    <div className={`
                      px-4 py-2 rounded-full text-sm font-bold shadow-lg transform transition-all duration-300 relative
                      ${unlocked ? 
                        'bg-gradient-to-r from-white via-yellow-50 to-white text-amber-900 border-2 border-amber-400 shadow-amber-200' : 
                        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-2 border-gray-400'
                      }
                      ${unlocked ? 'animate-pulse' : ''}
                    `}>
                      {milestone.words} words!
                      {/* Speech bubble tail */}
                      <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 
                        ${unlocked ? 'border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-400' : 'border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-400'}
                      `}></div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Red Boot character - Moving along the actual path */}
            <div 
              className="absolute flex items-center justify-center transition-all duration-1000 ease-in-out"
              style={{ 
                left: `${redBootPos.left}%`, 
                top: `${redBootPos.top}%`,
                transform: 'translate(-50%, -50%)' 
              }}
              data-testid="red-boot-character"
            >
              <div className="relative transform transition-all duration-1000">
                {/* Red Boot's Adventure Glow - Dynamic Lighting */}
                <div className="absolute -inset-4 bg-gradient-radial from-yellow-400 via-amber-300 to-transparent rounded-full opacity-30 animate-pulse pointer-events-none"></div>
                
                {/* Red Boot character - Enhanced 3D Appearance */}
                <img 
                  src={redBootImage} 
                  alt="Red Boot the Pirate" 
                  className="relative z-20 w-18 h-18 object-contain transform transition-all duration-500 hover:scale-110"
                  style={{ 
                    filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5)) drop-shadow(0 0 15px rgba(255,215,0,0.6)) brightness(1.1) contrast(1.1)',
                    imageRendering: 'crisp-edges'
                  }}
                />
                
                {/* Sandy trail footprints behind Red Boot */}
                <div className="absolute inset-0 bg-gradient-radial from-amber-500 to-transparent rounded-full opacity-50 animate-pulse pointer-events-none transform scale-90"></div>
                
                {/* Adventure sparkles around Red Boot */}
                <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-200 rounded-full opacity-80 animate-bounce"></div>
                <div className="absolute -bottom-1 -right-2 w-1 h-1 bg-amber-300 rounded-full opacity-90 animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-2 -left-1 w-1 h-1 bg-yellow-100 rounded-full opacity-80 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Treasure announcement */}
        {treasureJustUnlocked && (
          <div className="mt-6 text-center animate-bounce">
            <div className="bg-yellow-400 rounded-full px-6 py-3 inline-block shadow-lg">
              <span className="text-2xl font-bold text-amber-900">
                {treasureJustUnlocked} Unlocked! 🎉
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}