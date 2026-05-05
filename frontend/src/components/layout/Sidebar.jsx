import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  FolderPlus,
  Globe, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  LogOut, 
  User as UserIcon, 
  History, 
  Settings,
  Zap,
  MoreVertical,
  Trash2,
  FileCode,
  Copy
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
  setIsFolderModalOpen,
  setIsImportModalOpen,
  setIsEnvModalOpen,
  openConfirm,
  showToast
}) => {
  const navigate = useNavigate();
  const { user, logout, collections, createFolder, deleteFolder, moveRequest, deleteRequest, duplicateRequest, deleteCollection } = useStore();
  const [expandedFolders, setExpandedFolders] = useState({});
  const [dragOverId, setDragOverId] = useState(null);

  const toggleFolder = (id) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleImportCurl = (e, collectionId, folderId = null) => {
    e.stopPropagation();
    setIsImportModalOpen(collectionId, folderId);
  };

  const handleDragStart = (e, requestId) => {
    e.dataTransfer.setData('requestId', requestId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e, collectionId, folderId = null) => {
    e.preventDefault();
    setDragOverId(null);
    const requestId = e.dataTransfer.getData('requestId');
    if (requestId) {
      await moveRequest(requestId, collectionId, folderId);
    }
  };

  const handleCreateFolder = async (e, collectionId) => {
    e.stopPropagation();
    setIsFolderModalOpen(collectionId);
  };

  const handleDeleteCollection = (e, col) => {
    e.stopPropagation();
    openConfirm({
      title: 'Xóa Collection',
      message: `Bạn có chắc muốn xóa Collection "${col.name}"? Mọi API và Thư mục bên trong sẽ bị xóa vĩnh viễn.`,
      onConfirm: async () => {
        const success = await deleteCollection(col.id);
        if (success) showToast(`Đã xóa Collection "${col.name}"`);
      },
      type: 'danger'
    });
  };

  const handleDeleteFolder = (e, folder) => {
    e.stopPropagation();
    openConfirm({
      title: 'Xóa Thư mục',
      message: `Bạn có chắc muốn xóa thư mục "${folder.name}"? Các API bên trong sẽ được chuyển ra ngoài.`,
      onConfirm: async () => {
        await deleteFolder(folder.id);
        showToast(`Đã xóa thư mục "${folder.name}"`);
      },
      type: 'danger'
    });
  };

  const handleDeleteRequest = (e, req) => {
    e.stopPropagation();
    openConfirm({
      title: 'Xóa API',
      message: `Bạn có chắc muốn xóa API "${req.name}"?`,
      onConfirm: async () => {
        const success = await deleteRequest(req.id);
        if (success) showToast(`Đã xóa API "${req.name}"`);
      },
      type: 'danger'
    });
  };

  return (
    <aside className="w-72 border-r border-dark-800 flex flex-col bg-dark-900/30 backdrop-blur-sm">
      <div className="p-4 border-b border-dark-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-dark-100">OmniTest</h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="p-1.5 hover:bg-dark-800 rounded-md text-dark-400 transition-colors cursor-pointer" title="Tạo Collection">
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
                  onDragOver={(e) => handleDragOver(e, `col-${col.id}`)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                    dragOverId === `col-${col.id}` ? 'bg-primary-500/20 border-primary-500/50 border shadow-lg scale-[1.02]' : 'hover:bg-dark-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {expandedCollections[col.id] ? <ChevronDown className="w-4 h-4 text-dark-50" /> : <ChevronRight className="w-4 h-4 text-dark-500" />}
                    <Folder className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-medium text-dark-100">{col.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => handleCreateFolder(e, col.id)}
                      className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-primary-400"
                      title="Thêm Folder"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleImportCurl(e, col.id)}
                      className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-blue-500"
                      title="Import từ cURL"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteCollection(e, col)}
                      className="p-1 hover:bg-red-500/10 rounded text-dark-400 hover:text-red-500"
                      title="Xóa Collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        loadRequest({ id: null, collection_id: col.id, name: 'New Request', method: 'GET' });
                      }}
                      className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-green-500"
                      title="Thêm Request"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {expandedCollections[col.id] && (
                  <div className="ml-4 space-y-0.5 border-l border-dark-800/50 mt-1 pl-1">
                    {col.folders?.map(folder => (
                      <div key={folder.id}>
                        <div 
                          onClick={() => toggleFolder(folder.id)}
                          onDragOver={(e) => handleDragOver(e, `folder-${folder.id}`)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, col.id, folder.id)}
                          className={`group flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all ml-1 ${
                            dragOverId === `folder-${folder.id}` ? 'bg-yellow-500/20 border-yellow-500/50 border shadow-lg scale-[1.02]' : 'hover:bg-dark-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {expandedFolders[folder.id] ? <ChevronDown className="w-3.5 h-3.5 text-dark-400" /> : <ChevronRight className="w-3.5 h-3.5 text-dark-500" />}
                            <Folder className="w-3.5 h-3.5 text-yellow-500/70" />
                            <span className="text-xs font-medium text-dark-300">{folder.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={(e) => handleImportCurl(e, col.id, folder.id)}
                              className="p-1 hover:bg-dark-700 rounded text-dark-500 hover:text-blue-500"
                              title="Import từ cURL vào Folder"
                            >
                              <FileCode className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                loadRequest({ id: null, collection_id: col.id, folder_id: folder.id, name: 'New Request', method: 'GET' });
                              }}
                              className="p-1 hover:bg-dark-700 rounded text-dark-500 hover:text-green-500"
                              title="Thêm Request vào Folder"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteFolder(e, folder)}
                              className="p-1 hover:bg-red-500/10 rounded text-dark-500 hover:text-red-500"
                              title="Xóa Thư mục"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        {expandedFolders[folder.id] && (
                          <div className="ml-5 border-l border-dark-800/30 pl-1 min-h-[10px]">
                            {col.requests?.filter(r => r.folder_id === folder.id).map(req => (
                              <div 
                                key={req.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, req.id)}
                                onClick={() => loadRequest(req)}
                                className={`group flex items-center gap-2 p-1.5 hover:bg-dark-800/50 rounded-lg cursor-pointer transition-all ${activeRequest.id === req.id ? 'bg-primary-500/10 text-primary-400' : ''}`}
                              >
                                <span className={`text-[9px] font-bold w-7 ${
                                  req.method === 'GET' ? 'text-green-500' : 
                                  req.method === 'POST' ? 'text-blue-500' : 'text-yellow-500'
                                }`}>{req.method}</span>
                                <span className="text-xs truncate text-dark-400 flex-1">{req.name}</span>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateRequest(req.id);
                                    }}
                                    className="p-1 hover:bg-dark-700 rounded text-dark-500 hover:text-primary-400 transition-all"
                                    title="Nhân bản API"
                                  >
                                    <Copy className="w-2.5 h-2.5" />
                                  </button>
                                  <button 
                                    onClick={(e) => handleDeleteRequest(e, req)}
                                    className="p-1 hover:bg-red-500/10 rounded text-dark-500 hover:text-red-500 transition-all"
                                    title="Xóa API"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {(!col.requests?.filter(r => r.folder_id === folder.id).length) && (
                              <div className="p-1.5 text-[10px] text-dark-600 italic ml-2">Thư mục trống</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {col.requests?.filter(r => !r.folder_id).map((req) => (
                      <div 
                        key={req.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, req.id)}
                        onClick={() => loadRequest(req)}
                        className={`group flex items-center gap-2 p-2 hover:bg-dark-800/50 rounded-lg cursor-pointer transition-all ml-1 ${activeRequest.id === req.id ? 'bg-primary-500/10 text-primary-400' : ''}`}
                      >
                        <span className={`text-[10px] font-bold w-8 ${
                          req.method === 'GET' ? 'text-green-500' : 
                          req.method === 'POST' ? 'text-blue-500' : 'text-yellow-500'
                        }`}>{req.method}</span>
                        <span className="text-sm truncate text-dark-300 flex-1">{req.name}</span>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateRequest(req.id);
                            }}
                            className="p-1 hover:bg-dark-700 rounded text-dark-500 hover:text-primary-400 transition-all"
                            title="Nhân bản API"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteRequest(e, req)}
                            className="p-1 hover:bg-red-500/10 rounded text-dark-500 hover:text-red-500 transition-all"
                            title="Xóa API"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {col.scenarios?.length > 0 && (
                      <div className="mt-2 ml-1">
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
