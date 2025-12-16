import React from 'react';
import { Player, PlayerArtifacts } from '@/types/game';
import { ARTIFACTS } from '@/constants/game';

interface GameHUDProps {
  player: Player;
  killCount: number;
  timeRemaining: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  killCount,
  timeRemaining
}) => {
  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
  const expPercent = Math.min(100, (player.exp / player.expToNextLevel) * 100);

  const ownedArtifacts = ARTIFACTS.filter(a => player.artifacts[a.id as keyof PlayerArtifacts]);

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Timer */}
      <div className="absolute left-1/2 top-5 -translate-x-1/2 font-terminal text-4xl font-bold text-foreground text-glow-strong">
        {timeDisplay}
      </div>

      {/* Stats panel */}
      <div className="absolute left-4 top-4 text-glow">
        {/* Level */}
        <div className="mb-2 text-2xl font-bold font-korean md:text-3xl">
          LV.<span className="font-terminal">{player.level}</span>
        </div>

        {/* HP Bar */}
        <div className="relative mt-2 h-4 w-48 border border-destructive/80 bg-muted md:h-6 md:w-64">
          <div
            className="h-full bg-destructive/90 transition-all duration-200"
            style={{ width: `${hpPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-foreground font-korean md:text-xs">
            HP
          </div>
        </div>

        {/* EXP Bar */}
        <div className="relative mt-1 h-3 w-48 border border-primary/80 bg-muted md:h-4 md:w-64">
          <div
            className="h-full bg-primary/80 transition-all duration-200"
            style={{ width: `${expPercent}%` }}
          />
        </div>

        {/* Kill count */}
        <div className="mt-2 text-lg font-korean md:text-xl">
          점수: <span className="font-terminal">{killCount}</span>
        </div>

        {/* Artifacts */}
        <div className="mt-1 text-xs text-accent font-korean md:text-sm">
          보유: {ownedArtifacts.length > 0 ? ownedArtifacts.map(a => a.name).join(', ') : '없음'}
        </div>
      </div>
    </div>
  );
};
