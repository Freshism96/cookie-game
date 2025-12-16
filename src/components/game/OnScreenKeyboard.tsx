import React, { useState, useCallback } from 'react';

import { GameMode } from '@/types/game';

interface OnScreenKeyboardProps {
  onInput: (char: string) => void;
  mode: GameMode;
}

// QWERTY layout for Korean keyboard
const QWERTY_HANGUL_LAYOUT = [
  // Row 1: Q W E R T Y U I O P
  [
    { key: 'ㅂ', label: 'ㅂ' },
    { key: 'ㅈ', label: 'ㅈ' },
    { key: 'ㄷ', label: 'ㄷ' },
    { key: 'ㄱ', label: 'ㄱ' },
    { key: 'ㅅ', label: 'ㅅ' },
    { key: 'ㅛ', label: 'ㅛ' },
    { key: 'ㅕ', label: 'ㅕ' },
    { key: 'ㅑ', label: 'ㅑ' },
    { key: 'ㅐ', label: 'ㅐ' },
    { key: 'ㅔ', label: 'ㅔ' },
  ],
  // Row 2: A S D F G H J K L
  [
    { key: 'ㅁ', label: 'ㅁ' },
    { key: 'ㄴ', label: 'ㄴ' },
    { key: 'ㅇ', label: 'ㅇ' },
    { key: 'ㄹ', label: 'ㄹ' },
    { key: 'ㅎ', label: 'ㅎ' },
    { key: 'ㅗ', label: 'ㅗ' },
    { key: 'ㅓ', label: 'ㅓ' },
    { key: 'ㅏ', label: 'ㅏ' },
    { key: 'ㅣ', label: 'ㅣ' },
  ],
  // Row 3: Z X C V B N M
  [
    { key: 'ㅋ', label: 'ㅋ' },
    { key: 'ㅌ', label: 'ㅌ' },
    { key: 'ㅊ', label: 'ㅊ' },
    { key: 'ㅍ', label: 'ㅍ' },
    { key: 'ㅠ', label: 'ㅠ' },
    { key: 'ㅜ', label: 'ㅜ' },
    { key: 'ㅡ', label: 'ㅡ' },
  ],
];

// Number pad for math mode
const NUMBER_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

export const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({ onInput, mode }) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const handleKeyPress = useCallback((char: string) => {
    setPressedKey(char);
    onInput(char);

    // Visual feedback - remove pressed state after animation
    setTimeout(() => setPressedKey(null), 150);
  }, [onInput]);

  const KeyButton: React.FC<{ char: string; label?: string; size?: 'normal' | 'large' }> = ({
    char,
    label,
    size = 'normal'
  }) => {
    const isPressed = pressedKey === char;
    const sizeClasses = size === 'large'
      ? 'w-16 h-16 text-2xl md:w-24 md:h-24 md:text-4xl'
      : 'w-8 h-12 text-lg md:w-16 md:h-20 md:text-3xl';

    return (
      <button
        onClick={() => handleKeyPress(char)}
        className={`
          ${sizeClasses}
          flex items-center justify-center
          rounded-lg border-2 font-bold
          transition-all duration-100 active:scale-95
          ${isPressed
            ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-lg shadow-primary/50'
            : 'bg-background/80 text-primary border-primary/50 hover:bg-primary/20'
          }
        `}
      >
        {label || char}
      </button>
    );
  };

  if (mode === 'math' || mode === 'arithmetic') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
        <p className="mb-2 text-sm text-muted-foreground font-korean">숫자를 눌러 정답을 입력하세요</p>

        {/* Number grid 3x4 layout */}
        <div className="grid grid-cols-3 gap-3">
          {NUMBER_KEYS.slice(0, 9).map((num) => (
            <KeyButton key={num} char={num} size="large" />
          ))}
        </div>
        <div className="mt-2">
          <KeyButton char="0" size="large" />
        </div>
      </div>
    );
  }

  // Hangul mode - QWERTY layout
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
      <p className="text-sm text-muted-foreground font-korean">자음/모음을 눌러 적을 공격하세요</p>

      {/* QWERTY Layout */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Row 1 */}
        <div className="flex gap-1">
          {QWERTY_HANGUL_LAYOUT[0].map(({ key, label }) => (
            <KeyButton key={key} char={key} label={label} />
          ))}
        </div>

        {/* Row 2 - slightly offset */}
        <div className="flex gap-1 pl-3">
          {QWERTY_HANGUL_LAYOUT[1].map(({ key, label }) => (
            <KeyButton key={key} char={key} label={label} />
          ))}
        </div>

        {/* Row 3 - more offset */}
        <div className="flex gap-1 pl-8">
          {QWERTY_HANGUL_LAYOUT[2].map(({ key, label }) => (
            <KeyButton key={key} char={key} label={label} />
          ))}
        </div>
      </div>
    </div>
  );
};
