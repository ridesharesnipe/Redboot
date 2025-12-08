import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAudio } from '@/contexts/AudioContext';
import redBootImage from '@assets/17586438224363330781733458024019_1758643831046.png';
import diegoImage from '@assets/17586535267086549247092506575635_1758653585024.png';

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

interface FallingTreasure {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  velocity: number;
  delay: number;
}

export default function TreasureVault() {
  const [, setLocation] = useLocation();
  const { playSound } = useAudio();
  const [selectedCharacter, setSelectedCharacter] = useState<'redboot' | 'diego'>('redboot');
  const [chestOpen, setChestOpen] = useState(false);
  const [fallingTreasures, setFallingTreasures] = useState<FallingTreasure[]>([]);
  const [showTreasurePiles, setShowTreasurePiles] = useState(false);
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const bubblesRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const treasureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const treasurePileTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const treasureIdCounter = useRef(0);

  const { data: treasures, isLoading } = useQuery<UserTreasures>({
    queryKey: ['/api/treasures'],
  });

  // Treasure visual properties
  const treasureVisuals = {
    diamonds: { emoji: '💎', color: '#b9f2ff', size: 15 },
    coins: { emoji: '🪙', color: '#ffd700', size: 12 },
    crowns: { emoji: '👑', color: '#ffd700', size: 20 },
    bags: { emoji: '💰', color: '#8b7355', size: 18 },
    stars: { emoji: '⭐', color: '#ffeb3b', size: 16 },
    trophies: { emoji: '🏆', color: '#ff9800', size: 18 },
  };

  const getTotalTreasures = (treasureCount: TreasureCount): number => {
    return Object.values(treasureCount).reduce((sum, count) => sum + count, 0);
  };

  // Continuous treasure shower - spawns treasures continuously
  const startContinuousTreasureShower = () => {
    const allTreasureEmojis = ['💎', '🪙', '👑', '💰', '⭐', '🏆'];
    
    // Clear any existing interval and timeout
    if (treasureIntervalRef.current) {
      clearInterval(treasureIntervalRef.current);
    }
    if (treasurePileTimeoutRef.current) {
      clearTimeout(treasurePileTimeoutRef.current);
    }
    
    setShowTreasurePiles(false);
    
    // Spawn new treasures every 150ms for continuous effect
    treasureIntervalRef.current = setInterval(() => {
      setFallingTreasures(prev => {
        // Create 2-3 new treasures each cycle
        const newTreasures: FallingTreasure[] = [];
        const count = 2 + Math.floor(Math.random() * 2); // 2-3 treasures
        
        for (let i = 0; i < count; i++) {
          treasureIdCounter.current += 1;
          newTreasures.push({
            id: treasureIdCounter.current,
            emoji: allTreasureEmojis[Math.floor(Math.random() * allTreasureEmojis.length)],
            x: Math.random() * 100,
            y: -20,
            rotation: Math.random() * 360,
            velocity: 2 + Math.random() * 3,
            delay: 0, // No delay needed since we're spawning continuously
          });
        }
        
        // Add new treasures and keep only the last 50 to prevent memory issues
        // Treasures older than 50 have already fallen off screen
        const updated = [...prev, ...newTreasures].slice(-50);
        return updated;
      });
    }, 150); // Spawn every 150ms
    
    // Show treasure piles after 2 seconds but keep rain going
    treasurePileTimeoutRef.current = setTimeout(() => {
      setShowTreasurePiles(true);
    }, 2000);
  };

  // Stop the continuous treasure shower
  const stopTreasureShower = () => {
    if (treasureIntervalRef.current) {
      clearInterval(treasureIntervalRef.current);
      treasureIntervalRef.current = null;
    }
    if (treasurePileTimeoutRef.current) {
      clearTimeout(treasurePileTimeoutRef.current);
      treasurePileTimeoutRef.current = null;
    }
    // Fade out existing treasures
    setTimeout(() => {
      setFallingTreasures([]);
    }, 500);
  };

  // Create underwater bubbles
  const createBubbles = () => {
    if (!bubblesRef.current) return;
    bubblesRef.current.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.width = bubble.style.height = (Math.random() * 20 + 10) + 'px';
      bubble.style.animationDelay = Math.random() * 10 + 's';
      bubble.style.animationDuration = (10 + Math.random() * 10) + 's';
      bubblesRef.current.appendChild(bubble);
    }
  };

  // Draw treasure pile on canvas
  const drawTreasurePile = (type: keyof TreasureCount) => {
    const canvas = canvasRefs.current[type];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const count = treasures?.[selectedCharacter]?.[type] || 0;
    const visual = treasureVisuals[type];
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (count === 0) return;
    
    // Calculate grid layout
    const maxPerRow = Math.min(15, Math.ceil(Math.sqrt(count * 2)));
    const itemSize = visual.size;
    const spacing = itemSize * 0.3;
    
    // Draw each item
    let drawn = 0;
    for (let row = 0; drawn < count; row++) {
      const rowCount = Math.min(maxPerRow - Math.floor(row / 2), count - drawn);
      const startX = (canvas.width - (rowCount * (itemSize + spacing))) / 2;
      const y = canvas.height - (row + 1) * (itemSize + spacing);
      
      for (let col = 0; col < rowCount && drawn < count; col++) {
        const x = startX + col * (itemSize + spacing);
        
        // Add slight randomization for natural pile look
        const offsetX = (Math.random() - 0.5) * 4;
        const offsetY = (Math.random() - 0.5) * 4;
        
        // Draw emoji
        ctx.font = `${itemSize}px Arial`;
        ctx.fillText(visual.emoji, x + offsetX, y + offsetY);
        
        drawn++;
      }
    }
  };

  // Initialize bubbles on mount
  useEffect(() => {
    createBubbles();
  }, []);

  // Cleanup interval and timeout on unmount
  useEffect(() => {
    return () => {
      if (treasureIntervalRef.current) {
        clearInterval(treasureIntervalRef.current);
      }
      if (treasurePileTimeoutRef.current) {
        clearTimeout(treasurePileTimeoutRef.current);
      }
    };
  }, []);

  // Initialize canvases and draw treasures when chest opens
  useEffect(() => {
    if (chestOpen && treasures) {
      // Initialize canvas dimensions first
      Object.keys(canvasRefs.current).forEach(key => {
        const canvas = canvasRefs.current[key];
        if (canvas) {
          canvas.width = canvas.offsetWidth;
          canvas.height = 120;
        }
      });

      // Then draw the treasure piles
      Object.keys(treasureVisuals).forEach(type => {
        drawTreasurePile(type as keyof TreasureCount);
      });
    }
  }, [chestOpen, treasures, selectedCharacter]);

  // Open chest animation
  const openChest = () => {
    if (!chestOpen) {
      playSound('treasure_chest_open');
      setChestOpen(true);
      startContinuousTreasureShower(); // Start continuous treasure shower animation
      
      // Play character-specific sound
      if (selectedCharacter === 'diego') {
        const audio = new Audio('/attached_assets/chihuahua-barks-75088_1759205101905.mp3');
        audio.volume = 0.4;
        audio.play().catch(console.error);
      } else {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance("Arrr, me treasure!");
          utterance.rate = 0.75;
          utterance.pitch = 0.9;
          utterance.lang = 'en-GB';
          speechSynthesis.speak(utterance);
        }, 500);
      }
    } else {
      setChestOpen(false);
      stopTreasureShower(); // Stop the continuous rain
      setShowTreasurePiles(false);
    }
  };

  const switchVault = (character: 'redboot' | 'diego') => {
    setSelectedCharacter(character);
    // Keep chest state when switching - don't auto-close
  };

  if (isLoading || !treasures) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #87CEEB 0%, #1e3c72 30%, #0b1929 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#fff', fontSize: '24px' }}>Loading treasure vault...</div>
      </div>
    );
  }

  const currentTreasures = treasures[selectedCharacter];
  const totalCount = getTotalTreasures(currentTreasures);

  // Determine chest level based on total treasures
  const getChestLevel = (total: number): { name: string; color: string; glow: string } => {
    if (total >= 500) return { name: 'Legendary', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' };
    if (total >= 200) return { name: 'Gold', color: '#eab308', glow: 'rgba(234, 179, 8, 0.6)' };
    if (total >= 50) return { name: 'Silver', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.6)' };
    return { name: 'Wooden', color: '#8b4513', glow: 'rgba(180, 83, 9, 0.6)' };
  };

  const chestLevel = getChestLevel(totalCount);

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=Fredoka:wght@400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Fredoka', sans-serif;
        }

        /* Ocean waves animation */
        .ocean {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 40%;
          background: linear-gradient(to bottom, rgba(0,119,190,0.8) 0%, rgba(0,50,100,1) 100%);
          overflow: hidden;
          z-index: 1;
        }

        .wave {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: radial-gradient(ellipse at center, transparent, rgba(255,255,255,0.1));
          animation: wave 8s infinite ease-in-out;
        }

        .wave:nth-child(2) {
          animation-delay: -2s;
          opacity: 0.5;
          animation-duration: 10s;
        }

        .wave:nth-child(3) {
          animation-delay: -4s;
          opacity: 0.3;
          animation-duration: 12s;
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
        }

        /* Underwater bubbles */
        .bubbles {
          position: fixed;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .bubble {
          position: absolute;
          bottom: -100px;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, rgba(255,255,255,0.5), rgba(255,255,255,0.1));
          border-radius: 50%;
          animation: rise 10s infinite ease-in;
        }

        @keyframes rise {
          to {
            transform: translateY(-120vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* Fish swimming */
        .fish {
          position: fixed;
          width: 60px;
          height: 30px;
          opacity: 0.6;
          z-index: 0;
          animation: swim 20s infinite ease-in-out;
        }

        .fish::before {
          content: '🐠';
          font-size: 40px;
          position: absolute;
        }

        @keyframes swim {
          0%, 100% {
            transform: translateX(-100px) scaleX(1);
          }
          50% {
            transform: translateX(calc(100vw + 100px)) scaleX(-1);
          }
        }

        /* Treasure shower animations */
        @keyframes fall {
          0% {
            top: -10%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }

        @keyframes twinkle {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0.8;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Navigation */
        .vault-nav {
          display: flex;
          gap: 15px;
          padding: 20px;
          justify-content: center;
          z-index: 10;
          position: relative;
        }

        .vault-tab {
          padding: 15px 30px;
          border-radius: 15px;
          font-weight: 600;
          font-size: 18px;
          color: #fff;
          border: 3px solid #d4af37;
          cursor: pointer;
          transition: all 0.3s;
          background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .vault-tab.active {
          background: linear-gradient(135deg, #d4af37 0%, #ffd700 100%);
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(212,175,55,0.5);
        }

        .vault-tab:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }

        /* Main container */
        .container {
          flex: 1;
          padding: 20px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 5;
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .vault-title {
          font-family: 'Pirata One', cursive;
          font-size: 48px;
          color: #ffd700;
          text-shadow: 3px 3px 6px rgba(0,0,0,0.7),
                       0 0 30px rgba(255,215,0,0.5);
          margin-bottom: 10px;
          animation: titleGlow 2s ease-in-out infinite;
        }

        @keyframes titleGlow {
          0%, 100% {
            text-shadow: 3px 3px 6px rgba(0,0,0,0.7),
                        0 0 30px rgba(255,215,0,0.5);
          }
          50% {
            text-shadow: 3px 3px 6px rgba(0,0,0,0.7),
                        0 0 50px rgba(255,215,0,0.8);
          }
        }

        /* Total count */
        .total-display {
          text-align: center;
          margin: 20px 0;
        }

        .total-label {
          color: #fff;
          font-size: 20px;
          text-transform: uppercase;
          letter-spacing: 3px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .total-count {
          font-size: 64px;
          font-weight: 700;
          color: #ffd700;
          text-shadow: 0 0 20px rgba(255,215,0,0.6),
                       3px 3px 6px rgba(0,0,0,0.4);
        }

        /* Pirate Chest 3D */
        .chest-container {
          perspective: 1000px;
          margin: 40px auto;
          width: 280px;
          height: 200px;
          cursor: pointer;
          position: relative;
        }

        .chest-3d {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s;
          transform: rotateY(-15deg);
        }

        .chest-3d:hover {
          transform: rotateY(0deg) scale(1.05);
        }

        .chest-body {
          position: absolute;
          width: 280px;
          height: 160px;
          bottom: 0;
          background: linear-gradient(to bottom, 
            #8b4513 0%, #654321 10%, 
            #8b4513 20%, #654321 30%,
            #8b4513 40%, #654321 50%,
            #8b4513 60%, #654321 70%,
            #8b4513 80%, #654321 90%,
            #8b4513 100%);
          border-radius: 0 0 10px 10px;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.5),
                      0 10px 30px rgba(0,0,0,0.5);
        }

        .chest-body::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 20px,
            rgba(0,0,0,0.3) 20px,
            rgba(0,0,0,0.3) 22px
          );
          border-radius: 0 0 10px 10px;
        }

        /* Metal bands */
        .metal-band {
          position: absolute;
          width: 100%;
          height: 15px;
          background: linear-gradient(to bottom, #707070 0%, #404040 50%, #707070 100%);
          box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        }

        .metal-band.top {
          top: 20px;
        }

        .metal-band.bottom {
          bottom: 20px;
        }

        /* Chest lid */
        .chest-lid {
          position: absolute;
          width: 280px;
          height: 80px;
          top: -40px;
          background: linear-gradient(135deg, 
            #a0522d 0%, #8b4513 25%, 
            #654321 50%, #8b4513 75%, 
            #a0522d 100%);
          border-radius: 140px 140px 0 0;
          transform-origin: bottom;
          transition: transform 0.5s;
          box-shadow: inset 0 -5px 20px rgba(0,0,0,0.4),
                      0 -5px 15px rgba(0,0,0,0.3);
        }

        .chest-3d.open .chest-lid {
          transform: rotateX(-110deg);
        }

        /* Lock */
        .chest-lock {
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, #ffd700 0%, #b8860b 100%);
          border-radius: 50%;
          box-shadow: 0 5px 15px rgba(0,0,0,0.5),
                      inset 0 -3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          z-index: 10;
        }

        .chest-lock::after {
          content: '🔓';
          filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.5));
        }

        /* Treasure display area */
        .treasure-area {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 50px;
          padding: 20px;
          background: rgba(0,0,0,0.3);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        /* Individual treasure pile */
        .treasure-pile {
          background: rgba(255,255,255,0.1);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          position: relative;
          min-height: 200px;
          border: 2px solid rgba(212,175,55,0.5);
          transition: all 0.3s;
          overflow: visible;
        }

        .treasure-pile::before {
          content: '✨';
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 20px;
          animation: sparkle-pulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        .treasure-pile::after {
          content: '✨';
          position: absolute;
          bottom: -8px;
          left: -8px;
          font-size: 16px;
          animation: sparkle-pulse 2s ease-in-out infinite 1s;
          pointer-events: none;
        }

        @keyframes sparkle-pulse {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(0.8) rotate(0deg);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
        }

        .treasure-pile:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 30px rgba(255, 215, 0, 0.3);
          background: rgba(255,255,255,0.2);
        }

        .treasure-pile-label {
          font-size: 18px;
          font-weight: 600;
          color: #ffd700;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          position: relative;
        }

        /* Canvas for treasure visualization */
        .treasure-canvas {
          width: 100%;
          height: 120px;
          margin: 10px 0;
        }

        .treasure-count-display {
          font-size: 36px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 0 10px rgba(255,215,0,0.5);
        }

        /* Back button */
        .back-btn {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1000;
          padding: 12px 24px;
          background: rgba(255,255,255,0.9);
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          transition: all 0.3s;
        }

        .back-btn:hover {
          background: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .vault-title {
            font-size: 36px;
          }
          
          .treasure-area {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{
        fontFamily: "'Fredoka', sans-serif",
        background: 'linear-gradient(to bottom, #87CEEB 0%, #1e3c72 30%, #0b1929 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        position: 'relative'
      }}>
        {/* Ocean waves */}
        <div className="ocean">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>

        {/* Underwater bubbles */}
        <div className="bubbles" ref={bubblesRef}></div>

        {/* Swimming fish */}
        <div className="fish" style={{ top: '60%', animationDelay: '0s' }}></div>
        <div className="fish" style={{ top: '70%', animationDelay: '5s' }}></div>
        <div className="fish" style={{ top: '50%', animationDelay: '10s' }}></div>

        {/* Back button */}
        <button 
          className="back-btn" 
          onClick={() => setLocation('/dashboard')}
          data-testid="button-back-to-dashboard"
        >
          ← Back to Adventures
        </button>

        {/* Navigation */}
        <div className="vault-nav">
          <button 
            className={`vault-tab ${selectedCharacter === 'redboot' ? 'active' : ''}`}
            onClick={() => switchVault('redboot')}
            data-testid="button-select-redboot"
          >
            <img 
              src={redBootImage} 
              alt="Red Boot" 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '8px',
                border: '2px solid rgba(255,255,255,0.5)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            />
            Red Boot's Hidden Treasure
          </button>
          <button 
            className={`vault-tab ${selectedCharacter === 'diego' ? 'active' : ''}`}
            onClick={() => switchVault('diego')}
            data-testid="button-select-diego"
          >
            <img 
              src={diegoImage} 
              alt="Diego the Pup Pup" 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '8px',
                border: '2px solid rgba(255,255,255,0.5)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            />
            Diego's Hidden Treasure
          </button>
        </div>

        {/* Main container */}
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1 className="vault-title">⚓ {selectedCharacter === 'redboot' ? "Red Boot's" : "Diego's"} Treasure Vault ⚓</h1>
          </div>

          {/* Total display */}
          <div className="total-display">
            <div className="total-label">Total Plunder</div>
            <div className="total-count">{totalCount}</div>
          </div>

          {/* Chest Level Badge */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '10px 20px',
              borderRadius: '20px',
              backgroundColor: chestLevel.color,
              color: '#fff',
              fontWeight: 700,
              fontSize: '18px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              boxShadow: `0 4px 20px ${chestLevel.glow}`,
            }}>
              ✨ {chestLevel.name} Chest ✨
            </div>
          </div>

          {/* Pirate Chest */}
          <div className="chest-container" onClick={openChest} data-testid="button-treasure-chest">
            <div className={`chest-3d ${chestOpen ? 'open' : ''}`}>
              <div className="chest-lid" style={{
                filter: `drop-shadow(0 0 15px ${chestLevel.glow})`
              }}>
                <div className="metal-band" style={{ top: '20px' }}></div>
              </div>
              <div className="chest-body" style={{
                boxShadow: `inset 0 0 30px rgba(0,0,0,0.5), 0 10px 30px ${chestLevel.glow}`
              }}>
                <div className="metal-band top"></div>
                <div className="metal-band bottom"></div>
                <div className="chest-lock" style={{
                  boxShadow: `0 5px 15px ${chestLevel.glow}, inset 0 -3px 10px rgba(0,0,0,0.3)`
                }}></div>
              </div>
            </div>
          </div>

          {/* Falling treasure shower animation */}
          {fallingTreasures.length > 0 && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              {fallingTreasures.map((treasure, index) => (
                <div
                  key={treasure.id}
                  className="falling-treasure"
                  style={{
                    position: 'absolute',
                    left: `${treasure.x}%`,
                    top: `${treasure.y}%`,
                    fontSize: '40px',
                    animation: `fall 2s ease-in forwards, twinkle 0.5s infinite alternate, spin 1.5s linear infinite`,
                    animationDelay: `${treasure.delay}ms`,
                    filter: 'drop-shadow(0 0 10px gold) drop-shadow(0 0 20px yellow)',
                    textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ffd700, 0 0 40px #ffd700',
                  }}
                >
                  {treasure.emoji}
                </div>
              ))}
            </div>
          )}

          {/* Treasure display area */}
          {showTreasurePiles && (
            <div className="treasure-area">
              {/* Diamonds pile */}
              <div className="treasure-pile" data-testid="treasure-diamonds">
                <div className="treasure-pile-label">💎 Diamonds</div>
                <canvas 
                  className="treasure-canvas" 
                  ref={(el) => { canvasRefs.current.diamonds = el; }}
                />
                <div className="treasure-count-display">{currentTreasures.diamonds}</div>
              </div>

              {/* Gold Coins pile */}
              <div className="treasure-pile" data-testid="treasure-gold-coins">
                <div className="treasure-pile-label">🪙 Gold Coins</div>
                <canvas 
                  className="treasure-canvas" 
                  ref={(el) => { canvasRefs.current.coins = el; }}
                />
                <div className="treasure-count-display">{currentTreasures.coins}</div>
              </div>

              {/* Crowns pile */}
              <div className="treasure-pile" data-testid="treasure-crowns">
                <div className="treasure-pile-label">👑 Royal Crowns</div>
                <canvas 
                  className="treasure-canvas" 
                  ref={(el) => { canvasRefs.current.crowns = el; }}
                />
                <div className="treasure-count-display">{currentTreasures.crowns}</div>
              </div>

              {/* Money Bags pile */}
              <div className="treasure-pile" data-testid="treasure-money-bags">
                <div className="treasure-pile-label">💰 Money Bags</div>
                <canvas 
                  className="treasure-canvas" 
                  ref={(el) => { canvasRefs.current.bags = el; }}
                />
                <div className="treasure-count-display">{currentTreasures.bags}</div>
              </div>

              {/* Stars pile */}
              <div className="treasure-pile" data-testid="treasure-stars">
                <div className="treasure-pile-label">⭐ Stars</div>
                <canvas 
                  className="treasure-canvas" 
                  ref={(el) => { canvasRefs.current.stars = el; }}
                />
                <div className="treasure-count-display">{currentTreasures.stars}</div>
              </div>

              {/* Trophies pile */}
              <div className="treasure-pile" data-testid="treasure-trophies">
                <div className="treasure-pile-label">🏆 Trophies</div>
                <canvas 
                  className="treasure-canvas" 
                  ref={(el) => { canvasRefs.current.trophies = el; }}
                />
                <div className="treasure-count-display">{currentTreasures.trophies}</div>
              </div>
            </div>
          )}

          {/* Progress to Next Level */}
          {totalCount < 500 && (
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)',
              textAlign: 'center'
            }}>
              <div style={{
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>
                {totalCount < 50 && `Collect ${50 - totalCount} more treasures to unlock the Silver Chest!`}
                {totalCount >= 50 && totalCount < 200 && `Collect ${200 - totalCount} more treasures to unlock the Gold Chest!`}
                {totalCount >= 200 && totalCount < 500 && `Collect ${500 - totalCount} more treasures to unlock the Legendary Chest!`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
