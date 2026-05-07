import React, { useState, useMemo } from 'react';
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
    Copy,
    FileJson,
    FileText,
    Share2,
    Search,
    X,
    Download,
    Upload,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import ExportDocModal from '../features/builder/ExportDocModal';
import ShareModal from '../features/builder/ShareModal';

// Recursive Folder Component
const SidebarFolder = ({ 
    folder, 
    level = 0, 
    expandedFolders, 
    toggleFolder, 
    expandedRequests, 
    toggleRequest,
    activeRequest,
    loadRequest,
    duplicateRequest,
    handleDeleteRequest,
    handleDeleteFolder,
    handleImportCurl,
    setExportModal,
    setShareModal,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    dragOverId,
    searchTerm,
    collectionId,
    loadExample,
    deleteExample,
    openConfirm,
    showToast,
    setIsFolderModalOpen,
    onReorder,
    isFirst,
    isLast
}) => {
    const isExpanded = expandedFolders[folder.id] || searchTerm;

    return (
        <div key={folder.id}>
            <div
                onClick={() => toggleFolder(folder.id)}
                onDragOver={(e) => handleDragOver(e, `folder-${folder.id}`)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, collectionId, folder.id)}
                className={`group flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all ${dragOverId === `folder-${folder.id}` ? 'bg-yellow-500/20 border-yellow-500/50 border shadow-lg scale-[1.02]' : 'hover:bg-dark-800/40'
                    }`}
                style={{ marginLeft: level > 0 ? '4px' : '0' }}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-dark-400" /> : <ChevronRight className="w-3.5 h-3.5 text-dark-500" />}
                    <Folder className="w-3.5 h-3.5 text-yellow-500/70 shrink-0" />
                    <span className="text-xs font-medium text-dark-300 truncate">{folder.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {/* Order Controls */}
                    <div className="flex items-center bg-dark-700/50 rounded mr-1">
                        <button
                            disabled={isFirst}
                            onClick={(e) => { e.stopPropagation(); onReorder(folder, 'up'); }}
                            className={`p-0.5 hover:bg-dark-600 rounded ${isFirst ? 'text-dark-700' : 'text-dark-400 hover:text-primary-400'}`}
                            title="Di chuyển lên"
                        >
                            <ArrowUp className="w-2.5 h-2.5" />
                        </button>
                        <button
                            disabled={isLast}
                            onClick={(e) => { e.stopPropagation(); onReorder(folder, 'down'); }}
                            className={`p-0.5 hover:bg-dark-600 rounded ${isLast ? 'text-dark-700' : 'text-dark-400 hover:text-primary-400'}`}
                            title="Di chuyển xuống"
                        >
                            <ArrowDown className="w-2.5 h-2.5" />
                        </button>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExportModal({ isOpen: true, folder, requests: folder.requests || [] });
                        }}
                        className="p-1 hover:bg-dark-700 rounded text-dark-500 hover:text-primary-400 cursor-pointer"
                        title="Xuất tài liệu (Doc)"
                    >
                        <FileText className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShareModal({ isOpen: true, folder: folder });
                        }}
                        className="p-1 hover:bg-dark-700 rounded text-dark-500 hover:text-primary-400 cursor-pointer"
                        title="Chia sẻ Thư mục"
                    >
                        <Share2 className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => handleImportCurl(e, collectionId, folder.id)}
                        className="p-1 hover:bg-dark-700 rounded text-dark-500 hover:text-blue-500"
                        title="Import từ cURL"
                    >
                        <FileCode className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsFolderModalOpen(collectionId, folder.id);
                        }}
                        className="p-1 hover:bg-dark-700 rounded text-dark-500 hover:text-primary-400 cursor-pointer"
                        title="Thêm Thư mục con"
                    >
                        <FolderPlus className="w-3 h-3" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            loadRequest({ id: null, collection_id: collectionId, folder_id: folder.id, name: 'New Request', method: 'GET' });
                        }}
                        className="p-1 hover:bg-dark-700 rounded text-dark-500 hover:text-green-500"
                        title="Thêm Request"
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

            {isExpanded && (
                <div className="border-l border-dark-800/30 ml-3 pl-1">
                    {/* Sub-folders */}
                    {folder.subFolders?.map((sub, idx) => (
                        <SidebarFolder 
                            key={sub.id}
                            folder={sub}
                            level={level + 1}
                            expandedFolders={expandedFolders}
                            toggleFolder={toggleFolder}
                            expandedRequests={expandedRequests}
                            toggleRequest={toggleRequest}
                            activeRequest={activeRequest}
                            loadRequest={loadRequest}
                            duplicateRequest={duplicateRequest}
                            handleDeleteRequest={handleDeleteRequest}
                            handleDeleteFolder={handleDeleteFolder}
                            handleImportCurl={handleImportCurl}
                            setExportModal={setExportModal}
                            setShareModal={setShareModal}
                            handleDragStart={handleDragStart}
                            handleDragOver={handleDragOver}
                            handleDragLeave={handleDragLeave}
                            handleDrop={handleDrop}
                            dragOverId={dragOverId}
                            searchTerm={searchTerm}
                            collectionId={collectionId}
                            loadExample={loadExample}
                            deleteExample={deleteExample}
                            openConfirm={openConfirm}
                            showToast={showToast}
                            setIsFolderModalOpen={setIsFolderModalOpen}
                            onReorder={onReorder}
                            isFirst={idx === 0}
                            isLast={idx === folder.subFolders.length - 1}
                        />
                    ))}

                    {/* Requests in this folder */}
                    {folder.requests?.map((req, idx) => (
                        <SidebarRequest 
                            key={req.id}
                            req={req}
                            activeRequest={activeRequest}
                            loadRequest={loadRequest}
                            toggleRequest={toggleRequest}
                            expandedRequests={expandedRequests}
                            setExportModal={setExportModal}
                            duplicateRequest={duplicateRequest}
                            handleDeleteRequest={handleDeleteRequest}
                            handleDragStart={handleDragStart}
                            loadExample={loadExample}
                            deleteExample={deleteExample}
                            openConfirm={openConfirm}
                            showToast={showToast}
                            onReorder={onReorder}
                            isFirst={idx === 0}
                            isLast={idx === folder.requests.length - 1}
                        />
                    ))}
                    
                    {(!folder.requests?.length && !folder.subFolders?.length) && (
                        <div className="p-1.5 text-[10px] text-dark-600 italic ml-6">Thư mục trống</div>
                    )}
                </div>
            )}
        </div>
    );
};

