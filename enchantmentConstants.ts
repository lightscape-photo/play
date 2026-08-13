import { EnchantmentSlotType, EnchantmentAttribute } from './types';

export const BASE_ATTRIBUTES = [
  "體質", "力量", "智力", "幸運", "靈巧", "敏捷", 
  "生命上限", "魔法上限", "物理攻擊", "魔法攻擊", "物理防禦", "魔法防禦", 
  "命中", "閃避", "裝備攻速", "暴擊", "暴擊防護", "暴傷", "暴傷減免", 
  "治療加成", "受治療加成", "物傷加成", "物傷減免", 
  "沉默抵抗", "冰凍抵抗", "石化抵抗", "暈眩抵抗", "灼燒抵抗", "中毒抵抗", "定身抵抗", "恐懼抵抗", "詛咒抵抗"
];

interface AttributeConfig {
  max: number;
  unit: string;
  isFloat: boolean; // If true, allows decimals and uses variance
}

export const ATTRIBUTE_CONFIG: Record<string, AttributeConfig> = {
  // Base Stats (1-10)
  "體質": { max: 10, unit: "", isFloat: false },
  "力量": { max: 10, unit: "", isFloat: false },
  "智力": { max: 10, unit: "", isFloat: false },
  "幸運": { max: 10, unit: "", isFloat: false },
  "靈巧": { max: 10, unit: "", isFloat: false },
  "敏捷": { max: 10, unit: "", isFloat: false },

  // Panel Stats
  "生命上限": { max: 100, unit: "%", isFloat: false }, // 1%~100% (Integers 10, 20...100 likely, or 1-100)
  "魔法上限": { max: 100, unit: "%", isFloat: false },
  "物理攻擊": { max: 100, unit: "", isFloat: false }, // 1-100
  "魔法攻擊": { max: 100, unit: "", isFloat: false },
  "物理防禦": { max: 100, unit: "", isFloat: false },
  "魔法防禦": { max: 100, unit: "", isFloat: false },

  // Combat Parameters
  "命中": { max: 50, unit: "", isFloat: false }, // 1-50
  "閃避": { max: 50, unit: "", isFloat: false },
  "裝備攻速": { max: 10, unit: "%", isFloat: true }, // 1%~10% (Floats)
  "暴擊": { max: 100, unit: "", isFloat: false }, // 10-100
  "暴擊防護": { max: 100, unit: "", isFloat: false },
  "暴傷": { max: 10, unit: "%", isFloat: true }, // 1%~10%
  "暴傷減免": { max: 10, unit: "%", isFloat: true },

  // Buffs
  "治療加成": { max: 10, unit: "%", isFloat: true },
  "受治療加成": { max: 10, unit: "%", isFloat: true },
  "物傷加成": { max: 10, unit: "%", isFloat: true },
  "物傷減免": { max: 10, unit: "%", isFloat: true },

  // Resists
  "沉默抵抗": { max: 10, unit: "%", isFloat: true },
  "冰凍抵抗": { max: 10, unit: "%", isFloat: true },
  "石化抵抗": { max: 10, unit: "%", isFloat: true },
  "暈眩抵抗": { max: 10, unit: "%", isFloat: true },
  "灼燒抵抗": { max: 10, unit: "%", isFloat: true },
  "中毒抵抗": { max: 10, unit: "%", isFloat: true },
  "定身抵抗": { max: 10, unit: "%", isFloat: true },
  "恐懼抵抗": { max: 10, unit: "%", isFloat: true },
  "詛咒抵抗": { max: 10, unit: "%", isFloat: true },
};

export const generateAttribute = (name: string): EnchantmentAttribute => {
  const config = ATTRIBUTE_CONFIG[name] || { max: 10, unit: "", isFloat: false };
  const level = Math.ceil(Math.random() * 10); // Lv 1-10
  
  let value: number;

  if (config.isFloat) {
    // For float values (e.g. 1.0% - 10.9%)
    // Adjusted logic: Start at 1.0 for Lv 1 (User request: min 1%)
    // Lv 1: 1.0 ~ 1.9
    // ...
    // Lv 10: 10.0 ~ 10.9
    const minVal = level;
    const maxVal = level + 0.9;
    
    // Generate random value within tier
    value = Math.random() * (maxVal - minVal) + minVal;
    
    // Fix: Clamp to max to prevent overflow (e.g. 10.8% when max is 10%)
    if (value > config.max) {
      value = config.max;
    }

    // Round to 1 decimal place
    value = Math.round(value * 10) / 10;
  } else {
    // For integer values (e.g. 1-100)
    // Simply scale: Level 1 -> Max/10. Level 10 -> Max.
    // e.g. Max 100: Lv 1=10, Lv 10=100.
    value = Math.floor(level * (config.max / 10));
  }

  return { name, level, value };
};

