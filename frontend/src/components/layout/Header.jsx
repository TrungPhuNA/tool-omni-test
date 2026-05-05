import React from 'react';
import { Database, ChevronDown, CheckCircle2, Save, Settings } from 'lucide-react';
import useStore from '../../store/useStore';

const Header = ({ 
  activeRequest, 
  setActiveRequest, 
  activeEnvironment, 
  setActiveEnvironment, 
  environments, 
  setIsEnvModalOpen,
  handleSave 
}) => {
  return (
    <header className="h-14 border-b border-dark-800 flex items-center justify-between px-6 bg-dark-900/20">
      <div className="flex items-center gap-4">
        <input 
          type="text" 
          className="bg-transparent border-none outline-none text-sm font-bold text-primary-400 focus:ring-0 w-48"
          value={activeRequest.name || 'Untitled Request'}
          onChange={(e) => setActiveRequest({ name: e.target.value })}
        />
        <div className="w-px h-4 bg-dark-800"></div>
        <div className="relative group/env">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-lg text-sm cursor-pointer hover:border-primary-500/50 transition-all">
            <Database className="w-4 h-4 text-primary-500" />
            <span className="text-dark-200">{activeEnvironment?.name || 'No Environment'}</span>
            <ChevronDown className="w-4 h-4 text-dark-500" />
          </div>
          <div className="absolute top-full left-0 w-48 pt-2 hidden group-hover/env:block z-50">
            <div className="bg-dark-900 border border-dark-800 rounded-xl shadow-2xl p-1 animate-fade-in">
              {environments.map(env => (
                <button 
                  key={env.id}
                  onClick={() => setActiveEnvironment(env)}
                  className={`flex items-center justify-between w-full p-2 rounded-lg text-xs transition-all ${activeEnvironment?.id === env.id ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-800 text-dark-400'}`}
                >
                  {env.name}
                  {activeEnvironment?.id === env.id && <CheckCircle2 className="w-3 h-3" />}
                </button>
              ))}
              <div className="border-t border-dark-800 mt-1 pt-1">
                <button 
                  onClick={() => setIsEnvModalOpen(true)}
                  className="flex items-center gap-2 w-full p-2 rounded-lg text-xs text-primary-500 hover:bg-primary-500/5 transition-all font-medium"
                >
                  <Settings className="w-3.5 h-3.5" /> Quản lý môi trường
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <button onClick={handleSave} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
            <Save className="w-4 h-4" />
            Save
         </button>
      </div>
    </header>
  );
};

export default Header;
