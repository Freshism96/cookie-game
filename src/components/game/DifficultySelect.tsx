import React from 'react';
import { DifficultyLevel, GameMode } from '@/types/game';
import { Button } from '@/components/ui/button';

interface DifficultySelectProps {
  gameMode: GameMode;
  onSelectDifficulty: (level: DifficultyLevel) => void;
  onBack: () => void;
}

const DIFFICULTY_INFO: Record<DifficultyLevel, { name: string; desc: string; color: string }> = {
  1: { name: '1단계 - 쉬움', desc: '느린 적, 적은 수', color: 'text-green-400' },
  2: { name: '2단계 - 보통', desc: '기본 속도, 보통 수', color: 'text-blue-400' },
  3: { name: '3단계 - 어려움', desc: '빠른 적, 많은 수', color: 'text-yellow-400' },
  4: { name: '4단계 - 매우 어려움', desc: '매우 빠름, 다양한 적', color: 'text-orange-400' },
  5: { name: '5단계 - 지옥', desc: '최고 난이도', color: 'text-red-400' },
};

export const DifficultySelect: React.FC<DifficultySelectProps> = ({
  gameMode,
  onSelectDifficulty,
  onBack
}) => {
  const modeName = gameMode === 'hangul' ? '한글 타자' : '구구단';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-5">
      <h2 className="mb-2 text-3xl font-bold text-accent font-korean">난이도 선택</h2>
      <p className="mb-6 text-xl text-primary font-korean">{modeName} 방어</p>

      <div className="flex w-full max-w-md flex-col gap-3 mb-6">
        {([1, 2, 3, 4, 5] as DifficultyLevel[]).map((level) => {
          const info = DIFFICULTY_INFO[level];
          return (
            <Button
              key={level}
              onClick={() => onSelectDifficulty(level)}
              variant="outline"
              size="lg"
              className={`w-full border-2 border-primary bg-background font-bold transition-all hover:bg-primary hover:text-primary-foreground hover:box-glow flex flex-col items-start py-4 h-auto`}
            >
              <span className={`text-lg ${info.color} font-korean`}>{info.name}</span>
              <span className="text-sm text-muted-foreground font-korean">{info.desc}</span>
            </Button>
          );
        })}
      </div>

      <Button
        onClick={onBack}
        variant="ghost"
        className="text-muted-foreground hover:text-foreground font-korean"
      >
        ← 뒤로 가기
      </Button>
    </div>
  );
};