export const getAttributeDisplay = (name: string, value: number) => {
  const config = ATTRIBUTE_CONFIG[name] || { max: 10, unit: "", isFloat: false };
  
  // Format Logic:
  // 1. If float, use toFixed(1) to handle precision issues.
  // 2. Then parseFloat -> toString to strip trailing zeros (e.g. "5.0" -> "5").
  // This ensures 5.0% displays as 5% and 5.5% displays as 5.5%
  const displayVal = config.isFloat 
    ? parseFloat(value.toFixed(1)).toString() 
    : value.toString();

  const prefix = value > 0 ? "+" : "";
  return {
    text: `${prefix}${displayVal}${config.unit}`,
    max: config.max
  };
};

interface SpecialAttrRule {
  name: string;
  triggers: [string, string]; // Requires these two base attributes
  levels: string[]; // Descriptions for Lv 1 to 4
}

export const SPECIAL_ATTRIBUTES_RULES: Record<string, SpecialAttrRule> = {
  Blade: {
    name: "利刃",
    triggers: ["裝備攻速", "物傷加成"],
    levels: [
      "近戰物理攻擊增加 2.5%",
      "近戰物理攻擊增加 5%",
      "近戰物理攻擊增加 7.5%",
      "近戰物理攻擊增加 10%"
    ]
  },
  Morale: {
    name: "鬥志",
    triggers: ["力量", "物理攻擊"],
    levels: [
      "忽視物理防禦 5%",
      "忽視物理防禦 10%",
      "忽視物理防禦 15%",
      "忽視物理防禦 20%"
    ]
  },
  Ranged: {
    name: "名弓",
    triggers: ["靈巧", "命中"],
    levels: [
      "遠程物理攻擊增加 2.5%",
      "遠程物理攻擊增加 5%",
      "遠程物理攻擊增加 7.5%",
      "遠程物理攻擊增加 10%"
    ]
  },
  Sharpness: {
    name: "尖銳",
    triggers: ["敏捷", "幸運"],
    levels: [
      "暴擊傷害提升 5%",
      "暴擊傷害提升 10%",
      "暴擊傷害提升 15%",
      "暴擊傷害提升 20%"
    ]
  },
  Magic: {
    name: "魔力",
    triggers: ["智力", "魔法攻擊"],
    levels: [
      "吟唱速度縮短 2.5%",
      "吟唱速度縮短 5%",
      "吟唱速度縮短 7.5%",
      "吟唱速度縮短 10%"
    ]
  },
  Toughness: {
    name: "堅韌",
    triggers: ["暴擊", "物傷減免"],
    levels: [
      "物理傷害減免 2.5%",
      "物理傷害減免 5%",
      "物理傷害減免 7.5%",
      "物理傷害減免 10%"
    ]
  },
  Blessing: {
    name: "神祐",
    triggers: ["體質", "魔法防禦"],
    levels: [
      "魔法傷害減免 2.5%",
      "魔法傷害減免 5%",
      "魔法傷害減免 7.5%",
      "魔法傷害減免 10%"
    ]
  },
  Arcane: {
    name: "奧法",
    triggers: ["魔法上限", "魔法攻擊"],
    levels: [
      "魔法傷害加成 2%",
      "魔法傷害加成 4%",
      "魔法傷害加成 6%",
      "魔法傷害加成 8%"
    ]
  },
  ArmorBreak: {
    name: "破甲",
    triggers: ["力量", "靈巧"],
    levels: [
      "物理穿透 1.5%",
      "物理穿透 3%",
      "物理穿透 4.5%",
      "物理穿透 6%"
    ]
  },
  Insight: {
    name: "洞察",
    triggers: ["魔法上限", "智力"],
    levels: [
      "忽視魔法防禦 5%",
      "忽視魔法防禦 10%",
      "忽視魔法防禦 15%",
      "忽視魔法防禦 20%"
    ]
  },
  Zeal: {
    name: "狂熱",
    triggers: ["裝備攻速", "暴傷"],
    levels: [
      "普攻傷害增加 2.5%",
      "普攻傷害增加 5%",
      "普攻傷害增加 7.5%",
      "普攻傷害增加 10%"
    ]
  },
  IronArmor: {
    name: "鐵甲",
    triggers: ["體質", "暴傷減免"],
    levels: [
      "暴擊防護增加 5%",
      "暴擊防護增加 10%",
      "暴擊防護增加 15%",
      "暴擊防護增加 20%"
    ]
  }
};

// Valid special attributes per slot
export const SLOT_SPECIAL_MAPPING: Record<EnchantmentSlotType, string[]> = {
  weapon: ['Blade', 'Morale', 'Ranged', 'Sharpness', 'Magic', 'Toughness'],
  offhand: ['ArmorBreak', 'Insight'],
  armor: ['Morale', 'Ranged', 'Sharpness', 'Magic'],
  cloak: ['Arcane'],
  boots: ['Arcane', 'Blessing'],
  head: ['Zeal', 'IronArmor']
};