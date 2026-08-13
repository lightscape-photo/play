import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Sword, Shield, Shirt, Crown, RefreshCw, Zap, Play, Pause, RotateCcw, BookOpen, X, Info } from 'lucide-react';
import { EnchantmentSlotType, EnchantmentState, EnchantmentAttribute, SpecialAttribute } from './types';
import { BASE_ATTRIBUTES, SPECIAL_ATTRIBUTES_RULES, SLOT_SPECIAL_MAPPING, generateAttribute, getAttributeDisplay } from './enchantmentConstants';
import { soundManager } from './utils/SoundManager';

interface EnchantmentGameProps {
  onBack: () => void;
}

// --- Icons & Configuration ---

// Custom Boot Icon (Updated: Facing Left, Rotated 25 degrees)
const BootIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <g transform="rotate(25 12 12)">
        {/* Simple outline of a boot facing left: Back at right, Toe at left */}
        <path d="M19 3 L13 3 L13 13 L8 13 Q5 13 5 16 L5 18 Q5 21 8 21 L19 21 Z" />
    </g>
  </svg>
);

// Custom Cloak Icon (Redrawn based on user reference: Flared split cape/pants style)
const CloakIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* 
        Shape:
        Top: Wavy/Dipped (approx y=5)
        Sides: Flared outwards
        Bottom: Split into two wide legs
        Center: Arched split
    */}
    <path d="M9 5 Q12 7 15 5 Q17 12 21 20 L15 21 Q14 16 13 11 Q12 10 11 11 Q10 16 9 21 L3 20 Q7 12 9 5 Z" />
  </svg>
);

// Centralized UI Configuration for Slots
// Modify icons here, and they will update in both the top selector and the bottom visualizer.
const SLOT_UI_CONFIG: Record<EnchantmentSlotType, { label: string, enLabel: string, Icon: React.ElementType }> = {
    weapon:  { label: '武器', enLabel: 'WEAPON', Icon: Sword },
    offhand: { label: '副手', enLabel: 'OFF-HAND', Icon: Shield },
    armor:   { label: '盔甲', enLabel: 'ARMOR', Icon: Shirt },
    cloak:   { label: '披風', enLabel: 'CLOAK', Icon: CloakIcon }, 
    boots:   { label: '鞋子', enLabel: 'BOOTS', Icon: BootIcon }, // Uses updated BootIcon
    head:    { label: '頭部', enLabel: 'HEADGEAR', Icon: Crown },
};

// --- Sub-Components ---

interface SlotButtonProps {
    id: EnchantmentSlotType; 
    icon: React.ReactNode; 
    label: string; 
    isSelected: boolean; 
    hasData: boolean; 
    onClick: () => void;
}

