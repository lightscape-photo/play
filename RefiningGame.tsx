import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Equipment, EquipmentType, Material, MaterialType, LogEntry } from './types';
import { MAX_LEVEL, INITIAL_MATERIAL_COUNT, BREAK_CHANCE, getSuccessRate, getMaterialCost, SUCCESS_RATES } from './constants';
import { EquipmentCard } from './components/EquipmentCard';
import { MaterialSelector } from './components/MaterialSelector';
import { RefineSection } from './components/RefineSection';
import { LogViewer } from './components/LogViewer';
import { RotateCcw, Trophy, Shield, Sword, AlertTriangle, X, ChevronLeft, PackagePlus, BookOpen, Info } from 'lucide-react';
import { soundManager } from './utils/SoundManager';

interface RefiningGameProps {
  onBack: () => void;
}

// --- Rate Modal Component ---
interface RateModalProps {
    onClose: () => void;
}

const RateModal: React.FC<RateModalProps> = ({ onClose }) => {
    // Helper to get color based on rate
    const getRateColor = (rate: number) => {
        if (rate === 100) return 'text-emerald-400';
        if (rate >= 80) return 'text-emerald-300';
        if (rate >= 60) return 'text-yellow-400';
        if (rate >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 w-full max-w-sm max-h-[80vh] rounded-2xl border border-amber-500/30 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-amber-500/20 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <BookOpen size={20} className="text-amber-500" />
                        <h2 className="font-bold text-slate-100">精煉成功率一覽</h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                    {SUCCESS_RATES.map((tier, index) => {
                        const startLevel = tier.min + 1; // Target level start
                        const endLevel = tier.max + 1;   // Target level end
                        // If it's the last tier aiming for MAX_LEVEL (e.g., target 15)
                        const label = startLevel === endLevel 
                            ? `${startLevel}` 
                            : `${startLevel} ~ ${endLevel}`;

                        return (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 font-bold text-slate-400 text-xs">
                                        Lv
                                    </div>
                                    <span className="font-bold text-slate-200">{label}</span>
                                </div>
                                <div className={`font-mono font-bold text-lg ${getRateColor(tier.rate)}`}>
                                    {tier.rate}%
                                </div>
                            </div>
                        )
                    })}
                     <div className="mt-4 p-3 bg-amber-900/10 border border-amber-500/20 rounded-lg text-xs text-amber-200/80 leading-relaxed">
                        <div className="flex items-center gap-2 mb-1 font-bold text-amber-500">
                            <Info size={14} /> 提示
                        </div>
                        精煉失敗時，裝備等級將下降 1 級。
                        <br/>
                        若運氣不佳，裝備可能會損壞（需修復才能繼續精煉）。
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RefiningGame: React.FC<RefiningGameProps> = ({ onBack }) => {
  // --- State ---
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: 'sword', name: '武器', level: 0, maxLevel: MAX_LEVEL, status: 'normal' },
    { id: 'armor', name: '防具', level: 0, maxLevel: MAX_LEVEL, status: 'normal' },
  ]);

  const [materials, setMaterials] = useState<Material[]>([
    { id: 'iron', name: '鐵', count: INITIAL_MATERIAL_COUNT },
    { id: 'aluminum', name: '鋁', count: INITIAL_MATERIAL_COUNT },
  ]);

  const [selectedEquipId, setSelectedEquipId] = useState<EquipmentType>('sword');
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [isAutoMode, setIsAutoMode] = useState(false);

  // New state for single item max celebration
  const [justMaxedItem, setJustMaxedItem] = useState<Equipment | null>(null);

  // New state for insufficient material modal
  const [showNoMaterialModal, setShowNoMaterialModal] = useState(false);

  // State for Rate Table
  const [showRateTable, setShowRateTable] = useState(false);

  // --- Helpers ---
  const selectedEquip = useMemo(() => 
    equipment.find(e => e.id === selectedEquipId)!, 
  [equipment, selectedEquipId]);

  // Check for global victory (All items maxed)
  const isGameClear = useMemo(() => equipment.every(e => e.level >= MAX_LEVEL), [equipment]);

  // Derived Logic: Material is bound to Equipment
  // Sword -> Iron, Armor(Shield) -> Aluminum
  const targetMaterialId: MaterialType = selectedEquipId === 'sword' ? 'iron' : 'aluminum';

  const selectedMaterial = useMemo(() => 
    materials.find(m => m.id === targetMaterialId)!, 
  [materials, targetMaterialId]);

  const currentSuccessRate = useMemo(() => 
    getSuccessRate(selectedEquip.level), 
  [selectedEquip.level]);

  // Dynamic Cost Calculation
  const currentCost = useMemo(() => 
    getMaterialCost(selectedEquip.level), 
  [selectedEquip.level]);

  const addLog = (message: string, type: LogEntry['type']) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now(),
    };
    setLogs(prev => [...prev, newLog]);
  };

  // --- Game Actions ---
  
  const handleRepair = useCallback(() => {
    const cost = getMaterialCost(selectedEquip.level);

    if (selectedMaterial.count < cost) {
        addLog(`修復失敗：材料不足 (需要 ${cost} 個)。`, 'fail');
        setShowNoMaterialModal(true);
        return false;
    }

    setIsAnimating(true);
    soundManager.playAnvil(); 

    setTimeout(() => {
        // Deduct materials
        setMaterials(prev => prev.map(m => 
            m.id === targetMaterialId ? { ...m, count: m.count - cost } : m
        ));

        // Repair equipment
        setEquipment(prev => prev.map(e => 
            e.id === selectedEquipId ? { ...e, status: 'normal' } : e
        ));

        addLog(`修復成功！${selectedEquip.name} 已恢復正常 (消耗 ${cost})。`, 'success');
        setIsAnimating(false);
    }, 250); // Very fast repair
    return true;
  }, [selectedEquip, selectedMaterial, selectedEquipId, targetMaterialId]);


  const handleRefine = useCallback(() => {
    if (selectedEquip.level >= MAX_LEVEL) {
      addLog('無法精煉：已達最高等級。', 'info');
      return false;
    }

    const cost = getMaterialCost(selectedEquip.level);

    if (selectedMaterial.count < cost) {
      addLog(`無法精煉：材料不足 (需要 ${cost} 個)。`, 'fail');
      setShowNoMaterialModal(true);
      return false;
    }

    // --- PRE-CALCULATE RESULT ---
    const rate = getSuccessRate(selectedEquip.level);
    const roll = Math.random() * 100;
    const isSuccess = roll < rate;
    
    let resultType: 'success' | 'fail' | 'broken';
    if (isSuccess) {
        resultType = 'success';
    } else {
        const willBreak = Math.random() < BREAK_CHANCE;
        resultType = willBreak ? 'broken' : 'fail';
    }

    setIsAnimating(true);
    
    // Play sound sequence (First hit)
    soundManager.playAnvil();
    setTimeout(() => {
        // Second hit sound
        soundManager.playAnvil();
    }, 150); // Very fast second hit

    // Delay for animation completion
    setTimeout(() => {
      // 1. Deduct Material
      setMaterials(prev => prev.map(m => 
        m.id === targetMaterialId ? { ...m, count: m.count - cost } : m
      ));

      // 2. Apply Result
      let newLevel = selectedEquip.level;

      if (resultType === 'success') {
        soundManager.playSuccess();
        newLevel = selectedEquip.level + 1;
        
        const updatedEquip = { ...selectedEquip, level: newLevel };

        setEquipment(prev => prev.map(e => 
          e.id === selectedEquipId ? updatedEquip : e
        ));
        addLog(`精煉成功！${selectedEquip.name} 提升至 +${newLevel}`, 'success');

        // Logic for Max Level Reached
        if (newLevel >= MAX_LEVEL) {
            setJustMaxedItem(updatedEquip);
            
            setTimeout(() => {
                setJustMaxedItem(null);
                
                // AUTO SWITCH LOGIC (After 5s)
                setEquipment(currentEquipment => {
                    const otherItem = currentEquipment.find(e => e.id !== selectedEquipId);
                    if (otherItem && otherItem.level < MAX_LEVEL) {
                        setSelectedEquipId(otherItem.id);
                    }
                    return currentEquipment;
                });
            }, 5000);
        }

      } else {
        // Fail or Broken
        soundManager.playFail();
        newLevel = Math.max(0, selectedEquip.level - 1);
        
        setEquipment(prev => prev.map(e => 
            e.id === selectedEquipId ? { 
                ...e, 
                level: newLevel,
                status: resultType === 'broken' ? 'broken' : 'normal'
            } : e
        ));

        if (resultType === 'broken') {
            addLog(`精煉失敗！${selectedEquip.name} 損壞且等級下降至 +${newLevel}。`, 'fail');
        } else {
            addLog(`精煉失敗，${selectedEquip.name} 等級下降至 +${newLevel}。`, 'warn');
        }
      }

      setIsAnimating(false);
    }, 500); // Very fast animation duration
    return true;

  }, [selectedEquip, selectedMaterial, selectedEquipId, targetMaterialId]);

  // Main Action Handler (Refine or Repair)
  const handleMainAction = () => {
    if (selectedEquip.status === 'broken') {
        handleRepair();
    } else {
        handleRefine();
    }
  };

  // --- Auto Mode Logic ---
  useEffect(() => {
    setIsAutoMode(false);
  }, [selectedEquipId]);

  useEffect(() => {
    if (!isAutoMode) return;
    if (isAnimating) return; 
    if (justMaxedItem) return; // Pause auto mode if showing celebration

    const autoTimer = setTimeout(() => {
        if (selectedEquip.level >= MAX_LEVEL) {
            setIsAutoMode(false);
            return;
        }

        const cost = getMaterialCost(selectedEquip.level);

        if (selectedEquip.status === 'broken') {
            if (selectedMaterial.count < cost) {
                setIsAutoMode(false);
                addLog('材料不足以修復，自動精煉停止。', 'fail');
                setShowNoMaterialModal(true);
                return;
            }
            handleRepair();
        } else {
            if (selectedMaterial.count < cost) {
                setIsAutoMode(false);
                addLog('材料不足，自動精煉停止。', 'fail');
                setShowNoMaterialModal(true);
                return;
            }
            handleRefine();
        }
    }, 200); // Reduced auto interval

    return () => clearTimeout(autoTimer);
  }, [isAutoMode, isAnimating, justMaxedItem, selectedEquip, selectedMaterial, handleRefine, handleRepair]);


  // 1. [Updated] Refill Function
  // Only refills materials for items that are NOT maxed out.
  // Preserves existing materials for maxed items.
  const handleRefill = () => {
    setIsAutoMode(false);
    setShowNoMaterialModal(false);
    
    setMaterials(prevMaterials => {
        return prevMaterials.map(mat => {
            // Determine which equipment uses this material
            const associatedEquipId = mat.id === 'iron' ? 'sword' : 'armor';
            const associatedEquip = equipment.find(e => e.id === associatedEquipId);

            // If the associated equipment is maxed, preserve the current material count
            if (associatedEquip && associatedEquip.level >= MAX_LEVEL) {
                return mat;
            }

            // Otherwise (not maxed), refill to initial count
            return { ...mat, count: INITIAL_MATERIAL_COUNT };
        });
    });

    addLog('材料已補給，精煉繼續！', 'info');
  };

  // 2. [Simplified] Full Reset (System)
  // Used by "Game Clear" screen to restart the entire game.
  const handleFullReset = () => {
    setIsAutoMode(false);
    setShowNoMaterialModal(false);
    setJustMaxedItem(null);

    setMaterials([
        { id: 'iron', name: '鐵', count: INITIAL_MATERIAL_COUNT },
        { id: 'aluminum', name: '鋁', count: INITIAL_MATERIAL_COUNT },
    ]);

    setEquipment(prev => prev.map(e => ({ ...e, level: 0, status: 'normal' })));
    setLogs([]);
    addLog('遊戲已完全重置。祝你好運！', 'info');
  };

  // 3. [Simplified] Manual Reset (User Triggered)
  // Used by the top-right button.
  const handleManualReset = () => {
    if (!window.confirm("確定要重置所有精煉進度與材料數量嗎？")) return;
    handleFullReset();
  };

  const canAction = selectedEquip.status === 'broken'
    ? selectedMaterial.count >= currentCost
    : selectedEquip.level < MAX_LEVEL && selectedMaterial.count >= currentCost;


  // --- Render ---
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
            
            {/* --- Main Game UI --- */}
            
            {/* 1. Top Bar: Header & Resource Status */}
            <div className="flex-none p-4 pb-2 bg-slate-900/95 z-20 space-y-3">
                 <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onBack}
                            className="p-1.5 -ml-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-xl font-black text-slate-100 uppercase tracking-tighter flex items-center gap-2">
                            <span className="bg-amber-500 w-2 h-6 rounded-sm"></span>
                            <span>精煉大師</span>
                        </h1>
                    </div>
                    
                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowRateTable(true)}
                            className="p-2 bg-slate-800 rounded-full text-amber-500 hover:text-white hover:bg-amber-600 transition-colors border border-amber-500/30"
                            title="成功率表"
                        >
                            <BookOpen size={18} />
                        </button>
                        <button 
                            onClick={handleManualReset} 
                            className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                            title="重置"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                 </div>
                 
                 {/* Compact Resource Bar */}
                 <MaterialSelector 
                    materials={materials}
                    selectedMaterialId={targetMaterialId}
                    onSelect={() => {}} 
                    readOnly={true}
                    variant="minimal"
                 />
            </div>

            {/* 2. Middle Scrollable Area: Cards & Logs */}
            <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-4">
                 {/* Equipment Grid */}
                 <div className="flex-none grid grid-cols-2 gap-3">
                    {equipment.map(e => (
                    <div key={e.id} className="relative group">
                        <EquipmentCard 
                            equipment={e}
                            isSelected={selectedEquipId === e.id}
                            onSelect={setSelectedEquipId}
                            successRate={getSuccessRate(e.level)}
                            isAnimating={isAnimating && selectedEquipId === e.id}
                        />
                    </div>
                    ))}
                 </div>

                 {/* Log Overlay Area */}
                 <div className="flex-1 min-h-0 relative rounded-xl bg-slate-950/30 border border-slate-800/50 p-2 overflow-hidden">
                     <LogViewer logs={logs} />
                 </div>
            </div>

            {/* 3. Bottom Fixed Action Area */}
            <div className="flex-none bg-slate-900 border-t border-slate-800 p-4 pb-6 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <RefineSection 
                    onAction={handleMainAction}
                    toggleAuto={() => setIsAutoMode(!isAutoMode)}
                    onReset={handleRefill} // When stuck, just refill
                    isAutoMode={isAutoMode}
                    canAction={canAction}
                    isAnimating={isAnimating}
                    successRate={currentSuccessRate}
                    currentLevel={selectedEquip.level}
                    isBroken={selectedEquip.status === 'broken'}
                    materialCost={currentCost}
                />
            </div>

            {/* --- Overlays (Absolute Positioning to stay inside container) --- */}

            {/* Success Rate Table Modal */}
            {showRateTable && (
                <RateModal onClose={() => setShowRateTable(false)} />
            )}

            {/* Insufficient Materials Modal */}
            {showNoMaterialModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertTriangle size={24} />
                                <h3 className="text-xl font-bold">材料耗盡</h3>
                            </div>
                            <button 
                               onClick={() => setShowNoMaterialModal(false)}
                               className="text-slate-500 hover:text-slate-300"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <p className="text-slate-300 mb-8 leading-relaxed">
                            您儲存的 
                            <span className="font-bold text-white mx-1">
                                {selectedMaterial.name}
                            </span>
                            已經用完了。<br/>
                            是否補充材料以繼續強化目前的裝備？
                        </p>

                        <button
                            onClick={handleRefill}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            <PackagePlus size={18} />
                            補充材料繼續
                        </button>
                    </div>
                </div>
            )}

            {/* Intermediate Victory Screen (Single Item Maxed) */}
            {justMaxedItem && (
              <div className="absolute inset-0 bg-slate-900 z-50 flex items-center justify-center p-4">
                <div className="max-w-sm w-full bg-slate-900 border border-yellow-500/50 rounded-3xl p-8 flex flex-col items-center text-center animate-in zoom-in duration-300 relative overflow-hidden shadow-[0_0_100px_rgba(234,179,8,0.3)]">
                   <div className="absolute top-0 left-0 h-1 bg-yellow-500 z-50 animate-[width_5s_linear_forwards] w-full origin-left" style={{animationName: 'shrink', animationDuration: '5s', animationTimingFunction: 'linear'}}></div>
                   <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-slate-900 to-slate-900 pointer-events-none"></div>
                   <div className="relative z-10 space-y-6">
                      <h2 className="text-3xl font-black text-yellow-400 drop-shadow-lg tracking-wider uppercase animate-bounce">精煉完成！</h2>
                      <div className="relative inline-block py-8">
                         <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full animate-pulse"></div>
                         <div className="relative text-yellow-500">
                            {justMaxedItem.id === 'sword' ? <Sword size={120} /> : <Shield size={120} />}
                         </div>
                         <div className="absolute -bottom-4 -right-4 bg-yellow-600 text-slate-900 font-black text-xl px-3 py-1 rounded-lg border-2 border-yellow-400 rotate-12 shadow-lg">
                            +15
                         </div>
                      </div>
                      <div>
                          <h3 className="text-2xl font-bold text-slate-200 mb-2">{justMaxedItem.name}</h3>
                          <p className="text-yellow-500/80 font-medium">已精煉到最高等級</p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Final Global Victory Screen */}
            {isGameClear && !justMaxedItem && (
              <div className="absolute inset-0 bg-slate-900 z-50 flex items-center justify-center p-4 overflow-y-auto">
                 <div className="max-w-md w-full bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-yellow-500/30 p-8 flex flex-col items-center text-center animate-in zoom-in duration-700 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full opacity-50 bg-[radial-gradient(circle_at_center,_#334155_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
                    </div>

                    <div className="relative z-10 w-full">
                        <div className="mb-6 inline-flex p-4 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg shadow-amber-500/30 animate-bounce">
                            <Trophy size={64} className="text-white drop-shadow-md" />
                        </div>

                        <div className="space-y-4 mb-8">
                            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 drop-shadow-sm tracking-tight">
                                精煉大師
                            </h1>
                            <p className="text-slate-300 text-sm">武器與防具皆已達到極致境界</p>
                        </div>

                        <div className="flex gap-4 items-center justify-center mb-10">
                            {equipment.map(e => (
                                 <div key={e.id} className="flex flex-col items-center gap-1">
                                     <div className="w-14 h-14 rounded-xl bg-slate-800 border border-yellow-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)] text-yellow-400">
                                         {e.id === 'sword' ? <Sword size={24}/> : <Shield size={24}/>}
                                     </div>
                                     <span className="text-yellow-500 font-black">+15</span>
                                 </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleFullReset}
                            className="w-full py-4 bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 text-white font-black text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={20} />
                            <span>再挑戰一次</span>
                        </button>
                    </div>
                 </div>
              </div>
            )}
    </div>
  );
};