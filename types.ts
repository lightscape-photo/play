import React from 'react';

export type EquipmentType = 'sword' | 'armor';
export type MaterialType = 'iron' | 'aluminum';

export interface Equipment {
  id: EquipmentType;
  name: string;
  level: number;
  maxLevel: number;
  status: 'normal' | 'broken';
}

export interface Material {
  id: MaterialType;
  name: string;
  count: number;
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'success' | 'fail' | 'info' | 'warn';
  timestamp: number;
}

export interface SuccessRateTier {
  min: number;
  max: number;
  rate: number;
}

// --- Enchantment Types ---

export type EnchantmentSlotType = 'weapon' | 'offhand' | 'armor' | 'cloak' | 'boots' | 'head';

export interface EnchantmentAttribute {
  name: string;
  level: number;
  value: number; // The actual numeric value (e.g. 2.9 or 100)
}

export interface SpecialAttribute {
  key: string; // e.g., 'Blade'
  name: string; // e.g., '利刃'
  level: number;
  description: string;
}

export interface EnchantmentState {
  baseAttributes: EnchantmentAttribute[];
  specialAttribute: SpecialAttribute | null;
}

export interface EnchantmentSlotData {
  id: EnchantmentSlotType;
  name: string;
  icon: React.ReactNode;
  currentEnchantment: EnchantmentState | null;
}