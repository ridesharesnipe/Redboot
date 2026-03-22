import { useState, useRef } from 'react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  isVisible: boolean;
  playSound?: () => void;
}

const QWERTY_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

const PRESSED_SHADOW = '2px 2px 6px rgba(141,212,255,0.3), -1px -1px 4px rgba(184,228,255,0.2), inset 0 2px 6px rgba(0,0,0,0.18)';
const DEFAULT_SHADOW = '6px 6px 16px rgba(141,212,255,0.45), -4px -4px 12px rgba(184,228,255,0.35), inset 0 6px 12px rgba(255,255,255,0.45), inset 0 -6px 12px rgba(0,0,80,0.15)';

export default function VirtualKeyboard({ onKeyPress, isVisible, playSound }: VirtualKeyboardProps) {
  // Track which keys are visually pressed; use a ref map for pointerId→key so
  // multi-touch releases only clear the correct key (not every pressed key).
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const pointerMap = useRef<Map<number, string>>(new Map());

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

  return (
    <>
      <div
        data-testid="virtual-keyboard"
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
        }}
      >
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(26,107,196,0.25)',
          margin: '0 auto 10px',
        }} />

        {QWERTY_ROWS.map((row, ri) => (
          <div
            key={ri}
            style={{ display: 'flex', justifyContent: 'center', gap: 0 }}
          >
            {row.map(key => {
              const isPressed = pressedKeys.has(key);
              return (
                <button
                  key={key}
                  onPointerDown={(e) => handlePointerDown(e, key)}
                  onPointerUp={handlePointerRelease}
                  onPointerLeave={handlePointerRelease}
                  onPointerCancel={handlePointerRelease}
                  className="vk-clay-key"
                  style={{
                    transform: isPressed ? 'scale(0.9) translateY(2px)' : 'scale(1) translateY(0)',
                    boxShadow: isPressed ? PRESSED_SHADOW : DEFAULT_SHADOW,
                  }}
                  data-testid={`key-${key.toLowerCase()}`}
                >
                  {key}
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
          transition: transform 0.08s ease-out, box-shadow 0.08s ease-out;
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
      `}</style>
    </>
  );
}
