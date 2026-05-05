import React from 'react';
import { 
  Plus, 
  Folder, 
  Globe, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  LogOut, 
  User as UserIcon, 
  History, 
  Settings,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';

const Sidebar = ({ 
  expandedCollections, 
  toggleCollection, 
  loadRequest, 
  loadScenario, 
  activeRequest, 
  activeScenario, 
  viewMode,
  setIsModalOpen,
  setIsEnvModalOpen
}) => {
  const navigate = useNavigate();
  const { user, logout, collections } = useStore();

  return (
    <aside className="w-72 border-r border-dark-800 flex flex-col bg-dark-900/30 backdrop-blur-sm">
      <div className="p-4 border-b border-dark-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-dark-100">OmniTest</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="p-1.5 hover:bg-dark-800 rounded-md text-dark-400 transition-colors cursor-pointer">
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Collections</span>
          </div>
          <div className="space-y-1">
            {collections.map((col) => (
              <div key={col.id}>
                <div 
                  onClick={() => toggleCollection(col.id)}
                  className="group flex items-center gap-2 p-2 hover:bg-dark-800/50 rounded-lg cursor-pointer transition-all"
                >
                  {expandedCollections[col.id] ? <ChevronDown className="w-4 h-4 text-dark-500" /> : <ChevronRight className="w-4 h-4 text-dark-500" />}
                  <Folder className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-medium text-dark-200">{col.name}</span>
                </div>
                {expandedCollections[col.id] && (
                  <div className="ml-6 space-y-1 border-l border-dark-800 mt-1">
                    {col.requests?.map((req) => (
                      <div 
                        key={req.id}
                        onClick={() => loadRequest(req)}
                        className={`flex items-center gap-2 p-2 hover:bg-dark-800/50 rounded-lg cursor-pointer transition-all ml-2 ${activeRequest.id === req.id ? 'bg-primary-500/10 text-primary-400' : ''}`}
                      >
                        <span className={`text-[10px] font-bold w-8 ${
                          req.method === 'GET' ? 'text-green-500' : 
                          req.method === 'POST' ? 'text-blue-500' : 
                          req.method === 'PUT' ? 'text-yellow-500' : 'text-red-500'
                        }`}>{req.method}</span>
                        <span className="text-sm truncate text-dark-300">{req.name}</span>
                      </div>
                    ))}

                    {col.scenarios?.length > 0 && (
                      <div className="mt-2 ml-2">
                         <span className="text-[9px] uppercase font-bold text-dark-600 ml-2 mb-1 block tracking-widest">Scenarios</span>
                         {col.scenarios.map(sc => (
                          <div 
                            key={sc.id} 
                            onClick={() => loadScenario(sc)}
                            className={`flex items-center gap-2 p-2 hover:bg-dark-800/50 rounded-lg cursor-pointer transition-all ${activeScenario?.id === sc.id && viewMode === 'scenario' ? 'bg-primary-500/10 text-primary-400' : 'text-dark-400 hover:text-primary-400'}`}
                           >
                              <Play className="w-3 h-3" />
                              <span className="text-xs font-medium truncate">{sc.name}</span>
                           </div>
                         ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-2 text-dark-600 hover:text-dark-400 cursor-pointer transition-all ml-2 group">
                      <Plus className="w-3 h-3" />
                      <span className="text-xs font-medium" onClick={() => loadRequest({ id: null, collection_id: col.id, name: 'New Request', method: 'GET' })}>Add Request</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {collections.length === 0 && (
              <div className="text-center py-4 text-dark-600 text-xs italic">No collections yet. Click + to add.</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-dark-800 space-y-2">
        <div className="flex items-center gap-3 px-2 py-3 bg-dark-800/30 rounded-xl border border-dark-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
            <UserIcon className="w-4 h-4 text-primary-400" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-dark-100 truncate">{user?.username}</p>
            <p className="text-[10px] text-dark-500 truncate">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-dark-500 cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <button 
          onClick={() => navigate('/performance')}
          className={`flex items-center gap-3 w-full p-2 rounded-lg text-sm transition-all cursor-pointer ${viewMode === 'loadtest' ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-800 text-dark-400'}`}
        >
          <Zap className="w-4 h-4" />
          Performance
        </button>
        <button 
          onClick={() => navigate('/history')}
          className={`flex items-center gap-3 w-full p-2 rounded-lg text-sm transition-all cursor-pointer ${viewMode === 'history' ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-dark-800 text-dark-400'}`}
        >
          <History className="w-4 h-4" />
          History
        </button>
        <button 
          onClick={() => setIsEnvModalOpen(true)}
          className="flex items-center gap-3 w-full p-2 hover:bg-dark-800 rounded-lg text-sm text-dark-400 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          Environments
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
