import { SuccessRateTier } from './types';

export const MAX_LEVEL = 15;
export const INITIAL_MATERIAL_COUNT = 500;
export const BREAK_CHANCE = 0.5; // 50% chance to break on failure

// Dynamic material cost:
// More granular steps to ensure cost increases as difficulty rises
export const getMaterialCost = (level: number): number => {
  if (level >= 14) return 10; // Final step is expensive
  if (level >= 12) return 8;  // Very High
  if (level >= 10) return 5;  // High
  if (level >= 7) return 3;   // Medium
  if (level >= 4) return 2;   // Low-Medium
  return 1;                   // Basic
};

// Updated Curve based on user request
// +0 -> +4: 100%
// +4 -> +6: 85%  (Was 90%)
// +6 -> +8: 75%  (Was 80%)
// +8 -> +10: 65% (Was 70%)
// +10 -> +12: 55% (Was 60%)
// +12 -> +13: 50%
// +13 -> +14: 40%
// +14 -> +15: 35%
export const SUCCESS_RATES: SuccessRateTier[] = [
  { min: 0, max: 3, rate: 100 },   // Target +1, +2, +3, +4
  { min: 4, max: 5, rate: 85 },    // Target +5, +6
  { min: 6, max: 7, rate: 75 },    // Target +7, +8
  { min: 8, max: 9, rate: 65 },    // Target +9, +10
  { min: 10, max: 11, rate: 55 },  // Target +11, +12
  { min: 12, max: 12, rate: 50 },  // Target +13
  { min: 13, max: 13, rate: 40 },  // Target +14
  { min: 14, max: 14, rate: 35 },  // Target +15
];

export const getSuccessRate = (level: number): number => {
  const tier = SUCCESS_RATES.find(t => level >= t.min && level <= t.max);
  return tier ? tier.rate : 0;
};