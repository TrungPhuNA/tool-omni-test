import React, { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import Sidebar from './Sidebar';
import Toast from '../common/Toast';
import CollectionModal from '../features/collections/CollectionModal';
import FolderModal from '../features/folders/FolderModal';
import ImportCurlModal from '../features/folders/ImportCurlModal';
import EnvironmentModal from '../features/environments/EnvironmentModal';
import ConfirmModal from '../common/ConfirmModal';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        collections,
        fetchCollections,
        createCollection,
        environments,
        activeEnvironment,
        fetchEnvironments,
        saveEnvironment,
        deleteEnvironment,
        createFolder,
        activeRequest,
        setActiveRequest,
        activeScenario,
        setActiveScenario,
        deleteRequest,
        deleteFolder,
        addTab,
        toast: globalToast,
        showToast
    } = useStore();

    const [expandedCollections, setExpandedCollections] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newColName, setNewColName] = useState('');
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [targetColId, setTargetColId] = useState(null);
    const [targetParentId, setTargetParentId] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [targetImportColId, setTargetImportColId] = useState(null);
    const [targetImportFolderId, setTargetImportFolderId] = useState(null);
    const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
    const [editingEnv, setEditingEnv] = useState(null);
    const [confirmData, setConfirmData] = useState({ 
        isOpen: false, 
        title: '', 
        message: '', 
        onConfirm: () => {}, 
        type: 'danger' 
    });

    const targetParentName = React.useMemo(() => {
        if (!targetParentId) return null;
        for (const col of collections) {
            const findFolder = (folders) => {
                for (const f of folders) {
                    if (f.id === targetParentId) return f.name;
                    const sub = findFolder(f.subFolders || []);
                    if (sub) return sub;
                }
                return null;
            };
            const name = findFolder(col.folders || []);
            if (name) return name;
        }
        return null;
    }, [targetParentId, collections]);

    const openConfirm = (data) => {
        setConfirmData({ ...data, isOpen: true });
    };

    const [sidebarWidth, setSidebarWidth] = useState(380); // Độ rộng Sidebar rộng rãi theo yêu cầu
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);

    const startResizingSidebar = (e) => {
        setIsResizingSidebar(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizingSidebar) return;
            const newWidth = e.clientX;
            if (newWidth > 150 && newWidth < 600) {
                setSidebarWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizingSidebar(false);
        };

        if (isResizingSidebar) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingSidebar]);

    const handleImportCurl = (requestData) => {
        addTab({
            id: null,
            collection_id: targetImportColId,
            folder_id: targetImportFolderId,
            name: 'Imported Request',
            method: requestData.method,
            url: requestData.url,
            headers: requestData.headers,
            params: [],
            body: requestData.body,
            authConfig: { enabled: false, loginUrl: '', loginBody: '', tokenPath: 'data.token' },
            preScript: '',
            postScript: '',
            description: ''
        });
        navigate('/');
    };


    useEffect(() => {
        fetchCollections();
        fetchEnvironments();
    }, []);

    const toggleCollection = (id) => {
        setExpandedCollections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCreateCollection = async () => {
        if (newColName) {
            await createCollection(newColName);
            setNewColName('');
            setIsModalOpen(false);
            showToast('Đã tạo Collection mới!');
        }
    };

    const handleCreateFolder = async () => {
        if (newFolderName && targetColId) {
            await createFolder(targetColId, newFolderName, targetParentId);
            setNewFolderName('');
            setTargetParentId(null);
            setIsFolderModalOpen(false);
            showToast('Đã tạo thư mục mới!');
        }
    };

    const handleSaveEnv = async () => {
        if (editingEnv && editingEnv.name) {
            await saveEnvironment(editingEnv);
            setEditingEnv(null);
            showToast('Đã lưu môi trường!');
        }
    };

    const handleAddEnvVariable = () => {
        setEditingEnv(prev => ({
            ...prev,
            variables: { ...(prev.variables || {}), '': '' }
        }));
    };

    const handleUpdateEnvVariable = (oldKey, newKey, value) => {
        const newVars = { ...(editingEnv.variables || {}) };
        if (oldKey !== newKey) delete newVars[oldKey];
        newVars[newKey] = value;
        setEditingEnv(prev => ({ ...prev, variables: newVars }));
    };

    const handleRemoveEnvVariable = (key) => {
        const newVars = { ...(editingEnv.variables || {}) };
        delete newVars[key];
        setEditingEnv(prev => ({ ...prev, variables: newVars }));
    };

    const loadRequest = (req) => {
        const headers = typeof req.headers === 'string' ? JSON.parse(req.headers) : (req.headers || []);
        const params = typeof req.params === 'string' ? JSON.parse(req.params) : (req.params || []);
        const body = typeof req.body === 'object' ? JSON.stringify(req.body, null, 2) : (req.body || '');

        addTab({
            id: req.id,
            collection_id: req.collection_id,
            folder_id: req.folder_id,
            name: req.name,
            method: req.method,
            url: req.url,
            headers: Array.isArray(headers) ? headers : [],
            params: Array.isArray(params) ? params : [],
            body: body,
            authConfig: req.authConfig || req.auth_config || { enabled: false, loginUrl: '', loginBody: '', tokenPath: 'data.token' },
            preScript: req.preScript || req.pre_script || '',
            postScript: req.postScript || req.post_script || '',
            description: req.description || ''
        });
        navigate('/');
    };

    const loadScenario = (scenario) => {
        setActiveScenario(scenario);
        navigate(`/scenarios/${scenario.id}`);
    };

    // Determine viewMode from location
    const viewMode = location.pathname === '/' ? 'builder' : 
                     location.pathname.startsWith('/scenarios') ? 'scenario' :
                     location.pathname === '/history' ? 'history' :
                     location.pathname === '/performance' ? 'loadtest' : 'builder';

    return (
        <div className="flex h-screen bg-dark-950 overflow-hidden text-dark-100 selection:bg-primary-500/30">
            <Toast toast={globalToast.visible ? globalToast : null} />

            <Sidebar
                expandedCollections={expandedCollections}
                toggleCollection={toggleCollection}
                loadRequest={loadRequest}
                loadScenario={loadScenario}
                activeRequest={activeRequest}
                activeScenario={activeScenario}
                viewMode={viewMode}
                setIsModalOpen={setIsModalOpen}
                setIsFolderModalOpen={(colId, parentId = null) => {
                    setTargetColId(colId);
                    setTargetParentId(parentId);
                    setIsFolderModalOpen(true);
                }}
                setIsImportModalOpen={(colId, folderId = null) => {
                    setTargetImportColId(colId);
                    setTargetImportFolderId(folderId);
                    setIsImportModalOpen(true);
                }}
                setIsEnvModalOpen={setIsEnvModalOpen}
                openConfirm={openConfirm}
                showToast={showToast}
                style={{ width: `${sidebarWidth}px` }}
            />

            <div 
                className={`w-1 hover:w-1.5 transition-all cursor-col-resize bg-dark-800 hover:bg-primary-500/50 flex-shrink-0 relative z-50 ${isResizingSidebar ? 'w-1.5 bg-primary-500/50' : ''}`}
                onMouseDown={startResizingSidebar}
            >
                <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize" />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <Outlet context={{ showToast, setIsEnvModalOpen }} />
            </div>

            <CollectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                newColName={newColName}
                setNewColName={setNewColName}
                handleCreateCollection={handleCreateCollection}
            />

            <FolderModal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
                folderName={newFolderName}
                setFolderName={setNewFolderName}
                handleCreateFolder={handleCreateFolder}
                parentName={targetParentName}
            />

            <ImportCurlModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportCurl}
            />

            <EnvironmentModal
                isOpen={isEnvModalOpen}
                onClose={() => { setIsEnvModalOpen(false); setEditingEnv(null); }}
                environments={environments}
                editingEnv={editingEnv}
                setEditingEnv={setEditingEnv}
                handleSaveEnv={handleSaveEnv}
                deleteEnvironment={deleteEnvironment}
                handleAddEnvVariable={handleAddEnvVariable}
                handleUpdateEnvVariable={handleUpdateEnvVariable}
                handleRemoveEnvVariable={handleRemoveEnvVariable}
            />

            <ConfirmModal
                isOpen={confirmData.isOpen}
                onClose={() => setConfirmData(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmData.onConfirm}
                title={confirmData.title}
                message={confirmData.message}
                type={confirmData.type}
            />
        </div>
    );
};

export default MainLayout;
