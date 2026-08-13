import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-hide mask-image-linear-to-b">
        {logs.length === 0 && (
          <div className="text-slate-600 text-xs italic text-center mt-4">
            紀錄將顯示於此...
          </div>
        )}
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={`text-xs p-1.5 px-2 rounded backdrop-blur-sm animate-fade-in border-l-2
              ${log.type === 'success' ? 'border-emerald-500 bg-emerald-900/20 text-emerald-100' : ''}
              ${log.type === 'fail' ? 'border-red-500 bg-red-900/20 text-red-100' : ''}
              ${log.type === 'warn' ? 'border-amber-500 bg-amber-900/20 text-amber-100' : ''}
              ${log.type === 'info' ? 'border-blue-500 bg-blue-900/20 text-blue-100' : ''}
            `}
          >
            {log.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};