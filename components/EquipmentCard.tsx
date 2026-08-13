import React from 'react';
import { Equipment } from '../types';
import { Sword, Shield, AlertTriangle, Lock, ArrowRight, Activity, Hammer } from 'lucide-react';
import { MAX_LEVEL } from '../constants';

interface EquipmentCardProps {
  equipment: Equipment;
  isSelected: boolean;
  onSelect: (id: Equipment['id']) => void;
  successRate: number;
  isAnimating?: boolean;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  isSelected,
  onSelect,
  successRate,
  isAnimating = false,
}) => {
  const isMaxed = equipment.level >= MAX_LEVEL;
  const isBroken = equipment.status === 'broken';

  // Visual variants based on level and status
  const getGlowColor = () => {
    if (isMaxed) return 'border-yellow-500/50 bg-yellow-900/10 opacity-70'; // Maxed & Locked
    if (isBroken) return 'shadow-[0_0_20px_rgba(239,68,68,0.6)] border-red-500 bg-red-950/30'; // Red for broken
    
    // Selected: Emerald (Green)
    if (isSelected) return 'border-emerald-500 ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]';

    // Passive glows for non-selected items
    if (equipment.level >= 10) return 'shadow-[0_0_10px_rgba(168,85,247,0.3)] border-purple-500/50'; // Purple dim
    if (equipment.level >= 7) return 'shadow-[0_0_10px_rgba(59,130,246,0.3)] border-blue-500/50'; // Blue dim
    
    return 'border-slate-800';
  };

  return (
    <button
      onClick={() => !isMaxed && onSelect(equipment.id)}
      disabled={isMaxed}
      className={`relative w-full p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 bg-slate-800/80 
        ${getGlowColor()}
        ${isSelected ? 'scale-[1.02] z-10' : isMaxed ? 'cursor-not-allowed grayscale-[0.5]' : 'opacity-60 hover:opacity-100 hover:bg-slate-750'}
      `}
    >
      {/* Status Icons in Top Right */}
      {isMaxed && (
        <div className="absolute top-2 right-2 text-yellow-500 bg-yellow-900/50 rounded-full p-1 border border-yellow-500/50 z-20">
          <Lock size={14} />
        </div>
      )}

      {isBroken && !isMaxed && (
        <div className="absolute top-2 right-2 text-red-500 animate-pulse z-20">
          <AlertTriangle size={18} />
        </div>
      )}
      
      {/* Icon Area */}
      <div className={`p-4 rounded-full bg-slate-900 shadow-inner mt-2 ${
        isBroken ? 'text-red-500' : isMaxed ? 'text-yellow-500' : isSelected ? 'text-emerald-400' : 'text-slate-400'
      }`}>
        {equipment.id === 'sword' ? <Sword size={32} /> : <Shield size={32} />}
      </div>

      {/* Main Info: Current Level */}
      <div className="text-center w-full">
        <h3 className={`text-base font-bold ${isBroken ? 'text-red-400' : isMaxed ? 'text-yellow-500/80' : 'text-slate-200'}`}>
            {equipment.name}
        </h3>
        <div className={`text-3xl font-black mt-1 ${isBroken ? 'text-red-600' : isMaxed ? 'text-yellow-500' : 'bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent'}`}>
           +{equipment.level}
        </div>
      </div>

      {/* Detailed Stats Row */}
      {!isMaxed && (
        <div className="w-full mt-2 pt-2 border-t border-slate-700/50 flex flex-col gap-1.5">
            {/* Status Row */}
            <div className="flex justify-between items-center text-xs">
               <span className="text-slate-500 flex items-center gap-1">
                 <Activity size={12} /> 狀態
               </span>
               <span className={`font-bold ${isBroken ? 'text-red-400' : 'text-emerald-400'}`}>
                 {isBroken ? '損壞 (需修復)' : isMaxed ? '完美' : '正常'}
               </span>
            </div>

            {/* Success Rate Row with Level Transition */}
            <div className="flex justify-between items-center text-xs">
                {/* Level Transition: +0 -> +1 */}
                <span className="text-slate-400 font-mono font-semibold flex items-center bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-700/50">
                    +{equipment.level} <ArrowRight size={12} className="mx-1 text-slate-500" /> +{equipment.level + 1}
                </span>

                {/* Success Rate */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-[10px] hidden sm:inline">成功率</span>
                  <span className={`font-bold ${
                      successRate >= 80 ? 'text-emerald-400' : 
                      successRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                      {successRate}%
                  </span>
                </div>
            </div>
        </div>
      )}

      {/* Max Level Message */}
      {isMaxed && (
        <div className="w-full mt-2 pt-2 border-t border-yellow-500/30">
            <div className="text-center text-xs font-bold text-yellow-500 tracking-wider drop-shadow-sm">
                已達到精煉最高等級
            </div>
        </div>
      )}

      {/* Animation Overlay - Z-index 30. Placed here to be under the Badge (Z-50) */}
      {isAnimating && (
        <div className="absolute inset-0 z-30 rounded-xl overflow-hidden pointer-events-none ring-4 ring-orange-500/50 ring-inset shadow-[inset_0_0_30px_rgba(249,115,22,0.6)]">
            {/* Rapid flashing background - Orange/Red Aura */}
            <div className="absolute inset-0 bg-orange-600/30 animate-pulse duration-100" />
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/40 via-orange-500/20 to-transparent mix-blend-screen animate-pulse" />
            
            {/* Top-Left Animation Group */}
            <div className="absolute top-2 left-2 z-40">
                <div className="relative p-2">
                      {/* Impact/Glow behind hammer */}
                      <div className="absolute top-1 left-1 w-8 h-8 bg-yellow-200/80 rounded-full animate-ping" />
                      
                      {/* Hammer Swing/Impact - Using animate-bounce-fast */}
                      <Hammer className="relative z-10 text-orange-100 rotate-[-15deg] animate-bounce-fast drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" size={36} fill="currentColor" />
                </div>
            </div>
        </div>
      )}

      {/* Badge - Z-index 50. Will appear ON TOP of the animation overlay */}
      {isSelected && (
        <div className="absolute -bottom-3 bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-full shadow-lg z-50 font-bold tracking-wide">
          SELECTED
        </div>
      )}
    </button>
  );
};