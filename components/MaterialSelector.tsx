import React from 'react';
import { Material, MaterialType } from '../types';
import { Box } from 'lucide-react';

// Aluminum: Dented/Uneven Ball with surface details
const AluminumIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
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
    {/* Main body - Circle */}
    <circle cx="12" cy="12" r="9" />
    
    {/* Surface Details (Craters/Dents) */}
    {/* Large crater top-left */}
    <path d="M9.5 9.5a2.5 2.5 0 1 1-2 2" opacity="0.8" />
    {/* Medium crater bottom-right */}
    <path d="M14.5 14.5a2 2 0 1 0 2 2" opacity="0.8" />
    {/* Small crater top-right */}
    <path d="M16 7a1 1 0 1 0 0 2" opacity="0.6" />
    {/* Texture mark bottom-left */}
    <path d="M6 16c.5.5 1 0 1.5-.5" opacity="0.6" />
  </svg>
);

interface MaterialSelectorProps {
  materials: Material[];
  selectedMaterialId: MaterialType;
  onSelect: (id: MaterialType) => void;
  readOnly?: boolean;
  variant?: 'default' | 'minimal';
}

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  materials,
  selectedMaterialId,
  onSelect,
  readOnly = false,
  variant = 'default',
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex w-full gap-2">
        {materials.map((mat) => {
          const isSelected = selectedMaterialId === mat.id;
          return (
            <div 
              key={mat.id}
              className={`
                flex-1 flex items-center justify-between px-3 py-2 rounded-lg border
                ${isSelected 
                  ? 'bg-slate-800 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                  : 'bg-slate-900/50 border-slate-800 opacity-60'}
              `}
            >
              <div className="flex items-center gap-2">
                <div className={`${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                   {mat.id === 'iron' ? <Box size={18} /> : <AluminumIcon size={18} />}
                </div>
                <span className={`text-xs font-bold ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                  {mat.name}
                </span>
              </div>
              <span className={`text-sm font-mono font-bold ${mat.count === 0 ? 'text-red-500' : isSelected ? 'text-white' : 'text-slate-400'}`}>
                {mat.count}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
      {materials.map((mat) => {
        const isSelected = selectedMaterialId === mat.id;
        const isDimmed = readOnly && !isSelected;
        
        return (
          <button
            key={mat.id}
            onClick={() => !readOnly && onSelect(mat.id)}
            disabled={mat.count <= 0 || (readOnly && !isSelected)}
            className={`
              relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all
              ${mat.count <= 0 ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-900' : ''}
              ${isDimmed ? 'opacity-30 grayscale border-slate-800 bg-slate-900 cursor-default' : ''}
              ${!readOnly && mat.count > 0 ? 'cursor-pointer' : 'cursor-default'}
              ${isSelected && mat.count > 0 && !isDimmed
                ? 'border-blue-500 bg-blue-500/10' 
                : !isDimmed && !isSelected ? 'border-slate-700 bg-slate-800 hover:border-slate-600' : ''}
            `}
          >
            <div className={`p-2 bg-slate-900 rounded-md ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
              {mat.id === 'iron' ? <Box size={28} /> : <AluminumIcon size={28} />}
            </div>
            <div className="text-left flex-1">
              <div className={`font-semibold ${isSelected ? 'text-slate-100' : 'text-slate-500'}`}>{mat.name}</div>
              <div className={`text-sm ${mat.count === 0 ? 'text-red-500' : isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                數量：{mat.count}
              </div>
            </div>
            
            {isSelected && mat.count > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
            {isSelected && readOnly && (
               <div className="absolute bottom-2 right-2 text-[10px] text-blue-400 font-mono bg-blue-900/50 px-1 rounded">
                 綁定
               </div>
            )}
          </button>
        );
      })}
    </div>
  );
};