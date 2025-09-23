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
        { words: 2, treasure: 'Silver Coins', icon: 'lni-coin', color: 'text-gray-400', position: 17 },
        { words: 4, treasure: 'Emeralds', icon: 'lni-diamond', color: 'text-green-500', position: 33 },
        { words: 6, treasure: 'Rubies', icon: 'lni-heart', color: 'text-red-500', position: 50 },
        { words: 8, treasure: 'Diamonds', icon: 'lni-diamond', color: 'text-cyan-400', position: 67 },
        { words: 10, treasure: 'Gold Coins', icon: 'lni-coin', color: 'text-yellow-500', position: 83 },
        { words: 12, treasure: 'Ultimate Treasure', icon: 'lni-crown', color: 'text-purple-500', position: 100 }
      ];
    } else {
      return [
        { words: 3, treasure: 'Silver Coins', icon: 'lni-coin', color: 'text-gray-400', position: 20 },
        { words: 5, treasure: 'Emeralds', icon: 'lni-diamond', color: 'text-green-500', position: 33 },
        { words: 7, treasure: 'Rubies', icon: 'lni-heart', color: 'text-red-500', position: 47 },
        { words: 10, treasure: 'Diamonds', icon: 'lni-diamond', color: 'text-cyan-400', position: 67 },
        { words: 13, treasure: 'Gold Coins', icon: 'lni-coin', color: 'text-yellow-500', position: 87 },
        { words: totalWords, treasure: 'Ultimate Treasure', icon: 'lni-crown', color: 'text-purple-500', position: 100 }
      ];
    }
  };
  
  const milestones = getMilestones();
  
  // Calculate Red Boot's position along the S-curve path based on progress
  const getRedBootPosition = () => {
    if (progress < 25) {
      return {
        left: 12.5 + (progress / 25) * 75,
        top: 13
      };
    } else if (progress < 50) {
      return {
        left: 87.5 - ((progress - 25) / 25) * 50,
        top: 26 + ((progress - 25) / 25) * 13
      };
    } else if (progress < 75) {
      return {
        left: 37.5 - ((progress - 50) / 25) * 25,
        top: 39 + ((progress - 50) / 25) * 26
      };
    } else {
      return {
        left: 12.5 + ((progress - 75) / 25) * 75,
        top: 65 + ((progress - 75) / 25) * 26
      };
    }
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
        
        {/* S-shaped road container - Make it larger */}
        <div className="relative h-[28rem]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 420">
            {/* Background decorations */}
            <text x="30" y="30" fontSize="30" opacity="0.3">🌴</text>
            <text x="350" y="50" fontSize="30" opacity="0.3">🌴</text>
            <text x="50" y="180" fontSize="30" opacity="0.3">🌴</text>
            <text x="330" y="200" fontSize="30" opacity="0.3">🌴</text>
            <text x="100" y="330" fontSize="30" opacity="0.3">🌴</text>
            <text x="300" y="350" fontSize="30" opacity="0.3">🌴</text>
            
            {/* S-shaped dirt road */}
            <path
              d="M 50 50 C 150 50, 250 50, 350 100 C 350 150, 250 150, 150 150 C 50 150, 50 200, 150 250 C 250 300, 350 300, 350 350"
              fill="none"
              stroke="#8B4513"
              strokeWidth="40"
              strokeLinecap="round"
              opacity="0.3"
            />
            
            {/* Golden progress overlay */}
            <path
              d="M 50 50 C 150 50, 250 50, 350 100 C 350 150, 250 150, 150 150 C 50 150, 50 200, 150 250 C 250 300, 350 300, 350 350"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="35"
              strokeLinecap="round"
              strokeDasharray={`${progress * 6} 600`}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="goldGradient">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FFA500" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Treasure milestones positioned over the SVG */}
          <div className="absolute inset-0">
            {milestones.map((milestone, index) => {
              const unlocked = masteredWords >= milestone.words;
              
              // Calculate position on S-curve
              let left, top;
              if (milestone.position < 25) {
                left = 12.5 + (milestone.position / 25) * 75;
                top = 13;
              } else if (milestone.position < 50) {
                left = 87.5 - ((milestone.position - 25) / 25) * 50;
                top = 26 + ((milestone.position - 25) / 25) * 13;
              } else if (milestone.position < 75) {
                left = 37.5 - ((milestone.position - 50) / 25) * 25;
                top = 39 + ((milestone.position - 50) / 25) * 26;
              } else {
                left = 12.5 + ((milestone.position - 75) / 25) * 75;
                top = 65 + ((milestone.position - 75) / 25) * 26;
              }
              
              return (
                <div
                  key={milestone.treasure}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {/* Treasure spot */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 border-amber-700
                    ${unlocked ? 'bg-yellow-400' : 'bg-yellow-100'}
                    ${unlocked && treasureJustUnlocked === milestone.treasure ? 'animate-pulse' : ''}
                  `}>
                    <i 
                      className={`
                        lni ${milestone.icon} ${milestone.color} 
                        ${showAnimation && treasureJustUnlocked === milestone.treasure ? 'animate-bounce' : ''}
                      `} 
                      style={{ fontSize: '1.5rem' }}
                    ></i>
                  </div>
                  
                  {/* Label */}
                  <span className={`
                    text-xs font-bold mt-1 px-2 py-1 rounded-full
                    ${unlocked ? 'text-amber-900 bg-yellow-200' : 'text-amber-600 bg-yellow-50'}
                  `}>
                    {milestone.words}
                  </span>
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
              <div className="relative">
                {/* Red Boot character image with glow effect */}
                <img 
                  src={redBootImage} 
                  alt="Red Boot the Pirate" 
                  className="relative z-10 w-14 h-14 object-contain"
                  style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
                />
                {/* Glowing effect behind Red Boot */}
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50 animate-pulse pointer-events-none"></div>
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