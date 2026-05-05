import React from 'react';
import { Clock, Cpu, Copy } from 'lucide-react';

const ResponsePanel = ({ response, isLoading }) => {
  return (
    <section className="w-[450px] border-l border-dark-800 bg-dark-900/30 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-dark-800 flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Response</span>
        {response && (
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${response.statusCode < 400 ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></div>
              <span className="font-bold text-dark-200">{response.statusCode} {response.statusText}</span>
            </div>
            <div className="flex items-center gap-1.5 text-dark-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{response.responseTime} ms</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
        {!response ? (
          <div className="flex-1 flex flex-col items-center justify-center text-dark-600 gap-4 opacity-50">
            <div className="p-6 bg-dark-800 rounded-full">
              <Cpu className="w-12 h-12" />
            </div>
            <p className="text-sm font-medium">Click "Send" to execute request</p>
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col glass-card p-4 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                 <span className="text-xs font-semibold text-dark-400">Body</span>
                 <button className="p-1 hover:bg-dark-800 rounded text-dark-500 transition-colors">
                    <Copy className="w-4 h-4" />
                 </button>
              </div>
              <pre className="flex-1 overflow-auto text-[13px] font-mono leading-relaxed text-dark-200 custom-scrollbar">
                {JSON.stringify(response.body, null, 2)}
              </pre>
            </div>
            
            <div className="h-48 glass-card p-4 overflow-hidden animate-fade-in">
              <span className="text-xs font-semibold text-dark-400 block mb-3">Headers</span>
              <div className="space-y-1.5 overflow-y-auto h-full text-[11px] font-mono custom-scrollbar">
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="flex border-b border-dark-800/50 pb-1 last:border-0">
                    <span className="text-primary-400 w-24 shrink-0">{k}:</span>
                    <span className="text-dark-400 truncate">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ResponsePanel;
