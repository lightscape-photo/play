import React, { useState } from 'react';
import { RefiningGame } from './RefiningGame';
import { EnchantmentGame } from './EnchantmentGame';
import { Hammer, Sparkles, Sword } from 'lucide-react';
import { soundManager } from './utils/SoundManager';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'refining' | 'enchanting'>('home');
  const [clickedButton, setClickedButton] = useState<'refining' | 'enchanting' | null>(null);

  const handleNavigation = (target: 'refining' | 'enchanting') => {
    if (clickedButton) return;
    setClickedButton(target);
    
    // Play specific sound based on target
    if (target === 'refining') {
        soundManager.playAnvil();
    } else {
        soundManager.playMagic();
    }

    // Delay navigation to show animation and play sound
    setTimeout(() => {
        setView(target);
        setClickedButton(null);
    }, 500);
  };

  // Desktop/Mobile Wrapper Logic
  const renderContent = () => {
    if (view === 'refining') return <RefiningGame onBack={() => setView('home')} />;
    if (view === 'enchanting') return <EnchantmentGame onBack={() => setView('home')} />;
    
    return (
         // Home Screen UI
         <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 space-y-10 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#0f172a_100%)] z-0"></div>
            
            {/* Title */}
            <div className="relative z-10 text-center space-y-2 animate-in zoom-in duration-500">
                <div className="flex justify-center mb-4">
                    <div className="bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-700">
                        <Sword size={48} className="text-slate-200" />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-slate-100 tracking-tight drop-shadow-lg">冒險者工坊</h1>
                <p className="text-slate-400">請選擇您的目的地</p>
            </div>

            {/* Buttons */}
            <div className="relative z-10 w-full max-w-xs space-y-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <button 
                    onClick={() => handleNavigation('refining')}
                    className={`w-full group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-xl shadow-lg transition-all border border-orange-400/20
                        ${clickedButton === 'refining' 
                            ? 'scale-95 ring-4 ring-orange-500/50 brightness-110' 
                            : 'hover:scale-105 active:scale-95'
                        }
                    `}
                >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        {clickedButton === 'refining' ? (
                            <Hammer className="text-white animate-bounce" size={24} />
                        ) : (
                            <Hammer className="text-white fill-white/20" size={24} />
                        )}
                        <span className="text-xl font-bold text-white tracking-wider">精煉大師</span>
                    </div>
                    {/* Click Flash Effect */}
                    {clickedButton === 'refining' && (
                        <div className="absolute inset-0 bg-white/30 animate-pulse pointer-events-none"></div>
                    )}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                </button>

                <button 
                    onClick={() => handleNavigation('enchanting')}
                    className={`w-full group relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 p-4 rounded-xl shadow-lg transition-all border border-purple-400/20
                        ${clickedButton === 'enchanting' 
                            ? 'scale-95 ring-4 ring-purple-500/50 brightness-110' 
                            : 'hover:scale-105 active:scale-95'
                        }
                    `}
                >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        {clickedButton === 'enchanting' ? (
                            <Sparkles className="text-purple-100 animate-spin" size={24} />
                        ) : (
                            <Sparkles className="text-purple-100" size={24} />
                        )}
                        <span className="text-xl font-bold text-purple-50 tracking-wider">附魔小舖</span>
                    </div>
                    {/* Click Flash Effect */}
                    {clickedButton === 'enchanting' && (
                        <div className="absolute inset-0 bg-white/30 animate-pulse pointer-events-none"></div>
                    )}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                </button>
            </div>
            
            <div className="absolute bottom-6 text-slate-600 text-xs font-mono">
                v1.1.0 Alpha
            </div>
         </div>
    );
  };

  return (
    <div className="w-full h-[100dvh] bg-slate-950 flex items-center justify-center font-sans overflow-hidden">
         {/* 
            Container Constraints:
            1. w-full h-full: Fill screen on mobile.
            2. max-w-[480px] mx-auto: Enforce phone proportions on tablets/landscape mobile.
            3. sm:w-[420px]...: On desktop/large tablet, switch to floating card style.
         */}
         <div className="relative w-full h-full max-w-[480px] mx-auto sm:max-w-none sm:w-[420px] sm:h-[85vh] sm:max-h-[900px] bg-slate-900 flex flex-col overflow-hidden sm:rounded-[2.5rem] sm:border-[8px] sm:border-slate-800 sm:shadow-2xl ring-1 ring-white/5">
            {renderContent()}
         </div>
    </div>
  );
};

export default App;