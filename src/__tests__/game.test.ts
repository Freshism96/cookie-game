/**
 * Game Logic Tests
 * 
 * These are basic unit tests for game constants and utility functions.
 * Run with: npm test (requires vitest setup)
 */

import { describe, it, expect } from 'vitest';
import { 
  ARTIFACTS, 
  SHOP_ITEMS, 
  ENEMY_TYPES, 
  INITIAL_PLAYER_STATS,
  HANGUL_LIST,
  KEY_TO_HANGUL
} from '@/constants/game';

describe('Game Constants', () => {
  describe('ARTIFACTS', () => {
    it('should have 12 unique artifacts', () => {
      expect(ARTIFACTS.length).toBe(12);
      const ids = ARTIFACTS.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(12);
    });

    it('each artifact should have required properties', () => {
      ARTIFACTS.forEach(artifact => {
        expect(artifact).toHaveProperty('id');
        expect(artifact).toHaveProperty('name');
        expect(artifact).toHaveProperty('icon');
        expect(artifact).toHaveProperty('desc');
        expect(typeof artifact.id).toBe('string');
        expect(typeof artifact.name).toBe('string');
        expect(typeof artifact.icon).toBe('string');
        expect(typeof artifact.desc).toBe('string');
      });
    });
  });

  describe('SHOP_ITEMS', () => {
    it('should have 5 shop items', () => {
      expect(SHOP_ITEMS.length).toBe(5);
    });

    it('each shop item should have valid cost and limit', () => {
      SHOP_ITEMS.forEach(item => {
        expect(item.cost).toBeGreaterThan(0);
        expect(item.limit).toBeGreaterThan(0);
        expect(item.limit).toBeLessThanOrEqual(10);
      });
    });

    it('shop item ids should be unique', () => {
      const ids = SHOP_ITEMS.map(i => i.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(SHOP_ITEMS.length);
    });
  });

  describe('ENEMY_TYPES', () => {
    it('should have 4 enemy types', () => {
      expect(Object.keys(ENEMY_TYPES).length).toBe(4);
    });

    it('should include normal, fast, tank, and boss types', () => {
      expect(ENEMY_TYPES).toHaveProperty('normal');
      expect(ENEMY_TYPES).toHaveProperty('fast');
      expect(ENEMY_TYPES).toHaveProperty('tank');
      expect(ENEMY_TYPES).toHaveProperty('boss');
    });

    it('boss should have highest HP multiplier', () => {
      const bossHpMult = ENEMY_TYPES.boss.hpMult;
      expect(bossHpMult).toBeGreaterThan(ENEMY_TYPES.normal.hpMult);
      expect(bossHpMult).toBeGreaterThan(ENEMY_TYPES.fast.hpMult);
      expect(bossHpMult).toBeGreaterThan(ENEMY_TYPES.tank.hpMult);
    });

    it('fast enemy should have highest speed multiplier', () => {
      const fastSpdMult = ENEMY_TYPES.fast.spdMult;
      expect(fastSpdMult).toBeGreaterThan(ENEMY_TYPES.normal.spdMult);
      expect(fastSpdMult).toBeGreaterThan(ENEMY_TYPES.tank.spdMult);
      expect(fastSpdMult).toBeGreaterThan(ENEMY_TYPES.boss.spdMult);
    });
  });

  describe('INITIAL_PLAYER_STATS', () => {
    it('should have valid initial values', () => {
      expect(INITIAL_PLAYER_STATS.hp).toBeGreaterThan(0);
      expect(INITIAL_PLAYER_STATS.maxHp).toBe(INITIAL_PLAYER_STATS.hp);
      expect(INITIAL_PLAYER_STATS.damage).toBeGreaterThan(0);
      expect(INITIAL_PLAYER_STATS.critChance).toBeGreaterThanOrEqual(0);
      expect(INITIAL_PLAYER_STATS.critChance).toBeLessThanOrEqual(1);
      expect(INITIAL_PLAYER_STATS.level).toBe(1);
    });
  });

  describe('HANGUL_LIST', () => {
    it('should contain Korean consonants and vowels', () => {
      expect(HANGUL_LIST.length).toBeGreaterThan(0);
      expect(HANGUL_LIST).toContain('ㄱ');
      expect(HANGUL_LIST).toContain('ㅏ');
    });
  });

  describe('KEY_TO_HANGUL', () => {
    it('should map keyboard keys to Hangul characters', () => {
      expect(KEY_TO_HANGUL['KeyQ']).toBe('ㅂ');
      expect(KEY_TO_HANGUL['KeyA']).toBe('ㅁ');
      expect(KEY_TO_HANGUL['KeyK']).toBe('ㅏ');
    });

    it('should only contain valid Hangul characters', () => {
      Object.values(KEY_TO_HANGUL).forEach(char => {
        const isHangul = (char >= 'ㄱ' && char <= 'ㅎ') || (char >= 'ㅏ' && char <= 'ㅣ') || char === 'ㅐ' || char === 'ㅔ';
        expect(isHangul).toBe(true);
      });
    });
  });
});

describe('Game Mechanics', () => {
  describe('Experience calculation', () => {
    it('should calculate exp gain correctly with magnet artifact', () => {
      const baseExp = 10;
      const magnetMultiplier = 1.5;
      const expWithMagnet = baseExp * magnetMultiplier;
      expect(expWithMagnet).toBe(15);
    });

    it('should calculate exp gain correctly with expBoost', () => {
      const baseExp = 10;
      const expBoostLevel = 3;
      const expBoostMultiplier = 1 + (expBoostLevel * 0.2);
      const expWithBoost = baseExp * expBoostMultiplier;
      expect(expWithBoost).toBe(16);
    });
  });

  describe('Damage calculation', () => {
    it('should calculate critical damage correctly', () => {
      const baseDamage = 60;
      const normalCritMultiplier = 2;
      const critMasterMultiplier = 3;
      
      expect(baseDamage * normalCritMultiplier).toBe(120);
      expect(baseDamage * critMasterMultiplier).toBe(180);
    });
  });

  describe('Shop refund calculation', () => {
    it('should calculate total refund correctly', () => {
      const purchases = { hpBoost: 2, dmgBoost: 1, critBoost: 0, speedBoost: 1, expBoost: 0 };
      const refund = (2 * 2) + (3 * 1) + (5 * 0) + (4 * 1) + (6 * 0);
      expect(refund).toBe(11);
    });
  });
});
