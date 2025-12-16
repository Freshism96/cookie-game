import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useIsMobile } from '@/hooks/use-mobile';
import { GameCanvas } from './GameCanvas';
import { LoginScreen } from './LoginScreen';
import { ShopScreen } from './ShopScreen';
import { GameHUD } from './GameHUD';
import { UpgradeMenu } from './UpgradeMenu';
import { ArtifactSelect } from './ArtifactSelect';
import { GameOverScreen } from './GameOverScreen';
import { MobileKeyboardButton } from './MobileKeyboardButton';
import { OnScreenKeyboard } from './OnScreenKeyboard';
import { DamageOverlay } from './DamageOverlay';
import { DifficultySelect } from './DifficultySelect';

export const SystemDefenderGame: React.FC = () => {
  const isMobile = useIsMobile();
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  // Detect portrait/landscape mode
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  const {
    gameState,
    setGameState,
    gameMode,
    difficulty,
    userData,
    setUserData,
    player,
    enemies,
    bullets,
    particles,
    floatingTexts,
    beams,
    killCount,
    timeRemaining,
    showUpgradeMenu,
    artifactOptions,
    startGame,
    selectModeAndGoToDifficulty,
    selectDifficulty,
    updateGame,
    handleKeyInput,
    processTypingAttack,
    selectArtifact,
    selectUpgrade,
    buyItem,
    resetPurchases,
    updateScreenSize,
    currentUpgrades
  } = useGameEngine();

  const sound = useSoundEffects();
  const prevEnemyCount = useRef(enemies.length);
  const prevPlayerHp = useRef(player.hp);
  const prevLevel = useRef(player.level);
  const prevBossCount = useRef(0);

  // Sound effects based on game state changes
  useEffect(() => {
    const bossCount = enemies.filter(e => e.isBoss && !e.dead).length;

    // Boss spawn sound
    if (bossCount > prevBossCount.current) {
      sound.playBossSpawn();
    }

    // Enemy killed sound
    const killedEnemies = prevEnemyCount.current - enemies.filter(e => !e.dead).length;
    if (killedEnemies > 0 && gameState === 'playing') {
      const bossKilled = enemies.some(e => e.isBoss && e.dead && e.hp <= 0);
      if (bossKilled) {
        sound.playBossKill();
      } else {
        sound.playKill();
      }
    }

    prevEnemyCount.current = enemies.filter(e => !e.dead).length;
    prevBossCount.current = bossCount;
  }, [enemies, gameState, sound]);

  // Damage sound
  useEffect(() => {
    if (player.hp < prevPlayerHp.current && player.invincibleTimer === 60) {
      sound.playDamage();
    }
    prevPlayerHp.current = player.hp;
  }, [player.hp, player.invincibleTimer, sound]);

  // Level up sound
  useEffect(() => {
    if (player.level > prevLevel.current) {
      sound.playLevelUp();
    }
    prevLevel.current = player.level;
  }, [player.level, sound]);

  // Artifact select sound
  useEffect(() => {
    if (gameState === 'artifact_select') {
      sound.playArtifact();
    }
  }, [gameState, sound]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      handleKeyInput(e.code, e.key);
      sound.playTyping();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleKeyInput, sound]);

  // Handle window resize (including virtual keyboard) - for mobile DS style, use fixed height
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // On mobile portrait mode, use only top half for game (DS style)
      // Reserve bottom portion for keyboard area
      if (isMobile && isPortrait) {
        const gameAreaHeight = Math.floor(window.innerHeight * 0.5); // 50% for game
        updateScreenSize(width, gameAreaHeight);
      } else {
        // Use visualViewport for mobile keyboard awareness on other modes
        const vv = window.visualViewport;
        const height = vv ? vv.height : window.innerHeight;
        updateScreenSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Listen to visualViewport for keyboard changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [updateScreenSize, isMobile, isPortrait]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      updateGame(isMobile && isPortrait);
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState, updateGame, isMobile, isPortrait]);

  // Check victory
  useEffect(() => {
    if (gameState === 'playing' && timeRemaining <= 0) {
      setGameState('game_over');
    }
  }, [gameState, timeRemaining, setGameState]);

  const handleMobileInput = useCallback((char: string) => {
    processTypingAttack(char);
    sound.playTyping();
  }, [processTypingAttack, sound]);

  const handleRetry = useCallback(() => {
    startGame(gameMode);
  }, [startGame, gameMode]);

  const handleGoToLobby = useCallback(() => {
    setGameState('shop');
  }, [setGameState]);

  const isVictory = timeRemaining <= 0 && player.hp > 0;

  // Calculate game area dimensions for DS-style layout
  const gameAreaHeight = isMobile && isPortrait ? '50vh' : '100vh';
  const showDSKeyboard = isMobile && isPortrait && (gameState === 'playing' || gameState === 'leveled_up' || gameState === 'artifact_select');

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Game area - top half on mobile portrait */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: isMobile && isPortrait ? '50vh' : '100vh' }}
      >
        <GameCanvas
          player={player}
          enemies={enemies}
          bullets={bullets}
          particles={particles}
          floatingTexts={floatingTexts}
          beams={beams}
          isPlaying={gameState === 'playing' || gameState === 'leveled_up' || gameState === 'artifact_select'}
          mobilePortrait={isMobile && isPortrait}
        />

        <DamageOverlay invincibleTimer={player.invincibleTimer} />

        {gameState === 'login' && (
          <LoginScreen onLogin={(data) => {
            setUserData(data);
            setGameState('shop');
          }} />
        )}

        {gameState === 'shop' && (
          <ShopScreen
            userData={userData}
            onBuyItem={buyItem}
            onResetPurchases={resetPurchases}
            onStartGame={selectModeAndGoToDifficulty}
          />
        )}

        {gameState === 'difficulty_select' && (
          <DifficultySelect
            gameMode={gameMode}
            onSelectDifficulty={(level) => {
              selectDifficulty(level);
              startGame();
            }}
            onBack={() => setGameState('shop')}
          />
        )}

        {(gameState === 'playing' || gameState === 'leveled_up' || gameState === 'artifact_select') && (
          <>
            <GameHUD
              player={player}
              killCount={killCount}
              timeRemaining={timeRemaining}
            />
            {/* Show floating keyboard button only on non-portrait mobile */}
            {!showDSKeyboard && <MobileKeyboardButton onInput={handleMobileInput} />}
          </>
        )}

        {showUpgradeMenu && gameState === 'leveled_up' && (
          <UpgradeMenu upgrades={currentUpgrades} onSelect={selectUpgrade} />
        )}

        {gameState === 'artifact_select' && (
          <ArtifactSelect
            artifacts={artifactOptions}
            onSelect={selectArtifact}
          />
        )}

        {gameState === 'game_over' && (
          <GameOverScreen
            score={killCount}
            isVictory={isVictory}
            onRetry={handleRetry}
            onGoToLobby={handleGoToLobby}
          />
        )}
      </div>

      {/* DS-style on-screen keyboard - bottom half on mobile portrait */}
      {showDSKeyboard && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-primary bg-background/95"
          style={{ height: '50vh' }}
        >
          <OnScreenKeyboard onInput={handleMobileInput} mode={gameMode} />
        </div>
      )}
    </div>
  );
};
