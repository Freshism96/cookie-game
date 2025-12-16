import React, { forwardRef } from 'react';
import { Button } from '@/components/ui/button';

interface GameOverScreenProps {
  score: number;
  isVictory: boolean;
  onRetry: () => void;
  onGoToLobby: () => void;
}

export const GameOverScreen = forwardRef<HTMLDivElement, GameOverScreenProps>(({
  score,
  isVictory,
  onRetry,
  onGoToLobby
}, ref) => {
  return (
    <div ref={ref} className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-background/95 p-5">
      <h1
        className={`mb-4 text-5xl font-bold font-korean md:text-6xl ${isVictory ? 'text-primary text-glow-strong' : 'text-destructive danger-glow'
          }`}
      >
        {isVictory ? '시스템 방어 성공' : '시스템 방어 실패'}
      </h1>

      <p className="mb-8 text-2xl text-primary font-korean">
        최종 점수:{' '}
        <span className="font-terminal text-3xl text-foreground">{score}</span>
      </p>

      <div className="flex gap-4">
        <Button
          onClick={onRetry}
          variant="outline"
          size="lg"
          className="border-primary bg-secondary text-primary hover:bg-primary hover:text-primary-foreground font-korean"
        >
          다시 시도
        </Button>
        <Button
          onClick={onGoToLobby}
          variant="outline"
          size="lg"
          className="border-destructive bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground font-korean"
        >
          로비로 이동
        </Button>
      </div>
    </div>
  );
});

GameOverScreen.displayName = 'GameOverScreen';