// Request Component for Sidebar
const SidebarRequest = ({
    req,
    activeRequest,
    loadRequest,
    toggleRequest,
    expandedRequests,
    setExportModal,
    duplicateRequest,
    handleDeleteRequest,
    handleDragStart,
    loadExample,
    deleteExample,
    openConfirm,
    showToast,
    onReorder,
    isFirst,
    isLast
}) => {
    return (
        <div key={req.id}>
            <div
                draggable
                onDragStart={(e) => handleDragStart(e, req.id)}
                className={`group flex items-center gap-2 px-1.5 hover:bg-dark-800/50 rounded-lg cursor-pointer transition-all ${activeRequest?.id === req.id ? 'bg-primary-500/10 text-primary-400' : ''}`}
            >
                <div
                    onClick={(e) => toggleRequest(e, req.id)}
                    className={`p-1 hover:bg-dark-700 rounded transition-colors ${req.examples?.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    {expandedRequests[req.id] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </div>

                <div onClick={() => loadRequest(req)} className="flex items-center gap-1.5 flex-1 min-w-0 py-1.5">
                    <span className={`text-[9px] font-black w-7 shrink-0 ${req.method === 'GET' ? 'text-green-500' :
                            req.method === 'POST' ? 'text-blue-500' : 'text-yellow-500'
                        }`}>{req.method}</span>
                    <span className="text-xs truncate text-dark-300 flex-1">{req.name}</span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                    {/* Order Controls */}
                    <div className="flex items-center bg-dark-700/50 rounded mr-1">
                        <button
                            disabled={isFirst}
                            onClick={(e) => { e.stopPropagation(); onReorder(req, 'up'); }}
                            className={`p-0.5 hover:bg-dark-600 rounded ${isFirst ? 'text-dark-700' : 'text-dark-400 hover:text-primary-400'}`}
                            title="Di chuyển lên"
                        >
                            <ArrowUp className="w-2.5 h-2.5" />
                        </button>
                        <button
                            disabled={isLast}
                            onClick={(e) => { e.stopPropagation(); onReorder(req, 'down'); }}
                            className={`p-0.5 hover:bg-dark-600 rounded ${isLast ? 'text-dark-700' : 'text-dark-400 hover:text-primary-400'}`}
                            title="Di chuyển xuống"
                        >
                            <ArrowDown className="w-2.5 h-2.5" />
                        </button>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExportModal({ isOpen: true, folder: { name: req.name }, requests: [req] });
                        }}
                        className="p-1 hover:bg-dark-700 rounded text-dark-500 hover:text-primary-400 transition-all"
                        title="Xuất tài liệu API"
                    >
                        <FileText className="w-2.5 h-2.5" />
                    </button>
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

            {expandedRequests[req.id] && req.examples?.map(ex => (
                <div
                    key={ex.id}
                    onClick={(e) => {
                        e.stopPropagation();
                        loadExample(ex);
                    }}
                    className="flex items-center gap-2 py-1 px-3 ml-4 hover:bg-dark-800/40 rounded-md cursor-pointer group/ex border-l border-dark-800/50"
                >
                    <FileJson className="w-3 h-3 text-dark-600 group-hover/ex:text-primary-500/70" />
                    <span className="text-[11px] text-dark-500 truncate flex-1 group-hover/ex:text-dark-300">{ex.name}</span>
                    <div className="flex items-center gap-1.5">
                        {ex.response_status && (
                            <span className={`text-[9px] font-bold ${ex.response_status < 400 ? 'text-green-600/70' : 'text-red-600/70'}`}>
                                {ex.response_status}
                            </span>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openConfirm({
                                    title: 'Xóa Log',
                                    message: `Bạn có chắc muốn xóa bản log "${ex.name}"?`,
                                    onConfirm: async () => {
                                        await deleteExample(ex.id);
                                        showToast(`Đã xóa bản log "${ex.name}"`);
                                    },
                                    type: 'danger'
                                });
                            }}
                            className="opacity-0 group-hover/ex:opacity-100 p-1 hover:bg-red-500/10 rounded text-dark-600 hover:text-red-500 transition-all"
                        >
                            <Trash2 className="w-2.5 h-2.5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

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
    showToast,
    style
}) => {
    const navigate = useNavigate();
    const { 
      user, logout, collections, createFolder, deleteFolder, moveRequest, 
      deleteRequest, duplicateRequest, deleteCollection, loadExample, 
      deleteExample, exportCollection, importCollection, reorderRequests, reorderFolders
    } = useStore();
    const fileInputRef = React.useRef(null);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [expandedRequests, setExpandedRequests] = useState({});
    const [dragOverId, setDragOverId] = useState(null);
    const [exportModal, setExportModal] = useState({ isOpen: false, folder: null, requests: [] });
    const [shareModal, setShareModal] = useState({ isOpen: false, collection: null, folder: null });
    const [searchTerm, setSearchTerm] = useState('');

    // Recursive search logic
    const filteredCollections = useMemo(() => {
        if (!searchTerm.trim()) return collections;

        const term = searchTerm.toLowerCase();

        const filterFolders = (folders) => {
            return folders.map(f => {
                const matchingRequests = (f.requests || []).filter(req =>
                    req.name.toLowerCase().includes(term) ||
                    (req.url && req.url.toLowerCase().includes(term))
                );
                const subFolders = filterFolders(f.subFolders || []);
                
                return { ...f, requests: matchingRequests, subFolders };
            }).filter(f => 
                f.name.toLowerCase().includes(term) || 
                f.requests.length > 0 || 
                f.subFolders.length > 0
            );
        };

        return collections.map(col => {
            const folders = filterFolders(col.folders || []);
            const requests = (col.requests || []).filter(req =>
                req.name.toLowerCase().includes(term) ||
                (req.url && req.url.toLowerCase().includes(term))
            );

            return { ...col, folders, requests };
        }).filter(col =>
            col.name.toLowerCase().includes(term) ||
            col.folders.length > 0 ||
            col.requests.length > 0
        );
    }, [collections, searchTerm]);

    const toggleFolder = (id) => {
        setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleRequest = (e, id) => {
        e.stopPropagation();
        setExpandedRequests(prev => ({ ...prev, [id]: !prev[id] }));
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

    const handleReorder = async (item, direction) => {
        // logic to find siblings and update order
        const colId = item.collection_id;
        const folderId = item.folder_id;
        const col = collections.find(c => c.id === colId);
        if (!col) return;

        let items = [];
        const isRequest = !!item.method;

        if (isRequest) {
            if (folderId) {
                // Find folder recursively
                const findFolder = (folders) => {
                    for (const f of folders) {
                        if (f.id === folderId) return f;
                        const sub = findFolder(f.subFolders || []);
                        if (sub) return sub;
                    }
                    return null;
                };
                const folder = findFolder(col.folders || []);
                items = folder?.requests || [];
            } else {
                items = col.requests || [];
            }
        } else {
            // Folder reordering
            if (item.parent_id) {
                const findFolder = (folders) => {
                    for (const f of folders) {
                        if (f.id === item.parent_id) return f;
                        const sub = findFolder(f.subFolders || []);
                        if (sub) return sub;
                    }
                    return null;
                };
                const parent = findFolder(col.folders || []);
                items = parent?.subFolders || [];
            } else {
                items = col.folders || [];
            }
        }

        const index = items.findIndex(i => i.id === item.id);
        if (index === -1) return;

        const newItems = [...items];
        if (direction === 'up' && index > 0) {
            [newItems[index], newItems[index-1]] = [newItems[index-1], newItems[index]];
        } else if (direction === 'down' && index < newItems.length - 1) {
            [newItems[index], newItems[index+1]] = [newItems[index+1], newItems[index]];
        } else {
            return;
        }

        // Map to payload
        const payload = newItems.map((it, idx) => ({ id: it.id, order: idx }));
        
        if (isRequest) {
            await reorderRequests(payload);
        } else {
            await reorderFolders(payload);
        }
    };

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                await importCollection(jsonData);
            } catch (err) {
                showToast('File JSON không hợp lệ', 'danger');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset
    };

    return (
        <aside
            className="border-r border-dark-800 flex flex-col bg-dark-900/30 backdrop-blur-sm flex-shrink-0"
            style={style}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportFile} 
                className="hidden" 
                accept=".json"
            />
            <div className="p-4 border-b border-dark-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-900/20">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="font-bold text-lg tracking-tight text-dark-100">OmniTest</h1>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="p-1.5 hover:bg-dark-800 rounded-md text-dark-400 transition-colors cursor-pointer" 
                        title="Import Collection (.json)"
                    >
                        <Upload className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="p-1.5 hover:bg-dark-800 rounded-md text-dark-400 transition-colors cursor-pointer" title="Tạo Collection">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="px-3 pt-3">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-500 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search API name or endpoint..."
                        className="w-full bg-dark-800/50 border border-dark-800 rounded-xl py-2 pl-9 pr-8 text-[11px] text-dark-100 placeholder:text-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-dark-700 rounded-full text-dark-500 hover:text-dark-200 transition-all"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                        <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Collections</span>
                        {searchTerm && <span className="text-[9px] font-bold text-primary-500/60 uppercase">{filteredCollections.length} matches</span>}
                    </div>
                    <div className="space-y-1">
                        {filteredCollections.map((col) => (
                            <div key={col.id}>
                                <div
                                    onClick={() => toggleCollection(col.id)}
                                    onDragOver={(e) => handleDragOver(e, `col-${col.id}`)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, col.id)}
                                    className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${dragOverId === `col-${col.id}` ? 'bg-primary-500/20 border-primary-500/50 border shadow-lg scale-[1.02]' : 'hover:bg-dark-800/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {(expandedCollections[col.id] || searchTerm) ? <ChevronDown className="w-4 h-4 text-dark-50" /> : <ChevronRight className="w-4 h-4 text-dark-500" />}
                                        <Folder className="w-4 h-4 text-primary-400 shrink-0" />
                                        <span className="text-sm font-medium text-dark-100 truncate">{col.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                exportCollection(col.id);
                                            }}
                                            className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-primary-400"
                                            title="Export Collection (.json)"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShareModal({ isOpen: true, collection: col });
                                            }}
                                            className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-primary-400"
                                            title="Chia sẻ Collection"
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                        </button>
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

                                {(expandedCollections[col.id] || searchTerm) && (
                                    <div className="ml-4 space-y-0.5 border-l border-dark-800/50 mt-1 pl-1">
                                        {/* Recursive Folders */}
                                        {col.folders?.map((folder, idx) => (
                                            <SidebarFolder 
                                                key={folder.id}
                                                folder={folder}
                                                level={0}
                                                expandedFolders={expandedFolders}
                                                toggleFolder={toggleFolder}
                                                expandedRequests={expandedRequests}
                                                toggleRequest={toggleRequest}
                                                activeRequest={activeRequest}
                                                loadRequest={loadRequest}
                                                duplicateRequest={duplicateRequest}
                                                handleDeleteRequest={handleDeleteRequest}
                                                handleDeleteFolder={handleDeleteFolder}
                                                handleImportCurl={handleImportCurl}
                                                setExportModal={setExportModal}
                                                setShareModal={setShareModal}
                                                handleDragStart={handleDragStart}
                                                handleDragOver={handleDragOver}
                                                handleDragLeave={handleDragLeave}
                                                handleDrop={handleDrop}
                                                dragOverId={dragOverId}
                                                searchTerm={searchTerm}
                                                collectionId={col.id}
                                                loadExample={loadExample}
                                                deleteExample={deleteExample}
                                                openConfirm={openConfirm}
                                                showToast={showToast}
                                                setIsFolderModalOpen={setIsFolderModalOpen}
                                                onReorder={handleReorder}
                                                isFirst={idx === 0}
                                                isLast={idx === col.folders.length - 1}
                                            />
                                        ))}

                                        {/* Direct Requests */}
                                        {col.requests?.map((req, idx) => (
                                            <SidebarRequest 
                                                key={req.id}
                                                req={req}
                                                activeRequest={activeRequest}
                                                loadRequest={loadRequest}
                                                toggleRequest={toggleRequest}
                                                expandedRequests={expandedRequests}
                                                setExportModal={setExportModal}
                                                duplicateRequest={duplicateRequest}
                                                handleDeleteRequest={handleDeleteRequest}
                                                handleDragStart={handleDragStart}
                                                loadExample={loadExample}
                                                deleteExample={deleteExample}
                                                openConfirm={openConfirm}
                                                showToast={showToast}
                                                onReorder={handleReorder}
                                                isFirst={idx === 0}
                                                isLast={idx === col.requests.length - 1}
                                            />
                                        ))}

                                        {col.scenarios?.length > 0 && !searchTerm && (
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
                        {filteredCollections.length === 0 && (
                            <div className="text-center py-10 px-4">
                                <Search className="w-8 h-8 text-dark-700 mx-auto mb-3 opacity-20" />
                                <p className="text-dark-600 text-[11px] italic">
                                    {searchTerm ? `No results for "${searchTerm}"` : "No collections yet. Click + to add."}
                                </p>
                            </div>
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
            <ExportDocModal
                isOpen={exportModal.isOpen}
                onClose={() => setExportModal({ ...exportModal, isOpen: false })}
                folder={exportModal.folder || {}}
                requests={exportModal.requests}
            />

            <ShareModal
                isOpen={shareModal.isOpen}
                onClose={() => setShareModal({ ...shareModal, isOpen: false, folder: null, collection: null })}
                collection={shareModal.collection}
                folder={shareModal.folder}
            />
        </aside>
    );
};

export default Sidebar;
