import { useState, useRef } from 'react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  isVisible: boolean;
  playSound?: () => void;
  onDismiss: () => void;
}

const QWERTY_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M','BACKSPACE'],
];

// Blue key shadows
const DEFAULT_SHADOW = '6px 6px 16px rgba(141,212,255,0.45), -4px -4px 12px rgba(184,228,255,0.35), inset 0 6px 12px rgba(255,255,255,0.45), inset 0 -6px 12px rgba(0,0,80,0.15)';
const PRESSED_SHADOW  = '2px 2px 6px rgba(141,212,255,0.3), -1px -1px 4px rgba(184,228,255,0.2), inset 0 2px 6px rgba(0,0,0,0.18)';

// Red key shadows (backspace)
const BS_DEFAULT_SHADOW = '6px 6px 16px rgba(255,107,107,0.45), -4px -4px 12px rgba(255,158,158,0.35), inset 0 6px 12px rgba(255,255,255,0.45), inset 0 -6px 12px rgba(80,0,0,0.15)';
const BS_PRESSED_SHADOW  = '2px 2px 6px rgba(255,107,107,0.3), -1px -1px 4px rgba(255,158,158,0.2), inset 0 2px 6px rgba(0,0,0,0.2)';

export default function VirtualKeyboard({ onKeyPress, isVisible, playSound, onDismiss }: VirtualKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const pointerMap = useRef<Map<number, string>>(new Map());

  // Swipe-to-dismiss tracking (on keyboard tray)
  const swipeStartY = useRef(0);
  const dismissed = useRef(false);
  const isSwiping = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, key: string) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerMap.current.set(e.pointerId, key);
    setPressedKeys(prev => { const next = new Set(prev); next.add(key); return next; });
    onKeyPress(key);
    playSound?.();
  };

  const handlePointerRelease = (e: React.PointerEvent<HTMLButtonElement>) => {
    const key = pointerMap.current.get(e.pointerId);
    if (key === undefined) return;
    pointerMap.current.delete(e.pointerId);
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  // Swipe detection on the keyboard tray (background and handle — not on key buttons)
  const handleTrayPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!!(e.target as HTMLElement).closest('button')) return;
    swipeStartY.current = e.clientY;
    dismissed.current = false;
    isSwiping.current = true;
  };

  const handleTrayPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSwiping.current) return;
    if (!dismissed.current && e.clientY - swipeStartY.current > 50) {
      dismissed.current = true;
      onDismiss();
    }
  };

  const handleTrayPointerUp = () => {
    swipeStartY.current = 0;
    isSwiping.current = false;
  };

  const handleTrayPointerCancel = () => {
    swipeStartY.current = 0;
    isSwiping.current = false;
  };

  return (
    <>
      <div
        data-testid="virtual-keyboard"
        onPointerDown={handleTrayPointerDown}
        onPointerMove={handleTrayPointerMove}
        onPointerUp={handleTrayPointerUp}
        onPointerCancel={handleTrayPointerCancel}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 150ms ease-out',
          zIndex: 50,
          background: 'linear-gradient(180deg, rgba(224,242,254,0.97) 0%, rgba(186,230,255,0.99) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1.5px solid rgba(126,200,227,0.5)',
          borderRadius: '22px 22px 0 0',
          padding: '12px 4px 24px',
          boxShadow: '0 -8px 32px rgba(26,107,196,0.18)',
          touchAction: 'none',
        }}
      >
        {/* Header row: drag handle (centre) + close button (right) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 10 }}>
          <div
            style={{
              width: 36, height: 4, borderRadius: 2,
              background: 'rgba(26,107,196,0.25)',
              cursor: 'grab',
            }}
          />
          <button
            onClick={onDismiss}
            aria-label="Close keyboard"
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #B8E4FF 0%, #8DD4FF 100%)',
              border: 'none',
              color: 'rgba(26,107,196,0.85)',
              fontWeight: 900,
              fontSize: 14,
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 6px rgba(141,212,255,0.45), inset 0 3px 6px rgba(255,255,255,0.5)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ✕
          </button>
        </div>

        {QWERTY_ROWS.map((row, ri) => (
          <div
            key={ri}
            style={{ display: 'flex', justifyContent: 'center', gap: 0 }}
          >
            {row.map(key => {
              const isBackspace = key === 'BACKSPACE';
              const isPressed = pressedKeys.has(key);
              const defaultShadow = isBackspace ? BS_DEFAULT_SHADOW : DEFAULT_SHADOW;
              const pressedShadow = isBackspace ? BS_PRESSED_SHADOW : PRESSED_SHADOW;

              return (
                <button
                  key={key}
                  onPointerDown={(e) => handlePointerDown(e, key)}
                  onPointerUp={handlePointerRelease}
                  onPointerLeave={handlePointerRelease}
                  onPointerCancel={handlePointerRelease}
                  className={isBackspace ? 'vk-backspace-key' : 'vk-clay-key'}
                  style={{
                    transform: isPressed ? 'scale(0.85) translateY(3px)' : 'scale(1) translateY(0)',
                    filter: isPressed ? 'brightness(0.85)' : 'brightness(1)',
                    boxShadow: isPressed ? pressedShadow : defaultShadow,
                    transition: isPressed
                      ? 'transform 50ms ease-in, filter 50ms ease-in, box-shadow 50ms ease-in'
                      : 'transform 0ms, filter 0ms, box-shadow 0ms',
                  }}
                  data-testid={isBackspace ? 'key-backspace' : `key-${key.toLowerCase()}`}
                >
                  {isBackspace ? '←' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <style>{`
        .vk-clay-key {
          flex: 1;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(145deg, #B8E4FF 0%, #8DD4FF 50%, #65C3FF 100%);
          border: none;
          color: white;
          font-weight: 800;
          font-size: 20px;
          font-family: 'Fredoka One', cursive;
          text-shadow: 0 1px 2px rgba(0, 0, 80, 0.2);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          user-select: none;
        }
        .vk-clay-key::before {
          content: "";
          position: absolute;
          top: 5%;
          left: 7%;
          width: 60%;
          height: 30%;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.65), transparent);
          border-radius: 100% 70% 50% 40%;
          transform: rotate(-8deg);
          pointer-events: none;
        }
        .vk-backspace-key {
          flex: 1.6;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(145deg, #FF9E9E 0%, #FF6B6B 50%, #E84545 100%);
          border: none;
          color: white;
          font-weight: 800;
          font-size: 20px;
          font-family: 'Fredoka One', cursive;
          text-shadow: 0 1px 2px rgba(80, 0, 0, 0.25);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          user-select: none;
        }
        .vk-backspace-key::before {
          content: "";
          position: absolute;
          top: 5%;
          left: 7%;
          width: 60%;
          height: 30%;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.55), transparent);
          border-radius: 100% 70% 50% 40%;
          transform: rotate(-8deg);
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