const SlotButton: React.FC<SlotButtonProps> = ({ 
    id, 
    icon, 
    label, 
    isSelected, 
    hasData, 
    onClick 
}) => {
    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-xl transition-all flex-shrink-0 snap-center select-none
                ${isSelected 
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] scale-105' 
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }
            `}
        >
            <div className={`
                p-2 rounded-full 
                ${isSelected ? 'bg-purple-500 text-white' : 'bg-slate-900 text-slate-600'}
                ${hasData && !isSelected ? 'text-purple-400' : ''}
            `}>
                {icon}
            </div>
            <span className="text-[11px] font-bold tracking-wide">{label}</span>
        </button>
    );
};

interface AttributeRowProps {
    attr: EnchantmentAttribute;
    index: number;
}

const AttributeRow: React.FC<AttributeRowProps> = ({ attr, index }) => {
    const isMax = attr.level === 10;
    const { text, max } = getAttributeDisplay(attr.name, attr.value);
    const percentage = Math.min(100, Math.max(0, (attr.value / max) * 100));

    return (
        <div className={`
            flex items-center gap-3 p-3 rounded-lg border backdrop-blur-sm animate-in zoom-in
            ${isMax 
                ? 'bg-yellow-500/5 border-yellow-500/30 shadow-[inset_0_0_10px_rgba(234,179,8,0.05)]' 
                : 'bg-slate-800/40 border-slate-700/50'
            }
        `} style={{ animationDelay: `${index * 50}ms` }}>
            <div className={`w-20 text-xs font-bold truncate ${isMax ? 'text-yellow-200' : 'text-slate-400'}`}>
                {attr.name}
            </div>
            <div className="flex-1 h-1.5 bg-slate-900/80 rounded-full overflow-hidden relative shadow-inner">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${isMax ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-purple-800 to-purple-500'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="w-16 text-right flex items-center justify-end gap-1">
                <span className={`font-mono text-[12px] font-bold ${isMax ? 'text-yellow-400' : 'text-slate-200'}`}>
                    {text}
                </span>
                {isMax && <Sparkles size={10} className="text-yellow-400 animate-pulse" />}
            </div>
        </div>
    );
};

// --- Visual Preview Component (Option A Implementation) ---
interface EnchantmentVisualizerProps {
    slotId: EnchantmentSlotType;
    hasSpecial: boolean;
    totalLevel: number;
}

const EnchantmentVisualizer: React.FC<EnchantmentVisualizerProps> = ({ slotId, hasSpecial, totalLevel }) => {
    // 1. Get Icon from Central Config
    const { Icon } = SLOT_UI_CONFIG[slotId];

    // 2. Determine Tier for Visual Effects
    // Max totalLevel is 40 (4 attrs * Lv10)
    let tier = 'normal';
    if (hasSpecial) tier = 'special';
    else if (totalLevel >= 32) tier = 'legendary'; // Avg Lv 8
    else if (totalLevel >= 24) tier = 'epic';      // Avg Lv 6
    else if (totalLevel >= 16) tier = 'rare';      // Avg Lv 4

    // 3. Define Styles based on Tier
    const getStyles = () => {
        switch(tier) {
            case 'special': return {
                iconColor: 'text-purple-100',
                dropShadow: 'drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]',
                bgGradient: 'bg-[radial-gradient(circle,_rgba(147,51,234,0.3)_0%,_transparent_70%)]',
                border: 'border-purple-500/30',
                particleColor: 'text-purple-400'
            };
            case 'legendary': return {
                iconColor: 'text-yellow-100',
                dropShadow: 'drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]',
                bgGradient: 'bg-[radial-gradient(circle,_rgba(234,179,8,0.2)_0%,_transparent_70%)]',
                border: 'border-yellow-500/30',
                particleColor: 'text-yellow-400'
            };
            case 'epic': return {
                iconColor: 'text-cyan-100',
                dropShadow: 'drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]',
                bgGradient: 'bg-[radial-gradient(circle,_rgba(6,182,212,0.2)_0%,_transparent_70%)]',
                border: 'border-cyan-500/30',
                particleColor: 'text-cyan-400'
            };
            case 'rare': return {
                iconColor: 'text-blue-200',
                dropShadow: 'drop-shadow-[0_0_5px_rgba(59,130,246,0.4)]',
                bgGradient: 'bg-[radial-gradient(circle,_rgba(59,130,246,0.1)_0%,_transparent_70%)]',
                border: 'border-blue-500/20',
                particleColor: 'text-blue-400'
            };
            default: return {
                iconColor: 'text-slate-600',
                dropShadow: '',
                bgGradient: '',
                border: 'border-slate-800',
                particleColor: 'hidden'
            };
        }
    };

    const styles = getStyles();

    return (
        <div className={`relative w-full h-full flex flex-col items-center justify-center rounded-xl overflow-hidden border transition-all duration-500 bg-slate-900/50 ${styles.border}`}>
            {/* Background Aura */}
            <div className={`absolute inset-0 ${styles.bgGradient} transition-all duration-700`} />
            
            {/* Rotating Back Effect for Special */}
            {tier === 'special' && (
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(168,85,247,0.3)_360deg)] animate-[spin_4s_linear_infinite] opacity-50" />
            )}

            {/* Particles */}
            {(tier === 'special' || tier === 'legendary') && (
                 <>
                   <Sparkles size={14} className={`absolute top-3 left-3 ${styles.particleColor} animate-pulse`} />
                   <Sparkles size={10} className={`absolute bottom-3 right-3 ${styles.particleColor} animate-bounce`} style={{ animationDuration: '2s' }} />
                 </>
            )}

            {/* Main Icon - Rendered from Config */}
            <div className={`relative z-10 p-4 transition-all duration-500 ${tier === 'special' ? 'scale-110' : 'scale-100'}`}>
                <Icon size={72} strokeWidth={1.5} className={`${styles.iconColor} ${styles.dropShadow} transition-all duration-500`} />
            </div>

            {/* Tier Label */}
            {tier !== 'normal' && (
                <div className={`absolute bottom-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-950/50 backdrop-blur-sm border ${styles.border} ${styles.particleColor}`}>
                    {tier}
                </div>
            )}
        </div>
    );
};


// --- Codex Modal Component ---
interface CodexModalProps {
    slotId: EnchantmentSlotType;
    onClose: () => void;
}

const CodexModal: React.FC<CodexModalProps> = ({ slotId, onClose }) => {
    const specialKeys = SLOT_SPECIAL_MAPPING[slotId] || [];
    const slotLabel = SLOT_UI_CONFIG[slotId].label;

    // Helper to format range string
    const formatCodexRange = (lv1: string, lv4: string) => {
        const regex = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/;
        const m1 = lv1.match(regex);
        const m4 = lv4.match(regex);

        if (m1 && m4 && m1[1] === m4[1]) {
             return `${m1[1]}${m1[2]}${m1[3]}~${m4[2]}${m4[3]}`;
        }
        return lv4;
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 w-full max-w-sm max-h-[80vh] rounded-2xl border border-purple-500/30 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <BookOpen size={20} className="text-purple-400" />
                        <h2 className="font-bold text-slate-100">{slotLabel}附魔圖鑑</h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {specialKeys.length === 0 ? (
                        <div className="text-center text-slate-500 py-8 text-sm">此部位暫無特殊共鳴詞條</div>
                    ) : (
                        specialKeys.map(key => {
                            const rule = SPECIAL_ATTRIBUTES_RULES[key];
                            return (
                                <div key={key} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                                    {/* Card Header */}
                                    <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700/50">
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-yellow-400 fill-current" />
                                            <span className="font-bold text-slate-200">{rule.name}</span>
                                        </div>
                                        <div className="text-[10px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                                            Lv.1 - 4
                                        </div>
                                    </div>

                                    <div className="p-3 space-y-3">
                                        {/* Description */}
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                            {formatCodexRange(rule.levels[0], rule.levels[3])}
                                        </p>

                                        {/* Recipe */}
                                        <div className="bg-slate-900/80 rounded-lg p-2.5">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Info size={12} className="text-purple-400" />
                                                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">附魔組合</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-xs font-mono font-medium text-slate-300">
                                                <span className="bg-slate-800 border border-slate-600 px-2 py-1 rounded">
                                                    {rule.triggers[0]}
                                                </span>
                                                <span className="text-slate-600">+</span>
                                                <span className="bg-slate-800 border border-slate-600 px-2 py-1 rounded">
                                                    {rule.triggers[1]}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

const COST_PER_ROLL = 4; // Magic Dust Cost

export const EnchantmentGame: React.FC<EnchantmentGameProps> = ({ onBack }) => {
  // --- State ---
  const [currency, setCurrency] = useState(5000);
  const [selectedSlotId, setSelectedSlotId] = useState<EnchantmentSlotType>('weapon');
  const [isRolling, setIsRolling] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false); 
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showCodex, setShowCodex] = useState(false);

  // Data for each slot (Persisted in state during session)
  const [slots, setSlots] = useState<Record<EnchantmentSlotType, EnchantmentState | null>>({
    weapon: null,
    offhand: null,
    armor: null,
    cloak: null,
    boots: null,
    head: null,
  });

  // --- Scroll Drag Logic ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false); 
  
  const dragData = useRef({
      startX: 0,
      startScrollLeft: 0,
      isMoved: false 
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragData.current = {
        startX: e.pageX,
        startScrollLeft: scrollRef.current.scrollLeft,
        isMoved: false
    };
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    if (Math.abs(x - dragData.current.startX) > 5) {
        dragData.current.isMoved = true;
    }
    const walk = (x - dragData.current.startX) * 2; 
    scrollRef.current.scrollLeft = dragData.current.startScrollLeft - walk;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragData.current.isMoved) {
        e.stopPropagation();
        e.preventDefault();
    }
  };

  // --- Helpers ---

  const currentEnchantment = slots[selectedSlotId];
  
  // Calculate Total Level for Visualization
  const totalLevel = useMemo(() => {
    if (!currentEnchantment) return 0;
    return currentEnchantment.baseAttributes.reduce((acc, curr) => acc + curr.level, 0);
  }, [currentEnchantment]);


  const handleSlotSelect = (id: EnchantmentSlotType) => {
    if (isRolling) return;
    setIsAutoMode(false); 
    setIsAutoPaused(false);
    setSelectedSlotId(id);
    setShowCodex(false); 
  };

  const handleReset = () => {
    if (!window.confirm("確定要重置所有附魔進度與魔塵數量嗎？")) return;
    setIsAutoMode(false);
    setIsAutoPaused(false);
    setCurrency(5000);
    setSlots({
        weapon: null,
        offhand: null,
        armor: null,
        cloak: null,
        boots: null,
        head: null,
    });
  };

  const generateEnchantment = (): EnchantmentState => {
    const shuffled = [...BASE_ATTRIBUTES].sort(() => 0.5 - Math.random());
    const pickedBaseNames = shuffled.slice(0, 4);
    const baseAttributes: EnchantmentAttribute[] = pickedBaseNames.map(name => generateAttribute(name));

    const allowedSpecialKeys = SLOT_SPECIAL_MAPPING[selectedSlotId];
    let triggeredSpecial: SpecialAttribute | null = null;
    const baseAttrNames = new Set(baseAttributes.map(a => a.name));

    for (const key of allowedSpecialKeys) {
        const rule = SPECIAL_ATTRIBUTES_RULES[key];
        const hasTriggers = rule.triggers.every(t => baseAttrNames.has(t));
        
        if (hasTriggers) {
            const level = Math.ceil(Math.random() * 4); // Lv 1-4
            triggeredSpecial = {
                key,
                name: rule.name,
                level,
                description: rule.levels[level - 1]
            };
            break; 
        }
    }

    return {
        baseAttributes,
        specialAttribute: triggeredSpecial
    };
  };

  const handleEnchant = () => {
    if (currency < COST_PER_ROLL) {
        setIsAutoMode(false);
        setIsAutoPaused(false);
        return;
    }
    
    setIsRolling(true);
    soundManager.playMagic();
    setCurrency(prev => prev - COST_PER_ROLL);

    setTimeout(() => {
        const newEnchantment = generateEnchantment();
        setSlots(prev => ({
            ...prev,
            [selectedSlotId]: newEnchantment
        }));
        
        if (newEnchantment.specialAttribute) {
            soundManager.playSuccess();
        }

        setFlash(true);
        setIsRolling(false);
        setTimeout(() => setFlash(false), 300);

    }, 500); 
  };

  // --- Auto Mode Logic ---
  const toggleAutoMode = () => {
    if (isAutoMode) {
        if (isAutoPaused) {
            handleEnchant();
            setIsAutoPaused(false);
        } else {
            setIsAutoMode(false);
            setIsAutoPaused(false);
        }
    } else {
        setIsAutoMode(true);
        setIsAutoPaused(false);
    }
  };

  useEffect(() => {
    if (!isAutoMode) return;
    if (isAutoPaused) return; 
    if (isRolling) return; 

    if (currentEnchantment?.specialAttribute) {
        setIsAutoPaused(true);
        return;
    }

    if (currency < COST_PER_ROLL) {
        setIsAutoMode(false);
        return;
    }

    const timer = setTimeout(() => {
        handleEnchant();
    }, 200); 

    return () => clearTimeout(timer);
  }, [isAutoMode, isAutoPaused, isRolling, currentEnchantment, currency, selectedSlotId]);


  // --- Render ---

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col relative overflow-hidden">
        {/* Background FX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_#3b0764_0%,_#020617_80%)] z-0 pointer-events-none"></div>
        
        {/* Header */}
        <div className="flex-none p-4 pb-2 bg-slate-900/80 backdrop-blur-md flex items-center justify-between border-b border-purple-500/20 z-20">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onBack} 
                    className="p-1.5 -ml-1 rounded-full text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="text-purple-500" size={20} />
                    附魔小舖
                </h1>
            </div>
            
            <div className="flex-none flex items-center gap-2">
                <button 
                    onClick={() => setShowCodex(true)}
                    className="p-2 bg-slate-800 rounded-full text-purple-400 hover:text-white hover:bg-purple-600 transition-colors border border-purple-500/30"
                    title="附魔圖鑑"
                >
                    <BookOpen size={18} />
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-purple-500/30">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 shadow-sm animate-pulse"></div>
                    <span className="text-xs font-mono font-bold text-purple-200">{currency}</span>
                </div>
                <button 
                    onClick={handleReset} 
                    className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    title="重置"
                >
                    <RotateCcw size={18} />
                </button>
            </div>
        </div>

        {/* Slot Selector (Looping through SLOT_UI_CONFIG) */}
        <div className="flex-none w-full z-10 border-b border-white/5 relative">
            <div 
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onClickCapture={handleClickCapture}
                className={`flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide snap-x snap-mandatory [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] ${isDragging ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
            >
                {(Object.entries(SLOT_UI_CONFIG) as [EnchantmentSlotType, typeof SLOT_UI_CONFIG[EnchantmentSlotType]][]).map(([id, config]) => (
                    <SlotButton 
                        key={id}
                        id={id} 
                        label={config.label} 
                        icon={<config.Icon size={20} />} 
                        isSelected={selectedSlotId === id} 
                        hasData={!!slots[id]} 
                        onClick={() => handleSlotSelect(id)} 
                    />
                ))}
                
                <div className="w-2 flex-shrink-0"></div>
            </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 px-4 py-2 flex flex-col gap-4 overflow-y-auto relative z-10">
            
            {/* The Enchantment Card - Adjusted to fill space */}
            <div className="relative flex-1 flex flex-col min-h-[400px]"> 
                {currentEnchantment?.specialAttribute && (
                    <div className="absolute inset-0 bg-purple-600/20 blur-2xl rounded-3xl animate-pulse"></div>
                )}
                
                <div className={`
                    relative w-full rounded-2xl border bg-slate-900/80 p-5 flex-1 flex flex-col transition-all duration-300
                    ${flash ? 'scale-[1.02] border-white shadow-[0_0_50px_rgba(255,255,255,0.3)]' : 'border-slate-800 shadow-xl'}
                    ${currentEnchantment?.specialAttribute ? 'border-purple-500/50' : ''}
                `}>
                    
                    {!currentEnchantment && !isRolling && (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
                            <Sparkles size={48} strokeWidth={1} />
                            <p className="text-sm">尚未附魔</p>
                        </div>
                    )}

                    {isRolling && (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
                                <RefreshCw size={48} className="text-purple-400 animate-spin" />
                            </div>
                            <p className="text-sm text-purple-300 animate-pulse font-mono">
                                正在注入魔力...
                            </p>
                        </div>
                    )}

                    {currentEnchantment && !isRolling && (
                        <>
                            <div className="text-xs text-center text-slate-500 font-mono mb-1 uppercase tracking-widest border-b border-slate-800 pb-2 flex-none">
                                {SLOT_UI_CONFIG[selectedSlotId].enLabel}
                            </div>

                            <div className="space-y-2 flex-none mt-4">
                                {currentEnchantment.baseAttributes.map((attr, idx) => (
                                    <AttributeRow key={idx} attr={attr} index={idx} />
                                ))}
                            </div>

                            <div className="h-px w-full bg-slate-800 my-4 flex-none"></div>

                            {/* Section to fill empty space: Visual Preview (Left) & Special Card (Right) */}
                            <div className="flex-1 flex items-stretch gap-2 min-h-[110px] mt-auto">

                                {/* 1. Equipment Visualizer (Left, Compact) */}
                                <div className="flex-1 flex flex-col items-center justify-center">
                                     <EnchantmentVisualizer 
                                        slotId={selectedSlotId} 
                                        hasSpecial={!!currentEnchantment.specialAttribute} 
                                        totalLevel={totalLevel}
                                     />
                                </div>
                                
                                {/* 2. Special Attribute Section (Right, takes more space) */}
                                <div className="flex-[1.8] flex flex-col justify-center">
                                    {currentEnchantment.specialAttribute ? (
                                        <div className="w-full h-full animate-in slide-in-from-right-4 duration-500">
                                            <div className="h-full relative group p-[1px] rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                                                {/* Reduced padding to fit compact space */}
                                                <div className="h-full bg-slate-900 rounded-xl px-3 py-3 flex flex-col items-center justify-center text-center gap-1 relative overflow-hidden">
                                                    
                                                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/20 blur-xl rounded-full -mr-10 -mt-10"></div>
                                                    
                                                    <div className="flex flex-wrap justify-center items-center gap-2 mb-1 z-10">
                                                        <Zap size={18} className="text-pink-400 fill-current" />
                                                        <span className="text-xl font-black bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent whitespace-nowrap">
                                                            {currentEnchantment.specialAttribute.name}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded text-xs bg-purple-900 text-purple-200 border border-purple-500/30 whitespace-nowrap">
                                                            Lv.{currentEnchantment.specialAttribute.level}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-sm text-slate-300 leading-snug font-medium z-10 line-clamp-2">
                                                        {currentEnchantment.specialAttribute.description}
                                                    </p>

                                                    <div className="mt-2 w-full flex flex-wrap justify-center gap-2 opacity-60 z-10">
                                                        {SPECIAL_ATTRIBUTES_RULES[currentEnchantment.specialAttribute.key].triggers.map(t => (
                                                            <span key={t} className="text-[10px] px-2 py-0.5 border border-slate-600 rounded-full text-slate-400 bg-slate-900/50">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full rounded-xl border border-dashed border-slate-800 flex items-center justify-center bg-slate-900/50">
                                            <div className="text-xs text-slate-700 italic flex flex-col items-center gap-1">
                                                <Info size={16} />
                                                <span>無特殊附魔</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </>
                    )}
                </div>
            </div>
            
        </div>

        {/* Footer Actions */}
        <div className="flex-none p-4 pb-8 bg-slate-900 border-t border-slate-800 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex gap-3 items-stretch justify-center w-full h-16">
                <button
                    onClick={toggleAutoMode}
                    disabled={currency < COST_PER_ROLL && !isAutoMode}
                    className={`
                        w-16 rounded-2xl border-2 transition-all shadow-lg flex items-center justify-center flex-shrink-0
                        ${isAutoMode
                            ? (isAutoPaused 
                                ? 'border-amber-500 bg-amber-500/10 text-amber-500' 
                                : 'border-red-500 bg-red-500/10 text-red-500 animate-pulse') 
                            : 'border-slate-700 bg-slate-800 text-slate-400 active:bg-slate-700' 
                        }
                        ${currency < COST_PER_ROLL && !isAutoMode ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {isAutoMode ? (
                        isAutoPaused ? <Play size={24} fill="currentColor" className="ml-1 animate-pulse" /> : <Pause size={24} fill="currentColor" />
                    ) : (
                        <Play size={24} fill="currentColor" className="ml-1" />
                    )}
                </button>

                <button
                    onClick={handleEnchant}
                    disabled={isRolling || (isAutoMode && !isAutoPaused) || currency < COST_PER_ROLL}
                    className={`
                        flex-1 relative overflow-hidden rounded-2xl font-bold text-lg tracking-widest shadow-lg transition-all
                        ${(isRolling || (isAutoMode && !isAutoPaused))
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-95 shadow-purple-900/30'
                        }
                        ${currency < COST_PER_ROLL ? 'opacity-50 grayscale' : ''}
                    `}
                >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2">
                            {isRolling ? (
                                <RefreshCw className="animate-spin" size={24} />
                            ) : (
                                <Sparkles className={currency >= COST_PER_ROLL ? "animate-pulse" : ""} size={24} />
                            )}
                            <span className="text-xl">{isRolling ? '詠唱中...' : '附魔'}</span>
                        </div>
                        {!isRolling && (
                             <div className="flex items-center gap-1.5 text-xs font-normal opacity-80 border-l border-white/20 pl-3">
                                <span>消耗</span>
                                <span className="font-mono font-bold text-lg">{COST_PER_ROLL}</span>
                            </div>
                        )}
                    </div>
                    {(!isRolling && !isAutoMode) && (
                        <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>
                    )}
                </button>
            </div>
        </div>

        {/* Overlays */}
        {showCodex && <CodexModal slotId={selectedSlotId} onClose={() => setShowCodex(false)} />}
    </div>
  );
};