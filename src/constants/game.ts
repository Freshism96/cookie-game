import { Artifact, ShopItem, EnemyType } from '@/types/game';

export const API_CONFIG = {
  baseUrl: 'https://api.dahandin.com/openapi/v1',
  apiKey: '03fc676b700bf368ba2553202d590242e1e60438a0577b60',
};

export const GAME_DURATION = 5 * 60 * 1000; // 5 minutes in ms

export const INITIAL_PLAYER_STATS = {
  hp: 100,
  maxHp: 100,
  damage: 60,
  critChance: 0,
  projectileSpeed: 20,
  invincibleTimer: 0,
  exp: 0,
  expToNextLevel: 10,
  level: 1,
  radius: 12,
};

// QWERTY keyboard layout hangul characters
export const HANGUL_LIST = [
  'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ',
  'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ',
  'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'
];

export const WORD_LIST = [
  { question: '사과', answer: 'ㅅㅏㄱㅘ' },
  { question: '포도', answer: 'ㅍㅗㄷㅗ' },
  { question: '수박', answer: 'ㅅㅜㅂㅏㄱ' },
  { question: '학교', answer: 'ㅎㅏㄱㄱㅛ' },
  { question: '안경', answer: 'ㅇㅏㄴㄱㅕㅇ' },
  { question: '우산', answer: 'ㅇㅜㅅㅏㄴ' },
  { question: '컴퓨터', answer: 'ㅋㅓㅁㅍㅠㅌㅓ' },
  { question: '마우스', answer: 'ㅁㅏㅇㅜㅅㅡ' },
  { question: '키보드', answer: 'ㅋㅣㅂㅗㄷㅡ' },
  { question: '모니터', answer: 'ㅁㅗㄴㅣㅌㅓ' },
  { question: '호랑이', answer: 'ㅎㅗㄹㅏㅇㅇㅣ' },
  { question: '고양이', answer: 'ㄱㅗㅇㅑㅇㅇㅣ' },
  { question: '강아지', answer: 'ㄱㅏㅇㅇㅏㅈㅣ' },
  { question: '비행기', answer: 'ㅂㅣㅎㅐㅇㄱㅣ' },
  { question: '자동차', answer: 'ㅈㅏㄷㅗㅇㅊㅏ' },
];

export const KEY_TO_HANGUL: Record<string, string> = {
  'KeyQ': 'ㅂ', 'KeyW': 'ㅈ', 'KeyE': 'ㄷ', 'KeyR': 'ㄱ', 'KeyT': 'ㅅ',
  'KeyY': 'ㅛ', 'KeyU': 'ㅕ', 'KeyI': 'ㅑ', 'KeyO': 'ㅐ', 'KeyP': 'ㅔ',
  'KeyA': 'ㅁ', 'KeyS': 'ㄴ', 'KeyD': 'ㅇ', 'KeyF': 'ㄹ', 'KeyG': 'ㅎ',
  'KeyH': 'ㅗ', 'KeyJ': 'ㅓ', 'KeyK': 'ㅏ', 'KeyL': 'ㅣ',
  'KeyZ': 'ㅋ', 'KeyX': 'ㅌ', 'KeyC': 'ㅊ', 'KeyV': 'ㅍ',
  'KeyB': 'ㅠ', 'KeyN': 'ㅜ', 'KeyM': 'ㅡ'
};

export const ARTIFACTS: Artifact[] = [
  { id: 'doubleShot', name: '더블 프로세서', icon: '⚡', desc: '공격 시 미사일을 한 번 더 발사합니다.' },
  { id: 'splash', name: '바이러스 확산', icon: '🦠', desc: '처치 시 주변 적에게 데미지를 줍니다.' },
  { id: 'poison', name: '메모리 누수', icon: '🧪', desc: '공격받은 적이 지속 데미지를 입습니다.' },
  { id: 'freeze', name: '시스템 동결', icon: '❄️', desc: '적들의 접근 속도가 20% 느려집니다.' },
  { id: 'leech', name: '데이터 흡수', icon: '🩸', desc: '적 처치 시 체력을 2 회복합니다.' },
  { id: 'drone', name: '보안 드론', icon: '🤖', desc: '1초마다 자동으로 적을 공격합니다.' },
  { id: 'shield', name: '방어막', icon: '🛡️', desc: '피격 시 30% 확률로 데미지를 무시합니다.' },
  { id: 'piercing', name: '관통탄', icon: '🎯', desc: '미사일이 적을 관통하여 추가 데미지를 줍니다.' },
  { id: 'rapidFire', name: '오버클럭', icon: '🔥', desc: '미사일 속도가 50% 증가합니다.' },
  { id: 'magnet', name: '데이터 수집기', icon: '🧲', desc: '경험치 획득량이 50% 증가합니다.' },
  { id: 'critMaster', name: '취약점 분석', icon: '💥', desc: '치명타 데미지가 3배로 증가합니다.' },
  { id: 'regeneration', name: '자가 복구', icon: '💚', desc: '5초마다 체력을 5 회복합니다.' }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'hpBoost', name: '방화벽 증설 (HP)', cost: 2, desc: '최대 체력 +30', limit: 10 },
  { id: 'dmgBoost', name: '백신 강화 (공격력)', cost: 3, desc: '공격력 +15', limit: 10 },
  { id: 'critBoost', name: '정밀 타격 (치명타)', cost: 5, desc: '치명타 확률 +10%', limit: 10 },
  { id: 'speedBoost', name: '오버클럭 (속도)', cost: 4, desc: '투사체 속도 +5', limit: 5 },
  { id: 'expBoost', name: '학습 가속기 (경험치)', cost: 6, desc: '경험치 획득 +20%', limit: 5 }
];

export const ENEMY_TYPES: Record<string, EnemyType> = {
  normal: { hpMult: 1, spdMult: 1, color: '#f00', size: 15, shape: 'rect' },
  fast: { hpMult: 0.6, spdMult: 1.6, color: '#ff4444', size: 10, shape: 'triangle' },
  tank: { hpMult: 4.0, spdMult: 0.5, color: '#800000', size: 25, shape: 'square' },
  boss: { hpMult: 15.0, spdMult: 0.3, color: '#ff00ff', size: 50, shape: 'boss' }
};

export const LEVEL_UPGRADES = [
  { name: '공격력 증가', desc: '공격력 +25' },
  { name: '속도 증가', desc: '투사체 속도 +5' },
  { name: '긴급 복구', desc: '체력 30 회복' }
];
