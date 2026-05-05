import React from 'react';
import { X, Plus } from 'lucide-react';
import useStore from '../../store/useStore';

const TabBar = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab } = useStore();

  const getMethodColor = (method) => {
    const colors = {
      GET: 'text-green-500',
      POST: 'text-blue-500',
      PUT: 'text-yellow-500',
      PATCH: 'text-orange-500',
      DELETE: 'text-red-500'
    };
    return colors[method] || 'text-gray-400';
  };

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center bg-dark-950 border-b border-dark-800 h-11 px-2 gap-0.5 overflow-x-auto no-scrollbar scroll-smooth shadow-inner shadow-black/20">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`group flex items-center gap-2 px-4 py-2 min-w-[140px] max-w-[220px] cursor-pointer rounded-t-xl transition-all relative border-r border-dark-800/50 ${
            activeTabId === tab.id
              ? 'bg-dark-900 text-dark-100 shadow-[0_-2px_10px_rgba(0,0,0,0.3)] z-10'
              : 'bg-dark-950/50 text-dark-500 hover:bg-dark-900/40 hover:text-dark-300'
          }`}
        >
          {/* Active Indicator Line */}
          {activeTabId === tab.id && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
          )}

          <span className={`text-[10px] font-black w-9 shrink-0 tracking-tighter ${getMethodColor(tab.request.method)}`}>
            {tab.request.method}
          </span>
          <span className="text-xs truncate flex-1 font-semibold tracking-tight">
            {tab.name}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className={`p-1 rounded-lg hover:bg-dark-800 hover:text-red-400 transition-all ${
              activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <button
        onClick={() => addTab()}
        className="p-2 ml-2 text-dark-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all border border-transparent hover:border-primary-500/20"
        title="New Request (Ctrl+T)"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TabBar;
