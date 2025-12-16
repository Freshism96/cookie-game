import React, { useEffect, useRef } from 'react';
import { LevelUpgrade, Rarity } from '@/types/game';

interface UpgradeMenuProps {
  upgrades: LevelUpgrade[];
  onSelect: (index: number) => void;
}

const RARITY_COLORS: Record<Rarity, string> = {
  Common: 'border-slate-400 bg-slate-950/80 text-slate-100',
  Rare: 'border-blue-400 bg-blue-950/80 text-blue-100 box-glow-blue',
  Epic: 'border-purple-400 bg-purple-950/80 text-purple-100 box-glow-purple',
  Legendary: 'border-amber-400 bg-amber-950/80 text-amber-100 box-glow-gold'
};

const RARITY_NAMES: Record<Rarity, string> = {
  Common: '일반',
  Rare: '희귀',
  Epic: '영웅',
  Legendary: '전설'
};

export const UpgradeMenu: React.FC<UpgradeMenuProps> = ({ upgrades, onSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle number key selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= upgrades.length) {
        onSelect(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelect, upgrades.length]);

  // Keep mobile keyboard open
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    focusInput();
    const interval = setInterval(focusInput, 500);
    return () => clearInterval(interval);
  }, []);

  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 0) {
      const num = parseInt(value.slice(-1));
      if (num >= 1 && num <= upgrades.length) {
        onSelect(num - 1);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-background/85 backdrop-blur-sm p-5">
      {/* Hidden input for mobile keyboard */}
      <input
        ref={inputRef}
        type="text"
        onChange={handleMobileInput}
        className="absolute -top-[9999px] left-0 opacity-0"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        inputMode="numeric"
      />

      <h2 className="mb-2 text-3xl font-bold text-accent font-korean md:text-4xl text-glow">
        ✨ 레벨 업! ✨
      </h2>
      <p className="mb-6 text-lg text-primary/80 font-korean">
        보상을 선택하세요
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {upgrades.map((upgrade, index) => (
          <div
            key={index}
            onClick={() => onSelect(index)}
            className={`relative flex h-[220px] w-full max-w-[180px] cursor-pointer flex-col items-center justify-between rounded-xl border-2 p-5 text-center transition-all hover:scale-105 ${RARITY_COLORS[upgrade.rarity]}`}
          >
            <div className={`absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full border border-current bg-background text-lg font-bold shadow-lg`}>
              {index + 1}
            </div>

            <div className="mt-2 text-xs font-bold uppercase tracking-wider opacity-80">
              {RARITY_NAMES[upgrade.rarity]}
            </div>

            <div className="my-auto">
              <div className="mb-2 text-xl font-bold font-korean break-keep leading-tight">{upgrade.name}</div>
              <div className="text-sm opacity-90 font-korean break-keep">{upgrade.desc}</div>
            </div>

            <div className="mt-2 text-[10px] opacity-60">클릭 또는 숫자 {index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
