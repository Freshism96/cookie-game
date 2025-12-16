import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GameState, GameMode, Player, UserData, Enemy, Bullet,
  Particle, FloatingText, Beam, PlayerArtifacts, DifficultyLevel,
  LevelUpgrade, Rarity
} from '@/types/game';
import {
  GAME_DURATION, INITIAL_PLAYER_STATS, HANGUL_LIST, WORD_LIST,
  KEY_TO_HANGUL, ENEMY_TYPES, ARTIFACTS, SHOP_ITEMS, LEVEL_UPGRADES, API_CONFIG
} from '@/constants/game';

let idCounter = 0;
const generateId = () => ++idCounter;

// Difficulty settings: [spawnRateMult, speedMult, maxEnemiesMult, hpMult]
const DIFFICULTY_SETTINGS: Record<DifficultyLevel, { spawnRate: number; speed: number; maxEnemies: number; hp: number }> = {
  1: { spawnRate: 0.5, speed: 0.5, maxEnemies: 0.6, hp: 0.7 },
  2: { spawnRate: 0.7, speed: 0.75, maxEnemies: 0.8, hp: 0.9 },
  3: { spawnRate: 0.9, speed: 1.0, maxEnemies: 1.0, hp: 1.0 },
  4: { spawnRate: 1.2, speed: 1.2, maxEnemies: 1.3, hp: 1.2 },
  5: { spawnRate: 1.5, speed: 1.5, maxEnemies: 1.6, hp: 1.5 },
};

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>('login');
  const [gameMode, setGameMode] = useState<GameMode>('hangul');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [userData, setUserData] = useState<UserData>({
    studentName: 'Unknown',
    cookies: 0,
    purchases: { hpBoost: 0, dmgBoost: 0, critBoost: 0, speedBoost: 0, expBoost: 0 }
  });

  const defaultArtifacts = {
    doubleShot: false, splash: false, poison: false,
    freeze: false, leech: false, drone: false,
    shield: false, piercing: false, rapidFire: false,
    magnet: false, critMaster: false, regeneration: false
  };

  const [player, setPlayer] = useState<Player>({
    ...INITIAL_PLAYER_STATS,
    x: 0,
    y: 0,
    artifacts: { ...defaultArtifacts }
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [beams, setBeams] = useState<Beam[]>([]);
  const [killCount, setKillCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [showUpgradeMenu, setShowUpgradeMenu] = useState(false);
  const [currentUpgrades, setCurrentUpgrades] = useState<LevelUpgrade[]>([]);
  const [artifactOptions, setArtifactOptions] = useState<typeof ARTIFACTS>([]);

  const gameStartTimeRef = useRef(0);
  const totalPausedTimeRef = useRef(0);
  const pauseStartTimeRef = useRef(0);
  const lastDroneShotRef = useRef(0);
  const rewardCountRef = useRef(0);
  const frameCountRef = useRef(0);
  const screenRef = useRef({ width: window.innerWidth, height: window.innerHeight });

  const updateScreenSize = useCallback((width: number, height: number) => {
    screenRef.current = { width, height };
    // Update player position if it's outside the new viewport
    setPlayer(prev => ({
      ...prev,
      x: Math.min(prev.x, width - prev.radius),
      y: Math.min(prev.y, height - prev.radius)
    }));
  }, []);

  const resetPlayer = useCallback(() => {
    const { width, height } = screenRef.current;
    setPlayer({
      ...INITIAL_PLAYER_STATS,
      hp: INITIAL_PLAYER_STATS.maxHp + (userData.purchases.hpBoost * 30),
      maxHp: INITIAL_PLAYER_STATS.maxHp + (userData.purchases.hpBoost * 30),
      damage: INITIAL_PLAYER_STATS.damage + (userData.purchases.dmgBoost * 15),
      critChance: userData.purchases.critBoost * 0.1,
      projectileSpeed: INITIAL_PLAYER_STATS.projectileSpeed + (userData.purchases.speedBoost * 5),
      x: width / 2,
      y: height / 2,
      artifacts: { ...defaultArtifacts }
    });
  }, [userData.purchases]);

  const selectDifficulty = useCallback((level: DifficultyLevel) => {
    setDifficulty(level);
  }, []);

  const startGame = useCallback((mode?: GameMode) => {
    if (mode) setGameMode(mode);
    setGameState('playing');
    gameStartTimeRef.current = Date.now();
    totalPausedTimeRef.current = 0;
    rewardCountRef.current = 0;
    frameCountRef.current = 0;
    setEnemies([]);
    setBullets([]);
    setParticles([]);
    setFloatingTexts([]);
    setBeams([]);
    setKillCount(0);
    setTimeRemaining(GAME_DURATION);
    setShowUpgradeMenu(false);
    resetPlayer();
  }, [resetPlayer]);

  const selectModeAndGoToDifficulty = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setGameState('difficulty_select');
  }, []);

  const generateQuestion = useCallback((mode: GameMode) => {
    if (mode === 'hangul') {
      // Difficulty 4-5: Words
      if (difficulty >= 4) {
        const wordData = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        return { question: wordData.question, answer: wordData.answer };
      }
      // Difficulty 1-3: Single Characters
      const char = HANGUL_LIST[Math.floor(Math.random() * HANGUL_LIST.length)];
      return { question: char, answer: char };
    } else if (mode === 'math') {
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 9) + 1;
      return { question: `${a}x${b}`, answer: (a * b).toString() };
    } else {
      // Arithmetic Mode
      // Level 1: 1-digit Addition
      // Level 2: 1-digit Subtraction
      // Level 3: 2-digit Addition
      // Level 4: 2-digit Subtraction
      // Level 5: Mixed 2-digit (+ and -)

      let type: 'add' | 'sub' = 'add';
      if (difficulty === 2 || difficulty === 4) type = 'sub';
      else if (difficulty === 5) type = Math.random() > 0.5 ? 'add' : 'sub';

      const isTwoDigit = difficulty >= 3;

      if (type === 'add') {
        const min = isTwoDigit ? 10 : 1;
        const max = isTwoDigit ? 50 : 9;
        const a = Math.floor(Math.random() * (max - min + 1)) + min;
        const b = Math.floor(Math.random() * (max - min + 1)) + min;
        return { question: `${a}+${b}`, answer: (a + b).toString() };
      } else {
        const min = isTwoDigit ? 10 : 1;
        const max = isTwoDigit ? 99 : 9;
        const a = Math.floor(Math.random() * (max - min + 1)) + min;
        // Ensure result is non-negative and B is not larger than A
        const b = Math.floor(Math.random() * a) + 1;
        return { question: `${a}-${b}`, answer: (a - b).toString() };
      }
    }
  }, [difficulty]);

  const spawnEnemy = useCallback((isBoss: boolean = false, isMobileDevice: boolean = false) => {
    const { width, height } = screenRef.current;
    const edge = Math.floor(Math.random() * 4);
    const padding = isBoss ? 100 : 60;
    let x, y;

    if (edge === 0) { x = Math.random() * width; y = -padding; }
    else if (edge === 1) { x = width + padding; y = Math.random() * height; }
    else if (edge === 2) { x = Math.random() * width; y = height + padding; }
    else { x = -padding; y = Math.random() * height; }

    // Get difficulty multipliers
    const diffSettings = DIFFICULTY_SETTINGS[difficulty];

    let type;
    if (isBoss) {
      type = ENEMY_TYPES.boss;
    } else {
      const rand = Math.random();
      // Higher difficulty = more tank enemies
      const tankChance = 0.15 + (player.level * 0.02) + ((difficulty - 1) * 0.05);
      const fastChance = 0.4 + (player.level * 0.02) + ((difficulty - 1) * 0.05);
      if (rand < tankChance) type = ENEMY_TYPES.tank;
      else if (rand < fastChance) type = ENEMY_TYPES.fast;
      else type = ENEMY_TYPES.normal;
    }

    const elapsedTimeMin = (Date.now() - gameStartTimeRef.current - totalPausedTimeRef.current) / 60000;
    const timeScale = 1 + (elapsedTimeMin * 1.5);
    // Apply difficulty HP multiplier
    const baseHp = (isBoss ? (300 + (player.level * 50)) * timeScale : (50 + (player.level * 15)) * timeScale) * diffSettings.hp;

    let baseSpeed = isBoss ? 0.3 : 0.5 + Math.random() + (player.level * 0.1);
    // Apply difficulty speed multiplier
    baseSpeed *= diffSettings.speed;
    if (player.artifacts.freeze) baseSpeed *= 0.8;

    // Mobile devices get slower enemies (50% speed reduction)
    if (isMobileDevice) baseSpeed *= 0.5;

    const { question, answer } = generateQuestion(gameMode);

    // Boss has longer answer strings
    const bossQuestion = isBoss ? `BOSS:${question}` : question;

    const enemy: Enemy = {
      id: generateId(),
      x, y,
      type,
      hp: baseHp * type.hpMult,
      maxHp: baseHp * type.hpMult,
      speed: baseSpeed * type.spdMult,
      radius: type.size,
      dead: false,
      inputProgress: 0,
      questionString: bossQuestion,
      answerString: answer,
      poisoned: false,
      poisonTimer: 0,
      isBoss
    };

    setEnemies(prev => [...prev, enemy]);
  }, [gameMode, difficulty, player.level, player.artifacts.freeze, generateQuestion]);

  const fireHomingMissile = useCallback((targetId: number, isDrone: boolean = false) => {
    // rapidFire artifact increases speed by 50%
    const speed = player.artifacts.rapidFire ? player.projectileSpeed * 1.5 : player.projectileSpeed;
    const bullet: Bullet = {
      id: generateId(),
      x: player.x,
      y: player.y,
      targetId,
      speed,
      radius: 4,
      life: 100,
      trail: [],
      isDrone
    };
    setBullets(prev => [...prev, bullet]);
  }, [player.x, player.y, player.projectileSpeed, player.artifacts.rapidFire]);

  const createBeam = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    setBeams(prev => [...prev, { id: generateId(), x1, y1, x2, y2, life: 1.0 }]);
  }, []);

  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    setFloatingTexts(prev => [...prev, { id: generateId(), x, y, text, color, life: 1.0 }]);
  }, []);

  const addParticles = useCallback((x: number, y: number, color: string, count: number = 3) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: generateId(),
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const processTypingAttack = useCallback((char: string) => {
    if (gameState !== 'playing') return;

    // Get current enemies to check
    const currentEnemies = enemies.filter(e => !e.dead);

    // If no enemies exist, don't count as miss
    if (currentEnemies.length === 0) return;

    // Check if any enemy can accept this character
    const matchingEnemies = currentEnemies.filter(e => e.answerString[e.inputProgress] === char);

    if (matchingEnemies.length === 0) {
      // No match found - this is a MISS (wrong character)
      setPlayer(prev => ({
        ...prev,
        hp: Math.max(0, prev.hp - 3)
      }));
      addFloatingText(player.x, player.y - 20, '빗나감! -3HP', '#ff6666');
      return;
    }

    // Found matching enemies - process the hit
    setEnemies(prevEnemies => {
      const targets = prevEnemies.filter(e => !e.dead && e.answerString[e.inputProgress] === char);

      if (targets.length === 0) return prevEnemies;

      // Priority: enemies already in progress, then closest
      targets.sort((a, b) => {
        if (a.inputProgress > 0 && b.inputProgress === 0) return -1;
        if (b.inputProgress > 0 && a.inputProgress === 0) return 1;
        return Math.hypot(player.x - a.x, player.y - a.y) - Math.hypot(player.x - b.x, player.y - b.y);
      });

      const targetId = targets[0].id;
      createBeam(player.x, player.y, targets[0].x, targets[0].y);

      return prevEnemies.map(e => {
        if (e.id !== targetId) return e;
        const newProgress = e.inputProgress + 1;
        if (newProgress >= e.answerString.length) {
          fireHomingMissile(e.id, false);
          if (player.artifacts.doubleShot) {
            setTimeout(() => fireHomingMissile(e.id, false), 100);
          }
          return { ...e, inputProgress: 0 };
        }
        return { ...e, inputProgress: newProgress };
      });
    });
  }, [gameState, enemies, player.x, player.y, player.artifacts.doubleShot, createBeam, fireHomingMissile, addFloatingText]);

  const handleKeyInput = useCallback((code: string, key: string) => {
    let inputChar: string | null = null;

    if (KEY_TO_HANGUL[code]) {
      inputChar = KEY_TO_HANGUL[code];
    } else if (key.length === 1) {
      const upper = key.toUpperCase();
      if ((upper >= 'A' && upper <= 'Z') || (upper >= '0' && upper <= '9') ||
        (key >= 'ㄱ' && key <= 'ㅎ') || (key >= 'ㅏ' && key <= 'ㅣ')) {
        inputChar = upper;
      }
    }

    for (let i = 0; i < 10; i++) {
      if (code === `Digit${i}` || code === `Numpad${i}`) {
        inputChar = i.toString();
      }
    }

    if (inputChar) processTypingAttack(inputChar);
  }, [processTypingAttack]);

  const showArtifactSelection = useCallback(() => {
    setGameState('artifact_select');
    const available = ARTIFACTS.filter(a => !player.artifacts[a.id]);
    const options = available.sort(() => 0.5 - Math.random()).slice(0, 3);
    if (options.length === 0) {
      setArtifactOptions([{ id: 'leech' as any, name: '시스템 복구', icon: '❤️', desc: '체력을 모두 회복합니다.' }]);
    } else {
      setArtifactOptions(options);
    }
  }, [player.artifacts]);

  const selectArtifact = useCallback((artifactId: string) => {
    if (artifactId === 'heal') {
      setPlayer(prev => ({ ...prev, hp: prev.maxHp }));
      addFloatingText(player.x, player.y, '체력 완전 회복!', '#0f0');
    } else {
      setPlayer(prev => ({
        ...prev,
        artifacts: { ...prev.artifacts, [artifactId]: true }
      }));
    }
    setGameState('playing');
  }, [player.x, player.y, addFloatingText]);

  const generateLevelUpgrades = useCallback(() => {
    const upgrades: LevelUpgrade[] = [];
    const types = ['damage', 'speed', 'heal', 'nuke', 'shield', 'cd'];

    for (let i = 0; i < 3; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const rand = Math.random();
      let rarity: Rarity = 'Common';
      let multiplier = 1;

      if (rand > 0.98) { rarity = 'Legendary'; multiplier = 3.0; }
      else if (rand > 0.90) { rarity = 'Epic'; multiplier = 2.0; }
      else if (rand > 0.70) { rarity = 'Rare'; multiplier = 1.5; }

      const id = generateId().toString();

      if (type === 'damage') {
        const val = Math.floor(20 * multiplier);
        upgrades.push({
          id, name: '바이러스 치료 강화', desc: `공격력 +${val} 증가`, rarity,
          apply: () => setPlayer(p => ({ ...p, damage: p.damage + val }))
        });
      } else if (type === 'speed') {
        const val = Math.floor(3 * multiplier);
        upgrades.push({
          id, name: '프로세스 가속', desc: `투사체 속도 +${val} 증가`, rarity,
          apply: () => setPlayer(p => ({ ...p, projectileSpeed: p.projectileSpeed + val }))
        });
      } else if (type === 'heal') {
        const val = Math.floor(30 * multiplier);
        upgrades.push({
          id, name: '시스템 복구', desc: `체력 ${val} 회복`, rarity,
          apply: () => setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + val) }))
        });
      } else if (type === 'nuke') {
        upgrades.push({
          id, name: '포맷 (전체 삭제)', desc: '화면의 모든 적 처치', rarity: 'Legendary',
          apply: () => {
            setEnemies(prev => {
              // Trigger kills for everyone
              prev.forEach(e => {
                if (!e.dead) {
                  addParticles(e.x, e.y, e.type.color, 10);
                  addFloatingText(e.x, e.y, 'DELETED', '#ff0000');
                }
              });
              setKillCount(k => k + prev.length); // Rough estimate
              return [];
            });
            // Also flash screen
            addFloatingText(player.x, player.y - 100, 'SYSTEM FORMATTED', '#ff0000');
          }
        });
      } else if (type === 'shield') {
        const val = Math.floor(5 * multiplier);
        upgrades.push({
          id, name: '임시 보호막', desc: `무적 시간 ${val}초 부여`, rarity,
          apply: () => setPlayer(p => ({ ...p, invincibleTimer: val * 60 }))
        });
      } else {
        // Default fallback (Damage)
        const val = Math.floor(15 * multiplier);
        upgrades.push({
          id, name: '공격력 강화', desc: `공격력 +${val}`, rarity,
          apply: () => setPlayer(p => ({ ...p, damage: p.damage + val }))
        });
      }
    }
    return upgrades;
  }, [player.x, player.y, addFloatingText, addParticles]);

  const selectUpgrade = useCallback((index: number) => {
    if (currentUpgrades[index]) {
      currentUpgrades[index].apply();
    }
    setShowUpgradeMenu(false);
    setGameState('playing');
  }, [currentUpgrades]);

  const checkLevelUp = useCallback(() => {
    setPlayer(prev => {
      if (prev.exp >= prev.expToNextLevel) {
        const newLevel = prev.level + 1;
        const newExpToNext = Math.floor(prev.expToNextLevel * 1.5);
        setCurrentUpgrades(generateLevelUpgrades());
        setShowUpgradeMenu(true);
        setGameState('leveled_up');
        return {
          ...prev,
          level: newLevel,
          exp: prev.exp - prev.expToNextLevel,
          expToNextLevel: newExpToNext
        };
      }
      return prev;
    });
  }, []);

  const playerTakeDamage = useCallback((amount: number) => {
    setPlayer(prev => {
      if (prev.invincibleTimer > 0) return prev;
      const newHp = prev.hp - amount;
      if (newHp <= 0) {
        setGameState('game_over');
        return { ...prev, hp: 0, invincibleTimer: 60 };
      }
      return { ...prev, hp: newHp, invincibleTimer: 60 };
    });
  }, []);

  const buyItem = useCallback((itemId: 'hpBoost' | 'dmgBoost' | 'critBoost' | 'speedBoost' | 'expBoost', cost: number, limit: number) => {
    setUserData(prev => {
      if (prev.cookies < cost || prev.purchases[itemId] >= limit) return prev;
      return {
        ...prev,
        cookies: prev.cookies - cost,
        purchases: { ...prev.purchases, [itemId]: prev.purchases[itemId] + 1 }
      };
    });

    if (itemId === 'hpBoost') {
      setPlayer(prev => ({ ...prev, maxHp: prev.maxHp + 30, hp: prev.hp + 30 }));
    } else if (itemId === 'dmgBoost') {
      setPlayer(prev => ({ ...prev, damage: prev.damage + 15 }));
    } else if (itemId === 'critBoost') {
      setPlayer(prev => ({ ...prev, critChance: prev.critChance + 0.1 }));
    } else if (itemId === 'speedBoost') {
      setPlayer(prev => ({ ...prev, projectileSpeed: prev.projectileSpeed + 5 }));
    }
    // expBoost is handled in updateGame
  }, []);

  const resetPurchases = useCallback(() => {
    setUserData(prev => {
      // Calculate total refund
      const refund = SHOP_ITEMS.reduce((acc, item) => {
        return acc + (item.cost * prev.purchases[item.id]);
      }, 0);

      return {
        ...prev,
        cookies: prev.cookies + refund,
        purchases: { hpBoost: 0, dmgBoost: 0, critBoost: 0, speedBoost: 0, expBoost: 0 }
      };
    });

    // Reset player stats to initial
    setPlayer(prev => ({
      ...prev,
      maxHp: INITIAL_PLAYER_STATS.maxHp,
      hp: INITIAL_PLAYER_STATS.maxHp,
      damage: INITIAL_PLAYER_STATS.damage,
      critChance: INITIAL_PLAYER_STATS.critChance,
      projectileSpeed: INITIAL_PLAYER_STATS.projectileSpeed
    }));
  }, []);

  const updateGame = useCallback((isMobile: boolean = false) => {
    // Allow game updates during artifact selection/leveling for time tracking
    const isPaused = gameState === 'artifact_select' || gameState === 'leveled_up';

    if (gameState !== 'playing' && !isPaused) return;

    const elapsed = Date.now() - gameStartTimeRef.current - totalPausedTimeRef.current;
    const remaining = Math.max(0, GAME_DURATION - elapsed);
    setTimeRemaining(remaining);

    if (remaining <= 0 && gameState === 'playing') {
      setGameState('game_over');
      return;
    }

    // Artifact reward every minute (only trigger when playing)
    if (gameState === 'playing') {
      const currentMinute = Math.floor(elapsed / 60000);
      if (currentMinute > rewardCountRef.current && currentMinute < 5) {
        rewardCountRef.current++;
        showArtifactSelection();
        return; // Exit to let artifact selection handle
      }
    }

    // Don't update game logic while paused
    if (isPaused) return;

    // Drone auto-attack
    if (player.artifacts.drone) {
      const now = Date.now();
      if (now - lastDroneShotRef.current > 1000) {
        const aliveEnemies = enemies.filter(e => !e.dead);
        if (aliveEnemies.length > 0) {
          let minDist = Infinity;
          let target: Enemy | null = null;
          aliveEnemies.forEach(e => {
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < minDist) { minDist = d; target = e; }
          });
          if (target) {
            fireHomingMissile(target.id, true);
            lastDroneShotRef.current = now;
          }
        }
      }
    }

    // Update player invincibility
    setPlayer(prev => ({
      ...prev,
      invincibleTimer: Math.max(0, prev.invincibleTimer - 1)
    }));

    // Spawn enemies with increasing difficulty
    frameCountRef.current++;
    const elapsedMin = elapsed / 60000;

    // Regeneration artifact: heal every 5 seconds (300 frames)
    if (player.artifacts.regeneration && frameCountRef.current % 300 === 0) {
      setPlayer(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + 5)
      }));
      addFloatingText(player.x, player.y - 30, '+5 HP', '#00ff00');
    }

    // Get difficulty multipliers
    const diffSettings = DIFFICULTY_SETTINGS[difficulty];

    // Base spawn rate: decreases over time for faster spawns
    // Starts at 60 (1s) -> decreases to 20 (0.33s)
    let currentSpawnRate = Math.max(20, 60 - (elapsedMin * 10));

    // Apply difficulty modifier: Higher spawnRate constant = Lower interval (Faster spawns)
    // We invert the multiplier for interval calculation
    currentSpawnRate = Math.max(10, Math.floor(currentSpawnRate / diffSettings.spawnRate));

    // Mobile adjustment: Slower spawns
    if (isMobile) currentSpawnRate = Math.floor(currentSpawnRate * 1.5);

    // Max enemies increases over time (more enemies at higher difficulty)
    const maxEnemies = Math.floor((20 + Math.floor(elapsedMin * 8)) * diffSettings.maxEnemies);

    const bossInterval = Math.floor(45000 / (1 + (difficulty - 1) * 0.2));
    const currentBossPhase = Math.floor((elapsed - bossInterval) / bossInterval);
    const bossesSpawned = enemies.filter(e => e.isBoss && !e.dead).length;

    // Boss Logic: Skill usage
    const bossList = enemies.filter(e => e.isBoss && !e.dead);
    bossList.forEach(boss => {
      // 10 second interval for skills (600 frames)
      if (frameCountRef.current % 600 === 0) {
        const skillRand = Math.random();

        if (skillRand > 0.5) {
          // Skill 1: Summon Minions
          addFloatingText(boss.x, boss.y - 80, '⚠️ 지원군 소환! ⚠️', '#ff00ff');
          for (let i = 0; i < 3; i++) {
            // Spawn fast enemies near boss
            const angle = (i * 120) * (Math.PI / 180);
            const mx = boss.x + Math.cos(angle) * 80;
            const my = boss.y + Math.sin(angle) * 80;
            // We reuse spawnEnemy but we need to inject them manually or modify spawnEnemy
            // Ideally modify spawnEnemy to accept coords, but for safety let's just push unique enemies here or call spawnEnemy with a flag?
            // spawnEnemy implementation relies on edge logic.
            // Let's just spawn normal enemies and let them flow in, but force them to 'fast' type.
            spawnEnemy(false, isMobile);
          }
        } else {
          // Skill 2: Radial Bullet (Bullets that hurt player?)
          // Current game design only has bullets FROM player.
          // Let's add 'red' bullets or just make the boss shoot a 'lock' beam?
          // Or just summon more enemies for now to be safe with current 'Bullet' type limitations.
          addFloatingText(boss.x, boss.y - 80, '⚠️ 광폭화! ⚠️', '#ff0000');
          // Heal boss slightly
          setEnemies(prev => prev.map(e => e.id === boss.id ? { ...e, hp: Math.min(e.maxHp, e.hp + 50) } : e));

          // Speed up boss momentarily?
          // Hard without state.
        }
      }
    });

    if (currentBossPhase > 0 && bossesSpawned === 0 && frameCountRef.current % 60 === 0) {
      const bossCount = enemies.filter(e => e.isBoss).length;
      if (bossCount < currentBossPhase) {
        spawnEnemy(true, isMobile);
        addFloatingText(player.x, player.y - 50, '⚠️ 보스 출현! ⚠️', '#ff00ff');
      }
    }

    if (frameCountRef.current % currentSpawnRate === 0 && enemies.length < maxEnemies) {
      spawnEnemy(false, isMobile);
    }

    // Update bullets
    setBullets(prev => prev.map(b => {
      const target = enemies.find(e => e.id === b.targetId);
      if (!target || target.dead) return { ...b, life: 0 };

      const angle = Math.atan2(target.y - b.y, target.x - b.x);
      const newX = b.x + Math.cos(angle) * b.speed;
      const newY = b.y + Math.sin(angle) * b.speed;
      const newTrail = [...b.trail, { x: newX, y: newY }].slice(-5);

      const dist = Math.hypot(newX - target.x, newY - target.y);
      if (dist < target.radius + b.radius + 2) {
        // Hit enemy
        const isCrit = Math.random() < player.critChance;
        // critMaster artifact: 3x crit damage instead of 2x
        const critMultiplier = player.artifacts.critMaster ? 3 : 2;
        const finalDamage = player.damage * (isCrit ? critMultiplier : 1);

        setEnemies(prevEnemies => prevEnemies.map(e => {
          if (e.id !== target.id) return e;
          const newHp = e.hp - finalDamage;
          addFloatingText(e.x, e.y - 20, isCrit ? '치명타!' : '명중', isCrit ? '#ff0' : '#fff');
          addParticles(e.x, e.y, e.isBoss ? '#ff00ff' : '#f00');

          if (newHp <= 0) {
            // Calculate exp gain with boosts
            let expGain = 10;
            if (player.artifacts.magnet) expGain *= 1.5; // magnet artifact: 50% more exp
            expGain *= (1 + (userData.purchases.expBoost * 0.2)); // expBoost: +20% per level
            const bossExpBonus = e.isBoss ? 50 : 0;
            setPlayer(p => ({ ...p, exp: p.exp + Math.floor(expGain) + bossExpBonus }));
            setKillCount(k => k + 1);
            checkLevelUp();

            if (player.artifacts.leech) {
              const healAmount = e.isBoss ? 10 : 2;
              setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + healAmount) }));
            }

            addParticles(e.x, e.y, e.isBoss ? '#ff00ff' : '#f00', e.isBoss ? 20 : 8);
            if (e.isBoss) {
              addFloatingText(e.x, e.y - 60, '🎉 보스 처치 완료! 🎉', '#ff00ff');
            }

            // Splash damage
            if (player.artifacts.splash) {
              const splashRadius = e.isBoss ? 150 : 100;
              setEnemies(pes => pes.map(pe => {
                if (pe.dead || pe.id === e.id) return pe;
                const d = Math.hypot(pe.x - e.x, pe.y - e.y);
                if (d < splashRadius) {
                  createBeam(e.x, e.y, pe.x, pe.y);
                  return { ...pe, hp: pe.hp - (player.damage * 0.5) };
                }
                return pe;
              }));
            }

            return { ...e, hp: 0, dead: true };
          }

          // Apply poison
          const newPoisoned = player.artifacts.poison ? true : e.poisoned;

          // Regenerate question if not drone attack
          if (!b.isDrone) {
            const { question, answer } = generateQuestion(gameMode);
            addFloatingText(e.x, e.y - 40, '코드 변경', '#ff0');
            return { ...e, hp: newHp, poisoned: newPoisoned, questionString: question, answerString: answer, inputProgress: 0 };
          }

          return { ...e, hp: newHp, poisoned: newPoisoned };
        }));

        return { ...b, life: 0 };
      }

      return { ...b, x: newX, y: newY, trail: newTrail };
    }).filter(b => b.life > 0));

    // Update enemies
    setEnemies(prev => prev.map(e => {
      if (e.dead) return e;

      const angle = Math.atan2(player.y - e.y, player.x - e.x);
      const newX = e.x + Math.cos(angle) * e.speed;
      const newY = e.y + Math.sin(angle) * e.speed;

      const dist = Math.hypot(player.x - newX, player.y - newY);
      if (dist < player.radius + e.radius) {
        // BOSS TOUCHES PLAYER -> INSTANT GAME OVER
        if (e.isBoss) {
          setPlayer(p => ({ ...p, hp: 0 }));
          setGameState('game_over');
          return { ...e, dead: true }; // Visual only, game ends
        }

        playerTakeDamage(Math.floor(e.radius));
        addParticles(newX, newY, e.type.color, 8);
        return { ...e, dead: true };
      }

      // Poison tick
      let newPoisonTimer = e.poisonTimer;
      if (e.poisoned) {
        newPoisonTimer++;
        if (newPoisonTimer % 60 === 0) {
          addFloatingText(e.x, e.y, '독', '#0f0');
          const newHp = e.hp - 10;
          if (newHp <= 0) {
            addParticles(e.x, e.y, '#f00', 8);
            let expGain = 10;
            if (player.artifacts.magnet) expGain *= 1.5;
            expGain *= (1 + (userData.purchases.expBoost * 0.2));
            setPlayer(p => ({ ...p, exp: p.exp + Math.floor(expGain) }));
            setKillCount(k => k + 1);
            return { ...e, x: newX, y: newY, hp: 0, dead: true, poisonTimer: newPoisonTimer };
          }
          return { ...e, x: newX, y: newY, hp: newHp, poisonTimer: newPoisonTimer };
        }
      }

      return { ...e, x: newX, y: newY, poisonTimer: newPoisonTimer };
    }).filter(e => !e.dead || e.hp > -100));

    // Update particles
    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 0.05
    })).filter(p => p.life > 0));

    // Update floating texts
    setFloatingTexts(prev => prev.map(t => ({
      ...t,
      y: t.y - 1,
      life: t.life - 0.03
    })).filter(t => t.life > 0));

    // Update beams
    setBeams(prev => prev.map(b => ({
      ...b,
      life: b.life - 0.15
    })).filter(b => b.life > 0));
  }, [
    gameState, gameMode, difficulty, enemies, player, userData, spawnEnemy, fireHomingMissile,
    showArtifactSelection, addFloatingText, addParticles, createBeam,
    checkLevelUp, playerTakeDamage, generateQuestion
  ]);

  // Handle pause time
  useEffect(() => {
    if (gameState === 'artifact_select' || gameState === 'leveled_up') {
      if (pauseStartTimeRef.current === 0) {
        pauseStartTimeRef.current = Date.now();
      }
    } else if (pauseStartTimeRef.current !== 0) {
      totalPausedTimeRef.current += Date.now() - pauseStartTimeRef.current;
      pauseStartTimeRef.current = 0;
    }
  }, [gameState]);

  return {
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
    currentUpgrades,
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
    updateScreenSize
  };
}
