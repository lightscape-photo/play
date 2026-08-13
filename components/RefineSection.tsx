import React from 'react';
import { Anvil, Sparkles, Wrench, Play, Pause, RotateCcw, TrendingUp, AlertCircle, CheckCircle2, ShieldAlert, PackagePlus } from 'lucide-react';

interface RefineSectionProps {
  onAction: () => void;
  toggleAuto: () => void;
  onReset: (skipConfirm?: boolean) => void;
  isAutoMode: boolean;
  canAction: boolean;
  isAnimating: boolean;
  successRate: number;
  currentLevel: number;
  isBroken: boolean;
  materialCost: number;
}

export const RefineSection: React.FC<RefineSectionProps> = ({
  onAction,
  toggleAuto,
  onReset,
  isAutoMode,
  canAction,
  isAnimating,
  successRate,
  currentLevel,
  isBroken,
  materialCost,
}) => {
  const isMaxLevel = currentLevel >= 15;
  const isStuck = !canAction && !isMaxLevel;

  // Visual Helpers
  const getRateColor = () => {
    if (successRate >= 80) return 'text-emerald-400';
    if (successRate >= 60) return 'text-yellow-400';
    if (successRate >= 50) return 'text-orange-400';
    return 'text-red-500';
  };

  const getRateLabel = () => {
    if (successRate === 100) return { text: "必定成功", icon: <CheckCircle2 size={14} />, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
    if (successRate >= 80) return { text: "極高機率", icon: <TrendingUp size={14} />, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    if (successRate >= 60) return { text: "高機率", icon: <TrendingUp size={14} />, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
    if (successRate >= 50) return { text: "運氣挑戰", icon: <AlertCircle size={14} />, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
    return { text: "極度危險", icon: <ShieldAlert size={14} />, color: "bg-red-500/10 text-red-400 border-red-500/20" };
  };

  const rateInfo = getRateLabel();

  return (
    <div className="w-full flex flex-col items-center gap-3">
      
      {/* 1. Status Bar: Rate Bar & Warnings */}
      <div className="w-full px-1">
          {!isBroken && !isMaxLevel && (
            <div className="animate-fade-in mb-2">
                <div className="flex justify-between items-end mb-1.5">
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${rateInfo.color}`}>
                        {rateInfo.icon}
                        {rateInfo.text}
                    </div>
                    <span className={`text-lg font-black leading-none ${getRateColor()}`}>{successRate}%</span>
                </div>
                
                <div className="relative h-2 w-full bg-slate-900 rounded-full border border-slate-700/50 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-700 ease-out relative
                        ${successRate >= 80 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                          successRate >= 60 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                          successRate >= 50 ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
                          'bg-gradient-to-r from-red-600 to-red-500'
                        }`}
                        style={{ width: `${successRate}%` }}
                    ></div>
                    {/* Markers */}
                    <div className="absolute inset-0 flex justify-between px-2 pointer-events-none">
                        {[25, 50, 75].map(tick => <div key={tick} className="h-full w-px bg-slate-900/50" />)}
                    </div>
                </div>
            </div>
          )}

          {/* Broken Warning */}
          {isBroken && (
            <div className="w-full flex items-center justify-between bg-red-950/40 border border-red-500/30 rounded-lg p-2 px-3 text-center animate-in zoom-in duration-300">
                <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                     <Wrench size={16} /> 裝備損壞
                </div>
                <div className="text-xs bg-red-900/40 px-2 py-1 rounded text-red-200">
                    修復消耗: {materialCost}
                </div>
            </div>
          )}
          
          {/* Material Warning */}
          {!canAction && !isBroken && !isMaxLevel && !isStuck && (
            <div className="w-full text-center py-1">
                <p className="text-red-400 text-xs font-bold animate-pulse">材料不足</p>
            </div>
          )}
      </div>

      {/* 2. Action Area */}
      <div className="flex gap-3 items-stretch justify-center w-full h-16">
        
        {/* Stuck State */}
        {isStuck ? (
             <button
                onClick={() => onReset(true)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
             >
                <PackagePlus size={20} />
                <span>補充材料</span>
             </button>
        ) : isMaxLevel ? (
             <div className="flex-1 bg-slate-800/50 border border-yellow-500/20 rounded-2xl flex items-center justify-center gap-2">
                 <Sparkles className="text-yellow-400 animate-spin-slow" size={20} />
                 <span className="text-yellow-500 font-bold">已達上限</span>
             </div>
        ) : (
          /* Normal Buttons */
          <>
            {/* Auto Button (Smaller) */}
            <button
                onClick={toggleAuto}
                disabled={(!canAction && !isAutoMode)}
                className={`
                    w-16 rounded-2xl border-2 transition-all shadow-lg flex items-center justify-center flex-shrink-0
                    ${isAutoMode 
                        ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' 
                        : 'border-slate-700 bg-slate-800 text-slate-400 active:bg-slate-700'
                    }
                    ${!canAction && !isAutoMode ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                {isAutoMode ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>

            {/* Main Action Button (Expands) */}
            <button
                onClick={onAction}
                disabled={!canAction || isAnimating || isAutoMode}
                className={`
                    flex-1 relative overflow-hidden rounded-2xl font-bold tracking-wider shadow-lg transition-all
                    ${(!canAction || isAutoMode)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                    : isBroken
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/20 active:scale-95' 
                        : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-orange-500/20 active:scale-95'
                    }
                `}
            >
                 <div className="relative z-10 flex items-center justify-center gap-3">
                     <div className="flex items-center gap-2">
                        {isAnimating ? (
                             <RotateCcw size={24} className="animate-spin" />
                        ) : isBroken ? (
                             <Wrench size={24} className="fill-current" />
                        ) : (
                             <Anvil size={24} className="fill-current" />
                        )}
                        
                        <span className="text-xl font-bold">
                            {isAnimating ? (isBroken ? '修復...' : '精煉中...') : (isBroken ? '修復' : '精煉')}
                        </span>
                     </div>
                     
                     {/* Cost Indicator - Side Layout (Matching EnchantmentGame) */}
                     {!(!canAction || isAutoMode) && (
                        <div className="flex items-center gap-1.5 text-xs font-normal opacity-80 border-l border-white/20 pl-3">
                            <span>消耗</span>
                            <span className="font-mono font-bold text-lg">{materialCost}</span>
                        </div>
                     )}
                 </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};