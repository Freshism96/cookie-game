export type GameMode = 'hangul' | 'math' | 'arithmetic';
export type GameState = 'login' | 'shop' | 'difficulty_select' | 'playing' | 'leveled_up' | 'game_over' | 'artifact_select';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface PlayerStats {
  hp: number;
  maxHp: number;
  damage: number;
  critChance: number;
  projectileSpeed: number;
  invincibleTimer: number;
  exp: number;
  expToNextLevel: number;
  level: number;
}

export interface PlayerArtifacts {
  doubleShot: boolean;
  splash: boolean;
  poison: boolean;
  freeze: boolean;
  leech: boolean;
  drone: boolean;
  shield: boolean;
  piercing: boolean;
  rapidFire: boolean;
  magnet: boolean;
  critMaster: boolean;
  regeneration: boolean;
}

export interface Player extends PlayerStats {
  x: number;
  y: number;
  radius: number;
  artifacts: PlayerArtifacts;
}

export interface UserData {
  studentName: string;
  cookies: number;
  purchases: {
    hpBoost: number;
    dmgBoost: number;
    critBoost: number;
    speedBoost: number;
    expBoost: number;
  };
}

export interface Artifact {
  id: keyof PlayerArtifacts;
  name: string;
  icon: string;
  desc: string;
}

export interface ShopItem {
  id: 'hpBoost' | 'dmgBoost' | 'critBoost' | 'speedBoost' | 'expBoost';
  name: string;
  cost: number;
  desc: string;
  limit: number;
}

export interface EnemyType {
  hpMult: number;
  spdMult: number;
  color: string;
  size: number;
  shape: 'rect' | 'triangle' | 'square' | 'boss';
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  dead: boolean;
  inputProgress: number;
  questionString: string;
  answerString: string;
  poisoned: boolean;
  poisonTimer: number;
  isBoss: boolean;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  targetId: number;
  speed: number;
  radius: number;
  life: number;
  trail: { x: number; y: number }[];
  isDrone: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface Beam {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
}

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface LevelUpgrade {
  id: string;
  name: string;
  desc: string;
  rarity: Rarity;
  apply: () => void;
}
