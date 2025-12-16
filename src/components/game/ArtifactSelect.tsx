import React, { useEffect, useRef } from 'react';
import { Artifact } from '@/types/game';

interface ArtifactSelectProps {
  artifacts: Artifact[];
  onSelect: (artifactId: string) => void;
}

export const ArtifactSelect: React.FC<ArtifactSelectProps> = ({
  artifacts,
  onSelect
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle number key selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= artifacts.length) {
        onSelect(artifacts[num - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [artifacts, onSelect]);

  // Keep mobile keyboard open
  useEffect(() => {
    // Focus input to keep keyboard open on mobile
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
      if (num >= 1 && num <= artifacts.length) {
        onSelect(artifacts[num - 1].id);
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
      
      <h2 className="mb-6 text-3xl font-bold text-accent font-korean md:text-4xl">
        보급품 도착!
      </h2>
      <p className="mb-4 text-lg text-primary/80 font-korean md:text-xl">
        시스템을 강화할 유물을 선택하세요.
      </p>
      <p className="mb-8 text-sm text-muted-foreground font-korean">
        (숫자 1~{artifacts.length}을 눌러 선택할 수 있습니다)
      </p>

      <div className="flex flex-wrap justify-center gap-4 max-h-[60vh] overflow-y-auto">
        {artifacts.map((artifact, index) => (
          <div
            key={artifact.id}
            onClick={() => onSelect(artifact.id)}
            className="relative flex h-[250px] w-full max-w-[200px] cursor-pointer flex-col items-center justify-between rounded-lg border-2 border-primary bg-card p-5 text-center transition-all hover:scale-105 hover:bg-secondary hover:box-glow"
          >
            <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
              {index + 1}
            </div>
            <div className="text-4xl">{artifact.icon}</div>
            <div className="text-xl font-bold font-korean">{artifact.name}</div>
            <div className="text-sm text-muted-foreground font-korean">{artifact.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
